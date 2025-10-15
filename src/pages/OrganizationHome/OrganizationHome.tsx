import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '@/hooks';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { HeroSection } from './components/HeroSection';
import { ModulesSection } from './components/ModulesSection';
import { SupportSection } from './components/SupportSection';
import { TutorialsSection } from './components/TutorialsSection';

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
      <HeroSection
        firstName={firstName}
        onPrimaryClick={handleScrollToModulos}
        onSecondaryClick={handleScrollToTutoriais}
      />

      <Box ref={modulosSectionRef} sx={{ mb: 4 }}>
        <ModulesSection onOpenModulo={handleModuloClick} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3,
          mb: 4,
          px: { xs: 2, sm: 4, md: 6, lg: 8 }
        }}
      >
        <AboutSection
          onNavigateHistoria={() => navigate('/historia')}
        />
        <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
          <SupportSection
            onNavigateHistoria={() => navigate('/historia')}
            onOpenChat={() => {
              return;
            }} //TODO: Integrar com o chat
          />
        </Box>
      </Box>

      <Box ref={tutoriaisSectionRef} sx={{ mb: 4 }}>
        <TutorialsSection />
      </Box>

      <Box ref={faqSectionRef}>
        <FaqSection />
      </Box>
    </Box>
  );
};

export default OrganizationHome;
