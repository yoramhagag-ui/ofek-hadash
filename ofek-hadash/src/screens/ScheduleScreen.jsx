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

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          backgroundColor: '#f1ecf4', borderRadius: 14, height: 68,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.07}s`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }`}</style>
    </div>
  );
}

export default function ScheduleScreen() {
  const { blocks, completed, toggle, loading } = useSchedule();
  const { wakeHour, wakeMin } = useWakeTime();
  const currentBlock = getCurrentBlock(blocks, wakeHour, wakeMin);
  const [activeBlock, setActiveBlock] = useState(null);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: '#1c1b20' }}>לוח זמנים</h2>
        <p style={{ fontSize: 13, color: '#424752', margin: 0 }}>
          קימה: {formatTime(wakeHour, wakeMin)} · {blocks.length} בלוקים
        </p>
      </div>

      {loading ? <Skeleton /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {blocks.map(block => {
            const start    = getBlockTime(wakeHour, wakeMin, block.offsetMins);
            const end      = getBlockTime(wakeHour, wakeMin, block.offsetMins + block.durationMins);
            const isCurrent = currentBlock?.id === block.id;
            const isDone   = completed[block.id];

            return (
              <div key={block.id} onClick={() => setActiveBlock(block)} style={{
                backgroundColor: isCurrent ? '#ffffff' : isDone ? 'rgba(144,244,183,0.12)' : '#f7f2fa',
                borderRadius: 14, padding: '14px 16px',
                borderRight: `4px solid ${categoryColors[block.category] || '#c2c6d4'}`,
                boxShadow: isCurrent ? '0 2px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                transition: 'box-shadow 0.2s, background 0.2s',
              }}>
                {/* Checkbox */}
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: isDone ? '2px solid #006d41' : '2px solid #c2c6d4',
                  backgroundColor: isDone ? '#006d41' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone && <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#fff' }}>check</span>}
                </div>

                <span style={{ fontSize: 24 }}>{block.icon}</span>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isDone ? '#727783' : '#1c1b20',
                      textDecoration: isDone ? 'line-through' : 'none' }}>{block.name}</span>
                    {isCurrent && (
                      <span style={{ backgroundColor: '#005eb8', color: '#c8daff',
                        fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>עכשיו</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#727783', fontFamily: 'monospace' }}>
                    {formatTime(start.h, start.m)} – {formatTime(end.h, end.m)}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#727783', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#424752' }}>{block.durationMins}</div>
                  <div>דק׳</div>
                </div>
              </div>
            );
          })}
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
