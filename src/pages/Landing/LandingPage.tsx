import { Box } from '@mui/material';
import { LandingThemeProvider, useLandingTheme } from './LandingThemeContext';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BenefitsSection } from './components/BenefitsSection';
import { SecuritySection } from './components/SecuritySection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { LandingFooter } from './components/LandingFooter';
import { DARK } from './constants';

const LandingContent = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';

  return (
    <Box sx={{
      color: dark ? DARK.text : '#1A2335',
      background: dark ? DARK.bg : '#fff',
      scrollBehavior: 'smooth',
      transition: 'background .3s, color .3s',
    }}>
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <BenefitsSection />
      <SecuritySection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </Box>
  );
};

const LandingPage = () => (
  <LandingThemeProvider>
    <LandingContent />
  </LandingThemeProvider>
);

export default LandingPage;
