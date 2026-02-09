import { Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { ComponentType, FlowModelComponent } from '@/hooks/useFlowModels';

type AddComponentModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (component: FlowModelComponent) => void;
  existingComponents: FlowModelComponent[];
  editingComponent?: FlowModelComponent | null;
};

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: 'SIGNATURE', label: 'Assinatura Eletrônica' },
  { value: 'FORM', label: 'Formulário' },
  { value: 'FILES_MANAGEMENT', label: 'Gerenciar Arquivos' },
  { value: 'COMMENTS', label: 'Comentários' },
  { value: 'APPROVAL', label: 'Aprovação' },
  { value: 'STAGE_PANEL', label: 'Painel de Status' },
  { value: 'TIMELINE', label: 'Linha do Tempo' },
  { value: 'FILE_VIEWER', label: 'Visualizador de Arquivos' }
];

export const AddComponentModal = ({
  open,
  onClose,
  onAdd,
  existingComponents,
  editingComponent
}: AddComponentModalProps) => {
  const [type, setType] = useState<ComponentType>('FORM');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const hasFilesManagement = existingComponents.some((c) => c.type === 'FILES_MANAGEMENT');
  const isEditMode = !!editingComponent;

  useEffect(() => {
    if (open && editingComponent) {
      setType(editingComponent.type);
      setLabel(editingComponent.label);
      setDescription(editingComponent.description || '');
      setRequired(editingComponent.required || false);
    } else if (open && !editingComponent) {
      setType('FORM');
      setLabel('');
      setDescription('');
      setRequired(false);
    }
    setShowAlert(false);
  }, [open, editingComponent]);

  const handleAdd = () => {
    if (!label.trim()) return;

    if (type === 'APPROVAL' && !hasFilesManagement && !isEditMode) {
      setShowAlert(true);
      return;
    }

    // Verifica se já existe um componente do mesmo tipo (exceto no modo de edição)
    if (!isEditMode && existingComponents.some((c) => c.type === type)) {
      setShowAlert(true);
      return;
    }

    if (isEditMode && editingComponent) {
      onAdd({
        ...editingComponent,
        label: label.trim(),
        description: description.trim() || undefined,
        required
      });
    } else {
      const nextOrder = existingComponents.length > 0 ? Math.max(...existingComponents.map((c) => c.order)) + 1 : 1;
      onAdd({
        order: nextOrder,
        type,
        key: `${type.toLowerCase()}_${Date.now()}`,
        label: label.trim(),
        description: description.trim() || undefined,
        required,
        config: {},
        visibilityRoles: [],
        editableRoles: [],
        lockedAfterCompletion: false
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setType('FORM');
    setLabel('');
    setDescription('');
    setRequired(false);
    setShowAlert(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,.22)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexShrink: 0,
            borderBottom: '1px solid divider'
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.2 }}>
              {isEditMode ? 'Editar Componente' : 'Adicionar Componente'}
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', mt: 0.5 }}
            >
              {isEditMode ? 'Modifique as configurações do componente' : 'Selecione o tipo de componente e configure'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ width: 40, height: 40, color: 'text.secondary' }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, py: 2, flex: 1, overflow: 'auto' }}>
          {showAlert && (
            <Alert
              severity='warning'
              icon={<WarningIcon />}
              onClose={() => setShowAlert(false)}
              sx={{ mb: 2 }}
            >
              {type === 'APPROVAL' && !hasFilesManagement
                ? 'Para adicionar o componente de Aprovação, você precisa primeiro adicionar o componente de Gerenciar Arquivos.'
                : 'Já existe um componente deste tipo nesta etapa. Não é possível adicionar componentes duplicados.'}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label='Tipo de Componente'
              value={type}
              onChange={(e) => setType(e.target.value as ComponentType)}
              fullWidth
              required
              disabled={isEditMode}
              helperText={isEditMode ? 'O tipo não pode ser alterado após a criação' : undefined}
            >
              {COMPONENT_TYPES.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label='Nome do Componente'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              fullWidth
              required
              placeholder='Ex: Assinatura do Responsável'
            />
            <TextField
              label='Descrição (opcional)'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder='Descreva o propósito deste componente'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                />
              }
              label='Campo obrigatório'
            />
          </Box>
        </Box>

        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.25,
            bgcolor: 'grey.50',
            borderTop: '1px solid divider',
            flexShrink: 0
          }}
        >
          <Button
            onClick={handleClose}
            variant='outlined'
            sx={{
              textTransform: 'none',
              borderRadius: 999,
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 800,
              px: 2.5,
              '&:hover': { borderColor: 'grey.300', backgroundColor: 'background.paper' }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            variant='contained'
            disabled={!label.trim()}
            sx={{
              textTransform: 'none',
              borderRadius: 999,
              backgroundColor: 'primary.main',
              fontWeight: 900,
              px: 3,
              boxShadow: 'none',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&:disabled': { backgroundColor: 'divider', color: 'text.disabled' }
            }}
          >
            {isEditMode ? 'Salvar' : 'Adicionar'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
