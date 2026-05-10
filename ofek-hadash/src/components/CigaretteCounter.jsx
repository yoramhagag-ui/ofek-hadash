import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function CigaretteCounter() {
  const [count, setCount]     = useState(0);
  const [saving, setSaving]   = useState(false);
  const [target]              = useState(20);

  useEffect(() => {
    api.getCigarettesToday()
      .then(d => setCount(d.count))
      .catch(() => {});
  }, []);

  const update = async (next) => {
    if (next < 0 || saving) return;
    setSaving(true);
    setCount(next);
    try {
      await api.logCigarettes(next);
    } catch {
      setCount(c => c); // keep optimistic
    } finally {
      setSaving(false);
    }
  };

  const pct     = Math.min((count / target) * 100, 100);
  const barColor = count <= target * 0.5  ? '#006d41'
                 : count <= target * 0.75 ? '#C8853A'
                 : '#ba1a1a';

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(194,198,212,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: barColor, fontSize: 20 }}>smoking_rooms</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1b20' }}>סיגריות היום</span>
        </div>
        <span style={{ fontSize: 12, color: '#727783' }}>יעד: {target}</span>
      </div>

      {/* Progress bar */}
      <div style={{ backgroundColor: '#e5e1e9', borderRadius: 99, height: 6, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: 99, transition: 'width 0.3s, background 0.3s' }} />
      </div>

      {/* Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => update(count - 1)} disabled={count <= 0 || saving}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e5e1e9', backgroundColor: 'transparent', cursor: count <= 0 ? 'not-allowed' : 'pointer', fontSize: 18, color: '#424752', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}>
          −
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace', color: barColor }}>{count}</span>
          <span style={{ fontSize: 13, color: '#727783', marginRight: 4 }}>/ {target}</span>
        </div>

        <button onClick={() => update(count + 1)} disabled={saving}
          style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', backgroundColor: barColor, cursor: 'pointer', fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          +
        </button>
      </div>

      {count > target && (
        <p style={{ fontSize: 12, color: '#ba1a1a', margin: '8px 0 0', textAlign: 'center' }}>
          עברת את היעד היומי ב-{count - target}
        </p>
      )}
    </div>
  );
}
