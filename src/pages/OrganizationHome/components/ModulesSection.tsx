import {
  BarChart as BarChartIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon,
  Gavel as GavelIcon,
  Group as GroupIcon,
  ListAlt as ListAltIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import { type RefObject, useMemo } from 'react';

type Props = {
  onOpenModulo: (path: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
};

const ModulesSection = ({ onOpenModulo, sectionRef }: Props) => {
  const modulos = useMemo(
    () => [
      {
        nome: 'Planejamento da Contratação',
        descricao: 'Organize todas as fases da contratação: da demanda inicial à publicação do edital.',
        icon: (
          <FolderOpenIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
        path: '/planejamento-da-contratacao'
      },
      {
        nome: 'Gestão Contratual',
        descricao: 'Gerencie contratos e documentos de forma centralizada.',
        icon: (
          <GroupIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
        path: '/gestao-contratual'
      },
      {
        nome: 'Execução Contratual',
        descricao: 'Monitore a execução do contrato com controle de entregas, fiscalizações e aditivos.',
        icon: (
          <ListAltIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
        path: '/execucao-contratual'
      },
      {
        nome: 'Processo Licitatório',
        descricao: 'Acompanhe o processo licitatório desde a abertura até a homologação.',
        icon: (
          <GavelIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
        path: '/processo-licitatorio'
      },
      {
        nome: 'Relatórios',
        descricao: 'Visualize dados estratégicos em relatórios automáticos e dashboards personalizáveis.',
        icon: (
          <BarChartIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
        path: '/relatorios'
      },
      {
        nome: 'Configurações do Fluxo',
        descricao: 'Personalize o fluxo de trabalho e os modelos padrão conforme a instituição.',
        icon: (
          <SettingsIcon
            fontSize='small'
            sx={{ color: 'rgb(137, 78, 238)' }}
          />
        ),
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
        py: { xs: 2, md: 4 },
        px: { xs: 4, md: 6 },
        width: '100%',
        bgcolor: 'rgb(245, 245, 245)'
      }}
    >
      <Container maxWidth={false}>
        <Box sx={{ mb: 3, px: { xs: 2, md: 3 } }}>
          <Typography
            variant='h6'
            fontWeight={600}
            color='text.primary'
          >
            Módulos do Sistema
          </Typography>
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))'
            },
            gap: 2.5
          }}
        >
          {modulos.map((modulo, index) => {
            const isDisponivel = modulo.nome === 'Planejamento da Contratação';
            return (
              <Box
                key={index.toString()}
                sx={{
                  position: 'relative',
                  height: 192,
                  borderRadius: 4,
                  p: '1px',
                  background: 'linear-gradient(135deg, rgba(229,231,235,0.6), rgba(0,0,0,0))',
                  transition: 'all 200ms ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(191,219,254,0.6), rgba(216,180,254,0.6))'
                  }
                }}
              >
                <Box
                  className='inner'
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: '#ffffff',
                    border: '1px solid',
                    borderColor: 'rgba(229, 231, 235, 1)',
                    boxShadow: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'box-shadow 200ms ease',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <Box
                    sx={{
                      p: 2.5,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        pointerEvents: 'none',
                        position: 'absolute',
                        right: -24,
                        top: -24,
                        width: 80,
                        height: 80,
                        bgcolor: 'rgba(238, 219, 254, 0.4)',
                        borderRadius: '50%',
                        filter: 'blur(8px)',
                        transition: 'background-color 200ms ease',
                        '&:hover': { bgcolor: 'rgba(50, 48, 51, 0.6)' }
                      }}
                    />

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: 1.5
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          minWidth: 0
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            color: '#2563eb',
                            background: 'linear-gradient(135deg,rgb(252, 239, 255),rgb(248, 238, 255))',
                            outline: '1px solid rgb(236, 183, 250)',
                            outlineOffset: -1
                          }}
                        >
                          {modulo.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 17,
                              fontWeight: 600,
                              color: '#111827',
                              lineHeight: 1.25
                            }}
                            noWrap
                          >
                            {modulo.nome}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: '#4b5563',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {modulo.descricao}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <Button
                        onClick={() => isDisponivel && onOpenModulo(modulo.path)}
                        size='small'
                        variant='contained'
                        disabled={!isDisponivel}
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: 'rgb(137, 78, 238)',
                          color: '#ffffff',
                          textTransform: 'none',
                          fontSize: 14,
                          boxShadow: 1,
                          '&:hover': { bgcolor: '#1d4ed8' }
                        }}
                        endIcon={isDisponivel ? <ChevronRightIcon sx={{ fontSize: 18 }} /> : undefined}
                      >
                        {isDisponivel ? 'Abrir' : 'Em breve'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export { ModulesSection };
