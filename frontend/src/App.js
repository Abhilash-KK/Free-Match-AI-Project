import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'login' | 'register'
  
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

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = () => {
    setUserSession(null);
    setCurrentView('landing');
  };

  // If user is logged in, show role-tailored Dashboard
  if (userSession) {
    return (
      <div className="App">
        <Dashboard userSession={userSession} onSignOut={handleSignOut} />
      </div>
    );
  }

  // Otherwise route between Landing Page and Authentication (Login/Register)
  return (
    <div className="App">
      {currentView === 'landing' ? (
        <LandingPage onNavigate={handleNavigate} />
      ) : (
        <Login
          userSession={userSession}
          setUserSession={setUserSession}
          onNavigate={handleNavigate}
          initialMode={currentView}
        />
      )}
    </div>
  );
}

export default App;