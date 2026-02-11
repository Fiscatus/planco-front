import React from "react";
import { Box, Card, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  PushPin as PushPinIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import type { FlowModel } from "@/hooks/useFlowModels";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

type FlowModelCardProps = {
  model: FlowModel;
  isSelected: boolean;
  onClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (modelId: string) => void;
};

export const FlowModelCard = ({ model, isSelected, onClick, onMenuClick, hideMenu = false, isFavorite = false, onToggleFavorite }: FlowModelCardProps) => {
  const isSystem = model.isDefaultPlanco === true;
  const stageCount = model.stages?.length || 0;
  const timeAgo = (model.updatedAt || model.createdAt) ? dayjs(model.updatedAt || model.createdAt).fromNow() : "";

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: isSelected
          ? "0 2px 8px rgba(24, 119, 242, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        onClick={onClick}
        sx={{
          p: 2,
          cursor: "pointer",
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? "#1877F2" : "#E4E6EB",
          bgcolor: isSelected ? "#E7F3FF" : "background.paper",
          borderRadius: 2,
          transition: "all 0.2s ease-in-out",
          boxShadow: isSelected
            ? "0 2px 8px rgba(24, 119, 242, 0.15)"
            : "0 1px 3px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            bgcolor: isSelected ? "#E7F3FF" : "#F0F2F5",
            borderColor: "#1877F2",
            boxShadow: "0 2px 8px rgba(24, 119, 242, 0.15)",
            transform: "translateY(-1px)",
          },
        }}
      >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            flex: 1,
            pr: 1,
          }}
        >
          {model.name}
        </Typography>

        {/* Indicadores */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {isSystem && (
            <Tooltip title="Modelo Padrão do Sistema">
              <IconButton
                size="small"
                sx={{
                  color: "#1877F2",
                  cursor: "default",
                  padding: 0.75,
                  minWidth: "auto",
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  "&:hover": { backgroundColor: "transparent" },
                }}
              >
                <PushPinIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Favorito */}
          {!isSystem && onToggleFavorite && (
            <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(model._id);
                }}
                sx={{
                  color: isFavorite ? "#FFB800" : "text.secondary",
                  "&:hover": { color: "#FFB800" },
                }}
              >
                {isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          {/* Menu */}
          {!hideMenu && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e);
              }}
              sx={{ color: "text.secondary" }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
        <Chip
          label={isSystem ? "Sistema" : "Pessoal"}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            bgcolor: "#F0F2F5",
            color: "#212121",
            fontWeight: 600,
          }}
        />

        <Typography variant="caption" sx={{ color: "text.secondary", mx: 0.5 }}>
          •
        </Typography>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {stageCount} {stageCount === 1 ? "etapa" : "etapas"}
        </Typography>

        {timeAgo && (
          <>
            <Typography variant="caption" sx={{ color: "text.secondary", mx: 0.5 }}>
              •
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {timeAgo}
            </Typography>
          </>
        )}
      </Box>

      {model.description && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {model.description}
        </Typography>
      )}
      </Box>
    </Card>
  );
};
