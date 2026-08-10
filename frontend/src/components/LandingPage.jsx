import React, { useState } from 'react';
import TiltCard from './TiltCard';
import aiMatchingHero from '../assets/ai_matching_hero.jpg';

const LandingPage = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState(null); // 'matching' | 'talent' | 'how-it-works' | 'security' | 'privacy' | 'terms' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // Index of open FAQ accordion item

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToProtocol = () => {
    scrollToSection('how-it-works');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden bg-white text-slate-900 transition-colors duration-200">
      
      {/* Background Subtle Tech Network Orbs & Grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[150px] pointer-events-none bg-blue-100/60"></div>
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none bg-indigo-100/50"></div>

      {/* 3D Floating Grid & Constellation Overlay */}
      <div className="bg-3d-grid-clean opacity-70"></div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-slate-200/80 bg-white/90 shadow-2xs px-4 sm:px-12 py-3.5 flex items-center justify-between transition-all">
        {/* Logo */}
        <div 
          onClick={() => { onNavigate('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="6" cy="12" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="6" r="2.5" strokeWidth="2.2" />
              <circle cx="18" cy="18" r="2.5" strokeWidth="2.2" />
              <path d="M8.5 10.8l7-3.6M8.5 13.2l7 3.6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
            FreeMatch AI
          </span>
        </div>

        {/* Middle Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold text-slate-700">
          <button 
            onClick={() => scrollToSection('matching-engine')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>AI Match Engine</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>

          <button 
            onClick={() => scrollToSection('scrum-master')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>AI Scrum Master</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>

          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>How It Works</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>

          <button 
            onClick={() => scrollToSection('about')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>About</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>

          <button 
            onClick={() => scrollToSection('faq')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>FAQ</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>

          <button 
            onClick={() => scrollToSection('contact')}
            className="relative py-1 hover:text-blue-600 transition-colors cursor-pointer group/link"
          >
            <span>Contact</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-300 group-hover/link:w-full"></span>
          </button>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="hidden sm:inline-flex text-sm font-bold text-slate-800 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl cursor-pointer transition-all duration-200"
          >
            Sign In
          </button>

          <button
            onClick={() => onNavigate('register')}
            className="hidden sm:inline-flex text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-700 px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-[65px] left-0 right-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-2xl p-6 text-slate-900 shadow-xl transition-all">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('matching-engine'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              AI Match Engine
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('scrum-master'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              AI Scrum Master
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('how-it-works'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              How It Works
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('about'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              About
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('faq'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              FAQ
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection('contact'); }}
              className="text-left py-2 font-bold text-base hover:text-blue-600 transition-colors border-b border-slate-100"
            >
              Contact Us
            </button>
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                className="w-full py-3 rounded-2xl border border-blue-500/40 text-blue-600 font-bold text-center text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('register'); }}
                className="w-full py-3 rounded-2xl bg-[#2563eb] hover:bg-blue-700 font-bold text-center text-sm text-white shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION (Matches uploaded design screenshot) */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text & Actions */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>Phase 2: AI NLP Skill Matching & GitHub Progress Tracker</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-sans">
              Hire Top Talent with <br className="hidden sm:inline" />
              <span className="text-[#2563eb]">AI Precision.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed font-normal">
              Connect with top-tier freelancers using deep NLP semantic matching. Automate your workflow with GitHub progress tracking—no micromanagement required.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.98]"
              >
                Get Started
              </button>
              <button
                onClick={scrollToProtocol}
                className="w-full sm:w-auto px-8 py-3.5 font-bold border-2 border-blue-400 hover:border-blue-600 text-blue-600 bg-white hover:bg-blue-50/50 rounded-2xl text-sm transition-all duration-200 shadow-2xs cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column Graphic Illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-45 transition duration-500"></div>
              
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-2xl p-2.5 transition-transform duration-300">
                <img 
                  src={aiMatchingHero} 
                  alt="FreeMatch AI Matching Engine & Robot Assistant" 
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Core Value Cards (Bottom Feature Grid from Screenshot) */}
      <section className="pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: NLP Skill Matching */}
          <TiltCard className="h-full">
            <div id="matching-engine" className="h-full rounded-3xl p-7 border border-slate-200/90 bg-white hover:border-blue-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg flex flex-col items-start transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-100/80 text-pink-600 flex items-center justify-center mb-5 text-xl">
                🧠
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                AI Skill-Matching Engine (NLP)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Deep NLP semantic analysis extracting skills and matching top talent with precision.
              </p>
              <button 
                onClick={() => setActiveModal('matching')} 
                className="mt-6 text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
              >
                <span>Learn More</span>
                <span>→</span>
              </button>
            </div>
          </TiltCard>

          {/* Card 2: AI Scrum Master */}
          <TiltCard className="h-full">
            <div id="scrum-master" className="h-full rounded-3xl p-7 border border-slate-200/90 bg-white hover:border-blue-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg flex flex-col items-start transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-5 text-xl">
                📊
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                AI Scrum Master & Progress Tracker
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Track tasks, commits, and milestones automatically from GitHub.
              </p>
              <button 
                onClick={() => setActiveModal('talent')} 
                className="mt-6 text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
              >
                <span>Learn More</span>
                <span>→</span>
              </button>
            </div>
          </TiltCard>

          {/* Card 3: Milestone Escrow */}
          <TiltCard className="h-full">
            <div id="security" className="h-full rounded-3xl p-7 border border-slate-200/90 bg-white hover:border-blue-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg flex flex-col items-start transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-5 text-xl">
                💳
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                Milestone Escrow & Fraud Shield
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Secure Stripe escrow holding structures paired with fraud detection & protection.
              </p>
              <button 
                onClick={() => setActiveModal('security')} 
                className="mt-6 text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
              >
                <span>Learn More</span>
                <span>→</span>
              </button>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* The FreeMatch AI Workflow Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10 border-t border-slate-100">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold tracking-widest uppercase text-slate-500">
            The FreeMatch AI Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            How Precision AI Talent Matching Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[42px] left-[18%] right-[18%] h-0.5 border-t-2 border-dashed border-blue-300 pointer-events-none z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-start p-7 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="w-11 h-11 rounded-2xl border-2 border-blue-600 text-blue-600 font-extrabold text-base flex items-center justify-center mb-5 bg-white shadow-xs">
              1
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 mb-2">
              Job Posting & NLP Skill Extraction
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Clients post projects with milestone budgets; NLP algorithms parse job descriptions to extract skill tags automatically.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-start p-7 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="w-11 h-11 rounded-2xl border-2 border-blue-600 text-blue-600 font-extrabold text-base flex items-center justify-center mb-5 bg-white shadow-xs">
              2
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 mb-2">
              Algorithmic Synthesis & 0-100% Match
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The matching engine computes vector similarities across profiles, recommending top candidates with match scores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-start p-7 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="w-11 h-11 rounded-2xl bg-[#2563eb] text-white font-extrabold text-base flex items-center justify-center mb-5 shadow-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-extrabold text-slate-900 mb-2">
              AI Scrum Tracker & Escrow Release
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              AI Scrum Master verifies GitHub code updates against sprint boards, releasing milestone escrow funds automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Powered by Tech Stack Section */}
      <section className="py-14 px-4 border-t border-b border-slate-200 bg-slate-50/80">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-extrabold tracking-widest uppercase mb-8 text-slate-500">
            Powered by Modern Enterprise & AI Technology Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-sky-500 font-bold">⚛️</span>
              <span>React.js & Tailwind</span>
            </div>

            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-emerald-500 font-bold">🐍</span>
              <span>Python / Django REST</span>
            </div>

            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-orange-500 font-bold">🧠</span>
              <span>spaCy & PyTorch</span>
            </div>

            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-purple-600 font-bold">🐙</span>
              <span>GitHub REST API</span>
            </div>

            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-indigo-600 font-bold">🐘</span>
              <span>PostgreSQL & MongoDB</span>
            </div>

            <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold shadow-2xs hover:border-blue-300 transition-all">
              <span className="text-blue-600 font-bold">💳</span>
              <span>Stripe / Razorpay</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT & TEAM SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center mb-14">
          <span className="text-xs font-extrabold tracking-widest uppercase text-slate-500">
            OUR GENESIS & INNOVATION TEAM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mt-3 mb-4">
            Engineered by GigMatrix
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
            FreeMatch AI was founded by GigMatrix to revolutionize global freelance collaboration—eliminating manual vetting and micromanagement with deep NLP semantic skill matching and automated GitHub progress tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Mission Card */}
          <div className="lg:col-span-1 rounded-3xl p-8 border border-blue-200 bg-white text-slate-900 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6 border border-blue-200 text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-extrabold mb-3">Company Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To engineer an autonomous, algorithmically trusted marketplace that guarantees fair skill evaluation for developers and transparent deliverable verification for clients.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200 text-slate-500 text-xs font-semibold">
              GigMatrix<br />
              Enterprise Software & AI Solutions
            </div>
          </div>

          {/* Developers Team Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-3xl p-6 border border-slate-200 bg-white shadow-xs flex flex-col items-start transition-all hover:scale-[1.02]">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  AK
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Abhilash K K
                  </h4>
                  <span className="text-xs font-semibold text-blue-600">
                    Lead AI & Backend Engineer
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Architected Django REST backend services, spaCy NLP semantic matching algorithm, and automated tracking integration.
              </p>
              <div className="mt-auto text-xs font-bold text-blue-600 flex items-center space-x-1">
                <span>Core Architect</span>
              </div>
            </div>

            <div className="rounded-3xl p-6 border border-slate-200 bg-white shadow-xs flex flex-col items-start transition-all hover:scale-[1.02]">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md">
                  GM
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    GigMatrix Team
                  </h4>
                  <span className="text-xs font-semibold text-blue-600">
                    Frontend & UI/UX Integration
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Designed responsive React.js single-page application, interactive Sprint Task Boards, and modern clean design system.
              </p>
              <div className="mt-auto text-xs font-bold text-blue-600 flex items-center space-x-1">
                <span>UI & Frontend Division</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold tracking-widest uppercase text-slate-500">
              Evaluator & Technical Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the AI Skill-Matching Engine actually work?",
                a: "FreeMatch AI parses posted job descriptions using spaCy Natural Language Processing (NLP) and Transformer text embeddings to extract required skill vectors. It compares these vectors against candidate freelancer profiles, outputting an algorithmic compatibility score from 0% to 100% to recommend top-5 matches."
              },
              {
                q: "What is the AI Scrum Master & Progress Tracker?",
                a: "The AI Scrum Master connects directly to freelancer development repositories via automated REST API tracking. It cross-checks daily commit logs, active pull requests, and modified lines against sprint task boards to generate plain-English weekly progress reports without manual micromanagement."
              },
              {
                q: "How are milestone payments & escrow secured?",
                a: "Payments are processed through Stripe / Razorpay and held in secure milestone escrow contracts. Funds are released automatically only after the AI Scrum Master verifies active development commits and the client approves the completed sprint milestone. PyTorch anomaly detection filters out fake reviews and spam proposals."
              },
              {
                q: "Is FreeMatch AI open source and available for evaluation?",
                a: "Yes! FreeMatch AI is developed under an open platform architecture by GigMatrix. Both the Django REST backend API and React.js frontend codebases are structured for high performance and seamless integration."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between font-bold text-sm sm:text-base cursor-pointer text-slate-900"
                >
                  <span>{faq.q}</span>
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border transition-transform ${
                    openFaq === idx ? 'rotate-180 bg-blue-600 text-white border-blue-500' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    ↓
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-4 text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl text-center">
          <span className="text-xs font-extrabold tracking-widest uppercase text-slate-500">
            Contact & Support
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 mb-3">
            Get in Touch with the Engineering Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
            Have questions regarding the FreeMatch AI architecture, NLP matching models, or enterprise specs? Reach out directly to the GigMatrix engineering team.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-200 flex items-center justify-center text-lg mb-3">
                📍
              </div>
              <div className="text-xs font-bold text-slate-900">
                Headquarters
              </div>
              <div className="text-xs text-slate-600 leading-relaxed mt-1">
                GigMatrix<br />
                Enterprise Software & AI Division
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-200 flex items-center justify-center text-lg mb-3">
                ✉️
              </div>
              <div className="text-xs font-bold text-slate-900">
                Direct Email Inbox
              </div>
              <a
                href="mailto:kkabhilash30@gmail.com"
                className="text-xs text-blue-600 hover:underline font-bold mt-1 inline-block break-all"
              >
                kkabhilash30@gmail.com
              </a>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-200 flex items-center justify-center text-lg mb-3">
                ⚡
              </div>
              <div className="text-xs font-bold text-slate-900">
                Enterprise Support
              </div>
              <div className="text-xs text-slate-600 leading-relaxed mt-1">
                Priority Response<br />
                24/7 Technical SLA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative z-10">
        <div className="relative overflow-hidden border border-blue-400/30 rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl bg-gradient-to-r from-[#0a2540] via-[#0052cc] to-[#003da5]">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3.5 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-extrabold text-blue-200 uppercase tracking-widest mb-4">
              Get Started Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to Transform Your Freelance Workflow with AI Precision?
            </h2>
            <p className="text-xs sm:text-base text-blue-100 mb-8 leading-relaxed font-normal">
              Stop searching. Start executing. Connect through AI semantic skill matching and automated progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-[#0052cc] font-extrabold rounded-2xl text-sm transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
              >
                Create Free Account
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-8 py-3.5 font-bold border border-blue-300/40 hover:border-white rounded-2xl text-sm bg-blue-900/40 hover:bg-blue-900/60 text-white transition-all cursor-pointer"
              >
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-8 px-6 sm:px-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-sm text-slate-900">
              FreeMatch AI
            </span>
          </div>
          
          <span className="text-xs font-semibold text-slate-600">
            © 2026 FreeMatch AI Technologies | GigMatrix. All rights reserved.
          </span>

          <div className="flex items-center space-x-6 font-semibold">
            <button
              onClick={() => setActiveModal('privacy')}
              className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveModal('security')}
              className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              Security Overview
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Popups */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 bg-white text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {activeModal === 'privacy' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-200 rounded-2xl">
                    🔒
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Privacy Policy</h3>
                </div>
                <p className="text-xs sm:text-sm mb-4 leading-relaxed text-slate-600">
                  GigMatrix ("FreeMatch AI") is committed to protecting your personal and professional data. This Privacy Policy governs data collection, NLP analysis, and milestone tracking.
                </p>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 text-slate-700 text-xs leading-relaxed space-y-2.5 mb-6 max-h-60 overflow-y-auto">
                  <p><strong>1. Data Collection:</strong> We collect account details (email, role, name), GitHub repository links, and skill parameters strictly to power AI skill matching and sprint milestone verification.</p>
                  <p><strong>2. NLP Model Analysis:</strong> Text submitted in job descriptions and developer profiles is processed via spaCy and Transformer embeddings. Data is never sold to third parties or used for external AI training.</p>
                  <p><strong>3. Financial Data & Escrow:</strong> Payment credentials are processed directly via PCI-DSS compliant Stripe and Razorpay SDKs. FreeMatch AI never stores raw credit card details.</p>
                  <p><strong>4. User Rights (GDPR / CCPA):</strong> Users reserve full rights to request complete data export or account deletion by emailing <span className="text-blue-600 font-semibold">kkabhilash30@gmail.com</span>.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Close Privacy Policy
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-200 rounded-2xl">
                    📜
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Terms of Service</h3>
                </div>
                <p className="text-xs sm:text-sm mb-4 leading-relaxed text-slate-600">
                  By registering or using the FreeMatch AI platform operated by GigMatrix, you agree to comply with the following operational terms.
                </p>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 text-slate-700 text-xs leading-relaxed space-y-2.5 mb-6 max-h-60 overflow-y-auto">
                  <p><strong>1. Marketplace Obligations:</strong> Clients agree to post clear job specifications and fund agreed milestone escrows. Freelancers agree to provide authentic skill portfolios and maintain active development logs.</p>
                  <p><strong>2. AI Scrum Master Tracking:</strong> Freelancers consent to automated GitHub commit verification for sprint progress tracking. Verified commits release milestone funds into escrow holding.</p>
                  <p><strong>3. Anti-Fraud & PyTorch Monitoring:</strong> Rating manipulation, spam proposals, or fake milestone submissions will result in immediate account suspension by our automated fraud detection system.</p>
                  <p><strong>4. Intellectual Property:</strong> Ownership of code and assets transfers fully to the Client upon final milestone payout clearance.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Accept & Close
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'matching' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-200 rounded-2xl">
                    🧠
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">AI Skill-Matching Engine (NLP)</h3>
                </div>
                <p className="text-sm mb-4 leading-relaxed text-slate-600">
                  Eliminates manual candidate vetting by autonomously matching job descriptions with suitable freelancer profiles using deep semantic NLP text analysis (spaCy & Hugging Face Transformers).
                </p>
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/90 text-blue-950 font-semibold text-xs leading-relaxed mb-6">
                  • Extracts core skills from job posts.<br />
                  • Generates a 0-100% compatibility score.<br />
                  • Recommends top 5 candidates to clients.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'talent' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-200 rounded-2xl">
                    📊
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">AI Scrum Master & Progress Tracker</h3>
                </div>
                <p className="text-sm mb-4 leading-relaxed text-slate-600">
                  Automates daily updates and monitors milestones to ensure transparent delivery without manual micromanagement.
                </p>
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/90 text-blue-950 font-semibold text-xs leading-relaxed mb-6">
                  • Automated daily check-ins for task statuses & blockers.<br />
                  • Integrates GitHub REST API to verify active development.<br />
                  • NLP summarizes developer logs into plain-English weekly client reports.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('register'); }}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Join Network
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'security' && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2.5 bg-blue-600/10 text-blue-600 border border-blue-200 rounded-2xl">
                    🛡
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Milestone Escrow & Fraud Shield</h3>
                </div>
                <p className="text-sm mb-4 leading-relaxed text-slate-600">
                  Integrated payment gateways (Stripe / Razorpay) handle credit card processing and operational payment distributions via secure milestone holding escrow structures.
                </p>
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/90 text-blue-950 font-semibold text-xs leading-relaxed mb-6">
                  • Blocks AI-generated spam proposals.<br />
                  • PyTorch anomaly detection identifies rating manipulation.<br />
                  • Temporarily suspends fraudulent accounts automatically.
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setActiveModal(null); onNavigate('login'); }}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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
