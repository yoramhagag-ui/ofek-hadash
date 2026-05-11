import { useState, useEffect } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useWakeTime } from '../hooks/useWakeTime';
import { useBlockAlerts } from '../hooks/useBlockAlerts';
import { getCurrentBlock, getBlockTime, formatTime, getMinutesSinceWake } from '../utils/timeUtils';
import { api } from '../api/client';
import VoiceButton from '../components/VoiceButton';
import CigaretteCounter from '../components/CigaretteCounter';
import BlockDetailModal from '../components/BlockDetailModal';

export default function HomeScreen() {
  const [now, setNow]             = useState(new Date());
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
    api.getWeekly().then(d => setWeeklyData(d)).catch(() => {});
  }, []);

  const elapsed = getMinutesSinceWake(wakeHour, wakeMin);
  const hrs  = Math.floor(Math.max(0, elapsed) / 60);
  const mins = Math.max(0, elapsed) % 60;
  const elapsedLabel = elapsed > 0
    ? `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2,'0')} ${hrs > 0 ? 'שעות' : 'דקות'} מהקימה`
    : 'בוקר טוב';

  const currentBlock  = getCurrentBlock(blocks, wakeHour, wakeMin);
  const currentIndex  = currentBlock ? blocks.indexOf(currentBlock) : -1;
  const nextBlock     = currentIndex >= 0 ? blocks[currentIndex + 1] : null;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const total  = blocks.length;
  const score  = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const dayNames = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const todayName = dayNames[now.getDay()];

  return (
    <div dir="rtl" className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-4">

      {/* Welcome + time */}
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-primary">שלום, {localStorage.getItem('ofek_user') || 'יורם'}</h2>
          <div className="text-left">
            <p className="text-3xl font-bold text-on-surface leading-none">
              {now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">יום {todayName}, {now.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        {elapsed > 0 && (
          <div className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
            <span>זמן מאז יקיצה: {elapsedLabel}</span>
          </div>
        )}
      </section>

      {/* Current active block */}
      {loading ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-4 animate-pulse">
          <div className="h-4 bg-surface-container rounded w-1/3 mb-3" />
          <div className="h-6 bg-surface-container rounded w-2/3" />
        </div>
      ) : currentBlock ? (
        <section className="bg-surface-container-lowest rounded-2xl shadow-md border-2 border-secondary overflow-hidden">
          <div className="px-4 py-2 bg-secondary text-on-secondary flex justify-between items-center">
            <span className="text-xs font-bold">פעילות נוכחית</span>
            <span className="material-symbols-outlined text-base animate-pulse">bolt</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentBlock.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-on-surface">{currentBlock.name}</h3>
                  <VoiceButton text={`הגיע הזמן ל${currentBlock.name}. בואו נתחיל.`} size={18} />
                </div>
                <p className="text-sm text-on-surface-variant">{currentBlock.durationMins} דקות</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-secondary">{score}%</div>
                <div className="text-[10px] text-on-surface-variant">ציון</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveBlock(currentBlock)}
                className="flex-1 bg-primary text-on-primary rounded-full py-2.5 font-bold text-sm flex items-center justify-center gap-1.5 border-none cursor-pointer">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                התחל עכשיו
              </button>
              {completed[currentBlock.id] && (
                <div className="flex items-center gap-1 text-secondary font-bold text-sm px-3">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  הושלם
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Progress + Next block row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Score card */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant flex flex-col items-center justify-center text-center gap-1">
          <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          <p className="text-2xl font-bold text-on-surface">{completedCount}/{total}</p>
          <p className="text-xs text-on-surface-variant">בלוקים הושלמו</p>
          <div className="w-full h-1.5 bg-surface-container rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Next block */}
        {nextBlock ? (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant flex flex-col justify-between">
            <div className="flex items-center gap-1 text-on-surface-variant text-xs mb-2">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>בלוק הבא</span>
            </div>
            <div>
              <span className="text-2xl">{nextBlock.icon}</span>
              <p className="text-sm font-bold text-on-surface mt-1 leading-tight">{nextBlock.name}</p>
              <p className="text-xs font-mono text-on-surface-variant mt-1">
                {formatTime(getBlockTime(wakeHour, wakeMin, nextBlock.offsetMins).h, getBlockTime(wakeHour, wakeMin, nextBlock.offsetMins).m)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-secondary-container rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-on-secondary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <p className="text-xs font-bold text-on-secondary-container mt-1">כל הבלוקים הסתיימו!</p>
          </div>
        )}
      </div>

      {/* Weekly mini chart */}
      <div className="bg-primary rounded-2xl p-4 text-on-primary">
        <p className="text-sm font-bold mb-3">התקדמות שבועית</p>
        <div className="flex items-end gap-1 h-14">
          {(weeklyData.length > 0 ? weeklyData : Array(7).fill({ score: 0 })).map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="w-full rounded-t" style={{ height: `${Math.max(d.score, 4)}%`, backgroundColor: 'rgba(255,255,255,0.35)' }} />
              <span className="text-[8px] opacity-70">{d.day || ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cigarette counter */}
      <CigaretteCounter />

      {/* Checklist */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant">
        <div className="px-5 py-3 border-b border-outline-variant font-bold text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">checklist</span>
          צ׳קליסט היום
        </div>
        {blocks.map(block => {
          const time = getBlockTime(wakeHour, wakeMin, block.offsetMins);
          const done = completed[block.id];
          return (
            <div key={block.id} onClick={() => toggle(block.id)}
              className={`flex items-center gap-3 px-5 py-3 border-b border-outline-variant cursor-pointer transition-colors last:border-0
                ${done ? 'bg-secondary-container/20' : 'hover:bg-surface-container-low'}`}>
              <div className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center transition-all
                ${done ? 'bg-secondary border-2 border-secondary' : 'border-2 border-outline-variant bg-transparent'}`}>
                {done && <span className="material-symbols-outlined text-on-secondary text-sm">check</span>}
              </div>
              <span className="text-xl">{block.icon}</span>
              <span className={`flex-1 text-sm ${done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                {block.name}
              </span>
              <span className="text-xs font-mono text-on-surface-variant">{formatTime(time.h, time.m)}</span>
            </div>
          );
        })}
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
