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
