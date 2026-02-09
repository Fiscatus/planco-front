import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  FullscreenExit as FullscreenExitIcon,
  Fullscreen as FullscreenIcon,
  GppGood as GppGoodIcon,
  Layers as LayersIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { lazy, memo, Suspense, useCallback, useMemo, useState } from 'react';
import type { FlowModelStage } from '@/hooks/useFlowModels';

// Lazy load ALL preview components for better code splitting
const SignatureComponent = lazy(() =>
  import('./SignatureComponent').then((module) => ({ default: module.SignatureComponent }))
);
const FilesManagementComponent = lazy(() =>
  import('./FilesManagementComponent').then((module) => ({ default: module.FilesManagementComponent }))
);
const ApprovalComponent = lazy(() =>
  import('./ApprovalComponent').then((module) => ({ default: module.ApprovalComponent }))
);

// Mapeamento de componentes implementados
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  SIGNATURE: SignatureComponent,
  FILES_MANAGEMENT: FilesManagementComponent,
  APPROVAL: ApprovalComponent
};

type StageCardProps = {
  stage: FlowModelStage;
  isEditMode?: boolean;
  onEditStage?: (stage: FlowModelStage) => void;
  onDeleteStage?: (stageId: string) => void;
  onDragEnd?: (activeId: string, overId: string) => void;
};

// Loading fallback component - memoized to prevent re-renders
const LoadingFallback = memo(() => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
    <CircularProgress size={32} />
  </Box>
));
LoadingFallback.displayName = 'LoadingFallback';

// Extract static styles to avoid recreation
const cardBaseStyles = {
  p: 2.5,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 2,
  border: 2,
  borderRadius: 2,
  transition: 'all 0.2s ease-in-out',
  outline: 'none'
};

const orderBadgeStyles = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  bgcolor: 'primary.main',
  color: 'common.white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '0.9375rem',
  boxShadow: '0 2px 4px rgba(24, 119, 242, 0.3)',
  flexShrink: 0
};

const buttonBaseStyles = {
  textTransform: 'none' as const,
  fontWeight: 700,
  borderColor: 'divider',
  color: 'text.primary',
  borderRadius: 2,
  fontSize: '0.875rem',
  '&:hover': {
    borderColor: 'primary.main',
    bgcolor: '#F0F9FF',
    color: 'primary.main'
  }
};

// Memoized sub-components for better performance
const StageHeader = memo(({ isEditMode, safeOrder }: { isEditMode: boolean; safeOrder: number }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
      {isEditMode && (
        <DragIndicatorIcon
          sx={{ color: 'text.disabled', fontSize: 24, cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
        />
      )}
      <Box sx={orderBadgeStyles}>{safeOrder}</Box>
    </Box>
  </Box>
));
StageHeader.displayName = 'StageHeader';

const StageDescription = memo(({ name, description }: { name: string; description?: string }) => (
  <Box sx={{ flex: 1 }}>
    <Typography
      variant='subtitle1'
      sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, lineHeight: 1.3 }}
    >
      {name}
    </Typography>
    <Typography
      variant='body2'
      sx={{
        color: 'text.secondary',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        height: 63,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word'
      }}
    >
      {description?.trim() ? description : 'Sem descrição'}
    </Typography>
  </Box>
));
StageDescription.displayName = 'StageDescription';

const StageChips = memo(
  ({
    componentsCount,
    requiresApproval,
    canRepeat
  }: {
    componentsCount: number;
    requiresApproval?: boolean;
    canRepeat?: boolean;
  }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          icon={<LayersIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
          label={`${componentsCount} ${componentsCount === 1 ? 'componente' : 'componentes'}`}
          size='small'
          sx={{
            bgcolor: 'secondary.light',
            color: 'primary.main',
            fontWeight: 800,
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-icon': { ml: 0.5 }
          }}
        />
        <Chip
          icon={requiresApproval ? <GppGoodIcon /> : <CheckCircleIcon />}
          label={requiresApproval ? 'Requer aprovação' : 'Sem aprovação'}
          size='small'
          sx={{
            bgcolor: requiresApproval ? 'warning.light' : 'success.light',
            color: requiresApproval ? 'warning.dark' : 'success.dark',
            fontWeight: 800,
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-icon': { ml: 0.5, fontSize: 16, color: requiresApproval ? 'warning.dark' : 'success.dark' }
          }}
        />
        {canRepeat && (
          <Chip
            label='Pode repetir'
            size='small'
            sx={{ bgcolor: 'grey.100', color: 'text.secondary', fontWeight: 800, fontSize: '0.75rem', height: 24 }}
          />
        )}
      </Box>
    </Box>
  )
);
StageChips.displayName = 'StageChips';

const StageActions = memo(
  ({
    isEditMode,
    canEdit,
    canDelete,
    onPreviewClick,
    onEditClick,
    onDeleteClick
  }: {
    isEditMode: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onPreviewClick: (e: React.MouseEvent) => void;
    onEditClick: (e: React.MouseEvent) => void;
    onDeleteClick: (e: React.MouseEvent) => void;
  }) => (
    <Box onClick={(e) => e.stopPropagation()}>
      {isEditMode ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            startIcon={<VisibilityIcon />}
            onClick={onPreviewClick}
            fullWidth
            sx={buttonBaseStyles}
          >
            Preview
          </Button>
          <Button
            variant='outlined'
            startIcon={<EditIcon />}
            onClick={onEditClick}
            disabled={!canEdit}
            fullWidth
            sx={buttonBaseStyles}
          >
            Editar
          </Button>
          <Tooltip title='Excluir etapa'>
            <span>
              <IconButton
                onClick={onDeleteClick}
                disabled={!canDelete}
                sx={{
                  border: '1px solid divider',
                  borderRadius: 2,
                  bgcolor: 'common.white',
                  '&:hover': { borderColor: 'error.main', bgcolor: '#FFF1F3' }
                }}
              >
                <DeleteIcon
                  fontSize='small'
                  sx={{ color: 'error.main' }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : (
        <Button
          onClick={onPreviewClick}
          variant='outlined'
          startIcon={<VisibilityIcon />}
          fullWidth
          sx={buttonBaseStyles}
        >
          Preview
        </Button>
      )}
    </Box>
  )
);
StageActions.displayName = 'StageActions';

// Memoized component renderer for preview
const ComponentRenderer = memo(({ component, index }: { component: any; index: number }) => {
  const Component = COMPONENT_MAP[component.type];

  if (!Component) return null;

  return (
    <Box key={component.key}>
      {index > 1 && <Box sx={{ height: 2, bgcolor: 'grey.300', my: 2.5, borderRadius: 0.5 }} />}
      <Suspense fallback={<LoadingFallback />}>
        <Component
          config={component.config}
          label={component.label}
          description={component.description}
        />
      </Suspense>
    </Box>
  );
});
ComponentRenderer.displayName = 'ComponentRenderer';

export const StageCard = memo(
  ({ stage, isEditMode = false, onEditStage, onDeleteStage, onDragEnd }: StageCardProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);

    // Memoize all derived values
    const componentsCount = useMemo(() => stage.components?.length || 0, [stage.components?.length]);
    const safeStageId = useMemo(() => String(stage.stageId || '').trim(), [stage.stageId]);
    const safeOrder = useMemo(
      () => (typeof stage.order === 'number' && Number.isFinite(stage.order) ? stage.order : 0),
      [stage.order]
    );

    // Sort components only once and memoize
    const sortedComponents = useMemo(
      () => (stage.components ? [...stage.components].sort((a, b) => a.order - b.order) : []),
      [stage.components]
    );

    // Memoize permission checks
    const canEdit = useMemo(() => isEditMode && !!onEditStage, [isEditMode, onEditStage]);
    const canDelete = useMemo(
      () => isEditMode && !!onDeleteStage && !!safeStageId,
      [isEditMode, onDeleteStage, safeStageId]
    );

    // Memoize all event handlers with useCallback
    const handleEdit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onEditStage) {
          onEditStage(stage);
        }
      },
      [onEditStage, stage]
    );

    const handleDelete = useCallback(
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (
          !safeStageId ||
          !window.confirm(
            `Tem certeza que deseja excluir a etapa "${stage.name}"?\n\nIsso só será aplicado quando você clicar em "Salvar".`
          )
        )
          return;
        onDeleteStage?.(safeStageId);
      },
      [safeStageId, stage.name, onDeleteStage]
    );

    const handlePreviewOpen = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setPreviewOpen(true);
    }, []);

    const handlePreviewClose = useCallback(() => {
      setPreviewOpen(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
      setPreviewFullscreen((prev) => !prev);
    }, []);

    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        if (!isEditMode) return;
        const target = e.target as HTMLElement;
        if (target.closest('button')) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', safeStageId);
        setIsDragging(true);
      },
      [isEditMode, safeStageId]
    );

    const handleDragEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback(
      (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      },
      [isEditMode]
    );

    const handleDragLeave = useCallback(() => {
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        if (!isEditMode) return;
        e.preventDefault();
        setIsDragOver(false);
        const activeId = e.dataTransfer.getData('text/plain');
        if (activeId && activeId !== safeStageId) onDragEnd?.(activeId, safeStageId);
      },
      [isEditMode, safeStageId, onDragEnd]
    );

    // Memoize dynamic styles
    const cardStyles = useMemo(
      () => ({
        ...cardBaseStyles,
        borderColor: isDragOver ? 'primary.main' : 'divider',
        bgcolor: isDragOver ? '#F0F9FF' : 'background.paper',
        boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: isEditMode ? 'grab' : 'default',
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: isDragging ? 'scale(1.02)' : 'translateY(-2px)',
          borderColor: isDragOver ? 'primary.main' : 'primary.main'
        },
        '&:active': {
          cursor: isEditMode ? 'grabbing' : 'default'
        }
      }),
      [isDragging, isDragOver, isEditMode]
    );

    return (
      <>
        <Box
          component='div'
          draggable={isEditMode}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={cardStyles}
        >
          <StageHeader
            isEditMode={isEditMode}
            safeOrder={safeOrder}
          />
          <StageDescription
            name={stage.name}
            description={stage.description}
          />
          <StageChips
            componentsCount={componentsCount}
            requiresApproval={stage.requiresApproval}
            canRepeat={stage.canRepeat}
          />
          <StageActions
            isEditMode={isEditMode}
            canEdit={canEdit}
            canDelete={canDelete}
            onPreviewClick={handlePreviewOpen}
            onEditClick={handleEdit}
            onDeleteClick={handleDelete}
          />
        </Box>

        <Dialog
          open={previewOpen}
          onClose={handlePreviewClose}
          fullWidth
          fullScreen={previewFullscreen}
          maxWidth={previewFullscreen ? false : 'lg'}
          PaperProps={{ sx: { borderRadius: previewFullscreen ? 0 : 3, overflow: 'hidden' } }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderBottom: '1px solid divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.25rem' }}>
                  Preview da Etapa: {stage.name}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mt: 0.25 }}
                >
                  Visualização com dados simulados • {componentsCount}{' '}
                  {componentsCount === 1 ? 'componente' : 'componentes'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{ color: 'primary.main' }}
                >
                  {previewFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <IconButton onClick={handlePreviewClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                height: previewFullscreen ? 'calc(100vh - 80px)' : 'auto',
                overflow: 'auto'
              }}
            >
              {sortedComponents.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {sortedComponents.map((comp, index) => (
                    <ComponentRenderer
                      key={comp.key}
                      component={comp}
                      index={index}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary' }}
                  >
                    Nenhum componente adicionado nesta etapa
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

StageCard.displayName = 'StageCard';
