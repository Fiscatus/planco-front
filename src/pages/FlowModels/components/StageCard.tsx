import { useMemo, useState } from "react";
import { Box, Button, Chip, Dialog, DialogContent, IconButton, Tooltip, Typography } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  GppGood as GppGoodIcon,
  Layers as LayersIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import type { FlowModelStage } from "@/hooks/useFlowModels";
import { SignatureComponent } from "./SignatureComponent";
import { FilesManagementComponent } from "./FilesManagementComponent";
import { ApprovalComponent } from "./ApprovalComponent";

// Mapeamento de componentes implementados
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  SIGNATURE: SignatureComponent,
  FILES_MANAGEMENT: FilesManagementComponent,
  APPROVAL: ApprovalComponent,
};

type StageCardProps = {
  stage: FlowModelStage;
  isEditMode?: boolean;
  onEditStage?: (stage: FlowModelStage) => void;
  onDeleteStage?: (stageId: string) => void;
  onDragEnd?: (activeId: string, overId: string) => void;
};

export const StageCard = ({ stage, isEditMode = false, onEditStage, onDeleteStage, onDragEnd }: StageCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const componentsCount = useMemo(() => stage.components?.length || 0, [stage.components]);
  const safeStageId = String(stage.stageId || "").trim();
  const safeOrder = typeof stage.order === "number" && Number.isFinite(stage.order) ? stage.order : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onEditStage) {
      onEditStage(stage);
    }
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!safeStageId || !window.confirm(`Tem certeza que deseja excluir a etapa "${stage.name}"?\n\nIsso só será aplicado quando você clicar em "Salvar".`)) return;
    onDeleteStage?.(safeStageId);
  };

  const canEdit = isEditMode && !!onEditStage;
  const canDelete = isEditMode && !!onDeleteStage && !!safeStageId;

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", safeStageId);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    setIsDragOver(false);
    const activeId = e.dataTransfer.getData("text/plain");
    if (activeId && activeId !== safeStageId) onDragEnd?.(activeId, safeStageId);
  };

  return (
    <Box
      component="div"
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      sx={{
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        border: 2,
        borderColor: isDragOver ? "#1877F2" : "#E4E6EB",
        bgcolor: isDragOver ? "#F0F9FF" : "background.paper",
        borderRadius: 2,
        boxShadow: isDragging ? "0 8px 24px rgba(0, 0, 0, 0.15)" : "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease-in-out",
        cursor: isEditMode ? "grab" : "default",
        outline: "none",
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transform: isDragging ? "scale(1.02)" : "translateY(-2px)",
          borderColor: isDragOver ? "#1877F2" : "#1877F2",
        },
        "&:active": {
          cursor: isEditMode ? "grabbing" : "default",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
          {isEditMode && (
            <DragIndicatorIcon sx={{ color: "#94a3b8", fontSize: 24, cursor: "grab", "&:active": { cursor: "grabbing" } }} />
          )}
          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9375rem", boxShadow: "0 2px 4px rgba(24, 119, 242, 0.3)", flexShrink: 0 }}>
            {safeOrder}
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, lineHeight: 1.3 }}>{stage.name}</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.875rem", lineHeight: 1.5, height: 63, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>
          {stage.description?.trim() ? stage.description : "Sem descrição"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip icon={<LayersIcon sx={{ fontSize: 16, color: "#1877F2" }} />} label={`${componentsCount} ${componentsCount === 1 ? "componente" : "componentes"}`} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 800, fontSize: "0.75rem", height: 24, "& .MuiChip-icon": { ml: 0.5 } }} />
          <Chip icon={stage.requiresApproval ? <GppGoodIcon /> : <CheckCircleIcon />} label={stage.requiresApproval ? "Requer aprovação" : "Sem aprovação"} size="small" sx={{ bgcolor: stage.requiresApproval ? "#FEF3C7" : "#ECFDF3", color: stage.requiresApproval ? "#92400E" : "#065F46", fontWeight: 800, fontSize: "0.75rem", height: 24, "& .MuiChip-icon": { ml: 0.5, fontSize: 16, color: stage.requiresApproval ? "#92400E" : "#065F46" } }} />
          {stage.canRepeat && <Chip label="Pode repetir" size="small" sx={{ bgcolor: "#F0F2F5", color: "#616161", fontWeight: 800, fontSize: "0.75rem", height: 24 }} />}
        </Box>
      </Box>

      {isEditMode ? (
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }} fullWidth sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E4E6EB", color: "#212121", borderRadius: 2, fontSize: "0.875rem", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF", color: "#1877F2" } }}>Preview</Button>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} fullWidth sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E4E6EB", color: "#212121", borderRadius: 2, fontSize: "0.875rem", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF", color: "#1877F2" } }}>Editar</Button>
          <Tooltip title="Excluir etapa">
            <span>
              <IconButton onClick={handleDelete} disabled={!canDelete} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", "&:hover": { borderColor: "#F02849", bgcolor: "#FFF1F3" } }}>
                <DeleteIcon fontSize="small" sx={{ color: "#F02849" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : (
        <Box onClick={(e) => e.stopPropagation()}>
          <Button onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }} variant="outlined" startIcon={<VisibilityIcon />} fullWidth sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E4E6EB", color: "#212121", borderRadius: 2, fontSize: "0.875rem", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF", color: "#1877F2" } }}>Preview</Button>
        </Box>
      )}

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth fullScreen={previewFullscreen} maxWidth={previewFullscreen ? false : "lg"} PaperProps={{ sx: { borderRadius: previewFullscreen ? 0 : 3, overflow: "hidden" } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.25rem" }}>Preview da Etapa: {stage.name}</Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>Visualização com dados simulados • {componentsCount} {componentsCount === 1 ? "componente" : "componentes"}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => setPreviewFullscreen(!previewFullscreen)} sx={{ color: "#1877F2" }}>
                {previewFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <IconButton onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); }}><CloseIcon /></IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 3, bgcolor: "#FAFBFC", height: previewFullscreen ? "calc(100vh - 80px)" : "auto", overflow: "auto" }}>
            {stage.components && stage.components.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {stage.components.sort((a, b) => a.order - b.order).map((comp, index) => {
                  const Component = COMPONENT_MAP[comp.type];
                  return Component ? (
                    <Box key={comp.key}>
                      {index > 1 && (
                        <Box sx={{ height: 2, bgcolor: "#CBD5E1", my: 2.5, borderRadius: 0.5 }} />
                      )}
                      <Component config={comp.config} label={comp.label} description={comp.description} />
                    </Box>
                  ) : null;
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Nenhum componente adicionado nesta etapa</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
