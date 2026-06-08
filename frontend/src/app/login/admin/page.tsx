'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToAdminLogin() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
        <span className="absolute text-[10px] font-mono text-cyan-600 font-bold uppercase tracking-wider animate-pulse">L</span>
      </div>
    </div>
  );
}
