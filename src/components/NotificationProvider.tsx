import { Alert, alpha, Snackbar, useTheme } from '@mui/material';
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
  const theme = useTheme();

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
    }, 5000);
  };

  const handleClose = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isExiting: true } : notification))
    );

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 300);
  };

  const getNotificationBackgroundColor = (type: NotificationType) => {
    const colorMap = {
      success: alpha(theme.palette.success.main, 0.9),
      error: alpha(theme.palette.error.main, 0.9),
      warning: alpha(theme.palette.warning.main, 0.9),
      info: alpha(theme.palette.info.main, 0.9)
    };
    return colorMap[type];
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          autoHideDuration={5000}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            top: '100px !important',
            zIndex: 10000
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant='filled'
            sx={{
              minWidth: '300px',
              maxWidth: '400px',
              borderRadius: '8px',
              boxShadow: theme.shadows[4],
              backgroundColor: getNotificationBackgroundColor(notification.type),
              backdropFilter: 'blur(8px)',
              '& .MuiAlert-icon': {
                color: 'white'
              },
              '& .MuiAlert-action': {
                color: 'white'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
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
