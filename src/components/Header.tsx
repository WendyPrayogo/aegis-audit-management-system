import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  ShieldCheck, 
  Bell, 
  UserCheck, 
  Plus, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  LogOut,
  BookOpen
} from 'lucide-react';
import { UserProfile } from '../types/audit';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateFinding: () => void;
  onOpenRbacGuide: () => void;
  onOpenReadme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateFinding,
  onOpenRbacGuide,
  onOpenReadme
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    inAppNotifications, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToSampleData,
    logout
  } = useAudit();
  
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = inAppNotifications.filter(n => !n.read);

  const navLinks = [
    { id: 'dashboard', label: 'Analytics' },
    { id: 'kanban', label: 'Workflow Kanban' },
    { id: 'audits', label: 'Audits & Controls' },
    { id: 'findings', label: 'Findings & CAPA' },
    { id: 'standards', label: 'Standards & Depts' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'Users' },
    { id: 'roles', label: 'Roles & RBAC' },
    { id: 'emails', label: 'Email Dispatcher' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="text-left font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            AegisAudit
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive 
                    ? 'text-slate-900 font-semibold' 
                    : 'hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & RBAC Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Docs & Screenshots Guide Button */}
          {onOpenReadme && (
            <button
              onClick={onOpenReadme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors shadow-2xs"
              title="View README Documentation & Screenshots"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Docs &amp; Screenshots</span>
            </button>
          )}

          {/* In-app Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Stakeholder Notifications"
              aria-label="Stakeholder Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Notifications ({unreadNotifications.length} unread)
                  </span>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {inAppNotifications.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">No notifications</div>
                  ) : (
                    inAppNotifications.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markNotificationAsRead(item.id);
                          if (item.linkFindingId) {
                            setActiveTab('findings');
                          } else if (item.linkAuditId) {
                            setActiveTab('kanban');
                          }
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          !item.read ? 'bg-slate-50/70' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                          {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                          {item.type !== 'alert' && item.type !== 'success' && (
                            <Bell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{item.message}</p>
                            <span className="text-[11px] text-slate-400 font-mono mt-1 block tabular-nums">
                              {item.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('emails');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View All Dispatched Emails & Logs →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 bg-white transition-colors text-left"
              title="Switch RBAC Persona"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold font-mono">
                {currentUser.initials}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{currentUser.roleLabel.split('&')[0]}</p>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Persona Switcher Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Role-Based Access (RBAC)
                  </span>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenRbacGuide();
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Guide
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {users.map((u: UserProfile) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full p-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-indigo-50/60' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                          {u.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                            {isSelected && (
                              <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">{u.roleLabel}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.department}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <button
                    onClick={resetToSampleData}
                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    title="Reset sample database to default state"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button (Single Primary Action) */}
          <button
            onClick={onOpenCreateFinding}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Finding</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs">
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === link.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
