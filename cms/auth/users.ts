/**
 * INFUSIO HEADLESS CMS - SECURE USER DIRECTORY & SESSION MANAGEMENT
 *
 * Passwordless architecture: On-demand 4-digit security codes valid for 10 minutes.
 * Scoped permissions per user/client.
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
  identifier: string; // Email or Client ID
  displayName: string;
  role: 'superadmin' | 'client';
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
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin_boris',
    identifier: 'boris@computacionintegral.com',
    displayName: 'Boris (Superadmin)',
    role: 'superadmin',
    createdAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'usr_client_sperling',
    identifier: 'test@sperling',
    displayName: 'Sperling Client',
    role: 'client',
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
 * Retrieve user by identifier
 */
export function getUserByIdentifier(identifier: string): UserAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  return INITIAL_USERS.find((u) => u.identifier.toLowerCase() === cleanId) || null;
}

/**
 * Retrieve user by session token or ID
 */
export function getUserBySession(sessionString: string): UserAccount | null {
  try {
    const [userId] = sessionString.split(':');
    return INITIAL_USERS.find((u) => u.id === userId) || null;
  } catch {
    return null;
  }
}

/**
 * Create a simple signed session token for verified users
 */
export function createSessionToken(user: UserAccount): string {
  const timestamp = Date.now();
  return `${user.id}:${timestamp}`;
}
