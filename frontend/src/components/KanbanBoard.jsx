import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { calculateProjectDeadline, getValidTaskDeadline } from '../utils/dateUtils';
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
  ListChecks,
  Home,
  ChevronRight
} from 'lucide-react';

const DEFAULT_TASKS = [
  { id: 't1', title: 'Setup PyTorch Model Training Cluster', status: 'To Do', assignee: 'Alex Mercer', budget: '₹2,500', project: 'AI Pipeline Optimization' },
  { id: 't2', title: 'Design D3.js Financial Chart Widgets', status: 'In Progress', assignee: 'Sarah Chen', budget: '₹1,800', project: 'FinTech Dashboard v2' },
  { id: 't3', title: 'Restructure REST API Inference Endpoints', status: 'Under Review', assignee: 'Alex Mercer', budget: '₹4,000', project: 'AI Pipeline Optimization' },
  { id: 't4', title: 'OWASP Security Audit & Vulnerability Report', status: 'Done', assignee: 'Lana Kim', budget: '₹4,200', project: 'Cybersecurity Audit & Shield' }
];

const KanbanBoard = ({ role = 'client', currentUserName = 'Alex Mercer', initialProjectFilter = 'All', isDark = false, onNavigateHome = () => {} }) => {
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
        const uid = (parsed?.username || parsed?.user_id || parsed?.email || 'guest').toLowerCase().trim();
        const isDemo = uid === 'demo_client' || uid === 'demo_freelancer';
        return { uid, isDemo };
      }
    } catch (e) {}
    return { uid: 'guest', isDemo: false };
  };

  const { uid: currentUserId, isDemo: isDemoUser } = getActiveUser();
  const taskStorageKey = `freematch_user_${currentUserId}_tasks`;
  const proposalStorageKey = `freematch_user_${currentUserId}_proposals`;
  const projectStorageKey = `freematch_user_${currentUserId}_projects`;

  const deduplicateTasks = (list) => {
    if (!Array.isArray(list)) return [];
    const seenById = new Map();
    const seenByTitleProj = new Map();

    list.forEach(t => {
      if (!t) return;
      const proj = t.project || t.projectTitle || t.project_name || 'Enterprise Project';
      const cleanTitle = (t.title || '').trim();
      if (!cleanTitle) return;

      const titleProjKey = `${cleanTitle.toLowerCase()}_${proj.toLowerCase().trim()}`;
      const idKey = t.id ? String(t.id).trim() : null;

      // If already seen by unique ID, skip duplicate
      if (idKey && seenById.has(idKey)) return;

      // If already seen by (title + project):
      // Prefer a numeric database ID over a temporary 't_' or string ID
      if (seenByTitleProj.has(titleProjKey)) {
        const existing = seenByTitleProj.get(titleProjKey);
        const isExistingNumeric = typeof existing.id === 'number' || (!isNaN(Number(existing.id)) && !String(existing.id).startsWith('t_'));
        const isCurrentNumeric = typeof t.id === 'number' || (!isNaN(Number(t.id)) && !String(t.id).startsWith('t_'));

        if (!isExistingNumeric && isCurrentNumeric) {
          if (existing.id) seenById.delete(String(existing.id));
          const normalized = {
            ...t,
            project: proj,
            assignee: t.assignee || t.assignee_name || existing.assignee || 'Assigned Freelancer'
          };
          seenById.set(idKey, normalized);
          seenByTitleProj.set(titleProjKey, normalized);
        }
        return;
      }

      const normalized = {
        ...t,
        project: proj,
        assignee: t.assignee || t.assignee_name || 'Assigned Freelancer',
        deadline: getValidTaskDeadline(t.deadline || t.due, t.startDate || t.postedDate || 'Sep 8, 2026', t.duration || '1 Month')
      };

      if (idKey) seenById.set(idKey, normalized);
      seenByTitleProj.set(titleProjKey, normalized);
    });

    return Array.from(seenByTitleProj.values());
  };

  const FREELANCER_DEFAULT_TASKS = {
    alex: [
      { id: 't_alex_1', title: 'PyTorch Model Optimization & TensorRT Quantization', status: 'In Progress', assignee: 'Alex Mercer', budget: '₹4,500', project: 'AI Pipeline Optimization' },
      { id: 't_alex_2', title: 'CUDA Parallel Execution & vLLM Memory Profiling', status: 'Under Review', assignee: 'Alex Mercer', budget: '₹3,500', project: 'AI Pipeline Optimization' },
      { id: 't_alex_3', title: 'Automated Integration Benchmarking Suite', status: 'To Do', assignee: 'Alex Mercer', budget: '₹3,500', project: 'AI Automated Test Pipeline' },
      { id: 't_alex_4', title: 'REST API Gateway Performance Validation', status: 'Done', assignee: 'Alex Mercer', budget: '₹3,000', project: 'AI Automated Test Pipeline' }
    ],
    haines: [
      { id: 't_haines_1', title: 'Build Rust Order Execution Core Engine', status: 'In Progress', assignee: 'Haines Jose Paulson', budget: '₹6,000', project: 'NextGen Autonomous Trading Engine' },
      { id: 't_haines_2', title: 'Implement WebSocket Orderbook & Telemetry Feed', status: 'To Do', assignee: 'Haines Jose Paulson', budget: '₹4,000', project: 'NextGen Autonomous Trading Engine' },
      { id: 't_haines_3', title: 'Configure Google OR-Tools TSP solver', status: 'In Progress', assignee: 'Haines Jose Paulson', budget: '₹5,000', project: 'Autonomous Supply Chain Freight Router' },
      { id: 't_haines_4', title: 'Implement real-time GPS telemetry WebSockets', status: 'Done', assignee: 'Haines Jose Paulson', budget: '₹3,500', project: 'Autonomous Supply Chain Freight Router' },
      { id: 't_haines_5', title: 'Setup DICOM Telemetry & PACS Pipeline', status: 'In Progress', assignee: 'Haines Jose Paulson', budget: '₹4,500', project: 'AI Medical Imaging Diagnostic Suite' },
      { id: 't_haines_6', title: 'Lesion Segmentation Model Validation', status: 'To Do', assignee: 'Haines Jose Paulson', budget: '₹4,000', project: 'AI Medical Imaging Diagnostic Suite' }
    ],
    sarah: [
      { id: 't_sarah_1', title: 'Set up DICOM PACS server connection', status: 'In Progress', assignee: 'Sarah Chen', budget: '₹4,800', project: 'AI Medical Imaging Diagnostic Suite' },
      { id: 't_sarah_2', title: 'Train UNet lesion detection model', status: 'In Progress', assignee: 'Sarah Chen', budget: '₹5,500', project: 'AI Medical Imaging Diagnostic Suite' },
      { id: 't_sarah_3', title: 'Neo4j Schema Design & Entity Extraction', status: 'Done', assignee: 'Sarah Chen', budget: '₹4,200', project: 'Enterprise Knowledge Graph RAG Bot' },
      { id: 't_sarah_4', title: 'Deploy GraphRAG Compliance Verification Bot', status: 'Done', assignee: 'Sarah Chen', budget: '₹3,800', project: 'Enterprise Knowledge Graph RAG Bot' }
    ]
  };

  const getFreelancerDefaultTasks = React.useCallback((userName) => {
    if (!isDemoUser) return [];
    const nameClean = (userName || '').toLowerCase();
    if (nameClean.includes('haines')) return FREELANCER_DEFAULT_TASKS.haines;
    if (nameClean.includes('sarah')) return FREELANCER_DEFAULT_TASKS.sarah;
    if (nameClean.includes('alex')) return FREELANCER_DEFAULT_TASKS.alex;
    return [];
  }, [isDemoUser]);

  const getCombinedTasks = (currentTasks) => {
    let baseTasks = Array.isArray(currentTasks) ? [...currentTasks] : [];

    // 0. Merge shared tasks assigned by Client (demo only)
    if (isDemoUser) {
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
                (assigneeClean && (
                  assigneeClean === currentClean ||
                  assigneeClean.includes(currentClean) ||
                  currentClean.includes(assigneeClean) ||
                  (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent)) ||
                  (firstWordAssignee.length > 2 && currentClean.includes(firstWordAssignee))
                ));

              if (matchesUser) {
                const stIdStr = st.id ? String(st.id).trim().toLowerCase() : '';
                const stTitleClean = (st.title || '').replace(/^deliverable:\s*/i, '').trim().toLowerCase();
                const stProjClean = (st.project || st.projectTitle || '').trim().toLowerCase();

                const alreadyExists = baseTasks.some(bt => {
                  const btIdStr = bt.id ? String(bt.id).trim().toLowerCase() : '';
                  if (stIdStr && btIdStr && stIdStr === btIdStr) return true;
                  const btTitleClean = (bt.title || '').replace(/^deliverable:\s*/i, '').trim().toLowerCase();
                  const btProjClean = (bt.project || bt.projectTitle || '').trim().toLowerCase();
                  return stTitleClean && btTitleClean && stTitleClean === btTitleClean && (!stProjClean || !btProjClean || stProjClean === btProjClean);
                });

                if (!alreadyExists) {
                  baseTasks.unshift(st);
                }
              }
            });
          }
        }
      } catch (e) {}
    }

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
    
    // 1. Read proposals (demo only)
    if (isDemoUser) {
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
        const accepted = parsedProps.filter(p => {
          const isHired = p.status === 'Accepted' || p.status === 'Hired' || (p.status || '').toLowerCase().includes('hired');
          if (!isHired) return false;
          return true;
        });
        accepted.forEach((p, idx) => {
          const pTitle = p.project || p.projectTitle || 'AI Deliverable';
          const cleanTitle = pTitle.toLowerCase().trim();
          const flName = p.freelancer || p.freelancerName || (role === 'freelancer' ? currentUserName : 'Assigned Freelancer');
          const bidVal = p.bid || p.bidAmount || '₹4,500';

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
              status: isProjCompleted ? 'Done' : 'To Do',
              assignee: flName,
              budget: bidVal,
              project: pTitle
            });
          }
        });
      }

      // 2. Read projects (demo only)
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          if (Array.isArray(parsedProjects)) {
            parsedProjects.forEach((proj, idx) => {
              const pTitle = proj.title;
              if (!pTitle) return;
              const cleanTitle = pTitle.toLowerCase().trim();

              const isUnhired = (proj.status === 'Hiring' || proj.status === 'Open for Bids') && !proj.hiredFreelancer && !proj.freelancer;
              if (isUnhired) return;

              const assignee = proj.hiredFreelancer || proj.freelancer || 'Assigned Freelancer';

              const exists = baseTasks.some(t => {
                const tProj = (t.project || t.projectTitle || '').toLowerCase().trim();
                const tTitle = (t.title || '').replace(/^deliverable:\s*/i, '').toLowerCase().trim();
                return tProj === cleanTitle || tTitle === cleanTitle || (tProj && cleanTitle && (tProj.includes(cleanTitle) || cleanTitle.includes(tProj)));
              });

              if (!exists) {
                let defaultStatus = 'To Do';
                if (proj.status === 'Completed' || proj.progress === 100 || proj.status === 'Closed' || proj.status === 'Cancelled') {
                  defaultStatus = 'Done';
                } else if (proj.progress > 0 && proj.progress < 100) {
                  defaultStatus = proj.progress >= 60 ? 'Under Review' : 'In Progress';
                }

                baseTasks.push({
                  id: `t_proj_${proj.id || idx}`,
                  title: `Deliverable: ${pTitle}`,
                  status: defaultStatus,
                  assignee: assignee,
                  budget: proj.budget || '₹5,000',
                  project: pTitle
                });
              }
            });
          }
        } catch (e) {}
      }
    }

    // If freelancer role and no tasks exist yet, supply default active tasks for the logged in freelancer (demo only)
    if (baseTasks.length === 0 && role === 'freelancer' && isDemoUser) {
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
    if (loaded.length === 0 && role === 'freelancer' && isDemoUser) {
      loaded = getFreelancerDefaultTasks(currentUserName);
    }
    const clean = getCombinedTasks(loaded);
    localStorage.setItem(taskStorageKey, JSON.stringify(clean));
    return clean;
  });

  const loadBackendTasks = React.useCallback(() => {
    let localTasks = [];
    try {
      const saved = isDemoUser
        ? (localStorage.getItem(taskStorageKey) || localStorage.getItem('freematch_shared_tasks'))
        : localStorage.getItem(taskStorageKey);
      if (saved) {
        const p = JSON.parse(saved);
        if (Array.isArray(p)) localTasks = p;
      }
    } catch (e) {}

    let fetchUrl = 'http://localhost:8000/api/sprint-tasks/';
    if (role === 'freelancer') {
      fetchUrl += `?freelancer=${encodeURIComponent(currentUserId || currentUserName)}`;
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

          const clean = getCombinedTasks(deduplicateTasks(matched));
          setTasks(clean);
          localStorage.setItem(taskStorageKey, JSON.stringify(clean));
          if (isDemoUser) {
            localStorage.setItem('freematch_shared_tasks', JSON.stringify(clean));
            localStorage.setItem('freematch_kanban_tasks', JSON.stringify(clean));
          }
        } else if (Array.isArray(apiTasks) && apiTasks.length === 0) {
          if (!isDemoUser) {
            setTasks([]);
            try {
              localStorage.removeItem(taskStorageKey);
            } catch (e) {}
          } else if (localTasks.length > 0) {
            const clean = getCombinedTasks(deduplicateTasks(localTasks));
            setTasks(clean);
          } else {
            setTasks([]);
          }
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
  }, [role, currentUserName, currentUserId, isDemoUser, taskStorageKey, getFreelancerDefaultTasks]);

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
      if (isDemoUser) {
        localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
        localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
      }

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

  const handleRemoveTask = async (taskId, taskTitle, taskStatus) => {
    if (!taskId) return;
    const targetIdStr = String(taskId).trim();

    // 0. Permission check: Only tasks with status 'To Do' (not started) can be deleted
    const targetTask = tasks.find(t => String(t.id).trim() === targetIdStr || (t.title && t.title === taskTitle));
    const currentStatus = taskStatus || targetTask?.status;

    if (currentStatus && currentStatus !== 'To Do') {
      setToast({ message: 'Started tasks cannot be deleted.', type: 'error' });
      return;
    }

    // 1. Delete from backend database if numeric ID
    if (typeof taskId === 'number' || (!isNaN(Number(taskId)) && !targetIdStr.startsWith('t_'))) {
      try {
        await fetch(`http://localhost:8000/api/sprint-tasks/${taskId}/`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Sprint task DELETE notice:', err);
      }
    }

    // 2. Remove strictly this task from state and all storage keys
    setTasks(prevTasks => {
      const updated = prevTasks.filter(t => String(t.id).trim() !== targetIdStr);
      localStorage.setItem(taskStorageKey, JSON.stringify(updated));
      if (isDemoUser) {
        localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
        localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
      }

      return updated;
    });

    setToast({ message: `Removed task "${taskTitle || 'Deliverable'}"`, type: 'info' });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_kanban_event'));
  };

  const handleClearCompletedTasks = async () => {
    const doneTasks = tasks.filter(t => t.status === 'Done' || t.status === 'Completed');
    for (const dt of doneTasks) {
      if (typeof dt.id === 'number' || (!isNaN(Number(dt.id)) && !String(dt.id).startsWith('t_'))) {
        try {
          await fetch(`http://localhost:8000/api/sprint-tasks/${dt.id}/`, { method: 'DELETE' });
        } catch (e) {}
      }
    }

    const updated = tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed');
    setTasks(updated);
    localStorage.setItem(taskStorageKey, JSON.stringify(updated));
    if (isDemoUser) {
      localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
      localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
    }
    setToast({ message: 'All completed tasks removed from Kanban Board!', type: 'success' });
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('freematch_shared_event'));
    window.dispatchEvent(new Event('freematch_kanban_event'));
  };

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskBudget, setNewTaskBudget] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Extract available projects and hired freelancers for dropdowns
  const availableProjects = React.useMemo(() => {
    if (role === 'freelancer') {
      const set = new Set(['All Assigned Projects']);
      tasks.forEach(t => {
        const p = t.project || t.projectTitle || t.project_name;
        if (!p) return;
        const currentNameClean = (currentUserName || currentUserId || 'freelancer').toLowerCase().trim();
        const assigneeClean = (t.assignee || '').toLowerCase().trim();

        const isAlex = (currentNameClean.includes('alex') || currentUserId.includes('alex')) && (assigneeClean.includes('alex') || assigneeClean.includes('mercer'));
        const isSarah = (currentNameClean.includes('sarah') || currentUserId.includes('sarah')) && (assigneeClean.includes('sarah') || assigneeClean.includes('chen'));
        const isHaines = (currentNameClean.includes('haines') || currentUserId.includes('haines')) && (assigneeClean.includes('haines') || assigneeClean.includes('paulson'));

        const firstWordCurrent = currentNameClean.split(' ')[0];
        const matches = isAlex || isSarah || isHaines ||
          (assigneeClean && (assigneeClean.includes(currentNameClean) || currentNameClean.includes(assigneeClean) || (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent))));

        if (matches) {
          set.add(p);
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

      return assigneeClean && (
             assigneeClean === currentNameClean ||
             assigneeClean.includes(currentNameClean) ||
             currentNameClean.includes(assigneeClean) ||
             (firstWordCurrent.length >= 3 && assigneeClean.includes(firstWordCurrent)) ||
             (firstWordAssignee.length >= 3 && currentNameClean.includes(firstWordAssignee)) ||
             (currentUserId && currentUserId !== 'guest' && (assigneeClean.includes(currentUserId.toLowerCase()) || currentUserId.toLowerCase().includes(firstWordAssignee))));
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

      let projMatch = null;
      try {
        const savedProjs = localStorage.getItem(projectStorageKey);
        if (savedProjs) {
          const parsedProjs = JSON.parse(savedProjs);
          projMatch = parsedProjs.find(p => p.title && p.title.toLowerCase().includes(pName.toLowerCase()));
        }
      } catch (e) {}

      const projStart = projMatch?.postedDate || projMatch?.startDate || projMatch?.created_at || 'Sep 8, 2026';
      const projDuration = projMatch?.duration || '1 Month';
      const computedDeadline = calculateProjectDeadline(projStart, projDuration);

      result.push({
        name: pName,
        clientName: currentUserName || 'Client',
        status: progress === 100 ? 'Completed' : 'Active',
        progress,
        totalTasks,
        doneTasks,
        inProgressTasks,
        pendingTasks,
        deadline: computedDeadline
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
    const firstRealProject = availableProjects.find(p => p !== 'All' && p !== 'All Assigned Projects') || '';
    setNewTaskProject(firstRealProject);
    setNewTaskAssignee(availableFreelancers[0] || 'Haines Jose Paulson');
    setNewTaskBudget('₹1,500');
    setIsSubmittingTask(false);
    setShowAddTaskModal(true);
  };

  const handleSaveNewTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmittingTask) return;

    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) {
      setToast({ message: 'Please enter a task title!', type: 'error' });
      return;
    }

    setIsSubmittingTask(true);

    try {
      let formattedBudget = newTaskBudget.trim();
      if (formattedBudget && !formattedBudget.startsWith('₹') && !formattedBudget.startsWith('$')) {
        const num = parseFloat(formattedBudget.replace(/[^0-9.]/g, ''));
        formattedBudget = isNaN(num) ? '₹1,500' : `₹${num.toLocaleString('en-IN')}`;
      }

      const projectVal = newTaskProject && newTaskProject !== 'All' && newTaskProject !== 'All Assigned Projects'
        ? newTaskProject
        : (availableProjects.find(p => p !== 'All' && p !== 'All Assigned Projects') || '');

      const assignedPerson = newTaskAssignee || (role === 'freelancer' ? (currentUserName || currentUserId) : 'Assigned Freelancer');

      const res = await fetch('http://localhost:8000/api/sprint-tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmedTitle,
          project: projectVal,
          assignee: assignedPerson,
          budget: formattedBudget || '₹1,500',
          client_id: role === 'client' ? currentUserId : undefined,
          freelancer_id: role === 'freelancer' ? currentUserId : undefined,
          creator: currentUserId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create sprint task');
      }

      const createdTask = data.task || {
        id: data.id,
        title: trimmedTitle,
        project: projectVal || 'Enterprise Project',
        projectTitle: projectVal || 'Enterprise Project',
        assignee: assignedPerson,
        status: 'To Do',
        progress: 0,
        budget: formattedBudget || '₹1,500',
        created_at: new Date().toISOString()
      };

      // Add ONLY the single newly created task to state, preserving all existing tasks
      setTasks(prevTasks => {
        const filtered = prevTasks.filter(t => String(t.id).trim() !== String(createdTask.id).trim());
        const updated = [createdTask, ...filtered];
        localStorage.setItem(taskStorageKey, JSON.stringify(updated));
        if (isDemoUser) {
          localStorage.setItem('freematch_shared_tasks', JSON.stringify(updated));
          localStorage.setItem('freematch_kanban_tasks', JSON.stringify(updated));
        }
        return updated;
      });

      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setToast({ message: `Sprint task "${trimmedTitle}" created successfully!`, type: 'success' });

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('freematch_shared_event'));
      window.dispatchEvent(new Event('freematch_kanban_event'));
    } catch (err) {
      console.error('Sprint task POST error:', err);
      setToast({ message: err.message || 'Could not create task', type: 'error' });
    } finally {
      setIsSubmittingTask(false);
    }
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
    if (role === 'freelancer' && !isDemoUser) {
      if (!t.assignee) return false;
      const currentNameClean = (currentUserName || 'freelancer').toLowerCase().trim();
      const assigneeClean = t.assignee.toLowerCase().trim();
      const firstWordCurrent = currentNameClean.split('@')[0].split(' ')[0];
      const firstWordAssignee = assigneeClean.split('@')[0].split(' ')[0];

      const matches =
        assigneeClean === currentNameClean ||
        assigneeClean.includes(currentNameClean) ||
        currentNameClean.includes(assigneeClean) ||
        (firstWordCurrent.length > 2 && assigneeClean.includes(firstWordCurrent)) ||
        (firstWordAssignee.length > 2 && currentNameClean.includes(firstWordAssignee)) ||
        (currentUserId && currentUserId !== 'guest' && (assigneeClean.includes(currentUserId.toLowerCase()) || currentUserId.toLowerCase().includes(firstWordAssignee)));

      if (!matches) return false;
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

    // Fetch project deadline dynamically from stored project metadata or default duration
    let match = null;
    try {
      const savedProjs = localStorage.getItem(projectStorageKey);
      if (savedProjs) {
        const parsed = JSON.parse(savedProjs);
        match = parsed.find(p => p.title && (p.title.toLowerCase().includes((selectedProjectFilter || '').toLowerCase()) || (selectedProjectFilter || '').toLowerCase().includes(p.title.toLowerCase())));
      }
    } catch (e) {}

    const projStart = match?.postedDate || match?.startDate || match?.created_at || 'Sep 8, 2026';
    const projDuration = match?.duration || '1 Month';
    const deadline = calculateProjectDeadline(projStart, projDuration);

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
    const b = task.budget || '₹1,500';
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

      {/* BREADCRUMB */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof onNavigateHome === 'function') onNavigateHome();
          }}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-bold bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100/80">
          Sprint Task Board
        </span>
      </div>

      {/* TOP HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-100 text-[#2563eb] border border-blue-200 shadow-2xs">
                {role === 'client' ? <Kanban className="w-6 h-6 stroke-[2.5]" /> : <Workflow className="w-6 h-6 text-emerald-600 stroke-[2.5]" />}
              </span>
              <span>{role === 'client' ? 'Sprint Task Board' : 'Freelancer Sprint Execution Board'}</span>
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs ${
              role === 'client' 
                ? 'bg-blue-100 text-[#1e40af] border border-blue-300' 
                : 'bg-emerald-100 text-[#065f46] border border-emerald-300'
            }`}>
              {role === 'client' ? 'CLIENT MASTER OVERSIGHT' : 'FREELANCER EXECUTION VIEW'}
            </span>
          </div>
          <p className="text-sm font-semibold text-[#334155] mt-1.5 leading-relaxed">
            {role === 'client' 
              ? 'Monitor day-to-day freelancer progress, audit task milestones, and review submitted deliverables.' 
              : 'Execute assigned sprint tasks, update status milestones, and submit completed work for escrow release.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2.5 bg-white text-[#0f172a] px-4 py-2.5 rounded-2xl border border-slate-300 shadow-xs">
            <span className="text-xs font-extrabold text-[#334155] tracking-wide uppercase">Filter Project:</span>
            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-white text-[#0f172a] font-bold text-sm focus:outline-none cursor-pointer pr-2"
            >
              {availableProjects.map(proj => (
                <option key={proj} value={proj} className="bg-white text-[#0f172a] font-bold">{proj}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearCompletedTasks}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#dc2626] border border-rose-300 rounded-2xl text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs"
          >
            <Trash2 className="w-4 h-4 text-[#dc2626]" />
            <span>Clear Completed</span>
          </button>

          {role === 'client' && (
            <button
              onClick={handleOpenAddTaskModal}
              className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl text-sm font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0 flex items-center space-x-2"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Add Sprint Task</span>
            </button>
          )}
        </div>
      </div>

      {/* COMPACT ROLE-SPECIFIC PROJECT SUMMARY BANNER */}
      {role === 'client' ? (
        /* CLIENT OVERSIGHT BANNER */
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563eb] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  OVERSIGHT SUMMARY
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#334155] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {selectedProjectFilter === 'All' ? 'ALL PROJECTS' : 'SELECTED PROJECT'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-2.5 pt-0.5">
                <FolderKanban className="w-6 h-6 text-[#2563eb]" />
                <span>{projectSummaryData.name}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#334155] pt-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Freelancer:</span>
                  <strong className="text-[#0f172a] font-bold">{projectSummaryData.assigneeStr}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Deadline:</span>
                  <strong className="text-[#2563eb] font-extrabold">{projectSummaryData.deadline}</strong>
                </span>
              </div>
            </div>

            {/* PROGRESS & TASK STATS PILLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Overall Progress Gauge */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-center items-center min-w-[140px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1">OVERALL PROGRESS</span>
                <div className="relative w-16 h-16 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2563eb] transition-all duration-700"
                      strokeDasharray={`${projectSummaryData.progress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-base font-black text-[#0f172a]">{projectSummaryData.progress}%</span>
                </div>
              </div>

              {/* Task Breakdown Chips */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 min-w-[280px]">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#475569] border-b pb-1.5 border-slate-200">
                  <span className="tracking-wider">TASKS OVERVIEW</span>
                  <span className="text-[#0f172a] font-black text-xs">({projectSummaryData.totalCount} Total)</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-extrabold">
                  <div className="p-2 rounded-xl bg-slate-100 text-[#334155] border border-slate-200">
                    <div className="text-base font-black">{projectSummaryData.todoCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">TO-DO</div>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <div className="text-base font-black">{projectSummaryData.inProgressCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-600 mt-0.5">IN PROGRESS</div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <div className="text-base font-black">{projectSummaryData.underReviewCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-600 mt-0.5">UNDER REVIEW</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <div className="text-base font-black">{projectSummaryData.doneCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-600 mt-0.5">DONE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FREELANCER EXECUTION BANNER */
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#065f46] bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  FREELANCER EXECUTION WORKSPACE
                </span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#334155] bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  MY ASSIGNED TASKS
                </span>
              </div>
              <h3 className="text-2xl font-black text-[#0f172a] tracking-tight flex items-center gap-2.5 pt-0.5">
                <ListChecks className="w-6 h-6 text-[#059669]" />
                <span>{projectSummaryData.name}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[#334155] pt-1">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Client:</span>
                  <strong className="text-[#0f172a] font-bold">{projectSummaryData.clientName}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500">Deadline:</span>
                  <strong className="text-[#059669] font-extrabold">{projectSummaryData.deadline}</strong>
                </span>
              </div>
            </div>

            {/* FREELANCER STATS PILLS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Project Progress Gauge */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-center items-center min-w-[140px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1">PROJECT PROGRESS</span>
                <div className="relative w-16 h-16 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#059669] transition-all duration-700"
                      strokeDasharray={`${projectSummaryData.progress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-base font-black text-[#0f172a]">{projectSummaryData.progress}%</span>
                </div>
              </div>

              {/* Freelancer Task Breakdown Chips */}
              <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 min-w-[260px]">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#475569] border-b pb-1.5 border-slate-200">
                  <span className="tracking-wider">MY WORK SUMMARY</span>
                  <span className="text-[#0f172a] font-black text-xs">({projectSummaryData.totalCount} Tasks)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <div className="text-base font-black">{projectSummaryData.doneCount}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5">COMPLETED</div>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <div className="text-base font-black">{projectSummaryData.inProgressCount}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5">IN PROGRESS</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 text-[#334155] border border-slate-200">
                    <div className="text-base font-black">{projectSummaryData.todoCount + projectSummaryData.underReviewCount}</div>
                    <div className="text-[10px] uppercase tracking-wider mt-0.5">PENDING</div>
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
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-emerald-600" />
              <span>MY ASSIGNED PROJECTS</span>
            </h3>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
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
                      ? 'bg-white dark:bg-[#081024] border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-[#060e22] border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug break-words flex-1" title={proj.name}>
                      {proj.name}
                    </h4>
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
                      {proj.progress}%
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
                    <span className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Client: <strong className="text-slate-900 dark:text-white font-bold">{proj.clientName}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{proj.deadline}</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-3.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 uppercase tracking-wider text-xs">
                      TASKS: <strong className="text-slate-900 dark:text-slate-200 font-black">{proj.totalTasks}</strong>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 text-xs">
                        ✓ {proj.doneTasks} Done
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 text-xs">
                        ⚡ {proj.inProgressTasks} In Progress
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
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

      {/* MOBILE COLUMN SELECTOR TABS */}
      <div className="block md:hidden">
        <div className="flex items-center space-x-1 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {['ALL', 'To Do', 'In Progress', 'Under Review', 'Done'].map(colTab => (
            <button
              key={colTab}
              onClick={() => setMobileActiveTab(colTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                mobileActiveTab === colTab
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {colTab === 'ALL' ? 'All Columns' : colTab}
            </button>
          ))}
        </div>
      </div>

      {/* 4 KANBAN COLUMNS (Responsive SaaS Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* 1. TO-DO COLUMN (0%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'To Do') && (
          <div className="p-5 rounded-3xl bg-slate-50/70 dark:bg-[#060e22] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">TO-DO</h3>
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">0%</span>
                </div>
                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold px-3 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'To Do').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'To Do').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#081024] border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No To-Do Tasks</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">All pending work is underway or complete.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'To Do').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className="p-4.5 rounded-2xl bg-white dark:bg-[#081024] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 truncate max-w-[200px] flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{t.project || t.projectTitle || 'Enterprise Project'}</span>
                          </span>
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug break-words">
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-xs font-extrabold text-[#2563eb] dark:text-blue-400">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{t.budget || '₹1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-2 pt-1">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'In Progress', `Started task "${t.title}" (Progress -> 30%)`)} 
                              className="w-full py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start Task (30%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#2563eb] transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="p-2.5 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              ⏳ Pending Freelancer Start (0%)
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                              <button
                                onClick={() => setSelectedTaskDetail(t)}
                                className="text-xs font-bold text-[#2563eb] dark:text-blue-400 hover:underline transition-all cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleRemoveTask(t.id, t.title, t.status)}
                                className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {role === 'client' && (
              <button
                onClick={handleOpenAddTaskModal}
                className="text-xs font-extrabold text-[#2563eb] hover:text-blue-700 flex items-center space-x-1 cursor-pointer pt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        )}

        {/* 2. IN PROGRESS COLUMN (30%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'In Progress') && (
          <div className="p-5 rounded-3xl bg-blue-50/40 dark:bg-[#060e22] border border-blue-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">IN PROGRESS</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black px-2.5 py-0.5 rounded-full border border-blue-500/30">30%</span>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold px-3 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'In Progress').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'In Progress').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#081024] border border-dashed border-blue-200 dark:border-slate-800 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center mx-auto">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No Tasks In Progress</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Start a task from To-Do to begin work.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'In Progress').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className="p-4.5 rounded-2xl bg-white dark:bg-[#081024] border border-blue-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 truncate max-w-[200px] flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{t.project || t.projectTitle || 'Enterprise Project'}</span>
                          </span>
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug break-words">
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-blue-100 dark:border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-xs font-extrabold text-[#2563eb] dark:text-blue-400">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{t.budget || '₹1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-2 pt-1">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'Under Review', `Submitted "${t.title}" for review (Progress -> 60%)`)} 
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Work for Review (60%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span>⚡ Work in Progress</span>
                                <span>30%</span>
                              </div>
                              <div className="w-full bg-blue-200 dark:bg-blue-900 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#2563eb] h-full rounded-full w-[30%]" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-slate-800">
                              <button
                                onClick={() => setSelectedTaskDetail(t)}
                                className="text-xs font-bold text-[#2563eb] dark:text-blue-400 hover:underline transition-all cursor-pointer"
                              >
                                View Details
                              </button>
                              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 cursor-help" title="Started tasks cannot be deleted">
                                🔒 Work Started
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {role === 'client' && (
              <button
                onClick={handleOpenAddTaskModal}
                className="text-xs font-extrabold text-[#2563eb] hover:text-blue-700 flex items-center space-x-1 cursor-pointer pt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        )}

        {/* 3. UNDER REVIEW COLUMN (60%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'Under Review') && (
          <div className="p-5 rounded-3xl bg-amber-50/40 dark:bg-[#060e22] border border-amber-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">UNDER REVIEW</h3>
                  <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black px-2.5 py-0.5 rounded-full border border-amber-500/30">60%</span>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-3 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'Under Review').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'Under Review').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#081024] border border-dashed border-amber-200 dark:border-slate-800 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
                      <Eye className="w-5 h-5" />
                    </div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No Tasks Under Review</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Submitted deliverables will appear here.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'Under Review').map(t => {
                    const priority = getTaskPriority(t);
                    return (
                      <div 
                        key={t.id} 
                        className="p-4.5 rounded-2xl bg-white dark:bg-[#081024] border border-amber-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* CARD TOP BADGES */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 truncate max-w-[200px] flex items-center gap-1">
                            <FolderKanban className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{t.project || t.projectTitle || 'Enterprise Project'}</span>
                          </span>
                          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {priority}
                          </span>
                        </div>

                        {/* TASK TITLE */}
                        <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug break-words">
                          {t.title}
                        </h4>

                        {/* METADATA INFO */}
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-amber-100 dark:border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-xs font-extrabold text-amber-600 dark:text-amber-400">
                              {(t.assignee || 'A').charAt(0).toUpperCase()}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{t.assignee}</span>
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">{t.budget || '₹1,500'}</span>
                        </div>

                        {/* ROLE ACTION BUTTON / OVERSIGHT BADGE */}
                        {role === 'freelancer' ? (
                          <div className="space-y-2 pt-1">
                            <button 
                              onClick={() => updateTaskStatus(t.id, 'Done', `Finalized task "${t.title}" & marked Done (100%)`)} 
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Finalize & Mark Done (100%) →</span>
                            </button>
                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="w-full py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-center cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs font-bold text-center">
                              ⏳ Under Review (60%)<br /><span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Awaiting Completion</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-amber-100 dark:border-slate-800">
                              <button
                                onClick={() => setSelectedTaskDetail(t)}
                                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline transition-all cursor-pointer"
                              >
                                Audit Deliverable
                              </button>
                              <span className="text-[11px] font-medium text-amber-600/80 dark:text-amber-400/80 cursor-help" title="Submitted tasks cannot be deleted">
                                🔒 In Review
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {role === 'client' && (
              <button
                onClick={handleOpenAddTaskModal}
                className="text-xs font-extrabold text-[#2563eb] hover:text-blue-700 flex items-center space-x-1 cursor-pointer pt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        )}

        {/* 4. DONE COLUMN (100%) */}
        {(mobileActiveTab === 'ALL' || mobileActiveTab === 'Done') && (
          <div className="p-5 rounded-3xl bg-emerald-50/40 dark:bg-[#060e22] border border-emerald-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              {/* COLUMN HEADER */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-600 dark:text-emerald-400">DONE</h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30">100%</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-0.5 rounded-full">
                  {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length}
                </span>
              </div>

              {/* TASK CARDS */}
              <div className="space-y-3.5">
                {displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#081024] border border-dashed border-emerald-200 dark:border-slate-800 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No Completed Tasks</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Finalized deliverables will display here.</p>
                  </div>
                ) : (
                  displayTasks.filter(t => t.status === 'Done' || t.status === 'Completed').map(t => (
                    <div 
                      key={t.id} 
                      className="p-4.5 rounded-2xl bg-white dark:bg-[#081024] border border-emerald-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      {/* CARD TOP BADGES */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40 truncate max-w-[200px] flex items-center gap-1">
                          <FolderKanban className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{t.project || t.projectTitle || 'Enterprise Project'}</span>
                        </span>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          COMPLETED
                        </span>
                      </div>

                      {/* TASK TITLE */}
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug break-words">
                        {t.title}
                      </h4>

                      {/* COMPLETED STATUS TEXT */}
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Escrow Released ({t.budget || '₹2,500'}) — 100%</span>
                      </p>

                      {/* CARD FOOTER ACTIONS */}
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-slate-800">
                        <button
                          onClick={() => setSelectedTaskDetail(t)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 cursor-help" title="Completed tasks cannot be deleted">
                          ✓ Completed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {role === 'client' && (
              <button
                onClick={handleOpenAddTaskModal}
                className="text-xs font-extrabold text-[#2563eb] hover:text-blue-700 flex items-center space-x-1 cursor-pointer pt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* BOTTOM INFO CARD */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900/60 border border-blue-100 dark:border-slate-800 flex items-start space-x-3 text-xs font-medium text-slate-700 dark:text-slate-300">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-[#2563eb] dark:text-blue-400 border border-blue-200/60 dark:border-slate-700 shrink-0 mt-0.5">
          <Workflow className="w-4 h-4" />
        </div>
        <div>
          <strong className="text-slate-900 dark:text-white font-extrabold block text-sm mb-0.5">About This Board</strong>
          <span>Tasks flow from To-Do → In Progress → Under Review → Done. Ensure all deliverables are reviewed and marked done to maintain accurate project progress.</span>
        </div>
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
                <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>TASK TITLE</span>
                <h4 className="text-sm font-black mt-0.5">{selectedTaskDetail.title}</h4>
              </div>

              <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>PROJECT</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{selectedTaskDetail.project || selectedTaskDetail.projectTitle || 'Enterprise Project'}</p>
                </div>
                <div>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>STATUS & PROGRESS</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{selectedTaskDetail.status} ({selectedTaskDetail.status === 'Done' ? '100%' : selectedTaskDetail.status === 'Under Review' ? '60%' : selectedTaskDetail.status === 'In Progress' ? '30%' : '0%'})</p>
                </div>
                <div>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>ASSIGNED FREELANCER</span>
                  <p className="font-bold text-slate-900 dark:text-slate-200">{selectedTaskDetail.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>BUDGET / ESCROW</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{selectedTaskDetail.budget || '₹1,500'}</p>
                </div>
              </div>

              <div>
                <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>WORK ITEM DESCRIPTION</span>
                <p className={`p-3 rounded-xl border font-medium leading-relaxed mt-1 ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
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

                {role === 'client' && selectedTaskDetail.status === 'To Do' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveTask(selectedTaskDetail.id, selectedTaskDetail.title, selectedTaskDetail.status);
                      setSelectedTaskDetail(null);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Delete Task</span>
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
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Task Title *</label>
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
                <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Select Project</label>
                <select
                  value={newTaskProject}
                  onChange={(e) => setNewTaskProject(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#060e22] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                >
                  {availableProjects.filter(p => p !== 'All' && p !== 'All Assigned Projects').map((proj, idx) => (
                    <option key={idx} value={proj}>{proj}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Assignee / Freelancer</label>
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
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Task Budget (₹ INR)</label>
                  <input
                    type="text"
                    placeholder="₹1,500"
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
                  disabled={isSubmittingTask}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  {isSubmittingTask ? 'Creating...' : 'Create Task'}
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
