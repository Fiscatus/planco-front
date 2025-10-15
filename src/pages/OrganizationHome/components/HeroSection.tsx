import { 
  Explore as ExploreIcon,
  PlayCircleOutline as PlayCircleOutlineIcon
} from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

type Props = {
  firstName: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

const HeroSection = ({ firstName, onPrimaryClick, onSecondaryClick }: Props) => {
  return (
    <Box
      component='section'
      sx={{
        py: { xs: 4, md: 6 },
        width: '100%'
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 8 },
            maxWidth: '1400px',
            mx: 'auto'
          }}
        >
          <Box sx={{ 
            width: { xs: '100%', md: '50%' },
            pr: { md: 3 }
          }}>
            <Stack spacing={3}>
              <Typography
                variant='h3'
                fontWeight={700}
                lineHeight={1.2}
                sx={{
                  fontSize: { xs: '2.5rem', md: '3rem', lg: '3.5rem' },
                  color: '#212121'
                }}
              >
                {`Bem-vindo, ${firstName}`}
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  color: '#616161',
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.5
                }}
              >
                Sua central para gerenciar contratações públicas de forma inteligente e eficiente.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mt: 1 }}
              >
                <Button
                  variant='contained'
                  onClick={onPrimaryClick}
                  size='large'
                  startIcon={<ExploreIcon />}
                  sx={{
                    bgcolor: '#1877F2',
                    color: 'white',
                    fontWeight: 500,
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': { 
                      bgcolor: '#166fe5',
                      boxShadow: 3
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Explorar Módulos
                </Button>
                <Button
                  variant='outlined'
                  onClick={onSecondaryClick}
                  size='large'
                  startIcon={<PlayCircleOutlineIcon />}
                  sx={{
                    color: '#1877F2',
                    borderColor: '#1877F2',
                    fontWeight: 500,
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1877F2',
                      bgcolor: 'rgba(24, 119, 242, 0.08)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Assistir Guia Rápido
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ 
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box
              component='img'
              alt='Ilustração de pessoas trabalhando em um painel de gestão'
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuCzDZxPcdJDNdIjBYluSPR-2q0iVOBgox7Z8ekNJaFwTvTrjgGvPoL-eOeiMUJmGfD2nhi09TspVlhl2lPvYdOW9z8-biWeMQt1xOZHKO1fSKbAuYIOZqahnkjBSq0o1wrCAiAgBkjnLuRVl2ngdnv5M9ufkb9jzmvtyluSoO2CAvDU2PeqHa54u3SBP-2q5fkdF1RKCLkUX6x9-6YcrBbLzgByjFhGQGGkaL6xG-R4VrNl9qv1NKnxOvU1DPTxXSU-O_8-GG6rFWY'
              sx={{
                width: '100%',
                maxWidth: 500,
                height: 'auto',
                borderRadius: 2,
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export { HeroSection };
