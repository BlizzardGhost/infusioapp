import type { CollectionConfig } from 'payload';
import { aiEnrichmentHook } from '../hooks/aiEnrichmentHook';

export interface HeroWallData {
  heroName: string;
  heroTitle: string;
  heroLevel: number;
  heroProtocol: string;
  heroCategory: string;
  abstract: string;
  activeBadges: Array<{ badge: string }>;
  pendingBadges: Array<{ badge: string }>;
  opsGuardrails: Array<{ rule: string }>;
  syncStatus?: 'synced' | 'pending';
}

export const HeroWall: CollectionConfig = {
  slug: 'hero-wall',
  labels: {
    singular: 'Hero Wall Profile',
    plural: 'Hero Wall Profiles',
  },
  admin: {
    useAsTitle: 'heroName',
    defaultColumns: ['heroName', 'heroTitle', 'heroLevel', 'heroProtocol', 'syncStatus'],
    description: 'Code-first profile schema synchronized with https://github.com/BlizzardGhost/hero-wall-mvp (src/data/hero.json & hero.agent.json).',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Run AI hook if abstract is blank
        if (!data.abstract || data.abstract.trim() === '') {
          data.abstract = `From siege to kairosis: clarity, serenity, and alignment with universal purpose for ${data.heroName || 'Boris'} (${data.heroTitle || 'LATAM AI Sherpa'}). The Hero Wall is stage, compass, and cockpit — the flame carried into higher ground.`;
        }
        data.syncStatus = 'synced';
        return data;
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'heroName',
          type: 'text',
          required: true,
          defaultValue: 'Boris',
          label: 'Hero Name',
          admin: { width: '50%' },
        },
        {
          name: 'heroTitle',
          type: 'text',
          required: true,
          defaultValue: 'LATAM AI Sherpa',
          label: 'Hero Title',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'heroLevel',
          type: 'number',
          defaultValue: 38,
          label: 'Hero Level',
          admin: { width: '33%' },
        },
        {
          name: 'heroProtocol',
          type: 'text',
          defaultValue: 'RASS v38.7.2',
          label: 'System Protocol',
          admin: { width: '33%' },
        },
        {
          name: 'heroCategory',
          type: 'text',
          defaultValue: 'Explorer–Builder–Teacher',
          label: 'Hero Category',
          admin: { width: '34%' },
        },
      ],
    },
    {
      name: 'abstract',
      type: 'textarea',
      required: true,
      label: 'Hero Abstract / Mission Statement',
      admin: {
        description: 'Auto-synthesized by Antigravity AI lifecycle hook if left empty.',
      },
    },
    {
      name: 'activeBadges',
      type: 'array',
      label: 'Active Badges',
      fields: [
        {
          name: 'badge',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { badge: 'Siege Survivor (July 2025)' },
        { badge: 'Kairosis Ignition (v38.7.0)' },
        { badge: 'System Architect (Infusion 2.0 launch prep)' },
      ],
    },
    {
      name: 'pendingBadges',
      type: 'array',
      label: 'Pending Badges',
      fields: [
        {
          name: 'badge',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { badge: 'Founder Oath (Aug 2025)' },
        { badge: 'Manifesto Anchor (Aug 2025)' },
        { badge: 'First Agent Badge (Aug 2025)' },
        { badge: 'Conviction Filter (Aug 2025)' },
        { badge: 'Enjoy Directive (Aug 2025)' },
      ],
    },
    {
      name: 'opsGuardrails',
      type: 'array',
      label: 'Operational Guardrails',
      fields: [
        {
          name: 'rule',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { rule: 'Planning only in #0; Execution only in #11.' },
        { rule: 'Agent edits restricted to structured JSON schema.' },
        { rule: 'Base CSS and manual rollback always available.' },
      ],
    },
    {
      name: 'syncStatus',
      type: 'select',
      defaultValue: 'synced',
      options: [
        { label: 'Synchronized with hero-wall-mvp', value: 'synced' },
        { label: 'Out of Sync / Modified Locally', value: 'pending' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
};

export default HeroWall;
