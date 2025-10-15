import {
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  IconButton,
  Typography
} from '@mui/material';
import { type RefObject, useMemo, useState } from 'react';

// ATENÇÃO: Não usar <Container> aqui. Este componente é embutido na OrganizationHome.

type Props = {
  sectionRef?: RefObject<HTMLDivElement>;
  embedded?: boolean;
};

const TutorialsSection = ({ sectionRef, embedded = true }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    titulo: string;
    youtubeId: string;
    descricao: string;
    image: string;
  } | null>(null);

  const PLAYLIST_URL_TUTORIALS = 'https://www.youtube.com/watch?v=RP63r2esgb0&list=PLktMu4vFX2FADZjgsdscuhO7ISO_AZiR1';
  const videos = useMemo(
    () => [
      { 
        titulo: 'Introdução ao Planco', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Visão geral do sistema',
        image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=800&fit=crop&crop=center'
      },
      { 
        titulo: 'Modelando Fluxos', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Crie seu fluxo de trabalho',
        image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800&h=600&fit=crop&crop=center'
      },
      { 
        titulo: 'Relatórios Inteligentes', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Análise de resultados',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center'
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
        width: '100%',
        bgcolor: '#F8FAFC'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3 // 24px - dentro da especificação 16-24px
        }}
      >
        <Typography
          variant='h4'
          fontWeight={700}
          sx={{
            color: '#334155',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Aprenda a usar o sistema
        </Typography>
            <Button
              variant='text'
              onClick={() => window.open(PLAYLIST_URL_TUTORIALS, '_blank')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: '#3B82F6',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: 'transparent',
                  color: '#2563EB',
                  textDecoration: 'underline'
                }
              }}
            >
              Ver todos
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)'
              },
              gap: 4
            }}
          >
          {videos.map((v, i) => (
            <Card
              key={i.toString()}
              sx={{
                borderRadius: 3,
                boxShadow: 1,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                bgcolor: '#FFFFFF',
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  component='img'
                  src={v.image}
                  alt={v.titulo}
                  sx={{
                    width: '100%',
                    height: 240,
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setSelectedVideo(v);
                      setModalOpen(true);
                    }}
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 32 }} />
                  </IconButton>
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  fontWeight={700}
                  sx={{
                    color: '#334155',
                    mb: 1,
                    fontSize: '1.125rem'
                  }}
                >
                  {v.titulo}
                </Typography>
                <Typography
                  sx={{
                    color: '#64748B',
                    fontSize: '0.875rem'
                  }}
                >
                  {v.descricao}
                </Typography>
              </CardContent>
            </Card>
          ))}
          </Box>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth='md'
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            backgroundColor: '#000'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedVideo && (
            <>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  bgcolor: '#000'
                }}
              >
                <Box
                  component='iframe'
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.titulo}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                  sx={{
                    width: '100%',
                    height: '100%',
                    border: 0,
                    display: 'block'
                  }}
                />
              </Box>
              <Box sx={{ p: 2, bgcolor: '#fff' }}>
                <Typography
                  variant='h6'
                  fontWeight={600}
                  color='text.primary'
                >
                  {selectedVideo.titulo}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export { TutorialsSection };
