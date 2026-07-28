import React, { useState } from 'react';

const LandingPage = ({ onNavigate, theme = 'dark', toggleTheme }) => {
  const [activeModal, setActiveModal] = useState(null); // 'matching' | 'talent' | 'how-it-works' | 'security' | null

  const isDark = theme === 'dark';

  const scrollToProtocol = () => {
    const el = document.getElementById('matching-protocol');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Background Glowing Orbs */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
        isDark ? 'bg-blue-600/10' : 'bg-blue-400/15'
      }`}></div>
      <div className={`absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${
        isDark ? 'bg-blue-700/10' : 'bg-blue-300/20'
      }`}></div>

      {/* Top Header Navbar */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-6 sm:px-12 py-4 flex items-center justify-between transition-colors duration-200 ${
        isDark ? 'bg-[#030712]/80 border-slate-800/60' : 'bg-white/80 border-slate-200/80 shadow-2xs'
      }`}>
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="6" cy="12" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="6" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="18" r="2.5" strokeWidth="2.2" />
              <path d="M8.5 10.8l7-3.6M8.5 13.2l7 3.6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className={`font-extrabold text-lg tracking-tight font-sans ${isDark ? 'text-white' : 'text-slate-900'}`}>
            FreeMatch AI
          </span>
        </div>

        {/* Middle Nav Links */}
        <nav className={`hidden md:flex items-center space-x-8 text-sm font-semibold ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          <button 
            onClick={() => setActiveModal('matching')}
            className="hover:text-blue-500 transition-colors cursor-pointer"
          >
            AI Skill Matching
          </button>
          <button 
            onClick={() => setActiveModal('talent')}
            className="hover:text-blue-500 transition-colors cursor-pointer"
          >
            AI Scrum Master
          </button>
          <button 
            onClick={() => setActiveModal('how-it-works')}
            className="hover:text-blue-500 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => setActiveModal('security')}
            className="hover:text-blue-500 transition-colors cursor-pointer"
          >
            Escrow & Security
          </button>
        </nav>

        {/* Auth Buttons + Theme Toggle */}
        <div className="flex items-center space-x-3">
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              type="button"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'bg-[#081024] hover:bg-[#0c162d] text-amber-400 border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
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

          <button
            onClick={() => onNavigate('login')}
            className={`text-sm font-semibold px-3 py-2 cursor-pointer transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="hidden sm:inline-flex text-sm font-bold text-white bg-[#0d5be1] hover:bg-blue-600 px-5 py-2.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(13,91,225,0.4)] cursor-pointer active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center relative z-10">
        <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs ${
          isDark 
            ? 'bg-blue-950/70 border border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(13,91,225,0.25)]' 
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Phase 2: AI NLP Skill Matching & GitHub Progress Tracker</span>
        </div>

        <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          FreeMatch AI <br />
          <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
            AI Skill Matching & Progress Tracking.
          </span>
        </h1>

        <p className={`mt-6 text-base sm:text-lg lg:text-xl max-w-3xl font-normal leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          An intelligent platform connecting clients with top-tier freelancers using deep NLP semantic matching algorithms and automated GitHub progress tracking without micromanagement.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0d5be1] hover:bg-blue-600 text-white font-bold rounded-2xl text-sm transition-all duration-200 shadow-[0_0_25px_rgba(13,91,225,0.4)] cursor-pointer active:scale-[0.98]"
          >
            Get Started
          </button>
          <button
            onClick={scrollToProtocol}
            className={`w-full sm:w-auto px-8 py-3.5 font-semibold border rounded-2xl text-sm transition-all duration-200 shadow-2xs cursor-pointer ${
              isDark 
                ? 'bg-[#081024] hover:bg-[#0c162d] text-slate-200 border-slate-800' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* 3 Core Value Cards (Aligned with Project Specs) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className={`rounded-3xl p-7 border shadow-lg card-hover backdrop-blur-xl flex flex-col items-start transition-all ${
            isDark 
              ? 'bg-[#060e22]/90 border-slate-800/80 hover:border-blue-600/50' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center mb-5 border border-blue-500/30 shadow-xs">
              🧠
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Skill-Matching Engine (NLP)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Deep semantic NLP analysis (spaCy/Transformers) extracting skills from job posts and generating 0-100% compatibility scores to recommend top 5 matches.
            </p>
          </div>

          {/* Card 2 */}
          <div className={`rounded-3xl p-7 border shadow-lg card-hover backdrop-blur-xl flex flex-col items-start transition-all ${
            isDark 
              ? 'bg-[#060e22]/90 border-slate-800/80 hover:border-blue-600/50' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center mb-5 border border-blue-500/30 shadow-xs">
              📊
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Scrum Master & Progress Tracker
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Automated daily check-ins & GitHub REST API integration cross-referencing code updates against task sprint boards for plain-English weekly status reports.
            </p>
          </div>

          {/* Card 3 */}
          <div className={`rounded-3xl p-7 border shadow-lg card-hover backdrop-blur-xl flex flex-col items-start transition-all ${
            isDark 
              ? 'bg-[#060e22]/90 border-slate-800/80 hover:border-blue-600/50' 
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center mb-5 border border-blue-500/30 shadow-xs">
              💳
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Milestone Escrow & Fraud Shield
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Stripe & Razorpay payment gateway integration with milestone holding escrow structures and PyTorch anomaly detection blocking spam proposals & fake reviews.
            </p>
          </div>
        </div>
      </section>

      {/* The Matching Protocol Section */}
      <section id="matching-protocol" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <span className={`text-xs font-extrabold tracking-widest uppercase ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            The FreeMatch AI Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className={`flex flex-col items-start p-6 rounded-3xl border ${
            isDark ? 'bg-[#060e22]/50 border-slate-800/60' : 'bg-white border-slate-200/80 shadow-2xs'
          }`}>
            <div className="w-11 h-11 rounded-2xl border-2 border-blue-500 text-blue-500 font-bold text-base flex items-center justify-center mb-5 shadow-xs">
              1
            </div>
            <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Job Posting & NLP Skill Extraction
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Clients post projects with strict budgets and milestones; NLP algorithms parse job descriptions to extract required skill tags automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className={`flex flex-col items-start p-6 rounded-3xl border ${
            isDark ? 'bg-[#060e22]/50 border-slate-800/60' : 'bg-white border-slate-200/80 shadow-2xs'
          }`}>
            <div className="w-11 h-11 rounded-2xl border-2 border-blue-500 text-blue-500 font-bold text-base flex items-center justify-center mb-5 shadow-xs">
              2
            </div>
            <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Algorithmic Synthesis & 0-100% Match
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The matching engine computes deep vector similarities across freelancer profiles, recommending the top 5 candidates with compatibility scores.
            </p>
          </div>

          {/* Step 3 */}
          <div className={`flex flex-col items-start p-6 rounded-3xl border ${
            isDark ? 'bg-[#060e22]/50 border-slate-800/60' : 'bg-white border-slate-200/80 shadow-2xs'
          }`}>
            <div className="w-11 h-11 rounded-2xl bg-[#0d5be1] text-white font-bold text-base flex items-center justify-center mb-5 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Scrum Tracker & Escrow Release
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              AI Scrum Master verifies GitHub code updates against sprint task boards and releases milestone escrow payments automatically upon client approval.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack Alignment Section */}
      <section className={`py-12 px-4 border-t border-b transition-colors ${
        isDark ? 'border-slate-800/60 bg-[#040814]/60' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className={`text-xs font-extrabold tracking-widest uppercase mb-8 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Powered by Modern Enterprise & AI Technology Stack
          </p>
          <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-14 font-mono text-sm sm:text-base font-bold tracking-tight ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <span className="hover:text-blue-500 transition-colors">React.js & Tailwind</span>
            <span className="hover:text-blue-500 transition-colors">Python / Django REST</span>
            <span className="hover:text-blue-500 transition-colors">spaCy & PyTorch</span>
            <span className="hover:text-blue-500 transition-colors">GitHub REST API</span>
            <span className="hover:text-blue-500 transition-colors">PostgreSQL & MongoDB</span>
            <span className="hover:text-blue-500 transition-colors">Stripe / Razorpay</span>
          </div>
        </div>
      </section>

      {/* Banner CTA Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative z-10">
        <div className={`relative overflow-hidden border rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl ${
          isDark 
            ? 'bg-gradient-to-r from-[#060e22] via-[#091533] to-[#040918] border-blue-600/30 shadow-[0_0_50px_rgba(13,91,225,0.2)]' 
            : 'bg-gradient-to-r from-[#0a2540] via-[#0052cc] to-[#003da5] border-blue-400/20'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Join FreeMatch AI Today
            </h2>
            <p className="text-xs sm:text-base text-slate-300 mb-8 leading-relaxed font-normal">
              Stop searching. Start executing. Connect through AI semantic skill matching and automated progress tracking.
            </p>
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 bg-[#0d5be1] hover:bg-blue-600 text-white font-bold rounded-2xl text-sm transition-all duration-200 shadow-[0_0_25px_rgba(13,91,225,0.4)] cursor-pointer active:scale-[0.98]"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`w-full border-t py-8 px-6 sm:px-12 text-xs transition-colors ${
        isDark ? 'border-slate-800/80 bg-[#030712] text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className={`font-bold tracking-tight text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              FreeMatch AI
            </span>
          </div>
          
          <span className="text-[11px] opacity-80">
            © 2026 FreeMatch AI Project | Dept. of Computer Applications.
          </span>

          <div className="flex items-center space-x-6 font-medium">
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

      {/* Interactive Modal Popups */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setActiveModal(null)}
              className={`absolute top-5 right-5 p-1.5 rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {activeModal === 'matching' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-2xl">
                    🧠
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Skill-Matching Engine (NLP)</h3>
                </div>
                <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Eliminates manual candidate vetting by autonomously matching job descriptions with suitable freelancer profiles using deep semantic NLP text analysis (spaCy & Hugging Face Transformers).
                </p>
                <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-300 font-mono mb-6">
                  • Extracts core skills from job posts.<br />
                  • Generates a 0-100% compatibility score.<br />
                  • Recommends top 5 candidates to clients.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0d5be1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'talent' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-2xl">
                    📊
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Scrum Master & Progress Tracker</h3>
                </div>
                <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Automates daily updates and monitors milestones to ensure transparent delivery without manual micromanagement.
                </p>
                <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-300 font-mono mb-6">
                  • Automated daily check-ins for task statuses & blockers.<br />
                  • Integrates GitHub REST API to verify active development.<br />
                  • NLP summarizes developer logs into plain-English weekly client reports.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0d5be1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Join Network
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'how-it-works' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-2xl">
                    ⚙️
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>System Architecture & Modules</h3>
                </div>
                <div className="space-y-3 text-xs mb-6">
                  <div className={`p-3 rounded-xl border font-medium ${isDark ? 'bg-[#0c162d] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    1. Core Marketplace: Role-Based Access Control (Client, Freelancer, Admin) & task boards.
                  </div>
                  <div className={`p-3 rounded-xl border font-medium ${isDark ? 'bg-[#0c162d] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    2. AI Skill Matching: NLP semantic scoring & top 5 candidate recommendations.
                  </div>
                  <div className={`p-3 rounded-xl border font-medium ${isDark ? 'bg-[#0c162d] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    3. AI Scrum Master: GitHub API commit verification & milestone escrow release.
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0d5be1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/20 text-blue-500 border border-blue-500/30 rounded-2xl">
                    🛡
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Milestone Escrow & Fraud Shield</h3>
                </div>
                <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Integrated payment gateways (Stripe / Razorpay) handle credit card processing and operational payment distributions via secure milestone holding escrow structures.
                </p>
                <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-xs text-blue-300 font-mono mb-6">
                  • Blocks AI-generated spam proposals.<br />
                  • PyTorch anomaly detection identifies rating manipulation.<br />
                  • Temporarily suspends fraudulent accounts automatically.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('login'); }}
                    className="px-5 py-2.5 bg-[#0d5be1] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
