import { Box, Container, Typography } from "@mui/material";

import { AppLayout } from "@/components";
import { FaqSection } from "./components/FaqSection";
import { HeroSection } from "./components/HeroSection";
import { ModulesSection } from "./components/ModulesSection";
import React from "react";
import { SupportSection } from "./components/SupportSection";
import { TutorialsSection } from "./components/TutorialsSection";
import { useAuth } from "@/hooks";
import { useNavigate } from "react-router-dom";

const OrganizationHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = React.useState(false);

  const modulosSectionRef = React.useRef<HTMLDivElement | null>(null);
  const tutoriaisSectionRef = React.useRef<HTMLDivElement | null>(null);
  const faqSectionRef = React.useRef<HTMLDivElement | null>(null);

  const handleScrollToModulos = React.useCallback(() => {
    modulosSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScrollToTutoriais = React.useCallback(() => {
    tutoriaisSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // TODO: Implementar lógica para pegar o nome do usuário
  const firstName = (user?.firstName || "Usuário").split(" ")[0];

  const handleModuloClick = React.useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <AppLayout>
      <HeroSection
        firstName={firstName}
        onPrimaryClick={handleScrollToModulos}
        onSecondaryClick={handleScrollToTutoriais}
      />

      <ModulesSection
        onOpenModulo={handleModuloClick}
        sectionRef={modulosSectionRef}
      />

      <SupportSection
        onNavigateHistoria={() => navigate("/historia")}
        onOpenChat={() => setChatbotOpen(true)}
      />

      <TutorialsSection sectionRef={tutoriaisSectionRef} />

      <FaqSection sectionRef={faqSectionRef} />
    </AppLayout>
  );
};

export default OrganizationHome;
