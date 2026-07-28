import React, { useState } from 'react';

const LandingPage = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState(null); // 'matching' | 'talent' | 'how-it-works' | 'security' | null

  const scrollToProtocol = () => {
    const el = document.getElementById('matching-protocol');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100/90 px-6 sm:px-12 py-4 flex items-center justify-between shadow-2xs">
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-[#0052cc] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#003da5] font-sans">
            FREEMATCH AI
          </span>
        </div>

        {/* Middle Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-600">
          <button 
            onClick={() => setActiveModal('matching')}
            className="hover:text-[#0052cc] transition-colors cursor-pointer"
          >
            AI Matching
          </button>
          <button 
            onClick={() => setActiveModal('talent')}
            className="hover:text-[#0052cc] transition-colors cursor-pointer"
          >
            Verified Talent
          </button>
          <button 
            onClick={() => setActiveModal('how-it-works')}
            className="hover:text-[#0052cc] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => setActiveModal('security')}
            className="hover:text-[#0052cc] transition-colors cursor-pointer"
          >
            Security & Escrow
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigate('login')}
            className="text-sm font-semibold text-[#0052cc] hover:text-[#003da5] transition-colors px-3 py-2 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="hidden sm:inline-flex text-sm font-semibold text-white bg-[#0052cc] hover:bg-[#0043b3] px-4.5 py-2 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50/80 border border-blue-100 text-[#0052cc] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#0052cc]"></span>
          <span>Next-Gen Algorithmic Matching Protocol</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] max-w-4xl">
          Elite Talent. <br />
          <span className="text-[#0052cc]">Algorithmic Precision.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl font-normal leading-relaxed">
          The premier conduit for high-stakes professional matching. Connect with verified experts through algorithmic precision.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none">
          <button
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0052cc] hover:bg-[#0043b3] text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-blue-500/10 cursor-pointer active:scale-[0.98]"
          >
            Get Started
          </button>
          <button
            onClick={scrollToProtocol}
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200 rounded-xl text-sm transition-all duration-200 shadow-2xs cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* 3 Core Value Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100/90 shadow-2xs card-hover flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center mb-5 border border-blue-100/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              AI-Driven Matching
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Proprietary models ensuring perfect synergy between project needs and talent.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100/90 shadow-2xs card-hover flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center mb-5 border border-blue-100/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Verified Elite Talent
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Rigorous technical and behavioral vetting. Only the top 3% gain access.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100/90 shadow-2xs card-hover flex flex-col items-start">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center mb-5 border border-blue-100/60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Secure Payments
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Enterprise-grade security and escrow for frictionless, protected transactions.
            </p>
          </div>
        </div>
      </section>

      {/* The Matching Protocol Section */}
      <section id="matching-protocol" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
            The Matching Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-full border-2 border-[#0052cc] text-[#0052cc] font-semibold text-base flex items-center justify-center mb-5">
              1
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Data Ingestion
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Input core parameters, objectives, and constraints.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-full border-2 border-[#0052cc] text-[#0052cc] font-semibold text-base flex items-center justify-center mb-5">
              2
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Algorithmic Synthesis
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Our models compute compatibility across vector spaces.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-start">
            <div className="w-11 h-11 rounded-full bg-[#0052cc] text-white font-semibold text-base flex items-center justify-center mb-5 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              Execution Phase
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Seamless onboarding and immediate productivity.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted By Industry Leaders */}
      <section className="py-12 px-4 border-t border-gray-100 bg-white/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase mb-8">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 text-gray-600 font-serif text-lg sm:text-xl font-bold tracking-tight">
            <span className="hover:text-gray-900 transition-colors">Acme Corp</span>
            <span className="hover:text-gray-900 transition-colors">Globex</span>
            <span className="italic font-normal hover:text-gray-900 transition-colors">Soylent</span>
            <span className="font-sans font-black tracking-widest text-[#003da5] hover:text-blue-700 transition-colors">INITECH</span>
          </div>
        </div>
      </section>

      {/* Dark Banner CTA Card */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden bg-[#09152b] rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Join the Future of Work
            </h2>
            <p className="text-xs sm:text-base text-gray-300 mb-8 leading-relaxed font-normal">
              Stop searching. Start executing. Let algorithms find your perfect match.
            </p>
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 bg-[#0052cc] hover:bg-[#0043b3] text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.98]"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/70 bg-white py-8 px-6 sm:px-12 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#003da5] tracking-tight text-sm">
              FREEMATCH AI
            </span>
          </div>
          
          <span className="text-gray-400 text-[11px]">
            © 2024 FREEMATCH AI. Algorithmic Trust.
          </span>

          <div className="flex items-center space-x-6 text-gray-500 font-medium">
            <a href="#privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-gray-900 transition-colors">
              Security Overview
            </a>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Popups */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {activeModal === 'matching' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0052cc] rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">AI Matching Engine</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Our matching engine computes multi-dimensional vector similarities between project requirements and specialist talent profiles to find the exact match for your needs.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0052cc] text-white rounded-xl text-xs font-semibold hover:bg-[#0043b3]"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'talent' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0052cc] rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Verified Elite Talent</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Every freelancer on FREEMATCH AI undergoes rigorous technical and behavioral vetting. Only the top 3% gain access to ensure high-stakes quality.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0052cc] text-white rounded-xl text-xs font-semibold hover:bg-[#0043b3]"
                  >
                    Join Network
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'how-it-works' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0052cc] rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">How It Works</h3>
                </div>
                <div className="space-y-3 text-xs text-gray-700 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl font-medium">1. Data Ingestion: Post your project requirements and constraints.</div>
                  <div className="p-3 bg-gray-50 rounded-xl font-medium">2. Algorithmic Synthesis: Algorithms compute instant candidate compatibility.</div>
                  <div className="p-3 bg-gray-50 rounded-xl font-medium">3. Execution Phase: Onboard talent and manage deliverables seamlessly.</div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#0052cc] text-white rounded-xl text-xs font-semibold hover:bg-[#0043b3]"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-50 text-[#0052cc] rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Security & Escrow</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Enterprise-grade security structures and milestone escrow ensure funds are protected and only released upon verified work completion.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('login'); }}
                    className="px-5 py-2.5 bg-[#0052cc] text-white rounded-xl text-xs font-semibold hover:bg-[#0043b3]"
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
