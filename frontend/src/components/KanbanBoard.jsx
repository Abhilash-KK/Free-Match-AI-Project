import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { 
  Kanban, 
  Trash2, 
  Plus, 
  FolderKanban, 
  User, 
  Calendar, 
  Building2, 
  Circle, 
  Loader2, 
  Eye, 
  CheckCircle2, 
  Play, 
  Send, 
  Clock, 
  X, 
  Sparkles, 
  FileText,
  Workflow,
  ListChecks
} from 'lucide-react';

const DEFAULT_TASKS = [
  { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', budget: '$2,500', project: 'AI Pipeline Optimization' },
  { id: 't2', title: 'Design D3.js Financial Chart Widgets', status: 'In Progress', assignee: 'Sarah Chen', budget: '$1,800', project: 'FinTech Dashboard v2' },
  { id: 't3', title: 'Restructure REST API Inference Endpoints', status: 'Under Review', assignee: 'Alex Mercer', budget: '$4,000', project: 'AI Pipeline Optimization' },
  { id: 't4', title: 'OWASP Security Audit & Vulnerability Report', status: 'Done', assignee: 'Lana Kim', budget: '$4,200', project: 'Cybersecurity Audit & Shield' }
];

const KanbanBoard = ({ role = 'client', currentUserName = 'Alex Mercer', initialProjectFilter = 'All', isDark = false }) => {
  const [toast, setToast] = useState(null);
  const defaultFilter = role === 'freelancer' ? 'All Assigned Projects' : (initialProjectFilter || 'All');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState(defaultFilter);

  useEffect(() => {
    if (initialProjectFilter) {
      if (role === 'freelancer' && initialProjectFilter === 'All') {
        setSelectedProjectFilter('All Assigned Projects');
      } else {
        setSelectedProjectFilter(initialProjectFilter);
      }
    }
  }, [initialProjectFilter, role]);

  // Retrieve active session for multi-tenant data isolation
  const getActiveUser = () => {
    try {
      const sessionStr = localStorage.getItem('freematch_active_session');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        const uid = (parsed?.user_id || parsed?.email || parsed?.name || 'guest').toLowerCase().trim();
        const isDemo = uid === 'user1' || uid === 'abhilash' || uid.includes('james') || uid.includes('alex') || uid.includes('mercer') || uid.includes('haines') || uid.includes('abhilash') || uid.includes('john@freematch.ai') || uid.includes('techstream');
        return { uid, isDemo };
      }
    } catch (e) {}
    return { uid: 'guest', isDemo: true };
  };

  const { uid: currentUserId, isDemo: isDemoUser } = getActiveUser();
  const taskStorageKey = `freematch_user_${currentUserId}_tasks`;
  const proposalStorageKey = `freematch_user_${currentUserId}_proposals`;
  const projectStorageKey = `freematch_user_${currentUserId}_projects`;

  const deduplicateTasks = (list) => {
    if (!Array.isArray(list)) return [];
    const seen = new Map();
    list.forEach(t => {
      const proj = t.project || t.projectTitle || t.project_name || 'Enterprise Project';
      const key = (t.id || `${t.title || ''}_${proj}`).toString().toLowerCase().trim();
      if (!key) return;
      if (!seen.has(key)) {
        seen.set(key, {
          ...t,
          project: proj,
          assignee: t.assignee || t.assignee_name || 'Assigned Freelancer'
        });
      }
    });
    return Array.from(seen.values());
  };

  const FREELANCER_DEFAULT_TASKS = {
    alex: [
      { id: 't_alex_1', title: 'PyTorch Model Optimization & TensorRT Quantization', status: 'In Progress', assignee: 'Alex Mercer', budget: '$4,500', project: 'AI Pipeline Optimization' },
      { id: 't_alex_2', title: 'CUDA Parallel Execution & vLLM Memory Profiling', status: 'Under Review', assignee: 'Alex Mercer', budget: '$3,500', project: 'AI Pipeline Optimization' },
      { id: 't_alex_3', title: 'Automated Integration Benchmarking Suite', status: 'To Do', assignee: 'Alex Mercer', budget: '$3,500', project: 'AI Automated Test Pipeline' },
      { id: 't_alex_4', title: 'REST API Gateway Performance Validation', status: 'Done', assignee: 'Alex Mercer', budget: '$3,000', project: 'AI Automated Test Pipeline' }
    ],
    haines: [
      { id: 't_haines_1', title: 'Build Rust Order Execution Core Engine', status: 'In Progress', assignee: 'Haines Jose Paulson', budget: '$6,000', project: 'NextGen Autonomous Trading Engine' },
      { id: 't_haines_2', title: 'Implement WebSocket Orderbook & Telemetry Feed', status: 'To Do', assignee: 'Haines Jose Paulson', budget: '$4,000', project: 'NextGen Autonomous Trading Engine' },
      { id: 't_haines_3', title: 'Configure Google OR-Tools TSP solver', status: 'In Progress', assignee: 'Haines Jose Paulson', budget: '$5,000', project: 'Autonomous Supply Chain Freight Router' },
      { id: 't_haines_4', title: 'Implement real-time GPS telemetry WebSockets', status: 'Done', assignee: 'Haines Jose Paulson', budget: '$3,500', project: 'Autonomous Supply Chain Freight Router' }
    ],
    sarah: [
      { id: 't_sarah_1', title: 'Set up DICOM PACS server connection', status: 'In Progress', assignee: 'Sarah Chen', budget: '$4,800', project: 'AI Medical Imaging Diagnostic Suite' },
      { id: 't_sarah_2', title: 'Train UNet lesion detection model', status: 'In Progress', assignee: 'Sarah Chen', budget: '$5,500', project: 'AI Medical Imaging Diagnostic Suite' },
      { id: 't_sarah_3', title: 'Neo4j Schema Design & Entity Extraction', status: 'Done', assignee: 'Sarah Chen', budget: '$4,200', project: 'Enterprise Knowledge Graph RAG Bot' },
      { id: 't_sarah_4', title: 'Deploy GraphRAG Compliance Verification Bot', status: 'Done', assignee: 'Sarah Chen', budget: '$3,800', project: 'Enterprise Knowledge Graph RAG Bot' }
    ]
  };

  const getFreelancerDefaultTasks = React.useCallback((userName) => {
    const nameClean = (userName || '').toLowerCase();
    if (nameClean.includes('haines')) return FREELANCER_DEFAULT_TASKS.haines;
    if (nameClean.includes('sarah')) return FREELANCER_DEFAULT_TASKS.sarah;
    if (nameClean.includes('alex') || nameClean.includes('user1') || nameClean.includes('abhilash')) return FREELANCER_DEFAULT_TASKS.alex;
    return [];
  }, []);

  const getCombinedTasks = (currentTasks) => {
    let baseTasks = Array.isArray(currentTasks) ? [...currentTasks] : [];

    // 0. Merge shared tasks assigned by Client
    try {
      const savedSharedTasks = localStorage.getItem('freematch_shared_tasks') || localStorage.getItem('freematch_kanban_tasks');
      if (savedSharedTasks) {
        const sharedArr = JSON.parse(savedSharedTasks);
        if (Array.isArray(sharedArr) && sharedArr.length > 0) {
          sharedArr.forEach(st => {
            const assigneeClean = (st.assignee || st.freelancer || '').toLowerCase().trim();
            const currentClean = (currentUserName || currentUserId || '').toLowerCase().trim();
            const firstWordCurrent = currentClean.split('@')[0].split(' ')[0];
            const firstWordAssignee = assigneeClean.split('@')[0].split(' ')[0];

            const matchesUser = role === 'client' ||
              assigneeClean.includes(currentClean) ||
              currentClean.includes(assigneeClean) ||
              (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent)) ||
              (firstWordAssignee.length > 2 && currentClean.includes(firstWordAssignee));

            if (matchesUser) {
              const key = (st.id || `${st.title}_${st.project}`).toString().toLowerCase().trim();
              if (!baseTasks.some(bt => (bt.id || `${bt.title}_${bt.project}`).toString().toLowerCase().trim() === key)) {
                baseTasks.unshift(st);
              }
            }
          });
        }
      }
    } catch (e) {}

    // Parse projects first to check project statuses
    let projectMap = new Map();
    const savedProjects = localStorage.getItem(projectStorageKey);
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) {
          parsedProjects.forEach(p => {
            if (p.title) projectMap.set(p.title.toLowerCase().trim(), p);
          });
        }
      } catch (e) {}
    }
    
    // 1. Read proposals (both client-scoped & shared across workspace)
    let parsedProps = [];
    try {
      const savedSharedProps = localStorage.getItem('freematch_shared_proposals');
      if (savedSharedProps) {
        const p = JSON.parse(savedSharedProps);
        if (Array.isArray(p)) parsedProps.push(...p);
      }
      const savedLocalProps = localStorage.getItem(proposalStorageKey);
      if (savedLocalProps) {
        const p = JSON.parse(savedLocalProps);
        if (Array.isArray(p)) parsedProps.push(...p);
      }
    } catch (e) {}

    if (parsedProps.length > 0) {
      const accepted = parsedProps.filter(p => p.status === 'Accepted' || p.status === 'Hired' || (p.status || '').toLowerCase().includes('hired'));
      accepted.forEach((p, idx) => {
        const pTitle = p.project || p.projectTitle || 'AI Deliverable';
        const cleanTitle = pTitle.toLowerCase().trim();
        const flName = p.freelancer || p.freelancerName || 'James Joe';
        const bidVal = p.bid || p.bidAmount || '$4,500';

        const projObj = projectMap.get(cleanTitle);
        const isProjCompleted = projObj && (projObj.status === 'Completed' || projObj.progress === 100);

        const exists = baseTasks.some(t => {
          const tProj = (t.project || t.projectTitle || '').toLowerCase().trim();
          const tTitle = (t.title || '').replace(/^deliverable:\s*/i, '').toLowerCase().trim();
          return tProj === cleanTitle || tTitle === cleanTitle || (tProj && cleanTitle && (tProj.includes(cleanTitle) || cleanTitle.includes(tProj)));
        });

        if (!exists) {
          baseTasks.push({
            id: `t_prop_${p.id || idx}`,
            title: `Deliverable: ${pTitle}`,
            status: isProjCompleted ? 'Done' : 'In Progress',
            assignee: flName,
            budget: bidVal,
            project: pTitle
          });
        }
      });
    }

    // 2. Read projects
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) {
          parsedProjects.forEach((proj, idx) => {
            const pTitle = proj.title;
            if (!pTitle) return;
            const cleanTitle = pTitle.toLowerCase().trim();

            // Skip projects that have no hired freelancer and are still open for bids
            const isUnhired = (proj.status === 'Hiring' || proj.status === 'Open for Bids') && !proj.hiredFreelancer && !proj.freelancer;
            if (isUnhired) return;

            const exists = baseTasks.some(t => {
              const tProj = (t.project || t.projectTitle || '').toLowerCase().trim();
              const tTitle = (t.title || '').replace(/^deliverable:\s*/i, '').toLowerCase().trim();
              return tProj === cleanTitle || tTitle === cleanTitle || (tProj && cleanTitle && (tProj.includes(cleanTitle) || cleanTitle.includes(tProj)));
            });

            if (!exists) {
              let defaultStatus = 'In Progress';
              if (proj.status === 'Completed' || proj.progress === 100 || proj.status === 'Closed' || proj.status === 'Cancelled') {
                defaultStatus = 'Done';
              }

              const assignee = proj.hiredFreelancer || proj.freelancer || 'Assigned Freelancer';

              baseTasks.push({
                id: `t_proj_${proj.id || idx}`,
                title: `Deliverable: ${pTitle}`,
                status: defaultStatus,
                assignee: assignee,
                budget: proj.budget || '$5,000',
                project: pTitle
              });
            }
          });
        }
      } catch (e) {}
    }

    // Clean up generic "Deliverable: <Project Title>" if specific granular tasks exist for that project
    const projectTaskCounts = new Map();
    baseTasks.forEach(t => {
      const p = (t.project || t.projectTitle || '').toLowerCase().trim();
      const isGeneric = (t.title || '').toLowerCase().startsWith('deliverable:');
      if (!isGeneric && p) {
        projectTaskCounts.set(p, (projectTaskCounts.get(p) || 0) + 1);
      }
    });

    baseTasks = baseTasks.filter(t => {
      const p = (t.project || t.projectTitle || '').toLowerCase().trim();
      const isGeneric = (t.title || '').toLowerCase().startsWith('deliverable:');
      if (isGeneric) {
        const hasGranular = Array.from(projectTaskCounts.keys()).some(k => k.includes(p) || p.includes(k));
        if (hasGranular || projectTaskCounts.size > 0) {
          return false; // drop generic deliverable since specific granular tasks exist
        }
      }
      return true;
    });

    // If freelancer role and no tasks exist yet, supply default active tasks for the logged in freelancer
    if (baseTasks.length === 0 && role === 'freelancer') {
      baseTasks = [...getFreelancerDefaultTasks(currentUserName)];
    }

    return deduplicateTasks(baseTasks);
  };

  // Sync Kanban tasks across LocalStorage and DB
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(taskStorageKey);
    let loaded = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
      } catch (e) {}
    }
    if (loaded.length === 0 && role === 'freelancer') {
      loaded = getFreelancerDefaultTasks(currentUserName);
    }
    const clean = getCombinedTasks(loaded);
    localStorage.setItem(taskStorageKey, JSON.stringify(clean));
    return clean;
  });

  const loadBackendTasks = React.useCallback(() => {
    let localTasks = [];
    try {
      const saved = localStorage.getItem(taskStorageKey) || localStorage.getItem('freematch_shared_tasks');
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) localTasks = p;
      }
    } catch (e) {}

    let fetchUrl = 'http://localhost:8000/api/sprint-tasks/';
    if (role === 'freelancer') {
      fetchUrl += `?freelancer=${encodeURIComponent(currentUserName || currentUserId)}`;
    } else if (role === 'client') {
      fetchUrl += `?client_id=${encodeURIComponent(currentUserId || currentUserName)}`;
    }
    fetch(fetchUrl)
      .then(res => res.json())
      .then(apiTasks => {
        if (Array.isArray(apiTasks) && apiTasks.length > 0) {
          let matched = apiTasks.map(t => ({
            ...t,
            project: t.project || t.projectTitle || t.project_name || 'Enterprise Project',
            assignee: t.assignee || t.assignee_name || 'Assigned Freelancer'
          }));

          if (localTasks.length > 0) {
            matched = matched.map(mt => {
              const localMatch = localTasks.find(lt => lt.id === mt.id || String(lt.id) === String(mt.id) || lt.title === mt.title);
              return localMatch ? { ...mt, status: localMatch.status } : mt;
            });
          }

          const clean = getCombinedTasks(deduplicateTasks(matched));
          setTasks(clean);
          localStorage.setItem(taskStorageKey, JSON.stringify(clean));
        } else if (localTasks.length > 0) {
          const clean = getCombinedTasks(deduplicateTasks(localTasks));
          setTasks(clean);
        }
      })
      .catch(() => {
        if (localTasks.length > 0) {
          const clean = getCombinedTasks(deduplicateTasks(localTasks));
          setTasks(clean);
        }
      });
  }, [role, currentUserName, currentUserId, taskStorageKey, getFreelancerDefaultTasks]);

  // Re-sync tasks from backend whenever component mounts, filter changes, or event fires
  useEffect(() => {
    loadBackendTasks();
    window.addEventListener('storage', loadBackendTasks);
    window.addEventListener('focus', loadBackendTasks);
    window.addEventListener('freematch_shared_event', loadBackendTasks);
    window.addEventListener('freematch_kanban_event', loadBackendTasks);
    return () => {
      window.removeEventListener('storage', loadBackendTasks);
      window.removeEventListener('focus', loadBackendTasks);
      window.removeEventListener('freematch_shared_event', loadBackendTasks);
      window.removeEventListener('freematch_kanban_event', loadBackendTasks);
    };
  }, [loadBackendTasks, selectedProjectFilter]);

  const updateTaskStatus = async (taskId, newStatus, message) => {
    const targetIdStr = String(taskId).trim();

    setTasks(prevTasks => {
      const updated = prevTasks.map(t => {
        const isMatch = t.id === taskId || String(t.id).trim() === targetIdStr || (t.title && taskId && t.title.toLowerCase().trim() === targetIdStr.toLowerCase());
        return isMatch ? { ...t, status: newStatus } : t;
      });

      localStorage.setItem(taskStorageKey, JSON.stringify(updated));
      localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));

      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('freematch_user_') && key.endsWith('_tasks')) {
            const val = localStorage.getItem(key);
            if (val) {
              try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                  const u = parsed.map(t => (t.id === taskId || String(t.id).trim() === targetIdStr) ? { ...t, status: newStatus } : t);
                  localStorage.setItem(key, JSON.stringify(u));
                }
              } catch (e) {}
            }
          }
        });
      } catch (e) {}

      return updated;
    });

    setToast({ message: message || `Task moved to "${newStatus}"`, type: 'success' });

    if (typeof taskId === 'number' || !isNaN(Number(taskId))) {
      try {
        await fetch(`http://localhost:8000/api/sprint-tasks/${taskId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {}
    }
  };

  const handleRemoveTask = (taskId, taskTitle) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem(taskStorageKey, JSON.stringify(updated));
    setToast({ message: `Removed completed task "${taskTitle}"`, type: 'info' });
  };

  const handleClearCompletedTasks = () => {
    const updated = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');
    setTasks(updated);
    localStorage.setItem(taskStorageKey, JSON.stringify(updated));
    setToast({ message: 'All completed tasks removed from Kanban Board!', type: 'success' });
  };

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskBudget, setNewTaskBudget] = useState('');

  // Extract available projects and hired freelancers for dropdowns
  const availableProjects = React.useMemo(() => {
    if (role === 'freelancer') {
      const set = new Set(['All Assigned Projects']);
      tasks.forEach(t => {
        const p = t.project || t.projectTitle || t.project_name;
        if (!p) return;
        if (isDemoUser) {
          set.add(p);
        } else {
          const currentNameClean = (currentUserName || 'freelancer').toLowerCase().trim();
          const assigneeClean = (t.assignee || '').toLowerCase().trim();
          const firstWordCurrent = currentNameClean.split(' ')[0];
          const matches = assigneeClean.includes(currentNameClean) ||
            currentNameClean.includes(assigneeClean) ||
            (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent)) ||
            (currentUserId && currentUserId !== 'guest' && (assigneeClean.includes(currentUserId.toLowerCase()) || currentUserId.toLowerCase().includes(assigneeClean.split(' ')[0])));
          if (matches) {
            set.add(p);
          }
        }
      });
      return Array.from(set);
    }

    const set = new Set(['All']);
    try {
      const saved = localStorage.getItem(projectStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) parsed.forEach(p => { if (p.title) set.add(p.title); });
      }
    } catch (e) {}
    if (isDemoUser) {
      tasks.forEach(t => {
        const p = t.project || t.projectTitle || t.project_name;
        if (p) set.add(p);
      });
    }
    return Array.from(set);
  }, [tasks, role, currentUserName, currentUserId, projectStorageKey]);

  // Group assigned projects for Freelancer Summary Cards
  const freelancerAssignedProjects = React.useMemo(() => {
    if (role !== 'freelancer') return [];

    const myTasks = isDemoUser ? tasks : tasks.filter(t => {
      const currentNameClean = (currentUserName || 'freelancer').toLowerCase().trim();
      const assigneeClean = (t.assignee || '').toLowerCase().trim();
      const firstWordCurrent = currentNameClean.split('@')[0].split('.')[0].split(' ')[0];
      const firstWordAssignee = assigneeClean.split('@')[0].split('.')[0].split(' ')[0];

      return assigneeClean.includes(currentNameClean) ||
             currentNameClean.includes(assigneeClean) ||
             (firstWordCurrent.length >= 3 && assigneeClean.includes(firstWordCurrent)) ||
             (firstWordAssignee.length >= 3 && currentNameClean.includes(firstWordAssignee)) ||
             (currentUserId && currentUserId !== 'guest' && (assigneeClean.includes(currentUserId.toLowerCase()) || currentUserId.toLowerCase().includes(firstWordAssignee)));
    });

    const projectMap = new Map();
    myTasks.forEach(t => {
      const pName = t.project || t.projectTitle || 'Assigned Project';
      if (!projectMap.has(pName)) {
        projectMap.set(pName, []);
      }
      projectMap.get(pName).push(t);
    });

    const result = [];
    projectMap.forEach((pTasks, pName) => {
      const totalTasks = pTasks.length;
      const doneTasks = pTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length;
      const inProgressTasks = pTasks.filter(t => t.status === 'In Progress').length;
      const underReviewTasks = pTasks.filter(t => t.status === 'Under Review').length;
      const todoTasks = pTasks.filter(t => t.status === 'To Do').length;
      const pendingTasks = todoTasks + underReviewTasks;

      let progress = 0;
      if (totalTasks > 0) {
        progress = Math.round(((todoTasks * 0) + (inProgressTasks * 30) + (underReviewTasks * 60) + (doneTasks * 100)) / totalTasks);
      }

      result.push({
        name: pName,
        clientName: currentUserName || 'Client',
        status: progress === 100 ? 'Completed' : 'Active',
        progress,
        totalTasks,
        doneTasks,
        inProgressTasks,
        pendingTasks,
        deadline: 'Aug 30, 2026'
      });
    });

    return result;
  }, [role, tasks, currentUserName, currentUserId]);

  const availableFreelancers = React.useMemo(() => {
    try {
      const savedProps = localStorage.getItem(proposalStorageKey);
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const names = parsed.map(p => p.freelancer || p.freelancerName).filter(Boolean);
          if (names.length > 0) return Array.from(new Set(names));
        }
      }
    } catch (e) {}
    return ['Haines Jose Paulson', 'Alex Mercer', 'Sarah Chen', 'Lana Kim', 'Elena Rostova', 'Marcus Vance'];
  }, [proposalStorageKey]);

  const handleOpenAddTaskModal = () => {
    setNewTaskTitle('');
    setNewTaskProject(availableProjects.find(p => p !== 'All' && p !== 'All Assigned Projects') || 'NextGen Autonomous Trading Engine');
    setNewTaskAssignee(availableFreelancers[0] || 'Haines Jose Paulson');
    setNewTaskBudget('$1,500');
    setShowAddTaskModal(true);
  };

  const handleSaveNewTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setToast({ message: 'Please enter a task title!', type: 'error' });
      return;
    }

    let formattedBudget = newTaskBudget.trim();
    if (formattedBudget && !formattedBudget.startsWith('$')) {
      const num = parseFloat(formattedBudget.replace(/[^0-9.]/g, ''));
      formattedBudget = isNaN(num) ? '$1,500' : `$${num.toLocaleString()}`;
    }

    const newTask = {
      id: `t_${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'To Do',
      assignee: newTaskAssignee || 'Haines Jose Paulson',
      budget: formattedBudget || '$1,500',
      project: newTaskProject || 'NextGen Autonomous Trading Engine'
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem(taskStorageKey, JSON.stringify(updated));
    localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
    localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    setShowAddTaskModal(false);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_kanban_event'));

    // Save SprintTask to Django REST API Database
    try {
      await fetch('http://localhost:8000/api/sprint-tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          project: newTaskProject,
          assignee: newTaskAssignee,
          budget: formattedBudget
        })
      });
      loadBackendTasks();
    } catch (err) {
      console.warn('Sprint task POST error:', err);
    }

    setToast({ message: `Sprint task "${newTaskTitle.trim()}" created successfully!`, type: 'success' });
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_kanban_event'));
  };

  // Filter tasks based on role and selected project filter
  const displayTasks = tasks.filter(t => {
    const tProjClean = (t.project || t.projectTitle || '').toLowerCase().trim();

    // 1. Role filter for client (only display tasks matching client's posted projects)
    if (role === 'client') {
      const clientOwnedTitles = availableProjects.filter(p => p !== 'All' && p !== 'All Assigned Projects').map(p => p.toLowerCase().trim());
      if (clientOwnedTitles.length > 0) {
        const matchesClientProject = clientOwnedTitles.some(cp => tProjClean.includes(cp) || cp.includes(tProjClean));
        if (!matchesClientProject) return false;
      } else if (!isDemoUser) {
        return false;
      }
    }

    // 2. Role filter for freelancer
    if (role === 'freelancer') {
      if (t.assignee) {
        const currentNameClean = (currentUserName || 'freelancer').toLowerCase().trim();
        const assigneeClean = t.assignee.toLowerCase().trim();
        const firstWordCurrent = currentNameClean.split(' ')[0];
        const firstWordAssignee = assigneeClean.split(' ')[0];

        const matches = isDemoUser ||
          assigneeClean.includes(currentNameClean) ||
          currentNameClean.includes(assigneeClean) ||
          (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent)) ||
          (firstWordAssignee.length > 2 && currentNameClean.includes(firstWordAssignee)) ||
          (currentUserId && currentUserId !== 'guest' && (assigneeClean.includes(currentUserId.toLowerCase()) || currentUserId.toLowerCase().includes(firstWordAssignee)));

        if (!matches) return false;
      }
    }

    // 3. Project filter dropdown
    if (selectedProjectFilter && selectedProjectFilter !== 'All' && selectedProjectFilter !== 'All Assigned Projects') {
      const filterClean = selectedProjectFilter.toLowerCase().trim();
      return tProjClean.includes(filterClean) || filterClean.includes(tProjClean);
    }

    return true;
  });

  // Selected Project Object & Metadata lookup for Summary Banner
  const projectSummaryData = React.useMemo(() => {
    const isAll = !selectedProjectFilter || selectedProjectFilter === 'All' || selectedProjectFilter === 'All Assigned Projects';
    const filteredList = displayTasks;
    
    const totalCount = filteredList.length;
    const todoCount = filteredList.filter(t => t.status === 'To Do').length;
    const inProgressCount = filteredList.filter(t => t.status === 'In Progress').length;
    const underReviewCount = filteredList.filter(t => t.status === 'Under Review').length;
    const doneCount = filteredList.filter(t => t.status === 'Done' || t.status === 'Completed').length;

    // Calculate exact weighted average progress from sprint tasks matching existing formula
    // (To-Do = 0%, In Progress = 30%, Under Review = 60%, Done = 100%)
    let overallProgress = 0;
    if (totalCount > 0) {
      const sumProgress = (todoCount * 0) + (inProgressCount * 30) + (underReviewCount * 60) + (doneCount * 100);
      overallProgress = Math.round(sumProgress / totalCount);
    }

    // Lookup assignee names
    const assigneesSet = new Set(filteredList.map(t => t.assignee).filter(Boolean));
    const assigneeStr = assigneesSet.size === 0 
      ? 'Unassigned' 
      : assigneesSet.size === 1 
        ? Array.from(assigneesSet)[0] 
        : `${Array.from(assigneesSet)[0]} + ${assigneesSet.size - 1} more`;

    // Fetch project deadline from stored projects if available
    let deadline = 'August 30, 2026';
    try {
      const savedProjs = localStorage.getItem(projectStorageKey);
      if (savedProjs) {
        const parsed = JSON.parse(savedProjs);
        const match = parsed.find(p => p.title && (p.title.toLowerCase().includes((selectedProjectFilter || '').toLowerCase()) || (selectedProjectFilter || '').toLowerCase().includes(p.title.toLowerCase())));
        if (match) {
          deadline = match.deadline || match.duration || '6 Weeks (Aug 30, 2026)';
        }
      }
    } catch (e) {}

    return {
      name: isAll ? (role === 'freelancer' ? 'My Assigned Projects' : 'All Active Projects Overview') : selectedProjectFilter,
      progress: overallProgress,
      totalCount,
      todoCount,
      inProgressCount,
      underReviewCount,
      doneCount,
      assigneeStr,
      clientName: currentUserName || 'Client',
      deadline
    };
  }, [selectedProjectFilter, displayTasks, projectStorageKey, role]);

  // Priority helper based on budget/title
  const getTaskPriority = (task) => {
    if (task.priority) return task.priority;
    const b = task.budget || '$1,500';
    const num = parseFloat(b.replace(/[^0-9.]/g, '')) || 1500;
    if (num >= 3500) return 'High';
    if (num >= 2000) return 'Medium';
    return 'Normal';
  };

  // Mobile active column state
  const [mobileActiveTab, setMobileActiveTab] = useState('ALL');
  // Task detail modal state
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>{role === 'client' ? <Kanban className="w-6 h-6 text-blue-500" /> : <Workflow className="w-6 h-6 text-emerald-500" />}</span>
              <span>{role === 'client' ? 'Client Sprint Task Board' : 'Freelancer Sprint Execution Board'}</span>
            </h2>
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
              role === 'client' 
                ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                : 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20'
            }`}>
              {role === 'client' ? 'Client Master Oversight' : 'Freelancer Execution View'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {role === 'client' 
              ? 'Monitor day-to-day freelancer progress, audit task milestones, and review submitted deliverables.' 
              : 'Execute assigned sprint tasks, update status milestones, and submit completed work for escrow release.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 pl-2.5">Filter Project:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#081024] text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {availableProjects.map(proj => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearCompletedTasks}
            className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Clear Completed</span>
          </button>

          {role === 'client' && (
            <button
              onClick={handleOpenAddTaskModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sprint Task</span>
            </button>
          )}
        </div>
      </div>

      {/* COMPACT ROLE-SPECIFIC PROJECT SUMMARY BANNER */}
      {role === 'client' ? (
        /* CLIENT OVERSIGHT BANNER */
        <div className={`p-5 rounded-3xl border shadow-xs transition-all relative overflow-hidden ${
          isDark ? 'bg-gradient-to-r from-[#060e22] via-[#0b1736] to-[#08132e] border-blue-900/40 text-white' : 'bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border-blue-200/80 text-slate-900'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-blue-500">CLIENT OVERSIGHT SUMMARY</span>
                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {selectedProjectFilter === 'All' ? 'ALL PROJECTS' : 'SELECTED PROJECT'}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-500" />
                <span>{projectSummaryData.name}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Freelancer:</span>
                  <strong className="text-slate-800 dark:text-white font-bold">{projectSummaryData.assigneeStr}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Project Deadline:</span>
                  <strong className="text-slate-800 dark:text-white font-bold">{projectSummaryData.deadline}</strong>
                </span>
              </div>
            </div>

            {/* PROGRESS & TASK STATS PILLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Overall Progress Gauge */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center min-w-[140px] ${
                isDark ? 'bg-[#081024]/80 border-slate-800' : 'bg-white border-blue-100 shadow-2xs'
              }`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">OVERALL PROGRESS</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-blue-500">{projectSummaryData.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${projectSummaryData.progress}%` }}
                  />
                </div>
              </div>

              {/* Task Breakdown Chips */}
              <div className={`p-4 rounded-2xl border space-y-2 min-w-[240px] ${
                isDark ? 'bg-[#081024]/80 border-slate-800' : 'bg-white border-blue-100 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  <span>TASKS OVERVIEW</span>
                  <span className="text-slate-700 dark:text-slate-200 font-bold">{projectSummaryData.totalCount} Total</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold">
                  <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <div className="text-xs font-black">{projectSummaryData.todoCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">To-Do</div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <div className="text-xs font-black">{projectSummaryData.inProgressCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">Progress</div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <div className="text-xs font-black">{projectSummaryData.underReviewCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">Review</div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <div className="text-xs font-black">{projectSummaryData.doneCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">Done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FREELANCER EXECUTION BANNER */
        <div className={`p-5 rounded-3xl border shadow-xs transition-all relative overflow-hidden ${
          isDark ? 'bg-gradient-to-r from-[#051817] via-[#09221d] to-[#081a25] border-emerald-900/40 text-white' : 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-slate-50 border-emerald-200/80 text-slate-900'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-500">FREELANCER EXECUTION WORKSPACE</span>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  MY ASSIGNED TASKS
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                <span>{projectSummaryData.name}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Client:</span>
                  <strong className="text-slate-800 dark:text-white font-bold">{projectSummaryData.clientName}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Next Milestone Deadline:</span>
                  <strong className="text-slate-800 dark:text-white font-bold">{projectSummaryData.deadline}</strong>
                </span>
              </div>
            </div>

            {/* FREELANCER STATS PILLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Project Progress Gauge */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center min-w-[140px] ${
                isDark ? 'bg-[#081a18]/80 border-slate-800' : 'bg-white border-emerald-100 shadow-2xs'
              }`}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">PROJECT PROGRESS</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-emerald-500">{projectSummaryData.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${projectSummaryData.progress}%` }}
                  />
                </div>
              </div>

              {/* Freelancer Task Breakdown Chips */}
              <div className={`p-4 rounded-2xl border space-y-2 min-w-[240px] ${
                isDark ? 'bg-[#081a18]/80 border-slate-800' : 'bg-white border-emerald-100 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  <span>MY WORK SUMMARY</span>
                  <span className="text-slate-700 dark:text-slate-200 font-bold">{projectSummaryData.totalCount} Tasks</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <div className="text-xs font-black">{projectSummaryData.doneCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">Completed</div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <div className="text-xs font-black">{projectSummaryData.inProgressCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">In Progress</div>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <div className="text-xs font-black">{projectSummaryData.todoCount + projectSummaryData.underReviewCount}</div>
                    <div className="text-[9px] uppercase tracking-tighter">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MY ASSIGNED PROJECTS SECTION (FOR FREELANCER) */}
      {role === 'freelancer' && freelancerAssignedProjects.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-500" />
              <span>MY ASSIGNED PROJECTS</span>
            </h3>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {freelancerAssignedProjects.length} {freelancerAssignedProjects.length === 1 ? 'Assigned Project' : 'Assigned Projects'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {freelancerAssignedProjects.map(proj => {
              const isSelected = selectedProjectFilter === proj.name || selectedProjectFilter === 'All Assigned Projects' || selectedProjectFilter === 'All';
              return (
                <div 
                  key={proj.name}
                  onClick={() => setSelectedProjectFilter(proj.name)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected 
                      ? (isDark ? 'bg-[#081a18] border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/30' : 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20')
                      : (isDark ? 'bg-[#060e22] border-slate-800 hover:border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:border-slate-300')
                  }`}
                >
                  {/* Title & Percentage Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug break-words flex-1" title={proj.name}>
                      {proj.name}
                    </h4>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      {proj.progress}%
                    </span>
                  </div>

                  {/* Client & Deadline Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                    <span className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Client: <strong className="text-slate-800 dark:text-white font-bold">{proj.clientName}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{proj.deadline}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mb-3.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  {/* Task Breakdown Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 uppercase tracking-wider text-[11px]">
                      TASKS: <strong className="text-slate-800 dark:text-slate-200 font-black">{proj.totalTasks}</strong>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                        ✓ {proj.doneTasks} Done
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px]">
                        ⚡ {proj.inProgressTasks} In Progress
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                        ⏳ {proj.pendingTasks} Pending
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY ASSIGNED TASKS HEADER */}
      {role === 'freelancer' && (
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🎯</span>
            <span>MY ASSIGNED TASKS</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            Showing tasks assigned to {currentUserName}
          </span>
        </div>
      )}

      {/* MOBILE COLUMN SELECTOR TABS (Visible only on small screens) */}
      <div className="block md:hidden">
        <div className="flex items-center space-x-1 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {['ALL', 'To Do', 'In Progress', 'Under Review', 'Done'].map(colTab => (
            <button
              key={colTab}
              onClick={() => setMobileActiveTab(colTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                mobileActiveTab === colTab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {colTab === 'ALL' ? 'All Columns' : colTab}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KANBAN COLUMNS (Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* 1. TO-DO COLUMN (0%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'To Do') && (
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#060e22] border-slate-800/80' : 'bg-slate-50/70 border-slate-200/80 shadow-xs'
          }`}>
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">TO-DO</h3>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">0%</span>
                </div>
                <span className="text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold px-2.5 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'To Do').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'To Do').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                    <p className="text-xl mb-1">📌</p>
                    <p className="text-xs font-bold text-slate-400">No To-Do Tasks</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">All pending work is underway or complete.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'To Do').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                          isDark ? 'bg-[#081024] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200/90'
                        }`}
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate max-w-[160px]">
                            📂 {t.project || t.projectTitle || 'Enterprise Project'}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className={`font-bold text-xs mb-1.5 leading-snug break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-extrabold text-slate-700 dark:text-slate-300">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{t.budget || '$1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-1.5">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'In Progress', `Started task "${t.title}" (Progress -> 30%)`)} 
                              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>⚡</span>
                              <span>Start Task (30%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className={`p-2 rounded-xl text-[10px] font-bold text-center ${
                              isDark ? 'bg-slate-800/80 border border-slate-700/60 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-600'
                            }`}>
                              ⏳ Pending Freelancer Start (0%)
                            </div>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. IN PROGRESS COLUMN (30%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'In Progress') && (
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#060e22] border-blue-900/30' : 'bg-blue-50/40 border-blue-200/80 shadow-xs'
          }`}>
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-blue-500">IN PROGRESS</h3>
                  <span className="text-[10px] bg-blue-500/20 text-blue-500 font-black px-2 py-0.5 rounded-full border border-blue-500/30">30%</span>
                </div>
                <span className="text-[11px] bg-blue-500/20 text-blue-500 font-extrabold px-2.5 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'In Progress').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'In Progress').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-blue-300 dark:border-slate-800">
                    <p className="text-xl mb-1">⚡</p>
                    <p className="text-xs font-bold text-slate-400">No Tasks In Progress</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Start a task from To-Do to begin work.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'In Progress').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                          isDark ? 'bg-blue-950/20 border-blue-900/40 hover:border-blue-700/50' : 'bg-white border-blue-200/90'
                        }`}
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate max-w-[160px]">
                            📂 {t.project || t.projectTitle || 'Enterprise Project'}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className={`font-bold text-xs mb-1.5 leading-snug break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 pt-1 border-t border-blue-100 dark:border-slate-800/60">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[9px] font-extrabold text-blue-500">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{t.budget || '$1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-1.5">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'Under Review', `Submitted "${t.title}" for review (Progress -> 60%)`)} 
                              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>📤</span>
                              <span>Submit Work for Review (60%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className={`p-2 rounded-xl text-[10px] font-bold text-center animate-pulse ${
                              isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-100 border border-blue-200 text-blue-800'
                            }`}>
                              ⚡ Work in Progress (30%)
                            </div>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. UNDER REVIEW COLUMN (60%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'Under Review') && (
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#060e22] border-amber-900/30' : 'bg-amber-50/40 border-amber-200/80 shadow-xs'
          }`}>
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-500">UNDER REVIEW</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-500 font-black px-2 py-0.5 rounded-full border border-amber-500/30">60%</span>
                </div>
                <span className="text-[11px] bg-amber-500/20 text-amber-500 font-extrabold px-2.5 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'Under Review').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'Under Review').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-amber-300 dark:border-slate-800">
                    <p className="text-xl mb-1">🔎</p>
                    <p className="text-xs font-bold text-slate-400">No Tasks Under Review</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Submitted deliverables will appear here.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'Under Review').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                          isDark ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/50' : 'bg-white border-amber-200/90'
                        }`}
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 truncate max-w-[160px]">
                            📂 {t.project || t.projectTitle || 'Enterprise Project'}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className={`font-bold text-xs mb-1.5 leading-snug break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 pt-1 border-t border-amber-100 dark:border-slate-800/60">
                          <span className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px] font-extrabold text-amber-500">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[90px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">{t.budget || '$1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-1.5">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'Done', `Finalized task "${t.title}" & marked Done (100%)`)} 
                              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-[10px] font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <span>✓</span>
                              <span>Finalize & Mark Done (100%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className={`p-2 rounded-xl text-[10px] font-bold text-center animate-pulse ${
                              isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-100 border border-amber-200 text-amber-800'
                            }`}>
                              ⏳ Under Review (60%) — Awaiting Completion
                            </div>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-[10px] font-bold text-amber-500 hover:text-amber-600 transition-all text-center cursor-pointer"
                            >
                              Audit Deliverable
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. DONE COLUMN (100%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'Done') && (
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isDark ? 'bg-[#060e22] border-emerald-900/30' : 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
          }`}>
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/60 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-500">DONE</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-black px-2 py-0.5 rounded-full border border-emerald-500/30">100%</span>
                </div>
                <div className="flex items-center space-x-2">
                  {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length > 0 && (
                    <button
                      onClick={handleClearCompletedTasks}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-500 font-extrabold px-2.5 py-0.5 rounded-full">
                    {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length}
                  </span>
                </div>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-emerald-300 dark:border-slate-800">
                    <p className="text-xl mb-1">🎉</p>
                    <p className="text-xs font-bold text-slate-400">No Completed Tasks</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Finalized deliverables will display here.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').map(t => (
                    <div 
                      key={t.id} 
                      className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                        isDark ? 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700/50' : 'bg-white border-emerald-200/90'
                      }`}
                    >
                      {/* CARD TOP BADGES */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate max-w-[160px]">
                          📂 {t.project || t.projectTitle || 'Enterprise Project'}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          COMPLETED
                        </span>
                      </div>

                      {/* TASK TITLE */}
                      <h4 className="font-bold text-xs mb-1.5 leading-snug break-words">
                        {t.title}
                      </h4>

                      {/* COMPLETED STATUS TEXT */}
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1 flex items-center gap-1">
                        <span>✔ Escrow Released ({t.budget || '$2,500'}) — 100%</span>
                      </p>

                      {/* CARD FOOTER ACTIONS */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-emerald-500/20">
                        <button
                          onClick={() => setSelectedTaskDetail(t)}
                          className="text-[10px] font-bold text-emerald-500 hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemoveTask(t.id, t.title)}
                          className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>🗑️ Remove</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* TASK DETAILS MODAL */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 sm:p-7 max-w-lg w-full border shadow-2xl space-y-5 ${isDark ? 'bg-[#0b1736] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/40">
              <div className="flex items-center space-x-2">
                <span className="text-xl">📋</span>
                <h3 className="font-extrabold text-base">Sprint Task Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTaskDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">TASK TITLE</span>
                <h4 className="text-sm font-black mt-0.5">{selectedTaskDetail.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">PROJECT</span>
                  <p className="font-bold text-blue-500">{selectedTaskDetail.project || selectedTaskDetail.projectTitle || 'Enterprise Project'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">STATUS & PROGRESS</span>
                  <p className="font-bold text-emerald-500">{selectedTaskDetail.status} ({selectedTaskDetail.status === 'Done' ? '100%' : selectedTaskDetail.status === 'Under Review' ? '60%' : selectedTaskDetail.status === 'In Progress' ? '30%' : '0%'})</p>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">ASSIGNED FREELANCER</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{selectedTaskDetail.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">BUDGET / ESCROW</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{selectedTaskDetail.budget || '$1,500'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">WORK ITEM DESCRIPTION</span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">
                  Task deliverable requirements for "{selectedTaskDetail.title}". Deliverable status is synchronized in real-time between Client Oversight and Freelancer Execution workspaces.
                </p>
              </div>

              {/* MODAL ACTION FOOTER */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200/40">
                {role === 'freelancer' && selectedTaskDetail.status === 'To Do' && (
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTaskDetail.id, 'In Progress', `Started task "${selectedTaskDetail.title}"`);
                      setSelectedTaskDetail(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Start Task (30%) →
                  </button>
                )}

                {role === 'freelancer' && selectedTaskDetail.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTaskDetail.id, 'Under Review', `Submitted "${selectedTaskDetail.title}" for review`);
                      setSelectedTaskDetail(null);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Submit for Review (60%) →
                  </button>
                )}

                {role === 'freelancer' && selectedTaskDetail.status === 'Under Review' && (
                  <button
                    onClick={() => {
                      updateTaskStatus(selectedTaskDetail.id, 'Done', `Finalized task "${selectedTaskDetail.title}" & marked Done`);
                      setSelectedTaskDetail(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Finalize & Mark Done (100%) →
                  </button>
                )}

                <button
                  onClick={() => setSelectedTaskDetail(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD SPRINT TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 sm:p-7 max-w-md w-full border shadow-2xl space-y-5 ${isDark ? 'bg-[#0b1736] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/40">
              <div className="flex items-center space-x-2">
                <span className="text-xl">✨</span>
                <h3 className="font-extrabold text-base">Add New Sprint Task</h3>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewTask} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400 uppercase tracking-wider">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Rust Order Execution Core Engine"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-400 uppercase tracking-wider">Select Project</label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                >
                  {availableProjects.map((proj, idx) => (
                    <option key={idx} value={proj}>{proj}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-400 uppercase tracking-wider">Assignee / Freelancer</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  >
                    {availableFreelancers.map((fl, idx) => (
                      <option key={idx} value={fl}>{fl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-400 uppercase tracking-wider">Task Budget ($)</label>
                  <input
                    type="text"
                    placeholder="$1,500"
                    value={newTaskBudget}
                    onChange={(e) => setNewTaskBudget(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
