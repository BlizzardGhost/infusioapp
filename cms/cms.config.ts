/**
 * INFUSIO HEADLESS CMS - CENTRAL CODE-FIRST ARCHITECTURE DEFINITION
 *
 * Exposes typed schemas, white-label configuration, and multi-repo GitHub integrations
 * cleanly consumable by Astro SSR routes and the Antigravity Agent.
 */

import { Articles } from './collections/Articles';
import { Pages } from './collections/Pages';
import { ManagedSites } from './collections/ManagedSites';
import { HeroWall } from './collections/HeroWall';
import { BrandLogo } from './components/BrandLogo';
import { BrandIcon } from './components/BrandIcon';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomNav } from './components/CustomNav';
import { CustomFooter } from './components/CustomFooter';
import { aiEnrichmentHook } from './hooks/aiEnrichmentHook';

export const cmsConfig = {
  brand: {
    name: 'Infusio',
    tagline: 'Matcha-Powered Headless Architecture & Agent Control Plane',
    assets: {
      logoWebp: '/assets/brand-logo.webp',
      logoPng: '/assets/brand-logo.png',
      iconSvg: '/assets/brand-icon.svg',
      faviconSvg: '/favicon.svg',
    },
    theme: {
      brandColor: '#13c296',      // Matcha jade
      accentColor: '#2dd4bf',     // Mint foam
      backgroundColor: '#0e1113', // Dark matcha obsidian
      textColor: '#e8eef7',
    },
  },
  collections: {
    articles: Articles,
    pages: Pages,
    managedSites: ManagedSites,
    heroWall: HeroWall,
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
