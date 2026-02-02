import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'loq',
  description: 'Log Query (loq) - Cross-platform SQL-based log analysis tool. A modern replacement for Microsoft Log Parser 2.2.',
  base: '/loq-releases/',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#3178c6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'loq - Log Query Documentation' }],
    ['meta', { property: 'og:site_name', content: 'loq' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://loq.dev/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  sitemap: {
    hostname: 'https://loq.dev'
  },

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started/introduction' },
      { text: 'SQL Reference', link: '/sql/' },
      { text: 'Functions', link: '/functions/' },
      {
        text: 'Formats',
        items: [
          { text: 'Input Formats', link: '/input-formats/' },
          { text: 'Output Formats', link: '/output-formats/' }
        ]
      },
      { text: 'Examples', link: '/examples/' },
      { text: 'CLI', link: '/cli/' },
      { text: 'API', link: '/api/' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/introduction' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
            { text: 'Comparison to MS Log Parser', link: '/getting-started/comparison' },
            { text: 'Error Reference', link: '/errors' }
          ]
        }
      ],

      '/sql/': [
        {
          text: 'SQL Reference',
          items: [
            { text: 'Overview', link: '/sql/' },
            { text: 'SELECT, WHERE, LIMIT', link: '/sql/basics' },
            { text: 'GROUP BY, HAVING, ORDER BY', link: '/sql/aggregation' },
            { text: 'JOINs', link: '/sql/joins' },
            { text: 'UNION / UNION ALL', link: '/sql/union' },
            { text: 'Subqueries', link: '/sql/subqueries' },
            { text: 'CASE WHEN', link: '/sql/case-when' },
            { text: 'Window Functions', link: '/sql/window-functions' }
          ]
        }
      ],

      '/functions/': [
        {
          text: 'Functions',
          items: [
            { text: 'Overview', link: '/functions/' },
            { text: 'String Functions', link: '/functions/string' },
            { text: 'Math Functions', link: '/functions/math' },
            { text: 'Date/Time Functions', link: '/functions/datetime' },
            { text: 'Conditional Functions', link: '/functions/conditional' },
            { text: 'Aggregate Functions', link: '/functions/aggregate' }
          ]
        }
      ],

      '/input-formats/': [
        {
          text: 'Input Formats',
          items: [
            { text: 'Overview', link: '/input-formats/' },
            { text: 'CSV / TSV', link: '/input-formats/csv' },
            { text: 'JSON / NDJSON', link: '/input-formats/json' },
            { text: 'XML', link: '/input-formats/xml' },
            { text: 'TEXTLINE / TEXT', link: '/input-formats/textline' },
            { text: 'TEXTWORD / WORD', link: '/input-formats/textword' },
            { text: 'FIXEDWIDTH', link: '/input-formats/fixedwidth' },
            { text: 'W3C / IIS Logs', link: '/input-formats/w3c' },
            { text: 'NCSA / Apache', link: '/input-formats/ncsa' },
            { text: 'Syslog', link: '/input-formats/syslog' },
            { text: 'EVTX (Windows Events)', link: '/input-formats/evtx' },
            { text: 'REG / REGISTRY', link: '/input-formats/registry' },
            { text: 'PCAP / NETMON', link: '/input-formats/pcap' },
            { text: 'Filesystem', link: '/input-formats/filesystem' },
            { text: 'S3', link: '/input-formats/s3' },
            { text: 'Parquet', link: '/input-formats/parquet' }
          ]
        }
      ],

      '/output-formats/': [
        {
          text: 'Output Formats',
          items: [
            { text: 'Overview', link: '/output-formats/' },
            { text: 'CSV / TSV', link: '/output-formats/csv' },
            { text: 'JSON', link: '/output-formats/json' },
            { text: 'XML', link: '/output-formats/xml' },
            { text: 'W3C', link: '/output-formats/w3c' },
            { text: 'DATAGRID / TABLE', link: '/output-formats/datagrid' },
            { text: 'SQLite', link: '/output-formats/sqlite' },
            { text: 'PostgreSQL / MySQL', link: '/output-formats/database' },
            { text: 'Chart (PNG/SVG)', link: '/output-formats/chart' },
            { text: 'CloudWatch', link: '/output-formats/cloudwatch' },
            { text: 'TEMPLATE / TPL', link: '/output-formats/template' },
            { text: 'NAT / NATIVE', link: '/output-formats/native' },
            { text: 'NULL', link: '/output-formats/null' }
          ]
        }
      ],

      '/examples/': [
        {
          text: 'Examples & Cookbook',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Web Server Logs', link: '/examples/#web-server-log-analysis' },
            { text: 'Security & Windows Events', link: '/examples/#security-windows-events' },
            { text: 'Application Logs', link: '/examples/#application-log-analysis' },
            { text: 'Data Transformation', link: '/examples/#data-transformation' },
            { text: 'System Administration', link: '/examples/#system-administration' },
            { text: 'Advanced Patterns', link: '/examples/#advanced-patterns' }
          ]
        }
      ],

      '/cli/': [
        {
          text: 'CLI Reference',
          items: [
            { text: 'Usage', link: '/cli/' },
            { text: 'Options', link: '/cli/options' },
            { text: 'Character Encoding', link: '/cli/codepage' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'REST API',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Endpoints', link: '/api/endpoints' }
          ]
        }
      ],

      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Docker', link: '/deployment/docker' },
            { text: 'Kubernetes', link: '/deployment/kubernetes' }
          ]
        }
      ],

      '/performance/': [
        {
          text: 'Performance',
          items: [
            { text: 'Optimization Guide', link: '/performance/' },
            { text: 'Benchmarking', link: '/performance/benchmarking' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chaynes81-ux/loq' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/chaynes81-ux/loq/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'All rights reserved.'
    }
  }
})
