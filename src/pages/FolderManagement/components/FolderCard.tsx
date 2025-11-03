import {
  Box,
  Card,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  Folder as FolderIcon,
  Info as InfoIcon,
  PushPin as PushPinIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import type { Folder } from '@/globals/types';
import { useCallback } from 'react';
import dayjs from 'dayjs';

interface FolderCardProps {
  folder: Folder;
  onToggleFavorite: (id: string) => void;
  onClick: (id: string) => void;
}

export const FolderCard = ({ folder, onToggleFavorite, onClick }: FolderCardProps) => {
  const handleCardClick = useCallback(() => {
    onClick(folder._id);
  }, [folder._id, onClick]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const folderIconColor = folder.isDefault ? '#1877F2' : '#fbbf24';

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        {/* Header com ícone e indicadores */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mb: 2.5
          }}
        >
          {/* Ícone da pasta */}
          <Box
            sx={{
              backgroundColor: folderIconColor === '#1877F2' ? '#dbeafe' : '#fef3c7',
              borderRadius: 2.5,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <FolderIcon
              sx={{
                fontSize: 36,
                color: folderIconColor
              }}
            />
          </Box>

          {/* Indicadores */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {folder.isDefault && (
              <Tooltip title='Pasta Padrão do Sistema'>
                <IconButton
                  size='small'
                  sx={{
                    color: '#1877F2',
                    cursor: 'default',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <PushPinIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {!folder.isDefault && folder.isPermanent && (
              <Tooltip title='Pasta Permanente'>
                <IconButton
                  size='small'
                  sx={{
                    color: '#64748b',
                    cursor: 'default',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <InfoIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Título */}
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            mb: 2,
            color: '#0f172a',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {folder.name}
        </Typography>

        {/* Informações da pasta */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Data de criação ou início */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CalendarMonthIcon sx={{ fontSize: 20, color: '#1877F2' }} />
            <Typography
              variant='body2'
              sx={{ fontSize: '0.9375rem', color: '#0f172a', fontWeight: 500 }}
            >
              {folder.isDefault ? 'Padrão do Sistema' : folder.year ? folder.year : folder.createdAt ? formatDate(folder.createdAt) : 'N/A'}
            </Typography>
          </Box>

          {/* Data de modificação ou fim */}
          {!folder.isDefault && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ScheduleIcon sx={{ fontSize: 20, color: '#1877F2' }} />
              <Typography
                variant='body2'
                sx={{ fontSize: '0.9375rem', color: '#0f172a', fontWeight: 500 }}
              >
                {folder.isPermanent ? 'Permanente' : folder.updatedAt ? formatDate(folder.updatedAt) : 'N/A'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Descrição */}
        {(folder.description || folder.observations) && (
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid',
              borderColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5
            }}
          >
            <InfoIcon sx={{ fontSize: 18, color: '#64748b', mt: 0.25, flexShrink: 0 }} />
            <Typography
              variant='body2'
              sx={{
                fontSize: '0.875rem',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.6
              }}
            >
              {folder.description || folder.observations}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

