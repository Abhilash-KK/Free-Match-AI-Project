import React, { useState, useEffect } from 'react';

const Login = ({ userSession, setUserSession, onNavigate, initialMode = 'login' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');
  const [role, setRole] = useState('Freelancer');
  
  // Login / Signup Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setIsSignUp(initialMode === 'register');
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
        name: 'Abhilash Kk',
        email: 'kkabhilash30@gmail.com',
        password: 'Abhi@123',
        role: 'freelancer'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('freematch_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (isSignUp) {
      setLoading(true);
      const newEmail = email.trim().toLowerCase();

      const existingUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === newEmail
      );

      if (existingUser) {
        setLoading(false);
        setMessage({ 
          type: 'error', 
          text: `Account with Email "${newEmail}" already exists. Please Sign In.` 
        });
        return;
      }

      const newUserObj = {
        user_id: `user_${Date.now().toString().slice(-4)}`,
        name: fullName || 'User',
        email: newEmail,
        password: password,
        role: role.toLowerCase(),
        status: 'Active'
      };

      try {
        const response = await fetch(`${API_BASE_URL}/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUserObj),
        });

        if (response.ok) {
          const data = await response.json();
          setRegisteredUsers((prev) => [...prev, newUserObj]);
          setUserSession(data.user || newUserObj);
        } else {
          const errData = await response.json().catch(() => ({ detail: 'Registration failed' }));
          setMessage({ type: 'error', text: errData.detail || errData.message || 'Registration failed' });
        }
      } catch (err) {
        setRegisteredUsers((prev) => [...prev, newUserObj]);
        setUserSession(newUserObj);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sign In Flow
    setLoading(true);
    const enteredIdentifier = loginIdentifier.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: enteredIdentifier,
          email: enteredIdentifier,
          password: password,
          role: role.toLowerCase()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserSession(data.user);
      } else {
        const errData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
        setMessage({ type: 'error', text: errData.detail || errData.message || 'Account not found or incorrect password.' });
      }
    } catch (err) {
      const foundUser = registeredUsers.find(
        (u) =>
          (u.email.toLowerCase() === enteredIdentifier ||
           u.user_id.toLowerCase() === enteredIdentifier) &&
          u.role.toLowerCase() === role.toLowerCase()
      );

      if (!foundUser) {
        setMessage({
          type: 'error',
          text: `Account "${enteredIdentifier}" not found as ${role}. Please create an account.`
        });
      } else if (foundUser.password !== password) {
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

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-blue-700">
      
      {/* LEFT SIDE PANEL (Split-Screen Hero with Sleek Solid Deep Blue Overlay) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-[#091834] overflow-hidden text-white">
        {/* Background Overlay Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c224c] via-[#091834] to-[#040e24] opacity-95"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('landing')}
          className="relative z-10 flex items-center space-x-3 cursor-pointer group w-fit"
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            FREEMATCH AI
          </span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg my-auto pt-16 pb-12">
          {isSignUp ? (
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5">
                Join the Future of Work
              </h1>
              <p className="text-base text-blue-100/80 font-normal leading-relaxed">
                Establish your presence in the Algorithmic Trust network. Connect directly with high-value contracts and verified teams.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5">
                Elite Talent. <br />
                Algorithmic Precision.
              </h1>
              <p className="text-base text-blue-100/80 font-normal leading-relaxed">
                Join the premier platform connecting top-tier professionals with leading companies through advanced, intelligent matching. Build the perfect team in seconds.
              </p>
            </div>
          )}
        </div>

        {/* Left Panel Footer Copyright */}
        <div className="relative z-10 text-xs text-blue-200/60 font-medium">
          © 2024 Freematch AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE PANEL (Clean Form Workspace) */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white min-h-screen">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between w-full mb-8">
          {/* Mobile Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex lg:hidden items-center space-x-2 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0052cc] text-white flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-[#003da5]">
              FREEMATCH AI
            </span>
          </div>

          <button
            onClick={() => onNavigate('landing')}
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-[#0052cc] cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>

          {/* Toggle link on top right */}
          <div className="ml-auto text-xs sm:text-sm text-gray-500">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setMessage(null); }}
                  className="font-bold text-[#0052cc] hover:underline cursor-pointer"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                New to FREEMATCH?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setMessage(null); }}
                  className="font-bold text-[#0052cc] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center Main Form */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          
          {/* Header Title */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
              {isSignUp
                ? 'Join our network today.'
                : 'Securely sign in to access your intelligent matching dashboard.'}
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs font-semibold ${
                message.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Role Segmented Switcher */}
          <div className="mb-6 bg-gray-100/80 p-1 rounded-xl flex space-x-1 border border-gray-200/50">
            {['Admin', 'Freelancer', 'Client'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  role === r
                    ? 'bg-white text-[#0052cc] shadow-xs border border-gray-200/60'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Create Account Fields */}
            {isSignUp ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Must be at least 12 characters and include a symbol.</p>
                </div>
              </>
            ) : (
              /* Sign In Fields */
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password
                    </label>
                    <a
                      href="#forgot-password"
                      onClick={(e) => { e.preventDefault(); alert("Password reset email dispatched."); }}
                      className="text-xs font-bold text-[#0052cc] hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Primary Action Button with Right Arrow */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052cc] hover:bg-[#0043b3] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm text-sm cursor-pointer disabled:opacity-70 active:scale-[0.99] mt-2"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              {!loading && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>

          {/* Or Continue With Divider */}
          <div className="w-full flex items-center my-6">
            <div className="flex-grow border-t border-gray-200/80"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium tracking-wider uppercase">
              OR CONTINUE WITH
            </span>
            <div className="flex-grow border-t border-gray-200/80"></div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => alert("Google Sign-In initialized.")}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
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
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 fill-[#0a66c2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Terms text for Signup */}
          {isSignUp && (
            <p className="text-[11px] text-gray-400 text-center mt-5 leading-tight">
              By creating an account, you agree to our <a href="#terms" className="font-semibold text-gray-600 hover:underline">Terms of Service</a> and <a href="#privacy" className="font-semibold text-gray-600 hover:underline">Privacy Policy</a>.
            </p>
          )}

          {/* Bottom switch mode text */}
          <div className="mt-8 text-center text-xs text-gray-500">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setMessage(null); }}
                  className="font-bold text-[#0052cc] hover:underline cursor-pointer"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setMessage(null); }}
                  className="font-bold text-[#0052cc] hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel Footer */}
        <div className="w-full flex items-center justify-center space-x-6 text-[11px] text-gray-400 font-medium pt-6 border-t border-gray-100 mt-auto">
          <a href="#privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          <a href="#security" className="hover:text-gray-600 transition-colors">Security Overview</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
