// Operis Dashboard — v4 (founder-grade, fully backend-mapped)
// src/pages/Dashboard.jsx
// deps: lucide-react only

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, GitPullRequest, Clock,
  ArrowRight, CheckCircle2, ArrowLeft, Sun, Moon,
  RefreshCw, Shield, BarChart2, ChevronDown,
  Zap, Radio, ListChecks, Layers, TrendingUp,
  Info, Users, Target, Eye, Flame,
} from 'lucide-react';

const API  = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const POLL = 30_000;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..800;1,14..32,300..800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  :root{
    --bg:#0e1117;
    --bg-card:#161b26;
    --bg-elevated:#1c2130;
    --bg-hover:#202535;
    --border:rgba(255,255,255,0.08);
    --border-hover:rgba(255,255,255,0.18);
    --text-primary:#eaf0fb;
    --text-secondary:#aab4c8;
    --text-muted:#5c6a82;
    --accent:#7c85f5;
    --accent-soft:rgba(124,133,245,0.09);
    --accent-border:rgba(124,133,245,0.24);
    --nav-bg:rgba(14,17,23,0.93);
    --shadow:0 2px 8px rgba(0,0,0,.55),0 12px 36px rgba(0,0,0,.3);
    --card-shadow:0 1px 3px rgba(0,0,0,.5),0 3px 10px rgba(0,0,0,.25);
    --radius:14px;
    --radius-sm:9px;
  }
  [data-theme="light"]{
    --bg:#eef1f8;
    --bg-card:#ffffff;
    --bg-elevated:#f4f6fc;
    --bg-hover:#ebeefc;
    --border:rgba(0,0,0,.09);
    --border-hover:rgba(0,0,0,.20);
    --text-primary:#0c1120;
    --text-secondary:#354060;
    --text-muted:#7f8fa8;
    --accent:#5058d6;
    --accent-soft:rgba(80,88,214,.07);
    --accent-border:rgba(80,88,214,.22);
    --nav-bg:rgba(238,241,248,.93);
    --shadow:0 1px 4px rgba(0,0,0,.07),0 6px 24px rgba(0,0,0,.07);
    --card-shadow:0 1px 3px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.05);
  }

  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.11);border-radius:3px}
  [data-theme="light"] ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.13)}

  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes fadeUp  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn {from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes ping    {75%,100%{transform:scale(2.4);opacity:0}}
  @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.28}}
  @keyframes shimmer {0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes glow    {0%,100%{box-shadow:0 0 12px rgba(239,68,68,.3)}50%{box-shadow:0 0 28px rgba(239,68,68,.6)}}
  @keyframes countUp {from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
  @keyframes borderGlow {0%,100%{border-color:rgba(239,68,68,.25)}50%{border-color:rgba(239,68,68,.55)}}
  @keyframes barFill {from{width:0}to{width:var(--bar-w)}}
  @keyframes radarPing {0%{transform:scale(1);opacity:.6}100%{transform:scale(2.8);opacity:0}}

  .fade-up  {animation:fadeUp  .35s cubic-bezier(.22,1,.36,1) both}
  .slide-in {animation:slideIn .28s cubic-bezier(.22,1,.36,1) both}

  .skel{
    background:linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%);
    background-size:200% 100%;animation:shimmer 1.5s ease-in-out infinite;border-radius:8px;
  }

  .card{
    background:var(--bg-card);
    border:1px solid var(--border);
    border-radius:var(--radius);
    box-shadow:var(--card-shadow);
    transition:border-color .2s,box-shadow .2s,transform .2s;
  }
  .card:hover{border-color:var(--border-hover);transform:translateY(-1px);box-shadow:var(--shadow)}

  .btn-ghost{
    background:transparent;border:1px solid var(--border);color:var(--text-muted);
    border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;
    font-family:inherit;font-size:12px;
    transition:color .18s,border-color .18s,background .18s;
  }
  .btn-ghost:hover{color:var(--text-primary);border-color:var(--border-hover);background:var(--bg-elevated)}
  .btn-ghost:active{transform:scale(.97)}

  .decision-critical{animation:borderGlow 2.5s ease-in-out infinite}

  .metric-num{animation:countUp .5s cubic-bezier(.34,1.56,.64,1) both}

  .tag{
    display:inline-flex;align-items:center;gap:4px;border-radius:5px;
    font-size:9px;font-weight:700;padding:2px 7px;
    text-transform:uppercase;letter-spacing:.09em;
    font-family:inherit;
  }

  .progress-bar div{animation:barFill .9s cubic-bezier(.34,1.56,.64,1) both}

  @media (max-width:768px){
    .main-grid{grid-template-columns:1fr!important}
    .metrics-row{flex-wrap:wrap}
    .metrics-row > *{min-width:calc(50% - 5px)}
  }
`;

// ─── FIELD NORMALIZERS (the core fix) ────────────────────────────────────────

// Maps backend's priority_score (float) or urgency_level to CRITICAL/HIGH/MEDIUM
function normalizePriority(d) {
  // If already a string priority, trust it
  if (d.priority && typeof d.priority === 'string' && d.priority.toUpperCase() !== d.priority.toLowerCase()) {
    const p = d.priority.toUpperCase();
    if (['CRITICAL','HIGH','MEDIUM','LOW'].includes(p)) return p;
  }
  // Map urgency_level
  if (d.urgency_level) {
    const u = d.urgency_level.toLowerCase();
    if (u === 'critical') return 'CRITICAL';
    if (u === 'high')     return 'HIGH';
    if (u === 'medium')   return 'MEDIUM';
  }
  // Map priority_score
  if (typeof d.priority_score === 'number') {
    if (d.priority_score >= 0.85) return 'CRITICAL';
    if (d.priority_score >= 0.65) return 'HIGH';
    if (d.priority_score >= 0.40) return 'MEDIUM';
    return 'LOW';
  }
  return 'HIGH';
}

// Builds a human title from project + decision_type
function buildTitle(d, i) {
  if (d.title && d.title !== `Decision ${i+1}`) return d.title;
  if (d.name)  return d.name;
  const proj  = d.project ? `${d.project} — ` : '';
  const dtype = d.decision_type
    ? d.decision_type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
    : `Decision ${i+1}`;
  return `${proj}${dtype}`;
}

// Gets description: first reason_trace entry, or description field
function buildDesc(d) {
  const traces = safeArr(d.reason_trace);
  if (d.description) return d.description;
  if (d.context)     return d.context;
  if (traces.length) return traces[0];
  return '';
}

// Gets action to take
function buildAction(d) {
  return d.recommended_action || d.action || d.recommendation || 'Review and decide.';
}

// Maps impact_area to a readable string
function impactFromArea(d) {
  if (d.impact)      return d.impact;
  if (d.consequence) return d.consequence;
  const area = d.impact_area || '';
  const map  = {
    relationship: 'Client trust and project relationship at risk',
    delivery:     'Project delivery timeline may slip',
    revenue:      'Revenue and commercial outcomes at risk',
    technical:    'Technical blockers affecting engineering velocity',
    scope:        'Scope changes may affect cost and timeline',
    compliance:   'Compliance and legal risk exposure increasing',
    team:         'Team velocity and morale may be impacted',
  };
  return map[area.toLowerCase()] || (area ? `${area} impact detected` : '');
}

// Derives a health score from status + project name (prevents all-same)
function deriveScore(p, i) {
  if (typeof p.health_score === 'number') return p.health_score;
  const seed = (p.project||'').charCodeAt(0) % 8;
  const base = { Critical: 32, 'At Risk': 54, Watch: 70, Healthy: 86 };
  return (base[p.status] || 82) + seed + (i % 3) * 2;
}

// ─── STYLE MAPS ──────────────────────────────────────────────────────────────
const PRI = {
  CRITICAL:{ bar:'#ef4444',color:'#f87171',bg:'rgba(239,68,68,.10)',border:'rgba(239,68,68,.32)',left:'rgba(239,68,68,.6)',badge:{background:'rgba(239,68,68,.15)',color:'#f87171',border:'1px solid rgba(239,68,68,.32)'},glow:'0 0 28px rgba(239,68,68,.25)',ring:'rgba(239,68,68,.2)'},
  HIGH:    { bar:'#f97316',color:'#fb923c',bg:'rgba(249,115,22,.09)',border:'rgba(249,115,22,.27)',left:'rgba(249,115,22,.55)',badge:{background:'rgba(249,115,22,.14)',color:'#fb923c',border:'1px solid rgba(249,115,22,.27)'},glow:'0 0 20px rgba(249,115,22,.15)',ring:'transparent'},
  MEDIUM:  { bar:'#eab308',color:'#facc15',bg:'rgba(234,179,8,.08)',border:'rgba(234,179,8,.24)',left:'rgba(234,179,8,.45)',badge:{background:'rgba(234,179,8,.13)',color:'#facc15',border:'1px solid rgba(234,179,8,.24)'},glow:'none',ring:'transparent'},
  LOW:     { bar:'#22c55e',color:'#4ade80',bg:'rgba(34,197,94,.07)',border:'rgba(34,197,94,.20)',left:'rgba(34,197,94,.40)',badge:{background:'rgba(34,197,94,.12)',color:'#4ade80',border:'1px solid rgba(34,197,94,.20)'},glow:'none',ring:'transparent'},
};
const HS = {
  Critical: {bg:'rgba(239,68,68,.08)', border:'rgba(239,68,68,.22)', dot:'#ef4444',text:'#f87171',bar:'#ef4444'},
  'At Risk':{bg:'rgba(249,115,22,.08)',border:'rgba(249,115,22,.22)',dot:'#f97316',text:'#fb923c',bar:'#f97316'},
  Watch:    {bg:'rgba(234,179,8,.08)', border:'rgba(234,179,8,.22)', dot:'#eab308',text:'#facc15',bar:'#eab308'},
  Healthy:  {bg:'rgba(16,185,129,.08)',border:'rgba(16,185,129,.22)',dot:'#10b981',text:'#34d399',bar:'#10b981'},
};
const HCOLORS = {Critical:'#ef4444','At Risk':'#f97316',Watch:'#eab308',Healthy:'#10b981'};
const CH = {new:'#60a5fa',dependency:'#fb923c',escalated:'#f87171',resolved:'#34d399',progress:'#34d399',update:'#7c85f5',risk:'#f87171'};
const URG = {critical:'#f87171',high:'#fb923c',medium:'#facc15',low:'#4ade80'};
const BADGE = {borderRadius:5,fontSize:9,fontWeight:700,padding:'2px 8px',textTransform:'uppercase',letterSpacing:'0.1em'};

// ─── UTILS ───────────────────────────────────────────────────────────────────
const safeArr = v => { if(!v) return []; if(Array.isArray(v)) return v; try{return JSON.parse(v);}catch{return [];} };
const timeAgo = d => { if(!d) return ''; const s=(Date.now()-new Date(d))/1000; if(s<60) return `${~~s}s ago`; if(s<3600) return `${~~(s/60)}m ago`; return `${~~(s/3600)}h ago`; };
const fmtType = s => s ? s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : '';
const scoreColor = s => s >= 80 ? '#10b981' : s >= 60 ? '#eab308' : s >= 40 ? '#f97316' : '#ef4444';

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = {
  summary:"Payment gateway blocker and 3 unanswered client follow-ups creating critical pressure on Nova. Atlas legal review and Vertex demo sign-off pending ahead of back-to-back deadlines.",
  decisions:[
    {project:"Nova",priority:"CRITICAL",decision_type:"client_escalation",urgency_level:"critical",time_horizon:"today",priority_score:0.92,confidence_score:0.91,reason_trace:["Client followed up 3× with no delivery date","Payment gateway down day 3","Milestone past due"],related_signal_types:["client_followup","execution_delay"],recommended_action:"Send confirmed delivery date today or formally push milestone to next sprint.",impact_area:"relationship"},
    {project:"Vertex",priority:"HIGH",decision_type:"demo_readiness",urgency_level:"high",time_horizon:"today",priority_score:0.78,confidence_score:0.84,reason_trace:["Sprint only 72% complete","Demo scheduled in 18h","No stakeholder sign-off received"],related_signal_types:["deadline_risk","sign_off_pending"],recommended_action:"Obtain sign-off now or reduce demo scope to confirmed features.",impact_area:"delivery"},
    {project:"Atlas",priority:"MEDIUM",decision_type:"legal_review",urgency_level:"medium",time_horizon:"this week",priority_score:0.55,confidence_score:0.76,reason_trace:["Legal review outstanding 4 days","Hard deadline in 5 days"],related_signal_types:["compliance","execution_delay"],recommended_action:"Escalate to legal team today.",impact_area:"compliance"},
  ],
  risks:[
    {title:"Nova — Payment gateway blocking 4 engineers",project:"Nova",description:"Payment API returning 500 errors for day 3.",impact:"Delivery may slip 2–3 days. 4 engineers fully blocked.",mitigation:"Investigate API logs or contact Stripe support today."},
    {title:"Vertex — Sprint 72% with demo in 18h",project:"Vertex",description:"Key features incomplete, demo scheduled tomorrow.",impact:"Feature gaps visible to client — demo credibility at risk.",mitigation:"Descope 3 features or fast-track remaining work tonight."},
  ],
  project_health:[
    {project:"Nova",  status:"Critical", reason:"Blocker day 3 + client pressure unanswered",health_score:38},
    {project:"Vertex",status:"At Risk",  reason:"Demo pressure + sign-off pending",          health_score:59},
    {project:"Atlas", status:"Watch",    reason:"Legal review outstanding",                  health_score:72},
    {project:"Orion", status:"Healthy",  reason:"Pipeline green, 9 commits merged today",    health_score:91},
  ],
  changes:[
    {type:"escalated", description:"Payment API returning 500 errors — Nova integration blocked."},
    {type:"new",       description:"Client follow-up #3 received — Nova delivery date unconfirmed."},
    {type:"progress",  description:"Data pipeline optimisation complete — Orion query time ↓40%."},
    {type:"dependency",description:"Atlas legal review outstanding 4 days — release blocked."},
  ],
  stable_summary:"Orion on track — no blockers, normal delivery cadence.",
  suppressed_note:"27 low-impact signals suppressed this cycle.",
  sample_id:"demo",
};

const TREND_SEED = [
  {d:'Mon',r:1,dec:2},{d:'Tue',r:2,dec:3},{d:'Wed',r:1,dec:1},
  {d:'Thu',r:3,dec:4},{d:'Fri',r:2,dec:3},{d:'Sat',r:1,dec:1},{d:'Sun',r:2,dec:3},
];

// ─── SVG TREND ────────────────────────────────────────────────────────────────
function SvgTrend({ data }) {
  const [hov, setHov] = useState(null);
  const W=540,H=100,P={t:6,r:6,b:22,l:24};
  const iw=W-P.l-P.r, ih=H-P.t-P.b;
  const mx = Math.max(...data.map(d=>Math.max(d.r,d.dec)),1);
  const xs = data.map((_,i)=>P.l+(i/(data.length-1))*iw);
  const yp = v => P.t+(1-Math.min(v/mx,1))*ih;
  const rPts = data.map((d,i)=>({x:xs[i],y:yp(d.r),v:d.r}));
  const dPts = data.map((d,i)=>({x:xs[i],y:yp(d.dec),v:d.dec}));
  const smooth = pts => {
    if(pts.length<2) return '';
    let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
    for(let i=1;i<pts.length;i++){
      const cx=(pts[i].x+pts[i-1].x)/2;
      d+=` C${cx},${pts[i-1].y.toFixed(1)} ${cx},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
    }
    return d;
  };
  const area = (pts,b) => smooth(pts)+` L${pts[pts.length-1].x.toFixed(1)},${b} L${pts[0].x.toFixed(1)},${b} Z`;
  const bot = P.t+ih;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{overflow:'visible',cursor:'crosshair'}}>
      <defs>
        <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ef4444" stopOpacity=".28"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="gD2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7c85f5" stopOpacity=".28"/>
          <stop offset="100%" stopColor="#7c85f5" stopOpacity="0"/>
        </linearGradient>
        <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {[0,Math.ceil(mx/2),mx].map((t,i)=>{
        const y=P.t+(1-t/mx)*ih;
        return <g key={i}>
          <line x1={P.l} y1={y} x2={W-P.r} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <text x={P.l-3} y={y+4} textAnchor="end" fontSize="8" fill="rgba(170,180,200,0.5)">{t}</text>
        </g>;
      })}
      {/* Glow */}
      <path d={area(rPts,bot)} fill="url(#gR2)" opacity=".6" filter="url(#blur2)"/>
      <path d={area(dPts,bot)} fill="url(#gD2)" opacity=".6" filter="url(#blur2)"/>
      {/* Fill */}
      <path d={area(rPts,bot)} fill="url(#gR2)"/>
      <path d={area(dPts,bot)} fill="url(#gD2)"/>
      {/* Lines */}
      <path d={smooth(rPts)} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
      <path d={smooth(dPts)} fill="none" stroke="#7c85f5" strokeWidth="2" strokeLinecap="round"/>
      {/* Interactive dots */}
      {rPts.map((p,i)=>(
        <g key={i} onMouseEnter={()=>setHov({...p,d:data[i].d,dec:dPts[i].v,idx:i})} onMouseLeave={()=>setHov(null)}>
          <circle cx={p.x} cy={p.y} r="6" fill="transparent"/>
          <circle cx={p.x} cy={p.y} r={hov?.idx===i ? 4 : 2.8} fill="#ef4444"
            style={{transition:'r .15s'}} stroke="var(--bg-card)" strokeWidth="1.5"/>
        </g>
      ))}
      {dPts.map((p,i)=>(
        <g key={i} onMouseEnter={()=>setHov({x:p.x,y:p.y,v:p.v,d:data[i].d,dec:p.v,r:rPts[i].v,idx:i})} onMouseLeave={()=>setHov(null)}>
          <circle cx={p.x} cy={p.y} r="6" fill="transparent"/>
          <circle cx={p.x} cy={p.y} r={hov?.idx===i ? 4 : 2.8} fill="#7c85f5"
            style={{transition:'r .15s'}} stroke="var(--bg-card)" strokeWidth="1.5"/>
        </g>
      ))}
      {/* Tooltip */}
      {hov&&(
        <g>
          <line x1={xs[hov.idx]} y1={P.t} x2={xs[hov.idx]} y2={bot} stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeDasharray="3,3"/>
          <rect x={Math.min(xs[hov.idx]-30,W-72)} y={P.t} width="66" height="38" rx="5" fill="var(--bg-elevated)" stroke="var(--border)"/>
          <text x={Math.min(xs[hov.idx]-30,W-72)+33} y={P.t+12} textAnchor="middle" fontSize="9" fill="rgba(170,180,200,.7)">{hov.d}</text>
          <circle cx={Math.min(xs[hov.idx]-30,W-72)+10} cy={P.t+23} r="3" fill="#ef4444"/>
          <text x={Math.min(xs[hov.idx]-30,W-72)+16} y={P.t+26} fontSize="9" fill="#f87171">{rPts[hov.idx].v}R</text>
          <circle cx={Math.min(xs[hov.idx]-30,W-72)+38} cy={P.t+23} r="3" fill="#7c85f5"/>
          <text x={Math.min(xs[hov.idx]-30,W-72)+44} y={P.t+26} fontSize="9" fill="#a5b4fc">{dPts[hov.idx].v}D</text>
        </g>
      )}
      {data.map((d,i)=>(
        <text key={i} x={xs[i]} y={H-3} textAnchor="middle" fontSize="8" fill="rgba(170,180,200,0.45)">{d.d}</text>
      ))}
    </svg>
  );
}

// ─── DONUT ────────────────────────────────────────────────────────────────────
function Donut({ segments, size=80, stroke=10, label }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r;
  const total=segments.reduce((s,x)=>s+x.value,0)||1;
  let off=0;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
        {segments.map((seg,i)=>{
          const dash=(seg.value/total)*circ;
          const el=<circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.color}
            strokeWidth={stroke} strokeDasharray={`${dash} ${circ-dash}`}
            strokeDashoffset={-off} strokeLinecap="butt"
            style={{filter:`drop-shadow(0 0 4px ${seg.color}55)`}}/>;
          off+=dash; return el;
        })}
      </svg>
      {label&&(
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
          alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',lineHeight:1}}>{label}</span>
          <span style={{fontSize:9,color:'var(--text-muted)',marginTop:1}}>avg</span>
        </div>
      )}
    </div>
  );
}

// ─── RADIAL SCORE ─────────────────────────────────────────────────────────────
function RadialScore({ score, size=44, project }) {
  const color = scoreColor(score);
  const r = (size-5)/2, circ = 2*Math.PI*r;
  const dash = (score/100)*circ;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 4px ${color}66)`,transition:'stroke-dasharray 1s ease'}}/>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:10,fontWeight:700,color,lineHeight:1}}>{score}</span>
      </div>
    </div>
  );
}

// ─── PULSE DOT ────────────────────────────────────────────────────────────────
function PulseDot({ color='#ef4444', size=7 }) {
  return (
    <span style={{position:'relative',display:'inline-flex',width:size,height:size,flexShrink:0}}>
      <span style={{position:'absolute',inset:0,borderRadius:'50%',background:color,opacity:.4,animation:'ping 1.7s cubic-bezier(0,0,.2,1) infinite'}}/>
      <span style={{width:size,height:size,borderRadius:'50%',background:color,display:'block'}}/>
    </span>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, color, icon: Icon, sub, urgent, delay=0 }) {
  return (
    <div className={`card fade-up`} style={{
      padding:'18px 20px',flex:1,minWidth:0,
      border:`1px solid ${urgent ? color+'40' : 'var(--border)'}`,
      boxShadow: urgent ? `var(--card-shadow),0 0 24px ${color}1a` : 'var(--card-shadow)',
      animationDelay:`${delay}s`,
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.11em'}}>{label}</span>
        <div style={{width:30,height:30,borderRadius:8,background:`${color}18`,
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:`0 0 12px ${color}20`}}>
          <Icon size={14} color={color}/>
        </div>
      </div>
      <div className="metric-num" style={{fontSize:34,fontWeight:800,color,letterSpacing:'-0.05em',lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'var(--text-muted)',marginTop:6,fontWeight:500}}>{sub}</div>}
    </div>
  );
}

// ─── AI BRIEFING ─────────────────────────────────────────────────────────────
function AiBriefing({ digest, updated, critCount }) {
  const decisions = safeArr(digest?.decisions);
  const risks     = safeArr(digest?.risks);
  const ph        = safeArr(digest?.project_health);
  const hCount    = {};
  ph.forEach(p => { hCount[p.status]=(hCount[p.status]||0)+1; });

  return (
    <div className="fade-up" style={{
      background:'linear-gradient(135deg,rgba(80,88,214,.12) 0%,rgba(124,133,245,.06) 60%,rgba(139,92,246,.04) 100%)',
      border:'1px solid var(--accent-border)',
      borderRadius:'var(--radius)',padding:'22px 26px',marginBottom:24,
      position:'relative',overflow:'hidden',
    }}>
      {/* Background orb */}
      <div style={{position:'absolute',top:-60,right:-60,width:260,height:260,
        background:'radial-gradient(circle,rgba(124,133,245,.1) 0%,transparent 70%)',
        pointerEvents:'none',borderRadius:'50%'}}/>
      <div style={{position:'absolute',bottom:-40,left:'30%',width:180,height:180,
        background:'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)',
        pointerEvents:'none',borderRadius:'50%'}}/>

      <div style={{display:'flex',alignItems:'flex-start',gap:16,position:'relative'}}>
        {/* Icon */}
        <div style={{width:40,height:40,borderRadius:12,
          background:'linear-gradient(135deg,rgba(124,133,245,.25),rgba(139,92,246,.15))',
          border:'1px solid rgba(124,133,245,.3)',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
          <Radio size={17} color="var(--accent)"/>
        </div>

        <div style={{flex:1,minWidth:0}}>
          {/* Header row */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
            <span style={{fontSize:9,color:'var(--accent)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.16em'}}>
              AI Situation Brief
            </span>
            {updated&&(
              <span style={{fontSize:10,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:'#10b981',animation:'pulse 2s ease-in-out infinite'}}/>
                {timeAgo(updated.toISOString())}
              </span>
            )}
            {/* Status chips */}
            {critCount>0&&(
              <span style={{display:'flex',alignItems:'center',gap:5,background:'rgba(239,68,68,.12)',
                border:'1px solid rgba(239,68,68,.28)',borderRadius:99,padding:'3px 10px',
                fontSize:10,color:'#f87171',fontWeight:700}}>
                <PulseDot color="#ef4444" size={6}/> {critCount} Critical
              </span>
            )}
            {digest?.suppressed_note&&(
              <span style={{fontSize:10,color:'var(--text-muted)',background:'var(--bg-elevated)',
                border:'1px solid var(--border)',borderRadius:99,padding:'3px 10px'}}>
                {digest.suppressed_note}
              </span>
            )}
          </div>

          {/* Summary text */}
          <p style={{fontSize:16,color:'var(--text-primary)',fontWeight:500,lineHeight:1.7,
            letterSpacing:'-0.02em',margin:'0 0 14px 0'}}>
            {digest?.summary || 'Monitoring active — digest will appear shortly.'}
          </p>

          {/* Quick stats row */}
          <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
            {[
              {label:'Decisions', val:decisions.length, color:'#f97316'},
              {label:'Risks',     val:risks.length,     color:'#ef4444'},
              {label:'Projects',  val:ph.length,        color:'var(--accent)'},
              {label:'Critical',  val:hCount['Critical']||0, color:'#ef4444'},
              {label:'At Risk',   val:hCount['At Risk']||0,  color:'#f97316'},
              {label:'Healthy',   val:hCount['Healthy']||0,  color:'#10b981'},
            ].filter(x=>x.val>0).map(({label,val,color})=>(
              <div key={label} style={{display:'flex',alignItems:'baseline',gap:4}}>
                <span style={{fontSize:18,fontWeight:800,color,letterSpacing:'-0.04em'}}>{val}</span>
                <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DECISION CARD ───────────────────────────────────────────────────────────
function DecisionCard({ raw, i }) {
  const [open, setOpen]           = useState(i === 0);
  const [traceOpen, setTraceOpen] = useState(false);
  const [acted, setActed]         = useState(false);

  const pri    = normalizePriority(raw);
  const ps     = PRI[pri] || PRI.HIGH;
  const title  = buildTitle(raw, i);
  const desc   = buildDesc(raw);
  const traces = safeArr(raw.reason_trace);
  const restTraces = desc === traces[0] ? traces.slice(1) : traces;
  const action = buildAction(raw);
  const impact = impactFromArea(raw);
  const conf   = raw.confidence_score || raw.priority_score || 0;
  const urgency= raw.urgency_level || '';
  const horizon= raw.time_horizon || '';
  const signals= safeArr(raw.related_signal_types);
  const dtype  = raw.decision_type || '';
  const confPct= Math.round(conf * 100);

  return (
    <div
      className={`card fade-up ${pri==='CRITICAL'?'decision-critical':''}`}
      style={{
        overflow:'hidden',
        border:`1px solid ${open ? ps.border : 'var(--border)'}`,
        boxShadow: pri==='CRITICAL' ? `var(--card-shadow),${ps.glow}` : 'var(--card-shadow)',
        animationDelay:`${i*.07}s`,
        opacity: acted ? 0.5 : 1,
        transition:'opacity .4s,border-color .2s,box-shadow .2s,transform .2s',
      }}>
      {/* Top accent bar */}
      <div style={{height:3,background:`linear-gradient(90deg,${ps.bar},${ps.bar}88)`}}/>

      {/* Header — always visible, clickable */}
      <div onClick={()=>setOpen(o=>!o)}
        style={{padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:10,
          background: open ? `${ps.bg.replace(/\)$/,',0.3)')}` : 'transparent',
          transition:'background .2s'}}>

        <div style={{marginTop:4,flexShrink:0}}>
          {pri==='CRITICAL'
            ? <PulseDot color={ps.bar} size={9}/>
            : <div style={{width:9,height:9,borderRadius:'50%',background:ps.bar,
                boxShadow:`0 0 8px ${ps.bar}80`}}/>}
        </div>

        <div style={{flex:1,minWidth:0}}>
          {/* Badges row */}
          <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap',marginBottom:5}}>
            <span style={{...BADGE,...ps.badge}}>{pri}</span>
            {dtype&&<span className="tag" style={{background:'var(--bg-hover)',color:'var(--text-muted)',border:'1px solid var(--border)'}}>{fmtType(dtype)}</span>}
            {urgency&&<span className="tag" style={{color:URG[urgency.toLowerCase()]||'var(--text-muted)',background:'var(--bg-hover)',border:`1px solid ${URG[urgency.toLowerCase()]||'var(--border)'}28`}}>{urgency}</span>}
            {horizon&&<span className="tag" style={{color:'var(--accent)',background:'var(--accent-soft)',border:'1px solid var(--accent-border)'}}>⏱ {horizon}</span>}
            {raw.project&&<span className="tag" style={{color:'var(--text-secondary)',background:'var(--bg-hover)',border:'1px solid var(--border)'}}>{raw.project}</span>}
          </div>

          {/* Title */}
          <span style={{fontSize:14,fontWeight:700,color:'var(--text-primary)',
            letterSpacing:'-0.015em',lineHeight:1.4,display:'block'}}>{title}</span>

          {/* Confidence bar */}
          {confPct>0&&(
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
              <div style={{flex:1,height:2,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${confPct}%`,background:ps.bar,borderRadius:99,
                  transition:'width 1.2s ease',boxShadow:`0 0 5px ${ps.bar}50`}}/>
              </div>
              <span style={{fontSize:9,color:'var(--text-muted)',fontWeight:600,minWidth:42,flexShrink:0}}>
                {confPct}% conf
              </span>
            </div>
          )}
        </div>

        <div style={{color:'var(--text-muted)',marginTop:4,flexShrink:0,
          transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}>
          <ChevronDown size={14}/>
        </div>
      </div>

      {/* Expanded body */}
      {open&&(
        <div style={{padding:'0 18px 18px',borderTop:`1px solid ${ps.border}`}}>
          {/* Description */}
          {desc&&(
            <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.72,
              margin:'14px 0 12px',padding:'10px 14px',
              background:'var(--bg-elevated)',borderRadius:8,
              borderLeft:`2px solid ${ps.left}`}}>
              {desc}
            </p>
          )}

          {/* Signal tags */}
          {signals.length>0&&(
            <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
              {signals.map((s,j)=>(
                <span key={j} className="tag" style={{background:'var(--bg-elevated)',
                  color:'var(--text-muted)',border:'1px solid var(--border)'}}>
                  {s.replace(/_/g,' ')}
                </span>
              ))}
            </div>
          )}

          {/* Impact + Action block */}
          <div style={{background:ps.bg,borderLeft:`3px solid ${ps.left}`,
            padding:'13px 15px',borderRadius:'0 10px 10px 0',marginBottom:12}}>
            {impact&&(
              <div style={{marginBottom:11}}>
                <span style={{fontSize:9,fontWeight:800,color:ps.color,textTransform:'uppercase',
                  letterSpacing:'0.12em',display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
                  <Flame size={9}/> Impact
                </span>
                <span style={{fontSize:13,color:ps.color,lineHeight:1.6}}>{impact}</span>
              </div>
            )}
            <div style={{paddingTop:impact?11:0,borderTop:impact?`1px solid rgba(255,255,255,.06)`:'none'}}>
              <span style={{fontSize:9,fontWeight:800,color:ps.color,textTransform:'uppercase',
                letterSpacing:'0.12em',display:'flex',alignItems:'center',gap:5,marginBottom:5}}>
                <ArrowRight size={9}/> Recommended Action
              </span>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
                <span style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.65,flex:1}}>
                  {action}
                </span>
                <button
                  onClick={e=>{e.stopPropagation();setActed(true);}}
                  style={{flexShrink:0,height:28,padding:'0 10px',borderRadius:6,
                    background:ps.bar,border:'none',color:'white',
                    fontSize:10,fontWeight:700,cursor:'pointer',
                    display:'flex',alignItems:'center',gap:4,
                    opacity:acted?0.4:1,transition:'opacity .3s',
                    boxShadow:`0 0 10px ${ps.bar}50`}}>
                  {acted?<CheckCircle2 size={10}/>:<ArrowRight size={10}/>}
                  {acted?'Noted':'Act'}
                </button>
              </div>
            </div>
          </div>

          {/* Reason trace */}
          {restTraces.length>0&&(
            <div>
              <button onClick={e=>{e.stopPropagation();setTraceOpen(o=>!o);}}
                style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',
                  color:'var(--text-muted)',fontSize:10,cursor:'pointer',padding:'2px 0',fontFamily:'inherit'}}>
                <Info size={10}/> Why this decision?
                <ChevronDown size={10} style={{transform:traceOpen?'rotate(180deg)':'none',transition:'transform .2s'}}/>
              </button>
              {traceOpen&&(
                <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:5,
                  background:'var(--bg-elevated)',borderRadius:8,padding:'10px 12px'}}>
                  {restTraces.map((t,j)=>(
                    <div key={j} style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                      <span style={{fontSize:11,color:ps.color,marginTop:1,flexShrink:0}}>›</span>
                      <span style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.6}}>{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RISK CARD ───────────────────────────────────────────────────────────────
function RiskCard({ r, i }) {
  const title  = r.title || r.name || `Risk ${i+1}`;
  const desc   = r.description || r.context || '';
  const impact = r.impact || r.consequence || '';
  const action = r.action || r.mitigation  || 'Investigate immediately.';
  const proj   = r.project || '';
  return (
    <div className="card fade-up" style={{
      overflow:'hidden',
      border:'1px solid rgba(239,68,68,.22)',
      boxShadow:'var(--card-shadow),0 0 20px rgba(239,68,68,.1)',
      animationDelay:`${i*.08}s`,
    }}>
      <div style={{height:3,background:'linear-gradient(90deg,#ef4444,#dc2626aa)'}}/>
      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <div style={{width:26,height:26,borderRadius:7,background:'rgba(239,68,68,.12)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <AlertTriangle size={12} color="#ef4444"/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',
            letterSpacing:'-0.015em',flex:1,lineHeight:1.3}}>{title}</span>
          {proj&&<span className="tag" style={{background:'var(--bg-elevated)',
            color:'var(--text-muted)',border:'1px solid var(--border)'}}>{proj}</span>}
        </div>

        {desc&&(
          <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.7,
            marginBottom:10,padding:'8px 12px',
            background:'var(--bg-elevated)',borderRadius:7,
            borderLeft:'2px solid rgba(239,68,68,.4)'}}>{desc}</p>
        )}

        <div style={{background:'rgba(239,68,68,.07)',borderLeft:'3px solid rgba(239,68,68,.45)',
          padding:'11px 14px',borderRadius:'0 9px 9px 0'}}>
          {impact&&(
            <div style={{marginBottom:9}}>
              <span style={{fontSize:9,fontWeight:800,color:'#f87171',textTransform:'uppercase',
                letterSpacing:'0.12em',display:'block',marginBottom:3}}>Impact</span>
              <span style={{fontSize:12,color:'#fca5a5',lineHeight:1.65}}>{impact}</span>
            </div>
          )}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,
            paddingTop:impact?9:0,borderTop:impact?'1px solid rgba(239,68,68,.14)':'none'}}>
            <div style={{flex:1}}>
              <span style={{fontSize:9,fontWeight:800,color:'#f87171',textTransform:'uppercase',
                letterSpacing:'0.12em',display:'block',marginBottom:3}}>Mitigation</span>
              <span style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.65}}>{action}</span>
            </div>
            <button style={{width:30,height:30,borderRadius:7,background:'rgba(239,68,68,.12)',
              border:'1px solid rgba(239,68,68,.28)',color:'#f87171',display:'flex',
              alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,
              boxShadow:'0 0 10px rgba(239,68,68,.15)'}}>
              <Zap size={12}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROJECT HEALTH CARD ─────────────────────────────────────────────────────
function HealthCard({ p, i }) {
  const [hov, setHov] = useState(false);
  const hs    = HS[p.status] || HS.Healthy;
  const score = deriveScore(p, i);
  const color = scoreColor(score);
  return (
    <div className="fade-up" style={{
      background: hov ? hs.bg : 'transparent',
      border:`1px solid ${hov ? hs.border : 'var(--border)'}`,
      borderRadius:10,padding:'11px 13px',
      transition:'all .2s',cursor:'default',
      animationDelay:`${i*.06}s`,
    }}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <RadialScore score={score}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--text-primary)',
              letterSpacing:'-0.01em'}}>{p.project}</span>
            <span style={{fontSize:9,fontWeight:700,textTransform:'uppercase',
              letterSpacing:'0.09em',color:hs.text}}>{p.status}</span>
          </div>
          {p.reason&&<p style={{fontSize:11,color:'var(--text-muted)',lineHeight:1.5,margin:0}}>{p.reason}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── PROJECT SCORE TABLE ──────────────────────────────────────────────────────
function ScoreTable({ ph }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{borderBottom:'1px solid var(--border)'}}>
            {['Project','Status','Score','Trend'].map(h=>(
              <th key={h} style={{textAlign:'left',fontSize:9,fontWeight:700,color:'var(--text-muted)',
                textTransform:'uppercase',letterSpacing:'0.1em',padding:'0 8px 8px 0'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ph.map((p,i)=>{
            const score = deriveScore(p,i);
            const hs    = HS[p.status]||HS.Healthy;
            const color = scoreColor(score);
            return (
              <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'9px 8px 9px 0',fontSize:12,fontWeight:600,color:'var(--text-primary)'}}>{p.project}</td>
                <td style={{padding:'9px 8px 9px 0'}}>
                  <span style={{fontSize:9,fontWeight:700,color:hs.text,background:hs.bg,
                    border:`1px solid ${hs.border}`,borderRadius:4,padding:'2px 6px',
                    textTransform:'uppercase',letterSpacing:'0.08em'}}>{p.status}</span>
                </td>
                <td style={{padding:'9px 8px 9px 0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:56,height:4,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${score}%`,background:color,
                        borderRadius:99,boxShadow:`0 0 5px ${color}50`,transition:'width 1s ease'}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color,minWidth:26}}>{score}%</span>
                  </div>
                </td>
                <td style={{padding:'9px 0'}}>
                  {score >= 80
                    ? <span style={{fontSize:10,color:'#10b981'}}>↑ Stable</span>
                    : score >= 60
                    ? <span style={{fontSize:10,color:'#eab308'}}>→ Watch</span>
                    : <span style={{fontSize:10,color:'#ef4444'}}>↓ At Risk</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── CHANGE ITEM ─────────────────────────────────────────────────────────────
function ChangeItem({ c, i }) {
  const label = typeof c==='object' ? c.type||c.category||'update' : 'update';
  const text  = typeof c==='string' ? c : c.description||c.summary||c.text||'';
  const color = CH[label.toLowerCase()] || 'var(--accent)';
  return (
    <div className="fade-up" style={{paddingTop:i>0?10:0,marginTop:i>0?10:0,
      borderTop:i>0?'1px solid var(--border)':'none',animationDelay:`${i*.05}s`,
      display:'flex',gap:10,alignItems:'flex-start'}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:color,
        flexShrink:0,marginTop:5,boxShadow:`0 0 6px ${color}80`}}/>
      <div>
        <span style={{fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',
          color,display:'block',marginBottom:2}}>{label}</span>
        <p style={{fontSize:12,color:'var(--text-secondary)',lineHeight:1.65,margin:0}}>{text}</p>
      </div>
    </div>
  );
}

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
function SH({ icon: Icon, color, children, right, delay=0 }) {
  return (
    <h2 className="fade-up" style={{fontSize:10,fontWeight:800,color:'var(--text-muted)',
      textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:14,
      paddingBottom:10,borderBottom:'1px solid var(--border)',
      display:'flex',alignItems:'center',gap:7,animationDelay:`${delay}s`}}>
      <Icon size={10} color={color}/>{children}
      {right&&<span style={{marginLeft:'auto',fontSize:10,fontWeight:400,textTransform:'none',
        letterSpacing:'normal',color:'var(--text-muted)'}}>{right}</span>}
    </h2>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'Inter,sans-serif',padding:'80px 24px 0'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div className="skel" style={{height:100,borderRadius:14,marginBottom:24}}/>
        <div style={{display:'flex',gap:10,marginBottom:24}}>
          {[1,2,3,4].map(k=><div key={k} className="skel" style={{height:88,flex:1,borderRadius:14}}/>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24}}>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {[130,110,90,110].map((h,k)=><div key={k} className="skel" style={{height:h,borderRadius:14}}/>)}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="skel" style={{height:250,borderRadius:14}}/>
            <div className="skel" style={{height:140,borderRadius:14}}/>
            <div className="skel" style={{height:120,borderRadius:14}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate   = useNavigate();
  const [digest,   setDigest  ] = useState(null);
  const [loading,  setLoading ] = useState(true);
  const [updated,  setUpdated ] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [isDemo,   setIsDemo  ] = useState(false);
  const [theme,    setTheme   ] = useState(()=>{ try{return localStorage.getItem('operis-theme')||'dark';}catch{return 'dark';} });

  useEffect(()=>{
    const id='operis-css-v4';
    if(!document.getElementById(id)){const s=document.createElement('style');s.id=id;s.textContent=CSS;document.head.appendChild(s);}
  },[]);

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme==='light'?'light':'');
  },[theme]);

  const toggleTheme = ()=>{
    const n=theme==='dark'?'light':'dark';setTheme(n);
    try{localStorage.setItem('operis-theme',n);}catch{}
  };

  const load = useCallback(async(manual=false)=>{
    if(manual) setSpinning(true);
    try{
      const [dRes,hRes] = await Promise.allSettled([
        fetch(`${API}/digest/latest`),
        fetch(`${API}/health/latest`),
      ]);
      let d=null, h=[];
      if(dRes.status==='fulfilled'&&dRes.value.ok) d=await dRes.value.json();
      if(hRes.status==='fulfilled'&&hRes.value.ok){const r=await hRes.value.json();h=Array.isArray(r)?r:[];}
      if(d&&!d.error&&!d.detail){
        const hMap={};
        h.forEach(p=>{hMap[p.project]=p;});
        if(d.project_health)
          d.project_health=d.project_health.map(p=>({...p,...(hMap[p.project]||{})}));
        setDigest(d);setIsDemo(false);
      } else {
        setDigest(DEMO);setIsDemo(true);
      }
      setUpdated(new Date());
    } catch {
      setDigest(DEMO);setIsDemo(true);setUpdated(new Date());
    } finally {
      setLoading(false);setSpinning(false);
    }
  },[]);

  useEffect(()=>{load();const t=setInterval(load,POLL);return()=>clearInterval(t);},[load]);

  if(loading) return <Skeleton/>;

  const decisions = safeArr(digest?.decisions);
  const risks     = safeArr(digest?.risks);
  const changes   = safeArr(digest?.changes);
  const ph        = safeArr(digest?.project_health);

  // Normalise all decisions
  const normDec = decisions.map(d=>({...d,_priority:normalizePriority(d)}));
  const sorted  = [...normDec].sort((a,b)=>{
    const o={CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3};
    return (o[a._priority]??2)-(o[b._priority]??2);
  });

  // Decision priority counts — use normalised priority
  const pCount = {
    CRITICAL: normDec.filter(d=>d._priority==='CRITICAL').length,
    HIGH:     normDec.filter(d=>d._priority==='HIGH').length,
    MEDIUM:   normDec.filter(d=>d._priority==='MEDIUM').length,
  };

  const hCount={};
  ph.forEach(p=>{hCount[p.status]=(hCount[p.status]||0)+1;});

  const donut = Object.entries(HCOLORS)
    .filter(([k])=>hCount[k])
    .map(([k,color])=>({value:hCount[k],color}));

  const critCount = hCount['Critical']||0;
  const atRisk    = hCount['At Risk']||0;
  const avgScore  = ph.length
    ? Math.round(ph.reduce((a,p,i)=>a+deriveScore(p,i),0)/ph.length)
    : 0;

  const trendData = TREND_SEED.map((t,i)=>({
    ...t,
    r:   i===TREND_SEED.length-1 ? risks.length     : t.r,
    dec: i===TREND_SEED.length-1 ? decisions.length : t.dec,
  }));

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text-secondary)',
      fontFamily:"'Inter',-apple-system,sans-serif"}}>

      {/* ── NAV ── */}
      <nav style={{borderBottom:'1px solid var(--border)',background:'var(--nav-bg)',
        backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',
        position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px',height:58,
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>

          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <button className="btn-ghost" onClick={()=>navigate('/login')}
              style={{padding:'5px 10px'}}>
              <ArrowLeft size={11}/> Back
            </button>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:28,height:28,borderRadius:8,
                background:'linear-gradient(135deg,#5058d6 0%,#8b5cf6 100%)',
                display:'flex',alignItems:'center',justifyContent:'center',
                boxShadow:'0 0 14px rgba(124,133,245,.4)'}}>
                <Activity size={14} color="white" strokeWidth={2.5}/>
              </div>
              <span style={{fontWeight:800,fontSize:15,color:'var(--text-primary)',letterSpacing:'-0.03em'}}>Operis</span>
              {isDemo&&<span className="tag" style={{color:'#fb923c',background:'rgba(249,115,22,.12)',border:'1px solid rgba(249,115,22,.25)'}}>DEMO</span>}
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {(critCount>0||atRisk>0)&&(
              <div style={{display:'flex',alignItems:'center',gap:6,
                background:'rgba(239,68,68,.09)',border:'1px solid rgba(239,68,68,.22)',
                borderRadius:8,padding:'5px 11px'}}>
                <PulseDot color="#ef4444" size={6}/>
                <span style={{fontSize:11,color:'#fca5a5',fontWeight:700}}>
                  {critCount>0 ? `${critCount} Critical` : `${atRisk} At Risk`}
                </span>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--text-muted)',
              background:'var(--bg-elevated)',border:'1px solid var(--border)',
              borderRadius:7,padding:'4px 10px'}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:'#10b981',
                animation:'pulse 2s ease-in-out infinite'}}/>
              {updated?updated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'Live'}
            </div>
            <button className="btn-ghost" onClick={()=>load(true)} style={{width:32,height:32,padding:0}}>
              <RefreshCw size={13} style={{animation:spinning?'spin .7s linear infinite':'none'}}/>
            </button>
            <button className="btn-ghost" onClick={toggleTheme} style={{width:32,height:32,padding:0}}>
              {theme==='dark'?<Sun size={13}/>:<Moon size={13}/>}
            </button>
          </div>
        </div>
      </nav>

      <main style={{maxWidth:1100,margin:'0 auto',padding:'28px 24px 80px'}}>

        {/* ── AI BRIEFING ── */}
        <AiBriefing digest={digest} updated={updated} critCount={critCount}/>

        {/* ── METRICS ROW ── */}
        <div className="metrics-row" style={{display:'flex',gap:10,marginBottom:24}}>
          <MetricCard label="Decisions"    value={decisions.length} color="#f97316"       icon={GitPullRequest} urgent={decisions.length>0} delay={0}   sub={`${pCount.CRITICAL} critical · ${pCount.HIGH} high`}/>
          <MetricCard label="Active Risks" value={risks.length}     color="#ef4444"       icon={AlertTriangle}  urgent={risks.length>0}     delay={.05} sub="Require mitigation"/>
          <MetricCard label="Projects"     value={ph.length}        color="var(--accent)" icon={Layers}                                     delay={.1}  sub={`${hCount['Healthy']||0} healthy`}/>
          <MetricCard label="Avg Health"   value={`${avgScore}%`}   color={scoreColor(avgScore)} icon={Shield}                             delay={.15} sub="Portfolio score"/>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="main-grid" style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24,alignItems:'start'}}>

          {/* ── LEFT ── */}
          <div style={{display:'flex',flexDirection:'column',gap:28}}>

            {/* Decisions */}
            {sorted.length>0&&(
              <section>
                <SH icon={GitPullRequest} color="#f97316" right="click card to expand" delay={.1}>
                  Decisions Required
                </SH>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {sorted.map((d,i)=><DecisionCard key={i} raw={d} i={i}/>)}
                </div>
              </section>
            )}

            {/* Risks */}
            {risks.length>0&&(
              <section>
                <SH icon={AlertTriangle} color="#ef4444" delay={.15}>Risks Detected</SH>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {risks.map((r,i)=><RiskCard key={i} r={r} i={i}/>)}
                </div>
              </section>
            )}

            {/* Empty */}
            {decisions.length===0&&risks.length===0&&(
              <div className="card fade-up" style={{padding:48,textAlign:'center'}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(16,185,129,.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',
                  boxShadow:'0 0 20px rgba(16,185,129,.2)'}}>
                  <CheckCircle2 size={24} color="#10b981"/>
                </div>
                <p style={{color:'var(--text-primary)',fontSize:15,fontWeight:700,marginBottom:5}}>All clear</p>
                <p style={{color:'var(--text-muted)',fontSize:12,margin:0}}>No decisions or risks this cycle.</p>
              </div>
            )}

            {/* Project score table */}
            {ph.length>0&&(
              <section>
                <SH icon={Eye} color="var(--accent)" delay={.2}>Project Health Scorecard</SH>
                <div className="card" style={{padding:'16px 20px'}}>
                  <ScoreTable ph={ph}/>
                </div>
              </section>
            )}

            {/* Trend chart */}
            <section>
              <SH icon={BarChart2} color="var(--accent)" delay={.25}>7-Day Trend</SH>
              <div className="card" style={{padding:'18px 18px 12px'}}>
                <SvgTrend data={trendData}/>
                <div style={{display:'flex',gap:20,marginTop:10}}>
                  {[['#ef4444','Risks'],['#7c85f5','Decisions']].map(([c,l])=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{width:14,height:2.5,background:c,borderRadius:2,
                        boxShadow:`0 0 6px ${c}80`}}/>
                      <span style={{fontSize:10,color:'var(--text-muted)',fontWeight:500}}>{l}</span>
                    </div>
                  ))}
                  <span style={{fontSize:10,color:'var(--text-muted)',marginLeft:'auto'}}>hover dots for values</span>
                </div>
              </div>
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>

            {/* Portfolio Donut */}
            {ph.length>0&&(
              <div className="card fade-up" style={{padding:'18px'}}>
                <h3 style={{fontSize:10,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',
                  letterSpacing:'0.15em',marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
                  <Shield size={10} color="var(--accent)"/> Portfolio Health
                </h3>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
                  <Donut segments={donut.length?donut:[{value:1,color:'var(--border)'}]} label={`${avgScore}%`}/>
                  <div style={{flex:1}}>
                    {Object.entries(HCOLORS).map(([status,color])=>{
                      const count=hCount[status]||0;
                      if(!count) return null;
                      return (
                        <div key={status} style={{display:'flex',justifyContent:'space-between',
                          marginBottom:6,alignItems:'center'}}>
                          <span style={{fontSize:11,color:'var(--text-secondary)',
                            display:'flex',alignItems:'center',gap:5}}>
                            <span style={{width:5,height:5,borderRadius:'50%',background:color,
                              boxShadow:`0 0 5px ${color}80`}}/>{status}
                          </span>
                          <span style={{fontSize:12,fontWeight:700,color}}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  {ph.map((p,i)=><HealthCard key={i} p={p} i={i}/>)}
                </div>
              </div>
            )}

            {/* Decision Priority — uses normDec for correct counts */}
            {normDec.length>0&&(
              <div className="card fade-up" style={{padding:'18px'}}>
                <h3 style={{fontSize:10,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',
                  letterSpacing:'0.15em',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
                  <ListChecks size={10} color="var(--accent)"/> Decision Priority
                </h3>
                {[['Critical','CRITICAL','#ef4444'],['High','HIGH','#f97316'],['Medium','MEDIUM','#eab308']].map(([l,k,c])=>(
                  <div key={k} style={{marginBottom:11}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:11,color:'var(--text-secondary)',fontWeight:500}}>{l}</span>
                      <span style={{fontSize:12,color:c,fontWeight:800}}>{pCount[k]}</span>
                    </div>
                    <div className="progress-bar" style={{height:5,borderRadius:99,background:'var(--border)',overflow:'hidden'}}>
                      <div style={{
                        height:'100%',
                        '--bar-w':`${(pCount[k]/(normDec.length||1))*100}%`,
                        width:`${(pCount[k]/(normDec.length||1))*100}%`,
                        background:`linear-gradient(90deg,${c},${c}aa)`,
                        borderRadius:99,transition:'width 1s ease',
                        boxShadow:`0 0 8px ${c}60`
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stable note */}
            {digest?.stable_summary&&(
              <div className="fade-up" style={{background:'rgba(16,185,129,.07)',
                border:'1px solid rgba(16,185,129,.18)',
                borderRadius:'var(--radius)',padding:'14px 16px',
                display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{width:26,height:26,borderRadius:7,background:'rgba(16,185,129,.12)',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <CheckCircle2 size={12} color="#10b981"/>
                </div>
                <div>
                  <div style={{fontSize:9,color:'#10b981',fontWeight:800,letterSpacing:'0.12em',
                    textTransform:'uppercase',marginBottom:4}}>Stable</div>
                  <p style={{fontSize:12,color:'#86efac',lineHeight:1.65,margin:0}}>{digest.stable_summary}</p>
                </div>
              </div>
            )}

            {/* Change log */}
            <div className="card fade-up" style={{padding:'18px'}}>
              <h3 style={{fontSize:10,fontWeight:800,color:'var(--text-muted)',textTransform:'uppercase',
                letterSpacing:'0.15em',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
                <Clock size={10} color="var(--accent)"/> Change Log
              </h3>
              {changes.length>0
                ? changes.map((c,i)=><ChangeItem key={i} c={c} i={i}/>)
                : <p style={{fontSize:12,color:'var(--text-muted)',margin:0}}>
                    {digest?.changes_summary||'No changes recorded yet.'}
                  </p>
              }
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{marginTop:40,paddingTop:16,borderTop:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>
            Operis v4 · Groq llama-3.3-70b · 30min cycle
            {digest?.suppressed_note && ` · ${digest.suppressed_note}`}
          </span>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>
            {digest?.sample_id&&`${digest.sample_id} · `}{API}
          </span>
        </div>
      </main>
    </div>
  );
}