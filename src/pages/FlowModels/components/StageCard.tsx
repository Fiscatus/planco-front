import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Layers as LayersIcon,
  CheckCircle as CheckCircleIcon,
  GppGood as GppGoodIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import type { FlowModelStage } from "@/hooks/useFlowModels";

type StageCardProps = {
  stage: FlowModelStage;
  onViewDetails: () => void;

  /** Quando true, habilita menu e ações de edição */
  isEditMode?: boolean;

  /** Dispara edição dessa etapa (parent abre modal e atualiza draftStages) */
  onEditStage?: (stage: FlowModelStage) => void;

  /** Dispara exclusão dessa etapa (parent remove do draftStages) */
  onDeleteStage?: (stageId: string) => void;

  /** Dispara mover etapa (parent reordena draftStages e ajusta order) */
  onMoveStage?: (stageId: string, direction: "up" | "down") => void;

  isFirst?: boolean;
  isLast?: boolean;
};

export const StageCard = ({
  stage,
  onViewDetails,
  isEditMode = false,
  onEditStage,
  onDeleteStage,
  onMoveStage,
  isFirst = false,
  isLast = false,
}: StageCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const componentsCount = useMemo(() => {
    return Array.isArray(stage.components) ? stage.components.length : 0;
  }, [stage.components]);

  const safeStageId = String(stage.stageId || "").trim();
  const safeOrder =
    typeof stage.order === "number" && Number.isFinite(stage.order)
      ? stage.order
      : 0;

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!isEditMode) return;
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleCloseMenu();
    if (onEditStage) onEditStage(stage);
  };

  const handleMoveUp = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleCloseMenu();
    if (onMoveStage && safeStageId) onMoveStage(safeStageId, "up");
  };

  const handleMoveDown = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleCloseMenu();
    if (onMoveStage && safeStageId) onMoveStage(safeStageId, "down");
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleCloseMenu();
    if (!safeStageId) return;

    const ok = window.confirm(
      `Tem certeza que deseja excluir a etapa "${stage.name}"?\n\nIsso só será aplicado quando você clicar em "Salvar".`,
    );
    if (!ok) return;

    if (onDeleteStage) onDeleteStage(safeStageId);
  };

  const canEdit = isEditMode && !!onEditStage;
  const canMoveUp = isEditMode && !!onMoveStage && !isFirst && !!safeStageId;
  const canMoveDown = isEditMode && !!onMoveStage && !isLast && !!safeStageId;
  const canDelete = isEditMode && !!onDeleteStage && !!safeStageId;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails();
        }
      }}
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
        cursor: "pointer",
        outline: "none",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transform: "translateY(-2px)",
          borderColor: "#1877F2",
        },
        "&:focus-visible": {
          borderColor: "#1877F2",
          boxShadow: "0 0 0 3px rgba(24, 119, 242, 0.2)",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
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
              flexShrink: 0,
            }}
          >
            {safeOrder}
          </Box>

          {/* stageId */}
          <Tooltip title={safeStageId || ""}>
            <Chip
              label={safeStageId || "stage"}
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

          {isEditMode ? (
            <Chip
              label="Modo edição"
              size="small"
              sx={{
                bgcolor: "#E7F3FF",
                color: "#1877F2",
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}
        </Box>

        <IconButton
          size="small"
          sx={{
            color: isEditMode ? "#616161" : "#B0B3B8",
            "&:hover": {
              bgcolor: isEditMode ? "#F0F2F5" : "transparent",
              color: isEditMode ? "#212121" : "#B0B3B8",
            },
          }}
          onClick={handleOpenMenu}
          disabled={!isEditMode}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        {/* Menu (só no modo edição) */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleEdit} disabled={!canEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar etapa</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleMoveUp} disabled={!canMoveUp}>
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mover para cima</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleMoveDown} disabled={!canMoveDown}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mover para baixo</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleDelete} disabled={!canDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "#F02849" }} />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ sx: { color: "#F02849", fontWeight: 700 } }}
            >
              Excluir etapa
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, lineHeight: 1.3 }}
        >
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

      {/* Infos */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            icon={<LayersIcon sx={{ fontSize: 16, color: "#1877F2" }} />}
            label={`${componentsCount} ${componentsCount === 1 ? "componente" : "componentes"}`}
            size="small"
            sx={{
              bgcolor: "#E7F3FF",
              color: "#1877F2",
              fontWeight: 800,
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
              fontWeight: 800,
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
                fontWeight: 800,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ) : null}
        </Box>
      </Box>

      {/* Rodapé: ações rápidas no modo edição */}
      {isEditMode ? (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 36px 36px 36px",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={!canEdit}
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 700,
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
            Editar
          </Button>

          <Tooltip title="Mover para cima">
            <span>
              <IconButton
                onClick={handleMoveUp}
                disabled={!canMoveUp}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Mover para baixo">
            <span>
              <IconButton
                onClick={handleMoveDown}
                disabled={!canMoveDown}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Excluir etapa">
            <span>
              <IconButton
                onClick={handleDelete}
                disabled={!canDelete}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#F02849", bgcolor: "#FFF1F3" },
                }}
              >
                <DeleteIcon fontSize="small" sx={{ color: "#F02849" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : (
        // Modo view: botão único
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          variant="outlined"
          startIcon={<VisibilityIcon />}
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: 700,
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
      )}
    </Card>
  );
};
