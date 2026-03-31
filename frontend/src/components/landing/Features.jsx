import React from 'react';
import { GitPullRequest, AlertTriangle, Heart, BarChart2, RefreshCw, Lock } from 'lucide-react';

const features = [
  { icon:<GitPullRequest size={16} strokeWidth={1.75}/>, color:'var(--accent)',  title:'Prioritised Decisions',    desc:'Every decision ranked CRITICAL, HIGH, or MEDIUM with an exact tradeoff.' },
  { icon:<AlertTriangle size={16} strokeWidth={1.75}/>,  color:'#ef4444',        title:'Active Risk Detection',    desc:'Blockers identified as they emerge — with a direct resolution action.' },
  { icon:<Heart size={16} strokeWidth={1.75}/>,          color:'#a78bfa',        title:'Project Health Scoring',   desc:'Each project scored Healthy / Watch / At Risk / Critical in real time.' },
  { icon:<BarChart2 size={16} strokeWidth={1.75}/>,      color:'#10b981',        title:'Quantified Impact',        desc:'"Delivery may slip 3–5 days" — not vague risk labels.' },
  { icon:<RefreshCw size={16} strokeWidth={1.75}/>,      color:'#60a5fa',        title:'30-Minute Briefings',      desc:'Fresh every 30 minutes. No stale data, no manual refresh.' },
  { icon:<Lock size={16} strokeWidth={1.75}/>,           color:'#f59e0b',        title:'Zero Data Retention',      desc:'Processed in isolation. Your data is never stored beyond the session.' },
];

export default function Features() {
  return (
    <>
      <div className="section-divider" />
      <section id="features" style={{ width:'100%', padding:'96px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:52 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:14 }}>Features</p>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', color:'var(--text-primary)', letterSpacing:'-0.04em' }}>
              Everything a founder needs.<br />Nothing they don't.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {features.map(({ icon, color, title, desc }) => (
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