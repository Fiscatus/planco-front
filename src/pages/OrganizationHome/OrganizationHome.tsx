import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
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
    <>
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
        onNavigateHistoria={() => navigate('/historia')}
        onOpenChat={() => {
          return;
        }} //TODO: Integrar com o chat
      />

      <TutorialsSection sectionRef={tutoriaisSectionRef} />

      <FaqSection sectionRef={faqSectionRef} />
    </>
  );
};

export default OrganizationHome;
