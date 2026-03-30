import React, { useEffect, useState } from 'react';
import { Activity, Target, AlertTriangle, GitPullRequest, Clock, ArrowRight, Sparkles, CheckCircle2, Heart } from 'lucide-react';

const API = "http://localhost:8000";

function safeArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

const PRIORITY_STYLES = {
  CRITICAL: {
    badge: { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.1em' },
    borderLeft: '2px solid rgba(239,68,68,0.6)',
    background: 'rgba(239,68,68,0.04)',
    impactColor: 'rgba(248,113,113,0.75)',
    impactText: 'rgba(252,165,165,0.9)',
    actionColor: 'rgba(248,113,113,0.75)',
    dividerColor: 'rgba(239,68,68,0.12)',
    arrowBg: 'rgba(239,68,68,0.1)',
    arrowColor: '#f87171',
  },
  HIGH: {
    badge: { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.1em' },
    borderLeft: '2px solid rgba(249,115,22,0.5)',
    background: 'rgba(249,115,22,0.04)',
    impactColor: 'rgba(251,146,60,0.75)',
    impactText: 'rgba(253,186,116,0.9)',
    actionColor: 'rgba(251,146,60,0.75)',
    dividerColor: 'rgba(249,115,22,0.12)',
    arrowBg: 'rgba(249,115,22,0.1)',
    arrowColor: '#fb923c',
  },
  MEDIUM: {
    badge: { background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 4, fontSize: 9, fontWeight: 700, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.1em' },
    borderLeft: '2px solid rgba(234,179,8,0.4)',
    background: 'rgba(234,179,8,0.03)',
    impactColor: 'rgba(234,179,8,0.75)',
    impactText: 'rgba(253,224,71,0.85)',
    actionColor: 'rgba(234,179,8,0.75)',
    dividerColor: 'rgba(234,179,8,0.12)',
    arrowBg: 'rgba(234,179,8,0.1)',
    arrowColor: '#facc15',
  },
};

const HEALTH_STYLES = {
  'Critical': { bg: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', dot: '#ef4444', text: '#f87171' },
  'At Risk':  { bg: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', dot: '#f97316', text: '#fb923c' },
  'Watch':    { bg: 'rgba(234,179,8,0.08)',  border: '1px solid rgba(234,179,8,0.2)',  dot: '#eab308', text: '#facc15' },
  'Healthy':  { bg: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', dot: '#10b981', text: '#34d399' },
};

const S = {
  page: { minHeight: '100vh', background: '#050505', color: '#d4d4d4', fontFamily: 'Inter, -apple-system, sans-serif', margin: 0, padding: 0 },
  nav: { borderBottom: '1px solid #1f1f1f', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 },
  navInner: { maxWidth: 896, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 20, height: 20, borderRadius: 4, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontWeight: 600, fontSize: 11, color: '#f5f5f5', textTransform: 'uppercase', letterSpacing: '0.15em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.1em' },
  main: { maxWidth: 896, margin: '0 auto', padding: '48px 24px 80px' },

  sectionLabel: { fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  snapshotCard: { background: 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)', border: '1px solid #1f1f1f', borderRadius: 12, padding: '28px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' },
  glow: { position: 'absolute', top: -40, right: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%' },
  statusRow: { display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 },
  dot: (color) => ({ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', marginRight: 6 }),
  statusChip: (color) => ({ color, display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }),
  keyFocusRow: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  keyFocusLabel: { fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8, display: 'block' },
  keyFocusText: { fontSize: 18, color: '#f5f5f5', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.5, margin: 0 },

  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 52 },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 24 },

  sectionHeading: () => ({ fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: 8 }),
  cardList: { display: 'flex', flexDirection: 'column', gap: 28 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#e5e5e5', margin: '0 0 4px 0' },
  cardDesc: { fontSize: 13, color: '#737373', margin: '0 0 14px 0', lineHeight: 1.65 },
  impactLabel: (c) => ({ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }),
  impactText: (c) => ({ fontSize: 13, fontWeight: 500, color: c }),
  divider: (c) => ({ margin: '12px 0 0 0', paddingTop: 12, borderTop: `1px solid ${c}` }),
  bottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  actionLabel: (c) => ({ fontSize: 10, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }),
  actionText: { fontSize: 13, color: '#a3a3a3' },
  arrowBtn: (bg, color) => ({ width: 30, height: 30, borderRadius: 4, background: bg, border: 'none', color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }),

  sideCard: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: '18px 20px' },
  sideTitle: { fontSize: 10, fontWeight: 700, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 18px 0' },
  changeItem: (i) => ({ paddingTop: i > 0 ? 12 : 0, marginTop: i > 0 ? 12 : 0, borderTop: i > 0 ? '1px solid #1a1a1a' : 'none' }),
  changeLabel: (c) => ({ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: c, display: 'block', marginBottom: 4 }),
  changeText: { fontSize: 13, color: '#a3a3a3', lineHeight: 1.55, margin: 0 },
  stableRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  stableText: { fontSize: 13, color: '#737373', lineHeight: 1.55 },
};

export default function Dashboard() {
  const [digest, setDigest] = useState(null);
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [dRes, hRes] = await Promise.all([
        fetch(`${API}/digest/latest`),
        fetch(`${API}/health/latest`),
      ]);
      setDigest(await dRes.json());
      const h = await hRes.json();
      setHealth(Array.isArray(h) ? h : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#525252', fontSize: 13 }}>Loading Operis…</p>
    </div>
  );

  const decisions     = safeArray(digest?.decisions);
  const risks         = safeArray(digest?.risks);
  const changes       = safeArray(digest?.changes);
  const projectHealth = safeArray(digest?.project_health);
  const stable        = health.filter(p => p.status === 'healthy');
  const warning       = health.filter(p => p.status === 'warning');
  const decisionCount = digest?.decision_count ?? decisions.length;
  const riskCount     = digest?.risk_count ?? risks.length;

  const colorMap = { new: '#60a5fa', dependency: '#fb923c', escalated: '#f87171', resolved: '#34d399', progress: '#34d399', update: '#818cf8', risk: '#f87171' };

  // Sort decisions: CRITICAL → HIGH → MEDIUM
  const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  const sortedDecisions = [...decisions].sort((a, b) =>
    (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  );

  return (
    <div style={S.page}>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo}>
            <div style={S.logoIcon}><Activity size={13} color="#000" /></div>
            <span style={S.logoText}>Heartbeat Operis</span>
          </div>
          <div style={S.navRight}>
            <Clock size={12} color="#6366f1" style={{ marginRight: 4 }} />
            30 Min Window
          </div>
        </div>
      </nav>

      <main style={S.main}>

        {/* ── SNAPSHOT ── */}
        <section style={{ marginBottom: 52 }}>
          <p style={S.sectionLabel}><Target size={11} /> Operational Snapshot</p>
          <div style={S.snapshotCard}>
            <div style={S.glow} />
            <div style={S.statusRow}>
              {decisionCount > 0 && <span style={S.statusChip('#fb923c')}><span style={S.dot('#fb923c')} />{decisionCount} Decision{decisionCount !== 1 ? 's' : ''} Required</span>}
              {riskCount > 0 && <span style={S.statusChip('#f87171')}><span style={S.dot('#f87171')} />{riskCount} Risk{riskCount !== 1 ? 's' : ''} Detected</span>}
              {stable.length > 0 && <span style={S.statusChip('#34d399')}><span style={S.dot('#34d399')} />{stable.length} Project{stable.length !== 1 ? 's' : ''} Stable</span>}
            </div>
            <div style={S.keyFocusRow}>
              <Sparkles size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: 3 }} />
              <div>
                <span style={S.keyFocusLabel}>Key Focus</span>
                <p style={S.keyFocusText}>{digest?.summary || 'System warming up — digest will appear shortly.'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN GRID ── */}
        <div style={S.grid}>

          {/* LEFT */}
          <div style={S.leftCol}>

            {/* ── DECISIONS ── */}
            {sortedDecisions.length > 0 && (
              <section>
                <h2 style={S.sectionHeading()}>
                  <GitPullRequest size={13} color="#fb923c" /> Decisions Required
                </h2>
                <div style={S.cardList}>
                  {sortedDecisions.map((d, i) => {
                    const priority = (d.priority || 'HIGH').toUpperCase();
                    const ps       = PRIORITY_STYLES[priority] || PRIORITY_STYLES.HIGH;
                    const title    = typeof d === 'string' ? d : d.title || d.name || `Decision ${i + 1}`;
                    const desc     = typeof d === 'object' ? d.description || d.context || '' : '';
                    const impact   = typeof d === 'object' ? d.impact || d.consequence || '' : '';
                    const action   = typeof d === 'object' ? d.action || d.recommendation || '' : '';
                    return (
                      <div key={i}>
                        {/* Priority badge + title row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={ps.badge}>{priority}</span>
                          <h3 style={{ ...S.cardTitle, margin: 0 }}>{title}</h3>
                        </div>
                        {desc && <p style={S.cardDesc}>{desc}</p>}
                        <div style={{ background: ps.background, borderLeft: ps.borderLeft, padding: '14px 16px', borderRadius: '0 8px 8px 0' }}>
                          {impact && (
                            <>
                              <span style={S.impactLabel(ps.impactColor)}>Impact</span>
                              <span style={S.impactText(ps.impactText)}>{impact}</span>
                            </>
                          )}
                          <div style={{ ...S.divider(ps.dividerColor), ...S.bottomRow }}>
                            <div>
                              <span style={S.actionLabel(ps.actionColor)}>Decision</span>
                              <span style={S.actionText}>{action || 'Review and decide.'}</span>
                            </div>
                            <button style={S.arrowBtn(ps.arrowBg, ps.arrowColor)}>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── RISKS ── */}
            {risks.length > 0 && (
              <section>
                <h2 style={S.sectionHeading()}>
                  <AlertTriangle size={13} color="#f87171" /> Risks Detected
                </h2>
                <div style={S.cardList}>
                  {risks.map((r, i) => {
                    const title  = typeof r === 'string' ? r : r.title || r.name || `Risk ${i + 1}`;
                    const desc   = typeof r === 'object' ? r.description || r.context || '' : '';
                    const impact = typeof r === 'object' ? r.impact || r.consequence || '' : '';
                    const action = typeof r === 'object' ? r.action || r.mitigation || '' : '';
                    return (
                      <div key={i}>
                        <h3 style={S.cardTitle}>{title}</h3>
                        {desc && <p style={S.cardDesc}>{desc}</p>}
                        <div style={{ background: 'rgba(239,68,68,0.04)', borderLeft: '2px solid rgba(239,68,68,0.25)', padding: '14px 16px', borderRadius: '0 8px 8px 0' }}>
                          {impact && <><span style={S.impactLabel('rgba(248,113,113,0.75)')}>Impact</span><span style={S.impactText('rgba(252,165,165,0.9)')}>{impact}</span></>}
                          <div style={{ ...S.divider('rgba(239,68,68,0.12)'), ...S.bottomRow }}>
                            <div>
                              <span style={S.actionLabel('rgba(248,113,113,0.75)')}>Action</span>
                              <span style={S.actionText}>{action || 'Investigate immediately.'}</span>
                            </div>
                            <button style={S.arrowBtn('rgba(239,68,68,0.1)', '#f87171')}>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {decisions.length === 0 && risks.length === 0 && (
              <div style={{ border: '1px solid #1a1a1a', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                <p style={{ color: '#525252', fontSize: 13, margin: 0 }}>Monitoring active — decisions and risks will appear as events are processed.</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={S.rightCol}>

            {/* ── PROJECT HEALTH ── */}
            {projectHealth.length > 0 && (
              <section style={S.sideCard}>
                <h2 style={S.sideTitle}><Heart size={11} style={{ marginRight: 6, display: 'inline' }} />Project Health</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {projectHealth.map((h, i) => {
                    const hs = HEALTH_STYLES[h.status] || HEALTH_STYLES['Healthy'];
                    return (
                      <div key={i} style={{ background: hs.bg, border: hs.border, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: hs.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5', flex: 1 }}>{h.project}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: hs.text }}>{h.status}</span>
                        </div>
                        {h.reason && <p style={{ fontSize: 11, color: '#737373', margin: '0 0 0 15px', lineHeight: 1.5 }}>{h.reason}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── CHANGE SUMMARY ── */}
            <section style={S.sideCard}>
              <h2 style={S.sideTitle}>Change Summary</h2>
              {changes.length > 0 ? changes.map((c, i) => {
                const label = typeof c === 'object' ? c.type || c.category || 'update' : 'update';
                const text  = typeof c === 'string' ? c : c.description || c.summary || c.text || '';
                return (
                  <div key={i} style={S.changeItem(i)}>
                    <span style={S.changeLabel(colorMap[label.toLowerCase()] || '#818cf8')}>{label}</span>
                    <p style={S.changeText}>{text}</p>
                  </div>
                );
              }) : (
                <p style={{ ...S.changeText, color: '#525252' }}>{digest?.changes_summary || 'No changes recorded yet.'}</p>
              )}
            </section>

            {/* ── STABLE OPERATIONS ── */}
            <section style={S.sideCard}>
              <h2 style={S.sideTitle}>Stable Operations</h2>
              {stable.length > 0 ? stable.map((p, i) => (
                <div key={i} style={{ ...S.stableRow, marginTop: i > 0 ? 10 : 0 }}>
                  <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={S.stableText}>{p.project_name} — normal delivery cadence.</span>
                </div>
              )) : (
                <div style={S.stableRow}>
                  <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={S.stableText}>{digest?.stable_summary || 'Monitoring active — stability data loading.'}</span>
                </div>
              )}
              {warning.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1a1a1a' }}>
                  {warning.map((p, i) => (
                    <div key={i} style={{ ...S.stableRow, marginTop: i > 0 ? 10 : 0 }}>
                      <AlertTriangle size={15} color="#eab308" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={S.stableText}>{p.project_name} — needs attention.</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}