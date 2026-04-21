import {
  CheckCircleOutlined,
  CloseOutlined,
  FolderOutlined,
  GroupOutlined,
  NotificationsNoneOutlined,
  OpenInNewOutlined,
  PersonOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { useNavigate } from 'react-router-dom';
import type { AppNotification, NotificationCategory } from '@/globals/types';
import { useNotificationPreview, useNotifications } from '@/hooks/useNotifications';
import { getNotificationLink } from '@/utils/notificationLink';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  processo: { icon: <FolderOutlined sx={{ fontSize: 16 }} />, color: '#1877F2', bg: '#EBF3FF' },
  gerencia: { icon: <GroupOutlined sx={{ fontSize: 16 }} />,  color: '#7C3AED', bg: '#F3EEFF' },
  usuario:  { icon: <PersonOutlined sx={{ fontSize: 16 }} />, color: '#059669', bg: '#ECFDF5' },
  sistema:  { icon: <SettingsOutlined sx={{ fontSize: 16 }} />, color: '#64748b', bg: '#F1F5F9' },
};

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onViewAll: () => void;
  unreadCount: number;
};

export const NotificationDropdown = ({ anchorEl, onClose, onViewAll, unreadCount }: Props) => {
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const { data, isLoading } = useNotificationPreview(open);
  const { markAllRead } = useNotifications();

  const handleClick = (n: AppNotification) => {
    const link = getNotificationLink(n);
    if (link) { navigate(link); onClose(); }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            mt: 1
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsNoneOutlined sx={{ fontSize: 18, color: '#1877F2' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>Notificações</Typography>
          {unreadCount > 0 && (
            <Box sx={{ backgroundColor: '#1877F2', color: '#fff', borderRadius: '999px', px: 1, py: 0.125, fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.6 }}>
              {unreadCount}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {unreadCount > 0 && (
            <Tooltip title='Marcar todas como lidas'>
              <IconButton size='small' onClick={() => markAllRead.mutate()} sx={{ color: '#94a3b8', '&:hover': { color: '#1877F2' } }}>
                <CheckCircleOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size='small' onClick={onClose} sx={{ color: '#94a3b8' }}>
            <CloseOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Lista preview */}
      <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !data?.items.length ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1 }}>
            <NotificationsNoneOutlined sx={{ fontSize: 40, color: '#e2e8f0' }} />
            <Typography variant='body2' sx={{ color: '#94a3b8' }}>Tudo em dia!</Typography>
          </Box>
        ) : (
          data.items.map((n, idx) => {
            const cfg = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.sistema;
            const link = getNotificationLink(n);
            return (
              <Box key={n._id}>
                <Box
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2.5, py: 1.75,
                    display: 'flex', gap: 1.5, alignItems: 'flex-start',
                    cursor: link ? 'pointer' : 'default',
                    backgroundColor: n.read ? 'transparent' : 'rgba(24,119,242,0.03)',
                    transition: 'background 0.15s',
                    '&:hover': { backgroundColor: '#f8fafc' },
                    position: 'relative'
                  }}
                >
                  {/* Dot não lida */}
                  {!n.read && (
                    <Box sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.color }} />
                  )}

                  <Box sx={{ width: 34, height: 34, borderRadius: 2, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                    {cfg.icon}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: n.read ? 500 : 700, color: '#0f172a', lineHeight: 1.3 }}>
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0 }}>
                        {dayjs(n.createdAt).fromNow(true)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.body}
                    </Typography>
                    {n.processNumber && (
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: cfg.color, mt: 0.25 }}>
                        {n.processNumber}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {idx < data.items.length - 1 && <Divider sx={{ mx: 2.5 }} />}
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Button
          fullWidth
          endIcon={<OpenInNewOutlined sx={{ fontSize: 14 }} />}
          onClick={() => { onViewAll(); onClose(); }}
          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', color: '#ffffff', borderRadius: 2, py: 1, '&:hover': { backgroundColor: '#EBF3FF', color: '#1877F2' } }}
        >
          Ver todas as notificações
        </Button>
      </Box>
    </Popover>
  );
};
