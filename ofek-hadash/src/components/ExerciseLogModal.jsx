import { useState } from 'react';
import { api } from '../api/client';

const EXERCISE_TYPES = ['הליכון', 'הליכה', 'אופניים', 'שחייה', 'פיזיותרפיה', 'מתיחות', 'אחר'];

export default function ExerciseLogModal({ onClose, onSaved }) {
  const [type,     setType]     = useState('הליכון');
  const [duration, setDuration] = useState(30);
  const [pain,     setPain]     = useState(0);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const save = async () => {
    if (duration <= 0) return;
    setSaving(true);
    setError(null);
    try {
      await api.logExercise(type, duration, pain);
      onSaved?.();
      onClose();
    } catch {
      setError('שגיאה בשמירה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  const painColor = pain <= 3 ? '#006d41' : pain <= 6 ? '#C8853A' : '#ba1a1a';

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,27,32,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: '#fdf8ff', borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, backgroundColor: '#c2c6d4', borderRadius: 99, margin: '0 auto 20px' }} />

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1c1b20', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: '#006d41', fontSize: 22 }}>fitness_center</span>
          רשום פעילות גופנית
        </h3>

        {/* Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: '#424752', fontWeight: 600, display: 'block', marginBottom: 8 }}>סוג פעילות</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXERCISE_TYPES.map(t => (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '6px 14px', borderRadius: 99, border: '2px solid',
                borderColor: type === t ? '#006d41' : '#e5e1e9',
                backgroundColor: type === t ? 'rgba(0,109,65,0.08)' : 'transparent',
                color: type === t ? '#006d41' : '#424752',
                fontSize: 13, fontWeight: type === t ? 700 : 400, cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 13, color: '#424752', fontWeight: 600 }}>משך זמן</label>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#00478d' }}>{duration} דקות</span>
          </div>
          <input type="range" min={5} max={120} step={5} value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#00478d', height: 6, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#727783', marginTop: 4 }}>
            <span>5 דק׳</span><span>120 דק׳</span>
          </div>
        </div>

        {/* Pain level */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 13, color: '#424752', fontWeight: 600 }}>רמת כאב</label>
            <span style={{ fontSize: 14, fontWeight: 700, color: painColor }}>
              {pain === 0 ? 'ללא כאב' : `${pain}/10`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setPain(n)} style={{
                flex: 1, height: 32, borderRadius: 6, border: 'none',
                cursor: 'pointer',
                backgroundColor: pain >= n && n > 0
                  ? (n <= 3 ? '#006d41' : n <= 6 ? '#C8853A' : '#ba1a1a')
                  : pain === 0 && n === 0 ? '#006d41' : '#e5e1e9',
                color: (pain >= n && n > 0) || (pain === 0 && n === 0) ? '#fff' : '#727783',
                fontSize: 11, fontWeight: 700,
              }}>{n}</button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: '#ba1a1a', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '2px solid #e5e1e9', backgroundColor: 'transparent', color: '#424752', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            ביטול
          </button>
          <button onClick={save} disabled={saving} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', backgroundColor: saving ? '#c2c6d4' : '#006d41', color: '#fff', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {saving ? 'שומר...' : 'שמור פעילות'}
          </button>
        </div>
      </div>
    </div>
  );
}
