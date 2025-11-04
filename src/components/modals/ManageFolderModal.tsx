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
  Typography
} from '@mui/material';
import {
  CalendarToday as CalendarTodayIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  DriveFileMove as DriveFileMoveIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import type { Folder, MoveProcessesDto, Process, UpdateFolderDto } from '@/globals/types';
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
      {value === index && <Box sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>{children}</Box>}
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
      const result = await fetchProcessesByFolder(folder._id, {
        processNumber: debouncedSearch || undefined
      });
      setProcesses(result.processes);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      setProcesses([]);
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleToggleProcess = (processId: string) => {
    setSelectedProcesses((prev) =>
      prev.includes(processId)
        ? prev.filter((id) => id !== processId)
        : [...prev, processId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProcesses.length === processes.length) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(processes.map((p) => p._id));
    }
  };

  const handleMoveProcesses = async () => {
    if (!targetFolder || selectedProcesses.length === 0) return;

    try {
      await onMoveProcesses({
        processIds: selectedProcesses,
        targetFolderId: targetFolder
      });
      // Limpar estados após mover
      setSelectedProcesses([]);
      setTargetFolder('');
      setSearchTerm('');
      loadProcesses();
    } catch (error) {
      console.error('Erro ao mover processos:', error);
    }
  };

  const handleDeleteFolder = async () => {
    try {
      await onDelete();
      handleClose();
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
    }
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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
        return 'Selecione os processos que deseja mover e escolha a pasta de destino. Os processos selecionados serão transferidos automaticamente.';
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
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          {/* Header - 3 faixas organizadas */}
          <Box
            sx={{
              px: { xs: 3, sm: 4 },
              py: 3,
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
                mb: 1.5
            }}
          >
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '1.5rem',
                  lineHeight: 1.2
                }}
              >
                Gerenciar Pasta
              </Typography>
              <IconButton
                onClick={handleClose}
                sx={{
                  width: 40,
                  height: 40,
                  color: '#64748b',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Faixa 2: Identificação da pasta (nome, ano, status) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                mb: 1.5
              }}
            >
              <Typography
                variant='subtitle1'
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: '1rem',
                  lineHeight: 1.4
                }}
              >
                {folder.name}
              </Typography>
              {/* Chips de status */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {folder.isDefault && (
                  <Chip
                    label='Pasta Padrão'
                    size='small'
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#dbeafe',
                      color: '#1877F2',
                      border: '1px solid #bfdbfe',
                      '& .MuiChip-label': {
                        px: 1.25,
                        py: 0
                      }
                    }}
                  />
                )}
                {isFolderFavorite && !folder.isPermanent && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />}
                    label='Favorita'
                    size='small'
              sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      '& .MuiChip-icon': {
                        marginLeft: '6px'
                      },
                      '& .MuiChip-label': {
                        px: 1.25,
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
                fontSize: '0.875rem',
                lineHeight: 1.5,
                fontWeight: 400
              }}
            >
              {getToolDescription()}
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 3, sm: 4 } }}>
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              sx={{
                minHeight: 56,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 56,
                  px: 2,
                  '&.Mui-selected': {
                    color: '#1877F2'
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(24, 119, 242, 0.04)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1877F2',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              <Tab
                label='Editar Pasta'
                icon={<EditIcon sx={{ fontSize: 20 }} />}
                iconPosition='start'
                disabled={isProtected}
              />
              <Tab
                label='Mover Processos'
                icon={<DriveFileMoveIcon sx={{ fontSize: 20 }} />}
                iconPosition='start'
              />
              <Tab
                label='Excluir Pasta'
                icon={<DeleteIcon sx={{ fontSize: 20 }} />}
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
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <WarningIcon sx={{ color: '#92400e', fontSize: 20, flexShrink: 0 }} />
                <Typography
                    variant='body2'
                    sx={{
                      color: '#92400e',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }}
                  >
                    Esta pasta não pode ser editada por ser protegida do sistema.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {/* Nome da pasta */}
                  <Box>
                    <Typography
                      variant='body2'
                  sx={{
                    fontWeight: 600,
                        color: '#0f172a',
                        mb: 1,
                        fontSize: '0.875rem'
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
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
                        mb: 1,
                        fontSize: '0.875rem'
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
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
                        mb: 1,
                        fontSize: '0.875rem'
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease-in-out'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1877F2',
                            boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#9ca3af',
                          opacity: 1
                        }
                      }}
                    />
                  </Box>

                  {/* Botões */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Button
                      onClick={handleClose}
                      disabled={editingLoading}
                      sx={{
                        px: 3,
                        py: 1.25,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'none',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
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
                      onClick={handleSaveEdit}
                      disabled={editingLoading || !folderForm.name?.trim()}
                  variant='contained'
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#1877F2',
                    textTransform: 'none',
                    borderRadius: 2,
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Seletor de pasta destino */}
                <Box>
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      mb: 1,
                      fontSize: '0.875rem'
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <FolderIcon sx={{ fontSize: 20, color: folderIconColor }} />
                            <Typography sx={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 400 }}>
                              {selectedFolder.name}
                            </Typography>
              </Box>
                        );
                      }}
                      sx={{
                        height: 44,
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #e2e8f0',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1877F2',
                          boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                        },
                        '& .MuiSelect-select': {
                          py: 1.25,
                          px: 1.5
                        }
                      }}
                    >
                      <MenuItem value='' disabled>
                        {loadingFolders ? 'Carregando pastas...' : availableFolders.length === 0 ? 'Nenhuma pasta disponível' : 'Selecione a pasta destino...'}
                      </MenuItem>
                      {availableFolders.map((f) => {
                        const isPlanco = f.name?.toLowerCase().includes('planco');
                        const folderIconColor = isPlanco ? '#1877F2' : '#fbbf24';
                        
                        return (
                          <MenuItem key={f._id} value={f._id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                              <FolderIcon sx={{ fontSize: 24, color: folderIconColor }} />
                              <Box sx={{ flex: 1 }}>
                <Typography
                                  variant='body2'
                                  sx={{
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    fontSize: '0.875rem'
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography
                      variant='body2'
                  sx={{
                    fontWeight: 600,
                        color: '#0f172a',
                        fontSize: '0.875rem'
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
                          fontSize: '0.875rem'
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
                            mr: 1.25,
                            width: 20,
                            height: 20
                          }}
                        >
                          <SearchIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                        </Box>
                      )
                    }}
                    sx={{
                      mb: 1.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: '2px solid #e2e8f0',
                          transition: 'all 0.2s ease-in-out'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#cbd5e1'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1877F2',
                          boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.1)'
                        }
                      }
                    }}
                  />
                  
                  {/* Tabela de processos */}
                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      maxHeight: 400,
                      overflow: 'auto',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            padding='checkbox' 
                            sx={{ 
                              backgroundColor: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              py: 1.5
                            }}
                          >
                            <Checkbox
                              indeterminate={selectedProcesses.length > 0 && selectedProcesses.length < processes.length}
                              checked={processes.length > 0 && selectedProcesses.length === processes.length}
                              onChange={handleSelectAll}
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
                              backgroundColor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              borderBottom: '1px solid #e2e8f0',
                              py: 1.5
                            }}
                          >
                            Processo
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              backgroundColor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              borderBottom: '1px solid #e2e8f0',
                              py: 1.5
                            }}
                          >
                            Objeto
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              backgroundColor: '#f8fafc', 
                              fontWeight: 600,
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              borderBottom: '1px solid #e2e8f0',
                              py: 1.5
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
                          processes.map((process) => (
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
                              <TableCell padding='checkbox' sx={{ py: 1.5 }}>
                                <Checkbox
                                  checked={selectedProcesses.includes(process._id)}
                                  onChange={() => handleToggleProcess(process._id)}
                                  sx={{
                                    color: '#64748b',
                                    '&.Mui-checked': {
                                      color: '#1877F2'
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 1.5, color: '#0f172a', fontSize: '0.875rem' }}>
                                {process.processNumber}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, color: '#475569', fontSize: '0.875rem' }}>
                                {process.object}
                              </TableCell>
                              <TableCell sx={{ py: 1.5, color: '#64748b', fontSize: '0.875rem' }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Button
                    onClick={handleClose}
                    disabled={movingLoading}
                    sx={{
                      px: 3,
                      py: 1.25,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#64748b',
                      textTransform: 'none',
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
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
                    onClick={handleMoveProcesses}
                    disabled={movingLoading || !targetFolder || selectedProcesses.length === 0}
                  variant='contained'
                    startIcon={<DriveFileMoveIcon />}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#1877F2',
                    textTransform: 'none',
                    borderRadius: 2,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <WarningIcon sx={{ color: '#92400e', fontSize: 20, flexShrink: 0 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#92400e',
                      fontSize: '0.875rem',
                      lineHeight: 1.5
                    }}
                  >
                    Esta pasta não pode ser excluída por ser protegida do sistema.
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
                        gap: 2
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
                              p: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 56,
                              height: 56
                            }}
                          >
                            <FolderIcon
                              sx={{
                                fontSize: 28,
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
                            fontSize: '1.125rem',
                            lineHeight: 1.3
                          }}
                        >
                          {folder.name}
                        </Typography>
                        {folder.year && (
                          <Typography
                            variant='body2'
                            sx={{
                              color: '#64748b',
                              fontSize: '0.875rem',
                              mt: 0.5
                            }}
                          >
                            Ano: {folder.year}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Conteúdo do card */}
                    <Box sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Descrição */}
                        {(folder.description || folder.observations) && (
                          <Box>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: '0.875rem',
                    mb: 1
                  }}
                >
                              Descrição
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                                color: '#475569',
                                fontSize: '0.875rem',
                                lineHeight: 1.6
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
                            gap: 2.5,
                            pt: 2.5,
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
                                  fontSize: '0.875rem',
                                  mb: 0.75
                                }}
                              >
                                Processos
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: '0.875rem'
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
                                  fontSize: '0.875rem',
                                  mb: 0.75
                                }}
                              >
                                Criada em
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: '0.875rem'
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
                                  fontSize: '0.875rem',
                                  mb: 0.75
                                }}
                              >
                                Atualizada em
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#475569',
                                  fontSize: '0.875rem'
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
                      p: 2.5,
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Button
                      onClick={handleClose}
                      disabled={deletingLoading}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                        color: '#64748b',
                    textTransform: 'none',
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
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
                      onClick={handleDeleteFolder}
                      disabled={deletingLoading}
                  variant='contained'
                      startIcon={<DeleteIcon />}
                    sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#DC2626',
                        textTransform: 'none',
                    borderRadius: 2,
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
                </Box>
              )}
            </TabPanel>
          </Box>
        </DialogContent>
      </Dialog>

    </>
  );
};

