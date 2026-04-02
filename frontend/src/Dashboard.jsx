// Operis Dashboard — v6
// src/pages/Dashboard.jsx
// npm install recharts lucide-react

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, AlertTriangle, GitPullRequest, Clock, ArrowRight,
  CheckCircle2, ArrowLeft, Sun, Moon, RefreshCw, Shield,
  BarChart2, ChevronDown, Zap, Radio, ListChecks, Layers,
  TrendingUp, Info, Eye, Flame, TrendingDown, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const API  = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const POLL = 30_000;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  :root {
    --bg:        #0a0d14;
    --bg-card:   #0f1420;
    --bg-raised: #141926;
    --bg-hover:  #1a2030;
    --border:    rgba(255,255,255,0.06);
    --border-md: rgba(255,255,255,0.10);
    --text-1:    #e2e8f5;
    --text-2:    #8892a4;
    --text-3:    #4a5568;
    --accent:    #5b8dee;
    --accent-bg: rgba(91,141,238,0.08);
    --accent-bd: rgba(91,141,238,0.20);

    --c-crit:    #d44f4f;  --c-crit-bg:  rgba(212,79,79,0.07);   --c-crit-bd:  rgba(212,79,79,0.18);
    --c-high:    #c47a3a;  --c-high-bg:  rgba(196,122,58,0.07);  --c-high-bd:  rgba(196,122,58,0.18);
    --c-med:     #b8993a;  --c-med-bg:   rgba(184,153,58,0.07);  --c-med-bd:   rgba(184,153,58,0.18);
    --c-low:     #3d9e72;  --c-low-bg:   rgba(61,158,114,0.07);  --c-low-bd:   rgba(61,158,114,0.18);

    --radius: 12px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
  }

  [data-theme="light"] {
    --bg:        #f4f6fb;
    --bg-card:   #ffffff;
    --bg-raised: #f0f2f9;
    --bg-hover:  #e8ecf5;
    --border:    rgba(0,0,0,0.07);
    --border-md: rgba(0,0,0,0.12);
    --text-1:    #0d1117;
    --text-2:    #4a5568;
    --text-3:    #9aa3b5;
    --accent:    #2563eb;
    --accent-bg: rgba(37,99,235,0.06);
    --accent-bd: rgba(37,99,235,0.18);
    --c-crit:    #b83232;  --c-crit-bg: rgba(184,50,50,0.05);  --c-crit-bd: rgba(184,50,50,0.15);
    --c-high:    #a55e20;  --c-high-bg: rgba(165,94,32,0.05);  --c-high-bd: rgba(165,94,32,0.15);
    --c-med:     #8a6c10;  --c-med-bg:  rgba(138,108,16,0.05); --c-med-bd:  rgba(138,108,16,0.15);
    --c-low:     #1f7a52;  --c-low-bg:  rgba(31,122,82,0.05);  --c-low-bd:  rgba(31,122,82,0.15);
    --shadow: 0 2px 12px rgba(0,0,0,0.08);
  }

  body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text-2); }
  ::-webkit-scrollbar { width: 4px }
  ::-webkit-scrollbar-track { background: transparent }
  ::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 4px }

  @keyframes fadeUp    { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
  @keyframes spin      { to { transform: rotate(360deg) } }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes ping      { 75%,100%{transform:scale(2.2);opacity:0} }
  @keyframes shimmer   { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes countUp   { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes borderPulse { 0%,100%{border-color:var(--c-crit-bd)} 50%{border-color:rgba(212,79,79,0.4)} }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(52px) rotate(0deg) }
    to   { transform: rotate(360deg) translateX(52px) rotate(-360deg) }
  }
  @keyframes orbit2 {
    from { transform: rotate(180deg) translateX(38px) rotate(-180deg) }
    to   { transform: rotate(540deg) translateX(38px) rotate(-540deg) }
  }
  @keyframes orbit3 {
    from { transform: rotate(90deg) translateX(68px) rotate(-90deg) }
    to   { transform: rotate(450deg) translateX(68px) rotate(-450deg) }
  }
  @keyframes floatText { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
  @keyframes scanline { from { transform: translateY(-100%) } to { transform: translateY(400%) } }
  @keyframes glowPulse { 0%,100% { opacity:0.4; transform:scale(1) } 50% { opacity:0.8; transform:scale(1.08) } }
  @keyframes waveform { 0%,100% { transform: scaleY(0.3) } 50% { transform: scaleY(1) } }

  .fade-up { animation: fadeUp  .3s cubic-bezier(.22,1,.36,1) both }
  .fade-in { animation: fadeIn  .25s ease both }
  .skel {
    background: linear-gradient(90deg, var(--bg-raised) 25%, var(--bg-hover) 50%, var(--bg-raised) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 8px;
  }
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    transition: border-color .2s, transform .2s, box-shadow .2s;
  }
  .card:hover { border-color: var(--border-md) }
  .btn {
    background: transparent; border: 1px solid var(--border); color: var(--text-3);
    border-radius: 8px; cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 5px; font-family: inherit; font-size: 12px;
    transition: all .18s;
  }
  .btn:hover { color: var(--text-1); border-color: var(--border-md); background: var(--bg-raised) }
  .btn:active { transform: scale(.97) }
  .tag {
    display: inline-flex; align-items: center; gap: 3px;
    border-radius: 4px; font-size: 9px; font-weight: 700;
    padding: 2px 6px; text-transform: uppercase; letter-spacing: .08em;
  }
  .crit-border { animation: borderPulse 2.5s ease-in-out infinite }
  .metric-in   { animation: countUp .4s cubic-bezier(.34,1.56,.64,1) both }

  @media(max-width:768px) {
    .grid-main { grid-template-columns: 1fr !important }
    .metrics-row { flex-wrap: wrap }
    .metrics-row > * { min-width: calc(50% - 5px) }
  }
`;

const safeArr = v => { if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v) } catch { return [] } };
const timeAgo = d => { if (!d) return ''; const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return `${~~s}s ago`; if (s < 3600) return `${~~(s / 60)}m ago`; return `${~~(s / 3600)}h ago` };
const fmtType = s => s ? s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
const scoreHex = s => s >= 80 ? '#3d9e72' : s >= 60 ? '#b8993a' : s >= 40 ? '#c47a3a' : '#d44f4f';

function normPri(d) {
  if (d.priority && typeof d.priority === 'string') {
    const p = d.priority.toUpperCase();
    if (['CRITICAL','HIGH','MEDIUM','LOW'].includes(p)) return p;
  }
  if (d.urgency_level) {
    const u = d.urgency_level.toLowerCase();
    if (u === 'critical') return 'CRITICAL';
    if (u === 'high') return 'HIGH';
    if (u === 'medium') return 'MEDIUM';
  }
  if (typeof d.priority_score === 'number') {
    if (d.priority_score >= 0.85) return 'CRITICAL';
    if (d.priority_score >= 0.65) return 'HIGH';
    if (d.priority_score >= 0.40) return 'MEDIUM';
    return 'LOW';
  }
  return 'HIGH';
}
function bTitle(d, i) {
  if (d.title && d.title !== `Decision ${i+1}`) return d.title;
  if (d.name) return d.name;
  const proj = d.project ? `${d.project} — ` : '';
  const dt = d.decision_type ? d.decision_type.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : `Decision ${i+1}`;
  return `${proj}${dt}`;
}
function bDesc(d) {
  const t = safeArr(d.reason_trace);
  return d.description || d.context || (t.length ? t[0] : '');
}
function bAction(d) { return d.recommended_action || d.action || d.recommendation || 'Review and decide.' }
function bImpact(d) {
  if (d.impact) return d.impact;
  if (d.consequence) return d.consequence;
  const area = (d.impact_area || '').toLowerCase();
  const map = { relationship:'Client trust at risk', delivery:'Timeline may slip', revenue:'Revenue at risk', technical:'Engineering blocked', scope:'Scope/cost affected', compliance:'Compliance risk rising', team:'Team velocity impacted' };
  return map[area] || (area ? `${area} impact` : '');
}
function deriveScore(p, i) {
  if (typeof p.health_score === 'number') return p.health_score;
  const seed = (p.project || '').charCodeAt(0) % 8;
  const base = { Critical: 32, 'At Risk': 54, Watch: 70, Healthy: 86 };
  return (base[p.status] || 82) + seed + (i % 3) * 2;
}

const PRI = {
  CRITICAL: { bar:'var(--c-crit)', bg:'var(--c-crit-bg)', bd:'var(--c-crit-bd)', badge:{background:'var(--c-crit-bg)',color:'var(--c-crit)',border:'1px solid var(--c-crit-bd)'} },
  HIGH:     { bar:'var(--c-high)', bg:'var(--c-high-bg)', bd:'var(--c-high-bd)', badge:{background:'var(--c-high-bg)',color:'var(--c-high)',border:'1px solid var(--c-high-bd)'} },
  MEDIUM:   { bar:'var(--c-med)',  bg:'var(--c-med-bg)',  bd:'var(--c-med-bd)',  badge:{background:'var(--c-med-bg)', color:'var(--c-med)', border:'1px solid var(--c-med-bd)'}  },
  LOW:      { bar:'var(--c-low)',  bg:'var(--c-low-bg)',  bd:'var(--c-low-bd)',  badge:{background:'var(--c-low-bg)', color:'var(--c-low)', border:'1px solid var(--c-low-bd)'}  },
};
const HS = {
  Critical:  { bg:'var(--c-crit-bg)', bd:'var(--c-crit-bd)', text:'var(--c-crit)' },
  'At Risk': { bg:'var(--c-high-bg)', bd:'var(--c-high-bd)', text:'var(--c-high)' },
  Watch:     { bg:'var(--c-med-bg)',  bd:'var(--c-med-bd)',  text:'var(--c-med)'  },
  Healthy:   { bg:'var(--c-low-bg)',  bd:'var(--c-low-bd)',  text:'var(--c-low)'  },
};
const CH = { new:'#5b8dee', dependency:'#c47a3a', escalated:'#d44f4f', resolved:'#3d9e72', progress:'#3d9e72', update:'#5b8dee', risk:'#d44f4f' };
const BADGE = { borderRadius:4, fontSize:9, fontWeight:700, padding:'2px 7px', textTransform:'uppercase', letterSpacing:'0.09em' };

const DEMO = {
  summary: "Nova's payment integration is on day 3 of a full blockage — 4 engineers idle and client unresponsive to follow-ups. Vertex demo is 18h away with only 72% sprint completion and no sign-off. Atlas legal review is 4 days overdue with a hard deadline this week.",
  decisions: [
    { project:"Nova", priority:"CRITICAL", decision_type:"client_escalation", urgency_level:"critical", time_horizon:"today", priority_score:0.92, confidence_score:0.91, reason_trace:["Client followed up 3× with no delivery date","Payment gateway down day 3","Milestone past due"], related_signal_types:["client_followup","execution_delay"], recommended_action:"Send confirmed delivery date today or formally push milestone to next sprint.", impact_area:"relationship" },
    { project:"Vertex", priority:"HIGH", decision_type:"demo_readiness", urgency_level:"high", time_horizon:"today", priority_score:0.78, confidence_score:0.84, reason_trace:["Sprint only 72% complete","Demo scheduled in 18h","No stakeholder sign-off received"], related_signal_types:["deadline_risk","sign_off_pending"], recommended_action:"Obtain sign-off now or reduce demo scope to confirmed features.", impact_area:"delivery" },
    { project:"Atlas", priority:"MEDIUM", decision_type:"legal_review", urgency_level:"medium", time_horizon:"this week", priority_score:0.55, confidence_score:0.76, reason_trace:["Legal review outstanding 4 days","Hard deadline in 5 days"], related_signal_types:["compliance","execution_delay"], recommended_action:"Escalate to legal team today.", impact_area:"compliance" },
  ],
  risks: [
    { title:"Payment gateway blocking 4 engineers", project:"Nova", description:"Payment API returning 500 errors for day 3.", impact:"Delivery may slip 2–3 days. 4 engineers fully blocked.", mitigation:"Investigate API logs or contact Stripe support today." },
    { title:"Sprint 72% complete — demo in 18h", project:"Vertex", description:"Key features incomplete, demo scheduled tomorrow.", impact:"Feature gaps visible to client.", mitigation:"Descope 3 features or fast-track remaining work tonight." },
  ],
  project_health: [
    { project:"Nova",   status:"Critical",  reason:"Blocker day 3 + client pressure",      health_score: 38 },
    { project:"Vertex", status:"At Risk",   reason:"Demo pressure + sign-off pending",      health_score: 59 },
    { project:"Atlas",  status:"Watch",     reason:"Legal review outstanding",              health_score: 72 },
    { project:"Orion",  status:"Healthy",   reason:"Pipeline green, 9 commits today",       health_score: 91 },
  ],
  changes: [
    { type:"escalated",  description:"Payment API returning 500 errors — Nova integration blocked." },
    { type:"new",        description:"Client follow-up #3 received — Nova delivery date unconfirmed." },
    { type:"progress",   description:"Data pipeline optimisation complete — Orion query time ↓40%." },
    { type:"dependency", description:"Atlas legal review outstanding 4 days — release blocked." },
  ],
  stable_summary: "Orion on track — no blockers, normal delivery cadence.",
  suppressed_note: "27 low-impact signals suppressed this cycle.",
  sample_id: "demo",
};

const TREND = [
  {d:'Mon',r:1,dec:2},{d:'Tue',r:2,dec:3},{d:'Wed',r:1,dec:1},
  {d:'Thu',r:3,dec:4},{d:'Fri',r:2,dec:3},{d:'Sat',r:1,dec:1},{d:'Sun',r:2,dec:3},
];

const PHASES = [
  { icon: Radio,      label: 'Connecting to intelligence layer',  detail: 'Establishing secure channel…' },
  { icon: Layers,     label: 'Loading project signals',           detail: 'GitHub · Jira · Slack · Email…' },
  { icon: Zap,        label: 'Running AI analysis',               detail: 'Groq llama-3.3-70b scoring events…' },
  { icon: ListChecks, label: 'Building decision digest',          detail: 'Prioritising by urgency & impact…' },
  { icon: Shield,     label: 'Evaluating portfolio health',       detail: 'Scanning all active projects…' },
];

// ─── LOADING SCREEN ──────────────────────────────────────────────────────────
// Loops UNTIL backend is ready, then finishes cleanly at next phase boundary
function LoadingScreen({ onDone, ready }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phasePct, setPhasePct] = useState(0);
  const [dots, setDots]         = useState('');
  const [canFinish, setCanFinish] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let t = 0;
    const PHASE_DUR = 2800, TICK = 60;
    const iv = setInterval(() => {
      t += TICK;
      const pct = Math.min((t / PHASE_DUR) * 100, 100);
      setPhasePct(pct);
      if (t >= PHASE_DUR) {
        t = 0;
        setPhaseIdx(prev => {
          const next = (prev + 1) % PHASES.length;
          if (next === 0) setCanFinish(true);
          return next;
        });
      }
    }, TICK);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (ready && canFinish && phasePct >= 98) setTimeout(() => onDone(), 300);
  }, [ready, canFinish, phasePct]);

  const cur = PHASES[phaseIdx];
  const CurIcon = cur.icon;
  const overallPct = ready ? 100 : Math.round((phaseIdx / PHASES.length) * 100 + (phasePct / PHASES.length));

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'32px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:500, height:500,
        background:'radial-gradient(circle, rgba(91,141,238,0.06) 0%, transparent 65%)',
        pointerEvents:'none', borderRadius:'50%', animation:'glowPulse 4s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', opacity:0.03 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(transparent, rgba(91,141,238,0.8), transparent)',
          animation:'scanline 3s linear infinite' }}/>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:56, animation:'floatText 3s ease-in-out infinite' }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 24px rgba(91,141,238,0.4)' }}>
          <Activity size={22} color="white" strokeWidth={2.5}/>
        </div>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.04em' }}>Operis</div>
          <div style={{ fontSize:10, color:'var(--accent)', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', marginTop:1 }}>Intelligence Dashboard</div>
        </div>
      </div>

      <div style={{ position:'relative', width:160, height:160, marginBottom:40 }}>
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1px solid rgba(91,141,238,0.12)' }}/>
        <div style={{ position:'absolute', inset:16, borderRadius:'50%', border:'1px dashed rgba(91,141,238,0.08)' }}/>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%',
            background:'linear-gradient(135deg, rgba(91,141,238,0.15), rgba(91,141,238,0.05))',
            border:'1px solid rgba(91,141,238,0.25)', display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 32px rgba(91,141,238,0.15)' }}>
            <CurIcon size={20} color="var(--accent)" style={{ animation:'pulse 1.5s ease-in-out infinite' }}/>
          </div>
        </div>
        <div style={{ position:'absolute', inset:0, animation:'orbit 2.4s linear infinite' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', width:10, height:10, borderRadius:'50%',
            background:'var(--accent)', transform:'translate(-50%,-50%)', boxShadow:'0 0 8px rgba(91,141,238,0.8)' }}/>
        </div>
        <div style={{ position:'absolute', inset:0, animation:'orbit2 3.2s linear infinite' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', width:7, height:7, borderRadius:'50%',
            background:'var(--c-low)', transform:'translate(-50%,-50%)', boxShadow:'0 0 6px rgba(61,158,114,0.7)' }}/>
        </div>
        <div style={{ position:'absolute', inset:0, animation:'orbit3 1.8s linear infinite' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', width:5, height:5, borderRadius:'50%',
            background:'var(--c-high)', transform:'translate(-50%,-50%)', boxShadow:'0 0 5px rgba(196,122,58,0.7)' }}/>
        </div>
        <svg style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }} width={160} height={160}>
          <circle cx={80} cy={80} r={74} fill="none" stroke="rgba(91,141,238,0.08)" strokeWidth={2}/>
          <circle cx={80} cy={80} r={74} fill="none" stroke="var(--accent)" strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${(overallPct/100)*(2*Math.PI*74)} ${2*Math.PI*74}`}
            style={{ transition:'stroke-dasharray 0.4s ease' }}/>
        </svg>
      </div>

      <div style={{ textAlign:'center', minHeight:52, marginBottom:28 }}>
        <p style={{ fontSize:16, fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.02em', marginBottom:6 }}>
          {cur.label}{dots}
        </p>
        <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.5 }}>{cur.detail}</p>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:28, height:24 }}>
        {Array.from({length:16}).map((_,i) => (
          <div key={i} style={{
            width:3, borderRadius:2,
            background: i%3===0 ? 'var(--accent)' : i%3===1 ? 'var(--c-low)' : 'var(--border-md)',
            opacity: 0.6+(i%4)*0.1,
            animation:`waveform ${0.6+(i%5)*0.15}s ease-in-out ${i*0.06}s infinite`,
            height:`${8+(i%6)*4}px`,
          }}/>
        ))}
      </div>

      <div style={{ width:260, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>
            Phase {phaseIdx+1} of {PHASES.length}
          </span>
          <span style={{ fontSize:10, color:'var(--accent)', fontWeight:700 }}>{Math.round(phasePct)}%</span>
        </div>
        <div style={{ height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:99, background:'var(--accent)',
            width:`${phasePct}%`, transition:'width 0.06s linear',
            boxShadow:'0 0 8px rgba(91,141,238,0.5)' }}/>
        </div>
      </div>

      <div style={{ display:'flex', gap:5, marginBottom:32 }}>
        {PHASES.map((_, i) => (
          <div key={i} style={{
            width: i===phaseIdx ? 32 : 20, height:4, borderRadius:99,
            background: i<phaseIdx ? 'var(--c-low)' : i===phaseIdx ? 'var(--accent)' : 'var(--border)',
            transition:'all 0.3s ease',
            boxShadow: i===phaseIdx ? '0 0 6px rgba(91,141,238,0.6)' : 'none',
          }}/>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-card)',
        border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px' }}>
        <div style={{ width:6, height:6, borderRadius:'50%',
          background: ready ? 'var(--c-low)' : 'var(--accent)',
          animation: ready ? 'none' : 'pulse 1.5s ease-in-out infinite' }}/>
        <span style={{ fontSize:11, color:'var(--text-2)' }}>
          {ready ? 'Data received — finalising view…' : 'Backend on Render free tier · cold start ~3–5 min'}
        </span>
      </div>
    </div>
  );
}

function PulseDot({ color='var(--c-crit)', size=7 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, opacity:.4, animation:'ping 1.7s cubic-bezier(0,0,.2,1) infinite' }}/>
      <span style={{ width:size, height:size, borderRadius:'50%', background:color, display:'block' }}/>
    </span>
  );
}

function RadialScore({ score, size=44 }) {
  const color = scoreHex(score);
  const r=(size-5)/2, circ=2*Math.PI*r, dash=(score/100)*circ;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ-dash}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1s ease' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:10, fontWeight:700, color, lineHeight:1 }}>{score}</span>
      </div>
    </div>
  );
}

function SH({ icon:Icon, color, children, right, delay=0 }) {
  return (
    <h2 className="fade-up" style={{ fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase',
      letterSpacing:'0.15em', marginBottom:14, paddingBottom:10, borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', gap:7, animationDelay:`${delay}s` }}>
      <Icon size={10} color={color}/>{children}
      {right && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:400, textTransform:'none', letterSpacing:'normal', color:'var(--text-3)' }}>{right}</span>}
    </h2>
  );
}

function MetricCard({ label, value, color, icon:Icon, sub, delay=0 }) {
  return (
    <div className="card fade-up" style={{ padding:'18px 20px', flex:1, minWidth:0,
      animationDelay:`${delay}s`, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color, opacity:0.7 }}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.10em' }}>{label}</span>
        <div style={{ width:28, height:28, borderRadius:7, background:`${color}14`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={13} color={color}/>
        </div>
      </div>
      <div className="metric-in" style={{ fontSize:32, fontWeight:800, color:'var(--text-1)', letterSpacing:'-0.05em', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5 }}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-raised)', border:'1px solid var(--border-md)', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--text-3)', marginBottom:5, fontWeight:600 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:p.color }}/>
          <span style={{ color:'var(--text-2)' }}>{p.name}:</span>
          <span style={{ color:'var(--text-1)', fontWeight:700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function BriefCard({ digest, updated }) {
  const decisions = safeArr(digest?.decisions);
  const risks     = safeArr(digest?.risks);
  const ph        = safeArr(digest?.project_health);
  const hCount    = {};
  ph.forEach(p => { hCount[p.status] = (hCount[p.status]||0)+1 });
  const critCount = hCount['Critical'] || 0;
  return (
    <div className="card fade-up" style={{ padding:'22px 26px', marginBottom:20,
      borderLeft:'3px solid var(--accent)', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
        <div style={{ width:36, height:36, borderRadius:9, background:'var(--accent-bg)',
          border:'1px solid var(--accent-bd)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Sparkles size={15} color="var(--accent)"/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:9, color:'var(--accent)', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.16em' }}>AI Situation Brief</span>
            {updated && (
              <span style={{ fontSize:10, color:'var(--text-3)', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c-low)', animation:'pulse 2s ease-in-out infinite' }}/>
                {timeAgo(updated.toISOString())}
              </span>
            )}
            {critCount > 0 && (
              <span style={{ display:'flex', alignItems:'center', gap:5, background:'var(--c-crit-bg)',
                border:'1px solid var(--c-crit-bd)', borderRadius:99, padding:'2px 9px',
                fontSize:10, color:'var(--c-crit)', fontWeight:700 }}>
                <PulseDot color="var(--c-crit)" size={5}/>{critCount} Critical
              </span>
            )}
            {digest?.suppressed_note && (
              <span style={{ fontSize:10, color:'var(--text-3)', background:'var(--bg-raised)',
                border:'1px solid var(--border)', borderRadius:99, padding:'2px 9px' }}>
                {digest.suppressed_note}
              </span>
            )}
          </div>
          <p style={{ fontSize:14, color:'var(--text-1)', fontWeight:500, lineHeight:1.75, margin:'0 0 12px' }}>
            {digest?.summary || 'Monitoring active — digest will appear shortly.'}
          </p>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            {[
              { label:'Decisions', val:decisions.length,       color:'var(--c-high)' },
              { label:'Risks',     val:risks.length,           color:'var(--c-crit)' },
              { label:'Projects',  val:ph.length,              color:'var(--accent)' },
              { label:'Healthy',   val:hCount['Healthy']||0,   color:'var(--c-low)'  },
              { label:'Watching',  val:hCount['Watch']||0,     color:'var(--c-med)'  },
              { label:'Critical',  val:hCount['Critical']||0,  color:'var(--c-crit)' },
            ].filter(x => x.val > 0).map(({ label, val, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <span style={{ fontSize:17, fontWeight:800, color, letterSpacing:'-0.04em' }}>{val}</span>
                <span style={{ fontSize:10, color:'var(--text-3)', fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DecisionCard({ raw, i }) {
  const [open, setOpen]   = useState(i === 0);
  const [trace, setTrace] = useState(false);
  const [acted, setActed] = useState(false);
  const pri    = normPri(raw);
  const ps     = PRI[pri] || PRI.HIGH;
  const title  = bTitle(raw, i);
  const desc   = bDesc(raw);
  const traces = safeArr(raw.reason_trace);
  const rest   = desc === traces[0] ? traces.slice(1) : traces;
  const action = bAction(raw);
  const impact = bImpact(raw);
  const conf   = Math.round((raw.confidence_score || raw.priority_score || 0) * 100);
  return (
    <div className={`card fade-up${pri==='CRITICAL'?' crit-border':''}`}
      style={{ overflow:'hidden', border:`1px solid ${open?ps.bd:'var(--border)'}`,
        animationDelay:`${i*.07}s`, opacity:acted?0.45:1, transition:'opacity .4s, border-color .2s' }}>
      <div style={{ height:2, background:ps.bar, opacity:0.75 }}/>
      <div onClick={() => setOpen(o=>!o)}
        style={{ padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:10,
          background:open?ps.bg:'transparent', transition:'background .2s' }}>
        <div style={{ marginTop:3, flexShrink:0 }}>
          {pri==='CRITICAL' ? <PulseDot color="var(--c-crit)" size={8}/> :
            <div style={{ width:8, height:8, borderRadius:'50%', background:ps.bar }}/>}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', marginBottom:5 }}>
            <span style={{ ...BADGE, ...ps.badge }}>{pri}</span>
            {raw.decision_type && <span className="tag" style={{ background:'var(--bg-raised)', color:'var(--text-3)', border:'1px solid var(--border)' }}>{fmtType(raw.decision_type)}</span>}
            {raw.urgency_level && <span className="tag" style={{ background:'var(--bg-raised)', color:ps.bar, border:'1px solid var(--border)' }}>{raw.urgency_level}</span>}
            {raw.time_horizon  && <span className="tag" style={{ color:'var(--accent)', background:'var(--accent-bg)', border:'1px solid var(--accent-bd)' }}>⏱ {raw.time_horizon}</span>}
            {raw.project       && <span className="tag" style={{ color:'var(--text-2)', background:'var(--bg-raised)', border:'1px solid var(--border)' }}>{raw.project}</span>}
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--text-1)', letterSpacing:'-0.01em', lineHeight:1.4, display:'block' }}>{title}</span>
          {conf > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:5 }}>
              <div style={{ flex:1, height:2, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${conf}%`, background:ps.bar, borderRadius:99, transition:'width 1.2s ease' }}/>
              </div>
              <span style={{ fontSize:9, color:'var(--text-3)', fontWeight:600, minWidth:40 }}>{conf}% conf</span>
            </div>
          )}
        </div>
        <div style={{ color:'var(--text-3)', marginTop:3, flexShrink:0, transition:'transform .2s', transform:open?'rotate(180deg)':'none' }}>
          <ChevronDown size={13}/>
        </div>
      </div>
      {open && (
        <div style={{ padding:'0 18px 18px', borderTop:`1px solid ${ps.bd}` }}>
          {desc && <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:'12px 0 10px',
            padding:'9px 13px', background:'var(--bg-raised)', borderRadius:7, borderLeft:`2px solid ${ps.bar}` }}>{desc}</p>}
          {safeArr(raw.related_signal_types).length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
              {safeArr(raw.related_signal_types).map((s,j) => (
                <span key={j} className="tag" style={{ background:'var(--bg-raised)', color:'var(--text-3)', border:'1px solid var(--border)' }}>{s.replace(/_/g,' ')}</span>
              ))}
            </div>
          )}
          <div style={{ background:ps.bg, borderLeft:`2px solid ${ps.bar}`, padding:'12px 14px', borderRadius:'0 8px 8px 0', marginBottom:10 }}>
            {impact && (
              <div style={{ marginBottom:9 }}>
                <span style={{ fontSize:9, fontWeight:800, color:ps.bar, textTransform:'uppercase', letterSpacing:'0.12em', display:'flex', alignItems:'center', gap:4, marginBottom:3 }}>
                  <Flame size={8}/> Impact
                </span>
                <span style={{ fontSize:12, color:ps.bar, lineHeight:1.6 }}>{impact}</span>
              </div>
            )}
            <div style={{ paddingTop:impact?9:0, borderTop:impact?'1px solid rgba(255,255,255,.04)':'none' }}>
              <span style={{ fontSize:9, fontWeight:800, color:ps.bar, textTransform:'uppercase', letterSpacing:'0.12em', display:'flex', alignItems:'center', gap:4, marginBottom:4 }}>
                <ArrowRight size={8}/> Action
              </span>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <span style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, flex:1 }}>{action}</span>
                <button onClick={e => { e.stopPropagation(); setActed(true) }}
                  style={{ flexShrink:0, height:26, padding:'0 10px', borderRadius:5,
                    background:ps.bar, border:'none', color:'white', fontSize:10, fontWeight:700,
                    cursor:'pointer', display:'flex', alignItems:'center', gap:3,
                    opacity:acted?0.4:1, transition:'opacity .3s' }}>
                  {acted ? <><CheckCircle2 size={9}/> Done</> : <><ArrowRight size={9}/> Act</>}
                </button>
              </div>
            </div>
          </div>
          {rest.length > 0 && (
            <>
              <button onClick={e => { e.stopPropagation(); setTrace(o=>!o) }}
                style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none',
                  color:'var(--text-3)', fontSize:10, cursor:'pointer', padding:'2px 0', fontFamily:'inherit' }}>
                <Info size={10}/> Why this decision?
                <ChevronDown size={9} style={{ transform:trace?'rotate(180deg)':'none', transition:'transform .2s' }}/>
              </button>
              {trace && (
                <div style={{ marginTop:7, background:'var(--bg-raised)', borderRadius:7, padding:'9px 12px', display:'flex', flexDirection:'column', gap:4 }}>
                  {rest.map((t,j) => (
                    <div key={j} style={{ display:'flex', gap:7 }}>
                      <span style={{ fontSize:10, color:ps.bar, flexShrink:0, marginTop:1 }}>›</span>
                      <span style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.6 }}>{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RiskCard({ r, i }) {
  const title  = r.title || r.name || `Risk ${i+1}`;
  const desc   = r.description || r.context || '';
  const impact = r.impact || r.consequence || '';
  const action = r.action || r.mitigation || 'Investigate immediately.';
  return (
    <div className="card fade-up" style={{ overflow:'hidden', border:'1px solid var(--c-crit-bd)', animationDelay:`${i*.08}s` }}>
      <div style={{ height:2, background:'var(--c-crit)', opacity:0.6 }}/>
      <div style={{ padding:'13px 17px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:'var(--c-crit-bg)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <AlertTriangle size={11} color="var(--c-crit)"/>
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text-1)', flex:1, lineHeight:1.3 }}>{title}</span>
          {r.project && <span className="tag" style={{ background:'var(--bg-raised)', color:'var(--text-3)', border:'1px solid var(--border)' }}>{r.project}</span>}
        </div>
        {desc && <p style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7, marginBottom:9,
          padding:'7px 11px', background:'var(--bg-raised)', borderRadius:6, borderLeft:'2px solid var(--c-crit)' }}>{desc}</p>}
        <div style={{ background:'var(--c-crit-bg)', borderLeft:'2px solid var(--c-crit)', padding:'10px 13px', borderRadius:'0 8px 8px 0' }}>
          {impact && <div style={{ marginBottom:7 }}>
            <span style={{ fontSize:9, fontWeight:800, color:'var(--c-crit)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:2 }}>Impact</span>
            <span style={{ fontSize:11, color:'var(--c-crit)', lineHeight:1.6 }}>{impact}</span>
          </div>}
          <div style={{ paddingTop:impact?7:0, borderTop:impact?'1px solid rgba(255,255,255,.04)':'none',
            display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:9, fontWeight:800, color:'var(--c-crit)', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:2 }}>Mitigation</span>
              <span style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.6 }}>{action}</span>
            </div>
            <button style={{ width:28, height:28, borderRadius:6, background:'var(--c-crit-bg)',
              border:'1px solid var(--c-crit-bd)', color:'var(--c-crit)',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <Zap size={11}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ p, i }) {
  const [hov, setHov] = useState(false);
  const hs    = HS[p.status] || HS.Healthy;
  const score = deriveScore(p, i);
  return (
    <div className="fade-up" style={{ background:hov?hs.bg:'transparent', border:`1px solid ${hov?hs.bd:'var(--border)'}`,
      borderRadius:9, padding:'10px 12px', transition:'all .2s', animationDelay:`${i*.06}s` }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <RadialScore score={score}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--text-1)' }}>{p.project}</span>
            <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:hs.text }}>{p.status}</span>
          </div>
          {p.reason && <p style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.45, margin:0 }}>{p.reason}</p>}
        </div>
      </div>
    </div>
  );
}

function ChangeItem({ c, i }) {
  const label = typeof c==='object' ? (c.type||c.category||'update') : 'update';
  const text  = typeof c==='string' ? c : (c.description||c.summary||c.text||'');
  const color = CH[label.toLowerCase()] || 'var(--accent)';
  return (
    <div style={{ paddingTop:i>0?9:0, marginTop:i>0?9:0, borderTop:i>0?'1px solid var(--border)':'none',
      display:'flex', gap:9, alignItems:'flex-start' }}>
      <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, marginTop:5 }}/>
      <div>
        <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.09em', color, display:'block', marginBottom:2 }}>{label}</span>
        <p style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.6, margin:0 }}>{text}</p>
      </div>
    </div>
  );
}

function ScoreTable({ ph }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid var(--border)' }}>
            {['Project','Status','Score','Trend'].map(h => (
              <th key={h} style={{ textAlign:'left', fontSize:9, fontWeight:700, color:'var(--text-3)',
                textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 8px 7px 0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ph.map((p,i) => {
            const score = deriveScore(p,i);
            const hs    = HS[p.status] || HS.Healthy;
            const color = scoreHex(score);
            return (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'8px 8px 8px 0', fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{p.project}</td>
                <td style={{ padding:'8px 8px 8px 0' }}>
                  <span style={{ fontSize:9, fontWeight:700, color:hs.text, background:hs.bg,
                    border:`1px solid ${hs.bd}`, borderRadius:4, padding:'2px 6px',
                    textTransform:'uppercase', letterSpacing:'0.07em' }}>{p.status}</span>
                </td>
                <td style={{ padding:'8px 8px 8px 0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:52, height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${score}%`, background:color, borderRadius:99, transition:'width 1s ease' }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color, minWidth:26 }}>{score}%</span>
                  </div>
                </td>
                <td style={{ padding:'8px 0', fontSize:10 }}>
                  {score >= 80 ? <span style={{ color:'var(--c-low)', display:'flex', alignItems:'center', gap:2 }}><TrendingUp size={9}/>Stable</span>
                    : score >= 60 ? <span style={{ color:'var(--c-med)' }}>→ Watch</span>
                    : <span style={{ color:'var(--c-crit)', display:'flex', alignItems:'center', gap:2 }}><TrendingDown size={9}/>Risk</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <AreaChart data={data} margin={{ top:8, right:8, bottom:0, left:-24 }}>
        <defs>
          <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#d44f4f" stopOpacity={0.22}/>
            <stop offset="95%" stopColor="#d44f4f" stopOpacity={0.02}/>
          </linearGradient>
          <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#5b8dee" stopOpacity={0.22}/>
            <stop offset="95%" stopColor="#5b8dee" stopOpacity={0.02}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis dataKey="d" tick={{ fontSize:10, fill:'#4a5568' }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fontSize:9, fill:'#4a5568' }} axisLine={false} tickLine={false}/>
        <Tooltip content={<CustomTooltip/>}/>
        <Area type="monotone" dataKey="r"   name="Risks"     stroke="#d44f4f" strokeWidth={1.5} fill="url(#gR)" dot={false} activeDot={{ r:3 }}/>
        <Area type="monotone" dataKey="dec" name="Decisions" stroke="#5b8dee" strokeWidth={1.5} fill="url(#gD)" dot={false} activeDot={{ r:3 }}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HealthBar({ ph }) {
  const data = ph.map((p,i) => ({ name:p.project, score:deriveScore(p,i) }));
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top:4, right:8, bottom:0, left:-28 }} barSize={20}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis dataKey="name" tick={{ fontSize:10, fill:'#4a5568' }} axisLine={false} tickLine={false}/>
        <YAxis domain={[0,100]} tick={{ fontSize:9, fill:'#4a5568' }} axisLine={false} tickLine={false}/>
        <Tooltip content={<CustomTooltip/>}/>
        <Bar dataKey="score" name="Health" radius={[3,3,0,0]}>
          {data.map((e,i) => <Cell key={i} fill={scoreHex(e.score)}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DecisionDonut({ pCount }) {
  const data = [
    { name:'Critical', value:pCount.CRITICAL, color:'#d44f4f' },
    { name:'High',     value:pCount.HIGH,     color:'#c47a3a' },
    { name:'Medium',   value:pCount.MEDIUM,   color:'#b8993a' },
  ].filter(d => d.value > 0);
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={130}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={34} outerRadius={52}
          paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((e,i) => <Cell key={i} fill={e.color}/>)}
        </Pie>
        <Tooltip content={<CustomTooltip/>}/>
        <Legend iconType="circle" iconSize={7}
          formatter={v => <span style={{ fontSize:10, color:'var(--text-2)' }}>{v}</span>}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

function PriBars({ pCount, total }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
      {[['Critical','CRITICAL','#d44f4f'],['High','HIGH','#c47a3a'],['Medium','MEDIUM','#b8993a']].map(([l,k,c]) => (
        <div key={k}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:'var(--text-2)', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:c, display:'inline-block' }}/>{l}
            </span>
            <span style={{ fontSize:11, color:c, fontWeight:800 }}>{pCount[k]||0}</span>
          </div>
          <div style={{ height:4, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${((pCount[k]||0)/(total||1))*100}%`,
              background:c, borderRadius:99, transition:'width 1s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'76px 24px 0' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div className="skel" style={{ height:95, borderRadius:12, marginBottom:20 }}/>
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {[1,2,3,4].map(k => <div key={k} className="skel" style={{ height:82, flex:1, borderRadius:12 }}/>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:18 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[120,100,85,100].map((h,k) => <div key={k} className="skel" style={{ height:h, borderRadius:12 }}/>)}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div className="skel" style={{ height:230, borderRadius:12 }}/>
            <div className="skel" style={{ height:130, borderRadius:12 }}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [digest,      setDigest     ] = useState(null);
  const [loading,     setLoading    ] = useState(true);
  const [backendReady,setBackendReady] = useState(false);
  const [showLoader,  setShowLoader ] = useState(true);
  const [updated,     setUpdated    ] = useState(null);
  const [spinning,    setSpinning   ] = useState(false);
  const [isDemo,      setIsDemo     ] = useState(false);
  const [theme,       setTheme      ] = useState('dark');

  useEffect(() => {
    const id = 'operis-css-v6';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme==='light' ? 'light' : '');
  }, [theme]);

  const load = useCallback(async (manual=false) => {
    if (manual) setSpinning(true);
    try {
      const [dRes, hRes] = await Promise.allSettled([
        fetch(`${API}/digest/latest`),
        fetch(`${API}/health/latest`),
      ]);
      let d = null, h = [];
      if (dRes.status==='fulfilled' && dRes.value.ok) d = await dRes.value.json();
      if (hRes.status==='fulfilled' && hRes.value.ok) {
        const r = await hRes.value.json();
        h = Array.isArray(r) ? r : [];
      }
      if (d && !d.error && !d.detail) {
        const hMap = {};
        h.forEach(p => { hMap[p.project] = p });
        if (d.project_health)
          d.project_health = d.project_health.map(p => ({ ...p, ...(hMap[p.project]||{}) }));
        setDigest(d); setIsDemo(false);
      } else {
        setDigest(DEMO); setIsDemo(true);
      }
      setUpdated(new Date());
    } catch {
      setDigest(DEMO); setIsDemo(true); setUpdated(new Date());
    } finally {
      setLoading(false);
      setBackendReady(true);
      if (manual) setSpinning(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  const handleLoaderDone = useCallback(() => setShowLoader(false), []);

  if (showLoader) return (
    <><style>{CSS}</style><LoadingScreen onDone={handleLoaderDone} ready={backendReady}/></>
  );
  if (loading) return (<><style>{CSS}</style><Skeleton/></>);

  const decisions = safeArr(digest?.decisions);
  const risks     = safeArr(digest?.risks);
  const changes   = safeArr(digest?.changes);
  const ph        = safeArr(digest?.project_health);

  const normDec = decisions.map(d => ({ ...d, _p:normPri(d) }));
  const sorted  = [...normDec].sort((a,b) => ({CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3}[a._p]??2)-({CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3}[b._p]??2));
  const pCount  = { CRITICAL:normDec.filter(d=>d._p==='CRITICAL').length, HIGH:normDec.filter(d=>d._p==='HIGH').length, MEDIUM:normDec.filter(d=>d._p==='MEDIUM').length };
  const hCount  = {}; ph.forEach(p => { hCount[p.status]=(hCount[p.status]||0)+1 });
  const critCount = hCount['Critical']||0;
  const avgScore  = ph.length ? Math.round(ph.reduce((a,p,i)=>a+deriveScore(p,i),0)/ph.length) : 0;
  const trendData = TREND.map((t,i) => ({
    ...t,
    r:   i===TREND.length-1 ? risks.length     : t.r,
    dec: i===TREND.length-1 ? decisions.length : t.dec,
  }));

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{CSS}</style>

      <nav style={{ borderBottom:'1px solid var(--border)', background:'rgba(10,13,20,0.95)',
        backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:52,
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="btn" onClick={() => navigate('/login')} style={{ padding:'4px 10px', gap:4 }}>
              <ArrowLeft size={11}/> Back
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:26, height:26, borderRadius:7, background:'var(--accent)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Activity size={13} color="white" strokeWidth={2.5}/>
              </div>
              <span style={{ fontWeight:800, fontSize:14, color:'var(--text-1)', letterSpacing:'-0.03em' }}>Operis</span>
              {isDemo && <span className="tag" style={{ color:'var(--c-high)', background:'var(--c-high-bg)', border:'1px solid var(--c-high-bd)' }}>DEMO</span>}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            {critCount > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'var(--c-crit-bg)',
                border:'1px solid var(--c-crit-bd)', borderRadius:7, padding:'4px 10px' }}>
                <PulseDot color="var(--c-crit)" size={5}/>
                <span style={{ fontSize:11, color:'var(--c-crit)', fontWeight:700 }}>{critCount} Critical</span>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text-3)',
              background:'var(--bg-raised)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 9px' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--c-low)', animation:'pulse 2s ease-in-out infinite' }}/>
              {updated ? updated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : 'Live'}
            </div>
            <button className="btn" onClick={() => load(true)} style={{ width:30, height:30, padding:0 }}>
              <RefreshCw size={12} style={{ animation:spinning?'spin .7s linear infinite':'none' }}/>
            </button>
            <button className="btn" onClick={() => setTheme(t => t==='dark'?'light':'dark')} style={{ width:30, height:30, padding:0 }}>
              {theme==='dark' ? <Sun size={12}/> : <Moon size={12}/>}
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'22px 24px 80px' }}>
        <BriefCard digest={digest} updated={updated}/>

        <div className="metrics-row" style={{ display:'flex', gap:10, marginBottom:20 }}>
          <MetricCard label="Decisions"    value={decisions.length} color="#c47a3a" icon={GitPullRequest} delay={0}   sub={`${pCount.CRITICAL} critical · ${pCount.HIGH} high`}/>
          <MetricCard label="Active Risks" value={risks.length}     color="#d44f4f" icon={AlertTriangle}  delay={.05} sub="Require action"/>
          <MetricCard label="Projects"     value={ph.length}        color="#5b8dee" icon={Layers}         delay={.10} sub={`${hCount['Healthy']||0} healthy · ${hCount['At Risk']||0} at risk`}/>
          <MetricCard label="Avg Health"   value={`${avgScore}%`}   color={scoreHex(avgScore)} icon={Shield} delay={.15} sub="Portfolio score"/>
        </div>

        <div className="grid-main" style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:18, alignItems:'start' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

            {sorted.length > 0 && (
              <section>
                <SH icon={GitPullRequest} color="var(--c-high)" right="click to expand" delay={.1}>Decisions Required</SH>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {sorted.map((d,i) => <DecisionCard key={i} raw={d} i={i}/>)}
                </div>
              </section>
            )}

            {risks.length > 0 && (
              <section>
                <SH icon={AlertTriangle} color="var(--c-crit)" delay={.15}>Risks Detected</SH>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {risks.map((r,i) => <RiskCard key={i} r={r} i={i}/>)}
                </div>
              </section>
            )}

            {decisions.length === 0 && risks.length === 0 && (
              <div className="card" style={{ padding:44, textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--c-low-bg)',
                  display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                  <CheckCircle2 size={22} color="var(--c-low)"/>
                </div>
                <p style={{ color:'var(--text-1)', fontSize:14, fontWeight:700, marginBottom:4 }}>All clear</p>
                <p style={{ color:'var(--text-3)', fontSize:11, margin:0 }}>No decisions or risks this cycle.</p>
              </div>
            )}

            {ph.length > 0 && (
              <section>
                <SH icon={Eye} color="var(--accent)" delay={.2}>Project Health Scorecard</SH>
                <div className="card" style={{ padding:'14px 18px' }}>
                  <ScoreTable ph={ph}/>
                </div>
              </section>
            )}

            <section>
              <SH icon={BarChart2} color="var(--accent)" delay={.25}>Weekly Signal Trend</SH>
              <div className="card" style={{ padding:'16px 16px 12px' }}>
                <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:10 }}>Risks & decisions raised daily — lower is better.</p>
                <TrendChart data={trendData}/>
                <div style={{ display:'flex', gap:18, marginTop:9 }}>
                  {[['#d44f4f','Risks'],['#5b8dee','Decisions']].map(([c,l]) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <div style={{ width:12, height:2, background:c, borderRadius:2 }}/>
                      <span style={{ fontSize:10, color:'var(--text-3)' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {ph.length > 0 && (
              <section>
                <SH icon={TrendingUp} color="var(--c-low)" delay={.3}>Project Health Scores</SH>
                <div className="card" style={{ padding:'16px 16px 12px' }}>
                  <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:10 }}>Health score 0–100. Higher is better.</p>
                  <HealthBar ph={ph}/>
                  <div style={{ display:'flex', gap:14, marginTop:9, flexWrap:'wrap' }}>
                    {[['#3d9e72','Healthy (80+)'],['#b8993a','Watch (60–79)'],['#c47a3a','At Risk (40–59)'],['#d44f4f','Critical (<40)']].map(([c,l]) => (
                      <div key={l} style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <div style={{ width:9, height:9, borderRadius:2, background:c }}/>
                        <span style={{ fontSize:10, color:'var(--text-3)' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {normDec.length > 0 && (
              <div className="card" style={{ padding:'16px' }}>
                <h3 style={{ fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase',
                  letterSpacing:'0.14em', marginBottom:10, display:'flex', alignItems:'center', gap:5 }}>
                  <ListChecks size={10} color="var(--accent)"/> Decision Priority
                </h3>
                <DecisionDonut pCount={pCount}/>
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:12 }}>
                  <PriBars pCount={pCount} total={normDec.length}/>
                </div>
              </div>
            )}

            {ph.length > 0 && (
              <div className="card" style={{ padding:'16px' }}>
                <h3 style={{ fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase',
                  letterSpacing:'0.14em', marginBottom:14, display:'flex', alignItems:'center', gap:5 }}>
                  <Shield size={10} color="var(--accent)"/> Portfolio Health
                </h3>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ position:'relative', width:60, height:60, flexShrink:0 }}>
                    <svg width={60} height={60} style={{ transform:'rotate(-90deg)' }}>
                      <circle cx={30} cy={30} r={24} fill="none" stroke="var(--border)" strokeWidth={6}/>
                      <circle cx={30} cy={30} r={24} fill="none" stroke={scoreHex(avgScore)} strokeWidth={6}
                        strokeDasharray={`${(avgScore/100)*(2*Math.PI*24)} ${2*Math.PI*24}`}
                        strokeLinecap="round" style={{ transition:'stroke-dasharray 1s ease' }}/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:12, fontWeight:800, color:scoreHex(avgScore), lineHeight:1 }}>{avgScore}</span>
                      <span style={{ fontSize:8, color:'var(--text-3)', marginTop:1 }}>avg</span>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    {Object.entries({Critical:'var(--c-crit)','At Risk':'var(--c-high)',Watch:'var(--c-med)',Healthy:'var(--c-low)'}).map(([status,color]) => {
                      const count = hCount[status]||0;
                      if (!count) return null;
                      return (
                        <div key={status} style={{ display:'flex', justifyContent:'space-between', marginBottom:5, alignItems:'center' }}>
                          <span style={{ fontSize:11, color:'var(--text-2)', display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:color }}/>{status}
                          </span>
                          <span style={{ fontSize:12, fontWeight:700, color }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, borderTop:'1px solid var(--border)', paddingTop:11 }}>
                  {ph.map((p,i) => <HealthCard key={i} p={p} i={i}/>)}
                </div>
              </div>
            )}

            {digest?.stable_summary && (
              <div style={{ background:'var(--c-low-bg)', border:'1px solid var(--c-low-bd)',
                borderRadius:12, padding:'12px 15px', display:'flex', gap:9, alignItems:'flex-start' }}>
                <div style={{ width:24, height:24, borderRadius:6, background:'rgba(61,158,114,0.12)',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CheckCircle2 size={11} color="var(--c-low)"/>
                </div>
                <div>
                  <div style={{ fontSize:9, color:'var(--c-low)', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>Stable</div>
                  <p style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.6, margin:0 }}>{digest.stable_summary}</p>
                </div>
              </div>
            )}

            <div className="card" style={{ padding:'16px' }}>
              <h3 style={{ fontSize:10, fontWeight:800, color:'var(--text-3)', textTransform:'uppercase',
                letterSpacing:'0.14em', marginBottom:12, display:'flex', alignItems:'center', gap:5 }}>
                <Clock size={10} color="var(--accent)"/> Change Log
              </h3>
              {changes.length > 0
                ? changes.map((c,i) => <ChangeItem key={i} c={c} i={i}/>)
                : <p style={{ fontSize:11, color:'var(--text-3)', margin:0 }}>{digest?.changes_summary||'No changes recorded yet.'}</p>}
            </div>
          </div>
        </div>

        <div style={{ marginTop:32, paddingTop:14, borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
          <span style={{ fontSize:10, color:'var(--text-3)' }}>Operis v6 · Groq llama-3.3-70b · 30min cycle{digest?.suppressed_note&&` · ${digest.suppressed_note}`}</span>
          <span style={{ fontSize:10, color:'var(--text-3)' }}>{digest?.sample_id&&`${digest.sample_id} · `}{API}</span>
        </div>
      </main>
    </div>
  );
}