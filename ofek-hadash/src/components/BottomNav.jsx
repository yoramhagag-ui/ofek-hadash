import { Home, Calendar, MessageCircle, TrendingUp, Settings, CheckSquare } from 'lucide-react';

const tabs = [
  { id: 'home',      label: 'בית',      icon: Home },
  { id: 'schedule',  label: 'לו"ז',     icon: Calendar },
  { id: 'commander', label: 'סוכנת',    icon: MessageCircle },
  { id: 'progress',  label: 'התקדמות',  icon: TrendingUp },
  { id: 'tasks',     label: 'משימות',   icon: CheckSquare },
  { id: 'settings',  label: 'הגדרות',   icon: Settings },
];

export default function BottomNav({ active, onSelect }) {
  return (
    <nav style={{ backgroundColor: '#1A1A22', borderTop: '1px solid #2a2a3a' }}
      className="fixed bottom-0 right-0 left-0 z-50">
      <div className="flex">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              style={{
                color: isActive ? '#C8853A' : '#8BA3C7',
                borderTop: isActive ? '2px solid #C8853A' : '2px solid transparent',
                flex: 1,
              }}
              className="flex flex-col items-center py-2 px-1 transition-colors"
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
