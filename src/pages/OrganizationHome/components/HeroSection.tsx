import { Box, Button, Container, Stack, Typography } from "@mui/material";

import React from "react";

type HeroSectionProps = {
  firstName: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
};

const HeroSection: React.FC<HeroSectionProps> = ({ firstName, onPrimaryClick, onSecondaryClick }) => {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 6 }, px: { xs: 4, md: 6 }, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
          }}
        >
          <Box>
            <Stack spacing={2.5}>
              <Typography variant="h3" fontWeight={700} lineHeight={1.2}>
                {`Bem-vindo, ${firstName}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sua central para gerenciar contratações públicas de forma inteligente e integrada.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={onPrimaryClick}
                  size="large"
                  sx={{
                    bgcolor: "rgb(137, 78, 238)",
                    ":hover": { bgcolor: "rgb(137, 78, 238)" },
                  }}
                >
                  Explorar Módulos
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onSecondaryClick}
                  size="large"
                  sx={{ color: "#000", borderColor: "#000", ":hover": { borderColor: "#000", bgcolor: "rgba(0,0,0,0.04)" } }}
                >
                  Assistir Guia Rápido
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box>
            <Box sx={{ position: "relative" }}>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  mx: "auto",
                  width: { xs: "80%", md: "70%" },
                  height: { xs: 240, md: 320 },
                  top: { xs: -10, md: -20 },
                  borderRadius: 4,
                  filter: "blur(40px)",
                  opacity: 0.5,
                  background: (theme) =>
                    `radial-gradient(60% 60% at 50% 40%, ${theme.palette.primary.main}33 0%, transparent 70%)`,
                }}
              />
              <Box
                component="img"
                alt="Painel do Fiscatus"
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60"
                sx={{ position: "relative", width: "100%", height: "auto", borderRadius: 2, boxShadow: 3, display: "block" }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export { HeroSection };


