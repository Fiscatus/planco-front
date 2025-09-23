import {
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Headphones as HeadphonesIcon,
  MailOutline as MailOutlineIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { Avatar, Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";

import React from "react";

type SupportSectionProps = {
  onNavigateHistoria: () => void;
  onOpenChat: () => void;
};

//TODO: Fazer botao abrir chatbot
const SupportSection: React.FC<SupportSectionProps> = ({ onNavigateHistoria, onOpenChat }) => {
  return (
    <Box component="section" sx={{ py: { xs: 2, md: 4 }, px: { xs: 4, md: 6 }, width: "100%" }}>
      <Container maxWidth={false}>
        <Box sx={{ px: { xs: 2, md: 3 }, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 4, border: "1px solid", borderColor: "rgb(233, 229, 235)", boxShadow: 1, height: "100%", background: "linear-gradient(135deg,rgb(248, 239, 255),rgb(248, 238, 255) 60%, #faf5ff)" }}>
            <Box sx={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, bgcolor: "rgba(220, 191, 254, 0.3)", borderRadius: "50%", filter: "blur(24px)" }} />
            <Box sx={{ position: "absolute", left: -64, bottom: -64, width: 208, height: 208, bgcolor: "rgba(234, 199, 254, 0.3)", borderRadius: "50%", filter: "blur(24px)" }} />
            <Box sx={{ position: "absolute", top: 16, right: 16, width: 80, height: 80, bgcolor: "rgba(243, 233, 254, 0.4)", borderRadius: "50%", filter: "blur(10px)" }} />

            <Box sx={{ position: "relative", p: { xs: 3, md: 3.5, lg: 4 }, display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
                <Box component="img" src="/assets/isologo.svg" alt="Logo Fiscatus" sx={{ width: 48, height: 48, flexShrink: 0 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                    Sobre o Sistema
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgb(137, 78, 238)", fontWeight: 600 }}>
                    Plataforma unificada para contratações públicas
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography sx={{ color: "#111827", lineHeight: 1.7 }}>
                  O Fiscatus foi criado para apoiar gestores públicos na condução das contratações, reunindo em uma única plataforma todas as etapas do processo, do planejamento à execução contratual. Nasceu da prática e do olhar atento de profissionais que conhecem de perto os desafios da administração, oferecendo uma ferramenta que alia simplicidade, inovação e segurança para tornar cada etapa mais clara e acessível.
                </Typography>
                <Typography sx={{ color: "#111827", lineHeight: 1.7 }}>
                  Com dashboards intuitivos, fluxos flexíveis e recursos de automação, o sistema ajuda a reduzir a burocracia e a dar mais agilidade às rotinas, permitindo que as equipes foquem no que realmente importa: resultados. O Fiscatus inspira confiança, fortalece a transparência e se apresenta como um parceiro de trabalho diário, trazendo tranquilidade e eficiência para quem lida com as contratações públicas.
                </Typography>
              </Stack>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
                {["Fluxos Personalizados","Assinaturas Digitais","Notificações","Relatórios Inteligentes","Multi-Órgão"].map((chip) => (
                  <Chip key={chip} label={chip} size="small" sx={{ bgcolor: "rgba(255,255,255,0.9)", color: "#374151", border: "1px solid rgb(233, 229, 235)", boxShadow: 1 }} />
                ))}
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Button onClick={onNavigateHistoria} variant="contained" sx={{ gap: 1, bgcolor: "rgb(137, 78, 238)", '&:hover': { bgcolor: 'rgb(137, 78, 238)' }, borderRadius: 2 }}>
                  Conhecer a história completa
                  <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </Box>
          </Box>

          <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'rgb(232, 229, 235)', boxShadow: 1, overflow: 'hidden' }}>
            <Box sx={{ px: 3, pt: 3, pb: 2.5, background: 'linear-gradient(135deg,rgb(247, 238, 255), rgb(248, 238, 255) 60%, #ffffff)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: 'rgba(171, 70, 229, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HeadphonesIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                    Suporte
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1.5 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.5, bgcolor: 'rgba(16,185,129,0.1)', color: '#047857', borderRadius: 2, border: '1px solid rgba(167,243,208,1)', width: 'fit-content' }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                      <Typography variant="caption" fontWeight={600}>Online agora</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <AccessTimeIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                      <Typography variant="body2">Tempo médio: 3 min</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, flexShrink: 0 }} src="https://randomuser.me/api/portraits/women/65.jpg" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ borderRadius: 3, border: '1px solid rgb(232, 229, 235)', bgcolor: '#ffffff', px: 2, py: 1.5, boxShadow: 1 }}>
                    <Typography sx={{ fontSize: 15, color: '#1f2937', lineHeight: 1.7 }}>
                      Olá! Precisa de ajuda para iniciar um DFD ou configurar seu fluxo?
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>

            <CardContent sx={{ px: 3, pb: 2.5, pt: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ borderRadius: 3, border: '1px solid rgb(233, 229, 235)', bgcolor: '#ffffff', p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>Canais de atendimento</Typography>
                  <Stack spacing={1.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: '#4f46e5', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>Chat em tempo real</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <MailOutlineIcon sx={{ fontSize: 18, color: '#4f46e5', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>suporte@fiscatus.gov.br</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <SupportIcon sx={{ fontSize: 18, color: '#4f46e5', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>Central de ajuda</Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ borderRadius: 3, border: '1px solid rgb(232, 229, 235)', bgcolor: '#ffffff', p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>SLA e horário</Typography>
                  <Stack spacing={1.25}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#16a34a', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>Suporte instantâneo</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: '#4f46e5', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>Atendimento: 8h–18h (dias úteis)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#4b5563' }}>
                      <SupportIcon sx={{ fontSize: 18, color: '#4f46e5', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15 }}>Incidentes 24/7</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </CardContent>

            <Box sx={{ px: 3, pb: 3, pt: 1.5, borderTop: '1px solid rgb(245, 243, 246)', bgcolor: 'rgba(250, 249, 251, 0.5)' }}>
              <Button fullWidth variant="contained" onClick={onOpenChat} sx={{ height: 44, gap: 1.25, fontWeight: 600, bgcolor: 'rgb(137, 78, 238)' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} /> Abrir suporte
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#6b7280', textAlign: 'center', lineHeight: 1.6 }}>
                Horário comercial: 8h às 18h — suporte 24/7 para incidentes.
              </Typography>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export { SupportSection };


