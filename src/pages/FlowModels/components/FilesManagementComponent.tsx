import { useState } from "react";
import { Box, Button, Chip, IconButton, Menu, MenuItem, Typography, Tooltip, TextField, InputAdornment, Select, FormControl } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

type FileStatus = "draft" | "in_review" | "approved" | "rejected";
type FileItem = {
  id: string;
  name: string;
  category?: string;
  createdBy?: string;
  createdAt?: string;
  reviewStatus?: FileStatus;
  version?: number;
};

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "Contrato_Fornecedor.pdf", category: "Contratos", createdBy: "João Silva", createdAt: "2025-01-15T10:30:00", reviewStatus: "approved", version: 2 },
  { id: "2", name: "Proposta_Comercial.docx", category: "Propostas", createdBy: "Maria Santos", createdAt: "2025-01-16T14:20:00", reviewStatus: "in_review", version: 1 },
  { id: "3", name: "Planilha_Custos.xlsx", createdBy: "Pedro Costa", createdAt: "2025-01-17T09:15:00", reviewStatus: "draft", version: 1 },
];

const getStatusChip = (status?: FileStatus) => {
  if (status === "approved") return { label: "Aprovado", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  if (status === "in_review") return { label: "Em análise", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
  if (status === "rejected") return { label: "Rejeitado", bg: "#FEE2E2", color: "#B91C1C", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
  return { label: "Rascunho", bg: "#F0F2F5", color: "#64748b", icon: <DescriptionIcon sx={{ fontSize: 16 }} /> };
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const FileRow = ({ file, hasApproval }: { file: FileItem; hasApproval: boolean }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const status = getStatusChip(file.reviewStatus);

  const canSubmit = file.reviewStatus === "draft" && file.category;
  const isInReview = file.reviewStatus === "in_review";

  return (
    <Box sx={{ px: 1.25, py: 1.1, display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#fff", "&:hover": { bgcolor: "#F8FAFC" } }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DescriptionIcon sx={{ color: "#1877F2" }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", mt: 0.25 }}>
          Enviado por <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{file.createdBy || "—"}</Box> • {formatDate(file.createdAt)}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
          {file.version && <Chip label={`v${file.version}`} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
          {file.category && <Chip label={file.category} size="small" sx={{ bgcolor: "#ECFDF3", color: "#065F46", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
          <Chip icon={status.icon} label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.75rem", height: 22, "& .MuiChip-icon": { color: status.color } }} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Abrir em nova guia">
          <IconButton sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
            <OpenInNewIcon fontSize="small" sx={{ color: "#1877F2" }} />
          </IconButton>
        </Tooltip>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" } }}>
          <MoreVertIcon fontSize="small" sx={{ color: "#64748b" }} />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
            Baixar
          </MenuItem>
          {canSubmit && (
            <MenuItem disabled>
              <SendIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
              Enviar para análise
            </MenuItem>
          )}
          {!isInReview && (
            <MenuItem disabled>
              <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#F02849" }} />
              Remover
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
};

export const FilesManagementComponent = ({ config, label, description }: { config?: { hasApproval?: boolean }; label?: string; description?: string }) => {
  const hasApproval = config?.hasApproval || false;
  const files = MOCK_FILES;

  return (
    <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{label || "Gerenciar arquivos"}</Typography>
          {description && (
            <Tooltip title={description} arrow>
              <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>{files.length} {files.length === 1 ? "documento" : "documentos"}</Typography>
          </Box>
          <Button disabled variant="contained" startIcon={<UploadIcon />} sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            Enviar arquivo
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            placeholder="Modo de visualização"
            value=""
            disabled
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#64748b", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value="recent"
              disabled
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon sx={{ color: "#64748b", fontSize: 20 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="recent">Mais recentes</MenuItem>
              <MenuItem value="oldest">Mais antigos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label="Tamanho máximo: 50MB" size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.7rem" }} />
          <Chip label="Formatos: PDF, DOC, DOCX, XLS, XLSX" size="small" sx={{ bgcolor: "#F0F2F5", color: "#64748b", fontWeight: 700, fontSize: "0.7rem" }} />
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {files.map((file) => (
          <FileRow key={file.id} file={file} hasApproval={hasApproval} />
        ))}
      </Box>
    </Box>
  );
};
