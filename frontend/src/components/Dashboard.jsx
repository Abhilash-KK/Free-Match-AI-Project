import React, { useState } from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import FreelancerDashboard from './dashboards/FreelancerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

const Dashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  // Allow switching roles live for demo & evaluation purposes
  const initialRole = (userSession?.role || 'client').toLowerCase();
  const [activeRole, setActiveRole] = useState(
    initialRole === 'admin' ? 'admin' : initialRole === 'freelancer' ? 'freelancer' : 'client'
  );

  return (
    <div className="relative">
      
      {/* Role Switcher Toolbar Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs font-semibold border-b border-blue-800/60 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Role View Preview Mode:</span>
          <span className="uppercase text-blue-300 font-extrabold">{activeRole}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-300 hidden sm:inline">Switch Role Dashboard:</span>
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveRole('freelancer')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'freelancer' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Freelancer
          </button>
          <button
            onClick={() => setActiveRole('client')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'client' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Client
          </button>
        </div>
      </div>

      {/* Render Role Dashboard */}
      {activeRole === 'admin' && (
        <AdminDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}
      {activeRole === 'freelancer' && (
        <FreelancerDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}
      {activeRole === 'client' && (
        <ClientDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}

    </div>
  );
};

export default Dashboard;
