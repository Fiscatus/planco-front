import { Alert, Snackbar } from '@mui/material';
import { ReactNode, createContext, useContext, useState } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
  open: boolean;
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
      open: true
    };

    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000); // 5 seconds duration
  };

  const handleClose = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, open: false }
          : notification
      )
    );
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
          sx={{ mt: 8 }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
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
