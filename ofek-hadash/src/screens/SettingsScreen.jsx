import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const CATEGORIES = [
  { value: 'morning',   label: 'בוקר',       color: '#7B6D57' },
  { value: 'hygiene',   label: 'טיפול עצמי',  color: '#4A7FA5' },
  { value: 'exercise',  label: 'כושר',        color: '#276749' },
  { value: 'nutrition', label: 'תזונה',       color: '#C8853A' },
  { value: 'learning',  label: 'לימוד',       color: '#2B6CB0' },
  { value: 'rest',      label: 'מנוחה',       color: '#553C9A' },
  { value: 'family',    label: 'משפחה',       color: '#8B5E3C' },
  { value: 'sleep',     label: 'לילה',        color: '#424752' },
];

function Toggle({ checked, onChange }) {
  return (
    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <div style={{ width: 52, height: 30, backgroundColor: checked ? '#00478d' : '#c2c6d4', borderRadius: 99, position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 'calc(100% - 27px)' : 3, width: 24, height: 24, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
      </div>
    </label>
  );
}

function Section({ icon, title, children }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(194,198,212,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #e5e1e9' }}>
        <span className="material-symbols-outlined" style={{ color: '#00478d', fontSize: 22 }}>{icon}</span>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Block Form Modal ────────────────────────────────────────────────────────────

function BlockFormModal({ block, wakeHour, wakeMin, onClose, onSaved }) {
  const toTime = (offsetMins) => {
    const total = wakeHour * 60 + wakeMin + (offsetMins || 0);
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };
  const toOffset = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return Math.max(0, h * 60 + m - wakeHour * 60 - wakeMin);
  };

  const [name,     setName]     = useState(block?.block_name     || block?.name     || '');
  const [icon,     setIcon]     = useState(block?.icon           || '📌');
  const [startTime,setStartTime]= useState(block ? toTime(block.offset_mins ?? block.offsetMins ?? 0) : toTime(0));
  const [duration, setDuration] = useState(block?.duration_mins  || block?.durationMins || 30);
  const [category, setCategory] = useState(block?.category       || 'learning');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const catColor = CATEGORIES.find(c => c.value === category)?.color || '#727783';

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(null);
    const payload = {
      block_name:    name.trim(),
      icon,
      offset_mins:   toOffset(startTime),
      duration_mins: Number(duration),
      category,
      color:         catColor,
    };
    try {
      if (block?.id) await api.updateBlock(block.id, payload);
      else           await api.createBlock(payload);
      onSaved();
      onClose();
    } catch { setError('שגיאה בשמירה. נסה שוב.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,27,32,0.55)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: '#fdf8ff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, padding: '0 20px 32px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ width: 40, height: 4, backgroundColor: '#c2c6d4', borderRadius: 99, margin: '12px auto 20px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1c1b20', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: '#00478d', fontSize: 22 }}>{block ? 'edit' : 'add_circle'}</span>
          {block ? 'ערוך בלוק' : 'בלוק חדש'}
        </h3>

        {/* Icon + Name */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={2}
            style={{ width: 54, textAlign: 'center', fontSize: 24, ...inputSt, marginBottom: 0, flexShrink: 0 }} />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="שם הבלוק *"
            style={{ ...inputSt, marginBottom: 0, flex: 1 }} autoFocus />
        </div>

        {/* Time + Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelSt}>שעת התחלה</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>משך (דקות)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={5} max={240} style={inputSt} />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelSt}>קטגוריה</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
                padding: '6px 12px', borderRadius: 99, border: '2px solid',
                borderColor: category === cat.value ? cat.color : '#e5e1e9',
                backgroundColor: category === cat.value ? cat.color + '18' : 'transparent',
                color: category === cat.value ? cat.color : '#424752',
                fontSize: 12, fontWeight: category === cat.value ? 700 : 400, cursor: 'pointer',
              }}>{cat.label}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#ba1a1a', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={cancelBtnSt}>ביטול</button>
          <button onClick={save} disabled={saving || !name.trim()} style={{
            ...saveBtnSt,
            backgroundColor: saving || !name.trim() ? '#c2c6d4' : '#00478d',
            cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Blocks Manager ──────────────────────────────────────────────────────────────

function BlocksManager({ wakeHour, wakeMin }) {
  const [blocks,   setBlocks]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);   // block object or 'new'
  const [deleting, setDeleting] = useState(null);

  const toTime = (offsetMins) => {
    const total = wakeHour * 60 + wakeMin + offsetMins;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSchedule();
      setBlocks(data);
    } catch { /* keep existing */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (block) => {
    setDeleting(block.id);
    try { await api.deleteBlock(block.id); load(); }
    catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  const catColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || '#c2c6d4';

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          [1,2,3].map(i => <div key={i} style={{ height: 56, borderRadius: 12, backgroundColor: '#f1ecf4', animation: 'pulse 1.5s ease-in-out infinite' }} />)
        ) : blocks.map(b => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#f7f2fa', borderRadius: 12, padding: '10px 12px', borderRight: `3px solid ${catColor(b.category)}` }}>
            <span style={{ fontSize: 20 }}>{b.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1b20', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{b.block_name}</div>
              <div style={{ fontSize: 11, color: '#727783', fontFamily: 'monospace' }}>{toTime(b.offset_mins)} · {b.duration_mins} דק׳</div>
            </div>
            <button onClick={() => setEditing(b)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#727783', padding: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
            </button>
            <button onClick={() => handleDelete(b)} disabled={deleting === b.id}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c2c6d4', padding: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ba1a1a'}
              onMouseLeave={e => e.currentTarget.style.color = '#c2c6d4'}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {deleting === b.id ? 'hourglass_empty' : 'delete'}
              </span>
            </button>
          </div>
        ))}

        <button onClick={() => setEditing('new')} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '11px 0', borderRadius: 12, border: '2px dashed #c2c6d4',
          backgroundColor: 'transparent', color: '#00478d', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          הוסף בלוק
        </button>
      </div>

      {editing && (
        <BlockFormModal
          block={editing === 'new' ? null : editing}
          wakeHour={wakeHour} wakeMin={wakeMin}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const [wakeTime,     setWakeTime]     = useState('05:00');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [volume,       setVolume]       = useState(75);
  const [voice,        setVoice]        = useState('hila');
  const [targetCigs,   setTargetCigs]   = useState(20);
  const [saved,        setSaved]        = useState(false);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    api.getSettings().then(s => {
      const h = String(s.wake_hour   ?? '5').padStart(2, '0');
      const m = String(s.wake_minute ?? '0').padStart(2, '0');
      setWakeTime(`${h}:${m}`);
      if (s.voice_enabled     !== undefined) setVoiceEnabled(s.voice_enabled === 'true');
      if (s.voice_volume      !== undefined) setVolume(Math.round(parseFloat(s.voice_volume) * 100));
      if (s.voice_name        !== undefined) setVoice(s.voice_name);
      if (s.target_cigarettes !== undefined) setTargetCigs(Number(s.target_cigarettes));
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const [h, m] = wakeTime.split(':');
      await Promise.all([
        api.updateSetting('wake_hour',         h),
        api.updateSetting('wake_minute',       m),
        api.updateSetting('voice_enabled',     String(voiceEnabled)),
        api.updateSetting('voice_volume',      String(volume / 100)),
        api.updateSetting('voice_name',        voice),
        api.updateSetting('target_cigarettes', String(targetCigs)),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('שגיאה בשמירה. בדוק שהשרת פועל.');
    } finally {
      setSaving(false);
    }
  };

  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 768, margin: '0 auto', paddingBottom: 120 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: '#1c1b20' }}>הגדרות מערכת</h2>
        <p style={{ fontSize: 14, color: '#424752', margin: 0 }}>נהל את שגרת היום והעדפות השיקום שלך</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Wake time */}
        <Section icon="schedule" title="שעת קימה">
          <div>
            <label style={{ fontSize: 13, color: '#424752', display: 'block', marginBottom: 6, fontWeight: 500 }}>קימה יומית</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} style={{
                backgroundColor: '#f7f2fa', border: '1px solid #c2c6d4',
                color: '#1c1b20', padding: '10px 14px', borderRadius: 10, fontSize: 22,
                outline: 'none', fontFamily: 'monospace', fontWeight: 700,
              }} />
              <span style={{ fontSize: 13, color: '#727783' }}>כל הבלוקים יחושבו מהשעה הזו</span>
            </div>
          </div>
        </Section>

        {/* Blocks manager */}
        <Section icon="view_agenda" title="ניהול בלוקים יומיים">
          <BlocksManager wakeHour={wakeHour || 5} wakeMin={wakeMin || 0} />
        </Section>

        {/* AI Commander */}
        <Section icon="smart_toy" title="הגדרות מפקדת AI">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 2px' }}>הפעלה קולית</p>
                <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>אפשר למפקדת ה-AI לתקשר איתך בקול</p>
              </div>
              <Toggle checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#424752' }}>עוצמת שמע</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#00478d' }}>{volume}%</span>
              </div>
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#00478d', height: 6, cursor: 'pointer' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#424752', display: 'block', marginBottom: 6 }}>בחירת קול</label>
              <select value={voice} onChange={e => setVoice(e.target.value)} style={{
                width: '100%', backgroundColor: '#f7f2fa', border: '1px solid #c2c6d4',
                color: '#1c1b20', padding: '10px 14px', borderRadius: 10, fontSize: 14,
                outline: 'none', cursor: 'pointer', fontFamily: 'Arimo, Arial, sans-serif',
              }}>
                <option value="hila">הילה – קול נשי ישראלי</option>
                <option value="avri">אברי – קול גברי ישראלי</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Rehab goals */}
        <Section icon="rebase_edit" title="יעדי שיקום">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#424752', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                🚬 יעד סיגריות יומי
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="range" min={0} max={40} step={1} value={targetCigs}
                  onChange={e => setTargetCigs(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#ba1a1a', cursor: 'pointer' }} />
                <span style={{ fontSize: 20, fontWeight: 700, color: '#ba1a1a', minWidth: 32 }}>{targetCigs}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#727783', marginTop: 4 }}>
                <span>0 (גמילה)</span><span>40</span>
              </div>
            </div>
          </div>
        </Section>

        {/* System */}
        <Section icon="settings_suggest" title="מערכת">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { icon: 'cloud_upload',   label: 'גיבוי נתונים',   sub: 'Supabase – מסונכרן אוטומטית' },
              { icon: 'smart_toy',      label: 'מנוע AI',         sub: 'Claude Sonnet 4.6 (Anthropic)' },
              { icon: 'volume_up',      label: 'מנוע קול',        sub: 'edge-tts · he-IL-HilaNeural' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: '#424752', fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 12, color: '#727783', margin: 0 }}>{item.sub}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#006d41', fontSize: 12, fontWeight: 600 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  פעיל
                </div>
              </div>
            ))}
          </div>
        </Section>

        <p style={{ fontSize: 11, color: '#727783', textAlign: 'center' }}>גרסה 1.0.0 · אופק חדש Alpha</p>
      </div>

      {/* FAB Save */}
      <div style={{ position: 'fixed', bottom: 80, left: 20, zIndex: 50 }}>
        <button onClick={save} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: saved ? '#006d41' : saving ? '#727783' : '#00478d',
          color: '#fff', border: 'none', borderRadius: 16, padding: '14px 22px',
          fontWeight: 700, fontSize: 15, cursor: saving ? 'wait' : 'pointer',
          boxShadow: '0 4px 16px rgba(0,71,141,0.3)', transition: 'background 0.2s',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {saved ? 'check_circle' : saving ? 'hourglass_empty' : 'save'}
          </span>
          {saved ? 'נשמר!' : saving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}

const inputSt = {
  width: '100%', backgroundColor: '#f7f2fa', color: '#1c1b20',
  padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e1e9',
  fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box',
  fontFamily: 'Arimo, Arial, sans-serif',
};
const labelSt     = { fontSize: 12, color: '#424752', fontWeight: 600, display: 'block', marginBottom: 4 };
const cancelBtnSt = { flex: 1, padding: '12px 0', borderRadius: 12, border: '2px solid #e5e1e9', backgroundColor: 'transparent', color: '#424752', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const saveBtnSt   = { flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' };
