import React from 'react';

export default function Output() {
  return (
    <>
      <div className="section-divider" />
      <section id="output" style={{ width:'100%', padding:'96px 24px', background:'var(--section-alt)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ marginBottom:52 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:14 }}>Output</p>
            <h2 style={{ fontSize:'clamp(26px, 3.5vw, 40px)', color:'var(--text-primary)', letterSpacing:'-0.04em', marginBottom:14 }}>
              What you see every 30 minutes.
            </h2>
            <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:440, lineHeight:1.72 }}>
              A single structured briefing — not a feed, not a list of notifications. Designed for a 60-second scan.
            </p>
          </div>

          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'36px 40px', boxShadow:'var(--shadow)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-40, right:-40, width:240, height:240, background:'radial-gradient(circle, var(--accent-soft) 0%, transparent 65%)', pointerEvents:'none' }} />

            {/* Key Focus */}
            <div style={{ background:'var(--accent-soft)', border:'1px solid var(--accent-border)', borderRadius:10, padding:'16px 20px', marginBottom:28 }}>
              <span style={{ fontSize:9, color:'var(--accent)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', display:'block', marginBottom:8 }}>Key Focus</span>
              <p style={{ fontSize:15, color:'var(--text-primary)', fontWeight:500, lineHeight:1.55, letterSpacing:'-0.01em' }}>
                Integration blocker and scope change creating critical pressure on Nova. Atlas and Vertex approvals pending ahead of back-to-back client deadlines.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:24 }}>
              {/* Decisions */}
              <div>
                <div style={{ fontSize:9, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Decisions Required</div>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {[
                    { p:'CRITICAL', c:'#ef4444', bg:'rgba(239,68,68,0.07)', b:'rgba(239,68,68,0.16)', t:'Nova — delivery date unconfirmed after 3 follow-ups',    sub:'Client trust eroding — delivery may slip 3–5 days.' },
                    { p:'HIGH',     c:'#f97316', bg:'rgba(249,115,22,0.07)', b:'rgba(249,115,22,0.16)', t:'Vertex — sprint blocked on client feature approval',     sub:'Team of 3 blocked — sprint start delayed.' },
                    { p:'MEDIUM',   c:'#a1a1aa', bg:'rgba(161,161,170,0.05)', b:'rgba(161,161,170,0.12)', t:'Orion — scope sign-off pending from manager',          sub:'Team planning blocked — may slip 2–3 days.' },
                  ].map(({ p,c,bg,b,t,sub }) => (
                    <div key={p} style={{ background:bg, border:`1px solid ${b}`, borderRadius:9, padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:9, fontWeight:700, color:c, textTransform:'uppercase', letterSpacing:'0.1em' }}>{p}</span>
                        <span style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500, letterSpacing:'-0.01em' }}>{t}</span>
                      </div>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health */}
              <div>
                <div style={{ fontSize:9, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Project Health</div>
                {[
                  ['Nova',   'At Risk', '#ef4444', 'Integration blocked + client pressure'],
                  ['Atlas',  'Watch',   '#f59e0b', 'Approval pending before deadline'],
                  ['Vertex', 'Watch',   '#f59e0b', 'Sprint blocked on sign-off'],
                  ['Orion',  'Healthy', '#10b981', 'Pipeline optimised, no blockers'],
                ].map(([n,s,c,r]) => (
                  <div key={n} style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0, marginTop:5 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                        <span style={{ fontSize:13, color:'var(--text-primary)', fontWeight:600 }}>{n}</span>
                        <span style={{ fontSize:10, color:c, fontWeight:700 }}>{s}</span>
                      </div>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{r}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}