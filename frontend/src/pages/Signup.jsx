import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    navigate('/dashboard');
  };

  const handleGuest = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight:'100vh', background:'#050505', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,-apple-system,sans-serif', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{ display:'flex', alignItems:'center', gap:6, color:'#52525b', fontSize:13, marginBottom:40, padding:0 }}
          onMouseEnter={e => e.currentTarget.style.color='#a1a1aa'}
          onMouseLeave={e => e.currentTarget.style.color='#52525b'}>
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:36 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Activity size={15} color="#050505" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight:700, fontSize:15, color:'#f5f5f5', letterSpacing:'-0.025em' }}>Operis</span>
        </div>

        <h1 style={{ fontSize:26, fontWeight:700, color:'#f5f5f5', letterSpacing:'-0.04em', marginBottom:8 }}>Create your account</h1>
        <p style={{ fontSize:14, color:'#52525b', marginBottom:36 }}>Free forever for small teams. No credit card required.</p>

        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name',   key:'name',     type:'text',     ph:'Alex Johnson'    },
            { label:'Work Email',  key:'email',    type:'email',    ph:'you@company.com' },
            { label:'Password',    key:'password', type:'password', ph:'8+ characters'   },
          ].map(({ label, key, type, ph }) => (
            <div key={key} style={{ marginBottom:18 }}>
              <label style={{ fontSize:11, fontWeight:600, color:'#52525b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:8 }}>
                {label}
              </label>
              <input
                type={type} placeholder={ph}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                required
                style={{ width:'100%', background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:9, padding:'11px 14px', color:'#f5f5f5', fontSize:14, outline:'none', boxSizing:'border-box' }}
                onFocus={e  => e.target.style.borderColor='#6366f1'}
                onBlur={e   => e.target.style.borderColor='#1e1e1e'}
              />
            </div>
          ))}

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={loading}
            style={{ width:'100%', background: loading ? '#1a1a1a' : '#f5f5f5', color: loading ? '#555' : '#050505', fontSize:14, fontWeight:600, padding:'12px', borderRadius:9, marginTop:8 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#fff'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background='#f5f5f5'; }}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>

          {/* Guest option */}
          <div style={{ textAlign:'center', marginTop:20 }}>
            <button
              type="button"
              onClick={handleGuest}
              style={{ color:'#52525b', fontSize:14, padding:'8px 12px', borderRadius:7, border:'1px solid #1a1a1a', background:'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color='#f5f5f5'; e.currentTarget.style.borderColor='#333'; }}
              onMouseLeave={e => { e.currentTarget.style.color='#52525b'; e.currentTarget.style.borderColor='#1a1a1a'; }}>
              Continue as guest →
            </button>
            <p style={{ fontSize:11, color:'#2a2a2a', marginTop:8 }}>Running demo mode with simulated project signals</p>
          </div>
        </form>

        <p style={{ fontSize:13, color:'#52525b', textAlign:'center', marginTop:28 }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{ color:'#818cf8', fontSize:13, padding:0 }}
            onMouseEnter={e => e.currentTarget.style.color='#a78bfa'}
            onMouseLeave={e => e.currentTarget.style.color='#818cf8'}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}