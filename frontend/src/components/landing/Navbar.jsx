import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Sun, Moon } from 'lucide-react';

const LINKS = [
  { label: 'Why Us',       id: 'why-us'       },
  { label: 'Features',     id: 'features'     },
  { label: 'Output',       id: 'output'       },
  { label: 'Use Cases',    id: 'use-cases'    },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('operis-theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    localStorage.setItem('operis-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <nav style={{
      position: 'sticky', top: 0, left: 0, right: 0,
      width: '100%', height: 60, zIndex: 100,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: `1px solid var(--border)`,
      transition: 'background 0.25s ease',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 24px',
        height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 16,
      }}>

        {/* Logo */}
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0 }}>
          <div style={{
            width:28, height:28, borderRadius:7,
            background:'var(--btn-bg)',
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0,
          }}>
            <Activity size={15} color="var(--btn-text)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.03em' }}>
            Operis
          </span>
        </div>

        {/* Links */}
        <div style={{ display:'flex', alignItems:'center', gap:28, flex:1, justifyContent:'center' }}>
          {LINKS.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ fontSize:13, fontWeight:500, color:'var(--text-secondary)', padding:0, letterSpacing:'-0.01em', whiteSpace:'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>

          {/* Theme toggle */}
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              width:32, height:32, borderRadius:7,
              border:'1px solid var(--border)', background:'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--text-secondary)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-hover)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            {theme === 'dark' ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
          </button>

          {/* Sign in */}
          <button onClick={() => navigate('/login')}
            style={{
              padding:'7px 14px', borderRadius:7,
              border:'1px solid var(--border)', background:'transparent',
              color:'var(--text-primary)', fontSize:13, fontWeight:500, whiteSpace:'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            Sign in
          </button>

          {/* Get started */}
          <button onClick={() => navigate('/signup')}
            style={{
              padding:'7px 16px', borderRadius:7,
              background:'var(--btn-bg)', color:'var(--btn-text)',
              fontSize:13, fontWeight:600, whiteSpace:'nowrap',
              border:'1px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}