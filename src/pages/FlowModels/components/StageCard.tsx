import { useMemo, useState } from "react";
import { Box, Button, Chip, Collapse, Dialog, DialogContent, IconButton, Tooltip, Typography, TextField, DialogActions, Alert } from "@mui/material";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Layers as LayersIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import type { FlowModelStage } from "@/hooks/useFlowModels";
import { SignatureComponent } from "./SignatureComponent";
import { FilesManagementComponent } from "./FilesManagementComponent";
import { ApprovalComponent } from "./ApprovalComponent";
import { TimelineComponent } from "./TimelineComponent";
import { CommentsComponent } from "./CommentsComponent";
import { ChecklistComponent } from "./ChecklistComponent";
import { FormComponent } from "./FormComponent";

// Mapeamento de componentes implementados
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  SIGNATURE: SignatureComponent,
  FILES_MANAGEMENT: FilesManagementComponent,
  APPROVAL: ApprovalComponent,
  TIMELINE: TimelineComponent,
  COMMENTS: CommentsComponent,
  CHECKLIST: ChecklistComponent,
  FORM: FormComponent,
};

type StageCardProps = {
  stage: FlowModelStage;
  isEditMode?: boolean;
  onEditStage?: (stage: FlowModelStage) => void;
  onDeleteStage?: (stageId: string) => void;
  onDuplicateStage?: (stage: FlowModelStage) => void;
  onDragEnd?: (activeId: string, overId: string) => void;
};

export const StageCard = ({ stage, isEditMode = false, onEditStage, onDeleteStage, onDuplicateStage, onDragEnd }: StageCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceReason, setAdvanceReason] = useState("");
  const [stageCompleted, setStageCompleted] = useState<boolean | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    if (!safeStageId) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (safeStageId) {
      onDeleteStage?.(safeStageId);
      setDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateStage) {
      const duplicated: FlowModelStage = {
        ...stage,
        stageId: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${stage.name} (Cópia)`,
        order: stage.isOptional ? 0 : undefined,
      };
      onDuplicateStage(duplicated);
    }
  };

  const canEdit = isEditMode && !!onEditStage;
  const canDelete = isEditMode && !!onDeleteStage && !!safeStageId;

  const handleDragStart = (e: React.DragEvent) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.tagName === 'BUTTON' || target.closest('[role="button"]')) {
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
        borderColor: isDragOver ? "#1877F2" : (stage.isOptional ? "#9333EA" : "#E4E6EB"),
        bgcolor: isDragOver ? "#F0F9FF" : (stage.isOptional ? "#FAF5FF" : "background.paper"),
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
          borderColor: isDragOver ? "#1877F2" : (stage.isOptional ? "#9333EA" : "#1877F2"),
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
          <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: stage.isOptional ? "#9333EA" : "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9375rem", boxShadow: stage.isOptional ? "0 2px 4px rgba(147, 51, 234, 0.3)" : "0 2px 4px rgba(24, 119, 242, 0.3)", flexShrink: 0 }}>
            {stage.isOptional ? "?" : safeOrder}
          </Box>
          {stage.isOptional && (
            <Chip label="OPCIONAL" size="small" sx={{ bgcolor: "#9333EA", color: "white", fontWeight: 800, fontSize: "0.7rem", height: 22 }} />
          )}
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
          {stage.businessDaysDuration !== undefined && stage.businessDaysDuration > 0 && (
            <Chip icon={<CalendarIcon sx={{ fontSize: 16, color: "#7C3AED" }} />} label={`${stage.businessDaysDuration} ${stage.businessDaysDuration === 1 ? "dia útil" : "dias úteis"}`} size="small" sx={{ bgcolor: "#F5F3FF", color: "#7C3AED", fontWeight: 800, fontSize: "0.75rem", height: 24, "& .MuiChip-icon": { ml: 0.5 } }} />
          )}
        </Box>
      </Box>

      {isEditMode ? (
        <Box onClick={(e) => e.stopPropagation()} sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }} fullWidth sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E4E6EB", color: "#212121", borderRadius: 2, fontSize: "0.875rem", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF", color: "#1877F2" } }}>Preview</Button>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit} fullWidth sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E4E6EB", color: "#212121", borderRadius: 2, fontSize: "0.875rem", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF", color: "#1877F2" } }}>Editar</Button>
          <Tooltip title="Duplicar etapa">
            <span>
              <IconButton onClick={handleDuplicate} disabled={!onDuplicateStage} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
                <ContentCopyIcon fontSize="small" sx={{ color: "#1877F2" }} />
              </IconButton>
            </span>
          </Tooltip>
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

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth fullScreen={previewFullscreen} maxWidth={previewFullscreen ? false : "lg"} PaperProps={{ sx: { borderRadius: previewFullscreen ? 0 : 3, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: previewFullscreen ? "100vh" : "90vh" } }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.25rem" }}>Preview da Etapa: {stage.name}</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>Visualização com dados simulados • {componentsCount} {componentsCount === 1 ? "componente" : "componentes"}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              startIcon={<UnfoldMoreIcon />}
              onClick={() => {
                const allExpanded: Record<string, boolean> = {};
                stage.components?.forEach(comp => { allExpanded[comp.key] = true; });
                setExpandedComponents(allExpanded);
              }}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" }}
            >
              Abrir Todos
            </Button>
            <Button
              size="small"
              startIcon={<UnfoldLessIcon />}
              onClick={() => {
                const allCollapsed: Record<string, boolean> = {};
                stage.components?.forEach(comp => { allCollapsed[comp.key] = false; });
                setExpandedComponents(allCollapsed);
              }}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8125rem" }}
            >
              Recolher Todos
            </Button>
            <IconButton onClick={() => setPreviewFullscreen(!previewFullscreen)} sx={{ color: "#1877F2" }}>
              {previewFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); }}><CloseIcon /></IconButton>
          </Box>
        </Box>
        <Box sx={{ p: 3, bgcolor: "#FAFBFC", overflow: "auto", flex: 1 }}>
          {stage.components && stage.components.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {stage.components.sort((a, b) => a.order - b.order).map((comp) => {
                  const Component = COMPONENT_MAP[comp.type];
                  const isExpanded = expandedComponents[comp.key] ?? true;
                  return Component ? (
                    <Box key={comp.key} sx={{ position: "relative" }}>
                      <IconButton
                        onClick={() => setExpandedComponents(prev => ({ ...prev, [comp.key]: !isExpanded }))}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          bgcolor: "white",
                          border: "1px solid #E4E6EB",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s",
                          "&:hover": { bgcolor: "#F8FAFC" }
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                      <Collapse in={isExpanded}>
                        <Component config={comp.config} label={comp.label} description={comp.description} />
                      </Collapse>
                      {!isExpanded && (
                        <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, border: "1px solid #E4E6EB", pr: 6, display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a" }}>{comp.label}</Typography>
                          {comp.description && (
                            <Tooltip title={comp.description} arrow>
                              <InfoIcon sx={{ fontSize: 20, color: "primary.main", cursor: "help" }} />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  ) : null;
                })}              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" sx={{ color: "#64748b" }}>Nenhum componente adicionado nesta etapa</Typography>
              </Box>
            )}
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <Button
              variant="contained"
              startIcon={<ArrowForwardIcon />}
              onClick={() => setAdvanceModalOpen(true)}
              sx={{
                bgcolor: "#1877F2",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                "&:hover": { bgcolor: "#166FE5" },
              }}
            >
              Avançar Etapa
          </Button>
        </Box>
      </Dialog>

      <Dialog open={advanceModalOpen} onClose={() => setAdvanceModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Avançar Etapa</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>Confirme se a etapa foi completamente finalizada</Typography>
          </Box>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Alert severity="warning" icon={<WarningIcon />} sx={{ borderRadius: 2, fontWeight: 600 }}>
              Revise todos os pontos antes de continuar! Essa ação não pode ser desfeita!
            </Alert>
            <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "1rem", textAlign: "center" }}>
              A etapa foi completamente finalizada?
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant={stageCompleted === true ? "contained" : "outlined"}
                onClick={() => setStageCompleted(true)}
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.5,
                  bgcolor: stageCompleted === true ? "#1877F2" : "transparent",
                  borderColor: stageCompleted === true ? "#1877F2" : "#E4E6EB",
                  color: stageCompleted === true ? "#fff" : "#0f172a",
                  "&:hover": {
                    bgcolor: stageCompleted === true ? "#166FE5" : "#F0F9FF",
                    borderColor: "#1877F2",
                  },
                }}
              >
                Sim
              </Button>
              <Button
                variant={stageCompleted === false ? "contained" : "outlined"}
                onClick={() => setStageCompleted(false)}
                fullWidth
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  py: 1.5,
                  bgcolor: stageCompleted === false ? "#F02849" : "transparent",
                  borderColor: stageCompleted === false ? "#F02849" : "#E4E6EB",
                  color: stageCompleted === false ? "#fff" : "#0f172a",
                  "&:hover": {
                    bgcolor: stageCompleted === false ? "#DC2626" : "#FFF1F3",
                    borderColor: "#F02849",
                  },
                }}
              >
                Não
              </Button>
            </Box>
            {stageCompleted === false && (
              <TextField
                label="Explique aqui o motivo de não ter finalizado a etapa"
                fullWidth
                multiline
                rows={4}
                value={advanceReason}
                onChange={(e) => setAdvanceReason(e.target.value)}
                disabled
                placeholder="Descreva o motivo... (bloqueado no preview)"
                InputProps={{
                  endAdornment: <LockIcon sx={{ color: "#94a3b8", fontSize: 20 }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#F8F9FA",
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button
            onClick={() => { setAdvanceModalOpen(false); setAdvanceReason(""); setStageCompleted(null); }}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, borderColor: "#E4E6EB" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={stageCompleted === null}
            onClick={() => { setAdvanceModalOpen(false); setAdvanceReason(""); setStageCompleted(null); }}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, "&:hover": { bgcolor: "#166FE5" }, "&:disabled": { bgcolor: "#CBD5E1" } }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <Box sx={{ bgcolor: "#FEE2E2", borderRadius: "50%", p: 1.5, mb: 2 }}>
              <DeleteIcon sx={{ fontSize: 32, color: "#DC2626" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Excluir etapa?
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
              Tem certeza que deseja excluir a etapa
            </Typography>
            <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600, mb: 2 }}>
              "{stage.name}"?
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", mb: 3 }}>
              Isso só será aplicado quando você clicar em "Salvar".
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                variant="outlined"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  borderColor: "#E4E6EB",
                  color: "#212121",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                variant="contained"
                fullWidth
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  bgcolor: "#DC2626",
                  "&:hover": { bgcolor: "#B91C1C" },
                }}
              >
                Excluir
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
