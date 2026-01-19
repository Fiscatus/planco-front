import { Box, Card, Typography, Button, IconButton, Chip, Tooltip } from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Layers as LayersIcon,
  CheckCircle as CheckCircleIcon,
  GppGood as GppGoodIcon,
} from "@mui/icons-material";
import type { FlowModelStage } from "@/hooks/useFlowModels";

type StageCardProps = {
  stage: FlowModelStage;
  onViewDetails: () => void;
};

export const StageCard = ({ stage, onViewDetails }: StageCardProps) => {
  const componentsCount = Array.isArray(stage.components) ? stage.components.length : 0;

  return (
    <Card
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        border: 1,
        borderColor: "#E4E6EB",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          borderColor: "#1877F2",
        },
      }}
    >
      {/* Header com número e menu */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "#1877F2",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.9375rem",
              boxShadow: "0 2px 4px rgba(24, 119, 242, 0.3)",
            }}
          >
            {stage.order}
          </Box>

          {/* stageId */}
          <Tooltip title={stage.stageId || ""}>
            <Chip
              label={stage.stageId || "stage"}
              size="small"
              sx={{
                maxWidth: 160,
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            />
          </Tooltip>
        </Box>

        <IconButton
          size="small"
          sx={{
            color: "#616161",
            "&:hover": {
              bgcolor: "#F0F2F5",
              color: "#212121",
            },
          }}
          // menu ainda não implementado aqui - deixamos o botão só visual
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5, lineHeight: 1.3 }}>
          {stage.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            minHeight: 40,
          }}
        >
          {stage.description?.trim() ? stage.description : "Sem descrição"}
        </Typography>
      </Box>

      {/* Informações */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            icon={<LayersIcon sx={{ fontSize: 16, color: "#1877F2" }} />}
            label={`${componentsCount} ${componentsCount === 1 ? "componente" : "componentes"}`}
            size="small"
            sx={{
              bgcolor: "#E7F3FF",
              color: "#1877F2",
              fontWeight: 700,
              fontSize: "0.75rem",
              height: 24,
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />

          <Chip
            icon={stage.requiresApproval ? <GppGoodIcon /> : <CheckCircleIcon />}
            label={stage.requiresApproval ? "Requer aprovação" : "Sem aprovação"}
            size="small"
            sx={{
              bgcolor: stage.requiresApproval ? "#FEF3C7" : "#ECFDF3",
              color: stage.requiresApproval ? "#92400E" : "#065F46",
              fontWeight: 700,
              fontSize: "0.75rem",
              height: 24,
              "& .MuiChip-icon": {
                ml: 0.5,
                fontSize: 16,
                color: stage.requiresApproval ? "#92400E" : "#065F46",
              },
            }}
          />

          {stage.canRepeat ? (
            <Chip
              label="Pode repetir"
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#616161",
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}
        </Box>
      </Box>

      {/* Botão */}
      <Button
        variant="outlined"
        startIcon={<VisibilityIcon />}
        onClick={onViewDetails}
        fullWidth
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderColor: "#E4E6EB",
          color: "#212121",
          borderRadius: 2,
          fontSize: "0.875rem",
          "&:hover": {
            borderColor: "#1877F2",
            bgcolor: "#F0F9FF",
            color: "#1877F2",
          },
        }}
      >
        Ver Detalhes
      </Button>
    </Card>
  );
};
