import React, { useState } from 'react';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('Admin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Backend Django API Integration URL Base
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const endpoint = isSignUp ? `${API_BASE_URL}/register/` : `${API_BASE_URL}/login/`;
    const payload = isSignUp
      ? { role, full_name: fullName, email, password }
      : { role, email, password };

    console.log(`[Django API Request] POST to ${endpoint}`, payload);

    try {
      // Prepared for Django REST Framework API connection
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: isSignUp ? 'Account created successfully!' : 'Signed in successfully!' });
        console.log('Django Response:', data);
      } else {
        const errData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
        setMessage({ type: 'error', text: errData.detail || errData.message || 'Something went wrong' });
      }
    } catch (err) {
      // Temporary fallback logging for development before Django backend server is running
      console.log('Simulating request payload for demo');
      setMessage({
        type: 'info',
        text: `Ready for Django API! Submitted (${isSignUp ? 'Register' : 'Login'} as ${role}): ${email}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] text-gray-900 font-sans">
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-[#0052cc]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          <span className="font-bold text-base sm:text-lg tracking-tight text-[#003da5] font-sans">
            FREEMATCH AI
          </span>
        </div>
        
        <button
          type="button"
          aria-label="Help"
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
            <path strokeWidth="1.8" strokeLinecap="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
          </svg>
        </button>
      </header>

      {/* Main Content Center */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 w-full max-w-md mx-auto">
        {/* Welcome / Join Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight leading-snug">
            {isSignUp ? 'Join the Future of Work' : 'Welcome Back'}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-gray-500">
            {isSignUp ? 'Algorithmic Trust. Elite Talent.' : 'Securely connect to your talent network.'}
          </p>
        </div>

        {/* Status Message Alert */}
        {message && (
          <div
            className={`w-full mb-4 p-3.5 rounded-xl text-xs sm:text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : message.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Card */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.04)] p-6 sm:p-7">
          {/* Select Your Role Segmented Switcher */}
          <div className="mb-5">
            <div className="flex bg-gray-100/80 p-1 rounded-xl space-x-1">
              {['Admin', 'Freelancer', 'Client'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                    role === r
                      ? 'bg-[#0052cc] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field - Shown only during Signup */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              {isSignUp && (
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
              )}
              <div className="relative">
                {isSignUp && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSignUp ? 'john@example.com' : 'Email'}
                  className={`w-full py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all ${
                    isSignUp ? 'pl-10 pr-4' : 'px-4 py-3'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              {isSignUp && (
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
              )}
              <div className="relative">
                {isSignUp && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? '••••••••' : 'Password'}
                  className={`w-full py-2.5 pr-11 bg-white text-gray-900 border border-gray-200 rounded-xl placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all ${
                    isSignUp ? 'pl-10' : 'px-4 py-3'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password link (Shown in Login mode) */}
            {!isSignUp && (
              <div className="flex justify-end pt-0.5">
                <a
                  href="#forgot-password"
                  className="text-xs font-semibold text-[#0052cc] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0052cc] hover:bg-[#0043b3] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-1.5 shadow-sm shadow-blue-500/10 active:scale-[0.99] text-sm cursor-pointer disabled:opacity-70"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
              {!loading && (
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Or Continue With Divider */}
        <div className="w-full flex items-center my-6">
          <div className="flex-grow border-t border-gray-200/80"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">
            or continue with
          </span>
          <div className="flex-grow border-t border-gray-200/80"></div>
        </div>

        {/* Social Sign-In Buttons */}
        {isSignUp ? (
          /* Grid 2-column layout for Register view as shown in design */
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50/80 border border-gray-200/90 text-gray-700 font-medium py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
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
              className="w-full bg-white hover:bg-gray-50/80 border border-gray-200/90 text-gray-700 font-medium py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 fill-[#0a66c2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>
        ) : (
          /* Full width layout for Login view */
          <div className="w-full space-y-3">
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50/80 border border-gray-200/90 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-3 text-sm cursor-pointer shadow-2xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="w-full bg-[#0a66c2] hover:bg-[#0855a3] text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center space-x-3 text-sm cursor-pointer shadow-sm shadow-blue-600/10"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>Continue with LinkedIn</span>
            </button>
          </div>
        )}

        {/* Toggle between Login and Signup */}
        <p className="mt-7 text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setMessage(null);
                }}
                className="font-semibold text-[#0052cc] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              New to FREEMATCH?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setMessage(null);
                }}
                className="font-semibold text-[#0052cc] hover:underline cursor-pointer"
              >
                Create an account.
              </button>
            </>
          )}
        </p>
      </main>

      {/* Footer Bar */}
      <footer className="w-full border-t border-gray-200/70 bg-[#f8fafc] py-4 px-6 sm:px-10 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          <span className="font-bold text-[#003da5] tracking-tight">
            FREEMATCH AI
          </span>
          <span className="text-gray-400">
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

export default Login;
