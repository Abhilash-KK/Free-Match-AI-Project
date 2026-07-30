import React, { useState } from 'react';

const AdminDashboard = ({ userSession, onSignOut, theme = 'dark', toggleTheme }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'freelancers' | 'clients' | 'projects' | 'categories' | 'skills' | 'verification' | 'reports' | 'feedback' | 'notifications' | 'settings'

  // Modals & Action States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Data State
  const [freelancers, setFreelancers] = useState([
    { id: '1', name: 'Alex Mercer', email: 'alex.m@system.net', date: 'Oct 24, 2023', status: 'Pending', avatar: 'AM', color: 'bg-blue-600' },
    { id: '2', name: 'Sarah Chen', email: 's.chen@cloudstack.io', date: 'Oct 23, 2023', status: 'Reviewing', avatar: 'SC', color: 'bg-purple-600' },
    { id: '3', name: 'David Wright', email: 'dwright@uxmasters.com', date: 'Oct 23, 2023', status: 'Pending', avatar: 'DW', color: 'bg-emerald-600' },
    { id: '4', name: 'Lana Kim', email: 'l.kim@security.net', date: 'Oct 22, 2023', status: 'Pending', avatar: 'LK', color: 'bg-amber-600' }
  ]);

  const [categories, setCategories] = useState([
    { id: '1', name: 'Software Development', projectCount: 420 },
    { id: '2', name: 'UI/UX Design', projectCount: 215 },
    { id: '3', name: 'Data Science & AI', projectCount: 140 },
    { id: '4', name: 'Cybersecurity', projectCount: 115 }
  ]);

  const [skills, setSkills] = useState([
    { id: '1', name: 'React.js', category: 'Frontend' },
    { id: '2', name: 'Python Django', category: 'Backend' },
    { id: '3', name: 'Tailwind CSS', category: 'Frontend' },
    { id: '4', name: 'PostgreSQL', category: 'Database' },
    { id: '5', name: 'Figma', category: 'Design' }
  ]);

  const [projects] = useState([
    { id: 'p1', title: 'AI Pipeline Optimization', company: 'TechStream Corp', budget: '$12,000', category: 'Data Science', status: 'Active' },
    { id: 'p2', title: 'Brand Identity Redesign', company: 'Nexus Media', budget: '$5,500', category: 'Design', status: 'Active' },
    { id: 'p3', title: 'Security Audit v2.4', company: 'FinGuard Ltd', budget: '$8,200', category: 'Security', status: 'Pending' }
  ]);

  const [feedbacks] = useState([
    { id: 'f1', user: 'Alex Mercer', role: 'Freelancer', rating: 5, comment: 'Platform escrow payments were smooth and transparent.', date: 'Oct 24, 2023' },
    { id: 'f2', user: 'TechStream Corp', role: 'Client', rating: 5, comment: 'Great talent pool and smooth verified milestone delivery.', date: 'Oct 22, 2023' }
  ]);

  // Handlers
  const handleApprove = (id) => {
    setFreelancers(prev => prev.map(f => f.id === id ? { ...f, status: 'Approved' } : f));
  };

  const handleReject = (id) => {
    setFreelancers(prev => prev.map(f => f.id === id ? { ...f, status: 'Rejected' } : f));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCategoryName.trim(), projectCount: 0 }]);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills(prev => [...prev, { id: Date.now().toString(), name: newSkillName.trim(), category: 'General' }]);
    setNewSkillName('');
    setShowAddSkillModal(false);
  };

  return (
    <div className={`min-h-screen flex font-sans ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* LEFT SIDEBAR */}
      <aside className={`w-64 flex-shrink-0 border-r flex flex-col justify-between p-6 transition-colors ${
        isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              FM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-blue-600">FREEMATCH AI</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Algorithmic Trust</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'freelancers', label: 'Manage Freelancers', icon: '👥' },
              { id: 'clients', label: 'Manage Clients', icon: '🏢' },
              { id: 'projects', label: 'Manage Projects', icon: '📋' },
              { id: 'categories', label: 'Manage Categories', icon: '🏷️' },
              { id: 'skills', label: 'Manage Skills', icon: '🎯' },
              { id: 'verification', label: 'Freelancer Verification', icon: '🛡️', badge: 12 },
              { id: 'reports', label: 'Reports', icon: '📈' },
              { id: 'feedback', label: 'Feedback & Reviews', icon: '💬' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' }
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
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="pt-6 border-t border-slate-800/40 space-y-1 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
              activeTab === 'settings' 
                ? 'bg-blue-600 text-white' 
                : isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
          <button
            onClick={onSignOut}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 px-8 py-4 border-b flex items-center justify-between backdrop-blur-xl ${
          isDark ? 'bg-[#030712]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-2xs'
        }`}>
          {/* Global Search Bar */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global search..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all ${
                isDark ? 'bg-[#081024] text-white border-slate-800' : 'bg-slate-50 text-slate-900 border-slate-200'
              }`}
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#081024] border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            )}

            {/* Notification Bell */}
            <button className={`p-2.5 rounded-xl border relative ${
              isDark ? 'bg-[#081024] border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/50">
              <div className="text-right">
                <p className="text-xs font-bold">{userSession?.name || 'Admin System'}</p>
                <p className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider">PRINCIPAL OVERSEER</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                {userSession?.name ? userSession.name.charAt(0) : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* TAB 1: MAIN DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8">
            
            {/* Title & Primary Action */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Precision monitoring of the matching ecosystem.
                </p>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all active:scale-95 cursor-pointer">
                <span>+</span>
                <span>New System Audit</span>
              </button>
            </div>

            {/* 6 OVERVIEW METRIC CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-sm">👥</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+4%</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL FREELANCERS</p>
                <p className="text-2xl font-extrabold mt-1">4,280</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 text-sm">🏢</span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CLIENTS</p>
                <p className="text-2xl font-extrabold mt-1">1,150</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm">📋</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PROJECTS</p>
                <p className="text-2xl font-extrabold mt-1">890</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-sm">⚡</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE PROJECTS</p>
                <p className="text-2xl font-extrabold mt-1">340</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm">✅</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">COMPLETED</p>
                <p className="text-2xl font-extrabold mt-1">450</p>
              </div>

              <div className={`p-5 rounded-2xl border transition-all border-rose-500/30 ${isDark ? 'bg-rose-950/20' : 'bg-rose-50/60 shadow-xs'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500 text-sm">🛡️</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                </div>
                <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">PENDING APPROVALS</p>
                <p className="text-2xl font-extrabold text-rose-500 mt-1">12</p>
              </div>
            </div>

            {/* MAIN CONTENT SPLIT (Chart & Newly Posted Projects + Freelancers Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Monthly Growth Chart & Newly Posted Projects */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Monthly Project Growth Chart */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-sm tracking-tight">Monthly Project Growth</h3>
                    <span className="text-slate-400 text-xs">⋮</span>
                  </div>
                  {/* Visual Bar Chart representation */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-slate-800/40 pb-2">
                    {[
                      { month: 'JAN', val: 30 },
                      { month: 'FEB', val: 45 },
                      { month: 'MAR', val: 35 },
                      { month: 'APR', val: 65 },
                      { month: 'MAY', val: 55 },
                      { month: 'JUN', val: 80 },
                      { month: 'JUL', val: 95 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div 
                          style={{ height: `${item.val}%` }} 
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            item.val > 70 ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : isDark ? 'bg-slate-800 group-hover:bg-blue-500' : 'bg-slate-200 group-hover:bg-blue-500'
                          }`}
                        />
                        <span className="text-[10px] font-bold text-slate-400">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Newly Posted Projects Widget */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm tracking-tight uppercase">Newly Posted Projects</h3>
                    <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-blue-500 hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-800/40">
                    {projects.map(proj => (
                      <div key={proj.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold">{proj.title}</p>
                          <p className="text-[11px] text-slate-400">{proj.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-blue-500">{proj.budget}</p>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-semibold">{proj.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Recently Registered Freelancers Table */}
              <div className="lg:col-span-7">
                <div className={`p-6 rounded-3xl border h-full flex flex-col justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-bold text-base tracking-tight">Recently Registered Freelancers</h3>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>High-value talent awaiting verification</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                          Filter
                        </button>
                        <button className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                          Sort By Date
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className={`uppercase text-[10px] font-extrabold tracking-wider border-b ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'}`}>
                          <tr>
                            <th className="py-3 px-2">Freelancer</th>
                            <th className="py-3 px-2">Join Date</th>
                            <th className="py-3 px-2">Status</th>
                            <th className="py-3 px-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 font-medium">
                          {freelancers.map(f => (
                            <tr key={f.id} className="hover:bg-blue-500/5 transition-colors">
                              <td className="py-3.5 px-2 flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full ${f.color} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                                  {f.avatar}
                                </div>
                                <div>
                                  <p className="font-bold text-xs">{f.name}</p>
                                  <p className="text-[11px] text-slate-400">{f.email}</p>
                                </div>
                              </td>
                              <td className="py-3.5 px-2 text-slate-400">{f.date}</td>
                              <td className="py-3.5 px-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  f.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                  f.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                                  'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {f.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-right space-x-1">
                                <button onClick={() => handleApprove(f.id)} title="Approve" className="p-1.5 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors cursor-pointer">
                                  ✔
                                </button>
                                <button onClick={() => handleReject(f.id)} title="Reject" className="p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer">
                                  ❌
                                </button>
                                <button title="View Profile" className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors cursor-pointer">
                                  👁
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Footer */}
                  <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
                    <span>Showing 4 of 42 recently registered</span>
                    <div className="flex items-center space-x-2">
                      <button className="px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800">‹</button>
                      <button className="px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800">›</button>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Manage Categories</h2>
                <p className="text-xs text-slate-400">Add, edit, or delete platform job categories.</p>
              </div>
              <button 
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
              >
                + Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className={`p-5 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <h4 className="font-bold text-sm">{cat.name}</h4>
                    <p className="text-xs text-slate-400">{cat.projectCount} Projects</p>
                  </div>
                  <button 
                    onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))}
                    className="text-rose-500 hover:text-rose-400 text-xs font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE SKILLS */}
        {activeTab === 'skills' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Manage Skills</h2>
                <p className="text-xs text-slate-400">Maintain technical skills repository for candidate matching.</p>
              </div>
              <button 
                onClick={() => setShowAddSkillModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
              >
                + Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {skills.map(sk => (
                <div key={sk.id} className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-3 ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-xs font-bold">{sk.name}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{sk.category}</span>
                  <button 
                    onClick={() => setSkills(prev => prev.filter(s => s.id !== sk.id))}
                    className="text-slate-400 hover:text-rose-500 text-xs cursor-pointer ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS & FEEDBACK */}
        {(activeTab === 'reports' || activeTab === 'feedback') && (
          <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold">Feedback & Platform Reviews</h2>
            <div className="space-y-4">
              {feedbacks.map(fb => (
                <div key={fb.id} className={`p-5 rounded-2xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">{fb.user} ({fb.role})</span>
                    <span className="text-xs text-amber-400 font-bold">★ {fb.rating}.0</span>
                  </div>
                  <p className="text-xs text-slate-300 italic mb-2">"{fb.comment}"</p>
                  <span className="text-[10px] text-slate-500">{fb.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-lg font-bold mb-4">Add New Project Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category Name (e.g. Mobile Apps)"
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

      {/* ADD SKILL MODAL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`p-6 rounded-3xl max-w-md w-full border ${isDark ? 'bg-[#081024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-lg font-bold mb-4">Add New Skill</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <input
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Skill Name (e.g. Next.js, GraphQL)"
                className="w-full p-3 border rounded-xl text-xs bg-transparent"
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddSkillModal(false)} className="px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Add Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
