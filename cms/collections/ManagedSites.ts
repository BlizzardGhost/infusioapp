import type { CollectionConfig } from 'payload';

export const ManagedSites: CollectionConfig = {
  slug: 'managed-sites',
  labels: {
    singular: 'Managed Site / Repo',
    plural: 'Managed Sites & Apps',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'repo', 'branch', 'framework', 'status'],
    description: 'Centralized GitHub repositories managed under the Infusio CMS and Antigravity Agent.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Site / App Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Identifier Slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'repo',
      type: 'text',
      required: true,
      label: 'GitHub Repository URL',
    },
    {
      name: 'branch',
      type: 'text',
      defaultValue: 'main',
      label: 'Target Branch',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'framework',
      type: 'select',
      defaultValue: 'astro',
      options: [
        { label: 'Astro SSR / Vercel', value: 'astro' },
        { label: 'Next.js App Router', value: 'nextjs' },
        { label: 'Static / HTML', value: 'static' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'connected',
      options: [
        { label: 'Connected & Synced', value: 'connected' },
        { label: 'Sync Pending', value: 'pending' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Project Summary & Purpose',
    },
    {
      name: 'dataPath',
      type: 'text',
      defaultValue: 'src/data/',
      label: 'Content Data Directory in Repo',
      admin: {
        description: 'Target location for code-first JSON/Markdown schemas in the repository.',
      },
    },
    {
      name: 'liveUrl',
      type: 'text',
      label: 'Production Live URL',
    },
  ],
};

export default ManagedSites;
