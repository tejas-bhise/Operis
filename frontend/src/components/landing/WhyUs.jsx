import React from 'react';
import { Target, Zap, Brain, Shield, BarChart2, RefreshCw } from 'lucide-react';

const items = [
  { icon: <Target size={16} strokeWidth={1.75} />,   color:'var(--accent)',  title:'Signal over noise',      desc:'Only what requires a decision today — ranked by urgency, not recency.' },
  { icon: <Zap size={16} strokeWidth={1.75} />,      color:'#f97316',        title:'No setup overhead',      desc:'Connect your data once. Executive briefings generated within minutes.' },
  { icon: <Brain size={16} strokeWidth={1.75} />,    color:'#a78bfa',        title:'Context-aware AI',       desc:'Understands project relationships, client pressure, and delivery risk patterns.' },
  { icon: <Shield size={16} strokeWidth={1.75} />,   color:'#10b981',        title:'Private by design',      desc:'Your data never trains our models. Zero retention between cycles.' },
  { icon: <BarChart2 size={16} strokeWidth={1.75} />,color:'#60a5fa',        title:'Quantified impact',      desc:'"Delivery may slip 3–5 days" — not "may impact timelines."' },
  { icon: <RefreshCw size={16} strokeWidth={1.75} />,color:'#f59e0b',        title:'30-minute cycles',       desc:'Always a fresh picture. No manual refresh, no end-of-day catch-up.' },
];

export default function WhyUs() {
  return (
    <>
      <div className="section-divider" />
      <section id="why-us" style={{ width:'100%', padding:'96px 24px', background:'var(--section-alt)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:52 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:14 }}>Why Operis</p>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', color:'var(--text-primary)', letterSpacing:'-0.04em', marginBottom:14 }}>
              Your team has tools.<br />You need intelligence.
            </h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:460, lineHeight:1.72 }}>
              Jira tells your team what to build. Slack tells you what happened. Operis tells you what to decide — right now.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {items.map(({ icon, color, title, desc }) => (
              <div key={title}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 20px', transition:'border-color 0.2s ease, transform 0.2s ease', boxShadow:'var(--card-shadow)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ color, marginBottom:14 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:6, letterSpacing:'-0.02em' }}>{title}</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.62 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}