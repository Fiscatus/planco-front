import {
  ArrowForward as ArrowForwardIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  BarChart as BarChartIcon,
  FolderOpen as FolderOpenIcon,
  Gavel as GavelIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type RefObject, useMemo } from 'react';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  onOpenModulo: (path: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
  embedded?: boolean;
};

const ModulesSection = ({ onOpenModulo, sectionRef, embedded = true }: Props) => {
  const theme = useTheme();
  const modulos = useMemo(
    () => [
      {
        nome: 'Planejamento da Contratação',
        descricao: 'Organize todas as fases da contratação, da demanda inicial à publicação do edital.',
        icon: <AssignmentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
        path: '/planejamento-da-contratacao'
      },
      {
        nome: 'Processo Licitatório',
        descricao: 'Acompanhe o processo licitatório desde a abertura até a homologação.',
        icon: <GavelIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
        path: '/processo-licitatorio'
      },
      {
        nome: 'Gestão Contratual',
        descricao: 'Gerencie contratos e documentos de forma centralizada.',
        icon: <FolderOpenIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
        path: '/gestao-contratual'
      },
      {
        nome: 'Execução Contratual',
        descricao: 'Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.',
        icon: <AssignmentTurnedInIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
        path: '/execucao-contratual'
      },
      {
        nome: 'Relatórios',
        descricao: 'Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.',
        icon: <BarChartIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
        path: '/relatorios'
      },
      {
        nome: 'Configurações do Fluxo',
        descricao: 'Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.',
        icon: <SettingsIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
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
        bgcolor: 'background.default'
      }}
    >
      <Typography
        variant='h4'
        fontWeight={700}
        sx={{
          color: 'text.primary',
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
                bgcolor: 'background.paper',
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
                    bgcolor: theme.palette.primary.main + '1A',
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
                    color: 'text.primary',
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
                  color: 'text.secondary',
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
                  ...(isDisponivel
                    ? {
                        bgcolor: 'primary.main',
                        color: 'common.white',
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}4D`,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          boxShadow: `0 4px 16px ${theme.palette.primary.main}66`,
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0px)',
                          boxShadow: `0 2px 8px ${theme.palette.primary.main}4D`
                        }
                      }
                    : {
                        borderColor: 'divider',
                        color: 'text.disabled',
                        bgcolor: 'grey.50',
                        '&:hover': {
                          borderColor: 'divider',
                          bgcolor: 'grey.100'
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
