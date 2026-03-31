import React from 'react';

const steps = [
  { num: '01', title: 'Connect your projects', desc: 'Link your project data sources once. Operis ingests signals across your entire stack.' },
  { num: '02', title: 'Signals are processed', desc: 'Every 30 minutes — status changes, client messages, blockers, deadline shifts.' },
  { num: '03', title: 'AI generates briefing', desc: 'Signals classified by urgency, deduplicated, structured into a ranked executive digest.' },
  { num: '04', title: 'You decide in 60 seconds', desc: 'CRITICAL to MEDIUM, with the exact tradeoff clearly stated for each decision.' },
];

export default function HowItWorks() {
  return (
    <>
      <div className="section-divider" />
      <section id="how-it-works" style={{ padding: '120px 32px', width: '100%' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ maxWidth: 560, marginBottom: 72 }}>
            <SectionLabel>How It Works</SectionLabel>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: 700, color: '#f5f5f5', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              From raw signals to clear decisions in 4 steps.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2, position: 'relative' }}>
            {/* Connector */}
            <div style={{ position: 'absolute', top: 22, left: 'calc(12.5% + 18px)', right: 'calc(12.5% + 18px)', height: 1, background: 'linear-gradient(90deg, #1c1c1c 0%, #2a2a2a 50%, #1c1c1c 100%)', zIndex: 0 }} />

            {steps.map(({ num, title, desc }, i) => (
              <div key={num} style={{ background: 'linear-gradient(160deg,#0b0b0b,#080808)', border: '1px solid #1a1a1a', borderRadius: 14, padding: '24px 20px', position: 'relative', zIndex: 1, margin: '0 6px' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: i === 0 ? 'rgba(99,102,241,0.1)' : '#0d0d0d', border: `1px solid ${i === 0 ? 'rgba(99,102,241,0.2)' : '#1e1e1e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? '#818cf8' : '#3f3f46', letterSpacing: '-0.01em' }}>{num}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5', marginBottom: 8, letterSpacing: '-0.015em', lineHeight: 1.3 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#52525b', lineHeight: 1.65 }}>{desc}</div>
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