import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const DEFAULT_TASKS = [
  { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', budget: '$2,500', project: 'AI Pipeline Optimization' },
  { id: 't2', title: 'Design D3.js Financial Chart Widgets', status: 'In Progress', assignee: 'Sarah Chen', budget: '$1,800', project: 'FinTech Dashboard v2' },
  { id: 't3', title: 'Restructure REST API Inference Endpoints', status: 'Under Review', assignee: 'Alex Mercer', budget: '$4,000', project: 'AI Pipeline Optimization' },
  { id: 't4', title: 'OWASP Security Audit & Vulnerability Report', status: 'Done', assignee: 'Lana Kim', budget: '$4,200', project: 'Cybersecurity Audit & Shield' }
];

const KanbanBoard = ({ role = 'client', currentUserName = 'Alex Mercer', isDark = true }) => {
  const [toast, setToast] = useState(null);

  // Sync Kanban tasks across LocalStorage
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('freematch_kanban_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  });

  // Re-sync tasks from LocalStorage whenever component mounts or window gains focus/storage event
  useEffect(() => {
    const syncTasks = () => {
      const saved = localStorage.getItem('freematch_kanban_tasks');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
          }
        } catch (e) {}
      }
    };
    syncTasks();
    window.addEventListener('storage', syncTasks);
    window.addEventListener('focus', syncTasks);
    return () => {
      window.removeEventListener('storage', syncTasks);
      window.removeEventListener('focus', syncTasks);
    };
  }, []);

  const updateTaskStatus = (taskId, newStatus, message) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    setToast({ message: message || `Task moved to "${newStatus}"`, type: 'success' });
  };

  const handleRemoveTask = (taskId, taskTitle) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    setToast({ message: `Removed completed task "${taskTitle}"`, type: 'info' });
  };

  const handleClearCompletedTasks = () => {
    const updated = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');
    setTasks(updated);
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    setToast({ message: 'All completed tasks removed from Kanban Board!', type: 'success' });
  };

  const handleAddTask = () => {
    const title = prompt('Enter Sprint Task Title:');
    if (title) {
      const newTask = {
        id: `t_${Date.now()}`,
        title,
        status: 'To Do',
        assignee: role === 'freelancer' ? currentUserName : 'Alex Mercer',
        budget: '$3,000',
        project: 'Active Marketplace Project'
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
      setToast({ message: 'New sprint task created!', type: 'success' });
    }
  };

  // Filter tasks based on role:
  // Client sees all tasks across all freelancers; Freelancer sees tasks assigned to them (or all if testing)
  const displayTasks = role === 'freelancer'
    ? tasks.filter(t => t.assignee === currentUserName || t.assignee === 'Alex Mercer' || true) // Render available tasks cleanly
    : tasks;

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight">Project Progress Kanban Board</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              role === 'client' 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {role === 'client' ? 'Client Master Oversight' : 'Freelancer Execution View'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'client' 
              ? 'Monitor day-to-day freelancer progress and review submitted work for escrow payment release.' 
              : 'Move assigned sprint tasks into review to request milestone escrow payouts from client.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleClearCompletedTasks}
            className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            🗑️ Remove Completed Tasks
          </button>
          {role === 'client' && (
            <button
              onClick={handleAddTask}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer shrink-0"
            >
              + Add Sprint Task
            </button>
          )}
        </div>
      </div>

      {/* 4 KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* 1. TO-DO COLUMN (0%) */}
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">TO-DO</h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-extrabold px-2 py-0.5 rounded-full border border-slate-700">0%</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
              {displayTasks.filter(t => t.status === 'To Do').length}
            </span>
          </div>
          <div className="space-y-3">
            {displayTasks.filter(t => t.status === 'To Do').map(t => (
              <div key={t.id} className={`p-4 rounded-2xl border ${isDark ? 'bg-[#081024] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="font-bold text-xs mb-1">{t.title}</p>
                <p className="text-[10px] text-slate-400 mb-3">
                  Assignee: <span className="font-semibold text-slate-200">{t.assignee}</span> {t.budget ? `• ${t.budget}` : ''}
                </p>
                {role === 'freelancer' ? (
                  <button 
                    onClick={() => updateTaskStatus(t.id, 'In Progress', `Started task "${t.title}" (Progress -> 30%)`)} 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Start Task (30%) →
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[10px] font-bold text-slate-400 text-center">
                    ⏳ Pending Freelancer Start (0%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. IN PROGRESS COLUMN (30%) */}
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-400">IN PROGRESS</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">30%</span>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full">
              {displayTasks.filter(t => t.status === 'In Progress').length}
            </span>
          </div>
          <div className="space-y-3">
            {displayTasks.filter(t => t.status === 'In Progress').map(t => (
              <div key={t.id} className={`p-4 rounded-2xl border border-blue-500/30 ${isDark ? 'bg-blue-950/20' : 'bg-blue-50/50'}`}>
                <p className="font-bold text-xs mb-1">{t.title}</p>
                <p className="text-[10px] text-blue-400 mb-3">
                  Assignee: <span className="font-semibold text-white">{t.assignee}</span> {t.budget ? `• ${t.budget}` : ''}
                </p>
                {role === 'freelancer' ? (
                  <button 
                    onClick={() => updateTaskStatus(t.id, 'Under Review', `Submitted "${t.title}" for review (Progress -> 60%)`)} 
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Submit for Review (60%) →
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-300 text-center animate-pulse">
                    ⚡ Work in Progress (30%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. UNDER REVIEW COLUMN (60%) */}
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">UNDER REVIEW</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">60%</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
              {displayTasks.filter(t => t.status === 'Under Review').length}
            </span>
          </div>
          <div className="space-y-3">
            {displayTasks.filter(t => t.status === 'Under Review').map(t => (
              <div key={t.id} className={`p-4 rounded-2xl border border-amber-500/30 ${isDark ? 'bg-amber-950/20' : 'bg-amber-50/50'}`}>
                <p className="font-bold text-xs mb-1">{t.title}</p>
                <p className="text-[10px] text-amber-400 mb-3">
                  Assignee: <span className="font-semibold text-white">{t.assignee}</span> {t.budget ? `• ${t.budget}` : ''}
                </p>
                {role === 'freelancer' ? (
                  <button 
                    onClick={() => updateTaskStatus(t.id, 'Done', `Finalized task "${t.title}" & marked Done (100%)`)} 
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-md cursor-pointer"
                  >
                    ✔ Finalize & Mark Done (100%) →
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 text-center animate-pulse">
                    ⏳ Under Review (60%) — Awaiting Freelancer Completion
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. DONE COLUMN (100%) */}
        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#060e22] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400">DONE</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">100%</span>
            </div>
            <div className="flex items-center space-x-2">
              {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length > 0 && (
                <button
                  onClick={handleClearCompletedTasks}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').map(t => (
              <div key={t.id} className={`p-4 rounded-2xl border border-emerald-500/30 ${isDark ? 'bg-emerald-950/20' : 'bg-emerald-50/50'}`}>
                <p className="font-bold text-xs mb-1">{t.title}</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">
                  ✔ Escrow Verified & Released ({t.budget || '$2,500'}) — 100% Complete
                </p>
                <div className="flex justify-end mt-2 pt-2 border-t border-emerald-500/20">
                  <button
                    onClick={() => handleRemoveTask(t.id, t.title)}
                    className="text-[10px] bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span>🗑️ Remove Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KanbanBoard;
