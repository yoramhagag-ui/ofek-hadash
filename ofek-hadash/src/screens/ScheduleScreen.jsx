import { useState } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useWakeTime } from '../hooks/useWakeTime';
import { getBlockTime, formatTime, getCurrentBlock } from '../utils/timeUtils';
import BlockDetailModal from '../components/BlockDetailModal';

const categoryColors = {
  morning:   '#C8853A', hygiene:  '#4A7FA5', exercise: '#006d41',
  nutrition: '#C8853A', learning: '#00478d', rest:     '#50388b',
  family:    '#50388b', sleep:    '#424752',
};

function StatusNode({ isDone, isCurrent, isMissed }) {
  if (isDone) return (
    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center border-4 border-background shadow-sm z-10 shrink-0">
      <span className="material-symbols-outlined text-on-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
    </div>
  );
  if (isMissed) return (
    <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center border-4 border-background shadow-sm z-10 shrink-0">
      <span className="material-symbols-outlined text-on-error-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
    </div>
  );
  if (isCurrent) return (
    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-4 border-background shadow-md z-10 shrink-0">
      <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center border-4 border-background shadow-sm z-10 shrink-0">
      <span className="material-symbols-outlined text-on-surface-variant text-xl">schedule</span>
    </div>
  );
}

export default function ScheduleScreen() {
  const { blocks, completed, toggle, loading } = useSchedule();
  const { wakeHour, wakeMin } = useWakeTime();
  const currentBlock = getCurrentBlock(blocks, wakeHour, wakeMin);
  const [activeBlock, setActiveBlock] = useState(null);

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const wakeMins = wakeHour * 60 + wakeMin;

  return (
    <div dir="rtl" className="px-5 pt-6 pb-4 max-w-lg mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary mb-0.5">לוח זמנים יומי</h2>
        <p className="text-sm text-on-surface-variant">
          {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container animate-pulse shrink-0" />
              <div className="flex-1 h-20 rounded-2xl bg-surface-container animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* vertical line */}
          <div className="absolute right-[19px] top-4 bottom-4 w-0.5 bg-outline-variant" />

          <div className="flex flex-col gap-5">
            {blocks.map((block) => {
              const start    = getBlockTime(wakeHour, wakeMin, block.offsetMins);
              const end      = getBlockTime(wakeHour, wakeMin, block.offsetMins + block.durationMins);
              const blockStartMins = wakeMins + block.offsetMins;
              const blockEndMins   = blockStartMins + block.durationMins;
              const isCurrent = currentBlock?.id === block.id;
              const isDone    = !!completed[block.id];
              const isMissed  = !isDone && !isCurrent && nowMins > blockEndMins;
              const isPast    = nowMins > blockEndMins;
              const borderColor = categoryColors[block.category] || '#c2c6d4';

              return (
                <div key={block.id} className={`relative flex gap-3 ${!isCurrent && isPast && !isDone ? 'opacity-70' : ''}`}>
                  <StatusNode isDone={isDone} isCurrent={isCurrent} isMissed={!isDone && isPast && !isCurrent} />

                  <div onClick={() => setActiveBlock(block)}
                    className={`flex-1 bg-surface-container-lowest rounded-2xl p-4 cursor-pointer transition-all
                      ${isCurrent ? 'shadow-lg border-2 border-primary' : 'shadow-sm border border-outline-variant'}
                      border-r-4`}
                    style={{ borderRightColor: borderColor }}>

                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold ${isCurrent ? 'text-primary' : isDone ? 'text-secondary' : 'text-on-surface-variant'}`}>
                        {isCurrent ? 'פעיל כעת' : isDone ? 'בוצע בהצלחה' : 'ממתין'}
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant">
                        {formatTime(start.h, start.m)} – {formatTime(end.h, end.m)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{block.icon}</span>
                      <h3 className={`text-base font-bold text-on-surface ${isDone ? 'line-through text-on-surface-variant' : ''}`}>
                        {block.name}
                      </h3>
                    </div>

                    <p className="text-xs text-on-surface-variant">{block.durationMins} דקות</p>

                    {isCurrent && (
                      <div className="mt-3">
                        <button onClick={e => { e.stopPropagation(); setActiveBlock(block); }}
                          className="bg-primary text-on-primary rounded-full px-4 py-2 text-sm font-bold border-none cursor-pointer">
                          התחל עכשיו
                        </button>
                      </div>
                    )}

                    {!isCurrent && (
                      <button onClick={e => { e.stopPropagation(); toggle(block.id); }}
                        className={`mt-2 flex items-center gap-1 text-xs font-medium border-none bg-transparent cursor-pointer
                          ${isDone ? 'text-on-surface-variant' : 'text-primary'}`}>
                        <span className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0" }}>
                          {isDone ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {isDone ? 'הסר סימון' : 'סמן כהושלם'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
