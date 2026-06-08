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
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import toast from 'react-hot-toast';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();


  // === USER SIDEBAR MENU ===
  const userMenuItems: Array<{ name: string; href: string; icon: React.ComponentType<any>; highlight?: boolean }> = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Prediction', href: '/dashboard/predictions', icon: BrainCircuit },
    { name: 'Community Reports', href: '/dashboard/reports', icon: MapPin },
    { name: 'Heatmap', href: '/dashboard/heatmap', icon: MapPin },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const menuTitle = 'MAIN SAFETY MENU';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 border-r border-slate-200 backdrop-blur-md p-6 shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white border border-slate-100">
          <Image src="/logo.png" alt="Lifeline AI Logo" width={36} height={36} className="object-contain" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">LifeLine</span>
          <span className="text-xs block font-mono font-semibold tracking-wider text-cyan-600">
            PREDICTIVE AI
          </span>
        </div>
      </div>

      {/* Profile summary card */}
      <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6">
        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-semibold border border-slate-200">
          {user?.avatar ? (
            <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt={user?.name} className="h-full w-full object-cover rounded-lg" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
          <span className="text-[10px] font-mono border px-2 py-0.5 rounded-full uppercase text-cyan-700 bg-cyan-50 border-cyan-200/50">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-3 mb-3">{menuTitle}</p>
        
        {userMenuItems.map((item) => {
          const Icon = item.icon;
          // Simple active check
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
                    : 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm shadow-cyan-500/5'
                  : item.highlight
                    ? 'text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                  isActive 
                    ? (item.highlight ? 'text-red-600' : 'text-cyan-600') 
                    : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.name === 'Dashboard' && unreadCount > 0 && (
                <span className="h-5 min-w-5 px-1.5 flex items-center justify-center text-[10px] font-bold bg-cyan-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
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
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        {SidebarContent()}
      </div>

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
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
