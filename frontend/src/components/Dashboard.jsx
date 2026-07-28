import React from 'react';

const Dashboard = ({ userSession, onSignOut }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-gray-900 font-sans">
      
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-gray-200/80 px-6 sm:px-10 py-5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0052cc] text-white flex items-center justify-center shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <span className="font-bold text-base sm:text-lg tracking-tight text-[#003da5]">
            FREEMATCH AI
          </span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0052cc] border border-blue-200/60 capitalize">
            {userSession?.role || 'User'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-gray-900">{userSession?.name}</p>
            {userSession?.email && (
              <p className="text-[11px] text-gray-500">{userSession.email}</p>
            )}
          </div>
          <button
            onClick={onSignOut}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Dashboard Content - ONLY Welcome Message Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-8 sm:p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 text-[#0052cc] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Welcome, {userSession?.name}!
          </h1>
          
          <p className="text-sm text-gray-500 mb-6">
            Logged in as <span className="font-semibold text-gray-800 capitalize">{userSession?.role}</span>.
          </p>

          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Connected to FREEMATCH AI network
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/70 bg-[#f8fafc] py-4 px-6 sm:px-10 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <span className="font-bold text-[#003da5] tracking-tight">
            FREEMATCH AI
          </span>
          <span className="text-gray-400 text-[11px]">
            © 2024 FREEMATCH AI. Algorithmic Trust.
          </span>
          <div className="flex items-center space-x-6 text-gray-500">
            <a href="#privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-gray-700 transition-colors">
              Security Overview
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
