import { Alert, Box } from '@mui/material';
import { createContext, type ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { apiErrorEmitter } from '@/services/apiErrorEmitter';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  exiting: boolean;
};

type NotificationContextType = {
  showNotification: (message: string, type: NotificationType) => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const remove = useCallback((id: string) => {
    // Inicia animação de saída
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, exiting: true } : n));
    // Remove após animação
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 350);
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setNotifications(prev => {
      // Evita duplicata da mesma mensagem em menos de 500ms
      const last = prev[prev.length - 1];
      if (last && last.message === message && last.type === type) return prev;

      const next = [...prev, { id, message, type, exiting: false }];
      return next.length > MAX ? next.slice(next.length - MAX) : next;
    });

    setTimeout(() => remove(id), DURATION);
  }, [remove]);

  useEffect(() => {
    apiErrorEmitter.subscribe((message) => showNotification(message, 'error'));
    return () => apiErrorEmitter.unsubscribe();
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Container fixo — notificações empilham de cima para baixo */}
      <Box sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none',
      }}>
        {notifications.map((n) => (
          <Box
            key={n.id}
            sx={{
              pointerEvents: 'all',
              transition: 'all 0.35s ease',
              opacity: n.exiting ? 0 : 1,
              transform: n.exiting ? 'translateX(120%)' : 'translateX(0)',
            }}
          >
            <Alert
              onClose={() => remove(n.id)}
              severity={n.type}
              variant='filled'
              sx={{
                minWidth: 300,
                maxWidth: 400,
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                backgroundColor: BG[n.type],
                backdropFilter: 'blur(8px)',
                '& .MuiAlert-icon': { color: 'white' },
                '& .MuiAlert-action': { color: 'white' },
              }}
            >
              {n.message}
            </Alert>
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
