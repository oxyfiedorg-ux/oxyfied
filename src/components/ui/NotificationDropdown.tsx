import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, AlertCircle, BookOpen, GraduationCap, 
  FileText, Trash2, Check, X, ExternalLink, Loader2, Sparkles 
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { AppNotification } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onUnreadChange
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');

  const fetchNotifications = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      if (onUnreadChange) onUnreadChange(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    // Periodic check every 45s
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Re-fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (onUnreadChange) onUnreadChange(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onUnreadChange) onUnreadChange(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (onUnreadChange) onUnreadChange(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      if (onUnreadChange) onUnreadChange(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  // Format relative timestamp helper
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Render Icon according to notification category type
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
        );
      case 'submission':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case 'course':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  // Filter list
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'alerts') return n.type === 'warning' || n.type === 'submission';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-[#12100e] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col text-left animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-stone-850 bg-stone-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="font-display font-extrabold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-bold text-amber-500 hover:text-amber-400 transition-colors"
              title="Mark all as read"
            >
              Mark read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-white rounded-lg hover:bg-stone-900 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2 border-b border-stone-850/60 bg-stone-950/40 flex items-center gap-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
            filter === 'all'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
            filter === 'unread'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
            filter === 'alerts'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          Priority
        </button>
      </div>

      {/* Notifications Scroll List */}
      <div className="overflow-y-auto max-h-[380px] divide-y divide-stone-850/50">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
            <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">Syncing notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 text-stone-500 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-stone-300">No notifications to show</p>
            <p className="text-[10px] text-stone-550 max-w-[200px] mx-auto">
              You're all caught up! Updates regarding your courses, deliverables, and activity will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                item.isRead ? 'bg-stone-950/20 hover:bg-stone-900/60' : 'bg-stone-900/40 hover:bg-stone-900/90'
              }`}
            >
              {/* Unread indicator bar */}
              {!item.isRead && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-amber-500 rounded-r" />
              )}

              {/* Type Icon */}
              {renderTypeIcon(item.type)}

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold truncate ${item.isRead ? 'text-stone-300' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[9px] text-stone-500 font-mono whitespace-nowrap">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 mt-1.5 group-hover:text-amber-400">
                    Open details <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Quick action buttons on hover */}
              <div className="absolute right-3 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!item.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(item.id, e)}
                    className="p-1 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-850"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteNotification(item.id, e)}
                  className="p-1 text-stone-400 hover:text-red-400 rounded hover:bg-stone-850"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-2.5 border-t border-stone-850 bg-stone-950/80 flex items-center justify-between text-[10px] text-stone-500">
          <span>{notifications.length} total alerts</span>
          <button
            onClick={handleClearAll}
            className="font-bold text-stone-400 hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
