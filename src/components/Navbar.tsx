import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import {
  ShoppingBag,
  Menu,
  X,
  User as UserIcon,
  GraduationCap,
  Lock,
  Bell,
  CheckCheck,
  ArrowRight
} from 'lucide-react';
import { User } from '../data/db';

export type NavPage =
  | 'home'
  | 'about'
  | 'courses'
  | 'quick-learning'
  | 'teachers'
  | 'team'
  | 'contact'
  | 'student-login'
  | 'collabs'
  | 'cart'
  | 'teacher-portal'
  | 'admin-panel'
  | 'checkout';

export interface PlatformNotification {
  id: string;
  title: string;
  meta: string;
  targetPage: NavPage;
  isUrgent?: boolean;
}

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  cartCount: number;
  currentUser: User | null;
  isVerifiedTeacher: boolean;
  pendingTeacherRequestsCount?: number;
  notifications?: PlatformNotification[];
  readNotificationIds?: string[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  currentUser,
  isVerifiedTeacher,
  pendingTeacherRequestsCount = 0,
  notifications = [],
  readNotificationIds = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const navItems: { id: NavPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'courses', label: 'Courses' },
    { id: 'quick-learning', label: 'Quick Learning' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'team', label: 'Our Team' },
    { id: 'contact', label: 'Contact' },
    { id: 'collabs', label: 'Collabs' },
    {
      id: 'student-login',
      label:
        currentUser && (currentUser.role === 'student' || currentUser.role === 'teacher')
          ? 'Dashboard'
          : 'Student Login'
    }
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top minimal notification & portal utility bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 text-[11px] text-zinc-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono-numbers font-medium text-white shrink-0">END-TERM SOS 2026</span>
            <span className="hidden sm:inline text-zinc-600">/</span>
            <span className="hidden sm:inline truncate">Daily Campus News &amp; Fresh Course Releases Live</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Teachers Portal ONLY visible to verified teacher emails (and admin) */}
            {isVerifiedTeacher && (
              <button
                type="button"
                onClick={() => handleNavClick('teacher-portal')}
                className={`font-bold transition-colors flex items-center gap-1.5 px-2 py-1 border ${
                  currentPage === 'teacher-portal'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-white border-white/60 hover:bg-white hover:text-black'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teachers Portal</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick('admin-panel')}
              className="text-zinc-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5 underline decoration-zinc-600 underline-offset-4 py-1"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span className="hidden xs:inline sm:inline">Admin Panel (Passkey)</span>
              <span className="sm:hidden">Admin</span>
              {currentUser?.role === 'admin' && pendingTeacherRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-black font-mono-numbers text-[10px] font-black no-underline">
                  {pendingTeacherRequestsCount}
                </span>
              )}
            </button>

            {currentUser && (
              <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                <span className="text-zinc-300 truncate max-w-[110px] sm:max-w-[140px]">
                  {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-zinc-400 hover:text-white transition-colors underline"
                >
                  (Exit)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Brand Logo Zone */}
          <BrandLogo variant="navbar" onClick={() => handleNavClick('home')} />

          {/* Desktop Navigation Links - 9 Items */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-xs uppercase tracking-wider font-semibold py-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
              );
            })}
          </nav>

          {/* Compact links for medium screens (lg: 1024 - 1280px) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-3" aria-label="Compact navigation">
            {navItems.slice(0, 6).map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative text-xs uppercase tracking-wider font-semibold py-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
              );
            })}
          </nav>

          {/* Right Action Zone: Notifications + Cart + CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications Bell Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Toggle Notifications"
                aria-expanded={notifOpen}
                className={`relative min-w-[44px] min-h-[44px] p-2.5 border-2 border-white transition-colors flex items-center justify-center ${
                  notifOpen ? 'bg-white text-black' : 'bg-black text-white hover:bg-zinc-900'
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black font-mono-numbers text-[10px] font-black w-5 h-5 flex items-center justify-center border-2 border-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 left-3 sm:left-auto top-[104px] sm:top-full sm:mt-2 w-auto sm:w-80 bg-zinc-950 border-4 border-white shadow-[8px_8px_0px_0px_#ffffff] z-50 text-white">
                  <div className="p-3 bg-black border-b-2 border-white flex items-center justify-between gap-2">
                    <span className="text-xs font-mono-numbers font-black uppercase tracking-wider">
                      Tribe Alerts ({unreadCount} Unread)
                    </span>
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-[10px] font-mono-numbers uppercase text-zinc-300 hover:text-white flex items-center gap-1 underline py-1 px-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs font-mono-numbers text-zinc-500">
                        You are all caught up. No new bulletins or live updates.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isRead = readNotificationIds.includes(notif.id);
                        return (
                          <button
                            key={notif.id}
                            type="button"
                            onClick={() => {
                              onMarkNotificationRead?.(notif.id);
                              handleNavClick(notif.targetPage);
                            }}
                            className={`w-full text-left p-3.5 hover:bg-zinc-900 transition-colors flex items-start justify-between gap-2 ${
                              isRead ? 'opacity-65' : 'bg-black'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                {!isRead && <span className="w-2 h-2 bg-white shrink-0" />}
                                {notif.isUrgent && (
                                  <span className="text-[9px] font-mono-numbers font-black px-1 py-0.2 bg-red-600 text-white uppercase">
                                    LIVE
                                  </span>
                                )}
                                <span className="text-[10px] font-mono-numbers text-zinc-400 uppercase truncate">
                                  {notif.meta}
                                </span>
                              </div>
                              <div className="text-xs font-heading font-bold text-white mt-1 line-clamp-2">
                                {notif.title}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-1" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button with Count Badge */}
            <button
              type="button"
              onClick={() => handleNavClick('cart')}
              className={`relative min-w-[44px] min-h-[44px] p-2.5 border-2 border-white transition-all duration-150 flex items-center justify-center ${
                currentPage === 'cart' ? 'bg-white text-black' : 'bg-black text-white hover:bg-zinc-900'
              }`}
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black font-mono-numbers text-[11px] font-black w-5 h-5 flex items-center justify-center border-2 border-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Quick Login / Dashboard CTA for Desktop */}
            <button
              type="button"
              onClick={() => handleNavClick('student-login')}
              className="hidden sm:flex min-h-[44px] items-center gap-2 px-4 py-2 border-2 border-white bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-150 shadow-[2px_2px_0px_0px_#ffffff]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>
                {currentUser && (currentUser.role === 'student' || currentUser.role === 'teacher')
                  ? 'My Dashboard'
                  : 'Join Tribe'}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden min-w-[44px] min-h-[44px] p-2 text-white border-2 border-white hover:bg-zinc-900 transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-black border-t-2 border-white px-4 py-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-2.5">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`min-h-[44px] text-left text-sm font-bold uppercase tracking-widest px-4 py-3 border border-zinc-800 transition-colors ${
                      isActive ? 'bg-white text-black font-black' : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {isVerifiedTeacher && (
                <button
                  type="button"
                  onClick={() => handleNavClick('teacher-portal')}
                  className={`min-h-[44px] text-left text-sm font-bold uppercase tracking-widest px-4 py-3 border-2 flex items-center justify-between ${
                    currentPage === 'teacher-portal'
                      ? 'bg-white text-black border-white font-black'
                      : 'border-white bg-zinc-900 text-white'
                  }`}
                >
                  <span>Teachers Portal</span>
                  <GraduationCap className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleNavClick('admin-panel')}
                className="min-h-[44px] text-left text-sm font-bold uppercase tracking-widest px-4 py-3 border border-zinc-700 bg-zinc-900 text-zinc-200 flex items-center justify-between"
              >
                <span>Admin Panel (Passkey)</span>
                <Lock className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
