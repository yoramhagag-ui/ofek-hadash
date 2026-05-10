import { useState } from 'react';
import Layout from './components/Layout';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import CommanderScreen from './screens/CommanderScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import TasksScreen from './screens/TasksScreen';

export default function App() {
  const [user, setUser]         = useState(() => localStorage.getItem('ofek_user'));
  const [activeTab, setActiveTab] = useState('home');

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  const screens = {
    home:      <HomeScreen />,
    schedule:  <ScheduleScreen />,
    commander: <CommanderScreen />,
    progress:  <ProgressScreen />,
    tasks:     <TasksScreen />,
    settings:  <SettingsScreen />,
  };

  return (
    <Layout active={activeTab} onSelect={setActiveTab} user={user} onLogout={() => setUser(null)}>
      {screens[activeTab]}
    </Layout>
  );
}
