import {
  MoreVert as MoreVertIcon,
  PushPin as PushPinIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Box, Card, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type React from 'react';
import { useCallback } from 'react';
import type { FlowModel } from '@/hooks/useFlowModels';
import 'dayjs/locale/pt-br';

import { useFavoriteFlowModels } from '@/hooks/useFavoriteFlowModels';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

type FlowModelCardProps = {
  model: FlowModel;
  isSelected: boolean;
  onClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: boolean;
};

export const FlowModelCard = ({ model, isSelected, onClick, onMenuClick, hideMenu = false }: FlowModelCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoriteFlowModels();
  const isSystem = model.isDefaultPlanco === true;
  const isModelFavorite = !isSystem && isFavorite(model._id);
  const stageCount = model.stages?.length || 0;
  const timeAgo = model.updatedAt || model.createdAt ? dayjs(model.updatedAt || model.createdAt).fromNow() : '';

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!isSystem) toggleFavorite(model._id);
    },
    [toggleFavorite, model._id, isSystem]
  );

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'grey.300',
        bgcolor: isSelected ? 'secondary.light' : 'background.paper',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        boxShadow: isSelected ? '0 2px 8px rgba(24, 119, 242, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        '&:hover': {
          bgcolor: isSelected ? 'secondary.light' : 'grey.100',
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(24, 119, 242, 0.15)',
          transform: 'translateY(-1px)'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 1,
          gap: 1
        }}
      >
        <Typography
          variant='subtitle1'
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            flex: 1,
            pr: 1
          }}
        >
          {model.name}
        </Typography>

        {/* ✅ Indicadores (igual pasta): sistema = fixado; pessoal = favoritos */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {isSystem ? (
            <Tooltip title='Modelo Padrão do Sistema'>
              <IconButton
                size='small'
                sx={{
                  color: 'primary.main',
                  cursor: 'default',
                  padding: 0.75,
                  minWidth: 'auto',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': { backgroundColor: 'transparent' }
                }}
              >
                <PushPinIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={isModelFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
              <IconButton
                onClick={handleFavoriteClick}
                size='small'
                sx={{
                  padding: 0.75,
                  minWidth: 'auto',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  color: isModelFavorite ? 'warning.main' : 'text.disabled',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'warning.main'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {isModelFavorite ? (
                  <StarIcon
                    sx={{
                      fontSize: { xs: 20, sm: 22 },
                      color: 'warning.main',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                ) : (
                  <StarBorderIcon
                    sx={{
                      fontSize: { xs: 20, sm: 22 },
                      color: 'text.disabled',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>
          )}

          {/* Menu (não aparece em modelo do sistema) */}
          {!hideMenu && (
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <MoreVertIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Chip
          label={isSystem ? 'Sistema' : 'Pessoal'}
          size='small'
          sx={{
            height: 22,
            fontSize: '0.7rem',
            bgcolor: 'grey.100',
            color: 'text.primary',
            fontWeight: 600
          }}
        />

        <Typography
          variant='caption'
          sx={{ color: 'text.secondary', mx: 0.5 }}
        >
          •
        </Typography>

        <Typography
          variant='caption'
          sx={{ color: 'text.secondary' }}
        >
          {stageCount} {stageCount === 1 ? 'etapa' : 'etapas'}
        </Typography>

        {timeAgo && (
          <>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary', mx: 0.5 }}
            >
              •
            </Typography>
            <Typography
              variant='caption'
              sx={{ color: 'text.secondary' }}
            >
              {timeAgo}
            </Typography>
          </>
        )}
      </Box>

      {model.description && (
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {model.description}
        </Typography>
      )}
    </Card>
  );
};
