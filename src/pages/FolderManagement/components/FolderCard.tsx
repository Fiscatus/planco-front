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
  Schedule as ScheduleIcon,
  Star as StarIcon
} from '@mui/icons-material';
import type { Folder } from '@/globals/types';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import { useFavoriteFolders } from '@/hooks';

interface FolderCardProps {
  folder: Folder;
  onToggleFavorite: (id: string) => void;
  onClick: (id: string) => void;
}

export const FolderCard = ({ folder, onToggleFavorite, onClick }: FolderCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoriteFolders();
  const isFolderFavorite = isFavorite(folder._id);

  const handleCardClick = useCallback(() => {
    onClick(folder._id);
  }, [folder._id, onClick]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); // Prevenir que o clique na estrela dispare o clique do card
      toggleFavorite(folder._id);
      onToggleFavorite(folder._id);
    },
    [folder._id, toggleFavorite, onToggleFavorite]
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const isPlanco = folder.name?.toLowerCase().includes('planco');
  const folderIconColor = isPlanco ? '#1877F2' : '#fbbf24';

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
        position: 'relative',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
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
            mb: { xs: 2, sm: 2.5 }
          }}
        >
          {/* Ícone da pasta */}
          <Box
            sx={{
              backgroundColor: isPlanco ? '#dbeafe' : '#fef3c7',
              borderRadius: { xs: 2, sm: 2.5 },
              p: { xs: 1.25, sm: 1.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}
          >
            <FolderIcon
              sx={{
                fontSize: { xs: 32, sm: 34, md: 36 },
                color: folderIconColor
              }}
            />
          </Box>

          {/* Indicadores */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {folder.isDefault && (
              <Tooltip title='Pasta Padrão do Sistema'>
                <IconButton
                  size='small'
                  sx={{
                    color: '#1877F2',
                    cursor: 'default',
                    padding: 0.75,
                    minWidth: 'auto',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <PushPinIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
              </Tooltip>
            )}
            {!folder.isDefault && folder.isPermanent && (
              <Tooltip title='Pasta Fixa'>
                <IconButton
                  size='small'
                  sx={{
                    color: isPlanco ? '#1877F2' : '#64748b',
                    cursor: 'default',
                    padding: 0.75,
                    minWidth: 'auto',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <PushPinIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
              </Tooltip>
            )}
            {!folder.isPermanent && (
              <Tooltip title={isFolderFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                <IconButton
                  onClick={handleFavoriteClick}
                  size='small'
                  sx={{
                    padding: 0.75,
                    minWidth: 'auto',
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    color: isFolderFavorite ? '#fbbf24' : '#94a3b8',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#fbbf24'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <StarIcon
                    sx={{
                      fontSize: { xs: 20, sm: 22 },
                      fill: isFolderFavorite ? '#fbbf24' : 'transparent',
                      stroke: isFolderFavorite ? '#fbbf24' : '#cbd5e1',
                      strokeWidth: isFolderFavorite ? 0 : 1.5,
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
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
            fontSize: { xs: '1.0625rem', sm: '1.125rem', md: '1.25rem' },
            mb: { xs: 1.5, sm: 2 },
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
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: { xs: 1.25, sm: 1.5 } }}>
          {/* Data de criação ou início */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 } }}>
            <CalendarMonthIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#1877F2', flexShrink: 0 }} />
            <Typography
              variant='body2'
              sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, color: '#0f172a', fontWeight: 500 }}
            >
              {folder.isDefault ? 'Padrão do Sistema' : folder.year ? folder.year : folder.createdAt ? formatDate(folder.createdAt) : 'N/A'}
            </Typography>
          </Box>

          {/* Data de modificação ou fim */}
          {!folder.isDefault && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 } }}>
              <ScheduleIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#1877F2', flexShrink: 0 }} />
              <Typography
                variant='body2'
                sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, color: '#0f172a', fontWeight: 500 }}
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
              mt: { xs: 2, sm: 2.5, md: 3 },
              pt: { xs: 2, sm: 2.5, md: 3 },
              borderTop: '1px solid',
              borderColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: { xs: 1.25, sm: 1.5 }
            }}
          >
            <InfoIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#64748b', mt: 0.25, flexShrink: 0 }} />
            <Typography
              variant='body2'
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: { xs: 1.5, sm: 1.6 }
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

