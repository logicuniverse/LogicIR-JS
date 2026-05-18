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
          { text: 'Handoff', link: '/dev/handoff' },
          { text: 'Process', link: '/dev/process' },
          { text: 'Roadmap', link: '/dev/roadmap' },
          { text: 'Schema Principles', link: '/dev/schema-principles' },
          { text: 'Operational Theory', link: '/dev/operational-theory' },
          { text: 'Architecture', link: '/dev/logicir-architecture' },
          { text: 'Feature Catalog', link: '/dev/feature-catalog' },
          { text: 'Long-Term Vision', link: '/dev/long-term-vision' },
          { text: 'Shared Rules', link: '/dev/shared-rules' },
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
