# C/FFI Reference for LLMs

Quick reference for integrating loq via C Foreign Function Interface (FFI). This document is optimized for LLM code generation.

## Library Files

| Platform | Library File | Notes |
|----------|--------------|-------|
| Linux | `libloq.so` | ELF shared object |
| macOS | `libloq.dylib` | Mach-O dynamic library |
| Windows | `loq.dll` | PE dynamic-link library |

Build: `cargo build --release -p loq-ffi`
Location: `target/release/`

## Type Constants

```c
#define INTEGER_TYPE 1      // int64_t
#define REAL_TYPE 2         // double
#define STRING_TYPE 3       // UTF-8 char*
#define TIMESTAMP_TYPE 4    // ISO 8601 string
#define NULL_TYPE 5         // SQL NULL
```

Booleans are `INTEGER_TYPE` (0 or 1).

## Error Codes

```c
#define SUCCESS 0
#define NULL_POINTER -1
#define INVALID_HANDLE -2
#define INVALID_UTF8 -3
#define PARSE_ERROR -4
#define EXECUTION_ERROR -5
#define IO_ERROR -6
#define END_OF_DATA -7
#define SERIALIZATION_ERROR -8
#define INVALID_ARGUMENT -9
#define UNKNOWN -100
```

## Core Functions

### Version and Error Handling

```c
// Get library version (static string, do not free)
const char* loq_version(void);

// Free strings returned by loq functions
void loq_free_string(char* str);

// Get last error message (returns allocated string, must free)
char* loq_get_last_error(void);

// Get error message for error code (static string, do not free)
const char* loq_error_code_message(int code);
```

## Classic API (Cursor-Based)

### LogQuery Functions

```c
// Create LogQuery instance
uint64_t loq_query_create(void);

// Free LogQuery instance
bool loq_query_free(uint64_t handle);

// Set default input format ("CSV", "W3C", "JSON", etc.)
int loq_query_set_input_format(uint64_t handle, const char* format);

// Execute SQL query, returns RecordSet handle (0 = INVALID_HANDLE on error)
uint64_t loq_query_execute(uint64_t handle, const char* sql);
```

### RecordSet Functions

```c
// Free RecordSet instance
bool loq_recordset_free(uint64_t handle);

// Check if cursor is at end
bool loq_recordset_at_end(uint64_t handle);

// Move cursor to next row
int loq_recordset_move_next(uint64_t handle);

// Get column count
int loq_recordset_column_count(uint64_t handle);

// Get total row count
int loq_recordset_row_count(uint64_t handle);

// Get column name by index (returns allocated string, must free)
char* loq_recordset_column_name(uint64_t handle, int index);

// Get column type by index (returns type constant 1-5)
int loq_recordset_column_type(uint64_t handle, int index);
```

### Value Access Functions

```c
// Get string value by column name (returns allocated string, must free)
char* loq_recordset_get_string(uint64_t handle, const char* column_name);

// Get string value by column index (returns allocated string, must free)
char* loq_recordset_get_string_by_index(uint64_t handle, int index);

// Get integer value by column name
int64_t loq_recordset_get_int(uint64_t handle, const char* column_name, int* success);

// Get float value by column name
double loq_recordset_get_float(uint64_t handle, const char* column_name, int* success);

// Check if value is NULL by column name
bool loq_recordset_is_null(uint64_t handle, const char* column_name);

// Check if value is NULL by column index
bool loq_recordset_is_null_by_index(uint64_t handle, int index);

// Convert current row to delimited string (returns allocated string, must free)
char* loq_recordset_to_native_string(uint64_t handle, const char* delimiter);
```

## Modern API (Bulk JSON)

```c
// Execute SQL query, return results as JSON (returns allocated string, must free)
char* loq_execute_json(const char* sql);

// Execute SQL query with options (returns allocated string, must free)
char* loq_execute_json_ex(const char* sql, const char* input_format, int max_rows);

// Get schema only without executing full query (returns allocated string, must free)
char* loq_get_schema_json(const char* sql);

// Execute query and return row count only (returns -1 on error)
int64_t loq_execute_count(const char* sql);
```

### JSON Response Format

`loq_execute_json()` returns:
```json
{
  "columns": [
    {"name": "col1", "column_type": 3},
    {"name": "col2", "column_type": 1}
  ],
  "rows": [
    {"values": ["value1", 42]},
    {"values": ["value2", 43]}
  ],
  "row_count": 2
}
```

`loq_get_schema_json()` returns:
```json
{
  "columns": [
    {"name": "col1", "column_type": 3},
    {"name": "col2", "column_type": 1}
  ]
}
```

## Memory Management Rules

1. **Strings returned by loq** → Must free with `loq_free_string()`
   - Exception: `loq_version()` and `loq_error_code_message()` return static strings
2. **Handles** → Must free with `loq_query_free()` or `loq_recordset_free()`
3. **Strings passed to loq** → Caller retains ownership, loq does not free
4. **Error messages** → Always free with `loq_free_string()`

## Complete Examples

### Python (ctypes)

```python
from ctypes import *
import json

# Load library
lib = CDLL("libloq.so")  # or "libloq.dylib" (macOS), "loq.dll" (Windows)

# Define function signatures
lib.loq_version.restype = c_char_p
lib.loq_execute_json.argtypes = [c_char_p]
lib.loq_execute_json.restype = c_void_p
lib.loq_free_string.argtypes = [c_void_p]
lib.loq_get_last_error.restype = c_void_p

# Modern API example
def execute_query(sql):
    result_ptr = lib.loq_execute_json(sql.encode('utf-8'))
    
    if not result_ptr:
        error_ptr = lib.loq_get_last_error()
        if error_ptr:
            error_msg = cast(error_ptr, c_char_p).value.decode('utf-8')
            lib.loq_free_string(error_ptr)
            raise Exception(f"Query failed: {error_msg}")
        raise Exception("Query failed with unknown error")
    
    # Convert to Python string
    result_str = cast(result_ptr, c_char_p).value.decode('utf-8')
    lib.loq_free_string(result_ptr)
    
    # Parse JSON
    return json.loads(result_str)

# Usage
version = lib.loq_version().decode('utf-8')
print(f"loq version: {version}")

data = execute_query("SELECT name, age FROM users.csv WHERE age > 30")
print(f"Found {data['row_count']} rows")
for row in data['rows']:
    print(f"Name: {row['values'][0]}, Age: {row['values'][1]}")
```

Classic API example:
```python
# Define Classic API signatures
lib.loq_query_create.restype = c_uint64
lib.loq_query_free.argtypes = [c_uint64]
lib.loq_query_execute.argtypes = [c_uint64, c_char_p]
lib.loq_query_execute.restype = c_uint64
lib.loq_recordset_free.argtypes = [c_uint64]
lib.loq_recordset_at_end.argtypes = [c_uint64]
lib.loq_recordset_at_end.restype = c_bool
lib.loq_recordset_move_next.argtypes = [c_uint64]
lib.loq_recordset_get_string.argtypes = [c_uint64, c_char_p]
lib.loq_recordset_get_string.restype = c_void_p

# Create query
query = lib.loq_query_create()
if query == 0:
    raise Exception("Failed to create query")

try:
    # Execute
    rs = lib.loq_query_execute(query, b"SELECT * FROM logs.csv LIMIT 10")
    if rs == 0:
        error_ptr = lib.loq_get_last_error()
        error_msg = cast(error_ptr, c_char_p).value.decode('utf-8')
        lib.loq_free_string(error_ptr)
        raise Exception(f"Query failed: {error_msg}")
    
    # Iterate rows
    while not lib.loq_recordset_at_end(rs):
        name_ptr = lib.loq_recordset_get_string(rs, b"name")
        if name_ptr:
            name = cast(name_ptr, c_char_p).value.decode('utf-8')
            print(f"Name: {name}")
            lib.loq_free_string(name_ptr)
        
        lib.loq_recordset_move_next(rs)
    
    # Cleanup
    lib.loq_recordset_free(rs)
finally:
    lib.loq_query_free(query)
```

### Go (cgo)

```go
package main

/*
#cgo LDFLAGS: -lloq
#include <stdlib.h>
#include <stdint.h>

extern const char* loq_version(void);
extern char* loq_execute_json(const char* sql);
extern void loq_free_string(char* str);
extern char* loq_get_last_error(void);
*/
import "C"
import (
    "encoding/json"
    "fmt"
    "unsafe"
)

type QueryResult struct {
    Columns  []ColumnInfo  `json:"columns"`
    Rows     []Row         `json:"rows"`
    RowCount int           `json:"row_count"`
}

type ColumnInfo struct {
    Name       string `json:"name"`
    ColumnType int    `json:"column_type"`
}

type Row struct {
    Values []interface{} `json:"values"`
}

func executeQuery(sql string) (*QueryResult, error) {
    sqlCStr := C.CString(sql)
    defer C.free(unsafe.Pointer(sqlCStr))

    resultPtr := C.loq_execute_json(sqlCStr)
    if resultPtr == nil {
        errorPtr := C.loq_get_last_error()
        if errorPtr != nil {
            errorMsg := C.GoString(errorPtr)
            C.loq_free_string(errorPtr)
            return nil, fmt.Errorf("query failed: %s", errorMsg)
        }
        return nil, fmt.Errorf("query failed with unknown error")
    }
    defer C.loq_free_string(resultPtr)

    jsonStr := C.GoString(resultPtr)

    var result QueryResult
    if err := json.Unmarshal([]byte(jsonStr), &result); err != nil {
        return nil, fmt.Errorf("JSON parse error: %v", err)
    }

    return &result, nil
}

func main() {
    // Get version
    version := C.GoString(C.loq_version())
    fmt.Printf("loq version: %s\n", version)

    // Execute query
    result, err := executeQuery("SELECT name, age FROM users.csv WHERE age > 30")
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Found %d rows\n", result.RowCount)
    for _, row := range result.Rows {
        fmt.Printf("Row: %v\n", row.Values)
    }
}
```

Classic API example:
```go
/*
#include <stdint.h>
extern uint64_t loq_query_create(void);
extern bool loq_query_free(uint64_t handle);
extern uint64_t loq_query_execute(uint64_t handle, const char* sql);
extern bool loq_recordset_free(uint64_t handle);
extern bool loq_recordset_at_end(uint64_t handle);
extern int loq_recordset_move_next(uint64_t handle);
extern char* loq_recordset_get_string(uint64_t handle, const char* column_name);
*/
import "C"

func executeClassicQuery(sql string) error {
    query := C.loq_query_create()
    if query == 0 {
        return fmt.Errorf("failed to create query")
    }
    defer C.loq_query_free(query)

    sqlCStr := C.CString(sql)
    defer C.free(unsafe.Pointer(sqlCStr))

    rs := C.loq_query_execute(query, sqlCStr)
    if rs == 0 {
        errorPtr := C.loq_get_last_error()
        if errorPtr != nil {
            errorMsg := C.GoString(errorPtr)
            C.loq_free_string(errorPtr)
            return fmt.Errorf("query failed: %s", errorMsg)
        }
        return fmt.Errorf("query failed")
    }
    defer C.loq_recordset_free(rs)

    nameCStr := C.CString("name")
    defer C.free(unsafe.Pointer(nameCStr))

    for !bool(C.loq_recordset_at_end(rs)) {
        namePtr := C.loq_recordset_get_string(rs, nameCStr)
        if namePtr != nil {
            name := C.GoString(namePtr)
            fmt.Printf("Name: %s\n", name)
            C.loq_free_string(namePtr)
        }
        C.loq_recordset_move_next(rs)
    }

    return nil
}
```

### Ruby (FFI gem)

```ruby
require 'ffi'
require 'json'

module Loq
  extend FFI::Library
  
  # Load library
  ffi_lib 'loq'  # or 'libloq' on some systems
  
  # Core functions
  attach_function :loq_version, [], :string
  attach_function :loq_free_string, [:pointer], :void
  attach_function :loq_get_last_error, [], :pointer
  
  # Modern API
  attach_function :loq_execute_json, [:string], :pointer
  attach_function :loq_execute_json_ex, [:string, :string, :int], :pointer
  attach_function :loq_get_schema_json, [:string], :pointer
  attach_function :loq_execute_count, [:string], :int64
  
  # Helper to convert and free strings
  def self.get_string(ptr)
    return nil if ptr.null?
    str = ptr.read_string
    loq_free_string(ptr)
    str
  end
  
  def self.execute_query(sql)
    result_ptr = loq_execute_json(sql)
    
    if result_ptr.null?
      error_ptr = loq_get_last_error
      unless error_ptr.null?
        error_msg = get_string(error_ptr)
        raise "Query failed: #{error_msg}"
      end
      raise "Query failed with unknown error"
    end
    
    json_str = get_string(result_ptr)
    JSON.parse(json_str)
  end
end

# Usage
puts "loq version: #{Loq.loq_version}"

data = Loq.execute_query("SELECT name, age FROM users.csv WHERE age > 30")
puts "Found #{data['row_count']} rows"
data['rows'].each do |row|
  values = row['values']
  puts "Name: #{values[0]}, Age: #{values[1]}"
end
```

Classic API example:
```ruby
module Loq
  # Classic API functions
  attach_function :loq_query_create, [], :uint64
  attach_function :loq_query_free, [:uint64], :bool
  attach_function :loq_query_execute, [:uint64, :string], :uint64
  attach_function :loq_recordset_free, [:uint64], :bool
  attach_function :loq_recordset_at_end, [:uint64], :bool
  attach_function :loq_recordset_move_next, [:uint64], :int
  attach_function :loq_recordset_get_string, [:uint64, :string], :pointer
  
  def self.execute_classic_query(sql)
    query = loq_query_create
    raise "Failed to create query" if query == 0
    
    begin
      rs = loq_query_execute(query, sql)
      if rs == 0
        error_ptr = loq_get_last_error
        error_msg = get_string(error_ptr) unless error_ptr.null?
        raise "Query failed: #{error_msg}"
      end
      
      until loq_recordset_at_end(rs)
        name_ptr = loq_recordset_get_string(rs, "name")
        unless name_ptr.null?
          name = get_string(name_ptr)
          puts "Name: #{name}"
        end
        
        loq_recordset_move_next(rs)
      end
      
      loq_recordset_free(rs)
    ensure
      loq_query_free(query)
    end
  end
end

# Usage
Loq.execute_classic_query("SELECT * FROM logs.csv LIMIT 10")
```

## API Selection Guide

**Use Modern API when:**
- Working with modern languages (Python 3, Go, modern Ruby)
- Results fit in memory
- Performance is critical
- Native JSON support available

**Use Classic API when:**
- Migrating from MS Log Parser
- Processing very large result sets
- Need row-by-row streaming
- Building interactive applications

## Thread Safety

- Each handle must be used by only one thread at a time
- Create separate handles for each thread
- Error messages are thread-local
- Safe pattern: Create handle → use in one thread → free handle

## Common Patterns

### Error Handling Pattern
```c
char* result = loq_execute_json("SELECT * FROM data.csv");
if (!result) {
    char* error = loq_get_last_error();
    fprintf(stderr, "Error: %s\n", error);
    loq_free_string(error);
    return 1;
}
// Use result...
loq_free_string(result);
```

### Classic API Iteration Pattern
```c
uint64_t query = loq_query_create();
uint64_t rs = loq_query_execute(query, "SELECT * FROM data.csv");

while (!loq_recordset_at_end(rs)) {
    char* value = loq_recordset_get_string(rs, "column_name");
    // Use value...
    loq_free_string(value);
    loq_recordset_move_next(rs);
}

loq_recordset_free(rs);
loq_query_free(query);
```

### Modern API JSON Pattern
```c
char* json = loq_execute_json("SELECT * FROM data.csv");
// Parse JSON with your library...
loq_free_string(json);
```

## Build Integration

### CMake
```cmake
find_library(LOQ_LIBRARY loq PATHS /usr/local/lib)
target_link_libraries(myapp ${LOQ_LIBRARY})
```

### pkg-config
```bash
gcc myapp.c $(pkg-config --cflags --libs loq) -o myapp
```

### Direct linking
```bash
gcc myapp.c -lloq -o myapp
clang myapp.c -lloq -o myapp
```
