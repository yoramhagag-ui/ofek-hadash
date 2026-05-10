import { getBlockTime, formatTime } from '../utils/timeUtils';

export default function BlockCard({ block, completed, onToggle, wakeHour, wakeMin, isCurrent }) {
  const startTime = getBlockTime(wakeHour, wakeMin, block.offsetMins);
  const endTime = getBlockTime(wakeHour, wakeMin, block.offsetMins + block.durationMins);

  return (
    <div
      style={{
        backgroundColor: '#1A1A22',
        borderRadius: 12,
        borderRight: `4px solid ${block.color}`,
        padding: '14px 16px',
        opacity: isCurrent ? 1 : 0.75,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{block.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#E8E6E0' }}>{block.name}</div>
          <div style={{ fontSize: 12, color: '#8BA3C7', fontFamily: 'monospace', marginTop: 2 }}>
            {formatTime(startTime.h, startTime.m)} – {formatTime(endTime.h, endTime.m)} · {block.durationMins} דקות
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            backgroundColor: completed ? '#276749' : block.color,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '4px 12px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {completed ? '✓' : 'סיים'}
        </button>
      </div>
    </div>
  );
}
