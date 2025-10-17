import {
  AccessTime,
  CheckCircle,
  InfoOutlined,
  Mail,
  PersonAdd,
  Shield
} from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CardHeader, Chip, Divider, Paper, Typography } from '@mui/material';
import { useAuth, useInvites } from '@/hooks';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { Invite } from '@/globals/types';
import { useCallback } from 'react';
import { useNotification } from '@/components';

const Invites = () => {
  const { user, hasOrganization } = useAuth();
  const { invites, loading, error, fetchUserInvites, acceptInvite, declineInvite, clearError } = useInvites();
  const { showNotification } = useNotification();

  const { data: invitesData, refetch: refetchInvites } = useQuery({
    queryKey: ['fetchUserInvites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await fetchUserInvites(user.email);
    },
    enabled: !!user?.email && !hasOrganization,
    refetchOnWindowFocus: false
  });

  const { mutate: acceptInviteMutation, isPending: acceptingInvite } = useMutation({
    mutationFn: async (inviteId: string) => {
      return await acceptInvite(inviteId);
    },
    onError: () => {
      showNotification('Erro ao aceitar convite', 'error');
    },
    onSuccess: () => {
      showNotification('Convite aceito com sucesso!', 'success');
      refetchInvites();
    }
  });

  const { mutate: declineInviteMutation, isPending: decliningInvite } = useMutation({
    mutationFn: async (inviteId: string) => {
      return await declineInvite(inviteId);
    },
    onError: () => {
      showNotification('Erro ao recusar convite', 'error');
    },
    onSuccess: () => {
      showNotification('Convite recusado com sucesso!', 'success');
      refetchInvites();
    }
  });

  const handleAcceptInvite = useCallback(
    (inviteId: string) => {
      acceptInviteMutation(inviteId);
    },
    [acceptInviteMutation]
  );

  const handleDeclineInvite = useCallback(
    (inviteId: string) => {
      declineInviteMutation(inviteId);
    },
    [declineInviteMutation]
  );

  const handleRefresh = useCallback(() => {
    refetchInvites();
  }, [refetchInvites]);

  if (hasOrganization) {
    return (
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: 2,
            boxShadow: 3,
            textAlign: 'center',
            p: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgb(216, 194, 253)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mt: 3
              }}
            >
              <InfoOutlined sx={{ fontSize: 24, color: 'rgb(124, 59, 237)' }} />
            </Box>
          </Box>
          <Typography
            variant='h4'
            component='h1'
            fontWeight={600}
            sx={{ mb: 1 }}
          >
            Acesso Negado
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
          >
            Você já pertence a uma organização
          </Typography>
        </Card>
      </Box>
    );
  }

  if (!loading && (invitesData || []).length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              pb: 2
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'rgb(216, 194, 253)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mt: 3
                }}
              >
                <Mail sx={{ fontSize: 24, color: 'rgb(124, 59, 237)' }} />
              </Box>
            </Box>
            <Typography
              variant='h4'
              component='h1'
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Nenhum Convite Encontrado
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
            >
              Você não possui convites pendentes para nenhuma organização
            </Typography>
          </Box>

          <CardContent sx={{ px: 4, pb: 4 }}>
            <Alert
              severity='info'
              icon={
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <InfoOutlined sx={{ color: 'primary.main' }} />
                </Box>
              }
              sx={{
                mb: 3
              }}
            >
              Para acessar o sistema, você precisa ser convidado por um administrador de uma organização.
            </Alert>

            <Paper
              variant='outlined'
              sx={{
                p: 3,
                mb: 3,
                bgcolor: 'grey.50',
                borderRadius: 1
              }}
            >
              <Typography
                variant='h6'
                fontWeight={600}
                sx={{ mb: 3 }}
              >
                Como obter acesso:
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  display='flex'
                  alignItems='flex-start'
                  gap={2}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'rgb(124, 59, 237)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}
                  >
                    1
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Entre em contato com um administrador
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Procure um gerente ou administrador da organização onde você deseja trabalhar
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display='flex'
                  alignItems='flex-start'
                  gap={2}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'rgb(124, 59, 237)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}
                  >
                    2
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Solicite um convite
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Peça para que seja criado um convite com seu email
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display='flex'
                  alignItems='flex-start'
                  gap={2}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'rgb(124, 59, 237)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5
                    }}
                  >
                    3
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={600}
                      sx={{ mb: 0.5 }}
                    >
                      Aguarde o convite
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                    >
                      Você receberá um link por email para aceitar o convite
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant='contained'
                onClick={handleRefresh}
                disabled={loading}
                sx={{
                  minWidth: 200,
                  borderRadius: 1,
                  bgcolor: 'primary.main'
                }}
              >
                Verificar Novamente
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Se tem convites pendentes
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '600px',
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Box sx={{ textAlign: 'center', pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgb(216, 194, 253)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mt: 3
              }}
            >
              <PersonAdd sx={{ fontSize: 28, color: 'rgb(124, 59, 237)' }} />
            </Box>
          </Box>
          <Typography
            variant='h4'
            component='h1'
            fontWeight={600}
            sx={{ mb: 1 }}
          >
            Convites Pendentes
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
          >
            Você possui convites para organizações
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, pb: 4 }}>
          {error && (
            <Alert
              severity='error'
              sx={{ mb: 3 }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                variant='body2'
                color='text.secondary'
              >
                Carregando convites...
              </Typography>
            </Box>
          ) : (
            (invitesData || []).map((invite: Invite) => (
              <Card
                key={invite._id}
                variant='outlined'
                sx={{
                  mb: 3,
                  textAlign: 'left',
                  borderRadius: 1
                }}
              >
                <CardHeader
                  title={
                    <Box
                      display='flex'
                      alignItems='center'
                      gap={1}
                    >
                      <Shield sx={{ color: 'primary.main' }} />
                      <Typography variant='h6'>Convite para Organização</Typography>
                    </Box>
                  }
                  action={
                    <Chip
                      icon={<AccessTime />}
                      label={`Expira em ${new Date(invite.expiresAt).toLocaleDateString('pt-BR')}`}
                      variant='outlined'
                      sx={{
                        color: 'black',
                        borderColor: 'black',
                        '&:hover': {
                          borderColor: 'darkred'
                        }
                      }}
                    />
                  }
                />
                <CardContent>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 3
                    }}
                  >
                    <Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Email
                      </Typography>
                      <Typography variant='body1'>{invite.email}</Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Role
                      </Typography>
                      <Typography variant='body1'>{invite.role.name}</Typography>
                    </Box>
                    {invite.departments && invite.departments.length > 0 && (
                      <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          gutterBottom
                        >
                          Gerências
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {invite.departments.map((dept) => (
                            <Chip
                              key={dept._id}
                              label={dept.department_name}
                              size='small'
                              variant='outlined'
                              color='secondary'
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    <Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Convidado por
                      </Typography>
                      <Typography variant='body1'>
                        {invite.invitedBy.firstName} {invite.invitedBy.lastName}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                      >
                        {invite.invitedBy.email}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        gutterBottom
                      >
                        Criado em
                      </Typography>
                      <Typography variant='body1'>{new Date(invite.createdAt).toLocaleDateString('pt-BR')}</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box
                    display='flex'
                    gap={2}
                  >
                    <Button
                      variant='contained'
                      startIcon={<CheckCircle />}
                      onClick={() => handleAcceptInvite(invite._id)}
                      disabled={acceptingInvite || decliningInvite}
                      sx={{
                        flex: 1,
                        bgcolor: 'rgb(124, 59, 237)'
                      }}
                    >
                      Aceitar Convite
                    </Button>
                    <Button
                      variant='outlined'
                      onClick={() => handleDeclineInvite(invite._id)}
                      disabled={acceptingInvite || decliningInvite}
                      sx={{
                        borderColor: 'rgb(124, 59, 237)',
                        color: 'rgb(124, 59, 237)',
                        '&:hover': {
                          borderColor: 'darkred'
                        }
                      }}
                    >
                      Recusar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Invites;
