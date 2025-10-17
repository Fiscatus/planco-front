import { Box, Button, Container, Typography } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
  FolderOpen as FolderOpenIcon,
  Gavel as GavelIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { type RefObject, useMemo } from 'react';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  onOpenModulo: (path: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
  embedded?: boolean;
};

const ModulesSection = ({ onOpenModulo, sectionRef, embedded = true }: Props) => {
  const modulos = useMemo(
    () => [
      {
        nome: 'Planejamento da Contratação',
        descricao: 'Organize todas as fases da contratação, da demanda inicial à publicação do edital.',
        icon: <AssignmentIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/planejamento-da-contratacao'
      },
      {
        nome: 'Processo Licitatório',
        descricao: 'Acompanhe o processo licitatório desde a abertura até a homologação.',
        icon: <GavelIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/processo-licitatorio'
      },
      {
        nome: 'Gestão Contratual',
        descricao: 'Gerencie contratos e documentos de forma centralizada.',
        icon: <FolderOpenIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/gestao-contratual'
      },
      {
        nome: 'Execução Contratual',
        descricao: 'Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.',
        icon: <AssignmentTurnedInIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/execucao-contratual'
      },
      {
        nome: 'Relatórios',
        descricao: 'Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.',
        icon: <BarChartIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/relatorios'
      },
      {
        nome: 'Configurações do Fluxo',
        descricao: 'Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.',
        icon: <SettingsIcon sx={{ fontSize: '2rem', color: '#1877F2' }} />,
        path: '/configuracoes-fluxo'
      }
    ],
    []
  );
  return (
    <Box
      ref={sectionRef}
      component='section'
      sx={{
        py: { xs: 6, md: 8 },
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        '@media (max-width: 767px)': {
          py: 4, // 32px para mobile
          px: 1.5 // 12px para mobile
        },
        width: '100%',
        bgcolor: '#f4f6f8'
      }}
    >
      <Typography
        variant='h4'
        fontWeight={700}
        sx={{
          color: '#212121',
          mb: 3, // 24px - dentro da especificação 16-24px
          fontSize: { xs: '1.75rem', md: '2rem' },
          '@media (max-width: 767px)': {
            fontSize: '1.5rem', // 24px para mobile
            mb: 2.5 // 20px para mobile
          },
          textAlign: 'center'
        }}
      >
        Módulos do Sistema
      </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: 4,
              '@media (max-width: 767px)': {
                gap: 2.5 // 20px para mobile
              }
            }}
          >
          {modulos.map((modulo, index) => {
            const isDisponivel = modulo.nome === 'Planejamento da Contratação';
            return (
              <Box
                key={index.toString()}
                sx={{
                  bgcolor: '#ffffff',
                  p: 4,
                  '@media (max-width: 767px)': {
                    p: 2.5 // 20px para mobile
                  },
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(24, 119, 242, 0.1)',
                      p: 1.5,
                      borderRadius: '50%',
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {modulo.icon}
                  </Box>
                  <Typography
                    variant='h6'
                    fontWeight={700}
                    sx={{
                      color: '#212121',
                      fontSize: '1.25rem',
                      '@media (max-width: 767px)': {
                        fontSize: '1.125rem' // 18px para mobile
                      }
                    }}
                  >
                    {modulo.nome}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: '#616161',
                    mb: 2,
                    flex: 1,
                    lineHeight: 1.6,
                    '@media (max-width: 767px)': {
                      fontSize: '0.9375rem', // 15px para mobile
                      mb: 1.5 // 12px para mobile
                    }
                  }}
                >
                  {modulo.descricao}
                </Typography>

                 <Button
                   onClick={() => isDisponivel && onOpenModulo(modulo.path)}
                   variant={isDisponivel ? 'contained' : 'outlined'}
                   disabled={!isDisponivel}
                   endIcon={isDisponivel ? <ArrowForwardIcon /> : undefined}
                   sx={{
                     alignSelf: 'flex-end',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    minWidth: '140px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    ...(isDisponivel ? {
                      bgcolor: '#1877F2',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)',
                      '&:hover': {
                        bgcolor: '#166fe5',
                        boxShadow: '0 4px 16px rgba(24, 119, 242, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                        boxShadow: '0 2px 8px rgba(24, 119, 242, 0.3)'
                      }
                    } : {
                      borderColor: '#e0e0e0',
                      color: '#9ca3af',
                      bgcolor: '#f8f9fa',
                      '&:hover': {
                        borderColor: '#d0d0d0',
                        bgcolor: '#f0f0f0'
                      }
                    }),
                    '@media (max-width: 767px)': {
                      px: 2.5,
                      py: 1.25,
                      fontSize: '0.875rem',
                      minWidth: '120px'
                    }
                  }}
                >
                  {isDisponivel ? 'Acessar' : 'Em breve'}
                </Button>
              </Box>
            );
          })}
          </Box>
    </Box>
  );
};

export { ModulesSection };
