import {
  CloseOutlined,
  FolderOutlined,
  GroupOutlined,
  PersonOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { AppNotification, NotificationCategory } from '@/globals/types';

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  processo: { icon: <FolderOutlined sx={{ fontSize: 18 }} />, color: '#1877F2', bg: '#EBF3FF' },
  gerencia: { icon: <GroupOutlined sx={{ fontSize: 18 }} />,  color: '#7C3AED', bg: '#F3EEFF' },
  usuario:  { icon: <PersonOutlined sx={{ fontSize: 18 }} />, color: '#059669', bg: '#ECFDF5' },
  sistema:  { icon: <SettingsOutlined sx={{ fontSize: 18 }} />, color: '#64748b', bg: '#F1F5F9' },
};

type Props = {
  notification: AppNotification;
  onClose: () => void;
  onNavigate: (link: string) => void;
  exiting: boolean;
};

export const NotificationToast = ({ notification: n, onClose, onNavigate, exiting }: Props) => {
  const cfg = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.sistema;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        p: 2,
        minWidth: 320,
        maxWidth: 400,
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateX(120%)' : 'translateX(0)',
        '&:hover': { backgroundColor: '#f8fafc' }
      }}
      onClick={() => onNavigate(n._id)}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
        {cfg.icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, flex: 1 }}>
            {n.title}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0 }}>
            {dayjs(n.createdAt).format('HH:mm')}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {n.body}
        </Typography>
        {n.processNumber && (
          <Box sx={{ display: 'inline-flex', mt: 0.75, backgroundColor: cfg.bg, color: cfg.color, px: 1, py: 0.25, borderRadius: 1 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700 }}>{n.processNumber}</Typography>
          </Box>
        )}
      </Box>

      <IconButton
        size='small'
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        sx={{ p: 0.25, color: '#cbd5e1', flexShrink: 0, mt: -0.25, '&:hover': { color: '#64748b' } }}
      >
        <CloseOutlined sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
};
