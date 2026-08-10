import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BackendStatusBadge from './components/BackendStatusBadge';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'register'
  
  // Theme fixed to clean light mode
  const theme = 'light';

  useEffect(() => {
    localStorage.setItem('freematch_theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  // Persisted Active User Session
  const [userSession, setUserSession] = useState(() => {
    const saved = localStorage.getItem('freematch_active_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (userSession) {
      localStorage.setItem('freematch_active_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('freematch_active_session');
    }
  }, [userSession]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view) => {
    if (view !== currentView) {
      window.history.pushState({ view }, '', view === 'landing' ? '/' : `/${view}`);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    setUserSession(null);
    if (currentView !== 'landing') {
      window.history.pushState({ view: 'landing' }, '', '/');
    }
    setCurrentView('landing');
  };

  // If user is logged in, show role-tailored Dashboard
  if (userSession) {
    return (
      <div className="App min-h-screen light bg-[#f8fafc]">
        <Dashboard 
          userSession={userSession} 
          onSignOut={handleSignOut} 
          theme="light"
        />
        <BackendStatusBadge />
      </div>
    );
  }

  // Otherwise route between Landing Page and Authentication (Login/Register)
  return (
    <div className="App min-h-screen light bg-[#f8fafc]">
      {currentView === 'landing' ? (
        <LandingPage 
          onNavigate={handleNavigate} 
          theme="light"
        />
      ) : (
        <Login
          userSession={userSession}
          setUserSession={setUserSession}
          onNavigate={handleNavigate}
          initialMode={currentView}
          theme="light"
        />
      )}
      <BackendStatusBadge />
    </div>
  );
}

export default App;