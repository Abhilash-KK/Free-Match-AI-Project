import React, { useState } from 'react';
import Toast from '../Toast';

const AdminDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'users' | 'governance' | 'financials' | 'audit' | 'settings'
  const [toast, setToast] = useState(null); // { message, type }

  // Modals & Action States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample System Data
  const [verifications, setVerifications] = useState([
    { id: 'v1', name: 'Sarah Chen', role: 'Senior UI/UX Architect', skills: 'Figma, React, Tailwind', docs: 'Passport_TaxID.pdf', date: 'Oct 29, 2023', status: 'Pending Verification' },
    { id: 'v2', name: 'Lana Kim', role: 'Cybersecurity Specialist', skills: 'PenTesting, Python, OWASP', docs: 'SecurityCert_GovID.pdf', date: 'Oct 28, 2023', status: 'Pending Verification' }
  ]);

  const [users, setUsers] = useState([
    { id: 'u1', name: 'Alex Mercer', role: 'Freelancer', email: 'alex.m@system.net', status: 'Active', verified: true, joined: 'Oct 24, 2023' },
    { id: 'u2', name: 'TechStream Corp', role: 'Client', email: 'contact@techstream.io', status: 'Active', verified: true, joined: 'Oct 20, 2023' },
    { id: 'u3', name: 'Sarah Chen', role: 'Freelancer', email: 's.chen@cloudstack.io', status: 'Pending', verified: false, joined: 'Oct 29, 2023' },
    { id: 'u4', name: 'David Wright', role: 'Freelancer', email: 'dwright@uxmasters.com', status: 'Suspended', verified: false, joined: 'Oct 15, 2023' }
  ]);

  const [categories, setCategories] = useState([
    { id: 'c1', name: 'Software Engineering', activeSkills: 42, projects: 420 },
    { id: 'c2', name: 'UI/UX & Visual Design', activeSkills: 28, projects: 215 },
    { id: 'c3', name: 'Data Science & AI/ML', activeSkills: 35, projects: 140 },
    { id: 'c4', name: 'Cybersecurity & Auditing', activeSkills: 19, projects: 115 }
  ]);

  const [skills, setSkills] = useState([
    { id: 's1', name: 'React.js', category: 'Frontend', demand: 'High' },
    { id: 's2', name: 'Python Django', category: 'Backend', demand: 'High' },
    { id: 's3', name: 'PostgreSQL', category: 'Database', demand: 'Medium' },
    { id: 's4', name: 'PyTorch ML', category: 'AI/ML', demand: 'High' },
    { id: 's5', name: 'Figma Design', category: 'Design', demand: 'Medium' }
  ]);

  const [auditLogs] = useState([
    { id: 'log1', time: '10:42:15 AM', event: 'Identity Verified', details: 'Admin approved Alex Mercer tax verification', type: 'security' },
    { id: 'log2', time: '10:35:00 AM', event: 'Escrow Locked', details: '$8,000 locked for AI Pipeline Optimization milestone', type: 'financial' },
    { id: 'log3', time: '09:12:44 AM', event: 'Account Suspended', details: 'User David Wright suspended due to terms violation', type: 'alert' }
  ]);

  // Handlers
  const handleApproveVerification = (id) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    setToast({ message: 'Freelancer identity verified and trust badge awarded!', type: 'success' });
  };

  const handleRejectVerification = (id) => {
    setVerifications(prev => prev.filter(v => v.id !== id));
    setToast({ message: 'Verification application rejected.', type: 'warning' });
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, { id: `c_${Date.now()}`, name: newCategoryName.trim(), activeSkills: 0, projects: 0 }]);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills(prev => [...prev, { id: `s_${Date.now()}`, name: newSkillName.trim(), category: selectedCategory, demand: 'Medium' }]);
    setNewSkillName('');
    setShowAddSkillModal(false);
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* ADMIN CONTROL CONSOLE SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          {/* Logo & Admin Console Title */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              🛡️
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-500">FreeMatch AI</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">System Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: 'overview', label: 'Platform Console Overview', icon: '📊' },
              { id: 'verifications', label: 'Identity Verifications', icon: '🛡️', badge: verifications.length },
              { id: 'users', label: 'User Account Moderation', icon: '👥' },
              { id: 'governance', label: 'Skill & Category Governance', icon: '🏷️' },
              { id: 'financials', label: 'Escrow & Revenue Ledger', icon: '💰' },
              { id: 'audit', label: 'Security & Audit Logs', icon: '📜' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center space-x-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-800/40 space-y-1 text-xs font-semibold">
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300'}`}>
            <span>⚙️</span><span>System Settings</span>
          </button>
          <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer">
            <span>🚪</span><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Control Bar & System Health Ticker */}
        <header className={`sticky top-0 z-30 px-8 py-3 border-b flex items-center justify-between backdrop-blur-xl ${
          isDark ? 'bg-[#030712]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}>
          {/* Health Status Ticker */}
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-300">
              System Health: <span className="text-emerald-400">PostgreSQL Healthy (99.9% Uptime)</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Admin Actions */}
            <button 
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + Category
            </button>
            <button 
              onClick={() => setShowAddSkillModal(true)}
              className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + Skill Tag
            </button>

            {toggleTheme && (
              <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDark ? 'bg-[#081024] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                {isDark ? '☀️' : '🌙'}
              </button>
            )}

            <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-xs font-bold">{userSession?.name || 'Admin System'}</p>
                <p className="text-[10px] text-blue-500 font-extrabold uppercase">SUPER ADMIN</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md text-xs">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-8">
            
            {/* Header Banner */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Platform Management Console</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Monitor user verification requests, ecosystem governance, and security audit logs.
              </p>
            </div>

            {/* 4 EXECUTIVE ADMIN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-5 rounded-2xl border border-emerald-500/40 ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">PLATFORM REVENUE (10% FEE)</p>
                <p className="text-2xl font-extrabold text-emerald-500 mt-1">$14,250</p>
                <p className="text-[11px] text-slate-400 mt-1">From $142,500 Total Escrow Volume</p>
              </div>

              <div className={`p-5 rounded-2xl border border-rose-500/40 ${isDark ? 'bg-rose-950/20' : 'bg-rose-50/50 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">IDENTITY VERIFICATION QUEUE</p>
                <p className="text-2xl font-extrabold text-rose-500 mt-1">{verifications.length} Applications</p>
                <p className="text-[11px] text-slate-400 mt-1">Pending Document & Tax Verification</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">ACTIVE CONTRACTS</p>
                <p className="text-2xl font-extrabold text-blue-500 mt-1">340 Contracts Running</p>
                <p className="text-[11px] text-slate-400 mt-1">Across 890 Total Projects</p>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">SECURITY ALERTS</p>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">0 Critical Vulnerabilities</p>
                <p className="text-[11px] text-slate-400 mt-1">1 User Account Suspended</p>
              </div>
            </div>

            {/* SECTION 1: FREELANCER IDENTITY VERIFICATION QUEUE */}
            <div className={`p-6 rounded-3xl border border-rose-500/30 ${isDark ? 'bg-[#060e22]' : 'bg-white shadow-xs'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-rose-500">Identity Verification Queue</h3>
                  <p className="text-xs text-slate-400">Review tax documents and credentials before awarding trust badge</p>
                </div>
                <button onClick={() => setActiveTab('verifications')} className="text-xs text-blue-400 font-bold hover:underline">View Queue</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase text-[10px] font-extrabold border-b ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'}`}>
                    <tr>
                      <th className="py-3 px-2">Freelancer</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Skill Capabilities</th>
                      <th className="py-3 px-2">Documents</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {verifications.map(v => (
                      <tr key={v.id} className="hover:bg-blue-500/5">
                        <td className="py-3.5 px-2 font-bold">{v.name}</td>
                        <td className="py-3.5 px-2 text-slate-300">{v.role}</td>
                        <td className="py-3.5 px-2 text-blue-400">{v.skills}</td>
                        <td className="py-3.5 px-2 text-slate-400 underline cursor-pointer">📄 {v.docs}</td>
                        <td className="py-3.5 px-2 text-right space-x-2">
                          <button onClick={() => handleApproveVerification(v.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer">
                            Approve Trust Badge
                          </button>
                          <button onClick={() => handleRejectVerification(v.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer">
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: USER ACCOUNT MODERATION & SECURITY AUDIT STREAM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* User Account Moderation */}
              <div className="lg:col-span-7">
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base">User Account Moderation</h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs text-blue-500 font-bold hover:underline">View All Users</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="uppercase text-[10px] font-extrabold text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-2">User Name</th>
                          <th className="py-2.5 px-2">Role</th>
                          <th className="py-2.5 px-2">Status</th>
                          <th className="py-2.5 px-2 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {users.map(u => (
                          <tr key={u.id}>
                            <td className="py-3 px-2 font-bold">{u.name}</td>
                            <td className="py-3 px-2 text-slate-300">{u.role}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button 
                                onClick={() => toggleUserStatus(u.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                                  u.status === 'Active' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Security & Audit Log Stream */}
              <div className="lg:col-span-5">
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <h3 className="font-bold text-base mb-4">Real-Time Audit Log Stream</h3>
                  <div className="space-y-3">
                    {auditLogs.map(log => (
                      <div key={log.id} className="p-3 rounded-2xl bg-black/20 border border-slate-800/60 text-xs">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-blue-400">{log.event}</span>
                          <span className="text-[10px] text-slate-500">{log.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* MODAL: ADD CATEGORY */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h3 className="text-lg font-bold mb-4">Add New Skill Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Mobile Engineering"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent"
                />
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Add Category</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD SKILL */}
        {showAddSkillModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <h3 className="text-lg font-bold mb-4">Add New Skill Tag</h3>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <input
                  type="text"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Kubernetes"
                  className="w-full p-3 border rounded-xl text-xs bg-transparent"
                />
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddSkillModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Add Skill Tag</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
