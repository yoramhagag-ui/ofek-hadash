import { useState, useEffect, useRef } from 'react';
import { getBlockContent, getExerciseSession, AI_COURSE } from '../data/blockContent';

// ── Timer ──────────────────────────────────────────────────────────────────────

function BlockTimer({ totalMinutes, onDone }) {
  const [secondsLeft, setSecondsLeft] = useState(totalMinutes * 60);
  const [running,     setRunning]     = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    } else if (secondsLeft === 0) {
      onDone?.();
    }
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct  = ((totalMinutes * 60 - secondsLeft) / (totalMinutes * 60)) * 100;

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px' }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e1e9" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="#006d41" strokeWidth="8"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: '#1c1b20' }}>
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </span>
          <span style={{ fontSize: 11, color: '#727783' }}>מתוך {totalMinutes} דק׳</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => setRunning(r => !r)} style={{
          backgroundColor: running ? '#C8853A' : '#006d41', color: '#fff',
          border: 'none', borderRadius: 99, padding: '10px 28px',
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {running ? 'pause' : 'play_arrow'}
          </span>
          {running ? 'השהה' : secondsLeft === totalMinutes * 60 ? 'התחל' : 'המשך'}
        </button>
        <button onClick={() => setSecondsLeft(totalMinutes * 60)} style={{
          backgroundColor: 'transparent', color: '#727783',
          border: '2px solid #e5e1e9', borderRadius: 99, padding: '10px 16px',
          cursor: 'pointer', fontSize: 14,
        }}>אפס</button>
      </div>
    </div>
  );
}

// ── Exercise View ──────────────────────────────────────────────────────────────

function ExerciseView({ session, onDone }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phase = session.sets?.[phaseIdx];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {session.sets?.map((s, i) => (
          <button key={i} onClick={() => setPhaseIdx(i)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 99, border: '2px solid',
            borderColor: phaseIdx === i ? '#00478d' : '#e5e1e9',
            backgroundColor: phaseIdx === i ? 'rgba(0,71,141,0.08)' : 'transparent',
            color: phaseIdx === i ? '#00478d' : '#424752',
            fontSize: 12, fontWeight: phaseIdx === i ? 700 : 400, cursor: 'pointer',
          }}>{s.icon} {s.phase}</button>
        ))}
      </div>

      {phase && (
        <div style={{ backgroundColor: '#f7f2fa', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#1c1b20' }}>
            {phase.icon} {phase.phase} — {phase.minutes} דקות
          </div>
          {phase.details && (
            <p style={{ fontSize: 14, color: '#424752', margin: '0 0 8px', lineHeight: 1.6 }}>{phase.details}</p>
          )}
          {phase.exercises?.map((ex, i) => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1c1b20' }}>{ex.name}</span>
                <span style={{ fontSize: 12, backgroundColor: '#005eb8', color: '#c8daff', padding: '2px 8px', borderRadius: 99, flexShrink: 0, marginRight: 8 }}>{ex.reps}</span>
              </div>
              {ex.tip && <p style={{ fontSize: 12, color: '#727783', margin: '4px 0 0' }}>💡 {ex.tip}</p>}
            </div>
          ))}
        </div>
      )}

      <BlockTimer totalMinutes={session.duration} onDone={onDone} />

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button onClick={() => setPhaseIdx(i => Math.max(0, i - 1))} disabled={phaseIdx === 0}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #e5e1e9', backgroundColor: 'transparent', color: '#424752', fontWeight: 600, cursor: phaseIdx === 0 ? 'not-allowed' : 'pointer', opacity: phaseIdx === 0 ? 0.4 : 1 }}>
          ← שלב קודם
        </button>
        {phaseIdx < (session.sets?.length ?? 0) - 1 ? (
          <button onClick={() => setPhaseIdx(i => i + 1)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', backgroundColor: '#00478d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            שלב הבא →
          </button>
        ) : (
          <button onClick={onDone}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', backgroundColor: '#006d41', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
            סיימתי האימון!
          </button>
        )}
      </div>
    </div>
  );
}

// ── Checklist View ─────────────────────────────────────────────────────────────

function ChecklistView({ content, onDone }) {
  const [checked, setChecked] = useState({});
  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = content.items.length;
  const allDone = doneCount === total;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#424752' }}>
          <span>{doneCount}/{total} הושלמו</span>
          <span>{Math.round((doneCount/total)*100)}%</span>
        </div>
        <div style={{ height: 6, backgroundColor: '#e5e1e9', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(doneCount/total)*100}%`, backgroundColor: '#006d41', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {content.items.map(item => (
          <div key={item.id} onClick={() => toggle(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            backgroundColor: checked[item.id] ? 'rgba(0,109,65,0.08)' : '#f7f2fa',
            borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
            border: `2px solid ${checked[item.id] ? '#006d41' : 'transparent'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              border: checked[item.id] ? '2px solid #006d41' : '2px solid #c2c6d4',
              backgroundColor: checked[item.id] ? '#006d41' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {checked[item.id] && <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#fff' }}>check</span>}
            </div>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: checked[item.id] ? '#727783' : '#1c1b20',
              textDecoration: checked[item.id] ? 'line-through' : 'none', flex: 1 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      <button onClick={onDone} disabled={!allDone} style={{
        width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
        backgroundColor: allDone ? '#006d41' : '#c2c6d4',
        color: '#fff', fontWeight: 700, fontSize: 15,
        cursor: allDone ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        transition: 'background 0.3s',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
          {allDone ? 'check_circle' : 'lock'}
        </span>
        {allDone ? 'בלוק הושלם!' : `השלם עוד ${total - doneCount} פריטים`}
      </button>
    </div>
  );
}

// ── AI Course View ─────────────────────────────────────────────────────────────

function AILessonView({ onDone }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const lesson = AI_COURSE[lessonIdx];

  return (
    <div>
      {/* Lesson selector */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {AI_COURSE.map((l, i) => (
          <button key={i} onClick={() => setLessonIdx(i)} style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: '50%', border: '2px solid',
            borderColor: lessonIdx === i ? '#00478d' : '#e5e1e9',
            backgroundColor: lessonIdx === i ? '#00478d' : 'transparent',
            color: lessonIdx === i ? '#fff' : '#424752',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>{l.lesson}</button>
        ))}
      </div>

      {/* Lesson content */}
      <div style={{ backgroundColor: '#f7f2fa', borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{lesson.emoji}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1c1b20' }}>שיעור {lesson.lesson}: {lesson.title}</div>
            <div style={{ fontSize: 12, color: '#727783' }}>⏱ {lesson.duration} · 🎯 {lesson.objective}</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#1c1b20', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {lesson.theory.replace(/\*\*(.*?)\*\*/g, '$1')}
        </div>
      </div>

      {/* Exercise */}
      <div style={{ backgroundColor: 'rgba(0,71,141,0.06)', borderRadius: 14, padding: 16, border: '1px solid rgba(0,71,141,0.15)', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: '#00478d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span>
          {lesson.exercise.title}
        </div>
        <p style={{ fontSize: 14, color: '#1c1b20', margin: '0 0 8px', lineHeight: 1.6 }}>{lesson.exercise.task}</p>
        {lesson.exercise.tip && (
          <p style={{ fontSize: 12, color: '#424752', margin: 0 }}>💡 {lesson.exercise.tip}</p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setLessonIdx(i => Math.max(0, i-1))} disabled={lessonIdx === 0}
          style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #e5e1e9', backgroundColor: 'transparent', color: '#424752', fontWeight: 600, cursor: lessonIdx === 0 ? 'not-allowed' : 'pointer', opacity: lessonIdx === 0 ? 0.4 : 1 }}>
          ← שיעור קודם
        </button>
        {lessonIdx < AI_COURSE.length - 1 ? (
          <button onClick={() => setLessonIdx(i => i+1)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', backgroundColor: '#00478d', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            שיעור הבא →
          </button>
        ) : (
          <button onClick={onDone}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', backgroundColor: '#006d41', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            ✓ סיימתי הקורס!
          </button>
        )}
      </div>
    </div>
  );
}

// ── Meal View ──────────────────────────────────────────────────────────────────

function MealView({ content, blockName, onDone }) {
  const isLunch = blockName?.includes('צהריים');
  const meal = isLunch ? content.meals.lunch : content.meals.breakfast;
  const [chosen, setChosen] = useState(null);

  return (
    <div>
      <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#1c1b20' }}>{meal.icon} {meal.label}</h4>
      <p style={{ fontSize: 13, color: '#424752', margin: '0 0 14px' }}>בחר מה לאכול היום:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {meal.options.map((opt, i) => (
          <div key={i} onClick={() => setChosen(i)} style={{
            padding: 14, borderRadius: 12, cursor: 'pointer',
            border: `2px solid ${chosen === i ? '#006d41' : '#e5e1e9'}`,
            backgroundColor: chosen === i ? 'rgba(0,109,65,0.08)' : '#f7f2fa',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1c1b20' }}>{opt.name}</span>
              <span style={{ fontSize: 12, color: '#727783', backgroundColor: '#e5e1e9', padding: '2px 8px', borderRadius: 99 }}>{opt.kcal} קק"ל</span>
            </div>
            <p style={{ fontSize: 13, color: '#424752', margin: '4px 0 0' }}>{opt.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#f7f2fa', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#424752' }}>💡 טיפים לארוחה</div>
        {meal.tips.map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: '#1c1b20', marginBottom: 4 }}>• {tip}</div>
        ))}
      </div>

      <button onClick={onDone} style={{
        width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
        backgroundColor: '#006d41', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
        סיימתי לאכול
      </button>
    </div>
  );
}

// ── Rest View ──────────────────────────────────────────────────────────────────

function RestView({ content, onDone }) {
  const [proto, setProto] = useState(0);
  const p = content.protocols[proto];
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {content.protocols.map((p, i) => (
          <button key={i} onClick={() => setProto(i)} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid',
            borderColor: proto === i ? '#553C9A' : '#e5e1e9',
            backgroundColor: proto === i ? 'rgba(85,60,154,0.08)' : 'transparent',
            color: proto === i ? '#553C9A' : '#424752',
            fontWeight: proto === i ? 700 : 400, fontSize: 13, cursor: 'pointer',
          }}>{p.icon} {p.name}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {p.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, backgroundColor: '#f7f2fa', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#553C9A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i+1}</span>
            <span style={{ fontSize: 14, color: '#1c1b20', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>
      <BlockTimer totalMinutes={30} onDone={onDone} />
      <button onClick={onDone} style={{ width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 12, border: 'none', backgroundColor: '#553C9A', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
        ✓ סיימתי לנוח
      </button>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────

export default function BlockDetailModal({ block, onClose, onComplete }) {
  const content = getBlockContent(block.category);
  const exercise = getExerciseSession(block.category);

  const handleDone = () => {
    onComplete?.(block.id);
    onClose();
  };

  const renderContent = () => {
    if (block.category === 'exercise' && exercise) {
      return <ExerciseView session={exercise} onDone={handleDone} />;
    }

    if (!content) {
      return (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <span style={{ fontSize: 56 }}>{block.icon}</span>
          <p style={{ fontSize: 15, color: '#424752', margin: '16px 0' }}>
            הקדש {block.durationMins} דקות ל{block.name}.
          </p>
          <BlockTimer totalMinutes={block.durationMins} onDone={handleDone} />
          <button onClick={handleDone} style={{ width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 12, border: 'none', backgroundColor: '#006d41', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            ✓ סיימתי
          </button>
        </div>
      );
    }
    if (content.type === 'checklist') return <ChecklistView content={content} onDone={handleDone} />;
    if (content.type === 'course')    return <AILessonView block={block} onDone={handleDone} />;
    if (content.type === 'meal')      return <MealView content={content} blockName={block.name} onDone={handleDone} />;
    if (content.type === 'timer')     return <RestView content={content} onDone={handleDone} />;
    return null;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,27,32,0.6)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        backgroundColor: '#fdf8ff', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 600,
        maxHeight: '92dvh', overflowY: 'auto',
        padding: '0 20px 32px', boxShadow: '0 -8px 32px rgba(0,0,0,0.2)',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, backgroundColor: '#c2c6d4', borderRadius: 99, margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 12px', borderBottom: '1px solid #e5e1e9', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{block.icon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1c1b20' }}>{block.name}</div>
              <div style={{ fontSize: 12, color: '#727783' }}>{block.durationMins} דקות</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#727783', padding: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>close</span>
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
