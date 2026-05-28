import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiHome, HiCode, HiCollection, HiClipboardList,
  HiCog, HiSun, HiMoon, HiLogout, HiMenuAlt2, HiStar, HiShieldCheck,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { to: '/problems', icon: HiCode, label: 'Problems' },
  { to: '/leaderboard', icon: HiStar, label: 'Leaderboard' },
  { to: '/assignments', icon: HiClipboardList, label: 'Assignments' },
  { to: '/tests', icon: HiCollection, label: 'Tests' },
];

const adminItems = [
  { to: '/admin', icon: HiShieldCheck, label: 'Admin Panel' },
  { to: '/admin/problems', icon: HiCode, label: 'Manage Problems' },
  { to: '/admin/users', icon: HiCog, label: 'Manage Users' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { dark, toggle } = useTheme();
  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
            : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-dark-100'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-dark-200 dark:border-dark-700`}>
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            CodeBeast
          </span>
        )}
        {collapsed && <span className="text-xl font-bold text-primary-500">CB</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost p-1.5 hidden lg:flex">
          <HiMenuAlt2 className="w-5 h-5" />
        </button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-dark-200 dark:border-dark-700">
          <p className="text-sm font-semibold text-dark-900 dark:text-dark-100 truncate">{user.name}</p>
          <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{user.email}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {isAdmin && (
          <>
            <div className={`pt-4 pb-1 ${collapsed ? 'border-t border-dark-200 dark:border-dark-700 mt-2' : ''}`}>
              {!collapsed && <p className="px-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-2">Admin</p>}
            </div>
            {adminItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom actions */}
      <div className={`p-3 border-t border-dark-200 dark:border-dark-700 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <button onClick={toggle} className={`btn-ghost w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
          {dark ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={logout} className={`btn-ghost w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <HiLogout className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-3 left-3 z-50 btn-ghost p-2 bg-white dark:bg-dark-800 shadow-md rounded-lg">
        <HiMenuAlt2 className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-64 h-full bg-white dark:bg-dark-900 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen z-30 bg-white dark:bg-dark-900 border-r border-dark-200 dark:border-dark-700 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;