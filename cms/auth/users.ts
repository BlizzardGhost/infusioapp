/**
 * INFUSIO HEADLESS CMS - SECURE TOKEN-BASED ACCESS CONTROL
 *
 * Passwordless, invitation-only architecture.
 * Tokens are cryptographically unique security codes issued and managed by the Super Admin.
 */

export interface ClientFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  includedInPlan: boolean;
}

export interface ClientChangeRequest {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'feature' | 'design' | 'bug';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface UserAccount {
  id: string;
  identifier: string; // Email or Client ID handle
  displayName: string;
  role: 'superadmin' | 'client';
  token: string;
  assignedSite?: {
    id: string;
    name: string;
    url: string;
    repo: string;
    plan: string;
    features: ClientFeature[];
    changeRequests: ClientChangeRequest[];
  };
  createdAt: string;
  lastLogin?: string;
}

// In-memory persistent state for initial users
// Tokens can also be overridden or extended via environment variables
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin_boris',
    identifier: 'boris@computacionintegral.com',
    displayName: 'Boris (Super Admin)',
    role: 'superadmin',
    token: process.env.ADMIN_ACCESS_TOKEN || 'INF-ADMIN-9482-7103',
    createdAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'usr_client_sperling',
    identifier: 'test@sperling',
    displayName: 'Sperling Client',
    role: 'client',
    token: process.env.SPERLING_ACCESS_TOKEN || 'SPERLING-ACCESS-4821',
    assignedSite: {
      id: 'camp-david-mvp',
      name: 'Camp David MVP',
      url: 'https://camp-david-mvp.vercel.app/',
      repo: 'https://github.com/BlizzardGhost/camp-david-mvp',
      plan: 'Growth Agency Tier',
      features: [
        {
          id: 'content_editor',
          name: 'Hero & Content Editor',
          description: 'Live edits to homepage headings, copy, and visual media assets',
          enabled: true,
          includedInPlan: true,
        },
        {
          id: 'ai_seo',
          name: 'AI Generative SEO',
          description: 'Automatic synthesis of meta tags and search engine previews',
          enabled: true,
          includedInPlan: true,
        },
        {
          id: 'custom_domain',
          name: 'Custom Domain SSL',
          description: 'Map vanity domain (e.g. campdavid.com) to Vercel edge',
          enabled: false,
          includedInPlan: true,
        },
        {
          id: 'ai_chat_agent',
          name: 'Autonomous Concierge Agent',
          description: 'Interactive AI chatbot embedded on the Camp David landing page',
          enabled: false,
          includedInPlan: false,
        },
      ],
      changeRequests: [
        {
          id: 'cr_101',
          title: 'Update Hero Headline for Summer Campaign',
          description: 'Revise main banner title to reflect newly renovated cabins.',
          category: 'content',
          status: 'completed',
          createdAt: '2026-10-25T14:30:00Z',
        },
        {
          id: 'cr_102',
          title: 'Activate Custom Domain SSL',
          description: 'Prepare DNS records for client domain routing.',
          category: 'feature',
          status: 'pending',
          createdAt: '2026-10-27T09:15:00Z',
        },
      ],
    },
    createdAt: '2026-10-27T00:00:00Z',
  },
];

/**
 * Validate token and identifier match
 */
export function authenticateWithToken(identifier: string, token: string): UserAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanToken = token.trim();

  const user = INITIAL_USERS.find(
    (u) => u.identifier.toLowerCase() === cleanId && u.token === cleanToken
  );

  return user || null;
}

/**
 * Retrieve user by identifier
 */
export function getUserByIdentifier(identifier: string): UserAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  return INITIAL_USERS.find((u) => u.identifier.toLowerCase() === cleanId) || null;
}

/**
 * Retrieve user by token (for session verification)
 */
export function getUserByToken(token: string): UserAccount | null {
  const cleanToken = token.trim();
  return INITIAL_USERS.find((u) => u.token === cleanToken) || null;
}

/**
 * Helper to fetch all client accounts for the Super Admin
 */
export function getAllClients(): UserAccount[] {
  return INITIAL_USERS.filter((u) => u.role === 'client');
}
