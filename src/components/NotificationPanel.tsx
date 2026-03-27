import {
  CheckCircleOutlined,
  ClearAllOutlined,
  CloseOutlined,
  DeleteOutlined,
  FolderOutlined,
  GroupOutlined,
  NotificationsNoneOutlined,
  PersonOutlined,
  SearchOutlined,
  SettingsOutlined,
  StarBorderOutlined,
  StarOutlined
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification, NotificationCategory } from '@/globals/types';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationLink } from '@/utils/notificationLink';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const CATEGORY_ICON: Record<NotificationCategory, React.ReactNode> = {
  processo: <FolderOutlined sx={{ fontSize: 16 }} />,
  gerencia: <GroupOutlined sx={{ fontSize: 16 }} />,
  usuario:  <PersonOutlined sx={{ fontSize: 16 }} />,
  sistema:  <SettingsOutlined sx={{ fontSize: 16 }} />,
};

const CATEGORY_COLOR: Record<NotificationCategory, string> = {
  processo: '#1877F2',
  gerencia: '#7C3AED',
  usuario:  '#059669',
  sistema:  '#64748b',
};

type Tab = 'all' | 'unread' | 'starred' | 'processo' | 'gerencia' | 'usuario' | 'sistema';

type Props = {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
};

export const NotificationPanel = ({ open, onClose, unreadCount }: Props) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filters = {
    ...(tab === 'unread'  ? { read: false } : {}),
    ...(tab === 'starred' ? { starred: true } : {}),
    ...((['processo','gerencia','usuario','sistema'] as Tab[]).includes(tab) ? { category: tab as NotificationCategory } : {}),
    ...(search ? { search } : {}),
    page,
    limit: 20,
  };

  const { data, isLoading, markRead, markAllRead, toggleStar, deleteOne, deleteAllRead } = useNotifications(filters);

  const handleClick = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n._id);
    const link = getNotificationLink(n);
    if (link) { navigate(link); onClose(); }
  };

  const handleTabChange = (_: React.SyntheticEvent, v: Tab) => {
    setTab(v);
    setPage(1);
  };

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 420 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E4E6EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <NotificationsNoneOutlined sx={{ color: '#1877F2' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Notificações</Typography>
          {unreadCount > 0 && (
            <Chip label={unreadCount} size='small' sx={{ backgroundColor: '#1877F2', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.6875rem' }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {unreadCount > 0 && (
            <Tooltip title='Marcar todas como lidas'>
              <IconButton size='small' onClick={() => markAllRead.mutate()} sx={{ color: '#64748b' }}>
                <CheckCircleOutlined fontSize='small' />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title='Limpar notificações lidas'>
            <IconButton size='small' onClick={() => deleteAllRead.mutate()} sx={{ color: '#64748b' }}>
              <ClearAllOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <IconButton size='small' onClick={onClose} sx={{ color: '#64748b' }}>
            <CloseOutlined fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* Busca */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#f8fafc', borderRadius: 2, px: 1.5, py: 0.75, border: '1px solid #e2e8f0' }}>
          <SearchOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
          <InputBase
            placeholder='Buscar notificações...'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
          {search && (
            <IconButton size='small' onClick={() => setSearch('')} sx={{ p: 0.25 }}>
              <CloseOutlined sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Abas */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant='scrollable'
        scrollButtons='auto'
        sx={{ borderBottom: '1px solid #E4E6EB', minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.8125rem', fontWeight: 600, py: 0 } }}
      >
        <Tab label='Todas' value='all' />
        <Tab label={`Não lidas${unreadCount > 0 ? ` (${unreadCount})` : ''}`} value='unread' />
        <Tab label='Favoritas' value='starred' />
        <Tab label='Processos' value='processo' />
        <Tab label='Gerências' value='gerencia' />
        <Tab label='Usuário' value='usuario' />
      </Tabs>

      {/* Lista */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : data?.items.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1 }}>
            <NotificationsNoneOutlined sx={{ fontSize: 48, color: '#cbd5e1' }} />
            <Typography variant='body2' color='text.secondary'>Nenhuma notificação</Typography>
          </Box>
        ) : (
          data?.items.map((n, idx) => {
            const catColor = CATEGORY_COLOR[n.category] ?? '#64748b';
            const link = getNotificationLink(n);
            return (
              <Box key={n._id}>
                <Box
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2.5, py: 2,
                    display: 'flex', gap: 2, alignItems: 'flex-start',
                    cursor: link ? 'pointer' : 'default',
                    backgroundColor: n.read ? 'transparent' : 'rgba(24,119,242,0.04)',
                    borderLeft: n.read ? '3px solid transparent' : `3px solid ${catColor}`,
                    transition: 'background 0.15s',
                    '&:hover': { backgroundColor: '#f8fafc' }
                  }}
                >
                  {/* Ícone categoria */}
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: `${catColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: catColor, flexShrink: 0, mt: 0.25 }}>
                    {CATEGORY_ICON[n.category]}
                  </Box>

                  {/* Conteúdo */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: n.read ? 500 : 700, color: '#0f172a', lineHeight: 1.4 }}>
                        {n.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0, mt: 0.25 }}>
                        {dayjs(n.createdAt).fromNow()}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25, lineHeight: 1.4 }}>
                      {n.body}
                    </Typography>
                    {(n.processNumber || n.actorName) && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
                        {n.processNumber && (
                          <Chip label={n.processNumber} size='small' sx={{ height: 18, fontSize: '0.6875rem', fontWeight: 700, backgroundColor: '#E7F3FF', color: '#1877F2' }} />
                        )}
                        {n.actorName && (
                          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>por {n.actorName}</Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Ações */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <Tooltip title={n.starred ? 'Remover favorito' : 'Favoritar'}>
                      <IconButton size='small' onClick={() => toggleStar.mutate(n._id)} sx={{ p: 0.5, color: n.starred ? '#F59E0B' : '#cbd5e1', '&:hover': { color: '#F59E0B' } }}>
                        {n.starred ? <StarOutlined sx={{ fontSize: 16 }} /> : <StarBorderOutlined sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Remover'>
                      <IconButton size='small' onClick={() => deleteOne.mutate(n._id)} sx={{ p: 0.5, color: '#cbd5e1', '&:hover': { color: '#ef4444' } }}>
                        <DeleteOutlined sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {idx < (data?.items.length ?? 0) - 1 && <Divider />}
              </Box>
            );
          })
        )}

        {/* Paginação simples */}
        {data && data.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 2 }}>
            {page > 1 && (
              <Chip label='← Anterior' size='small' onClick={() => setPage(p => p - 1)} sx={{ cursor: 'pointer', fontWeight: 600 }} />
            )}
            <Typography variant='caption' sx={{ alignSelf: 'center', color: '#64748b' }}>
              {page} / {data.totalPages}
            </Typography>
            {page < data.totalPages && (
              <Chip label='Próxima →' size='small' onClick={() => setPage(p => p + 1)} sx={{ cursor: 'pointer', fontWeight: 600 }} />
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
