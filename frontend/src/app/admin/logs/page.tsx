'use client';

import React from 'react';
import { Activity, ShieldAlert, Key, UserCheck } from 'lucide-react';

export default function AdminLogsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <span className="text-[10px] font-mono font-bold text-purple-650 uppercase tracking-widest block">SECURITY AUDIT</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Logs & Security</h1>
        <p className="text-xs text-slate-600 mt-0.5">Pantau aktivitas login, modifikasi data, dan potensi aktivitas mencurigakan.</p>
      </div>

      <div className="glass-panel border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-purple-650" />
          <span>System Activity Logs</span>
        </h3>
        
        <div className="space-y-3">
          {[
            { id: 1, action: 'Admin Login Successful', user: 'future', ip: '192.168.1.1', time: 'Just now', type: 'AUTH', icon: Key },
            { id: 2, action: 'Report #891 Approved', user: 'future', ip: '192.168.1.1', time: '2 mins ago', type: 'MODERATION', icon: UserCheck },
            { id: 3, action: 'Suspicious Login Attempt Blocked', user: 'Unknown', ip: '45.22.11.90', time: '1 hour ago', type: 'SECURITY', icon: ShieldAlert },
          ].map(log => (
            <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${log.type === 'SECURITY' ? 'bg-red-50 text-red-650 border border-red-200' : 'bg-purple-50 text-purple-650 border border-purple-200'}`}>
                  <log.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{log.action}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">User: {log.user} | IP: {log.ip}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-600">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
