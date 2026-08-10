import React from 'react';
import AdminDashboard from './dashboards/AdminDashboard';
import FreelancerDashboard from './dashboards/FreelancerDashboard';
import ClientDashboard from './dashboards/ClientDashboard';

const Dashboard = ({ userSession, onSignOut }) => {
  const role = (userSession?.role || 'client').toLowerCase();

  return (
    <div className="relative">
      {/* Strict Single-User Role Dashboard */}
      {role === 'admin' && (
        <AdminDashboard userSession={userSession} onSignOut={onSignOut} theme="light" />
      )}
      {role === 'freelancer' && (
        <FreelancerDashboard userSession={userSession} onSignOut={onSignOut} theme="light" />
      )}
      {role === 'client' && (
        <ClientDashboard userSession={userSession} onSignOut={onSignOut} theme="light" />
      )}
    </div>
  );
};

export default Dashboard;
