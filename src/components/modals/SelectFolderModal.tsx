import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  FolderOpen as FolderOpenIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import type { Folder } from '@/globals/types';
import { useCallback, useState } from 'react';
import { useDebounce } from '@/hooks';

interface SelectFolderModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (folder: Folder) => void;
  folders: Folder[];
  title?: string;
  subtitle?: string;
}

export const SelectFolderModal = ({
  open,
  onClose,
  onSelect,
  folders,
  title = 'Selecione uma Pasta',
  subtitle = 'Escolha uma pasta para gerenciar'
}: SelectFolderModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSelect = useCallback((folder: Folder) => {
    onSelect(folder);
    setSearchTerm('');
    onClose();
  }, [onSelect, onClose]);

  const handleClose = useCallback(() => {
    setSearchTerm('');
    onClose();
  }, [onClose]);

  const filteredFolders = folders.filter((folder) =>
    debouncedSearch
      ? folder.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        folder.year?.toLowerCase().includes(debouncedSearch.toLowerCase())
      : true
  );

  return (
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
              {title}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: '#64748b',
                fontSize: '0.875rem',
                mt: 0.5
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          <Button
            onClick={handleClose}
            sx={{
              minWidth: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              color: '#64748b',
              '&:hover': {
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            <CloseIcon />
          </Button>
        </Box>

        {/* Search */}
        <Box sx={{ p: 3, pb: 2 }}>
          <TextField
            fullWidth
            placeholder='Buscar pasta...'
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
                  borderColor: '#cbd5e1'
                },
                '&.Mui-focused': {
                  borderColor: '#1877F2',
                  boxShadow: '0 0 0 3px rgba(24, 119, 242, 0.15)'
                }
              }
            }}
          />
        </Box>

        {/* Folder List */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            maxHeight: 400,
            overflowY: 'auto'
          }}
        >
          {filteredFolders.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
              <Typography
                variant='body1'
                sx={{
                  color: '#64748b'
                }}
              >
                Nenhuma pasta encontrada
              </Typography>
            </Box>
          ) : (
            <Grid
              container
              spacing={2}
            >
              {filteredFolders.map((folder) => (
                <Grid
                  key={folder._id}
                  size={{ xs: 12, sm: 6 }}
                >
                  <Button
                    onClick={() => handleSelect(folder)}
                    fullWidth
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        borderColor: '#1877F2',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: '#EFF6FF'
                        }}
                      >
                        <FolderOpenIcon sx={{ fontSize: 24, color: '#1877F2' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <Typography
                          variant='body1'
                          sx={{
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.9375rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {folder.name}
                        </Typography>
                        {folder.year && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: '#64748b',
                              fontSize: '0.8125rem'
                            }}
                          >
                            {folder.year}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

