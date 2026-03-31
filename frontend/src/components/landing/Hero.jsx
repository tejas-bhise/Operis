import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section style={{
      width:'100%', minHeight:'88vh', padding:'0 24px',
      display:'flex', alignItems:'center', justifyContent:'center',
      overflow:'hidden', position:'relative', background:'var(--bg)',
    }}>
      {/* Glow */}
      <div style={{
        position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)',
        width:640, height:420, pointerEvents:'none', zIndex:0,
        background:'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 68%)',
        animation:'glowPulse 8s ease-in-out infinite',
      }} />

      <div style={{
        position:'relative', zIndex:1, maxWidth:760, width:'100%',
        display:'flex', flexDirection:'column', alignItems:'center',
        textAlign:'center', padding:'120px 0 96px',
      }}>

        {/* Badge */}
        <div className="fade-up" style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'var(--accent-soft)', border:'1px solid var(--accent-border)',
          borderRadius:999, padding:'5px 14px', marginBottom:32,
        }}>
          <Activity size={10} color="var(--accent)" strokeWidth={2.5} />
          <span style={{ fontSize:11, color:'var(--accent)', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            AI Chief of Staff for Founders
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-1" style={{
          fontSize:'clamp(40px, 6vw, 68px)', fontWeight:700,
          letterSpacing:'-0.05em', lineHeight:1.05,
          color:'var(--text-primary)', marginBottom:20,
        }}>
          Your projects.<br />
          <span style={{
            background:'linear-gradient(130deg, var(--accent) 0%, #a78bfa 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            Always under control.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="fade-up delay-2" style={{
          fontSize:17, color:'var(--text-secondary)',
          maxWidth:500, lineHeight:1.75, marginBottom:36,
          letterSpacing:'-0.01em',
        }}>
          Operis monitors your entire project portfolio every 30 minutes and surfaces only what demands your attention in a single 60-second executive briefing.
        </p>

        {/* CTA */}
        <div className="fade-up delay-3" style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:14 }}>
          <button onClick={() => navigate('/signup')}
            style={{
              display:'flex', alignItems:'center', gap:7,
              background:'var(--btn-bg)', color:'var(--btn-text)',
              fontSize:14, fontWeight:600, padding:'11px 22px', borderRadius:8,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity='0.88'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='translateY(0)'; }}>
            Get started free <ArrowRight size={14} strokeWidth={2.5} />
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{
              background:'transparent', border:'1px solid var(--border)',
              color:'var(--text-secondary)', fontSize:14,
              padding:'11px 22px', borderRadius:8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.transform='translateY(0)'; }}>
            Open dashboard
          </button>
        </div>

        <p className="fade-up delay-4" style={{ fontSize:12, color:'var(--text-muted)', marginBottom:80 }}>
          No setup required &nbsp;·&nbsp; Free for small teams
        </p>

        {/* Dashboard preview */}
        <div className="fade-up delay-5" style={{
          width:'100%', background:'var(--bg-card)',
          border:'1px solid var(--border)', borderRadius:14, padding:'24px 28px',
          boxShadow:'var(--shadow)', textAlign:'left',
        }}>
          {/* Chrome bar */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
            {['#333','#333','#333'].map((c,i) => <span key={i} style={{ width:9, height:9, borderRadius:'50%', background:c }} />)}
            <div style={{ marginLeft:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:5, padding:'3px 12px' }}>
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>operis.app/dashboard</span>
            </div>
          </div>

          {/* Key Focus */}
          <div style={{ background:'var(--accent-soft)', border:'1px solid var(--accent-border)', borderRadius:10, padding:'13px 16px', marginBottom:16 }}>
            <span style={{ fontSize:9, color:'var(--accent)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', display:'block', marginBottom:5 }}>Key Focus</span>
            <p style={{ fontSize:13, color:'var(--text-primary)', lineHeight:1.55 }}>
              Integration blocker and scope change creating critical pressure on Nova. Atlas and Vertex approvals pending.
            </p>
          </div>

          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            {[
              { p:'CRITICAL', c:'#ef4444', bg:'rgba(239,68,68,0.07)', b:'rgba(239,68,68,0.18)', t:'Nova — delivery unconfirmed after 3 follow-ups' },
              { p:'HIGH',     c:'#f97316', bg:'rgba(249,115,22,0.07)', b:'rgba(249,115,22,0.18)', t:'Vertex — sprint blocked on client sign-off' },
            ].map(({ p,c,bg,b,t }) => (
              <div key={p} style={{ flex:1, background:bg, border:`1px solid ${b}`, borderRadius:8, padding:'11px 13px' }}>
                <span style={{ fontSize:9, fontWeight:700, color:c, textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:5 }}>{p}</span>
                <span style={{ fontSize:12, color:'var(--text-primary)', lineHeight:1.4 }}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:6 }}>
            {[['Nova','At Risk','#ef4444'],['Atlas','Watch','#f59e0b'],['Vertex','Watch','#f59e0b'],['Orion','Healthy','#10b981']].map(([n,s,c]) => (
              <div key={n} style={{ flex:1, background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:7, padding:'8px 10px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:c, flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--text-muted)', flex:1 }}>{n}</span>
                <span style={{ fontSize:9, color:c, fontWeight:600 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}