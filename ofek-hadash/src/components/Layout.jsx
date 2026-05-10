import { useState, useEffect } from 'react';
import { api } from '../api/client';

const navItems = [
  { id: 'home',      label: 'דף הבית',   icon: 'home' },
  { id: 'schedule',  label: 'לוח זמנים', icon: 'calendar_today' },
  { id: 'commander', label: 'המפקדת',    icon: 'smart_toy' },
  { id: 'progress',  label: 'התקדמות',   icon: 'monitoring' },
  { id: 'tasks',     label: 'משימות',    icon: 'task_alt' },
  { id: 'settings',  label: 'הגדרות',    icon: 'settings' },
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

  // load today's score for the sidebar
  useEffect(() => {
    api.getToday().then(d => setTodayScore(d.score ?? 0)).catch(() => {});
  }, [active]); // refresh when tab changes

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

  // first letter of user name for avatar
  const initial = user ? user.charAt(0).toUpperCase() : '?';

  return (
    <div dir="rtl" style={{ minHeight: '100svh', backgroundColor: '#fdf8ff', color: '#1c1b20' }}>

      {/* TopAppBar */}
      <header style={{
        backgroundColor: '#f7f2fa', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {installPrompt && !installed && (
            <button onClick={handleInstall} title="התקן אפליקציה" style={{
              display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#00478d',
              color: '#fff', border: 'none', borderRadius: 99, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>install_mobile</span>
              התקן
            </button>
          )}
          <button onClick={handleLogout} title="יציאה" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#727783', padding: 4, borderRadius: 8,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>logout</span>
          </button>
        </div>

        <span style={{ fontSize: 22, fontWeight: 700, color: '#00478d' }}>אופק-חדש</span>

        {/* Mobile: user avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', backgroundColor: '#00478d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#fff',
        }} className="md:hidden">
          {initial}
        </div>
        <div className="hidden md:block" style={{ width: 36 }} />
      </header>

      {/* SideNav – desktop only */}
      <nav style={{
        position: 'fixed', right: 0, top: 0, height: '100%', width: 256,
        backgroundColor: '#f1ecf4', borderLeft: '1px solid #c2c6d4',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.06)', zIndex: 50,
        display: 'flex', flexDirection: 'column', padding: 16, overflowY: 'auto',
      }} className="hidden md:flex">
        <div style={{ fontSize: 22, fontWeight: 700, color: '#00478d', marginBottom: 20, marginTop: 16 }}>אופק-חדש</div>

        {/* User card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', backgroundColor: '#00478d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1c1b20', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user || 'משתמש'}
            </div>
            <div style={{ fontSize: 12, color: todayScore !== null ? '#006d41' : '#424752', fontWeight: todayScore !== null ? 600 : 400 }}>
              {todayScore !== null ? `התקדמות היום: ${todayScore}%` : 'טוען...'}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginTop: 8 }}>
          {navItems.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => onSelect(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderRadius: 12, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'right',
                backgroundColor: isActive ? '#90f4b7' : 'transparent',
                color: isActive ? '#007144' : '#424752',
                fontWeight: isActive ? 700 : 500, fontSize: 14,
                transition: 'background 0.15s',
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: 22,
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Logout + quick-start */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          <button onClick={() => onSelect('schedule')} style={{
            backgroundColor: '#00478d', color: '#ffffff',
            border: 'none', borderRadius: 99, padding: '12px 24px',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>play_circle</span>
            לוח הזמנים
          </button>
          <button onClick={handleLogout} style={{
            backgroundColor: 'transparent', color: '#727783',
            border: '1px solid #e5e1e9', borderRadius: 99, padding: '10px 24px',
            fontWeight: 500, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            התנתקות
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="md:mr-64 layout-main">
        {children}
      </main>

      {/* Bottom nav – mobile only */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        backgroundColor: '#fdf8ff', borderTop: '1px solid #e5e1e9',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        height: 64, padding: '0 4px',
      }} className="md:hidden">
        {navItems.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
              color: isActive ? '#00478d' : '#424752', flex: 1,
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 22,
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .layout-main {
          padding-top: 64px;
          padding-bottom: 72px;
        }
        @media (min-width: 768px) {
          .layout-main {
            padding-bottom: 0;
          }
        }
      `}</style>
    </div>
  );
}
