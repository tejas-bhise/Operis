import React from 'react';
import { Users, Zap, Globe } from 'lucide-react';

export default function WhoWeAre() {
  return (
    <>
      <div className="section-divider" />
      <section id="who-we-are" style={{ padding: '120px 32px', width: '100%' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>

          {/* Left */}
          <div>
            <SectionLabel>Who We Are</SectionLabel>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.04em', lineHeight: 1.15, margin: '0 0 24px 0', maxWidth: 420 }}>
              Built by operators, for founders who can't afford blind spots.
            </h2>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.78, margin: '0 0 16px 0' }}>
              Operis was born from a simple frustration: project status meetings that eat hours and still leave founders guessing. We are engineers and product builders who have lived inside fast-moving software companies.
            </p>
            <p style={{ fontSize: 15, color: '#71717a', lineHeight: 1.78 }}>
              We built Operis to be the AI layer that sits across your entire project portfolio — not just one tool or one team — and surfaces only what matters, every 30 minutes.
            </p>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 4 }}>
              {[['12+','Projects monitored'],['60s','Avg briefing time'],['99.9%','Uptime SLA']].map(([v,l]) => (
                <div key={l} style={{ background: 'linear-gradient(160deg,#0b0b0b,#070707)', border: '1px solid #1a1a1a', borderRadius: 14, padding: '20px 18px' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.04em', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 12, color: '#52525b', marginTop: 6, lineHeight: 1.4 }}>{l}</div>
                </div>
              ))}
            </div>

            {[
              { icon: <Users size={16} color="#818cf8" strokeWidth={1.75} />, title: 'Founder-first design', desc: 'Every interface decision made with one question: can a founder scan this in under 60 seconds?' },
              { icon: <Zap size={16} color="#fb923c" strokeWidth={1.75} />, title: 'Real-time intelligence', desc: 'Signals processed every 30 minutes. No stale dashboards, no end-of-day summaries.' },
              { icon: <Globe size={16} color="#34d399" strokeWidth={1.75} />, title: 'Portfolio-wide visibility', desc: 'One view across every active project — not siloed by team, tool, or timezone.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'linear-gradient(160deg,#0b0b0b,#070707)', border: '1px solid #1a1a1a', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: '#111', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5', marginBottom: 4, letterSpacing: '-0.01em' }}>{title}</div>
                  <div style={{ fontSize: 13, color: '#52525b', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const SectionLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 18 }}>{children}</p>
);