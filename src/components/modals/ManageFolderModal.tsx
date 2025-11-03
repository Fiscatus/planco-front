import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  DriveFileMove as DriveFileMoveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import type { Folder, MoveProcessesDto, UpdateFolderDto } from '@/globals/types';
import { useState } from 'react';
import { EditFolderModal } from './EditFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { MoveProcessesModal } from './MoveProcessesModal';

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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
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
  const [currentTab, setCurrentTab] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleClose = () => {
    setCurrentTab(0);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setMoveModalOpen(false);
    onClose();
  };

  if (!folder) return null;

  const isProtected = folder.isDefault || folder.isPermanent;

  return (
    <>
      <Dialog
        open={open && !editModalOpen && !deleteModalOpen && !moveModalOpen}
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
                Gerenciar Pasta
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  mt: 0.5
                }}
              >
                {folder.name} {folder.year ? `(${folder.year})` : ''}
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 56,
                  '&.Mui-selected': {
                    color: '#1877F2'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1877F2'
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
          <Box sx={{ p: 4 }}>
            <TabPanel value={currentTab} index={0}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EditIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    mb: 1
                  }}
                >
                  Editar Informações da Pasta
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#6b7280',
                    mb: 3
                  }}
                >
                  Altere o nome, ano ou descrição desta pasta.
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => setEditModalOpen(true)}
                  disabled={isProtected}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#1877F2',
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#166fe5'
                    },
                    '&:disabled': {
                      backgroundColor: '#9ca3af'
                    }
                  }}
                >
                  {isProtected ? 'Edição Bloqueada' : 'Editar Pasta'}
                </Button>
                {isProtected && (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mt: 2,
                      color: '#d97706'
                    }}
                  >
                    Esta pasta não pode ser editada
                  </Typography>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DriveFileMoveIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    mb: 1
                  }}
                >
                  Mover Processos Entre Pastas
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#6b7280',
                    mb: 3
                  }}
                >
                  Selecione os processos desta pasta para mover para outra pasta.
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => setMoveModalOpen(true)}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#1877F2',
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#166fe5'
                    }
                  }}
                >
                  Mover Processos
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <DeleteIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: '#1f2937',
                    mb: 1
                  }}
                >
                  Excluir Pasta
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#6b7280',
                    mb: 3
                  }}
                >
                  Exclua esta pasta permanentemente. Os processos serão movidos para a Pasta Planco.
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={isProtected}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#DC2626',
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#B91C1C'
                    },
                    '&:disabled': {
                      backgroundColor: '#9ca3af'
                    }
                  }}
                >
                  {isProtected ? 'Exclusão Bloqueada' : 'Excluir Pasta'}
                </Button>
                {isProtected && (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mt: 2,
                      color: '#d97706'
                    }}
                  >
                    Esta pasta não pode ser excluída
                  </Typography>
                )}
              </Box>
            </TabPanel>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      <EditFolderModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          if (!editingLoading) {
            handleClose();
          }
        }}
        onSave={onEdit}
        folder={folder}
        loading={editingLoading}
      />

      <DeleteFolderModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          if (!deletingLoading) {
            handleClose();
          }
        }}
        onConfirm={onDelete}
        folder={folder}
        loading={deletingLoading}
      />

      <MoveProcessesModal
        open={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          if (!movingLoading) {
            handleClose();
          }
        }}
        onMove={onMoveProcesses}
        folder={folder}
        availableFolders={availableFolders.filter((f) => f._id !== folder._id)}
        loading={movingLoading}
        loadingFolders={loadingFolders}
      />
    </>
  );
};

