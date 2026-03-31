import React from 'react';
import { Check, X } from 'lucide-react';

const cases = [
  { role:'Startup Founder', scenario:'Managing 4 client projects with a lean team of 8', pain:'2 hours/day in status calls, still missing critical decisions', win:'60-second Operis scan every morning. Spends the rest on product.' },
  { role:'CTO',             scenario:'3 engineering squads across different time zones',  pain:'Blockers surfaced too late — always reacting, never ahead',  win:'Operis flags blockers within the same 30-minute window they appear.' },
  { role:'Agency Director', scenario:'10+ client delivery projects simultaneously',       pain:'Relied on PMs to escalate — inconsistent signal quality',    win:'Every project gets the same AI scrutiny. Nothing falls through.' },
];

export default function UseCases() {
  return (
    <>
      <div className="section-divider" />
      <section id="use-cases" style={{ width:'100%', padding:'96px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:52 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:14 }}>Use Cases</p>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', color:'var(--text-primary)', letterSpacing:'-0.04em' }}>
              Built for anyone running multiple<br />projects at once.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {cases.map(({ role, scenario, pain, win }) => (
              <div key={role}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'26px 24px', display:'flex', flexDirection:'column', gap:18, transition:'border-color 0.2s ease, transform 0.2s ease', boxShadow:'var(--card-shadow)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>{role}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', lineHeight:1.45, letterSpacing:'-0.02em' }}>{scenario}</div>
                </div>
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:18, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <X size={9} color="#ef4444" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{pain}</span>
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <Check size={9} color="#10b981" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{win}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}