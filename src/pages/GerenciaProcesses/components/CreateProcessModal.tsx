import {
  Category as CategoryIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { CreateProcessDto, Department, Folder } from '@/globals/types';
import { useActiveDepartment, useDepartments, useFlowModels } from '@/hooks';
import 'dayjs/locale/pt-br';

// Funções auxiliares para formatação monetária brasileira
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const parseCurrency = (value: string): number | undefined => {
  if (!value || value.trim() === '') return undefined;
  // Remove R$, espaços, pontos (separadores de milhar) e converte vírgula para ponto
  const cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '') // Remove pontos (separadores de milhar)
    .replace(',', '.'); // Converte vírgula para ponto decimal
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) || parsed < 0 ? undefined : parsed;
};

// Função para formatar durante a digitação (aceita apenas números)
const formatCurrencyInput = (value: string): string => {
  if (!value || value.trim() === '') return '';

  // Remove tudo exceto números
  const numbersOnly = value.replace(/\D/g, '');
  if (numbersOnly === '') return '';

  // Converte para número (centavos)
  const number = parseFloat(numbersOnly) / 100;
  return formatCurrency(number);
};

interface CreateProcessModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateProcessDto) => void;
  loading?: boolean;
  folders: Folder[];
}

export const CreateProcessModal = ({ open, onClose, onSave, loading = false, folders }: CreateProcessModalProps) => {
  const { fetchFlowModels } = useFlowModels();
  const { activeDepartment } = useActiveDepartment();

  // Buscar modelos de fluxo ativos quando o modal abrir
  const { data: flowModels = [], isLoading: flowModelsLoading } = useQuery({
    queryKey: ['fetchFlowModels', 'active'],
    queryFn: () => fetchFlowModels(true), // Buscar apenas modelos ativos
    enabled: open, // Só buscar quando o modal estiver aberto
    refetchOnWindowFocus: false
  });

  const [formData, setFormData] = useState<
    Partial<CreateProcessDto> & { dueDate?: Dayjs; estimatedValueFormatted?: string }
  >({
    processNumber: '',
    object: '',
    folderId: '',
    priority: 'Média',
    dueDate: undefined,
    workflowModelId: '',
    modality: '',
    estimatedValue: undefined,
    estimatedValueFormatted: '',
    participatingDepartments: []
  });

  // Buscar departamentos quando o modal abrir
  const { fetchDepartments } = useDepartments();
  const { data: departmentsData } = useQuery({
    queryKey: ['fetchDepartments', 'all'],
    queryFn: async () => {
      // Buscar todos os departamentos (usando um limite alto)
      return await fetchDepartments(1, 100, '');
    },
    enabled: open
  });

  // Filtrar a gerência ativa da lista de departamentos disponíveis
  const availableDepartments = useMemo(() => {
    if (!departmentsData?.departments) return [];
    if (!activeDepartment?._id) return departmentsData.departments;

    // Remover a gerência ativa da lista
    return departmentsData.departments.filter((dept) => dept._id !== activeDepartment._id);
  }, [departmentsData?.departments, activeDepartment?._id]);

  useEffect(() => {
    if (open) {
      setFormData({
        processNumber: '',
        object: '',
        folderId: folders[0]?._id || '',
        priority: 'Média',
        dueDate: undefined,
        workflowModelId: '',
        modality: '',
        estimatedValue: undefined,
        estimatedValueFormatted: '',
        participatingDepartments: []
      });
    }
  }, [open, folders]);

  const handleSave = () => {
    if (!formData.processNumber || !formData.object || !formData.folderId || !formData.priority || !formData.dueDate) {
      return;
    }

    if (!activeDepartment?._id) {
      console.error('Departamento ativo não encontrado');
      return;
    }

    // Converter valor formatado para número
    const estimatedValue = formData.estimatedValueFormatted
      ? parseCurrency(formData.estimatedValueFormatted)
      : undefined;

    // Preparar dados conforme CreateProcessDto da API
    const data: CreateProcessDto = {
      processNumber: formData.processNumber.trim(),
      object: formData.object.trim(),
      folderId: formData.folderId,
      priority: formData.priority,
      dueDate: formData.dueDate.format('YYYY-MM-DD'),
      creatorDepartment: activeDepartment._id,
      // Campos opcionais - só enviar se tiver valor
      ...(formData.workflowModelId?.trim() ? { workflowModelId: formData.workflowModelId.trim() } : {}),
      ...(formData.modality?.trim() ? { modality: formData.modality.trim() } : {}),
      ...(estimatedValue !== undefined && estimatedValue !== null && estimatedValue >= 0
        ? { estimatedValue: Number(estimatedValue) }
        : {}),
      ...(formData.participatingDepartments && formData.participatingDepartments.length > 0
        ? { participatingDepartments: formData.participatingDepartments }
        : {})
    };

    onSave(data);
  };

  const handleClose = () => {
    setFormData({
      processNumber: '',
      object: '',
      folderId: '',
      priority: 'Média',
      dueDate: undefined,
      workflowModelId: '',
      modality: '',
      estimatedValue: undefined,
      estimatedValueFormatted: '',
      participatingDepartments: []
    });
    onClose();
  };

  const isFormValid =
    formData.processNumber && formData.object && formData.folderId && formData.priority && formData.dueDate;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: 3,
          pt: 3,
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            Novo Processo
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              mt: { xs: 0.5, sm: 0.5 },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            Preencha os dados para criar um novo processo.
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size='small'
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'grey.50'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 6, sm: 7, md: 8 }, pb: 2 }}>
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale='pt-br'
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Identificação */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5, mt: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'primary.main',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Identificação
                </Typography>
              </Box>

              {/* Número do Processo */}
              <Box>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                >
                  Número do Processo
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Ex: 001/2025'
                  value={formData.processNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, processNumber: e.target.value }))}
                  required
                  inputProps={{ maxLength: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Box>

              {/* Objeto */}
              <Box>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                >
                  Objeto da Contratação
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Ex: Aquisição de computadores'
                  value={formData.object}
                  onChange={(e) => setFormData((prev) => ({ ...prev, object: e.target.value }))}
                  required
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Classificação */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'primary.main',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Classificação
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Modalidade */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Modalidade da Licitação
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.modality || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, modality: e.target.value }))}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <MenuItem value=''>Selecione</MenuItem>
                      <MenuItem value='Concorrência'>Concorrência</MenuItem>
                      <MenuItem value='Dispensa de Licitação'>Dispensa de Licitação</MenuItem>
                      <MenuItem value='Inexigibilidade'>Inexigibilidade</MenuItem>
                      <MenuItem value='Pregão Eletrônico'>Pregão Eletrônico</MenuItem>
                      <MenuItem value='Pregão Presencial'>Pregão Presencial</MenuItem>
                      <MenuItem value='Tomada de Preços'>Tomada de Preços</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Prioridade */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Prioridade do Processo
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.priority || 'Média'}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, priority: e.target.value as 'Baixa' | 'Média' | 'Alta' }))
                      }
                      required
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <MenuItem value='Baixa'>Baixa</MenuItem>
                      <MenuItem value='Média'>Média</MenuItem>
                      <MenuItem value='Alta'>Alta</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Organização */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FolderIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'primary.main',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Organização
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Pasta */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Pasta de Destino do Processo
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.folderId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, folderId: e.target.value }))}
                      required
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider'
                        }
                      }}
                    >
                      {folders.map((folder) => (
                        <MenuItem
                          key={folder._id}
                          value={folder._id}
                        >
                          {folder.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Modelo de Fluxo */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Modelo de Fluxo
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.workflowModelId || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, workflowModelId: e.target.value }))}
                      displayEmpty
                      disabled={flowModelsLoading}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <MenuItem value=''>Selecione</MenuItem>
                      {flowModels.map((model) => (
                        <MenuItem
                          key={model._id}
                          value={model._id}
                        >
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Gerencias Participantes */}
              <Box>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                >
                  Gerencias Participantes
                </Typography>
                <FormControl fullWidth>
                  <Select
                    multiple
                    value={formData.participatingDepartments || []}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        participatingDepartments: typeof value === 'string' ? value.split(',') : value
                      }));
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected || selected.length === 0) {
                        return (
                          <Typography sx={{ color: 'text.secondary' }}>Selecione as gerencias participantes</Typography>
                        );
                      }
                      const selectedNames = selected
                        .map((id) => availableDepartments.find((dept) => dept._id === id)?.department_name)
                        .filter(Boolean)
                        .join(', ');
                      return selectedNames || 'Selecionado(s)';
                    }}
                    sx={{
                      borderRadius: 2,
                      minHeight: 42,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {availableDepartments.map((department: Department) => (
                      <MenuItem
                        key={department._id}
                        value={department._id}
                      >
                        {department.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Informações Complementares */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <InfoIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </Box>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'primary.main',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Informações Complementares
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Valor Estimado */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Valor Estimado da Contratação (R$)
                  </Typography>
                  <TextField
                    fullWidth
                    type='text'
                    placeholder='Ex: R$ 1.250.000,00'
                    value={formData.estimatedValueFormatted || ''}
                    onChange={(e) => {
                      const inputValue = e.target.value;

                      // Se estiver vazio, limpa o campo
                      if (inputValue.trim() === '') {
                        setFormData((prev) => ({
                          ...prev,
                          estimatedValueFormatted: '',
                          estimatedValue: undefined
                        }));
                        return;
                      }

                      // Formata automaticamente enquanto digita (aceita apenas números)
                      const formatted = formatCurrencyInput(inputValue);
                      const parsed = parseCurrency(formatted);

                      setFormData((prev) => ({
                        ...prev,
                        estimatedValueFormatted: formatted,
                        estimatedValue: parsed
                      }));
                    }}
                    onBlur={(e) => {
                      // Ao perder o foco, garante formatação correta
                      const parsed = parseCurrency(e.target.value);
                      if (parsed !== undefined && parsed >= 0) {
                        const formatted = formatCurrency(parsed);
                        setFormData((prev) => ({
                          ...prev,
                          estimatedValueFormatted: formatted,
                          estimatedValue: parsed
                        }));
                      } else if (e.target.value.trim() === '') {
                        setFormData((prev) => ({
                          ...prev,
                          estimatedValueFormatted: '',
                          estimatedValue: undefined
                        }));
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Box>

                {/* Prazo Final */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
                  >
                    Prazo Final Estimado
                  </Typography>
                  <DatePicker
                    value={formData.dueDate || null}
                    onChange={(newValue: Dayjs | null) => {
                      setFormData(
                        (prev) =>
                          ({
                            ...prev,
                            dueDate: newValue ?? undefined
                          }) as Partial<CreateProcessDto> & { dueDate?: Dayjs; estimatedValueFormatted?: string }
                      );
                    }}
                    format='DD/MM/YYYY'
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        placeholder: 'DD/MM/YYYY',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Botões */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                backgroundColor: 'grey.50',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'flex-end',
                alignItems: 'stretch',
                gap: { xs: 1.5, sm: 1 }
              }}
            >
              <Button
                onClick={handleClose}
                variant='outlined'
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: 'divider',
                  color: 'text.primary',
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1.125, sm: 1.25 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: 'divider',
                    backgroundColor: 'grey.50'
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                variant='contained'
                disabled={!isFormValid || loading}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'background.paper',
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 1.125, sm: 1.25 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '&:disabled': {
                    backgroundColor: 'action.disabledBackground',
                    color: 'text.secondary'
                  }
                }}
              >
                {loading ? 'Criando...' : 'Criar Processo'}
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};
