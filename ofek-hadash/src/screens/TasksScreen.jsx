import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const RECURRENCE_OPTIONS = [
  { value: 'once',    label: 'חד-פעמי' },
  { value: 'daily',   label: 'יומי' },
  { value: 'weekly',  label: 'שבועי' },
  { value: 'weekdays', label: 'א-ה' },
];


function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ backgroundColor: '#f1ecf4', borderRadius: 14, height: 60,
          animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

function AddTaskDrawer({ onClose, onSaved }) {
  const [title,      setTitle]      = useState('');
  const [dueDate,    setDueDate]    = useState('');
  const [dueTime,    setDueTime]    = useState('');
  const [recurrence, setRecurrence] = useState('once');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api.createTask({
        title: title.trim(),
        due_date:   dueDate  || null,
        due_time:   dueTime  || null,
        recurrence,
      });
      onSaved();
      onClose();
    } catch {
      setError('שגיאה בשמירה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,27,32,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ backgroundColor: '#fdf8ff', borderRadius: '20px 20px 0 0', padding: 24,
        width: '100%', maxWidth: 480, boxShadow: '0 -4px 24px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 40, height: 4, backgroundColor: '#c2c6d4', borderRadius: 99, margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1c1b20',
          display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ color: '#00478d', fontSize: 22 }}>add_task</span>
          משימה חדשה
        </h3>

        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="שם המשימה *" autoFocus
          style={inputSt} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelSt}>תאריך יעד</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputSt} />
          </div>
          <div>
            <label style={labelSt}>שעה</label>
            <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} style={inputSt} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelSt}>חזרה</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RECURRENCE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setRecurrence(opt.value)} style={{
                padding: '6px 14px', borderRadius: 99, border: '2px solid',
                borderColor: recurrence === opt.value ? '#00478d' : '#e5e1e9',
                backgroundColor: recurrence === opt.value ? 'rgba(0,71,141,0.08)' : 'transparent',
                color: recurrence === opt.value ? '#00478d' : '#424752',
                fontSize: 13, fontWeight: recurrence === opt.value ? 700 : 400, cursor: 'pointer',
              }}>{opt.label}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#ba1a1a', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={cancelBtnSt}>ביטול</button>
          <button onClick={save} disabled={saving || !title.trim()} style={{
            ...saveBtnSt,
            backgroundColor: saving || !title.trim() ? '#c2c6d4' : '#00478d',
            cursor: saving || !title.trim() ? 'not-allowed' : 'pointer',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            {saving ? 'שומר...' : 'הוסף משימה'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    await onToggle(task.id, !task.completed);
    setBusy(false);
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    await onDelete(task.id);
    // component unmounts after delete
  };

  const recLabel = RECURRENCE_OPTIONS.find(o => o.value === task.recurrence)?.label;

  return (
    <div style={{ backgroundColor: task.completed ? '#f7f2fa' : '#ffffff', borderRadius: 14,
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', alignItems: 'center', gap: 12, opacity: task.completed ? 0.6 : 1,
      border: '1px solid #f1ecf4', transition: 'opacity 0.2s' }}>
      <button onClick={handleToggle} disabled={busy} style={{ width: 24, height: 24, borderRadius: 6,
        flexShrink: 0, border: task.completed ? '2px solid #006d41' : '2px solid #c2c6d4',
        backgroundColor: task.completed ? '#006d41' : 'transparent',
        cursor: busy ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {task.completed && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>check</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500,
          textDecoration: task.completed ? 'line-through' : 'none', color: '#1c1b20',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {task.due_date && (
            <span style={{ fontSize: 11, color: '#727783', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>calendar_today</span>
              {task.due_date}{task.due_time ? ` ${task.due_time.slice(0,5)}` : ''}
            </span>
          )}
          {task.recurrence && task.recurrence !== 'once' && (
            <span style={{ fontSize: 11, color: '#00478d', backgroundColor: 'rgba(0,71,141,0.08)',
              padding: '1px 8px', borderRadius: 99 }}>
              🔁 {recLabel}
            </span>
          )}
        </div>
      </div>

      <button onClick={handleDelete} disabled={busy}
        style={{ background: 'none', border: 'none', cursor: busy ? 'wait' : 'pointer',
          color: '#c2c6d4', padding: 4, flexShrink: 0,
          transition: 'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#ba1a1a'}
        onMouseLeave={e => e.currentTarget.style.color = '#c2c6d4'}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
      </button>
    </div>
  );
}

export default function TasksScreen() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [filter,   setFilter]   = useState('all'); // all | open | done

  const load = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, completed) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    try { await api.toggleTask(id, completed); } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDelete = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try { await api.deleteTask(id); } catch {
      load(); // reload on failure
    }
  };

  const visible = tasks.filter(t =>
    filter === 'all'  ? true :
    filter === 'open' ? !t.completed :
    t.completed
  );
  const openCount = tasks.filter(t => !t.completed).length;
  const doneCount = tasks.filter(t =>  t.completed).length;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: '#1c1b20' }}>משימות</h2>
          <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>
            {openCount} פתוחות · {doneCount} הושלמו
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#00478d',
          color: '#fff', border: 'none', borderRadius: 99, padding: '10px 18px',
          fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          הוסף
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['all','הכל'],['open','פתוחות'],['done','הושלמו']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding: '6px 16px', borderRadius: 99, border: '2px solid',
            borderColor: filter === v ? '#00478d' : '#e5e1e9',
            backgroundColor: filter === v ? 'rgba(0,71,141,0.08)' : 'transparent',
            color: filter === v ? '#00478d' : '#424752',
            fontSize: 13, fontWeight: filter === v ? 700 : 400, cursor: 'pointer',
          }}>{l}</button>
        ))}
      </div>

      {/* Tasks list */}
      {loading ? <Skeleton /> : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#727783' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 12, color: '#c2c6d4' }}>
            {filter === 'done' ? 'task_alt' : 'checklist'}
          </span>
          <p style={{ margin: 0, fontSize: 14 }}>
            {filter === 'done' ? 'אין משימות שהושלמו עדיין' :
             filter === 'open' ? 'כל המשימות הושלמו!' :
             'אין משימות. לחץ + להוסיף'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(task => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAdd && <AddTaskDrawer onClose={() => setShowAdd(false)} onSaved={load} />}
    </div>
  );
}

// shared styles
const inputSt = {
  width: '100%', backgroundColor: '#f7f2fa', color: '#1c1b20',
  padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e1e9',
  fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box',
  fontFamily: 'Arimo, Arial, sans-serif',
};
const labelSt  = { fontSize: 12, color: '#424752', fontWeight: 600, display: 'block', marginBottom: 4 };
const cancelBtnSt = { flex: 1, padding: '12px 0', borderRadius: 12, border: '2px solid #e5e1e9', backgroundColor: 'transparent', color: '#424752', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const saveBtnSt   = { flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s' };
