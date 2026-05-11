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
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-12 h-7 rounded-full transition-colors peer-focus:outline-none relative
        ${checked ? 'bg-secondary' : 'bg-outline-variant'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all
          ${checked ? 'right-1' : 'right-6'}`} />
      </div>
    </label>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 flex flex-col gap-4 border border-outline-variant/30">
      <div className="flex items-center gap-2 text-primary pb-3 border-b border-outline-variant/30">
        <span className="material-symbols-outlined">{icon}</span>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Block Form Modal ───────────────────────────────────────────────────────────

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

  const [name,      setName]      = useState(block?.block_name || block?.name || '');
  const [icon,      setIcon]      = useState(block?.icon || '📌');
  const [startTime, setStartTime] = useState(block ? toTime(block.offset_mins ?? block.offsetMins ?? 0) : toTime(0));
  const [duration,  setDuration]  = useState(block?.duration_mins || block?.durationMins || 30);
  const [category,  setCategory]  = useState(block?.category || 'learning');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  const catColor = CATEGORIES.find(c => c.value === category)?.color || '#727783';

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(null);
    const payload = {
      block_name: name.trim(), icon,
      offset_mins: toOffset(startTime), duration_mins: Number(duration),
      category, color: catColor,
    };
    try {
      if (block?.id) await api.updateBlock(block.id, payload);
      else           await api.createBlock(payload);
      onSaved(); onClose();
    } catch { setError('שגיאה בשמירה. נסה שוב.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-on-surface/50 z-[300] flex items-end justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-background rounded-t-3xl w-full max-w-lg px-5 pb-8 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto my-3" />
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">{block ? 'edit' : 'add_circle'}</span>
          {block ? 'ערוך בלוק' : 'בלוק חדש'}
        </h3>

        <div className="flex gap-2 mb-3">
          <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={2}
            className="w-14 text-center text-2xl bg-surface-container-low border border-outline-variant rounded-xl p-2 shrink-0" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="שם הבלוק *"
            autoFocus className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1">שעת התחלה</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-1">משך (דקות)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={5} max={240}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-on-surface-variant font-medium block mb-2">קטגוריה</label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className="px-3 py-1 rounded-full text-xs font-medium border-2 transition-all cursor-pointer"
                style={{
                  borderColor: category === cat.value ? cat.color : '#e5e1e9',
                  backgroundColor: category === cat.value ? cat.color + '18' : 'transparent',
                  color: category === cat.value ? cat.color : '#424752',
                  fontWeight: category === cat.value ? 700 : 400,
                }}>{cat.label}</button>
            ))}
          </div>
        </div>

        {error && <p className="text-error text-xs text-center mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-outline-variant bg-transparent text-on-surface-variant font-medium text-sm cursor-pointer">
            ביטול
          </button>
          <button onClick={save} disabled={saving || !name.trim()}
            className={`flex-[2] py-3 rounded-xl border-none text-on-primary font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors
              ${saving || !name.trim() ? 'bg-outline-variant' : 'bg-primary'}`}>
            <span className="material-symbols-outlined text-base">check_circle</span>
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Blocks Manager ─────────────────────────────────────────────────────────────

function BlocksManager({ wakeHour, wakeMin }) {
  const [blocks,   setBlocks]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);

  const toTime = (offsetMins) => {
    const total = wakeHour * 60 + wakeMin + offsetMins;
    const h = Math.floor(total / 60) % 24;
    const m = total % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setBlocks(await api.getSchedule()); }
    catch { /* keep */ }
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
      <div className="flex flex-col gap-2">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-surface-container animate-pulse" />)
        ) : blocks.map(b => (
          <div key={b.id} className="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5 border-r-4"
            style={{ borderRightColor: catColor(b.category) }}>
            <span className="text-xl">{b.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-on-surface truncate">{b.block_name}</div>
              <div className="text-xs text-on-surface-variant font-mono">{toTime(b.offset_mins)} · {b.duration_mins} דק׳</div>
            </div>
            <button onClick={() => setEditing(b)} className="p-1 text-on-surface-variant bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onClick={() => handleDelete(b)} disabled={deleting === b.id}
              className="p-1 text-outline bg-transparent border-none cursor-pointer">
              <span className="material-symbols-outlined text-lg text-error/60">
                {deleting === b.id ? 'hourglass_empty' : 'delete'}
              </span>
            </button>
          </div>
        ))}

        <button onClick={() => setEditing('new')}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant bg-transparent text-primary font-semibold text-sm cursor-pointer">
          <span className="material-symbols-outlined text-lg">add</span>
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
    </>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

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
        api.updateSetting('target_cigarettes', String(targetCigs)),
      ]);
      // voice_name saved separately – best effort (may not exist in DB yet)
      api.updateSetting('voice_name', voice).catch(() => {});
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
    <div dir="rtl" className="px-5 pt-6 pb-32 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">הגדרות מערכת</h2>
        <span className="material-symbols-outlined text-primary text-3xl">settings</span>
      </div>

      {/* Wake time */}
      <Section icon="schedule" title="שגרה יומית">
        <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
          <div>
            <span className="text-sm font-medium text-on-surface block">זמן יקיצה</span>
            <span className="text-xs text-on-surface-variant">הגדר מתי מתחיל היום שלך</span>
          </div>
          <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
            className="bg-transparent border-none font-bold text-primary text-xl font-mono focus:outline-none" />
        </div>
      </Section>

      {/* Blocks manager */}
      <Section icon="view_agenda" title="ניהול בלוקים יומיים">
        <BlocksManager wakeHour={wakeHour || 5} wakeMin={wakeMin || 0} />
      </Section>

      {/* AI Commander */}
      <Section icon="smart_toy" title="מפקד AI">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-on-surface">פקודות קוליות</span>
          <Toggle checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} />
        </div>

        <div className="flex flex-col gap-1.5 py-1">
          <div className="flex justify-between">
            <span className="text-sm text-on-surface">עוצמת קול</span>
            <span className="text-xs text-on-surface-variant">{volume}%</span>
          </div>
          <input type="range" min={0} max={100} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>

        <div className="flex flex-col gap-1.5 py-1">
          <span className="text-sm text-on-surface">בחירת קול</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'hila', label: 'הילה (אישה)' },
              { id: 'avri', label: 'אברי (גבר)' },
            ].map(v => (
              <button key={v.id} onClick={() => setVoice(v.id)}
                className={`py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 border-2 cursor-pointer transition-all
                  ${voice === v.id
                    ? 'bg-secondary-container text-on-secondary-container border-secondary'
                    : 'bg-surface-container-high text-on-surface-variant border-transparent'}`}>
                {voice === v.id && (
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Rehab goals */}
      <Section icon="rebase_edit" title="יעדי שיקום">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-on-surface">🚬 יעד סיגריות יומי</span>
            <span className="text-lg font-bold text-error">{targetCigs}</span>
          </div>
          <input type="range" min={0} max={40} step={1} value={targetCigs}
            onChange={e => setTargetCigs(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-error" />
          <div className="flex justify-between text-xs text-on-surface-variant mt-1">
            <span>0 (גמילה)</span><span>40</span>
          </div>
        </div>
      </Section>

      {/* System */}
      <Section icon="manage_accounts" title="מערכת וחשבון">
        {[
          { icon: 'cloud_upload', label: 'גיבוי נתונים',  sub: 'Supabase – מסונכרן אוטומטית' },
          { icon: 'smart_toy',   label: 'מנוע AI',        sub: 'Claude Sonnet 4.6' },
          { icon: 'volume_up',   label: 'מנוע קול',       sub: 'edge-tts · he-IL-HilaNeural' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
              <div>
                <p className="text-sm font-medium text-on-surface">{item.label}</p>
                <p className="text-xs text-on-surface-variant">{item.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              פעיל
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-outline-variant/20">
          <button onClick={() => { localStorage.removeItem('ofek_user'); window.location.reload(); }}
            className="flex items-center gap-2 p-3 text-error w-full font-medium text-sm bg-transparent border-none cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            התנתקות מהמערכת
          </button>
        </div>
      </Section>

      <p className="text-xs text-on-surface-variant text-center">גרסה 1.1.0 · אופק חדש Alpha</p>

      {/* Save FAB */}
      <div className="fixed bottom-20 left-5 z-50" style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={save} disabled={saving}
          className={`flex items-center gap-2 text-on-primary rounded-2xl px-5 py-3 font-bold text-sm border-none cursor-pointer shadow-xl transition-colors
            ${saved ? 'bg-secondary' : saving ? 'bg-outline' : 'bg-primary'}`}>
          <span className="material-symbols-outlined text-lg">
            {saved ? 'check_circle' : saving ? 'hourglass_empty' : 'save'}
          </span>
          {saved ? 'נשמר!' : saving ? 'שומר...' : 'שמור הגדרות'}
        </button>
      </div>
    </div>
  );
}
