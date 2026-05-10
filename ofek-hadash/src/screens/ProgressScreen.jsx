import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

const tooltipStyle = {
  background: '#fff', border: '1px solid #e5e1e9',
  borderRadius: 8, color: '#1c1b20', fontSize: 12,
};

function ChartCard({ title, icon, children }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(194,198,212,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span className="material-symbols-outlined" style={{ color: '#424752', fontSize: 18 }}>{icon}</span>
        <h3 style={{ fontSize: 14, color: '#424752', margin: 0, fontWeight: 600 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatChip({ icon, value, label, color, bg }) {
  return (
    <div style={{ backgroundColor: bg, borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 120px' }}>
      <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1c1b20', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 11, color: '#424752' }}>{label}</div>
      </div>
    </div>
  );
}

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
        api.getWeekly(),
        api.getToday(),
        api.getExerciseToday(),
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

  const avg     = weekly.length ? Math.round(weekly.reduce((s, d) => s + d.score,         0) / weekly.length) : 0;
  const avgCigs = weekly.length ? Math.round(weekly.reduce((s, d) => s + d.cigarettes,    0) / weekly.length) : 0;
  const avgEx   = weekly.length ? Math.round(weekly.reduce((s, d) => s + d.exercise_mins, 0) / weekly.length) : 0;

  const today = todayStats ?? { score: 0, completed: 0, total: 0, cigarettes: 0 };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 768, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: '#1c1b20' }}>התקדמות</h2>
          <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>7 ימים אחרונים</p>
        </div>
        <button onClick={() => setShowExModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: '#006d41', color: '#fff',
          border: 'none', borderRadius: 99, padding: '10px 18px',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fitness_center</span>
          רשום פעילות
        </button>
      </div>

      {/* Today card */}
      <div style={{ backgroundColor: '#005eb8', color: '#c8daff', borderRadius: 16, padding: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>ציון היום</div>
          <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{today.score}%</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
            {today.completed} מתוך {today.total} בלוקים הושלמו
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>smoking_rooms</span>
            <span>{today.cigarettes} סיגריות</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fitness_center</span>
            <span>{exerciseMins} דקות פעילות</span>
          </div>
        </div>
      </div>

      {/* 7-day averages */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <StatChip icon="trending_up"    value={`${avg}%`}      label="ממוצע יומי"     color="#006d41" bg="rgba(144,244,183,0.3)" />
        <StatChip icon="smoking_rooms"  value={avgCigs}         label="סיגריות ממוצע" color="#ba1a1a" bg="rgba(186,26,26,0.08)" />
        <StatChip icon="fitness_center" value={`${avgEx}′`}    label="פעילות ממוצע"  color="#00478d" bg="rgba(0,71,141,0.08)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Cigarette counter */}
        <CigaretteCounter />

        {/* Score chart */}
        <ChartCard title="ציון יומי – 7 ימים" icon="bar_chart">
          {loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#727783' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1.5s linear infinite' }}>hourglass_empty</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekly}>
                <XAxis dataKey="day" tick={{ fill: '#727783', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#727783', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'ציון']} />
                <Bar dataKey="score" fill="#00478d" radius={[6, 6, 0, 0]}
                  label={{ position: 'top', fontSize: 10, fill: '#727783', formatter: v => v > 0 ? `${v}%` : '' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Exercise chart */}
        <ChartCard title="פעילות גופנית – דקות" icon="fitness_center">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weekly}>
              <XAxis dataKey="day" tick={{ fill: '#727783', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#727783', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} דק׳`, 'פעילות']} />
              <Bar dataKey="exercise_mins" fill="#006d41" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cigarettes chart */}
        <ChartCard title="סיגריות ביום" icon="smoking_rooms">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weekly}>
              <XAxis dataKey="day" tick={{ fill: '#727783', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#727783', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'סיגריות']} />
              <Line dataKey="cigarettes" stroke="#ba1a1a" strokeWidth={2}
                dot={{ fill: '#ba1a1a', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {showExModal && (
        <ExerciseLogModal
          onClose={() => setShowExModal(false)}
          onSaved={loadData}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
