import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Close as CloseIcon,
  HowToReg as HowToRegIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PersonOff as PersonOffIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type SignatureStatus = "assinado" | "pendente" | "recusado";
type DocumentStatus = "pendente" | "assinado" | "atrasado";

type Signer = {
  id: string;
  nome: string;
  cargo: string;
  status: SignatureStatus;
  data?: string; // "dd/mm/aaaa"
};

type DocumentInfo = {
  id: string;
  numeroProcesso?: string;
  nome?: string;
  tipo?: string;
  prazo?: string;
  status?: DocumentStatus;
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function normalizeSigners(raw: unknown): Signer[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => {
      const obj = (s ?? {}) as Record<string, unknown>;
      const id = safeString(obj.id) || safeString(obj._id) || "";
      const nome = safeString(obj.nome);
      const cargo = safeString(obj.cargo);
      const status = safeString(obj.status) as SignatureStatus;

      if (!id || !nome || !cargo) return null;
      if (status !== "assinado" && status !== "pendente" && status !== "recusado") return null;

      return {
        id,
        nome,
        cargo,
        status,
        data: safeString(obj.data) || undefined,
      } as Signer;
    })
    .filter(Boolean) as Signer[];
}

function normalizeDoc(raw: unknown): DocumentInfo | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = safeString(obj.id) || safeString(obj._id);
  if (!id) return null;

  const status = safeString(obj.status) as DocumentStatus;

  return {
    id,
    numeroProcesso: safeString(obj.numeroProcesso) || undefined,
    nome: safeString(obj.nome) || undefined,
    tipo: safeString(obj.tipo) || undefined,
    prazo: safeString(obj.prazo) || undefined,
    status: status || undefined,
  };
}

// Mocks para preview (se config não vier)
const MOCK_DOC: DocumentInfo = {
  id: "doc_mock",
  numeroProcesso: "0000/2026",
  nome: "Documento para assinatura",
  tipo: "DFD",
  prazo: "—",
  status: "pendente",
};

const MOCK_SIGNERS: Signer[] = [
  {
    id: "s1",
    nome: "Guilherme de Carvalho Silva",
    cargo: "Gerente Suprimentos e Logística",
    status: "assinado",
    data: "15/01/2025",
  },
  {
    id: "s2",
    nome: "Dallas Kelson Francisco de Souza",
    cargo: "Gerente Financeiro",
    status: "assinado",
    data: "16/01/2025",
  },
  {
    id: "s3",
    nome: "Gabriel Miranda",
    cargo: "Analista de Contratos",
    status: "pendente",
  },
];

function docStatusChip(status?: DocumentStatus) {
  if (status === "assinado") return { label: "Assinado", bg: "#ECFDF3", color: "#065F46" };
  if (status === "atrasado") return { label: "Atrasado", bg: "#FEE2E2", color: "#B91C1C" };
  return { label: "Pendente", bg: "#FEF3C7", color: "#92400E" };
}

function signerStatusChip(status: SignatureStatus) {
  if (status === "assinado") {
    return { label: "Assinado", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  }
  if (status === "recusado") {
    return { label: "Recusado", bg: "#FEE2E2", color: "#B91C1C", icon: <PersonOffIcon sx={{ fontSize: 16 }} /> };
  }
  return { label: "Pendente", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
}

function countSigned(list: Signer[]) {
  return list.filter((s) => s.status === "assinado").length;
}

type PasswordConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading?: boolean;
};

const PasswordConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  loading = false,
}: PasswordConfirmationDialogProps) => {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setPassword("");
    setShow(false);
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (loading) return;
    const pwd = safeString(password);

    if (!pwd) {
      setError("Por favor, digite sua senha");
      return;
    }
    if (pwd.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setError("");
    onConfirm(pwd);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box sx={{ p: 2.5, borderBottom: "1px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LockIcon sx={{ fontSize: 18, color: "#1877F2" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.15 }}>
                Confirmar assinatura
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
                Digite sua senha para assinar
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            label="Senha"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            disabled={loading}
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShow((v) => !v)}
                    edge="end"
                    disabled={loading}
                    aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error ? (
            <Typography variant="body2" sx={{ color: "#B91C1C", fontWeight: 800 }}>
              {error}
            </Typography>
          ) : null}

          <Box
            sx={{
              border: "1px solid #BFDBFE",
              bgcolor: "#EFF6FF",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              gap: 1.25,
              alignItems: "flex-start",
            }}
          >
            <LockIcon sx={{ fontSize: 18, color: "#2563EB", mt: "2px" }} />
            <Box>
              <Typography sx={{ fontWeight: 900, color: "#1E3A8A", fontSize: "0.9rem" }}>
                Assinatura digital segura
              </Typography>
              <Typography variant="body2" sx={{ color: "#1D4ED8", fontWeight: 700 }}>
                Sua senha será usada para validar a assinatura e garantir autenticidade e integridade.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                flex: 1,
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                flex: 1,
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                  Assinando...
                </Box>
              ) : (
                "Confirmar"
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

type SignatureModalProps = {
  open: boolean;
  onClose: () => void;
  documento: DocumentInfo;
  assinaturas: Signer[];
  canSign: boolean;
  isReadOnly: boolean;
  stageCompleted: boolean;
  onOpenFullscreen?: () => void;
  onDownloadPdf?: () => void;
  onRequestSign?: () => void;
};

const SignatureModal = ({
  open,
  onClose,
  documento,
  assinaturas,
  canSign,
  isReadOnly,
  stageCompleted,
  onOpenFullscreen,
  onDownloadPdf,
  onRequestSign,
}: SignatureModalProps) => {
  const docChip = docStatusChip(documento.status);

  const canSignNow =
    !isReadOnly &&
    canSign &&
    !stageCompleted &&
    documento.status !== "assinado";

  const signed = countSigned(assinaturas);
  const total = assinaturas.length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogContent
        sx={{
          p: 0,
          overflow: "hidden",
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Header (equivalente ao DocumentHeader antigo) */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5 },
            borderBottom: "1px solid #E4E6EB",
            flexShrink: 0,
            bgcolor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.15rem", sm: "1.25rem" } }}>
                Visualizar documento
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Visualização e assinatura digital (modo prévio)
              </Typography>

              {/* “Stepper” visual simples (substitui o progress do antigo) */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25, alignItems: "center" }}>
                <Chip
                  icon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
                  label="Visualizar"
                  size="small"
                  sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 900, "& .MuiChip-icon": { color: "#1877F2" } }}
                />
                <Chip
                  icon={<LockIcon sx={{ fontSize: 16 }} />}
                  label="Assinatura"
                  size="small"
                  sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900 }}
                />
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                  label="Conclusão"
                  size="small"
                  sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900 }}
                />
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{
                width: 40,
                height: 40,
                color: "#64748b",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Body */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: "#FAFBFC",
            flex: 1,
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            {/* LEFT: Preview + ações (equivalente ao PdfPreview antigo) */}
            <Box
              sx={{
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                overflow: "hidden",
                minHeight: { xs: 420, md: 640 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #E4E6EB" }}>
                <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.1rem" }}>
                  {documento.nome || "Documento"}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25 }}>
                  <Button
                    onClick={onOpenFullscreen}
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: "#E4E6EB",
                      color: "#212121",
                      fontWeight: 900,
                      "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
                    }}
                  >
                    Tela cheia
                  </Button>

                  <Button
                    onClick={onDownloadPdf}
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      borderColor: "#E4E6EB",
                      color: "#212121",
                      fontWeight: 900,
                      "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
                    }}
                  >
                    Baixar PDF
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  p: 3,
                }}
              >
                <PictureAsPdfIcon sx={{ fontSize: 64, color: "#1877F2" }} />
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                  Pré-visualização do documento
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", maxWidth: 520 }}>
                  O conteúdo do PDF será exibido aqui (iframe / viewer real entra depois).
                </Typography>
              </Box>
            </Box>

            {/* RIGHT: Metadados + assinaturas + ação (equivalente DocumentMetadataCard + SignatureList + ActionFooter) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Metadados */}
              <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoIcon sx={{ color: "#1877F2" }} />
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Detalhes do documento</Typography>
                </Box>

                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 900 }}>
                      Status
                    </Typography>
                    <Chip
                      label={docChip.label}
                      size="small"
                      sx={{ bgcolor: docChip.bg, color: docChip.color, fontWeight: 900 }}
                    />
                  </Box>

                  <Divider />

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 900 }}>
                      Tipo
                    </Typography>
                    <Chip
                      label={documento.tipo || "—"}
                      size="small"
                      sx={{ bgcolor: "#F0F2F5", color: "#334155", fontWeight: 900 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 900 }}>
                      Processo
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#1877F2", fontWeight: 900 }}>
                      {documento.numeroProcesso || "—"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      border: "1px solid #FECACA",
                      bgcolor: "#FEF2F2",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#B91C1C", fontWeight: 900 }}>
                      Prazo
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#B91C1C", fontWeight: 900 }}>
                      {documento.prazo || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Assinaturas */}
              <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Assinaturas</Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 900 }}>
                    {signed}/{total}
                  </Typography>
                </Box>

                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {assinaturas.map((s, idx) => {
                    const st = signerStatusChip(s.status);

                    return (
                      <Box key={s.id}>
                        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: s.status === "assinado" ? "#ECFDF3" : "#FEF3C7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 18, color: s.status === "assinado" ? "#065F46" : "#92400E" }} />
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.9rem" }}>
                              {s.nome}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 800 }}>
                              {s.cargo}
                            </Typography>

                            {s.status === "assinado" && s.data ? (
                              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, display: "block", mt: 0.25 }}>
                                Assinado em {s.data}
                              </Typography>
                            ) : s.status === "pendente" ? (
                              <Chip
                                label="Aguardando assinatura"
                                size="small"
                                sx={{
                                  mt: 0.75,
                                  bgcolor: "#FEF3C7",
                                  color: "#92400E",
                                  fontWeight: 900,
                                  height: 22,
                                }}
                              />
                            ) : null}
                          </Box>

                          <Chip
                            icon={st.icon}
                            label={st.label}
                            size="small"
                            sx={{
                              bgcolor: st.bg,
                              color: st.color,
                              fontWeight: 900,
                              "& .MuiChip-icon": { color: st.color, ml: 0.5 },
                            }}
                          />
                        </Box>

                        {idx < assinaturas.length - 1 ? <Divider sx={{ mt: 1.25 }} /> : null}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Ação */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  onClick={onRequestSign}
                  variant="contained"
                  disabled={!canSignNow}
                  startIcon={<LockIcon />}
                  sx={{
                    bgcolor: "#1877F2",
                    "&:hover": { bgcolor: "#166FE5" },
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 2,
                    boxShadow: "none",
                    flex: 1,
                    "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
                  }}
                >
                  Assinar
                </Button>

                <Button
                  onClick={onClose}
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    borderColor: "#E4E6EB",
                    color: "#212121",
                    fontWeight: 900,
                    "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
                  }}
                >
                  Fechar
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export const SignatureComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;

    const documento = normalizeDoc(raw.documento) || MOCK_DOC;
    const signers = normalizeSigners(raw.assinaturas);
    const assinaturas = signers.length ? signers : MOCK_SIGNERS;

    const canOpenModal = raw.canOpenModal === false ? false : true;
    const canSign = raw.canSign === false ? false : true;

    return { documento, assinaturas, canOpenModal, canSign };
  }, [component.config]);

  const total = cfg.assinaturas.length;
  const signed = countSigned(cfg.assinaturas);

  const docChip = docStatusChip(cfg.documento.status);

  const [modalOpen, setModalOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  const canSignNow =
    !isReadOnly &&
    cfg.canSign &&
    !stageCompleted &&
    cfg.documento.status !== "assinado";

  const openModal = () => {
    if (!cfg.canOpenModal) return;
    setModalOpen(true);
    onEvent?.("signature:modal:open", { componentKey: component.key, documentId: cfg.documento.id });
  };

  const closeModal = () => {
    setModalOpen(false);
    setPwdOpen(false);
    setSigning(false);
    onEvent?.("signature:modal:close", { componentKey: component.key, documentId: cfg.documento.id });
  };

  const requestSign = () => {
    if (!canSignNow) return;
    setPwdOpen(true);
    onEvent?.("signature:sign:promptPassword", { componentKey: component.key, documentId: cfg.documento.id });
  };

  const confirmPassword = async (password: string) => {
    if (!canSignNow) return;

    setSigning(true);
    onEvent?.("signature:sign:confirm", { componentKey: component.key, documentId: cfg.documento.id, password });

    try {
      // preview: simula sucesso
      await new Promise((r) => setTimeout(r, 1200));
      onEvent?.("signature:sign:success", { componentKey: component.key, documentId: cfg.documento.id });
      setPwdOpen(false);
    } catch {
      onEvent?.("signature:sign:failed", { componentKey: component.key, documentId: cfg.documento.id });
    } finally {
      setSigning(false);
    }
  };

  return (
    <>
      <BaseStageComponentCard
        title={component.label || "Assinaturas"}
        subtitle={component.description || "Coleta e acompanhamento de assinaturas"}
        icon={<HowToRegIcon sx={{ fontSize: 18 }} />}
        required={component.required}
        lockedAfterCompletion={component.lockedAfterCompletion}
        isReadOnly={isReadOnly}
        rightSlot={
          <Chip
            label={`${signed}/${total}`}
            size="small"
            sx={{
              bgcolor: "#E7F3FF",
              color: "#1877F2",
              fontWeight: 900,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
        }
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={cfg.documento.nome || ""}
            >
              {cfg.documento.nome || "Documento"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.75, alignItems: "center" }}>
              <Chip
                label={docChip.label}
                size="small"
                sx={{
                  bgcolor: docChip.bg,
                  color: docChip.color,
                  fontWeight: 900,
                  fontSize: "0.72rem",
                  height: 22,
                }}
              />
              {cfg.documento.numeroProcesso ? (
                <Chip
                  label={`Proc.: ${cfg.documento.numeroProcesso}`}
                  size="small"
                  sx={{
                    bgcolor: "#F0F2F5",
                    color: "#475569",
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    height: 22,
                  }}
                />
              ) : null}
              {cfg.documento.tipo ? (
                <Chip
                  label={cfg.documento.tipo}
                  size="small"
                  sx={{
                    bgcolor: "#F0F2F5",
                    color: "#475569",
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    height: 22,
                  }}
                />
              ) : null}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
            <Button
              onClick={openModal}
              variant="outlined"
              disabled={!cfg.canOpenModal}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
              }}
            >
              Abrir
            </Button>

            <Button
              onClick={requestSign}
              variant="contained"
              disabled={!canSignNow}
              startIcon={<LockIcon />}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
              }}
            >
              Assinar
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {cfg.assinaturas.map((s) => {
            const st = signerStatusChip(s.status);

            return (
              <Box
                key={s.id}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#FAFBFC",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 1.25, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: "#F0F2F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#0f172a",
                        fontSize: "0.9rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={s.nome}
                    >
                      {s.nome}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        mt: 0.25,
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={s.cargo}
                    >
                      {s.cargo}
                    </Typography>

                    {s.status === "assinado" && s.data ? (
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, display: "block", mt: 0.5 }}>
                        Assinado em {s.data}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>

                <Chip
                  icon={st.icon}
                  label={st.label}
                  size="small"
                  sx={{
                    bgcolor: st.bg,
                    color: st.color,
                    fontWeight: 900,
                    fontSize: "0.72rem",
                    height: 22,
                    "& .MuiChip-icon": { color: st.color, ml: 0.5 },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </BaseStageComponentCard>

      <SignatureModal
        open={modalOpen}
        onClose={closeModal}
        documento={cfg.documento}
        assinaturas={cfg.assinaturas}
        canSign={cfg.canSign}
        isReadOnly={isReadOnly}
        stageCompleted={stageCompleted}
        onOpenFullscreen={() => {
          onEvent?.("signature:pdf:fullscreen", { componentKey: component.key, documentId: cfg.documento.id });
        }}
        onDownloadPdf={() => {
          onEvent?.("signature:pdf:download", { componentKey: component.key, documentId: cfg.documento.id });
        }}
        onRequestSign={requestSign}
      />

      <PasswordConfirmationDialog
        open={pwdOpen}
        loading={signing}
        onClose={() => {
          if (signing) return;
          setPwdOpen(false);
          onEvent?.("signature:sign:cancel", { componentKey: component.key, documentId: cfg.documento.id });
        }}
        onConfirm={confirmPassword}
      />
    </>
  );
};
