import { useState, useEffect } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useWakeTime } from '../hooks/useWakeTime';
import { useBlockAlerts } from '../hooks/useBlockAlerts';
import { getCurrentBlock, getBlockTime, formatTime, getMinutesSinceWake } from '../utils/timeUtils';
import { api } from '../api/client';
import VoiceButton from '../components/VoiceButton';
import CigaretteCounter from '../components/CigaretteCounter';
import BlockDetailModal from '../components/BlockDetailModal';

function ScoreRing({ score }) {
  const r = 40, circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="transparent" stroke="#e5e1e9" strokeWidth="8" />
        <circle cx="48" cy="48" r={r} fill="transparent" stroke="#006d41"
          strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: '#1c1b20', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, color: '#424752', textTransform: 'uppercase' }}>ניקוד</span>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const [now, setNow]           = useState(new Date());
  const [activeBlock, setActiveBlock] = useState(null);
  const [weeklyData, setWeeklyData]   = useState([]);
  const { blocks, completed, toggle, loading } = useSchedule();
  const { wakeHour, wakeMin } = useWakeTime();
  useBlockAlerts(blocks, wakeHour, wakeMin, true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.getWeekly().then(data => setWeeklyData(data)).catch(() => {});
  }, []);

  const elapsed = getMinutesSinceWake(wakeHour, wakeMin);
  const hrs = Math.floor(Math.max(0, elapsed) / 60);
  const mins = Math.max(0, elapsed) % 60;
  const elapsedLabel = elapsed > 0
    ? `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')} ${hrs > 0 ? 'שעות' : 'דקות'} מהקימה`
    : 'בוקר טוב';

  const currentBlock = getCurrentBlock(blocks, wakeHour, wakeMin);
  const currentIndex = currentBlock ? blocks.indexOf(currentBlock) : -1;
  const nextBlock = currentIndex >= 0 ? blocks[currentIndex + 1] : null;

  const completedCount = Object.values(completed).filter(Boolean).length;
  const total = blocks.length;
  const score = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1024, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1c1b20', margin: '0 0 4px' }}>בוקר טוב,</h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#00478d', fontFamily: 'monospace' }}>
              {now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: 14, color: '#424752' }}>{elapsedLabel}</span>
          </div>
          <div style={{ fontSize: 13, color: '#424752', marginTop: 4 }}>
            {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <ScoreRing score={score} />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 32, color: '#727783' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>hourglass_empty</span>
          טוען נתונים...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
        {/* Now block */}
        {currentBlock && (
          <div style={{
            gridColumn: 'span 12', backgroundColor: '#ffffff', borderRadius: 16,
            padding: 20, borderRight: `4px solid ${currentBlock.color || '#00478d'}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden',
          }} className="md:col-span-8">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ backgroundColor: '#005eb8', color: '#c8daff', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>עכשיו</span>
              <span style={{ fontSize: 36 }}>{currentBlock.icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1c1b20' }}>{currentBlock.name}</h3>
              <VoiceButton
                text={`הגיע הזמן ל${currentBlock.name}. בואו נתחיל.`}
                size={20}
              />
            </div>
            <p style={{ fontSize: 14, color: '#424752', margin: '0 0 16px' }}>{currentBlock.durationMins} דקות</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setActiveBlock(currentBlock)} style={{
                backgroundColor: '#00478d', color: '#ffffff', border: 'none',
                borderRadius: 99, padding: '10px 24px', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                התחל עכשיו
              </button>
              {completed[currentBlock.id] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#006d41', fontWeight: 700, fontSize: 14 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                  הושלם
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checklist summary */}
        <div style={{
          gridColumn: 'span 12', backgroundColor: '#f1ecf4', borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }} className="md:col-span-4">
          <span className="material-symbols-outlined" style={{ fontSize: 44, color: '#006d41', marginBottom: 8 }}>task_alt</span>
          <h4 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>סיכום מטלות</h4>
          <p style={{ fontSize: 26, fontWeight: 700, margin: '0 0 2px', color: '#1c1b20' }}>{completedCount} מתוך {total}</p>
          <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>בלוקים הושלמו היום</p>
        </div>

        {/* Next block */}
        {nextBlock && (
          <div style={{
            gridColumn: 'span 12', backgroundColor: '#ffffff', borderRadius: 16, padding: 20,
            borderRight: '4px solid #c2c6d4', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }} className="md:col-span-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#727783', marginBottom: 10 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>בלוק הבא</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{nextBlock.name}</h3>
                <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>{nextBlock.durationMins} דקות</p>
              </div>
              <span style={{ fontSize: 32 }}>{nextBlock.icon}</span>
            </div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#727783', marginTop: 8 }}>
              {formatTime(
                getBlockTime(wakeHour, wakeMin, nextBlock.offsetMins).h,
                getBlockTime(wakeHour, wakeMin, nextBlock.offsetMins).m,
              )}
            </div>
          </div>
        )}

        {/* Weekly mini chart */}
        <div style={{
          gridColumn: 'span 12', backgroundColor: '#005eb8', color: '#c8daff',
          borderRadius: 16, padding: 20,
        }} className="md:col-span-6">
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>התקדמות שבועית</h3>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 16px' }}>אתה בדרך הנכונה!</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 56 }}>
            {(weeklyData.length > 0 ? weeklyData : Array(7).fill({ score: 0 })).map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px 4px 0 0', height: `${Math.max(d.score, 4)}%` }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{d.day || ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cigarette counter */}
        <div style={{ gridColumn: 'span 12' }} className="md:col-span-6">
          <CigaretteCounter />
        </div>

        {/* Full checklist */}
        <div style={{ gridColumn: 'span 12', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e1e9', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: '#00478d', fontSize: 20 }}>checklist</span>
            צ׳קליסט היום
          </div>
          {blocks.map(block => {
            const time = getBlockTime(wakeHour, wakeMin, block.offsetMins);
            const done = completed[block.id];
            return (
              <div key={block.id} onClick={() => toggle(block.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: '1px solid #f1ecf4', cursor: 'pointer',
                backgroundColor: done ? 'rgba(144,244,183,0.15)' : 'transparent',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  border: done ? '2px solid #006d41' : '2px solid #c2c6d4',
                  backgroundColor: done ? '#006d41' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done && <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#fff' }}>check</span>}
                </div>
                <span style={{ fontSize: 18 }}>{block.icon}</span>
                <span style={{ flex: 1, fontSize: 14, color: done ? '#727783' : '#1c1b20', textDecoration: done ? 'line-through' : 'none' }}>
                  {block.name}
                </span>
                <span style={{ fontSize: 12, color: '#727783', fontFamily: 'monospace' }}>
                  {formatTime(time.h, time.m)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {activeBlock && (
        <BlockDetailModal
          block={activeBlock}
          onClose={() => setActiveBlock(null)}
          onComplete={(id) => { toggle(id); setActiveBlock(null); }}
        />
      )}
    </div>
  );
}
