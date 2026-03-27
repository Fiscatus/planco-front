import {
  ArchiveOutlined,
  CheckCircleOutlined,
  ClearAllOutlined,
  DeleteOutlined,
  FolderOutlined,
  GroupOutlined,
  MarkEmailReadOutlined,
  NotificationsNoneOutlined,
  PersonOutlined,
  RefreshOutlined,
  SearchOutlined,
  SettingsOutlined,
  StarBorderOutlined,
  StarOutlined,
  UnarchiveOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppNotification, NotificationCategory } from '@/globals/types';
import { useNotifications } from '@/hooks/useNotifications';
import { getNotificationLink } from '@/utils/notificationLink';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const CATEGORY_CONFIG: Record<NotificationCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  processo: { icon: <FolderOutlined sx={{ fontSize: 20 }} />, color: '#1877F2', bg: '#EBF3FF' },
  gerencia: { icon: <GroupOutlined sx={{ fontSize: 20 }} />,  color: '#7C3AED', bg: '#F3EEFF' },
  usuario:  { icon: <PersonOutlined sx={{ fontSize: 20 }} />, color: '#059669', bg: '#ECFDF5' },
  sistema:  { icon: <SettingsOutlined sx={{ fontSize: 20 }} />, color: '#64748b', bg: '#F1F5F9' },
};

const TYPE_URGENCY: Record<string, boolean> = {
  PROCESS_OVERDUE: true, APPROVAL_REQUESTED: true, SIGNATURE_REQUESTED: true,
  PROCESS_STAGE_REJECTED: true, TIMELINE_EVENT_ASSIGNED: true,
};

type FilterTab = 'all' | 'unread' | 'starred' | 'archived' | 'processo' | 'gerencia' | 'usuario' | 'sistema';

const groupByDate = (items: AppNotification[]) => {
  const today     = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');
  const weekAgo   = today.subtract(7, 'day');
  const groups: { label: string; items: AppNotification[] }[] = [
    { label: 'Hoje', items: [] },
    { label: 'Ontem', items: [] },
    { label: 'Esta semana', items: [] },
    { label: 'Mais antigas', items: [] },
  ];
  items.forEach(n => {
    const d = dayjs(n.createdAt);
    if (d.isAfter(today))     groups[0].items.push(n);
    else if (d.isAfter(yesterday)) groups[1].items.push(n);
    else if (d.isAfter(weekAgo))   groups[2].items.push(n);
    else                           groups[3].items.push(n);
  });
  return groups.filter(g => g.items.length > 0);
};

// ─── Row ────────────────────────────────────────────────────────────────────
const NotificationRow = ({
  n, selected, onSelect, onToggleStar, onClick,
}: {
  n: AppNotification;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onToggleStar: () => void;
  onClick: () => void;
}) => {
  const cfg = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.sistema;
  const isUrgent = TYPE_URGENCY[n.type];
  const link = getNotificationLink(n);

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2.5, py: 1.75,
        cursor: link ? 'pointer' : 'default',
        backgroundColor: selected ? 'rgba(24,119,242,0.06)' : n.read ? '#ffffff' : 'rgba(24,119,242,0.025)',
        transition: 'background 0.15s',
        '&:hover': { backgroundColor: selected ? 'rgba(24,119,242,0.08)' : '#f8fafc' },
      }}
    >
      {/* Checkbox */}
      <Checkbox
        size='small'
        checked={selected}
        onChange={e => { e.stopPropagation(); onSelect(e.target.checked); }}
        onClick={e => e.stopPropagation()}
        sx={{ p: 0.5, flexShrink: 0 }}
      />

      {/* Dot não lida */}
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: n.read ? 'transparent' : cfg.color, flexShrink: 0 }} />

      {/* Ícone categoria */}
      <Box
        onClick={onClick}
        sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0, border: `1px solid ${cfg.color}18` }}
      >
        {cfg.icon}
      </Box>

      {/* Conteúdo */}
      <Box onClick={onClick} sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: n.read ? 500 : 700, color: n.read ? '#374151' : '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {n.title}
          </Typography>
          {isUrgent && !n.read && (
            <Chip label='Urgente' size='small' sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#B91C1C', flexShrink: 0 }} />
          )}
          {n.processNumber && (
            <Chip label={n.processNumber} size='small' sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700, backgroundColor: cfg.bg, color: cfg.color, flexShrink: 0 }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {n.body}
        </Typography>
        {n.actorName && (
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.25 }}>por {n.actorName}</Typography>
        )}
      </Box>

      {/* Hora */}
      <Typography onClick={onClick} sx={{ fontSize: '0.6875rem', color: '#94a3b8', flexShrink: 0, minWidth: 44, textAlign: 'right' }}>
        {dayjs(n.createdAt).format('HH:mm')}
      </Typography>

      {/* Estrela — sempre visível */}
      <Tooltip title={n.starred ? 'Remover favorito' : 'Favoritar'}>
        <IconButton
          size='small'
          onClick={e => { e.stopPropagation(); onToggleStar(); }}
          sx={{ p: 0.5, flexShrink: 0, color: n.starred ? '#F59E0B' : '#d1d5db', '&:hover': { color: '#F59E0B' } }}
        >
          {n.starred ? <StarOutlined sx={{ fontSize: 18 }} /> : <StarBorderOutlined sx={{ fontSize: 18 }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab]         = useState<FilterTab>('all');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [limit, setLimit]     = useState(20);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filters = {
    ...(tab === 'unread'   ? { read: false }     : {}),
    ...(tab === 'starred'  ? { starred: true }   : {}),
    ...(tab === 'archived' ? { archived: true }  : { archived: false }),
    ...(['processo','gerencia','usuario','sistema'].includes(tab) ? { category: tab as NotificationCategory } : {}),
    ...(search ? { search } : {}),
    page, limit,
  };

  const {
    data, isLoading, isFetching, refetch,
    markAllRead, toggleStar,
    archive, unarchive, deleteOne, deleteAllRead,
    bulkRead, bulkStar, bulkArchive, bulkUnarchive, bulkDelete,
  } = useNotifications(filters);

  const groups = useMemo(() => groupByDate(data?.items ?? []), [data?.items]);
  const allIds = useMemo(() => data?.items.map(n => n._id) ?? [], [data?.items]);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;
  const selectedArr = Array.from(selected);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(allIds) : new Set());
  };

  const clearSelection = () => setSelected(new Set());

  const handleClick = (n: AppNotification) => {
    const link = getNotificationLink(n);
    if (link) navigate(link);
  };

  const handleTabChange = (_: React.SyntheticEvent, v: FilterTab) => {
    setTab(v);
    setPage(1);
    clearSelection();
  };

  const TABS: { value: FilterTab; label: string }[] = [
    { value: 'all',      label: 'Todas' },
    { value: 'unread',   label: `Não lidas${data?.unread ? ` (${data.unread})` : ''}` },
    { value: 'starred',  label: 'Favoritas' },
    { value: 'archived', label: 'Arquivadas' },
    { value: 'processo', label: 'Processos' },
    { value: 'gerencia', label: 'Gerências' },
    { value: 'usuario',  label: 'Usuário' },
    { value: 'sistema',  label: 'Sistema' },
  ];

  const total = data?.total ?? 0;
  const from  = total === 0 ? 0 : (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(180deg, #F7F9FB 0%, #F4F6F8 100%)', pt: { xs: 2, md: 3.5 }, px: { xs: 2, sm: 3, md: 4, lg: 5 }, pb: 6 }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '1.875rem' }, color: '#0f172a', mb: 0.5 }}>
            Notificações
          </Typography>
          <Typography variant='body1' sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Acompanhe alertas, atualizações e pendências do sistema.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(data?.unread ?? 0) > 0 && (
            <Button startIcon={<CheckCircleOutlined />} onClick={() => markAllRead.mutate()}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: '#ffffff', borderRadius: 2, '&:hover': { backgroundColor: '#EBF3FF', color: '#1877F2' } }}>
              Marcar todas como lidas
            </Button>
          )}
          <Button startIcon={<ClearAllOutlined />} onClick={() => deleteAllRead.mutate()}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: '#ffffff', borderRadius: 2, '&:hover': { backgroundColor: '#f1f5f9', color: '#1877F2' } }}>
            Deletar lidas
          </Button>
          <Button
            startIcon={<RefreshOutlined sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />}
            onClick={() => refetch()}
            disabled={isFetching}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', borderRadius: 2, borderColor: '#1877F2', color: '#ffffff', '&:hover': { backgroundColor: '#EBF3FF', color: '#1877F2' }, '&:disabled': { borderColor: '#e2e8f0', color: '#1877F2' } }}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Barra de filtros */}
      <Box sx={{ backgroundColor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', mb: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, px: 2, pt: 1.5 }}>
          <Tabs
            value={tab} onChange={handleTabChange}
            variant='scrollable' scrollButtons='auto'
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.8125rem', fontWeight: 600, py: 0, px: 2 }, '& .MuiTabs-indicator': { height: 3, borderRadius: '2px 2px 0 0' } }}
          >
            {TABS.map(t => <Tab key={t.value} value={t.value} label={t.label} />)}
          </Tabs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#f8fafc', borderRadius: 2, px: 1.5, py: 0.75, border: '1px solid #e2e8f0', mb: 1 }}>
            <SearchOutlined sx={{ fontSize: 16, color: '#94a3b8' }} />
            <InputBase placeholder='Buscar...' value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} sx={{ fontSize: '0.8125rem', width: 180 }} />
          </Box>
        </Box>
      </Box>

      {/* Toolbar de seleção — aparece quando há itens selecionados */}
      {someSelected && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.5, mb: 1, backgroundColor: '#EBF3FF', borderRadius: 2, border: '1px solid rgba(24,119,242,0.2)' }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1877F2', mr: 1 }}>
            {selected.size} selecionada{selected.size > 1 ? 's' : ''}
          </Typography>
          <Tooltip title='Marcar como lidas'>
            <IconButton size='small' onClick={() => { bulkRead.mutate(selectedArr); clearSelection(); }} sx={{ color: '#1877F2', '&:hover': { backgroundColor: 'rgba(24,119,242,0.1)' } }}>
              <MarkEmailReadOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title={tab === 'archived' ? 'Desarquivar' : 'Arquivar'}>
            <IconButton size='small' onClick={() => { tab === 'archived' ? bulkUnarchive.mutate(selectedArr) : bulkArchive.mutate(selectedArr); clearSelection(); }} sx={{ color: '#1877F2', '&:hover': { backgroundColor: 'rgba(24,119,242,0.1)' } }}>
              {tab === 'archived' ? <UnarchiveOutlined fontSize='small' /> : <ArchiveOutlined fontSize='small' />}
            </IconButton>
          </Tooltip>
          <Tooltip title='Excluir selecionadas'>
            <IconButton size='small' onClick={() => { bulkDelete.mutate(selectedArr); clearSelection(); }} sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#FEE2E2' } }}>
              <DeleteOutlined fontSize='small' />
            </IconButton>
          </Tooltip>
          <Button size='small' onClick={clearSelection} sx={{ ml: 'auto', textTransform: 'none', fontSize: '0.75rem', color: '#ffffff' }}>
            Cancelar
          </Button>
        </Box>
      )}

      {/* Lista */}
      <Box sx={{ backgroundColor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Cabeçalho da lista com checkbox selecionar tudo */}
        {!isLoading && (data?.items.length ?? 0) > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.25, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
            <Checkbox
              size='small'
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={e => toggleAll(e.target.checked)}
              sx={{ p: 0.5 }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {allSelected ? 'Desmarcar tudo' : 'Selecionar tudo'}
            </Typography>
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
            <NotificationsNoneOutlined sx={{ fontSize: 56, color: '#e2e8f0' }} />
            <Typography sx={{ fontWeight: 600, color: '#94a3b8' }}>Nenhuma notificação</Typography>
            <Typography variant='body2' sx={{ color: '#cbd5e1' }}>Você está em dia com tudo!</Typography>
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            {isFetching && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, borderRadius: 1 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            {groups.map((group) => (
              <Box key={group.label}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 1.25 }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    {group.label}
                  </Typography>
                  <Box sx={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
                </Box>
                {group.items.map((n, idx) => (
                  <Box key={n._id}>
                    <NotificationRow
                      n={n}
                      selected={selected.has(n._id)}
                      onSelect={checked => toggleSelect(n._id, checked)}
                      onToggleStar={() => toggleStar.mutate(n._id)}
                      onClick={() => handleClick(n)}
                    />
                    {idx < group.items.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}

        {/* Paginação — padrão do sistema (AdminPage) */}
        {total > 0 && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, backgroundColor: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <Typography variant='body2' sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
              {from}–{to} de {total}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select
                value={limit}
                onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                sx={{ minWidth: 130, height: 32, fontSize: '0.875rem' }}
              >
                {[10, 20, 50, 100].map(l => (
                  <MenuItem key={l} value={l} sx={{ '&:hover': { backgroundColor: '#f8fafc' }, '&.Mui-selected': { backgroundColor: '#f1f5f9' } }}>
                    {l} por página
                  </MenuItem>
                ))}
              </Select>
              <Pagination
                count={data?.totalPages ?? 0}
                page={page}
                onChange={(_, v) => { setPage(v); clearSelection(); }}
                variant='outlined'
                shape='rounded'
                showFirstButton
                showLastButton
              />
            </Box>
          </Box>
        )}
      </Box>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
};

export default NotificationsPage;
