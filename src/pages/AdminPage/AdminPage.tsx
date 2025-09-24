import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';

import { GerenciaSection } from './components/GerenciaSection';
import { InvitesSection } from './components/InvitesSection';
import { RolesSection } from './components/RolesSection';
import { UserSection } from './components/UserSection';
import { useAuth } from '@/hooks';
import { useState } from 'react';

const AdminPage = () => {
  const { isPlatformAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'gerencias' | 'invites' | 'roles'>('users');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          px: 3,
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography
                variant='h4'
                sx={{ fontWeight: 700, lineHeight: 1.2 }}
              >
                Administração
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'text.secondary' }}
              >
                Gerencie usuários, roles e convites da organização
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip
              label={isPlatformAdmin ? 'Admin da Plataforma' : 'Admin da Organização'}
              color={isPlatformAdmin ? 'primary' : 'default'}
              variant={isPlatformAdmin ? 'filled' : 'outlined'}
              size='small'
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          aria-label='Abas da Administração'
          sx={{ mb: 2 }}
        >
          <Tab
            value='users'
            label='Usuários'
            sx={{ textTransform: 'none' }}
          />
          <Tab
            value='gerencias'
            label='Gerências'
            sx={{ textTransform: 'none' }}
          />
          <Tab
            value='invites'
            label='Convites'
            sx={{ textTransform: 'none' }}
          />
          <Tab
            value='roles'
            label='Roles'
            sx={{ textTransform: 'none' }}
          />
        </Tabs>

        {activeTab === 'users' && <UserSection />}
        {activeTab === 'gerencias' && <GerenciaSection />}
        {activeTab === 'invites' && <InvitesSection />}
        {activeTab === 'roles' && <RolesSection />}
      </Box>
    </Box>
  );
};

export default AdminPage;
