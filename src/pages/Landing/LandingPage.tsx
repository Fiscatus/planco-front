import { Box } from '@mui/material';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { HowItWorksSection } from './components/HowItWorksSection';
import { BenefitsSection } from './components/BenefitsSection';
import { SecuritySection } from './components/SecuritySection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { LandingFooter } from './components/LandingFooter';

const LandingPage = () => (
  <Box sx={{ color: '#1A2335', background: '#fff', scrollBehavior: 'smooth' }}>
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

export default LandingPage;
