import { BarChart as BarChartIcon, ChevronRight as ChevronRightIcon, FolderOpen as FolderOpenIcon, Gavel as GavelIcon, Group as GroupIcon, ListAlt as ListAltIcon, Settings as SettingsIcon } from "@mui/icons-material";
import { Box, Container, Typography } from "@mui/material";

import { AppLayout } from "@/components";
import { HeroSection } from "./components/HeroSection";
import { ModulesSection } from "./components/ModulesSection";
import React from "react";
import { SupportSection } from "./components/SupportSection";
import { useAuth } from "@/hooks";
import { useNavigate } from "react-router-dom";

const OrganizationHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = React.useState(false);

  const modulosSectionRef = React.useRef<HTMLDivElement | null>(null);
  const tutoriaisSectionRef = React.useRef<HTMLDivElement | null>(null);

  const handleScrollToModulos = React.useCallback(() => {
    modulosSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScrollToTutoriais = React.useCallback(() => {
    tutoriaisSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // TODO: Implementar lógica para pegar o nome do usuário
  const firstName = (user?.firstName || "Usuário").split(" ")[0];

  const modulos = React.useMemo(() => [
    {
      nome: "Planejamento da Contratação",
      descricao:
        "Organize todas as fases da contratação: da demanda inicial à publicação do edital.",
      icon: <FolderOpenIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/planejamento-da-contratacao",
    },
    {
      nome: "Gestão Contratual",
      descricao: "Gerencie contratos e documentos de forma centralizada.",
      icon: <GroupIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/gestao-contratual",
    },
    {
      nome: "Execução Contratual",
      descricao:
        "Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.",
      icon: <ListAltIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/execucao-contratual",
    },
    {
      nome: "Processo Licitatório",
      descricao:
        "Acompanhe o processo licitatório desde a abertura até a homologação.",
      icon: <GavelIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/processo-licitatorio",
    },
    {
      nome: "Relatórios",
      descricao:
        "Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.",
      icon: <BarChartIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/relatorios",
    },
    {
      nome: "Configurações do Fluxo",
      descricao:
        "Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.",
      icon: <SettingsIcon fontSize="small" sx={{ color: "rgb(137, 78, 238)" }} />,
      path: "/configuracoes-fluxo",
    },
  ], []);

  const handleModuloClick = React.useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <AppLayout>
      <HeroSection
        firstName={firstName}
        onPrimaryClick={handleScrollToModulos}
        onSecondaryClick={handleScrollToTutoriais}
      />

      <ModulesSection
        modulos={modulos}
        onOpenModulo={handleModuloClick}
        sectionRef={modulosSectionRef}
      />

      <SupportSection
        onNavigateHistoria={() => navigate('/historia')}
        onOpenChat={() => setChatbotOpen(true)}
      />

      <Box ref={tutoriaisSectionRef} component="section" sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Guia Rápido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Em breve: vídeos e materiais introdutórios para acelerar seu onboarding.
          </Typography>
        </Container>
      </Box>
    </AppLayout>
  );
};

export default OrganizationHome;
