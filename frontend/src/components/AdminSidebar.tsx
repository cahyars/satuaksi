'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  BrainCircuit, 
  AlertOctagon, 
  BarChart3, 
  Settings, 
  Users, 
  LogOut, 
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const adminMenuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: MapPin },
    { name: 'Emergency Center', href: '/admin/emergency', icon: AlertOctagon, highlight: true },
    { name: 'AI Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Heatmap', href: '/admin/heatmap', icon: MapPin },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'AI Monitoring', href: '/admin/ai', icon: BrainCircuit },
    { name: 'Logs', href: '/admin/logs', icon: LayoutDashboard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 border-r border-slate-200 backdrop-blur-xl p-6 shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white border border-slate-100">
          <Image src="/logo.png" alt="Lifeline AI Logo" width={36} height={36} className="object-contain" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">LifeLine</span>
          <span className="text-xs block font-mono font-semibold tracking-wider text-purple-650">
            ADMIN SYSTEM
          </span>
        </div>
      </div>

      {/* Profile summary card */}
      <div className="flex items-center space-x-3 p-3 bg-purple-50/50 border border-purple-100 rounded-xl mb-6">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-semibold border border-purple-200/40">
          {user?.avatar ? (
            <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt={user?.name} className="h-full w-full object-cover rounded-lg" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
          <span className="text-[10px] font-mono border px-2 py-0.5 rounded-full uppercase text-purple-650 bg-purple-50 border-purple-200/50">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-3 mb-3">ADMIN COMMAND CENTER</p>
        
        {adminMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group duration-300 mb-1 ${
                isActive
                  ? item.highlight 
                    ? 'bg-red-50 text-red-650 border border-red-200'
                    : 'bg-purple-50 text-purple-650 border border-purple-200 shadow-sm'
                  : item.highlight
                    ? 'text-red-500 hover:bg-red-50 hover:text-red-650 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  isActive 
                    ? (item.highlight ? 'text-red-600' : 'text-purple-600') 
                    : 'text-slate-400 group-hover:text-slate-650'
                }`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-550" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        {SidebarContent()}
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-72 max-w-[85vw] h-full"
            >
              {SidebarContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
