import React, { useState, useEffect } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
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
  CheckCircle2 
} from 'lucide-react';

const NotificationCenter = ({ userSession, onNavigateTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'Unread' | 'Proposals' | 'Projects' | 'Milestones' | 'Payments' | 'Messages' | 'Tasks'
  const [loading, setLoading] = useState(true);

  const currentUser = userSession?.user_id || userSession?.name || 'client';

  const loadNotifs = async () => {
    setLoading(true);
    const data = await fetchNotifications(currentUser);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifs();

    const handleEvent = (e) => {
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

  const getFilteredNotifications = () => {
    return notifications.filter(n => {
      if (filter === 'Unread') return !n.is_read;
      if (filter === 'Proposals') return n.type === 'proposal' || n.type === 'hired' || n.type === 'rejected';
      if (filter === 'Projects') return n.type === 'project';
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
        return { icon: Send, bg: 'bg-purple-100/80', text: 'text-purple-700', border: 'border-purple-200', label: 'Proposal' };
      case 'hired':
        return { icon: UserCheck, bg: 'bg-emerald-100/80', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Hired' };
      case 'rejected':
        return { icon: XCircle, bg: 'bg-rose-100/80', text: 'text-rose-700', border: 'border-rose-200', label: 'Declined' };
      case 'milestone':
        return { icon: Flag, bg: 'bg-amber-100/80', text: 'text-amber-700', border: 'border-amber-200', label: 'Milestone' };
      case 'payment':
        return { icon: CreditCard, bg: 'bg-emerald-100/80', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Escrow' };
      case 'project':
        return { icon: FolderKanban, bg: 'bg-blue-100/80', text: 'text-blue-700', border: 'border-blue-200', label: 'Project' };
      case 'task':
        return { icon: ListChecks, bg: 'bg-sky-100/80', text: 'text-sky-700', border: 'border-sky-200', label: 'Sprint Task' };
      case 'message':
        return { icon: MessageCircle, bg: 'bg-indigo-100/80', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Message' };
      default:
        return { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Notification' };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="w-7 h-7 text-blue-600" />
              <span>Activity Notifications & Log</span>
            </h2>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-xs">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal mt-1">
            Real-time event feed for proposals, milestone reviews, escrow payments, and sprint tasks.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563eb] border border-blue-200 rounded-xl text-sm font-bold transition-all shadow-2xs cursor-pointer shrink-0 flex items-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 flex-wrap gap-y-2 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
        {['All', 'Unread', 'Proposals', 'Projects', 'Milestones', 'Payments', 'Messages', 'Tasks'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-[#2563eb] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} {tab === 'Unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 font-semibold">Loading real-time notifications...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto border border-blue-100">
              <BellOff className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">No Notifications Found</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto">
              There are no notifications matching the selected <span className="font-bold text-slate-700">"{filter}"</span> filter.
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
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  item.is_read
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-blue-50/40 border-blue-200/80 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Category Event Icon */}
                  <div className={`w-11 h-11 rounded-2xl ${badge.bg} ${badge.text} border ${badge.border} flex items-center justify-center shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${badge.bg} ${badge.text} border ${badge.border}`}>
                        {badge.label}
                      </span>

                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" title="Unread"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    {(item.project_name || item.related_user_name) && (
                      <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
                        {item.project_name && (
                          <span>Project: <strong className="text-slate-700">{item.project_name}</strong></span>
                        )}
                        {item.related_user_name && (
                          <span>User: <strong className="text-slate-700">{item.related_user_name}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block whitespace-nowrap">
                    {relativeTime}
                  </span>
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
