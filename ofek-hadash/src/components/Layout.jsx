import { useState, useEffect } from 'react';
import { api } from '../api/client';

const navItems = [
  { id: 'home',      label: 'בית',    icon: 'home' },
  { id: 'schedule',  label: 'לו״ז',   icon: 'calendar_today' },
  { id: 'commander', label: 'סוכנת',  icon: 'smart_toy' },
  { id: 'progress',  label: 'מעקב',   icon: 'monitoring' },
  { id: 'tasks',     label: 'משימות', icon: 'task_alt' },
  { id: 'settings',  label: 'הגדרות', icon: 'settings' },
];

export default function Layout({ active, onSelect, user, onLogout, children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed,     setInstalled]     = useState(false);
  const [todayScore,    setTodayScore]    = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    api.getToday().then(d => setTodayScore(d.score ?? 0)).catch(() => {});
  }, [active]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('ofek_user');
    onLogout?.();
  };

  const initial = user ? user.charAt(0).toUpperCase() : '?';

  return (
    <div dir="rtl" className="bg-background text-on-surface min-h-screen overflow-x-hidden">

      {/* TopAppBar */}
      <header className="bg-surface-container-low shadow-sm fixed top-0 w-full z-50 flex flex-row-reverse justify-between items-center px-5 py-2 h-16">
        <div className="flex items-center gap-3">
          {installPrompt && !installed && (
            <button onClick={handleInstall} className="flex items-center gap-1 bg-primary text-on-primary rounded-full px-3 py-1 text-xs font-bold">
              <span className="material-symbols-outlined text-base">install_mobile</span>
              התקן
            </button>
          )}
          <button onClick={handleLogout} className="p-1 rounded-lg text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">logout</span>
          </button>
        </div>

        <span className="text-xl font-bold text-primary">אופק-חדש</span>

        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold md:hidden">
          {initial}
        </div>
        <div className="hidden md:block w-9" />
      </header>

      {/* SideNav – desktop only */}
      <nav className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-surface-container-low border-l border-outline-variant flex-col p-4 z-50 overflow-y-auto">
        <div className="text-xl font-bold text-primary mb-5 mt-4">אופק-חדש</div>

        <div className="flex items-center gap-3 p-3 mb-2 bg-white rounded-2xl">
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-on-primary text-lg font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-on-surface truncate">{user || 'משתמש'}</div>
            <div className={`text-xs font-medium ${todayScore !== null ? 'text-secondary' : 'text-on-surface-variant'}`}>
              {todayScore !== null ? `התקדמות היום: ${todayScore}%` : 'טוען...'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 mt-2">
          {navItems.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onSelect(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-none cursor-pointer w-full text-right text-sm font-medium transition-colors
                  ${isActive ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => onSelect('schedule')} className="bg-primary text-on-primary rounded-full px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 border-none cursor-pointer">
            <span className="material-symbols-outlined text-lg">play_circle</span>
            לוח הזמנים
          </button>
          <button onClick={handleLogout} className="bg-transparent text-on-surface-variant border border-outline-variant rounded-full px-6 py-2.5 text-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <span className="material-symbols-outlined text-lg">logout</span>
            התנתקות
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="md:mr-64 layout-main">
        {children}
      </main>

      {/* Bottom nav – mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-low border-t border-outline-variant flex justify-around items-center px-1 pt-1.5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 6px)' }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center gap-0.5 border-none cursor-pointer py-1 px-1.5 rounded-xl transition-all min-h-[44px] justify-center
                ${isActive ? 'bg-secondary-container text-on-secondary-container' : 'bg-transparent text-on-surface-variant'}`}
              style={{ flex: 1 }}>
              <span className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className={`text-[9px] ${isActive ? 'font-bold' : 'font-normal'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .layout-main {
          padding-top: 64px;
          padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px));
        }
        @media (min-width: 768px) {
          .layout-main { padding-bottom: 0; }
        }
      `}</style>
    </div>
  );
}
