import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { Articles } from './collections/Articles';
import { Pages } from './collections/Pages';
import { ManagedSites } from './collections/ManagedSites';
import { HeroWall } from './collections/HeroWall';
import { BrandLogo } from './components/BrandLogo';
import { BrandIcon } from './components/BrandIcon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default buildConfig({
  admin: {
    theme: 'dark',
    components: {
      graphics: {
        Logo: BrandLogo as any,
        Icon: BrandIcon as any,
      },
    },
    meta: {
      titleSuffix: '- Infusio Studio CMS',
      favicon: '/assets/brand-icon.svg',
      ogImage: '/assets/brand-logo.png',
    },
    custom: {
      css: path.resolve(__dirname, './styles/admin-theme.css'),
    },
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./cms-storage.db',
    },
  }),
  collections: [Articles, Pages, ManagedSites, HeroWall],
  secret: process.env.PAYLOAD_SECRET || 'infusio-headless-secret-key-development',
  typescript: {
    outputFile: path.resolve(__dirname, './cms-types.ts'),
  },
});
