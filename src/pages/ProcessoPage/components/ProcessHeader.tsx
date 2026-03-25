import { useState, useCallback } from 'react';
import { ArrowBackIosNew as ArrowBackIcon, Settings as SettingsIcon, AccountTree as FlowIcon } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { FlowInstance } from '@/hooks/useFlowInstance';
import { EditProcessModal } from './EditProcessModal';

type ProcessHeaderProps = {
  title: string;
  subtitle: string;
  status: string;
  isOwner?: boolean;
  flowInstance: FlowInstance;
};

export const ProcessHeader = ({ title, subtitle, status, isOwner = false, flowInstance }: ProcessHeaderProps) => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [initialTab, setInitialTab] = useState(0);

  const navigateBack = useCallback(() => navigate(-1), [navigate]);

  const openTab = (tab: number) => { setInitialTab(tab); setEditOpen(true); };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <IconButton
            sx={{ mt: 0.5, border: '1px solid #E4E6EB', borderRadius: 2, bgcolor: '#fff', '&:hover': { bgcolor: '#F8FAFC' } }}
            onClick={navigateBack}
          >
            <ArrowBackIcon sx={{ fontSize: 18, color: '#64748b' }} />
          </IconButton>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant='h4' sx={{ fontWeight: 800, color: '#0f172a' }}>{title}</Typography>
              <Chip label={status} size='small'
                sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700, fontSize: '0.75rem', height: 24, px: 0.5, flexShrink: 0 }} />
            </Box>
            <Typography variant='subtitle1' sx={{ color: '#64748b', fontWeight: 500, maxWidth: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</Typography>
          </Box>
        </Box>

        {isOwner && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant='outlined' startIcon={<SettingsIcon />} onClick={() => openTab(0)}
              sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#E4E6EB', color: '#0f172a', borderRadius: 2, '&:hover': { borderColor: '#1877F2', bgcolor: '#F0F9FF', color: '#1877F2' } }}>
              Editar Processo
            </Button>
            <Button variant='contained' startIcon={<FlowIcon />} onClick={() => openTab(2)}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#1877F2', boxShadow: 'none', borderRadius: 2, '&:hover': { bgcolor: '#166FE5', boxShadow: 'none' } }}>
              Editar Fluxo
            </Button>
          </Box>
        )}
      </Box>

      <EditProcessModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        flowInstance={flowInstance}
        initialTab={initialTab}
      />
    </>
  );
};
