import { Box, Chip, Typography } from "@mui/material";
import type { ReactNode } from "react";

type BaseStageComponentCardProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  required?: boolean;
  lockedAfterCompletion?: boolean;
  isReadOnly?: boolean;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export const BaseStageComponentCard = ({
  title,
  subtitle,
  icon,
  required,
  lockedAfterCompletion,
  isReadOnly,
  rightSlot,
  children,
}: BaseStageComponentCardProps) => {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid #E4E6EB",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease-in-out",

        // ✅ fundamental no modal/preview (evita estourar grid/flex internos)
        width: "100%",
        minWidth: 0,

        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          borderColor: "#1877F2",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          bgcolor: "#FAFBFC",
          borderBottom: "1px solid #E4E6EB",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            alignItems: "center",
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "#E7F3FF",
              color: "#1877F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 800,
                color: "#212121",
                fontSize: "0.95rem",
                lineHeight: 1.2,

                // ✅ permite quebrar linha e evita “empurrar” o header no modal
                whiteSpace: "normal",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </Typography>

            {subtitle ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#616161",
                  mt: 0.25,
                  fontSize: "0.8125rem",
                  lineHeight: 1.4,

                  // ✅ permite quebrar linha e evita overflow
                  whiteSpace: "normal",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {required ? (
            <Chip
              label="Obrigatório"
              size="small"
              sx={{
                bgcolor: "#FEF3C7",
                color: "#92400E",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}

          {lockedAfterCompletion ? (
            <Chip
              label="Trava ao concluir"
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#212121",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}

          {isReadOnly ? (
            <Chip
              label="Somente leitura"
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}

          {rightSlot}
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: 2.5,
          py: 2.25,

          // ✅ fundamental: evita grids internos “vazarem” e bagunçar tudo
          width: "100%",
          minWidth: 0,

          // ✅ garante que o componente renderizado ocupe o card corretamente
          "& > *": {
            width: "100%",
            minWidth: 0,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
