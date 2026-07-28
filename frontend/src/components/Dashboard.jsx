import React from 'react';

const Dashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const role = (userSession?.role || 'client').toLowerCase();

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Navigation Header */}
      <header className={`w-full border-b px-6 sm:px-10 py-4 flex items-center justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#060e22]/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="6" cy="12" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="6" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="18" r="2.5" strokeWidth="2.2" />
              <path d="M8.5 10.8l7-3.6M8.5 13.2l7 3.6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className={`font-bold text-base sm:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            FreeMatch AI
          </span>
          <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
            isDark 
              ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
              : 'bg-blue-50 text-blue-600 border-blue-200'
          }`}>
            {role === 'client' ? 'Client / Company' : role === 'freelancer' ? 'Freelancer' : 'Platform Administrator'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              type="button"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'bg-[#081024] hover:bg-[#0c162d] text-amber-400 border-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

          <div className="text-right hidden sm:block">
            <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{userSession?.name}</p>
            {userSession?.email && (
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{userSession.email}</p>
            )}
          </div>
          
          <button
            onClick={onSignOut}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
              isDark 
                ? 'bg-[#081024] hover:bg-[#0c162d] text-slate-300 border-slate-800' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-4xl mx-auto w-full">
        
        {/* Welcome Banner */}
        <div className={`w-full rounded-3xl border p-8 sm:p-10 text-center transition-colors mb-8 ${
          isDark 
            ? 'bg-[#060e22]/90 border-slate-800/80 shadow-[0_0_40px_rgba(13,91,225,0.15)]' 
            : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <div className="w-14 h-14 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-500/30 shadow-xs">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome back, {userSession?.name}!
          </h1>
          
          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Active Account Role: <span className={`font-bold capitalize ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {role === 'client' ? 'Client / Company' : role === 'freelancer' ? 'Freelancer' : 'Platform Administrator'}
            </span>
          </p>

          <div className={`inline-flex items-center px-4 py-2 rounded-2xl border text-xs font-medium ${
            isDark 
              ? 'bg-[#081024] border-slate-800 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Connected to FreeMatch AI Engine (Phase 2 Active)
          </div>
        </div>

        {/* System Modules Overview (Aligned with PDF Project Docs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-xs font-bold text-blue-500 mb-1">MODULE 1</div>
            <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Skill Matching</div>
            <div className="text-xs text-slate-400">NLP semantic 0-100% scoring extracting candidate skills.</div>
          </div>
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-xs font-bold text-blue-500 mb-1">MODULE 2</div>
            <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Scrum Tracker</div>
            <div className="text-xs text-slate-400">GitHub API commit verification & task sprint board updates.</div>
          </div>
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-xs font-bold text-blue-500 mb-1">MODULE 3</div>
            <div className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Milestone Escrow</div>
            <div className="text-xs text-slate-400">Stripe & Razorpay payment milestone holding structure.</div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-4 px-6 sm:px-10 text-xs transition-colors ${
        isDark ? 'border-slate-800/80 bg-[#030712] text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <span className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            FreeMatch AI
          </span>
          <span className="text-[11px] opacity-80">
            © 2026 FreeMatch AI Project | Dept. of Computer Applications.
          </span>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-blue-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-blue-500 transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-blue-500 transition-colors">
              Security Overview
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
