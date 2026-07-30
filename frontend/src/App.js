import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BackendStatusBadge from './components/BackendStatusBadge';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'register'
  
  // Theme state: 'dark' (default) or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('freematch_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('freematch_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
      <div className={`App min-h-screen ${theme}`}>
        <Dashboard 
          userSession={userSession} 
          onSignOut={handleSignOut} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <BackendStatusBadge />
      </div>
    );
  }

  // Otherwise route between Landing Page and Authentication (Login/Register)
  return (
    <div className={`App min-h-screen ${theme}`}>
      {currentView === 'landing' ? (
        <LandingPage 
          onNavigate={handleNavigate} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Login
          userSession={userSession}
          setUserSession={setUserSession}
          onNavigate={handleNavigate}
          initialMode={currentView}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      <BackendStatusBadge />
    </div>
  );
}

export default App;