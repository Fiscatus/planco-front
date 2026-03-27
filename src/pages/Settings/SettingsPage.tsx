import { NotificationsOutlined, VolumeOffOutlined, VolumeUpOutlined } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Slider,
  Switch,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useState } from 'react';
import type { NotificationSound } from '@/hooks/useNotificationPrefs';
import { playNotificationSound, useNotificationPrefs } from '@/hooks/useNotificationPrefs';

const SOUND_OPTIONS: { value: NotificationSound; label: string; description: string }[] = [
  { value: 'chime', label: 'Chime', description: 'Dois tons suaves e descendentes' },
  { value: 'pop', label: 'Pop', description: 'Bip curto e discreto' },
  { value: 'bell', label: 'Bell', description: 'Tom metálico com harmônicos' },
  { value: 'bling', label: 'Bling', description: 'Tom cristalino' }
];

const SettingsPage = () => {
  const [tab, setTab] = useState('notifications');
  const { prefs, update } = useNotificationPrefs();

  const handleSoundToggle = (enabled: boolean) => {
    update({ soundEnabled: enabled });
    if (enabled) setTimeout(() => playNotificationSound(), 100);
  };

  const handleSoundChange = (sound: NotificationSound) => {
    update({ sound });
    setTimeout(() => playNotificationSound(sound), 100);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F7F9FB 0%, #F4F6F8 100%)',
        pt: { xs: 2, sm: 3, md: 3.5 },
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        pb: { xs: 4, sm: 5, md: 6 }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant='h4'
          sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' }, color: '#0f172a', mb: 0.5, lineHeight: 1.2 }}
        >
          Configurações
        </Typography>
        <Typography variant='body1' sx={{ color: '#64748b', fontSize: { xs: '0.875rem', md: '1rem' } }}>
          Gerencie suas preferências do sistema.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <Card sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            orientation='vertical'
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
                justifyContent: 'flex-start', px: 2.5, py: 1.5, minHeight: 48,
                color: '#64748b',
                '&.Mui-selected': { color: '#1877F2', backgroundColor: '#EBF3FF' }
              },
              '& .MuiTabs-indicator': { left: 0, right: 'auto', width: 3, borderRadius: '0 2px 2px 0' }
            }}
          >
            <Tab
              value='notifications'
              label='Notificações'
              icon={<NotificationsOutlined sx={{ fontSize: 18 }} />}
              iconPosition='start'
            />
          </Tabs>
        </Card>

        {/* Conteúdo */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {tab === 'notifications' && (
            <Card sx={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfc' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                  Notificações
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
                  Configure como você recebe alertas do sistema.
                </Typography>
              </Box>

              <CardContent sx={{ p: '0 !important' }}>
                {/* Toggle de som */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 3, py: 2.5,
                    '&:hover': { backgroundColor: '#fafbfc' }, transition: 'background 0.15s'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: prefs.soundEnabled ? '#EBF3FF' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: prefs.soundEnabled ? '#1877F2' : '#94a3b8', transition: 'all 0.2s' }}>
                      {prefs.soundEnabled ? <VolumeUpOutlined sx={{ fontSize: 20 }} /> : <VolumeOffOutlined sx={{ fontSize: 20 }} />}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>
                        Som de notificação
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
                        {prefs.soundEnabled ? 'Toca um som ao receber novas notificações' : 'Notificações silenciosas ativadas'}
                      </Typography>
                    </Box>
                  </Box>
                  <Switch
                    checked={prefs.soundEnabled}
                    onChange={e => handleSoundToggle(e.target.checked)}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#1877F2', '& + .MuiSwitch-track': { backgroundColor: '#1877F2' } } }}
                  />
                </Box>

                {/* Opções de som — só visível se habilitado */}
                {prefs.soundEnabled && (
                  <>
                    <Divider sx={{ mx: 3 }} />

                    {/* Volume */}
                    <Box sx={{ px: 3, py: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <VolumeOffOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
                        <Slider
                          value={Math.round((prefs.volume ?? 0.7) * 100)}
                          onChange={(_, v) => update({ volume: (v as number) / 100 })}
                          onChangeCommitted={(_, v) => playNotificationSound()}
                          min={10}
                          max={100}
                          step={10}
                          sx={{ flex: 1, color: '#1877F2' }}
                        />
                        <VolumeUpOutlined sx={{ fontSize: 18, color: '#1877F2' }} />
                        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', minWidth: 36, textAlign: 'right' }}>
                          {Math.round((prefs.volume ?? 0.7) * 100)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ mx: 3 }} />

                    {/* Tipo de som */}
                    <Box sx={{ px: 3, py: 2 }}>
                      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', mb: 1.5 }}>
                        Tipo de som
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {SOUND_OPTIONS.map(opt => {
                          const active = prefs.sound === opt.value;
                          return (
                            <Box
                              key={opt.value}
                              onClick={() => handleSoundChange(opt.value)}
                              sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                px: 2, py: 1.5, borderRadius: 2, cursor: 'pointer',
                                border: '1px solid', borderColor: active ? '#1877F2' : '#e2e8f0',
                                backgroundColor: active ? '#EBF3FF' : '#ffffff',
                                transition: 'all 0.15s',
                                '&:hover': { borderColor: '#1877F2', backgroundColor: active ? '#EBF3FF' : '#f8fafc' }
                              }}
                            >
                              <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500, color: active ? '#1877F2' : '#0f172a' }}>
                                  {opt.label}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                                  {opt.description}
                                </Typography>
                              </Box>
                              <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid', borderColor: active ? '#1877F2' : '#cbd5e1', backgroundColor: active ? '#1877F2' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {active && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </>
                )}

                <Divider sx={{ mx: 3 }} />
                <Box sx={{ px: 3, py: 2, backgroundColor: '#fafbfc' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Mais opções de configuração serão adicionadas em breve.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
