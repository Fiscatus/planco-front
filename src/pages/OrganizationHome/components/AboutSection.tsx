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
        p: 3,
        borderRadius: 3,
        boxShadow: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff'
      }}
    >
      <Typography
        variant='h6'
        fontWeight={700}
        sx={{
          color: '#212121',
          mb: 2,
          fontSize: '1.25rem'
        }}
      >
        Sobre o Sistema
      </Typography>
      <Typography
        variant='body2'
        sx={{
          color: '#616161',
          mb: 2,
          lineHeight: 1.6
        }}
      >
        O Fiscatus é uma solução para contratações públicas que conecta todas as etapas do processo, do planejamento à execução contratual. Modernize seu órgão com uma ferramenta que simplifica e torna cada etapa mais clara.
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {['Instituições', 'Auditoria Interna', 'Automação'].map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size='small'
            variant='outlined'
            color='primary'
            sx={{
              fontWeight: 500
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
            fontWeight: 600,
            textTransform: 'none',
            p: 0,
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
