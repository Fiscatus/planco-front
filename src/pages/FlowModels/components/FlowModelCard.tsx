import React from "react";
import { Box, Card, Typography, IconButton, Chip } from "@mui/material";
import { MoreVert as MoreVertIcon, Star as StarIcon } from "@mui/icons-material";
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
};

export const FlowModelCard = ({
  model,
  isSelected,
  onClick,
  onMenuClick,
  hideMenu = false,
}: FlowModelCardProps) => {
  // ✅ Aceita string ou Date (resolve o erro do TS)
  const getTimeAgo = (date?: string | Date) => {
    if (!date) return "";
    return dayjs(date).fromNow();
  };

  const stageCount = model.stages?.length || 0;
  const timeAgo = getTimeAgo((model.updatedAt as any) || (model.createdAt as any));

  return (
    <Card
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
        <Chip
          label={model.isDefaultPlanco ? "Sistema" : "Pessoal"}
          size="small"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            bgcolor: "#F0F2F5",
            color: "#212121",
            fontWeight: 600,
          }}
        />

        {model.isDefaultPlanco && <StarIcon sx={{ fontSize: 16, color: "#F7B928" }} />}

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
    </Card>
  );
};
