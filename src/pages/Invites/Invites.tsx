import {
  AccessTime,
  CheckCircle,
  InfoOutlined,
  Mail,
  PersonAdd,
  Shield,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { useAuth, useInvites } from "@/hooks";

import type { Invite } from "@/globals/types";

const Invites = () => {
  const { user } = useAuth();
  const { invites, loading, acceptInvite, declineInvite, refetch } =
    useInvites();

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending"
  );

  const handleAcceptInvite = async (inviteId: string) => {
    await acceptInvite(inviteId);
  };

  const handleDeclineInvite = async (inviteId: string) => {
    await declineInvite(inviteId);
  };

  // Se não tem convites pendentes
  if (pendingInvites.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: "600px",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              pb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgb(216, 194, 253)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mt: 3,
                }}
              >
                <Mail sx={{ fontSize: 24, color: "rgb(124, 59, 237)" }} />
              </Box>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Nenhum Convite Encontrado
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Você não possui convites pendentes para nenhuma organização
            </Typography>
          </Box>

          <CardContent sx={{ px: 4, pb: 4 }}>
            <Alert
              severity="info"
              icon={
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <InfoOutlined sx={{ color: "primary.main" }} />
                </Box>
              }
              sx={{
                mb: 3,
              }}
            >
              Para acessar o sistema, você precisa ser convidado por um
              administrador de uma organização.
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 3,
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Como obter acesso:
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "rgb(124, 59, 237)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    1
                  </Box>
                  <Box>
                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                      Entre em contato com um administrador
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Procure um gerente ou administrador da organização onde
                      você deseja trabalhar
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "rgb(124, 59, 237)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    2
                  </Box>
                  <Box>
                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                      Solicite um convite
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peça para que seja criado um convite com seu email
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: "rgb(124, 59, 237)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    3
                  </Box>
                  <Box>
                    <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                      Aguarde o convite
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Você receberá um link por email para aceitar o convite
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                onClick={refetch}
                sx={{
                  minWidth: 200,
                  borderRadius: 1,
                  bgcolor: "primary.main",
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
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "600px",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Box sx={{ textAlign: "center", pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "rgb(216, 194, 253)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mt: 3,
              }}
            >
              <PersonAdd sx={{ fontSize: 28, color: "rgb(124, 59, 237)" }} />
            </Box>
          </Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            sx={{ mb: 1 }}
          >
            Convites Pendentes
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Você possui convites para organizações
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, pb: 4 }}>
          {pendingInvites.map((invite: Invite) => (
            <Card
              key={invite._id}
              variant="outlined"
              sx={{
                mb: 3,
                textAlign: "left",
                borderRadius: 1,
              }}
            >
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Shield sx={{ color: "primary.main" }} />
                    <Typography variant="h6">
                      Convite para Organização
                    </Typography>
                  </Box>
                }
                action={
                  <Chip
                    icon={<AccessTime />}
                    label={`Expira em ${new Date(
                      invite.expiresAt
                    ).toLocaleDateString("pt-BR")}`}
                    variant="outlined"
                    sx={{
                      color: "black",
                      borderColor: "black",
                      "&:hover": {
                        borderColor: "darkred",
                      },
                    }}
                  />
                }
              />
              <CardContent>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Token do Convite
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        bgcolor: "grey.50",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        width: "fit-content",
                      }}
                    >
                      {invite.token}
                    </Paper>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Email
                    </Typography>
                    <Typography variant="body1">{invite.email}</Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Organização
                    </Typography>
                    <Typography variant="body1">
                      {invite.organizationName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Função
                    </Typography>
                    <Typography variant="body1">{invite.role}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleAcceptInvite(invite._id)}
                    sx={{
                      flex: 1,
                      bgcolor: "rgb(124, 59, 237)",
                    }}
                  >
                    Aceitar Convite
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleDeclineInvite(invite._id)}
                    sx={{
                      borderColor: "rgb(124, 59, 237)",
                      color: "rgb(124, 59, 237)",
                      "&:hover": {
                        borderColor: "darkred",
                      },
                    }}
                  >
                    Recusar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Invites;
