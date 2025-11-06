import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  DriveFileMove as DriveFileMoveIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  SwapVert as SwapVertIcon
} from '@mui/icons-material';
import type { Folder, FilterProcessesDto, MoveProcessesDto, Process, UpdateFolderDto } from '@/globals/types';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce, useFavoriteFolders } from '@/hooks';
import { useProcesses } from '@/hooks/useProcesses';

interface ManageFolderModalProps {
  open: boolean;
  onClose: () => void;
  folder: Folder | null;
  availableFolders: Folder[];
  onEdit: (data: UpdateFolderDto) => Promise<void>;
  onDelete: () => Promise<void>;
  onMoveProcesses: (data: MoveProcessesDto) => Promise<void>;
  editingLoading?: boolean;
  deletingLoading?: boolean;
  movingLoading?: boolean;
  loadingFolders?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`manage-folder-tabpanel-${index}`}
      aria-labelledby={`manage-folder-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 2.5, md: 3 } }}>{children}</Box>}
    </div>
  );
}

export const ManageFolderModal = ({
  open,
  onClose,
  folder,
  availableFolders,
  onEdit,
  onDelete,
  onMoveProcesses,
  editingLoading = false,
  deletingLoading = false,
  movingLoading = false,
  loadingFolders = false
}: ManageFolderModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { fetchProcessesByFolder } = useProcesses();
  const { isFavorite } = useFavoriteFolders();
  const [currentTab, setCurrentTab] = useState(0);
  const [folderForm, setFolderForm] = useState<Partial<UpdateFolderDto> & { year?: string | number }>({
    name: '',
    observations: '',
    year: undefined
  });
  
  // Estados para mover processos
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [targetFolder, setTargetFolder] = useState('');
  const [processSortOrder, setProcessSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);

  // Inicializar formulário quando o modal abrir ou pasta mudar
  useEffect(() => {
    if (open && folder) {
      setFolderForm({
        name: folder.name || '',
        observations: folder.description || folder.observations || '',
        year: folder.year ? Number(folder.year) : undefined
      });
    }
  }, [open, folder]);

  // Carregar processos quando a aba de mover processos estiver ativa
  useEffect(() => {
    if (open && folder?._id && currentTab === 1) {
      loadProcesses();
    }
  }, [open, folder?._id, currentTab]);

  // Recarregar processos quando o termo de busca mudar
  useEffect(() => {
    if (open && folder?._id && currentTab === 1) {
      loadProcesses();
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProcesses = async () => {
    if (!folder?._id) return;
    setLoadingProcesses(true);
    try {
      setProcesses([]); // Limpa os processos existentes antes de carregar
      const filters: FilterProcessesDto = {};
      // Se houver busca, buscar tanto por processNumber quanto por object
      if (debouncedSearch) {
        filters.processNumber = debouncedSearch;
        filters.object = debouncedSearch;
      }
      const result = await fetchProcessesByFolder(folder._id, filters);
      setProcesses(result.processes);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      setProcesses([]);
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleProcessSortToggle = () => {
    setProcessSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedProcesses = [...processes].sort((a, b) => {
    const aValue = a.processNumber || '';
    const bValue = b.processNumber || '';
    
    if (processSortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleToggleProcess = (processId: string) => {
    setSelectedProcesses((prev) =>
      prev.includes(processId)
        ? prev.filter((id) => id !== processId)
        : [...prev, processId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProcesses.length === sortedProcesses.length) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(sortedProcesses.map((p) => p._id));
    }
  };

  const handleMoveProcesses = async () => {
    if (!targetFolder || selectedProcesses.length === 0) return;

    try {
      await onMoveProcesses({
        processIds: selectedProcesses,
        targetFolderId: targetFolder
      });
      
      // Remove os processos movidos do estado local imediatamente
      const remainingProcesses = processes.filter(
        process => !selectedProcesses.includes(process._id)
      );
      setProcesses(remainingProcesses);
      
      // Limpa os estados de seleção e busca
      setSelectedProcesses([]);
      setTargetFolder('');
      setSearchTerm('');
      setLoadingProcesses(false);
    } catch (error) {
      console.error('Erro ao mover processos:', error);
      // Em caso de erro, recarrega a lista para garantir sincronização
      loadProcesses();
    }
  };

  const handleDeleteFolderClick = () => {
    // Abrir modal de confirmação
    setDeleteConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete();
      setDeleteConfirmationModalOpen(false);
      handleClose();
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationModalOpen(false);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setDeleteConfirmationModalOpen(false); // Fechar modal de confirmação ao trocar de aba
  };

  const handleClose = () => {
    setCurrentTab(0);
    setFolderForm({
      name: '',
      observations: '',
      year: undefined
    });
    setSearchTerm('');
    setSelectedProcesses([]);
    setTargetFolder('');
    setProcesses([]);
    setDeleteConfirmationModalOpen(false);
    onClose();
  };

  const handleSaveEdit = useCallback(async () => {
    if (!folderForm.name?.trim()) {
      return;
    }

    try {
      const dataToSave: UpdateFolderDto = {
        name: folderForm.name,
        ...(folderForm.observations && folderForm.observations.trim() ? { observations: folderForm.observations.trim() } : {}),
        ...(folderForm.year && folderForm.year.toString().trim() ? { year: Number(folderForm.year) } : {})
      };
      await onEdit(dataToSave);
    } catch (error) {
      console.error('Erro ao editar pasta:', error);
    }
  }, [folderForm, onEdit]);

  if (!folder) return null;

  const isProtected = folder.isDefault || folder.isPermanent;
  const isFolderFavorite = folder._id ? isFavorite(folder._id) : false;

  // Texto descritivo da ferramenta baseado na aba ativa
  const getToolDescription = () => {
    switch (currentTab) {
      case 0:
        return 'Altere o nome, ano ou descrição desta pasta para melhor identificação.';
      case 1:
        return 'Selecione primeiro a pasta de destino e, em seguida, escolha os processos que deseja mover. A transferência será realizada automaticamente.';
      case 2:
        return 'Exclua esta pasta permanentemente. Todos os processos serão automaticamente movidos para a Pasta Planco. Esta ação não pode ser desfeita.';
      default:
        return '';
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            margin: { xs: 1, sm: 2 },
            maxWidth: { xs: 'calc(100% - 16px)', sm: '600px', md: '900px' },
            width: '100%'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header - 3 faixas organizadas */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5, md: 3 },
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            {/* Faixa 1: Título principal + botão fechar */}
            <Box
              sx={{
              display: 'flex',
              justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: { xs: 1, sm: 1.5 },
                gap: 1
            }}
          >
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
                  lineHeight: { xs: 1.3, sm: 1.2 },
                  flex: 1,
                  minWidth: 0
                }}
              >
                Gerenciar Pasta
              </Typography>
              <IconButton
                onClick={handleClose}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  color: '#64748b',
                  backgroundColor: 'transparent',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>

            {/* Faixa 2: Identificação da pasta (nome, ano, status) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                flexWrap: 'wrap',
                mb: { xs: 1, sm: 1.5 }
              }}
            >
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  flex: { xs: '1 1 100%', sm: '0 1 auto' },
                  minWidth: 0
                }}
              >
                {folder.name}
              </Typography>
              {/* Chips de status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.75 }, flexWrap: 'wrap' }}>
                {folder.isDefault && (
                  <Chip
                    label='Pasta Padrão'
                    size='small'
                    sx={{
                      height: { xs: 22, sm: 24 },
                      fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                      fontWeight: 600,
                      backgroundColor: '#dbeafe',
                      color: '#1877F2',
                      border: '1px solid #bfdbfe',
                      '& .MuiChip-label': {
                        px: { xs: 1, sm: 1.25 },
                        py: 0
                      }
                    }}
                  />
                )}
                {isFolderFavorite && !folder.isPermanent && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: '#f59e0b' }} />}
                    label='Favorita'
                    size='small'
              sx={{
                      height: { xs: 22, sm: 24 },
                      fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                      fontWeight: 600,
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      '& .MuiChip-icon': {
                        marginLeft: { xs: '4px', sm: '6px' }
                      },
                      '& .MuiChip-label': {
                        px: { xs: 1, sm: 1.25 },
                        py: 0
                      }
                    }}
                  />
                )}
            </Box>
            </Box>

            {/* Faixa 3: Descrição da ferramenta (dinâmica por aba) */}
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                lineHeight: { xs: 1.4, sm: 1.5 },
                fontWeight: 400
              }}
            >
              {getToolDescription()}
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 2, sm: 3, md: 4 }, overflowX: 'auto' }}>
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              variant='scrollable'
              scrollButtons='auto'
              sx={{
                minHeight: { xs: 48, sm: 56 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                  minHeight: { xs: 48, sm: 56 },
                  px: { xs: 1.5, sm: 2 },
                  '&.Mui-selected': {
                    color: '#1877F2'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(24, 119, 242, 0.04)'
                  }
                },
                '& .MuiTab-iconWrapper': {
                  fontSize: { xs: 18, sm: 20 }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1877F2',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTabs-scrollButtons': {
                  width: { xs: 32, sm: 40 },
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                }
              }}
            >
              <Tab
                label='Editar Pasta'
                icon={<EditIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition='start'
                disabled={isProtected}
              />
              <Tab
                label='Mover Processos'
                icon={<DriveFileMoveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition='start'
              />
              <Tab
                label='Excluir Pasta'
                icon={<DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition='start'
                disabled={isProtected}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box>
            <TabPanel value={currentTab} index={0}>
              {/* Formulário de edição */}
              {isProtected ? (
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 }
                  }}
                >
                  <WarningIcon sx={{ color: '#92400e', fontSize: { xs: 18, sm: 20 }, flexShrink: 0 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#92400e',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.4, sm: 1.5 }
                    }}
                  >
                    Esta pasta não pode ser editada por ser a pasta padrão do sistema.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                  {/* Nome da pasta */}
                  <Box>
                    <Typography
                      variant='body2'
                  sx={{
                    fontWeight: 600,
                        color: '#0f172a',
                        mb: { xs: 0.75, sm: 1 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                  }}
                >
                      Nome da Pasta
                </Typography>
                    <TextField
                      fullWidth
                      placeholder='Ex: Processos 2025'
                      value={folderForm.name || ''}
                      onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          height: { xs: 44, sm: 48 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1'
                            },
                            backgroundColor: '#ffffff'
                          },
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1877F2',
                              boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                            },
                            backgroundColor: '#ffffff'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  </Box>

                  {/* Ano */}
                  <Box>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                        color: '#0f172a',
                        mb: { xs: 0.75, sm: 1 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                  }}
                >
                      Ano
                </Typography>
                    <TextField
                      fullWidth
                      type='number'
                      placeholder='Ex: 2025'
                      value={folderForm.year || ''}
                      onChange={(e) => {
                        const yearValue = e.target.value;
                        setFolderForm((prev) => ({ ...prev, year: yearValue ? yearValue : undefined }));
                      }}
                      variant='outlined'
                      inputProps={{ min: 2000, max: new Date().getFullYear() }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          height: { xs: 44, sm: 48 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1'
                            },
                            backgroundColor: '#ffffff'
                          },
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1877F2',
                              boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                            },
                            backgroundColor: '#ffffff'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  </Box>

                  {/* Descrição */}
                  <Box>
                <Typography
                  variant='body2'
                  sx={{
                        fontWeight: 600,
                        color: '#0f172a',
                        mb: { xs: 0.75, sm: 1 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                      }}
                    >
                      Descrição
                </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder='Descreva o propósito desta pasta...'
                      value={folderForm.observations || ''}
                      onChange={(e) => setFolderForm((prev) => ({ ...prev, observations: e.target.value }))}
                      variant='outlined'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#ffffff',
                          borderRadius: 2,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1'
                            },
                            backgroundColor: '#ffffff'
                          },
                          '&.Mui-focused': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#1877F2',
                              boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                            },
                            backgroundColor: '#ffffff'
                          }
                        },
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          padding: { xs: '12px 14px', sm: '14px 16px' }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    />
                  </Box>

                  {/* Botões */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    justifyContent: 'flex-end', 
                    gap: { xs: 1.5, sm: 2 }, 
                    mt: 1, 
                    pt: 2, 
                    borderTop: '1px solid #e2e8f0' 
                  }}>
                <Button
                      onClick={handleClose}
                      disabled={editingLoading}
                      sx={{
                        px: { xs: 2.5, sm: 3 },
                        py: { xs: 1.125, sm: 1.25 },
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'none',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      Cancelar
                    </Button>
                <Button
                      onClick={handleSaveEdit}
                      disabled={editingLoading || !folderForm.name?.trim()}
                  variant='contained'
                  sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.125, sm: 1.25 },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 600,
                    backgroundColor: '#1877F2',
                    textTransform: 'none',
                    borderRadius: 2,
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                          backgroundColor: '#166fe5',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    '&:disabled': {
                          backgroundColor: '#9ca3af',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {editingLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                  </Box>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                {/* Seletor de pasta destino */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: { xs: 0.75, sm: 1 },
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                    }}
                  >
                    Pasta Destino
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={targetFolder}
                      onChange={(e) => setTargetFolder(e.target.value)}
                      displayEmpty
                      renderValue={(value) => {
                        if (!value) {
                          return (
                            <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                              {loadingFolders ? 'Carregando pastas...' : availableFolders.length === 0 ? 'Nenhuma pasta disponível' : 'Selecione a pasta destino...'}
                            </Typography>
                          );
                        }
                        const selectedFolder = availableFolders.find((f) => f._id === value);
                        if (!selectedFolder) return null;
                        const isPlanco = selectedFolder.name?.toLowerCase().includes('planco');
                        const folderIconColor = isPlanco ? '#1877F2' : '#fbbf24';
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            <FolderIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: folderIconColor }} />
                            <Typography sx={{ color: '#0f172a', fontSize: { xs: '0.8125rem', sm: '0.875rem' }, fontWeight: 400 }}>
                              {selectedFolder.name}
                            </Typography>
              </Box>
                        );
                      }}
                      sx={{
                        height: { xs: 44, sm: 48 },
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #e2e8f0',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiSelect-select': {
                          py: { xs: 1.125, sm: 1.25 },
                          px: { xs: 1.25, sm: 1.5 }
                        },
                        '& .MuiSelect-icon': {
                          fontSize: { xs: 20, sm: 24 }
                        }
                      }}
                    >
                      <MenuItem 
                        value='' 
                        disabled
                      >
                        {loadingFolders ? 'Carregando pastas...' : availableFolders.length === 0 ? 'Nenhuma pasta disponível' : 'Selecione a pasta destino...'}
                      </MenuItem>
                      {availableFolders.map((f) => {
                        const isPlanco = f.name?.toLowerCase().includes('planco');
                        const folderIconColor = isPlanco ? '#1877F2' : '#fbbf24';
                        
                        return (
                          <MenuItem 
                            key={f._id} 
                            value={f._id}
                            sx={{
                              '&.Mui-selected': {
                                backgroundColor: '#f1f5f9',
                                '&:hover': {
                                  backgroundColor: '#f1f5f9'
                                }
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, width: '100%' }}>
                              <FolderIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: folderIconColor, flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                                  variant='body2'
                                  sx={{
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {f.name} {f.year ? `(${f.year})` : ''}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>

                {/* Processos */}
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    mb: { xs: 1, sm: 1.5 },
                    gap: { xs: 0.5, sm: 0 }
                  }}>
                    <Typography
                      variant='body2'
                  sx={{
                    fontWeight: 600,
                        color: '#0f172a',
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                  }}
                >
                      Processos
                </Typography>
                    {selectedProcesses.length > 0 && (
                <Typography
                  variant='body2'
                  sx={{
                          fontWeight: 500,
                          color: '#1877F2',
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                  }}
                >
                        {selectedProcesses.length} selecionado(s)
                </Typography>
                    )}
                  </Box>
                  
                  {/* Campo de busca */}
                  <TextField
                    fullWidth
                    placeholder='Buscar por número ou objeto do processo...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: { xs: 1, sm: 1.25 },
                            width: { xs: 18, sm: 20 },
                            height: { xs: 18, sm: 20 }
                          }}
                        >
                          <SearchIcon sx={{ color: '#94a3b8', fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
                        </Box>
                      )
                    }}
                    sx={{
                      mb: { xs: 1, sm: 1.5 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        height: { xs: 44, sm: 48 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #e2e8f0',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          }
                        },
                        '&.Mui-focused': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        }
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#9ca3af',
                        opacity: 1,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                  
                  {/* Tabela de processos */}
                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      maxHeight: { xs: 300, sm: 400 },
                      overflow: 'auto',
                      backgroundColor: '#ffffff',
                      '& .MuiTableHead-root': {
                        '& .MuiTableCell-root': {
                          bgcolor: '#f8fafc',
                          borderBottom: '1px solid #e2e8f0',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: '#f8fafc',
                            zIndex: -1
                          }
                        }
                      },
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#cbd5e1',
                        borderRadius: '4px'
                      }
                    }}
                  >
                    <Table stickyHeader sx={{ 
                        minWidth: { xs: 600, sm: 'auto' },
                        '& .MuiTableHead-root': {
                          bgcolor: '#f8fafc'
                        }
                      }}>
                      <TableHead sx={{
                        bgcolor: '#f8fafc',
                        '& .MuiTableRow-root': {
                          bgcolor: '#f8fafc'
                        }
                      }}>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell 
                            padding='checkbox' 
                            sx={{ 
                              bgcolor: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              py: { xs: 1, sm: 1.5 },
                              position: 'sticky',
                              left: 0,
                              zIndex: 10,
                              '&:before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                bgcolor: '#f8fafc',
                                zIndex: -1
                              }
                            }}
                          >
                            <Checkbox
                              indeterminate={selectedProcesses.length > 0 && selectedProcesses.length < sortedProcesses.length}
                              checked={sortedProcesses.length > 0 && selectedProcesses.length === sortedProcesses.length}
                              onChange={handleSelectAll}
                              size={isMobile ? 'small' : 'medium'}
                              sx={{
                                color: '#64748b',
                                '&.Mui-checked': {
                                  color: '#1877F2'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              bgcolor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              borderBottom: '1px solid #e2e8f0',
                              py: { xs: 1, sm: 1.5 },
                              position: 'sticky',
                              left: { xs: 48, sm: 58 },
                              zIndex: 10,
                              '&:before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                bgcolor: '#f8fafc',
                                zIndex: -1
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.75 } }}>
                              <Typography component='span' sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                                Processo
                              </Typography>
                              <Tooltip
                                title={processSortOrder === 'asc' ? 'Ordenar decrescente' : 'Ordenar crescente'}
                                arrow
                                placement='top'
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      backgroundColor: '#212121',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      fontSize: { xs: '11px', sm: '12px' },
                                      padding: { xs: '4px 8px', sm: '6px 12px' },
                                      borderRadius: '8px'
                                    }
                                  },
                                  arrow: {
                                    sx: {
                                      color: '#212121'
                                    }
                                  }
                                }}
                              >
                                <IconButton
                                  size='small'
                                  onClick={handleProcessSortToggle}
                                  sx={{
                                    p: { xs: 0.375, sm: 0.5 },
                                    borderRadius: '8px',
                                    flexShrink: 0,
                                    transition: 'all 200ms ease',
                                    '&:hover': {
                                      '& .sort-icon': {
                                        color: '#1877F2',
                                        transform: 'scale(1.1)'
                                      }
                                    },
                                    '&:focus': {
                                      outline: '2px solid rgba(24, 119, 242, 0.25)',
                                      outlineOffset: '2px'
                                    }
                                  }}
                                >
                                  <SwapVertIcon
                                    className='sort-icon'
                                    sx={{
                                      fontSize: { xs: '12px', sm: '14px' },
                                      color: '#8A8D91',
                                      transition: 'transform 200ms ease, color 200ms ease'
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              backgroundColor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              borderBottom: '1px solid #e2e8f0',
                              py: { xs: 1, sm: 1.5 }
                            }}
                          >
                            Objeto
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              backgroundColor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              borderBottom: '1px solid #e2e8f0',
                              py: { xs: 1, sm: 1.5 }
                            }}
                          >
                            Situação
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loadingProcesses ? (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                              Carregando processos...
                            </TableCell>
                          </TableRow>
                        ) : processes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                              Nenhum processo encontrado
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedProcesses.map((process) => (
                            <TableRow 
                              key={process._id}
                              sx={{
                                backgroundColor: '#ffffff',
                                '&:hover': {
                                  backgroundColor: '#f8fafc'
                                },
                                '&:last-child td': {
                                  borderBottom: 'none'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: '#ffffff',
                                  '&:hover': {
                                    backgroundColor: '#f8fafc'
                                  }
                                }
                              }}
                            >
                              <TableCell 
                                padding='checkbox' 
                                sx={{ 
                                  py: { xs: 1, sm: 1.5 },
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 5,
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                <Checkbox
                                  checked={selectedProcesses.includes(process._id)}
                                  onChange={() => handleToggleProcess(process._id)}
                                  size={isMobile ? 'small' : 'medium'}
                                  sx={{
                                    color: '#64748b',
                                    '&.Mui-checked': {
                                      color: '#1877F2'
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell 
                                sx={{ 
                                  py: { xs: 1, sm: 1.5 }, 
                                  color: '#0f172a', 
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                  position: 'sticky',
                                  left: { xs: 48, sm: 58 },
                                  zIndex: 5,
                                  backgroundColor: '#ffffff'
                                }}
                              >
                                {process.processNumber}
                              </TableCell>
                              <TableCell sx={{ py: { xs: 1, sm: 1.5 }, color: '#475569', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                                {process.object}
                              </TableCell>
                              <TableCell sx={{ py: { xs: 1, sm: 1.5 }, color: '#64748b', fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                                {process.status || 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Botões */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  justifyContent: 'flex-end', 
                  gap: { xs: 1.5, sm: 2 }, 
                  mt: 1, 
                  pt: 2, 
                  borderTop: '1px solid #e2e8f0' 
                }}>
                <Button
                    onClick={handleClose}
                    disabled={movingLoading}
                    sx={{
                      px: { xs: 2.5, sm: 3 },
                      py: { xs: 1.125, sm: 1.25 },
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'none',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: '#cbd5e1'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleMoveProcesses}
                    disabled={movingLoading || !targetFolder || selectedProcesses.length === 0}
                    variant='contained'
                    startIcon={<DriveFileMoveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    sx={{
                      px: { xs: 2.5, sm: 3 },
                      py: { xs: 1.125, sm: 1.25 },
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 600,
                      backgroundColor: '#1877F2',
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        backgroundColor: '#166fe5',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      },
                      '&:disabled': {
                        backgroundColor: '#9ca3af',
                        boxShadow: 'none'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {movingLoading ? 'Movendo...' : `Mover ${selectedProcesses.length} Processo(s)`}
                  </Button>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              {isProtected ? (
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 }
                  }}
                >
                  <WarningIcon sx={{ color: '#92400e', fontSize: { xs: 18, sm: 20 }, flexShrink: 0 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#92400e',
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.4, sm: 1.5 }
                    }}
                  >
                    Esta pasta não pode ser excluída por ser a pasta padrão do sistema.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Informações da pasta */}
                  <Box
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header do card */}
                    <Box
                      sx={{
                        backgroundColor: '#f8fafc',
                        p: 2.5,
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1.5, sm: 2 },
                        flexWrap: { xs: 'wrap', sm: 'nowrap' }
                      }}
                    >
                      {(() => {
                        const isPlanco = folder.name?.toLowerCase().includes('planco');
                        const folderIconColor = isPlanco ? '#1877F2' : '#fbbf24';
                        const folderBgColor = isPlanco ? '#dbeafe' : '#fef3c7';
                        
                        return (
                          <Box
                            sx={{
                              backgroundColor: folderBgColor,
                              borderRadius: 2,
                              p: { xs: 1.25, sm: 1.5 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: { xs: 48, sm: 56 },
                              height: { xs: 48, sm: 56 },
                              flexShrink: 0
                            }}
                          >
                            <FolderIcon
                              sx={{
                                fontSize: { xs: 24, sm: 28 },
                                color: folderIconColor
                              }}
                            />
                          </Box>
                        );
                      })()}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            lineHeight: 1.3,
                            wordBreak: 'break-word'
                          }}
                        >
                          {folder.name}
                        </Typography>
                        {folder.year && (
                          <Typography
                            variant='body2'
                            sx={{
                              color: '#64748b',
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                              mt: 0.5
                            }}
                          >
                            Ano: {folder.year}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Conteúdo do card */}
                    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                        {/* Descrição */}
                        {(folder.description || folder.observations) && (
                          <Box>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    mb: { xs: 0.75, sm: 1 }
                  }}
                >
                              Descrição
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                                color: '#475569',
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                lineHeight: { xs: 1.5, sm: 1.6 },
                                wordBreak: 'break-word'
                  }}
                >
                              {folder.description || folder.observations}
                </Typography>
                          </Box>
                        )}

                        {/* Informações adicionais */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: { xs: 2, sm: 2.5 },
                            pt: { xs: 2, sm: 2.5 },
                            borderTop: '1px solid #e2e8f0'
                          }}
                        >
                          {/* Quantidade de processos */}
                          {folder.processCount !== undefined && (
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                  mb: { xs: 0.5, sm: 0.75 }
                                }}
                              >
                                Processos
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                }}
                              >
                                {folder.processCount === 0
                                  ? 'Nenhum processo'
                                  : folder.processCount === 1
                                  ? '1 processo'
                                  : `${folder.processCount} processos`}
                              </Typography>
                            </Box>
                          )}

                          {/* Data de criação */}
                          {folder.createdAt && (
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                  mb: { xs: 0.5, sm: 0.75 }
                                }}
                              >
                                Criada em
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                }}
                              >
                                {new Date(folder.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          )}

                          {/* Data de atualização */}
                          {folder.updatedAt && folder.updatedAt !== folder.createdAt && (
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                  mb: { xs: 0.5, sm: 0.75 }
                                }}
                              >
                                Atualizada em
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }
                                }}
                              >
                                {new Date(folder.updatedAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Alert de aviso */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2,
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FCD34D'
                    }}
                  >
                    <WarningIcon
                      sx={{
                        color: '#92400E',
                        fontSize: 20,
                        mr: 1.5,
                        mt: 0.25,
                        flexShrink: 0
                      }}
                    />
                    <Box>
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#92400E',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          fontWeight: 600,
                          mb: 0.5
                        }}
                      >
                        Atenção: Esta ação não pode ser desfeita
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#92400E',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                          fontWeight: 400
                        }}
                      >
                        {folder.processCount !== undefined && folder.processCount !== null
                          ? `Todos os ${folder.processCount} processo${folder.processCount !== 1 ? 's' : ''} desta pasta serão automaticamente transferidos para a Pasta Planco após a exclusão.`
                          : 'Todos os processos desta pasta serão automaticamente transferidos para a Pasta Planco após a exclusão.'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Botões */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    justifyContent: 'flex-end', 
                    gap: { xs: 1.5, sm: 2 }, 
                    mt: 1, 
                    pt: 2, 
                    borderTop: '1px solid #e2e8f0' 
                  }}>
                <Button
                      onClick={handleClose}
                      disabled={deletingLoading}
                  sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.125, sm: 1.25 },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 600,
                        color: '#64748b',
                    textTransform: 'none',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                          backgroundColor: '#f8fafc',
                          borderColor: '#cbd5e1'
                    },
                        transition: 'all 0.2s ease-in-out'
                  }}
                >
                      Cancelar
                </Button>
                <Button
                      onClick={handleDeleteFolderClick}
                      disabled={deletingLoading}
                  variant='contained'
                      startIcon={<DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.125, sm: 1.25 },
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 600,
                    backgroundColor: '#DC2626',
                        textTransform: 'none',
                    borderRadius: 2,
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                          backgroundColor: '#B91C1C',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    },
                    '&:disabled': {
                          backgroundColor: '#9ca3af',
                          boxShadow: 'none'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {deletingLoading ? 'Excluindo...' : 'Excluir Pasta'}
                </Button>
              </Box>
                </Box>
              )}
            </TabPanel>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={deleteConfirmationModalOpen}
        onClose={handleCancelDelete}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            margin: { xs: 1, sm: 2 },
            maxWidth: { xs: 'calc(100% - 16px)', sm: '500px' },
            width: '100%'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: { xs: 2, sm: 3 },
              borderBottom: '1px solid #e2e8f0'
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: '#0f172a',
                lineHeight: { xs: 1.3, sm: 1.2 }
              }}
            >
              Excluir Pasta
            </Typography>
            <IconButton
              onClick={handleCancelDelete}
              size='small'
              sx={{
                color: '#64748b',
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                '&:hover': {
                  backgroundColor: '#f1f5f9'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Informativo de atenção */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                backgroundColor: '#FEF3C7',
                border: '1px solid #FCD34D',
                mb: { xs: 2, sm: 3 },
                gap: { xs: 1, sm: 1.5 }
              }}
            >
              <WarningIcon
                sx={{
                  color: '#92400E',
                  fontSize: { xs: 20, sm: 24 },
                  mt: 0.25,
                  flexShrink: 0
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#92400E',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.5, sm: 1.6 },
                    fontWeight: 700,
                    mb: { xs: 0.5, sm: 0.75 }
                  }}
                >
                  Atenção: Esta ação não pode ser desfeita
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#92400E',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: { xs: 1.5, sm: 1.6 },
                    fontWeight: 400,
                    wordBreak: 'break-word'
                  }}
                >
                  {folder?.processCount !== undefined && folder.processCount !== null
                    ? `Todos os ${folder.processCount} processo${folder.processCount !== 1 ? 's' : ''} desta pasta serão automaticamente transferidos para a Pasta Planco após a exclusão.`
                    : 'Todos os processos desta pasta serão automaticamente transferidos para a Pasta Planco após a exclusão.'}
                </Typography>
              </Box>
            </Box>

            {/* Informação sobre movimento dos processos */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                mb: { xs: 2, sm: 3 }
              }}
            >
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: '50%',
                  backgroundColor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <InfoIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: '#2563EB' }} />
              </Box>
              <Typography
                variant='body2'
                sx={{
                  color: '#1E40AF',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.5, sm: 1.6 },
                  fontWeight: 600,
                  wordBreak: 'break-word'
                }}
              >
                Os processos desta pasta não serão excluídos, serão movidos automaticamente para a Pasta Planco.
              </Typography>
            </Box>

            {/* Mensagem de confirmação */}
            <Typography
              variant='body1'
              sx={{
                color: '#0f172a',
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                lineHeight: { xs: 1.5, sm: 1.6 },
                textAlign: 'center',
                fontWeight: 500,
                mb: 1,
                wordBreak: 'break-word'
              }}
            >
              Tem certeza que deseja excluir permanentemente a pasta <Box component='span' sx={{ fontWeight: 700 }}>"{folder?.name}"</Box>?
            </Typography>
          </Box>

          {/* Footer com botões */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: 'flex-end',
              gap: { xs: 1.5, sm: 2 },
              p: { xs: 2, sm: 3 },
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#fafbfc'
            }}
          >
            <Button
              onClick={handleCancelDelete}
              disabled={deletingLoading}
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1.125, sm: 1.25 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#cbd5e1'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deletingLoading}
              variant='contained'
              startIcon={<DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1.125, sm: 1.25 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 600,
                backgroundColor: '#DC2626',
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: '#B91C1C',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                },
                '&:disabled': {
                  backgroundColor: '#9ca3af',
                  boxShadow: 'none'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {deletingLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

