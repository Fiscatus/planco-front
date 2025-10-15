import {
  ArrowForward as ArrowForwardIcon,
  OpenInFull as OpenInFullIcon
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
        titulo: 'Introdução ao Fiscatus', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Visão geral do sistema',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgpVdkwFeAJGjjSqgdTflym6XWr27EL61IUbJGcwroWD_F2iqMjqY7jAisYotlFcq4pQk6Ike00WyqXg69Xfh4si3GMT4fuhvrw-tdbKtyT0GE2q8iwQy5t8dibTPWXHlG5mK5oyjbeGYEfTgzx1krj_sGJDNMX4RpCEdnLuJqXfEUjVRW-y3ctD384DfnGBz4Sq-3THxA2Q2V93u6jk-UaCoIqs7ig11eKRNHsUbmvkaQZjF7hOgOYEfOG6fYsZnT40aNlz8yz7A'
      },
      { 
        titulo: 'Modelando Fluxos', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Crie seu fluxo de trabalho',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjatHyRd_vNPKHAJYZbiD0c-OUaUrqqa7jiMnoDu2FhLucHLQg_88lc6hgO_L31yiIGXeAlNkLXeq1ORtjnPBJzYrTr-qfj8MEkn176njNdI4ljsbfOBbaXlqIeGc99Chy5D30jMotsGzMmdCH1usWqQM8hkPvzeRbtUCRzFVF2nn7U8XXIIWD-E8AASIH1PoAayMUWKXE_WzS8PVB7aKHzhV4b3ewrf2Vl-HpXhFcZotOkZs01EEQ8hKZJL72UmRi4LBCVeM2pPM'
      },
      { 
        titulo: 'Relatórios Inteligentes', 
        youtubeId: 'ZR_6Z1IDD8s',
        descricao: 'Análise de resultados',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHQY89-jZxie4EH5if-0xArIpgOE1L0AZtHi9kDVYuBzXjKdFMuHv61g_vZhnO_RaJiM0E0PKTNNZJ5unzne73LhBQTJFzt0nZmZD4bw1L8SxoFnJVEmIEMtSEoSUUTYzRqoCEqZTPAAdAiq3HV7CNZZ4TM6ulTNiOsq-EjadxDrpCye2RaqvpxmTSAZJ5s0CBizMpqSbvJQeFzlvGsFPgCAENV97V5pbQezEBKJ-8mB1V96c09y1QC5X7X6_BVg1hi3hAcBBUE3c'
      }
    ],
    []
  );

  return (
    <Box
      ref={sectionRef}
      component='section'
      sx={{
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 4, md: 6, lg: 8 },
        width: '100%',
        bgcolor: '#f4f6f8'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4
        }}
      >
        <Typography
          variant='h4'
          fontWeight={700}
          sx={{
            color: '#212121',
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Tutoriais & Recursos
        </Typography>
            <Button
              variant='text'
              onClick={() => window.open(PLAYLIST_URL_TUTORIALS, '_blank')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: '#1877F2',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { 
                  bgcolor: 'transparent',
                  color: '#166fe5'
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
              gap: 3
            }}
          >
          {videos.map((v, i) => (
            <Card
              key={i.toString()}
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box
                component='img'
                src={v.image}
                alt={v.titulo}
                sx={{
                  width: '100%',
                  height: 192,
                  objectFit: 'cover'
                }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  fontWeight={700}
                  sx={{
                    color: '#212121',
                    mb: 1,
                    fontSize: '1.125rem'
                  }}
                >
                  {v.titulo}
                </Typography>
                <Typography
                  sx={{
                    color: '#616161',
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
