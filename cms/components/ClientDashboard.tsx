import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import type { UserAccount, ClientFeature, ClientChangeRequest } from '../auth/users';

export interface ClientDashboardProps {
  user: UserAccount;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const site = user.assignedSite || {
    id: 'camp-david-mvp',
    name: 'Camp David MVP',
    url: 'https://camp-david-mvp.vercel.app/',
    repo: 'https://github.com/BlizzardGhost/camp-david-mvp',
    plan: 'Growth Agency Tier',
    features: [],
    changeRequests: [],
  };

  const [features, setFeatures] = useState<ClientFeature[]>(site.features);
  const [changeRequests, setChangeRequests] = useState<ClientChangeRequest[]>(site.changeRequests);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'content' | 'feature' | 'design' | 'bug'>('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleToggleFeature = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === featureId) {
          if (!f.includedInPlan) {
            alert(`This feature is available in the Enterprise Tier. Contact your administrator to upgrade.`);
            return f;
          }
          return { ...f, enabled: !f.enabled };
        }
        return f;
      })
    );
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    const newReq: ClientChangeRequest = {
      id: `cr_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'No detailed description provided.',
      category: newCategory,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setChangeRequests([newReq, ...changeRequests]);
    setNewTitle('');
    setNewDesc('');
    setIsSubmitting(false);
    setFeedbackMsg('Your change request has been dispatched to the Infusio engineering team!');
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0e1113',
        color: '#e8eef7',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Client Header */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 15, 17, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BrandLogo size="md" />
          <span
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(19, 194, 150, 0.15)',
              color: '#13c296',
              fontWeight: 700,
            }}
          >
            Client Workspace
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e8eef7' }}>
              {user.identifier}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2dd4bf' }}>{site.plan}</div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'transparent',
              color: '#a8b1c1',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {/* Site Header Banner */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(19, 194, 150, 0.12) 0%, rgba(45, 212, 191, 0.05) 100%)',
            border: '1px solid rgba(19, 194, 150, 0.25)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2dd4bf' }}>
              Managed Application
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#e8eef7' }}>
              {site.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#a8b1c1' }}>
              <span>Live Environment:</span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#13c296', fontWeight: 600, textDecoration: 'underline' }}
              >
                {site.url} ↗
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                color: '#0b0f11',
                fontWeight: 700,
                fontSize: '0.875rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(19, 194, 150, 0.3)',
              }}
            >
              Open Live Site ↗
            </a>
          </div>
        </div>

        {feedbackMsg && (
          <div
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'rgba(19, 194, 150, 0.2)',
              border: '1px solid rgba(19, 194, 150, 0.4)',
              color: '#2dd4bf',
              marginBottom: '24px',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            ✓ {feedbackMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
          {/* Section 1: Features & Plan Management */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#e8eef7' }}>
                Plan Capabilities & Feature Controls
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                Toggle active capabilities acquired under your <strong>{site.plan}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {features.map((feat) => (
                <div
                  key={feat.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e8eef7' }}>
                        {feat.name}
                      </span>
                      {!feat.includedInPlan && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(236, 72, 153, 0.15)',
                            color: '#f472b6',
                            fontWeight: 700,
                          }}
                        >
                          UPGRADE REQUIRED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#717d91', marginTop: '3px' }}>
                      {feat.description}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFeature(feat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: feat.enabled ? '#13c296' : 'rgba(255, 255, 255, 0.1)',
                      color: feat.enabled ? '#0b0f11' : '#a8b1c1',
                      transition: 'all 0.2s',
                    }}
                  >
                    {feat.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Request Updates or New Content */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: '#14191d',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', color: '#e8eef7' }}>
                Request Content or Feature Changes
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a8b1c1' }}>
                Submit copy changes, feature requests, or updates directly to the Infusio agent.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#a8b1c1', marginBottom: '6px' }}>
                  Request Title / Short Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Update seasonal hero promo headline"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#0e1113',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e8eef7',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#a8b1c1', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#0e1113',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e8eef7',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="content">Content & Copy Update</option>
                  <option value="feature">Feature Enablement</option>
                  <option value="design">Design / Layout Tweak</option>
                  <option value="bug">Report an Issue</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#a8b1c1', marginBottom: '6px' }}>
                  Detailed Instructions / New Copy
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste your exact copy or details for our autonomous agent and developers..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#0e1113',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e8eef7',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #13c296, #2dd4bf)',
                  color: '#0b0f11',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '6px',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request to Infusio'}
              </button>
            </form>

            {/* Change Requests History */}
            <div style={{ marginTop: '28px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#717d91', textTransform: 'uppercase', marginBottom: '10px' }}>
                Recent Requests ({changeRequests.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {changeRequests.map((cr) => (
                  <div
                    key={cr.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e8eef7' }}>{cr.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#717d91' }}>
                        {new Date(cr.createdAt).toLocaleDateString()} • Category: {cr.category}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: cr.status === 'completed' ? 'rgba(19, 194, 150, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: cr.status === 'completed' ? '#13c296' : '#f59e0b',
                      }}
                    >
                      {cr.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
