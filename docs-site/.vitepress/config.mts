import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'LogicIR Docs',
  description: 'Static browsing projection for LogicIR documentation',
  srcDir: '.generated',
  outDir: '.vitepress/dist',
  cacheDir: '.vitepress/cache',
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/' },
      { text: 'Schema', link: '/schema/' },
      { text: 'Dev', link: '/dev/' },
      { text: 'AI Index', link: '/ai/tasks/material-index' },
      { text: 'All Docs', link: '/all-documents' },
    ],
    sidebar: [
      {
        text: 'Reader Docs',
        items: [
          { text: 'Docs Index', link: '/docs/' },
          { text: 'Essay', link: '/docs/essay' },
          { text: 'Reference', link: '/docs/reference/' },
          { text: 'Schema Surfaces', link: '/docs/reference/schema-surfaces' },
          {
            text: 'Core Software Interpreter',
            link: '/docs/reference/core-software-interpreter',
          },
          { text: 'Type System', link: '/docs/reference/type-system' },
        ],
      },
      {
        text: 'Schema',
        items: [
          { text: 'Schema Index', link: '/schema/' },
          { text: 'Core v0 Draft', link: '/schema/core/v0-draft/' },
          { text: 'Architecture', link: '/schema/architecture/' },
          { text: 'Architecture v0 Draft', link: '/schema/architecture/v0-draft/' },
          { text: 'Features', link: '/schema/features/' },
          { text: 'Type System Feature', link: '/schema/features/type-system/' },
          {
            text: 'Type System Feature v0 Draft',
            link: '/schema/features/type-system/v0-draft/',
          },
          { text: 'Profiles', link: '/schema/profiles/' },
          { text: 'Projection', link: '/schema/projection/' },
          { text: 'Extensions', link: '/schema/extensions/' },
          { text: 'Legacy Migration', link: '/schema/migrations/legacy-tsjs-v1/' },
        ],
      },
      {
        text: 'Development',
        items: [
          { text: 'Dev Index', link: '/dev/' },
          { text: 'Getting Started', link: '/dev/getting-started/' },
          { text: 'Handoff', link: '/dev/getting-started/handoff' },
          { text: 'Workflow', link: '/dev/workflow/' },
          { text: 'Process', link: '/dev/workflow/process' },
          { text: 'Shared Rules', link: '/dev/workflow/shared-rules' },
          { text: 'Theory', link: '/dev/theory/' },
          { text: 'Schema Principles', link: '/dev/theory/schema-principles' },
          { text: 'Operational Theory', link: '/dev/theory/operational-theory' },
          { text: 'Architecture', link: '/dev/theory/logicir-architecture' },
          { text: 'Planning', link: '/dev/planning/' },
          { text: 'Roadmap', link: '/dev/planning/roadmap' },
          { text: 'Feature Catalog', link: '/dev/planning/feature-catalog' },
          { text: 'Long-Term Vision', link: '/dev/planning/long-term-vision' },
          { text: 'Changes', link: '/dev/changes/' },
        ],
      },
      {
        text: 'AI Materials',
        items: [
          { text: 'AI Workspace', link: '/ai/' },
          { text: 'AI Tasks', link: '/ai/tasks/' },
          { text: 'Task Material Index', link: '/ai/tasks/material-index' },
        ],
      },
      {
        text: 'All',
        items: [{ text: 'All Projected Documents', link: '/all-documents' }],
      },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
    },
  },
});
