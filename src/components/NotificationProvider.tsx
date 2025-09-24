import { Alert, Box } from '@mui/material';
import { createContext, type ReactNode, useContext, useState } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  open: boolean;
  isExiting?: boolean;
};

type NotificationContextType = {
  showNotification: (message: string, type: NotificationType) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const NotificationProvider = ({ children }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      message,
      type,
      open: true,
      isExiting: false
    };

    setNotifications((prev) => {
      const updatedNotifications = [...prev, newNotification];

      if (updatedNotifications.length > 3) {
        const excessCount = updatedNotifications.length - 3;
        return updatedNotifications.slice(excessCount);
      }

      return updatedNotifications;
    });

    setTimeout(() => {
      handleClose(id);
    }, 5000); // 5 seconds duration
  };

  const handleClose = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isExiting: true } : notification))
    );

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 300);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Box
        sx={{
          position: 'fixed',
          top: 80,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400
        }}
      >
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant='filled'
            sx={{
              width: '100%',
              minWidth: 300,
              animation: notification.isExiting ? 'slideOut 0.3s ease-in forwards' : 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: {
                  transform: 'translateX(100%)',
                  opacity: 0
                },
                to: {
                  transform: 'translateX(0)',
                  opacity: 1
                }
              },
              '@keyframes slideOut': {
                from: {
                  transform: 'translateX(0)',
                  opacity: 1
                },
                to: {
                  transform: 'translateX(100%)',
                  opacity: 0
                }
              }
            }}
          >
            {notification.message}
          </Alert>
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
