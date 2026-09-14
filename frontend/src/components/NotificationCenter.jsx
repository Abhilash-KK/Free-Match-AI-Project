import React, { useState, useEffect } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  formatRelativeTime
} from '../utils/notificationService';
import { 
  Send, 
  UserCheck, 
  XCircle, 
  Flag, 
  CreditCard, 
  FolderKanban, 
  ListChecks, 
  MessageCircle, 
  Bell, 
  BellOff, 
  CheckCircle2,
  ShieldCheck,
  Trash2,
  LayoutGrid,
  Folder,
  Coins,
  FileText,
  MoreVertical,
  Check,
  Home,
  ChevronRight
} from 'lucide-react';

const NotificationCenter = ({ userSession, onNavigateTab, onNavigateHome }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'Unread' | 'Proposals' | 'Projects' | 'Milestones' | 'Payments' | 'Messages' | 'Tasks'
  const [loading, setLoading] = useState(true);

  const currentUser = (userSession?.user_id || userSession?.username || userSession?.email || userSession?.id || '').toString().trim();

  const loadNotifs = async () => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchNotifications(currentUser);
    setNotifications(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifs();

    const handleEvent = () => {
      loadNotifs();
    };

    window.addEventListener('freematch_notification_event', handleEvent);
    return () => window.removeEventListener('freematch_notification_event', handleEvent);
  }, [currentUser]);

  const handleMarkRead = async (id, isRead) => {
    if (!isRead) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await markNotificationRead(id);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllNotificationsRead(currentUser);
  };

  const handleDeleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await clearAllNotifications(currentUser);
  };

  const getFilteredNotifications = () => {
    return notifications.filter(n => {
      if (filter === 'Unread') return !n.is_read;
      if (filter === 'Proposals') return n.type === 'proposal' || n.type === 'hired' || n.type === 'rejected' || n.type === 'contract';
      if (filter === 'Projects') return n.type === 'project' || n.type === 'contract';
      if (filter === 'Milestones') return n.type === 'milestone';
      if (filter === 'Payments') return n.type === 'payment';
      if (filter === 'Messages') return n.type === 'message';
      if (filter === 'Tasks') return n.type === 'task';
      return true;
    });
  };

  const filteredList = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getCategoryBadgeStyle = (type) => {
    switch (type) {
      case 'proposal':
        return { icon: Send, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', badgeBg: 'bg-purple-100/90 text-purple-700 border-purple-200', label: 'Proposal' };
      case 'hired':
        return { icon: FileText, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', badgeBg: 'bg-emerald-100/90 text-emerald-700 border-emerald-200', label: 'Hired' };
      case 'contract':
        return { icon: ShieldCheck, bg: 'bg-blue-50', text: 'text-[#2563eb]', border: 'border-blue-100', badgeBg: 'bg-blue-100/90 text-blue-700 border-blue-200', label: 'Contract' };
      case 'rejected':
        return { icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', badgeBg: 'bg-rose-100/90 text-rose-700 border-rose-200', label: 'Declined' };
      case 'milestone':
        return { icon: Flag, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', badgeBg: 'bg-amber-100/90 text-amber-700 border-amber-200', label: 'Milestone' };
      case 'payment':
        return { icon: Coins, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', badgeBg: 'bg-rose-100/90 text-rose-700 border-rose-200', label: 'Payment' };
      case 'project':
        return { icon: FolderKanban, bg: 'bg-blue-50', text: 'text-[#2563eb]', border: 'border-blue-100', badgeBg: 'bg-blue-100/90 text-blue-700 border-blue-200', label: 'Project' };
      case 'task':
        return { icon: CheckCircle2, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', badgeBg: 'bg-amber-100/90 text-amber-700 border-amber-200', label: 'Task' };
      case 'message':
        return { icon: MessageCircle, bg: 'bg-blue-50', text: 'text-[#2563eb]', border: 'border-blue-100', badgeBg: 'bg-blue-100/90 text-blue-700 border-blue-200', label: 'Message' };
      default:
        return { icon: Bell, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', badgeBg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Notification' };
    }
  };

  const getFilterIcon = (tab) => {
    switch (tab) {
      case 'All': return LayoutGrid;
      case 'Unread': return Bell;
      case 'Proposals': return Send;
      case 'Projects': return Folder;
      case 'Milestones': return Flag;
      case 'Payments': return CreditCard;
      case 'Messages': return MessageCircle;
      case 'Tasks': return CheckCircle2;
      default: return LayoutGrid;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* BREADCRUMB */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof onNavigateHome === 'function') onNavigateHome();
            if (typeof onNavigateTab === 'function') onNavigateTab('workspace');
          }}
          className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-bold bg-blue-50/80 px-2.5 py-0.5 rounded-lg border border-blue-100/80">
          Notifications
        </span>
      </div>

      {/* PAGE HEADER ROW WITH BANNER CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50/90 border border-blue-100 text-[#2563eb] flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-7 h-7 text-[#2563eb]" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                Activity Notifications & Log
              </h2>
              {unreadCount > 0 && (
                <span className="px-3 py-0.5 bg-[#2563eb] text-white rounded-full text-xs font-black shadow-2xs">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-[#334155] mt-1">
              Real-time event feed for proposals, milestone reviews, escrow payments, and sprint tasks.
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 shrink-0 self-end lg:self-center">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200/80 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer flex items-center space-x-1.5"
            title="Clear all activity logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center space-x-2 overflow-x-auto">
        {['All', 'Unread', 'Proposals', 'Projects', 'Milestones', 'Payments', 'Messages', 'Tasks'].map(tab => {
          const TabIcon = getFilterIcon(tab);
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-[#2563eb] text-white shadow-xs'
                  : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab}</span>
              {tab === 'Unread' && unreadCount > 0 && (
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-rose-500'} inline-block`}></span>
              )}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="inline-block w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-600 mt-3 font-extrabold">Loading real-time activity log...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200/90 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto border border-blue-100">
              <BellOff className="w-7 h-7 text-[#2563eb]" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">No Notifications Found</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto font-semibold">
              There are no activity logs matching the selected <span className="font-black text-slate-900">"{filter}"</span> filter.
            </p>
          </div>
        ) : (
          filteredList.map(item => {
            const badge = getCategoryBadgeStyle(item.type);
            const IconComp = badge.icon;
            const relativeTime = formatRelativeTime(item.created_at);

            return (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id, item.is_read)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 shadow-2xs hover:shadow-xs ${
                  item.is_read
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-blue-50/40 border-blue-200/90 border-l-4 border-l-[#2563eb] hover:border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  {/* Category Event Icon Badge */}
                  <div className={`w-11 h-11 rounded-2xl ${badge.bg} ${badge.text} border ${badge.border} flex items-center justify-center shrink-0 shadow-2xs`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <h4 className="font-extrabold text-sm text-[#0f172a] leading-snug">
                        {item.title}
                      </h4>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badge.badgeBg}`}>
                        {badge.label}
                      </span>

                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0 animate-pulse" title="Unread"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {item.message}
                    </p>

                    {/* Metadata Sub-Card */}
                    {(item.project_name || item.related_user_name || item.amount || item.amount_str || item.task_name) && (
                      <div className="p-2 px-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center space-x-4 text-xs font-semibold text-slate-700 flex-wrap gap-y-1 mt-2">
                        {item.project_name && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500 font-bold">Project:</span>
                            <strong className="text-slate-900 font-extrabold">{item.project_name}</strong>
                          </span>
                        )}
                        {item.related_user_name && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500 font-bold">User:</span>
                            <strong className="text-slate-900 font-extrabold">{item.related_user_name}</strong>
                          </span>
                        )}
                        {(item.amount || item.amount_str) && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500 font-bold">Amount:</span>
                            <strong className="text-emerald-700 font-black">{item.amount_str || ('₹' + item.amount)}</strong>
                          </span>
                        )}
                        {item.task_name && (
                          <span className="flex items-center space-x-1">
                            <span className="text-slate-500 font-bold">Task:</span>
                            <strong className="text-slate-900 font-extrabold">{item.task_name}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Metadata & Delete Action */}
                <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                  <span className="text-xs font-semibold text-slate-400 block whitespace-nowrap">
                    {relativeTime}
                  </span>
                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer mt-2"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
