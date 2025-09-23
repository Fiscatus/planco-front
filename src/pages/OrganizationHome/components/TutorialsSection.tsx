import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";

import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import React from "react";

type TutorialsSectionProps = {
  sectionRef?: React.RefObject<HTMLDivElement>;
};

const TutorialsSection: React.FC<TutorialsSectionProps> = ({ sectionRef }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState<{
    titulo: string;
    youtubeId: string;
  } | null>(null);

  const PLAYLIST_URL_TUTORIALS =
    "https://www.youtube.com/watch?v=RP63r2esgb0&list=PLktMu4vFX2FADZjgsdscuhO7ISO_AZiR1";
  const videos = React.useMemo(
    () => [
      { titulo: "Introdução ao Fiscatus", youtubeId: "ZR_6Z1IDD8s" },
      { titulo: "Modelando Fluxos", youtubeId: "ZR_6Z1IDD8s" },
      { titulo: "Relatórios Inteligentes", youtubeId: "ZR_6Z1IDD8s" },
    ],
    []
  );

  return (
    <Box
      ref={sectionRef}
      component="section"
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 6, md: 8 },
        width: "100%",
        bgcolor: "rgb(245, 245, 245)",
        overflow: "hidden",
      }}
    >
      <Container maxWidth={false}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Tutoriais & Recursos
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => window.open(PLAYLIST_URL_TUTORIALS, "_blank")}
            sx={{
              color: "rgb(137, 78, 238)",
              ":hover": { color: "#1d4ed8" },
              fontWeight: "bold",
            }}
          >
            Ver todos os tutoriais
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            justifyContent: "center",
          }}
        >
          {videos.map((v, i) => (
            <Box
              key={i}
              sx={{
                width: { xs: "100%", md: "auto" },
                position: "relative",
                zIndex: 0,
                p: 2,
              }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "rgba(229,231,235,1)",
                  boxShadow: 1,
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 3.75, pb: 3.125 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3.125,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {v.titulo}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedVideo(v);
                        setModalOpen(true);
                      }}
                      sx={{
                        color: "rgb(137, 78, 238)",
                        "&:hover": {
                          backgroundColor: "rgba(137, 78, 238, 0.1)",
                        },
                      }}
                    >
                      <OpenInFullIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 10",
                      bgcolor: "#000",
                      borderRadius: 2.5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="iframe"
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      title={v.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sx={{
                        width: "100%",
                        height: "100%",
                        border: 0,
                        display: "block",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            backgroundColor: "#000",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          {selectedVideo && (
            <>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  bgcolor: "#000",
                }}
              >
                <Box
                  component="iframe"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    display: "block",
                  }}
                />
              </Box>
              <Box sx={{ p: 2, bgcolor: "#fff" }}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
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
