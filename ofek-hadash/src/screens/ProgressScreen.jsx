import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import CigaretteCounter from '../components/CigaretteCounter';
import ExerciseLogModal from '../components/ExerciseLogModal';

const MOCK_WEEKLY = [
  { day: 'א׳', score: 55, cigarettes: 18, exercise_mins: 30, completed: 6, total: 11 },
  { day: 'ב׳', score: 70, cigarettes: 15, exercise_mins: 40, completed: 8, total: 11 },
  { day: 'ג׳', score: 45, cigarettes: 20, exercise_mins: 0,  completed: 5, total: 11 },
  { day: 'ד׳', score: 80, cigarettes: 12, exercise_mins: 45, completed: 9, total: 11 },
  { day: 'ה׳', score: 75, cigarettes: 14, exercise_mins: 35, completed: 8, total: 11 },
  { day: 'ו׳', score: 90, cigarettes: 10, exercise_mins: 50, completed: 10, total: 11 },
  { day: 'ש׳', score: 60, cigarettes: 16, exercise_mins: 20, completed: 7, total: 11 },
];

export default function ProgressScreen() {
  const [weekly,       setWeekly]       = useState(MOCK_WEEKLY);
  const [todayStats,   setTodayStats]   = useState(null);
  const [exerciseMins, setExerciseMins] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [showExModal,  setShowExModal]  = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, t, ex] = await Promise.allSettled([
        api.getWeekly(), api.getToday(), api.getExerciseToday(),
      ]);
      if (w.status === 'fulfilled' && w.value?.length) setWeekly(w.value);
      if (t.status === 'fulfilled') setTodayStats(t.value);
      if (ex.status === 'fulfilled') setExerciseMins(ex.value.total_mins ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const avg     = weekly.length ? Math.round(weekly.reduce((s,d) => s + d.score,         0) / weekly.length) : 0;
  const avgCigs = weekly.length ? Math.round(weekly.reduce((s,d) => s + d.cigarettes,    0) / weekly.length) : 0;
  const avgEx   = weekly.length ? Math.round(weekly.reduce((s,d) => s + d.exercise_mins, 0) / weekly.length) : 0;
  const today   = todayStats ?? { score: 0, completed: 0, total: 0, cigarettes: 0 };
  const maxScore = Math.max(...weekly.map(d => d.score), 1);
  const maxEx    = Math.max(...weekly.map(d => d.exercise_mins), 1);

  return (
    <div dir="rtl" className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">התקדמות ומדדים</h2>
          <p className="text-sm text-on-surface-variant">מעקב אחר יעדי השיקום שלך</p>
        </div>
        <button onClick={() => setShowExModal(true)}
          className="flex items-center gap-1.5 bg-primary text-on-primary rounded-full px-4 py-2 font-bold text-sm border-none cursor-pointer shadow-md">
          <span className="material-symbols-outlined text-lg">fitness_center</span>
          רשום פעילות
        </button>
      </div>

      {/* Weekly hero card */}
      <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant">
        <div className="flex justify-between items-start mb-3">
          <div className="bg-secondary-container p-2 rounded-xl text-on-secondary-container">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <span className="text-xs bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-bold">
            {avg >= 70 ? '📈 מצוין!' : avg >= 50 ? '👍 טוב' : '💪 מאמץ'}
          </span>
        </div>
        <h3 className="text-base font-bold mb-1">ציון יומי ממוצע</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-primary">{loading ? '–' : avg}</span>
          <span className="text-sm text-on-surface-variant">/ 100</span>
        </div>
        <div className="mt-3 h-2 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${avg}%` }} />
        </div>
      </section>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: 'task_alt',      value: `${today.score}%`,  label: 'ציון היום',  color: 'text-secondary',   bg: 'bg-secondary-container/30' },
          { icon: 'smoking_rooms', value: today.cigarettes,   label: 'סיגריות',   color: 'text-error',        bg: 'bg-error-container/40' },
          { icon: 'fitness_center',value: `${exerciseMins}′`, label: 'פעילות',    color: 'text-primary',      bg: 'bg-primary-fixed/30' },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-3 flex flex-col items-center text-center gap-0.5`}>
            <span className={`material-symbols-outlined ${s.color} text-2xl`}>{s.icon}</span>
            <span className="text-lg font-bold text-on-surface">{s.value}</span>
            <span className="text-[10px] text-on-surface-variant">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Walking/exercise chart */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border-2 border-secondary-container">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">fitness_center</span>
            <h4 className="font-bold text-base">דקות פעילות</h4>
          </div>
          <span className="text-sm text-on-surface-variant font-mono">{avgEx}′ ממוצע</span>
        </div>
        <div className="flex items-end justify-between gap-1 h-24 mb-3">
          {weekly.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
              <div className="w-full rounded-t transition-all"
                style={{ height: `${(d.exercise_mins / maxEx) * 100}%`, backgroundColor: '#77da9f', minHeight: 4 }} />
              <span className="text-[9px] text-on-surface-variant">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant">
          <div>
            <span className="text-xs text-on-surface-variant">סה״כ שבועי</span>
            <div className="text-xl font-bold text-secondary">{weekly.reduce((s,d)=>s+d.exercise_mins,0)}′</div>
          </div>
          <div className="flex items-center gap-1 text-secondary text-sm font-bold">
            <span className="material-symbols-outlined text-base">arrow_upward</span>
            שיפור
          </div>
        </div>
      </div>

      {/* Smoking card */}
      <div className="bg-primary text-on-primary rounded-2xl p-4 shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary-container opacity-20 rounded-full" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">smoke_free</span>
              <h4 className="font-bold text-base">הפחתת עישון</h4>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">מעקב יומי</span>
          </div>
          <div className="flex items-center gap-6 mb-3">
            <div>
              <span className="text-xs opacity-80">היום</span>
              <div className="text-3xl font-bold">{today.cigarettes} 🚬</div>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div>
              <span className="text-xs opacity-80">ממוצע שבועי</span>
              <div className="text-3xl font-bold">{avgCigs}</div>
            </div>
          </div>
          {/* Score chart mini */}
          <div className="flex items-end gap-1 h-8">
            {weekly.map((d, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${(d.score/maxScore)*100}%`, backgroundColor: 'rgba(255,255,255,0.4)', minHeight: 3 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Daily trends */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary">monitoring</span>
          <h4 className="font-bold text-base">מגמות יומיות</h4>
        </div>
        <div className="space-y-3">
          {[
            { icon: 'self_care',    label: 'ציון יומי ממוצע',   val: `${avg}%`,       color: 'text-secondary',  bg: 'bg-secondary-container' },
            { icon: 'fitness_center',label: 'פעילות גופנית',    val: `${avgEx}′`,      color: 'text-primary',    bg: 'bg-primary-fixed' },
            { icon: 'smoking_rooms', label: 'עישון (ממוצע)',     val: `${avgCigs}`,    color: 'text-error',      bg: 'bg-error-container' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <span className="text-sm font-medium text-on-surface">{item.label}</span>
              </div>
              <span className={`text-lg font-bold ${item.color}`}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-tertiary-container rounded-2xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <h5 className="font-bold text-on-tertiary-container text-base">המשך ככה!</h5>
          <p className="text-sm text-on-tertiary-container opacity-90 mt-0.5">
            כל בלוק שמסמנים מחזק את ההתאוששות.
          </p>
        </div>
        <span className="material-symbols-outlined text-on-tertiary-container text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          emoji_events
        </span>
      </div>

      <CigaretteCounter />

      {showExModal && (
        <ExerciseLogModal onClose={() => setShowExModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}
