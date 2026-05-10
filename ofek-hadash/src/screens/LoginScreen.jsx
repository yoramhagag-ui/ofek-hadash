import { useState } from 'react';
import { api } from '../api/client';

export default function LoginScreen({ onLogin }) {
  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handle = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError('נא להזין שם'); return; }
    setLoading(true);
    localStorage.setItem('ofek_user', trimmed);
    // save to backend settings (best-effort)
    api.updateSetting('user_name', trimmed).catch(() => {});
    onLogin(trimmed);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100svh', backgroundColor: '#00478d',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Arimo, Arial, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>🌅</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', margin: 0 }}>אופק חדש</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: '8px 0 0' }}>תוכנית שיקום אישית מבוססת AI</p>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#1c1b20' }}>ברוך הבא</h2>
        <p style={{ fontSize: 14, color: '#424752', margin: '0 0 24px' }}>הזן את שמך כדי להתחיל</p>

        <label style={{ fontSize: 13, color: '#424752', fontWeight: 600, display: 'block', marginBottom: 6 }}>
          שם מלא
        </label>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder="למשל: יורם"
          autoFocus
          style={{
            width: '100%', backgroundColor: '#f7f2fa', border: '2px solid',
            borderColor: error ? '#ba1a1a' : '#e5e1e9',
            color: '#1c1b20', padding: '12px 16px', borderRadius: 12, fontSize: 16,
            outline: 'none', boxSizing: 'border-box', fontFamily: 'Arimo, Arial, sans-serif',
            marginBottom: error ? 6 : 20, transition: 'border-color 0.2s',
          }}
        />
        {error && <p style={{ color: '#ba1a1a', fontSize: 13, margin: '0 0 16px' }}>{error}</p>}

        <button
          onClick={handle}
          disabled={loading}
          style={{
            width: '100%', backgroundColor: loading ? '#727783' : '#00478d', color: '#fff',
            border: 'none', borderRadius: 12, padding: '14px 0',
            fontWeight: 700, fontSize: 16, cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
          {loading ? 'מתחבר...' : 'כניסה לתוכנית'}
        </button>

        <p style={{ fontSize: 12, color: '#727783', textAlign: 'center', margin: '16px 0 0', lineHeight: 1.5 }}>
          האפליקציה שומרת נתונים מקומית ובענן Supabase
        </p>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 32 }}>
        גרסה 1.0.0 · אופק חדש Alpha
      </p>
    </div>
  );
}
