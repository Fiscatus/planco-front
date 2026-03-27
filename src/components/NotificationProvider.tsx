import { Alert, Box } from '@mui/material';
import { createContext, type ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationToast } from '@/components/NotificationToast';
import { apiErrorEmitter } from '@/services/apiErrorEmitter';
import { api } from '@/services';
import { playNotificationSound } from '@/hooks/useNotificationPrefs';
import type { AppNotification } from '@/globals/types';
import { getNotificationLink } from '@/utils/notificationLink';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type SystemToast = { id: string; message: string; type: NotificationType; exiting: boolean };
type AppToast    = { id: string; notification: AppNotification; exiting: boolean };

type NotificationContextType = {
  showNotification: (message: string, type: NotificationType) => void;
  showAppNotification: (notification: AppNotification) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DURATION = 5000;
const MAX = 3;

const BG: Record<NotificationType, string> = {
  success: 'rgba(76, 175, 80, 0.95)',
  error:   'rgba(244, 67, 54, 0.95)',
  warning: 'rgba(255, 152, 0, 0.95)',
  info:    'rgba(33, 150, 243, 0.95)',
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [systemToasts, setSystemToasts] = useState<SystemToast[]>([]);
  const [appToasts,    setAppToasts]    = useState<AppToast[]>([]);

  const removeSystem = useCallback((id: string) => {
    setSystemToasts(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n));
    setTimeout(() => setSystemToasts(prev => prev.filter(n => n.id !== id)), 350);
  }, []);

  const removeApp = useCallback((id: string) => {
    setAppToasts(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n));
    setTimeout(() => setAppToasts(prev => prev.filter(n => n.id !== id)), 350);
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = `sys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setSystemToasts(prev => {
      const last = prev[prev.length - 1];
      if (last && last.message === message && last.type === type) return prev;
      const next = [...prev, { id, message, type, exiting: false }];
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });
    setTimeout(() => removeSystem(id), DURATION);
  }, [removeSystem]);

  const showAppNotification = useCallback((notification: AppNotification) => {
    const id = `app_${notification._id}_${Date.now()}`;
    playNotificationSound();
    setAppToasts(prev => {
      const next = [...prev, { id, notification, exiting: false }];
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });
    setTimeout(() => removeApp(id), DURATION + 1000);
  }, [removeApp]);

  // Clique no toast: marca como lida + navega
  const handleToastNavigate = useCallback((toastId: string, notificationId: string, notification: AppNotification) => {
    removeApp(toastId);
    // Marca como lida silenciosamente
    api.patch(`/notifications/${notificationId}/read`).catch(() => {});
    const link = getNotificationLink(notification);
    if (link) navigate(link);
  }, [removeApp, navigate]);

  useEffect(() => {
    apiErrorEmitter.subscribe((message) => showNotification(message, 'error'));
    return () => apiErrorEmitter.unsubscribe();
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showAppNotification }}>
      {children}

      {/* Toasts de sistema */}
      <Box sx={{ position: 'fixed', top: 80, right: 24, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 1, pointerEvents: 'none' }}>
        {systemToasts.map((n) => (
          <Box key={n.id} sx={{ pointerEvents: 'all', transition: 'all 0.35s ease', opacity: n.exiting ? 0 : 1, transform: n.exiting ? 'translateX(120%)' : 'translateX(0)' }}>
            <Alert
              onClose={() => removeSystem(n.id)}
              severity={n.type}
              variant='filled'
              sx={{ minWidth: 300, maxWidth: 400, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', backgroundColor: BG[n.type], '& .MuiAlert-icon': { color: 'white' }, '& .MuiAlert-action': { color: 'white' } }}
            >
              {n.message}
            </Alert>
          </Box>
        ))}
      </Box>

      {/* Toasts de notificações SSE */}
      <Box sx={{ position: 'fixed', top: 80, right: 24, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 1.5, pointerEvents: 'none' }}>
        {appToasts.map((t) => (
          <Box key={t.id} sx={{ pointerEvents: 'all' }}>
            <NotificationToast
              notification={t.notification}
              onClose={() => removeApp(t.id)}
              onNavigate={() => handleToastNavigate(t.id, t.notification._id, t.notification)}
              exiting={t.exiting}
            />
          </Box>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
