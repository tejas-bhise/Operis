import React from 'react';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });

  return (
    <>
      <div className="section-divider" />
      <footer style={{ width:'100%', padding:'60px 24px 40px', background:'var(--bg)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:64, marginBottom:48, alignItems:'start' }}>

            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <div style={{ width:26, height:26, borderRadius:7, background:'var(--btn-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Activity size={14} color="var(--btn-text)" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', letterSpacing:'-0.025em' }}>Operis</span>
              </div>
              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, maxWidth:260 }}>
                AI-powered executive briefings for founders managing high-stakes project portfolios.
              </p>
            </div>

            {/* Nav */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:18 }}>Product</div>
              {[['Why Us','why-us'],['Features','features'],['Output','output'],['Use Cases','use-cases']].map(([l,id]) => (
                <div key={id} style={{ marginBottom:11 }}>
                  <button onClick={() => scrollTo(id)} style={{ color:'var(--text-muted)', fontSize:13 }}
                    onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>{l}</button>
                </div>
              ))}
            </div>

            {/* Account */}
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-faint)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:18 }}>Account</div>
              {[['Sign in','/login'],['Get started','/signup'],['Dashboard','/dashboard']].map(([l,p]) => (
                <div key={p} style={{ marginBottom:11 }}>
                  <button onClick={() => navigate(p)} style={{ color:'var(--text-muted)', fontSize:13 }}
                    onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>{l}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section-divider" style={{ marginBottom:24 }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'var(--text-faint)' }}>© 2026 Operis. All rights reserved.</span>
            <span style={{ fontSize:12, color:'var(--text-faint)' }}>Built for founders who move fast.</span>
          </div>
        </div>
      </footer>
    </>
  );
}