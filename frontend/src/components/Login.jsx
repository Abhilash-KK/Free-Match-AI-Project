import React, { useState, useEffect } from 'react';
import TiltCard from './TiltCard';

const Login = ({ userSession, setUserSession, onNavigate, initialMode = 'login', theme = 'dark', toggleTheme }) => {
  // Mode state: 'login' | 'register' | 'forgot-password'
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  
  // Role selection state: 'Client' | 'Freelancer' | 'Admin'
  const [role, setRole] = useState('Client');
  
  // Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  
  // Registration Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sign In Password State
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password Direct Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // View Password Toggles for each field
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Interactive Showcase Image Carousel State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const showcaseImages = [
    {
      title: "AI Skill-Matching Engine (NLP)",
      subtitle: "Deep semantic analysis extracting skills & generating 0-100% compatibility scores.",
      src: "/ai_matching_hero.jpg"
    },
    {
      title: "AI Scrum Master & GitHub Progress Tracker",
      subtitle: "Automated daily check-ins & GitHub REST API code contribution verification.",
      src: "/blockchain_trust_hero.jpg"
    },
    {
      title: "Milestone Escrow & Fraud Shield",
      subtitle: "Stripe/Razorpay payment protection & PyTorch anomaly detection.",
      src: "/verified_talent_hero.jpg"
    }
  ];

  // Auto rotate showcase images every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [showcaseImages.length]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialMode === 'register') {
      setMode('register');
    } else if (initialMode === 'login') {
      setMode('login');
    }
  }, [initialMode]);

  // Registered Users Registry (persisted in LocalStorage)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('freematch_registered_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        user_id: 'user1',
        first_name: 'Abhilash',
        last_name: 'K K',
        name: 'Abhilash K K',
        email: 'john@freematch.ai',
        password: 'Password123!',
        role: 'client'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('freematch_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Map internal role values: Client -> client, Freelancer -> freelancer, Admin -> admin
  const getMappedRole = (selectedRole) => {
    if (selectedRole === 'Client') return 'client';
    if (selectedRole === 'Freelancer') return 'freelancer';
    return 'admin';
  };

  // Direct Password Reset (Work Email, New Password, Confirm Password)
  const handleResetPassword = (e) => {
    e.preventDefault();
    setMessage(null);

    const targetEmail = resetEmail.trim().toLowerCase();

    if (!targetEmail) {
      setMessage({ type: 'error', text: 'Please enter your registered work email.' });
      return;
    }

    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (!existingUser) {
      setMessage({ type: 'error', text: `No account found registered under "${targetEmail}".` });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setRegisteredUsers((prev) =>
        prev.map((u) => (u.email.toLowerCase() === targetEmail ? { ...u, password: newPassword } : u))
      );

      setLoading(false);
      setLoginIdentifier(targetEmail);
      setLoginPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({
        type: 'success',
        text: 'Password updated successfully! You can now log in using your new password.'
      });
      setMode('login');
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const targetRole = getMappedRole(role);

    if (mode === 'register') {
      setMessage(null);

      if (!firstName.trim() || !lastName.trim()) {
        setMessage({ type: 'error', text: 'Please enter both your First Name and Last Name.' });
        return;
      }

      if (!regUserId.trim()) {
        setMessage({ type: 'error', text: 'Please choose a User ID / Handle.' });
        return;
      }

      if (regPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setMessage({ type: 'error', text: 'Set Password and Confirm Password do not match.' });
        return;
      }

      setLoading(true);
      const newEmail = email.trim().toLowerCase();
      const newUserId = regUserId.trim().toLowerCase();

      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === newEmail || (u.user_id && u.user_id.toLowerCase() === newUserId)
      );

      if (existingUser) {
        setLoading(false);
        setMessage({ 
          type: 'error', 
          text: `Account with Email "${newEmail}" or User ID "${newUserId}" already exists. Please Log In.` 
        });
        return;
      }

      const newUserObj = {
        user_id: newUserId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: newEmail,
        password: regPassword,
        role: targetRole,
        status: 'Active'
      };

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: newUserId,
            email: newEmail,
            password: regPassword,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: targetRole
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setRegisteredUsers((prev) => [...prev, newUserObj]);
          setUserSession(data.user || newUserObj);
        } else {
          const errData = await response.json().catch(() => ({ detail: 'Registration failed' }));
          setMessage({ type: 'error', text: errData.error || errData.detail || errData.message || 'Registration failed' });
        }
      } catch (err) {
        setRegisteredUsers((prev) => [...prev, newUserObj]);
        setUserSession(newUserObj);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sign In Flow (Supports login by Email ID OR User ID)
    setLoading(true);
    const enteredIdentifier = loginIdentifier.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: enteredIdentifier,
          password: loginPassword,
          role: targetRole
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserSession({
          ...data.user,
          role: targetRole || data.user.role
        });
      } else {
        const errData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
        setMessage({ type: 'error', text: errData.error || errData.detail || errData.message || 'Account not found or incorrect password.' });
      }
    } catch (err) {
      const foundUser = registeredUsers.find(
        (u) =>
          (u.email.toLowerCase() === enteredIdentifier ||
           u.user_id.toLowerCase() === enteredIdentifier) &&
          (u.role.toLowerCase() === targetRole || targetRole === 'admin')
      );

      if (!foundUser) {
        setMessage({
          type: 'error',
          text: `Account "${enteredIdentifier}" not found as ${role}. Please check your Email ID / User ID or create an account.`
        });
      } else if (foundUser.password !== loginPassword) {
        setMessage({
          type: 'error',
          text: `Incorrect password for "${enteredIdentifier}".`
        });
      } else {
        setUserSession(foundUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setMessage(null);
    setLoading(true);
    const targetRole = getMappedRole(role);

    const userEmail = prompt("Enter your Google Account email to Continue with Google:", "user.google@gmail.com");
    if (!userEmail || !userEmail.trim()) {
      setLoading(false);
      return;
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const nameParts = cleanEmail.split('@')[0].split('.');
    const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Google';
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          first_name: firstName,
          last_name: lastName,
          role: targetRole
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserSession(data.user);
      } else {
        const errData = await response.json().catch(() => ({ detail: 'Google Sign-In failed' }));
        setMessage({ type: 'error', text: errData.error || errData.detail || 'Google Authentication failed.' });
      }
    } catch (err) {
      const googleUserObj = {
        user_id: cleanEmail.split('@')[0],
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        email: cleanEmail,
        role: targetRole,
        auth_provider: 'Google'
      };
      setUserSession(googleUserObj);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  // Render Exact Screenshot Eye Icon
  const renderEyeIcon = (isVisible) => {
    if (isVisible) {
      // Eye Visible (Matching user screenshot)
      return (
        <svg className="w-5 h-5 text-blue-500 hover:text-blue-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    // Eye Hidden / Outline
    return (
      <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  };

  return (
    <div className={`min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* LEFT SIDE PANEL (Showcase aligned with Official Project Specs) */}
      <div className={`relative hidden lg:flex flex-col justify-between p-10 lg:p-14 overflow-hidden text-white transition-colors duration-200 ${
        isDark ? 'bg-[#030717] border-r border-slate-800/60' : 'bg-[#091834] border-r border-blue-900/30'
      }`}>
        
        {/* Cyber Grid Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        {/* Multi-Layered Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 -left-10 w-[380px] h-[380px] bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none"></div>

        {/* Top Header Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="relative z-10 flex flex-col cursor-pointer group w-fit"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] group-hover:scale-105 transition-transform border border-blue-400/40">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="6" cy="12" r="2.5" strokeWidth="2.2" />
                <circle cx="18" cy="6" r="2.5" strokeWidth="2.2" />
                <circle cx="18" cy="18" r="2.5" strokeWidth="2.2" />
                <path d="M8.5 10.8l7-3.6M8.5 13.2l7 3.6" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
              FreeMatch AI
            </span>
          </div>
          <p className="text-xs text-slate-300 font-normal mt-2 max-w-md">
            Freelancer-Client Marketplace with AI Skill Matching & Automated Progress Tracking.
          </p>
        </div>

        {/* Center Glassmorphic Smart Match Graphic Showcase */}
        <div className="relative z-10 my-auto py-4 w-full max-w-lg mx-auto">
          <TiltCard maxTilt={10}>
            {/* Glass Card Box with Multi-Depth Glow */}
            <div className={`relative rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(13,91,225,0.35)] overflow-hidden backdrop-blur-2xl transition-all duration-300 border ${
              isDark 
                ? 'bg-[#060e22]/90 border-blue-500/40' 
                : 'bg-[#0a1e45]/95 border-blue-400/40'
            }`}>
            
            {/* Top Live Stats Badge (Left) */}
            <div className="absolute top-5 left-5 z-20 flex items-center space-x-2 bg-[#091533]/90 border border-slate-700/80 px-3 py-1 rounded-full text-[10px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>GitHub API Synced</span>
            </div>

            {/* Top Right AI Smart Match Badge */}
            <div className="absolute top-5 right-5 z-20 flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-2xl shadow-[0_0_25px_rgba(13,91,225,0.6)] border border-blue-300/40">
              <svg className="w-4 h-4 text-blue-100 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold tracking-tight">AI Skill Match 98.4%</div>
                <div className="text-[8px] text-blue-200 uppercase tracking-widest font-semibold">NLP SEMANTIC ENGINE</div>
              </div>
            </div>

            {/* Inner Content */}
            <div className="relative pt-8 pb-2 flex flex-col items-center justify-center">
              
              {/* Card Header Title */}
              <div className="text-center mb-4 max-w-sm mx-auto">
                <span className="inline-block px-3 py-0.5 text-[10px] font-extrabold tracking-widest text-blue-400 uppercase bg-blue-950/80 border border-blue-800/80 rounded-full mb-1.5">
                  Phase 2: Intelligent Automation
                </span>
                <h4 className="text-lg font-bold text-white tracking-tight">Core System Modules</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Natural Language Processing & GitHub REST API integration for transparent execution.
                </p>
              </div>

              {/* 4 Feature Module Badges */}
              <div className="grid grid-cols-4 gap-2 w-full mb-4 text-center">
                <div className="bg-[#081533]/80 hover:bg-[#0c1e45] border border-blue-500/20 rounded-xl p-2 flex flex-col items-center transition-all cursor-pointer group shadow-xs">
                  <span className="text-[10px] font-bold text-white">🧠 NLP Engine</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">0-100% Score</span>
                </div>
                <div className="bg-[#081533]/80 hover:bg-[#0c1e45] border border-blue-500/20 rounded-xl p-2 flex flex-col items-center transition-all cursor-pointer group shadow-xs">
                  <span className="text-[10px] font-bold text-white">📊 AI Scrum</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">GitHub Tracker</span>
                </div>
                <div className="bg-[#081533]/80 hover:bg-[#0c1e45] border border-blue-500/20 rounded-xl p-2 flex flex-col items-center transition-all cursor-pointer group shadow-xs">
                  <span className="text-[10px] font-bold text-white">💳 Escrow</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">Stripe / Razorpay</span>
                </div>
                <div className="bg-[#081533]/80 hover:bg-[#0c1e45] border border-blue-500/20 rounded-xl p-2 flex flex-col items-center transition-all cursor-pointer group shadow-xs">
                  <span className="text-[10px] font-bold text-white">🛡 Fraud Shield</span>
                  <span className="text-[8px] text-slate-400 mt-0.5 leading-tight">PyTorch Anomaly</span>
                </div>
              </div>

              {/* High-Resolution AI Showcase Image Slider Container */}
              <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-blue-500/40 my-2 shadow-[0_0_30px_rgba(13,91,225,0.3)] group">
                <img
                  src={showcaseImages[activeImageIndex].src}
                  alt={showcaseImages[activeImageIndex].title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060e22] via-[#060e22]/40 to-transparent flex flex-col justify-end p-4">
                  <h5 className="text-sm font-bold text-white tracking-tight">
                    {showcaseImages[activeImageIndex].title}
                  </h5>
                  <p className="text-[11px] text-slate-300 font-normal mt-0.5">
                    {showcaseImages[activeImageIndex].subtitle}
                  </p>
                </div>
              </div>

              {/* Interactive Carousel Slide Indicators */}
              <div className="flex items-center justify-center space-x-2 my-2">
                {showcaseImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeImageIndex === idx ? 'w-7 bg-[#0d5be1] shadow-[0_0_12px_rgba(13,91,225,0.8)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={img.title}
                  />
                ))}
              </div>

            </div>

            {/* Floating Executive Testimonial Box */}
            <div className="mt-2 bg-[#081533]/95 border border-blue-500/40 rounded-2xl p-3.5 backdrop-blur-xl relative z-20 max-w-sm shadow-xl">
              <div className="flex items-center space-x-1 text-amber-400 text-xs mb-1">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="text-xs text-slate-100 italic font-medium leading-relaxed mb-1.5">
                "FreeMatch AI's automated GitHub progress tracking and NLP skill matching eliminated micromanagement friction completely."
              </p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-300">
                  Lead Evaluator @ Dept. of Computer Applications
                </p>
                <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full text-[9px] font-bold border border-blue-400/30">
                  ✓ Verified Research
                </span>
              </div>
            </div>

          </div>
          </TiltCard>
        </div>

        {/* Bottom Footer Tracking Line */}
        <div className="relative z-10 text-[11px] font-bold tracking-[0.25em] text-slate-400 flex items-center justify-between w-full pt-4 border-t border-slate-700/50">
          <span>ALGORITHMIC</span>
          <div className="flex-1 mx-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
          <span>TRUST</span>
        </div>
      </div>

      {/* RIGHT SIDE PANEL (Form Workspace) */}
      <div className={`flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#040814] text-slate-100' : 'bg-white text-slate-900'
      }`}>
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between w-full mb-6">
          {/* Mobile Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex lg:hidden items-center space-x-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0d5be1] text-white flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              FreeMatch AI
            </span>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                type="button"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
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

            <button
              onClick={() => onNavigate('landing')}
              className={`hidden sm:inline-flex items-center space-x-2 text-xs font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        {/* Center Main Form */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {/* Alert Notification */}
          {message && (
            <div
              className={`mb-5 p-3.5 rounded-2xl text-xs font-semibold ${
                message.type === 'error'
                  ? isDark ? 'bg-rose-950/70 text-rose-300 border border-rose-800/80' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  : isDark ? 'bg-blue-950/70 text-blue-300 border border-blue-800/80' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* VIEW MODE 1: FORGOT PASSWORD */}
          {mode === 'forgot-password' && (
            <div>
              <div className="text-center mb-6">
                <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Reset Password
                </h2>
                <p className={`mt-2 text-xs sm:text-sm font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enter your registered work email and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Registered Work Email */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Work Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="john@freematch.ai"
                      className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                        isDark 
                          ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                          : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* New Security Password with View Password Toggle */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    New Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                        isDark 
                          ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                          : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                      title={showResetPassword ? "Hide Password" : "View Password"}
                    >
                      {renderEyeIcon(showResetPassword)}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password with View Password Toggle */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                        isDark 
                          ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                          : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                      title={showResetConfirmPassword ? "Hide Password" : "View Password"}
                    >
                      {renderEyeIcon(showResetConfirmPassword)}
                    </button>
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d5be1] hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(13,91,225,0.4)] flex items-center justify-center space-x-2 text-sm cursor-pointer active:scale-[0.99] mt-3"
                >
                  <span>{loading ? 'Updating Password...' : 'Reset Password & Sign In'}</span>
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setMessage(null); }}
                    className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW MODES 2 & 3: LOGIN / REGISTER */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              {/* Title Header */}
              <div className="text-center mb-6">
                <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {mode === 'register' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className={`mt-2 text-xs sm:text-sm font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {mode === 'register'
                    ? 'Join the elite network of professional matches.'
                    : 'Securely sign in using your Email ID or User ID.'}
                </p>
              </div>

              {/* Role Segmented Switcher (Client | Freelancer | Admin) */}
              <div className={`mb-6 p-1 rounded-2xl flex space-x-1 border transition-colors ${
                isDark ? 'bg-[#0c162d] border-slate-800/80' : 'bg-slate-100 border-slate-200'
              }`}>
                {['Client', 'Freelancer', 'Admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                      role === r
                        ? 'bg-[#0d5be1] text-white shadow-[0_0_15px_rgba(13,91,225,0.4)]'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* REGISTER FIELDS: First Name & Last Name (Separate inputs) */}
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {/* First Name */}
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Johnathan"
                            className={`w-full pl-9 pr-3 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                              isDark 
                                ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                                : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Last Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            className={`w-full pl-9 pr-3 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                              isDark 
                                ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                                : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Registration User ID / Handle */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        User ID / Handle <span className="text-slate-400 font-normal">(for login)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={regUserId}
                          onChange={(e) => setRegUserId(e.target.value)}
                          placeholder="e.g. johnathan123"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Registration Work Email */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Work Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@freematch.ai"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Set Security Password (with View Password toggle) */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Set Security Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                          title={showRegPassword ? "Hide Password" : "View Password"}
                        >
                          {renderEyeIcon(showRegPassword)}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Security Password (with View Password toggle) */}
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Confirm Security Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                          title={showRegConfirmPassword ? "Hide Password" : "View Password"}
                        >
                          {renderEyeIcon(showRegConfirmPassword)}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* SIGN IN FIELDS: Email ID OR User ID */}
                {mode === 'login' && (
                  <>
                    <div>
                      <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Work Email Address or User ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          placeholder="john@freematch.ai or user1"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Sign In Security Password Field with View Password Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Security Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(loginIdentifier || '');
                            setNewPassword('');
                            setConfirmPassword('');
                            setMessage(null);
                            setMode('forgot-password');
                          }}
                          className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className={`w-full pl-10 pr-11 py-3 border rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                            isDark 
                              ? 'bg-[#081024] text-white border-slate-800 placeholder-slate-500' 
                              : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                          title={showLoginPassword ? "Hide Password" : "View Password"}
                        >
                          {renderEyeIcon(showLoginPassword)}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Terms Checkbox */}
                {mode === 'register' && (
                  <div className="flex items-start space-x-3 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className={`mt-0.5 w-4 h-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer ${
                        isDark ? 'bg-[#081024]' : 'bg-white'
                      }`}
                    />
                    <label htmlFor="terms-checkbox" className={`text-xs leading-snug cursor-pointer select-none ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      I agree to the <a href="#terms" className="text-blue-500 hover:underline font-semibold">Terms of Service</a> and <a href="#privacy" className="text-blue-500 hover:underline font-semibold">Privacy Policy</a> regarding my professional data processing.
                    </label>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d5be1] hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(13,91,225,0.4)] flex items-center justify-center space-x-2 text-sm cursor-pointer active:scale-[0.99] mt-3"
                >
                  <span>{loading ? 'Processing...' : mode === 'register' ? 'Initialize Profile' : 'Sign In'}</span>
                  {!loading && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="w-full flex items-center my-6">
                <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
                  OR CONTINUE WITH
                </span>
                <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}></div>
              </div>

              {/* Social Sign-In Buttons */}
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className={`w-full border font-semibold py-2.5 px-3 rounded-2xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs cursor-pointer shadow-2xs ${
                    isDark 
                      ? 'bg-[#0c162d] hover:bg-[#111f3d] border-slate-800 text-white' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("LinkedIn Sign-In initialized.")}
                  className={`w-full border font-semibold py-2.5 px-3 rounded-2xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs cursor-pointer shadow-2xs ${
                    isDark 
                      ? 'bg-[#0c162d] hover:bg-[#111f3d] border-slate-800 text-white' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <svg className="w-4 h-4 fill-[#0a66c2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>

              {/* Bottom Switch Account Mode Link */}
              <div className={`mt-8 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {mode === 'register' ? (
                  <>
                    Already part of the network?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setMessage(null); }}
                      className="font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer ml-1"
                    >
                      Log In
                    </button>
                  </>
                ) : (
                  <>
                    New to FREEMATCH?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setMessage(null); }}
                      className="font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer ml-1"
                    >
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel Footer Links */}
        <div className={`w-full flex items-center justify-center space-x-6 text-[11px] font-medium pt-6 border-t mt-auto ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}>
          <a href="#privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-blue-500 transition-colors">Terms of Service</a>
          <a href="#security" className="hover:text-blue-500 transition-colors">Security Overview</a>
        </div>
      </div>

    </div>
  );
};

export default Login;
