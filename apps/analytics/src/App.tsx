import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  List,
  UserPlus,
  Zap,
  Sliders,
  Settings,
  LogOut,
  Search,
  Bell
} from 'lucide-react';

import { Logo } from './constants';
import LoginPage from './components/LoginPage';
import { getAuthToken } from './api';

// Features
import DashboardModule from './features/Dashboard';
import AnalyticsModule from './features/Analytics';
import ChurchMeetingsModule from './features/ChurchMeetings';
import EvangelismModule from './features/Evangelism';
import FollowUpModule from './features/FollowUp';
import StudyGroupModule from './features/StudyGroup';
import PrayerModule from './features/Prayer';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(!!getAuthToken());
  const [activeModule, setActiveModule] = useState<string>('Church Meetings');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const navItems = [
    {
      id: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    { id: 'Analytics', icon: <TrendingUp size={18} />, label: 'Analytics' },
    {
      id: 'Church Meetings',
      icon: <Building2 size={18} />,
      label: 'Church Meetings',
    },
    { id: 'Evangelism', icon: <List size={18} />, label: 'Evangelism' },
    { id: 'Follow Up', icon: <UserPlus size={18} />, label: 'Follow Up' },
    { id: 'Prayer Group', icon: <Zap size={18} />, label: 'Prayer Group' },
    { id: 'Study Group', icon: <Sliders size={18} />, label: 'Study Group' },
    { id: 'Settings', icon: <Settings size={18} />, label: 'Settings' },
  ];

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className='flex min-h-screen bg-white font-sans selection:bg-[#CCA856]/30'>
      <aside className='w-[280px] fixed inset-y-0 left-0 bg-white flex flex-col pt-10 z-50 border-r border-slate-100'>
        <Logo className='px-10 mb-16' />
        <nav className='flex-1 flex flex-col space-y-1'>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`group flex items-center w-full py-3.5 pl-10 pr-6 relative transition-all duration-300 ${activeModule === item.id ? 'text-[#1A1C1E]' : 'text-[#64748b] hover:bg-[#F8F9FA]'}`}
            >
              {activeModule === item.id && (
                <div className='absolute left-0 top-1 bottom-1 w-[4px] bg-[#CCA856] rounded-r'></div>
              )}
              <div
                className={`mr-4 transition-colors ${activeModule === item.id ? 'text-[#1A1C1E]' : 'text-[#64748b] opacity-70 group-hover:opacity-100'}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-sm tracking-tight ${activeModule === item.id ? 'font-black' : 'font-semibold'}`}
              >
                {item.label}
              </span>
            </button>
          ))}
          <div className='mt-auto pb-8'>
            <button
              onClick={handleLogout}
              className='group flex items-center w-full py-4 pl-10 pr-6 text-[#64748b] hover:bg-[#F8F9FA] transition-all'
            >
              <LogOut
                size={18}
                className='mr-4 opacity-70 group-hover:opacity-100'
              />
              <span className='text-sm font-semibold tracking-tight'>
                Sign Out
              </span>
            </button>
          </div>
        </nav>
      </aside>
      <main className='flex-1 ml-[280px] bg-[#FAFAFA] min-h-screen p-12'>
        <header className='flex justify-between items-center mb-12'>
          <div className='flex flex-col'>
            <h1 className='text-2xl font-black text-[#1A1C1E] tracking-tight'>
              🌟 Hello!
            </h1>
            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70'>
              Admin HQ / {activeModule}
            </p>
          </div>
          <div className='flex items-center gap-6'>
            <div className='relative group'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors'
                size={18}
              />
              <input
                type='text'
                placeholder='Find records...'
                className='pl-12 pr-6 py-2.5 bg-white border border-slate-200 rounded outline-none font-bold text-sm w-[300px] shadow-sm focus:ring-1 focus:ring-[#CCA856]/20 transition-all'
              />
            </div>
            <button className='p-3 bg-white rounded border border-slate-200 shadow-sm text-slate-400 hover:text-[#1A1C1E] relative transition-all'>
              <Bell size={20} />
              <div className='absolute top-2 right-2 w-2 h-2 bg-[#E74C3C] rounded-full border border-white'></div>
            </button>
            <div className='w-12 h-12 rounded border-2 border-white shadow shadow-slate-200 overflow-hidden flex-shrink-0'>
              <img
                src='https://picsum.photos/seed/pastor/200'
                className='w-full h-full object-cover'
                alt='User'
              />
            </div>
          </div>
        </header>
        <div className='max-w-[1300px] mx-auto pb-20'>
          {activeModule === 'Dashboard' && <DashboardModule />}
          {activeModule === 'Analytics' && <AnalyticsModule />}
          {activeModule === 'Evangelism' && <EvangelismModule />}
          {activeModule === 'Follow Up' && <FollowUpModule />}
          {activeModule === 'Church Meetings' && <ChurchMeetingsModule />}
          {activeModule === 'Study Group' && <StudyGroupModule />}
          {activeModule === 'Prayer Group' && <PrayerModule />}
        </div>
      </main>
    </div>
  );
};

export default App;
