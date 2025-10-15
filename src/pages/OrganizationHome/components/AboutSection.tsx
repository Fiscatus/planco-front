import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Box, Button, Card, Chip, Typography } from '@mui/material';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  onNavigateHistoria: () => void;
  embedded?: boolean;
};

const AboutSection = ({ onNavigateHistoria, embedded = true }: Props) => {
  return (
    <Card
      sx={{
        p: { xs: 4, sm: 5, lg: 5 },
        borderRadius: 3,
        boxShadow: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff'
      }}
    >
      <Typography
        variant='h5'
        fontWeight={700}
        sx={{
          color: '#050505',
          mb: 2,
          fontSize: '1.5rem'
        }}
      >
        Sobre o Sistema
      </Typography>
      <Typography
        variant='body1'
        sx={{
          color: '#65676B',
          mb: 3,
          lineHeight: 1.6,
          fontSize: '1rem'
        }}
      >
        O Planco é uma solução para contratações públicas que conecta todas as etapas do processo, do planejamento à execução contratual. Modernize seu órgão com uma ferramenta que simplifica e torna cada etapa mais clara.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        {['Instituições', 'Auditoria Interna', 'Automação'].map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size='small'
            sx={{
              bgcolor: '#E3F2FD',
              color: '#1877F2',
              fontWeight: 500,
              fontSize: '0.875rem',
              px: 2,
              py: 0.5,
              borderRadius: '9999px'
            }}
          />
        ))}
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Button
          onClick={onNavigateHistoria}
          variant='text'
          endIcon={<ArrowForwardIcon />}
          sx={{
            color: '#1877F2',
            fontWeight: 700,
            textTransform: 'none',
            p: 0,
            fontSize: '1rem',
            '&:hover': {
              bgcolor: 'transparent',
              color: '#166fe5'
            }
          }}
        >
          Conhecer a história completa
        </Button>
      </Box>
    </Card>
  );
};

export { AboutSection };
