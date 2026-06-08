import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';
import { useReportStore } from '@/store/useReportStore';
import { useEmergencyStore } from '@/store/useEmergencyStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { startContinuousTracking, stopContinuousTracking } from '@/utils/gps';
import toast from 'react-hot-toast';

let socket: Socket | null = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addRealtimeReport, updateRealtimeReport } = useReportStore();
  const { addRealtimeAlert, updateRealtimeAlert } = useEmergencyStore();
  const { addRealtimeNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
    
    if (!socket) {
      socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('📡 Socket connected to', socketUrl);
        
        // Join user room
        socket?.emit('join-user', user.id);
        
        // Join role room if admin
        if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
          socket?.emit('join-role', user.role);
        }
      });

      socket.on('new-report', (report) => {
        addRealtimeReport(report);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <span className="inline-block h-10 w-10 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">🚨</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-slate-100">Laporan Bahaya Baru</p>
                  <p className="mt-1 text-xs text-slate-400">{report.title}</p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 4000 });
      });

      socket.on('report-updated', (report) => {
        updateRealtimeReport(report);
      });

      socket.on('emergency-alert', (alert) => {
        addRealtimeAlert(alert);
        if (user.role === 'ADMIN') {
          toast.error(`⚠️ SOS AKTIF: ${alert.user?.name} membutuhkan bantuan segera!`, {
            duration: 10000,
            position: 'top-center',
          });
        }
      });

      socket.on('emergency-updated', (alert) => {
        updateRealtimeAlert(alert);
      });

      socket.on('notification', (notif) => {
        addRealtimeNotification(notif);
        toast.success(notif.title, { description: notif.message } as any);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });
    }

    return () => {
      // Keep socket alive during navigation, only clean up on logout
    };
  }, [user, isAuthenticated]);

  // ─── Continuous GPS tracking during active SOS ───
  const { isSosTriggered, activeSosId } = useEmergencyStore();
  const trackingCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isSosTriggered && activeSosId && socket && user) {
      console.log('📍 Starting continuous GPS tracking for active SOS:', activeSosId);

      const cleanup = startContinuousTracking(
        (location) => {
          // Emit real-time location to server for emergency tracking
          socket?.emit('update-location', {
            userId: user.id,
            alertId: activeSosId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            altitude: location.altitude,
            speed: location.speed,
            heading: location.heading,
            timestamp: location.timestamp
          });

          console.log(
            `📍 Live GPS: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} ` +
            `(±${location.accuracy.toFixed(0)}m)`
          );
        },
        (error) => {
          console.warn('📍 Continuous tracking error during SOS:', error.message);
        }
      );

      trackingCleanupRef.current = cleanup;

      return () => {
        console.log('📍 Stopping continuous GPS tracking (SOS resolved/component unmount)');
        cleanup();
        trackingCleanupRef.current = null;
      };
    } else {
      // SOS not active — stop tracking if running
      if (trackingCleanupRef.current) {
        console.log('📍 Stopping continuous GPS tracking (SOS deactivated)');
        trackingCleanupRef.current();
        trackingCleanupRef.current = null;
      }
    }
  }, [isSosTriggered, activeSosId, user]);

  const emitLocation = (latitude: number, longitude: number) => {
    if (socket && user) {
      socket.emit('update-location', {
        userId: user.id,
        latitude,
        longitude
      });
    }
  };

  return { socket, emitLocation };
};
