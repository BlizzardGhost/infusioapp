import type { CollectionConfig } from 'payload';
import { aiEnrichmentHook } from '../hooks/aiEnrichmentHook';

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Article',
    plural: 'Articles',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'publishedAt'],
    description: 'Managed articles and editorial stories with automatic generative AI SEO synthesis.',
  },
  // Asynchronous Hook Pipeline
  hooks: {
    beforeChange: [
      async (args) => {
        // Enforce AI SEO metadata and alt text generation before saving
        return await aiEnrichmentHook(args as any);
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publish Date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Summary / Excerpt',
    },
    {
      name: 'content',
      type: 'textarea', // Supports markdown or rich text
      required: true,
      label: 'Article Body',
    },
    {
      name: 'featuredImageUrl',
      type: 'text',
      label: 'Featured Image URL',
      admin: {
        description: 'URL to primary hero asset (e.g. /assets/brand-logo.png or remote CDN)',
      },
    },
    // AI-Managed SEO & Accessibility Section
    {
      type: 'collapsible',
      label: 'Search Engine Optimization & Accessibility (Auto-AI Enriched)',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'SEO Meta Title',
          admin: {
            description:
              'Leave empty to auto-generate using generative AI on save via PROCESS_AI_SECRET_KEY.',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'SEO Meta Description',
          admin: {
            description:
              'Leave empty to auto-synthesize from content via external AI endpoint.',
          },
        },
        {
          name: 'imageAltText',
          type: 'text',
          label: 'Image Accessibility Alt Text',
          admin: {
            description:
              'Leave empty to automatically generate compliant image alt description.',
          },
        },
      ],
    },
  ],
};

export default Articles;
