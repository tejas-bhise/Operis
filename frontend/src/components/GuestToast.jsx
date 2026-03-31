import React, { useState, useEffect } from 'react';

export default function GuestToast() {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#141414', border: '1px solid #2a2a2a', borderRadius: 12,
      padding: '16px 24px', zIndex: 999, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', gap: 16, minWidth: 340,
      animation: 'slideUp 0.3s ease',
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>👋</div>
      <div>
        <p style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 600, color: '#f5f5f5' }}>Continuing as Guest</p>
        <p style={{ margin: 0, fontSize: 12, color: '#737373' }}>Redirecting to dashboard in {seconds}s…</p>
      </div>
      <div style={{ marginLeft: 'auto', width: 32, height: 32, position: 'relative', flexShrink: 0 }}>
        <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="#1f1f1f" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="13" fill="none" stroke="#6366f1" strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (1 - seconds / 5)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, color: '#6366f1', fontWeight: 700 }}>{seconds}</span>
      </div>
    </div>
  );
}