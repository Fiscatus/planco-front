import { useState, useRef } from "react";
import { Box, Button, Chip, Collapse, Dialog, DialogActions, DialogContent, IconButton, Menu, MenuItem, TextField, Tooltip, Typography, CircularProgress } from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useFiles, useUploadFile, useSendFileToApproval, useDownloadFile } from "@/hooks";

type FileStatus = "draft" | "in_review" | "approved" | "rejected";

const getStatusChip = (status?: FileStatus | string) => {
  if (status === "approved") return { label: "Aprovado", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  if (status === "in_review" || status === "pending_approval") return { label: "Em análise", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
  if (status === "rejected") return { label: "Rejeitado", bg: "#FEE2E2", color: "#B91C1C", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
  return { label: "Rascunho", bg: "#F0F2F5", color: "#64748b", icon: <DescriptionIcon sx={{ fontSize: 16 }} /> };
};

type FileRowProps = { file: any; onSendToApproval: (fileId: string) => void; onDownload: (fileId: string, inline: boolean) => void };

const FileRow = ({ file, onSendToApproval, onDownload }: FileRowProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const status = getStatusChip(file.status);
  const canSubmit = file.status === "draft" && file.category;

  return (
    <Box sx={{ px: 1.25, py: 1.1, display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#fff", "&:hover": { bgcolor: "#F8FAFC" } }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DescriptionIcon sx={{ color: "#1877F2" }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName}</Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", mt: 0.25 }}>
          Enviado por <Box component="span" sx={{ fontWeight: 700, color: "#0f172a" }}>{file.uploadedBy?.firstName} {file.uploadedBy?.lastName}</Box> • {new Date(file.createdAt).toLocaleDateString("pt-BR")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
          {file.version && <Chip label={`v${file.version}`} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
          {file.category && <Chip label={file.category} size="small" sx={{ bgcolor: "#ECFDF3", color: "#065F46", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
          <Chip icon={status.icon} label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: "0.75rem", height: 22, "& .MuiChip-icon": { color: status.color } }} />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Abrir em nova aba">
          <IconButton onClick={() => onDownload(file._id, true)} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
            <OpenInNewIcon fontSize="small" sx={{ color: "#1877F2" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Baixar arquivo">
          <IconButton onClick={() => onDownload(file._id, false)} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
            <DownloadIcon fontSize="small" sx={{ color: "#1877F2" }} />
          </IconButton>
        </Tooltip>
        {canSubmit && (
          <Tooltip title="Enviar para aprovação">
            <IconButton onClick={() => onSendToApproval(file._id)} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#16A34A", bgcolor: "#F0FDF4" } }}>
              <SendIcon fontSize="small" sx={{ color: "#16A34A" }} />
            </IconButton>
          </Tooltip>
        )}
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" } }}>
          <MoreVertIcon fontSize="small" sx={{ color: "#64748b" }} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { onDownload(file._id, true); setAnchorEl(null); }}><OpenInNewIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />Abrir em nova aba</MenuItem>
          <MenuItem onClick={() => { onDownload(file._id, false); setAnchorEl(null); }}><DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />Baixar</MenuItem>
          {canSubmit && <MenuItem onClick={() => { onSendToApproval(file._id); setAnchorEl(null); }}><SendIcon sx={{ mr: 1, fontSize: 20, color: "#16A34A" }} />Enviar para aprovação</MenuItem>}
        </Menu>
      </Box>
    </Box>
  );
};

type ProcessFilesManagementComponentProps = {
  label?: string;
  description?: string;
  context: { processId: string; stageId: string; componentKey: string };
  enabled?: boolean;
  readOnly?: boolean;
};

const FilesContent = ({
  context,
  enabled,
  readOnly = false,
}: {
  context: ProcessFilesManagementComponentProps["context"];
  enabled: boolean;
  readOnly?: boolean;
}) => {
  const { data: filesData, isLoading } = useFiles(context, enabled);
  const uploadMutation = useUploadFile();
  const sendToApprovalMutation = useSendFileToApproval();
  const downloadMutation = useDownloadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const files = filesData?.items || [];

  const filteredFiles = files.filter((file: any) => {
    const matchSearch = !search || file.fileName?.toLowerCase().includes(search.toLowerCase()) || file.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || file.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (selectedFile && category) {
      uploadMutation.mutate({ file: selectedFile, context, category }, {
        onSuccess: () => { setShowUploadModal(false); setSelectedFile(null); setCategory(""); }
      });
    }
  };

  const handleCancelUpload = () => { setShowUploadModal(false); setSelectedFile(null); setCategory(""); };

  const handleSendToApproval = (fileId: string) => sendToApprovalMutation.mutate({ fileId, context });

  const handleDownload = async (fileId: string, inline: boolean) => {
    const result = await downloadMutation.mutateAsync({ fileId, inline });
    if (result?.signedUrl) window.open(result.signedUrl, "_blank");
  };

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;

  return (
    <>
      <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          size="small" placeholder="Buscar arquivos..." value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#8A8D91", mr: 0.5 }} /> }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F0F2F5" } }}
        />
        <TextField
          select size="small" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#F0F2F5" } }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="draft">Rascunho</MenuItem>
          <MenuItem value="in_review">Em análise</MenuItem>
          <MenuItem value="approved">Aprovado</MenuItem>
          <MenuItem value="rejected">Rejeitado</MenuItem>
        </TextField>
        <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setShowUploadModal(true)}
          sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, whiteSpace: "nowrap", display: readOnly ? 'none' : undefined }}>
          Enviar arquivo
        </Button>
      </Box>

      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>{filteredFiles.length} {filteredFiles.length === 1 ? "documento" : "documentos"}</Typography>
          <Chip label="Tamanho máximo: 50MB" size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.7rem" }} />
          <Chip label="Formatos: PDF, DOC, DOCX, XLS, XLSX" size="small" sx={{ bgcolor: "#F0F2F5", color: "#64748b", fontWeight: 700, fontSize: "0.7rem" }} />
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {filteredFiles.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
            <DescriptionIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">{files.length === 0 ? "Nenhum arquivo enviado" : "Nenhum arquivo encontrado"}</Typography>
          </Box>
        ) : (
          filteredFiles.map((file: any) => (
            <FileRow key={file._id} file={file} onSendToApproval={handleSendToApproval} onDownload={handleDownload} />
          ))
        )}
      </Box>

      <Dialog open={showUploadModal} onClose={handleCancelUpload} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Enviar Documento</Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>Selecione o arquivo e preencha a categoria</Typography>
          </Box>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            {!selectedFile ? (
              <Box onClick={() => fileInputRef.current?.click()} sx={{ p: 4, border: "2px dashed #E4E6EB", borderRadius: 2, textAlign: "center", cursor: "pointer", bgcolor: "#F8FAFC", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
                <UploadIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1 }} />
                <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}>Clique para selecionar um arquivo</Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>PDF, DOC, DOCX, XLS, XLSX (máx. 50MB)</Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
                  <DescriptionIcon sx={{ color: "#1877F2" }} />
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</Typography>
                </Box>
                <Button size="small" onClick={() => fileInputRef.current?.click()} sx={{ textTransform: "none", fontWeight: 700 }}>Trocar</Button>
              </Box>
            )}
            <TextField label="Categoria *" fullWidth value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Contratos, Propostas, Relatórios" helperText="Categoria do documento para organização" disabled={!selectedFile} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button onClick={handleCancelUpload} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploadMutation.isPending || !selectedFile || !category}
            startIcon={uploadMutation.isPending ? <CircularProgress size={16} /> : <UploadIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {uploadMutation.isPending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ProcessFilesManagementComponent = ({ label, description, context, enabled = true, readOnly = false }: ProcessFilesManagementComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const headerContent = (onClose?: () => void) => (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.1rem" : "0.95rem" }}>{label || "Gerenciar arquivos"}</Typography>
        {description && (
          <Tooltip title={description} arrow>
            <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
          </Tooltip>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {onClose ? (
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
        ) : (
          <>
            <Tooltip title="Tela cheia">
              <IconButton size="small" onClick={() => setFullscreen(true)} sx={{ color: "#64748b" }}>
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={collapsed ? "Expandir" : "Recolher"}>
              <IconButton size="small" onClick={() => setCollapsed((v) => !v)} sx={{ color: "#64748b" }}>
                {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
        {headerContent()}
        <Collapse in={!collapsed}>
          <FilesContent context={context} enabled={enabled} readOnly={readOnly} />
        </Collapse>
      </Box>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {headerContent(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>
            <FilesContent context={context} enabled={enabled} readOnly={readOnly} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
