import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import FreelancerDashboard from './dashboards/FreelancerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

const Dashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const role = (userSession?.role || 'client').toLowerCase();

  return (
    <div className="relative">
      {/* Strict Single-User Role Dashboard */}
      {role === 'admin' && (
        <AdminDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}
      {role === 'freelancer' && (
        <FreelancerDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}
      {role === 'client' && (
        <ClientDashboard userSession={userSession} onSignOut={onSignOut} theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
};

export default Dashboard;
