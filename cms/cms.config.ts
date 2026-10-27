/**
 * INFUSIO HEADLESS CMS - CENTRAL CODE-FIRST ARCHITECTURE DEFINITION
 *
 * Exposes typed schemas, white-label configuration, and content query helpers
 * cleanly consumable by Astro SSR routes.
 */

import { Articles } from './collections/Articles';
import { Pages } from './collections/Pages';
import { BrandLogo } from './components/BrandLogo';
import { BrandIcon } from './components/BrandIcon';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomNav } from './components/CustomNav';
import { CustomFooter } from './components/CustomFooter';
import { aiEnrichmentHook } from './hooks/aiEnrichmentHook';

export const cmsConfig = {
  brand: {
    name: 'Infusio Studio',
    tagline: 'Headless Architecture for Modern Web',
    assets: {
      logo: '/assets/brand-logo.png',
      logoDark: '/assets/brand-logo-dark.png',
      logoSvg: '/assets/brand-logo.svg',
      iconSvg: '/assets/brand-icon.svg',
      favicon: '/assets/favicon.svg',
    },
    theme: {
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      accentColor: '#EC4899',
      backgroundColor: '#0B0F19',
    },
  },
  collections: {
    articles: Articles,
    pages: Pages,
  },
  components: {
    BrandLogo,
    BrandIcon,
    AdminDashboard,
    CustomNav,
    CustomFooter,
  },
  hooks: {
    aiEnrichmentHook,
  },
};

export default cmsConfig;
