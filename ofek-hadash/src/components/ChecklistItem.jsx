import { getBlockTime, formatTime } from '../utils/timeUtils';

export default function ChecklistItem({ block, completed, onToggle, wakeHour, wakeMin }) {
  const time = getBlockTime(wakeHour, wakeMin, block.offsetMins);
  return (
    <div
      onClick={onToggle}
      style={{
        borderBottom: '1px solid #2a2a3a',
        backgroundColor: completed ? 'rgba(39,103,73,0.15)' : 'transparent',
        cursor: 'pointer',
      }}
      className="flex items-center gap-3 px-4 py-3 transition-colors"
    >
      <div
        style={{
          width: 24, height: 24, borderRadius: 6,
          border: completed ? '2px solid #276749' : '2px solid #555566',
          backgroundColor: completed ? '#276749' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {completed && <span style={{ color: 'white', fontSize: 12 }}>✓</span>}
      </div>
      <span className="text-lg">{block.icon}</span>
      <span style={{
        flex: 1, fontSize: 14,
        color: completed ? '#8BA3C7' : '#E8E6E0',
        textDecoration: completed ? 'line-through' : 'none',
      }}>
        {block.name}
      </span>
      <span style={{ fontSize: 12, color: '#8BA3C7', fontFamily: 'monospace' }}>
        {formatTime(time.h, time.m)}
      </span>
    </div>
  );
}
