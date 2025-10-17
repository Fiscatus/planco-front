import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '@/hooks';
import { FaqSection } from './components/FaqSection';
import { HeroSection } from './components/HeroSection';
import { ModulesSection } from './components/ModulesSection';
import { SupportSection } from './components/SupportSection';
import { TutorialsSection } from './components/TutorialsSection';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const OrganizationHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const modulosSectionRef = useRef<HTMLDivElement | null>(null);
  const tutoriaisSectionRef = useRef<HTMLDivElement | null>(null);
  const faqSectionRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToModulos = useCallback(() => {
    modulosSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScrollToTutoriais = useCallback(() => {
    tutoriaisSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const firstName = (user?.firstName || 'Usuário').split(' ')[0];

  const handleModuloClick = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1️⃣ Hero / Boas-vindas */}
      <HeroSection
        firstName={firstName}
        onPrimaryClick={handleScrollToModulos}
        onSecondaryClick={handleScrollToTutoriais}
      />

      {/* 2️⃣ Módulos do Sistema */}
      <Box ref={modulosSectionRef} sx={{ 
        mb: { xs: 8, md: 12 },
        '@media (max-width: 767px)': {
          mb: 6 // 48px para mobile
        }
      }}>
        <ModulesSection onOpenModulo={handleModuloClick} />
      </Box>

      {/* 3️⃣ Tutoriais & Recursos (ou Aprenda a usar / Comece por aqui) */}
      <Box ref={tutoriaisSectionRef} sx={{ 
        mb: { xs: 8, md: 12 },
        '@media (max-width: 767px)': {
          mb: 6 // 48px para mobile
        }
      }}>
        <TutorialsSection />
      </Box>

      {/* 4️⃣ FAQ + Suporte (60/40) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '7fr 5fr', md: '7.2fr 4.8fr' }, // 60/40 responsivo
          gap: { xs: 6, sm: 6, md: 8 },
          mb: { xs: 8, md: 12 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          '@media (max-width: 767px)': {
            gap: 4, // 32px para mobile
            mb: 6, // 48px para mobile
            px: 1.5 // 12px para mobile
          },
          alignItems: 'start'
        }}
      >
        <Box ref={faqSectionRef} sx={{ minHeight: 'fit-content' }}>
          <FaqSection />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          position: 'sticky',
          top: 24,
          '@media (max-width: 767px)': {
            position: 'static', // Remove sticky no mobile
            top: 'auto'
          }
        }}>
          <SupportSection
            onNavigateHistoria={() => navigate('/historia')}
            onOpenChat={() => {
              return;
            }} //TODO: Integrar com o chat
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OrganizationHome;
