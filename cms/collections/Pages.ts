import type { CollectionConfig } from 'payload';
import { aiEnrichmentHook } from '../hooks/aiEnrichmentHook';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Dynamic frontend pages rendered server-side by Astro SSR.',
  },
  hooks: {
    beforeChange: [
      async (args) => {
        return await aiEnrichmentHook(args as any);
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Page Route Slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Page Content',
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO Meta Title',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO Meta Description',
    },
    {
      name: 'imageAltText',
      type: 'text',
      label: 'Social Share Image Alt Text',
    },
  ],
};

export default Pages;
