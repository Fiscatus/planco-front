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
import { 
  Close as CloseIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Folder as FolderIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { CreateProcessDto, Folder } from '@/globals/types';
import { useState, useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';

// Funções auxiliares para formatação monetária brasileira
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
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
  return isNaN(parsed) || parsed < 0 ? undefined : parsed;
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

export const CreateProcessModal = ({
  open,
  onClose,
  onSave,
  loading = false,
  folders
}: CreateProcessModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateProcessDto> & { dueDate?: Dayjs; estimatedValueFormatted?: string }>({
    processNumber: '',
    object: '',
    folderId: '',
    priority: 'Média',
    dueDate: undefined,
    currentStage: '',
    modality: '',
    estimatedValue: undefined,
    estimatedValueFormatted: ''
  });

  useEffect(() => {
    if (open) {
      setFormData({
        processNumber: '',
        object: '',
        folderId: folders[0]?._id || '',
        priority: 'Média',
        dueDate: undefined,
        currentStage: '',
        modality: '',
        estimatedValue: undefined,
        estimatedValueFormatted: ''
      });
    }
  }, [open, folders]);

  const handleSave = () => {
    if (!formData.processNumber || !formData.object || !formData.folderId || !formData.priority || !formData.dueDate) {
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
      // Campos opcionais - só enviar se tiver valor
      ...(formData.currentStage && formData.currentStage.trim() ? { currentStage: formData.currentStage.trim() } : {}),
      ...(formData.modality && formData.modality.trim() ? { modality: formData.modality.trim() } : {}),
      ...(estimatedValue !== undefined && estimatedValue !== null && estimatedValue >= 0 
        ? { estimatedValue: Number(estimatedValue) } : {})
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
      currentStage: '',
      modality: '',
      estimatedValue: undefined,
      estimatedValueFormatted: ''
    });
    onClose();
  };

  const isFormValid = formData.processNumber && formData.object && formData.folderId && formData.priority && formData.dueDate;

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
          borderBottom: '1px solid #E4E6EB',
          gap: 1
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='h6' sx={{ fontWeight: 700, color: '#212121' }}>
            Novo Processo
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: '#64748b',
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
            color: '#8A8D91',
            '&:hover': {
              backgroundColor: '#F8F9FA'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 6, sm: 7, md: 8 }, pb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='pt-br'>
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
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                </Box>
                <Typography 
                  variant='subtitle2' 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9375rem',
                    color: '#1877F2',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Identificação
                </Typography>
              </Box>
              
              {/* Número do Processo */}
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
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
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
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
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                </Box>
                <Typography 
                  variant='subtitle2' 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9375rem',
                    color: '#1877F2',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Classificação
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Modalidade */}
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
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
                          borderColor: '#E4E6EB'
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
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
                    Prioridade do Processo
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.priority || 'Média'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as 'Baixa' | 'Média' | 'Alta' }))}
                      required
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E4E6EB'
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
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FolderIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                </Box>
                <Typography 
                  variant='subtitle2' 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9375rem',
                    color: '#1877F2',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Organização
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Pasta */}
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
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
                          borderColor: '#E4E6EB'
                        }
                      }}
                    >
                      {folders.map((folder) => (
                        <MenuItem key={folder._id} value={folder._id}>
                          {folder.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Etapa Atual */}
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
                    Fase Atual do Processo
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={formData.currentStage || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currentStage: e.target.value }))}
                      displayEmpty
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E4E6EB'
                        }
                      }}
                    >
                      <MenuItem value=''>Selecione</MenuItem>
                      <MenuItem value='Elaboração do DFD'>Elaboração do DFD</MenuItem>
                      <MenuItem value='Aprovação do DFD'>Aprovação do DFD</MenuItem>
                      <MenuItem value='Elaboração do ETP'>Elaboração do ETP</MenuItem>
                      <MenuItem value='Elaboração do Termo de Referência (TR)'>Elaboração do Termo de Referência (TR)</MenuItem>
                      <MenuItem value='Publicação do Edital'>Publicação do Edital</MenuItem>
                      <MenuItem value='Abertura de Propostas'>Abertura de Propostas</MenuItem>
                      <MenuItem value='Análise de Propostas'>Análise de Propostas</MenuItem>
                      <MenuItem value='Homologação'>Homologação</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
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
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <InfoIcon sx={{ fontSize: 18, color: '#1877F2' }} />
                </Box>
                <Typography 
                  variant='subtitle2' 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: '0.9375rem',
                    color: '#1877F2',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Informações Complementares
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                {/* Valor Estimado */}
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
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
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1, color: '#212121' }}>
                    Prazo Final Estimado
                  </Typography>
                  <DatePicker
                    value={formData.dueDate || null}
                    onChange={(newValue: Dayjs | null) => {
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: newValue ?? undefined
                      } as Partial<CreateProcessDto> & { dueDate?: Dayjs; estimatedValueFormatted?: string }));
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
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
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
                  borderColor: '#E4E6EB',
                  color: '#212121',
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1.125, sm: 1.25 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    backgroundColor: '#F8F9FA'
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
                  backgroundColor: '#1877F2',
                  color: '#FFFFFF',
                  px: { xs: 2.5, sm: 4 },
                  py: { xs: 1.125, sm: 1.25 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  fontWeight: 600,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: '#166fe5'
                  },
                  '&:disabled': {
                    backgroundColor: '#E4E6EB',
                    color: '#8A8D91'
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

