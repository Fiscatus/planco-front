import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import {
  DriveFileMove as DriveFileMoveIcon,
  Folder as FolderIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { Folder, MoveProcessesDto, Process } from '@/globals/types';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks';
import { useProcesses } from '@/hooks/useProcesses';

interface MoveProcessesModalProps {
  open: boolean;
  onClose: () => void;
  onMove: (data: MoveProcessesDto) => Promise<void>;
  folder: Folder | null;
  availableFolders?: Folder[];
  loading?: boolean;
  loadingFolders?: boolean;
}

export const MoveProcessesModal = ({
  open,
  onClose,
  onMove,
  folder,
  availableFolders = [],
  loading = false,
  loadingFolders = false
}: MoveProcessesModalProps) => {
  const { fetchProcessesByFolder } = useProcesses();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [targetFolder, setTargetFolder] = useState('');

  // Buscar processos da pasta quando modal abrir
  useEffect(() => {
    if (open && folder?._id) {
      loadProcesses();
    }
  }, [open, folder?._id]);

  // Buscar processos quando termo de busca mudar
  useEffect(() => {
    if (open && folder?._id) {
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

  const handleMove = async () => {
    if (!targetFolder || selectedProcesses.length === 0) return;

    try {
      await onMove({
        processIds: selectedProcesses,
        targetFolderId: targetFolder
      });
      handleClose();
    } catch (error) {
      console.error('Erro ao mover processos:', error);
    }
  };

  const handleClose = useCallback(() => {
    setSearchTerm('');
    setSelectedProcesses([]);
    setTargetFolder('');
    setProcesses([]);
    onClose();
  }, [onClose]);

  if (!folder) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='lg'
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '1.5rem'
              }}
            >
              Mover Processos
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mt: 0.5
              }}
            >
              Selecione os processos da pasta "{folder.name}" para mover.
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: 4 }}>
          {/* Buscar processos */}
          <Box sx={{ mb: 3 }}>
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
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#ffffff'
                  },
                  '&.Mui-focused': {
                    borderColor: '#1877F2',
                    boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)',
                    backgroundColor: '#ffffff'
                  }
                }
              }}
            />
          </Box>

          {/* Seletor de pasta destino */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: '#475569',
                mb: 1.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Pasta Destino *
            </Typography>
            <FormControl fullWidth>
              <Select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                displayEmpty
                sx={{
                  height: 44,
                  borderRadius: 2.5,
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  '&:hover': {
                    backgroundColor: '#ffffff'
                  },
                  '&.Mui-focused': {
                    borderColor: '#1877F2',
                    boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)',
                    backgroundColor: '#ffffff'
                  },
                  '& .MuiSelect-icon': {
                    color: '#64748b'
                  }
                }}
              >
                <MenuItem 
                  value='' 
                  disabled
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    }
                  }}
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
                        '&:hover': {
                          backgroundColor: '#f8fafc'
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#f1f5f9',
                          '&:hover': {
                            backgroundColor: '#f1f5f9'
                          }
                        }
                      }}
                    >
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
              {!loadingFolders && availableFolders.length === 0 && (
                <Typography
                  variant='caption'
                  sx={{
                    mt: 0.5,
                    color: '#64748b',
                    fontSize: '0.75rem'
                  }}
                >
                  Nenhuma pasta disponível para mover processos
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Tabela de processos */}
          <Box>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: '#475569',
                mb: 1.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Processos Selecionados ({selectedProcesses.length})
            </Typography>
            <TableContainer
              sx={{
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                maxHeight: 400,
                overflow: 'auto'
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox' sx={{ backgroundColor: '#f8fafc' }}>
                      <Checkbox
                        indeterminate={selectedProcesses.length > 0 && selectedProcesses.length < processes.length}
                        checked={processes.length > 0 && selectedProcesses.length === processes.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#f8fafc', fontWeight: 600 }}>
                      Processo Nº
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#f8fafc', fontWeight: 600 }}>
                      Objeto
                    </TableCell>
                    <TableCell sx={{ backgroundColor: '#f8fafc', fontWeight: 600 }}>
                      Situação
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingProcesses ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                        Carregando processos...
                      </TableCell>
                    </TableRow>
                  ) : processes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                        Nenhum processo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    processes.map((process) => (
                      <TableRow key={process._id} hover>
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={selectedProcesses.includes(process._id)}
                            onChange={() => handleToggleProcess(process._id)}
                          />
                        </TableCell>
                        <TableCell>{process.processNumber}</TableCell>
                        <TableCell>{process.object}</TableCell>
                        <TableCell>{process.status || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Footer com botões */}
        <Box
          sx={{
            p: 3,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleMove}
            disabled={loading || !targetFolder || selectedProcesses.length === 0}
            variant='contained'
            startIcon={<DriveFileMoveIcon />}
            sx={{
              px: 3,
              py: 1.25,
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#1877F2',
              textTransform: 'uppercase',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#166fe5'
              },
              '&:disabled': {
                backgroundColor: '#9ca3af'
              }
            }}
          >
            {loading ? 'Movendo...' : `Mover ${selectedProcesses.length} Processo(s)`}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

