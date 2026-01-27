import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  CircularProgress,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Timeline as TimelineIcon,
  FilterAlt as FilterAltIcon,
  Search as SearchIcon,
  OpenInFull as OpenInFullIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  FilePresent as FilePresentIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type TimelineItemType = "status" | "versao" | "comentario" | "arquivo" | "acao" | "sistema";
type TimelineItemSeverity = "info" | "success" | "warning" | "danger";

type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  type: TimelineItemType;
  severity?: TimelineItemSeverity;
  createdAt: string; // ISO ou "dd/mm/aaaa"
  author?: { id?: string; nome?: string; cargo?: string };
  meta?: Record<string, unknown>;

  // ações opcionais
  canOpen?: boolean;
  canDownload?: boolean;
  href?: string; // opcional (abrir em nova aba)
};

type TimelineConfig = {
  titulo?: string;
  descricao?: string;
  items?: TimelineItem[];

  // comportamento
  canOpenModal?: boolean; // default true
  showSearch?: boolean; // default true
  showFilters?: boolean; // default true
  defaultFilter?: "all" | TimelineItemType;
  maxItemsPreview?: number; // default 6
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}
function safeBool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}
function safeNum(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeType(v: unknown): TimelineItemType {
  const s = safeString(v);
  if (s === "status" || s === "versao" || s === "comentario" || s === "arquivo" || s === "acao" || s === "sistema") return s;
  return "sistema";
}
function normalizeSeverity(v: unknown): TimelineItemSeverity | undefined {
  const s = safeString(v);
  if (s === "info" || s === "success" || s === "warning" || s === "danger") return s;
  return undefined;
}

function normalizeItem(raw: unknown): TimelineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = safeString(obj.id) || safeString(obj._id);
  const title = safeString(obj.title);
  const createdAt = safeString(obj.createdAt);

  if (!id || !title || !createdAt) return null;

  const authorObj = (obj.author && typeof obj.author === "object" ? obj.author : {}) as Record<string, unknown>;

  const meta = (obj.meta && typeof obj.meta === "object" ? obj.meta : undefined) as Record<string, unknown> | undefined;

  return {
    id,
    title,
    description: safeString(obj.description) || undefined,
    type: normalizeType(obj.type),
    severity: normalizeSeverity(obj.severity),
    createdAt,
    author: {
      id: safeString(authorObj.id) || safeString(authorObj._id) || undefined,
      nome: safeString(authorObj.nome) || undefined,
      cargo: safeString(authorObj.cargo) || undefined,
    },
    meta,
    canOpen: safeBool(obj.canOpen, true),
    canDownload: safeBool(obj.canDownload, false),
    href: safeString(obj.href) || undefined,
  };
}

function normalizeConfig(raw: unknown): TimelineConfig {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(obj.items) ? obj.items : [];

  const items = itemsRaw.map(normalizeItem).filter(Boolean) as TimelineItem[];

  const defaultFilterRaw = safeString(obj.defaultFilter);
  const defaultFilter: TimelineConfig["defaultFilter"] =
    defaultFilterRaw === "all" ||
    defaultFilterRaw === "status" ||
    defaultFilterRaw === "versao" ||
    defaultFilterRaw === "comentario" ||
    defaultFilterRaw === "arquivo" ||
    defaultFilterRaw === "acao" ||
    defaultFilterRaw === "sistema"
      ? (defaultFilterRaw as any)
      : "all";

  return {
    titulo: safeString(obj.titulo) || undefined,
    descricao: safeString(obj.descricao) || undefined,
    items,
    canOpenModal: safeBool(obj.canOpenModal, true),
    showSearch: safeBool(obj.showSearch, true),
    showFilters: safeBool(obj.showFilters, true),
    defaultFilter,
    maxItemsPreview: safeNum(obj.maxItemsPreview, 6),
  };
}

/** Mocks (preview quando config não vier) */
const MOCK_ITEMS: TimelineItem[] = [
  {
    id: "t1",
    title: "DFD criado",
    description: "Primeira versão do documento foi iniciada.",
    type: "versao",
    severity: "info",
    createdAt: "2026-01-10T12:10:00.000Z",
    author: { nome: "Gabriel Miranda", cargo: "Analista" },
    canOpen: true,
  },
  {
    id: "t2",
    title: "Enviado para análise",
    description: "Documento enviado para a GSP.",
    type: "status",
    severity: "warning",
    createdAt: "2026-01-12T16:25:00.000Z",
    author: { nome: "Usuário", cargo: "Solicitante" },
    canOpen: true,
  },
  {
    id: "t3",
    title: "Anexo adicionado",
    description: "ETP_v2.pdf",
    type: "arquivo",
    severity: "info",
    createdAt: "2026-01-13T09:05:00.000Z",
    author: { nome: "Usuário", cargo: "Solicitante" },
    canOpen: true,
    canDownload: true,
  },
  {
    id: "t4",
    title: "Comentário registrado",
    description: "Ajustar justificativa da necessidade e critérios de medição.",
    type: "comentario",
    severity: "info",
    createdAt: "2026-01-13T11:40:00.000Z",
    author: { nome: "Analista GSP", cargo: "GSP" },
    canOpen: true,
  },
  {
    id: "t5",
    title: "Aprovado",
    description: "Etapa concluída e próxima etapa liberada.",
    type: "acao",
    severity: "success",
    createdAt: "2026-01-14T15:00:00.000Z",
    author: { nome: "Analista GSP", cargo: "GSP" },
    canOpen: true,
  },
];

function iconForType(type: TimelineItemType) {
  switch (type) {
    case "status":
      return <HistoryIcon sx={{ fontSize: 18, color: "#475569" }} />;
    case "versao":
      return <ScheduleIcon sx={{ fontSize: 18, color: "#475569" }} />;
    case "comentario":
      return <CommentIcon sx={{ fontSize: 18, color: "#475569" }} />;
    case "arquivo":
      return <FilePresentIcon sx={{ fontSize: 18, color: "#475569" }} />;
    case "acao":
      return <CheckCircleIcon sx={{ fontSize: 18, color: "#16A34A" }} />;
    default:
      return <InfoIcon sx={{ fontSize: 18, color: "#475569" }} />;
  }
}

function chipForSeverity(sev?: TimelineItemSeverity) {
  if (sev === "success") return { label: "Concluído", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  if (sev === "danger") return { label: "Crítico", bg: "#FEE2E2", color: "#B91C1C", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
  if (sev === "warning") return { label: "Atenção", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
  return { label: "Info", bg: "#E7F3FF", color: "#1877F2", icon: <InfoIcon sx={{ fontSize: 16 }} /> };
}

function typeLabel(t: TimelineItemType) {
  if (t === "status") return "Status";
  if (t === "versao") return "Versão";
  if (t === "comentario") return "Comentário";
  if (t === "arquivo") return "Arquivo";
  if (t === "acao") return "Ação";
  return "Sistema";
}

function sortDescByDate(items: TimelineItem[]) {
  return [...items].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });
}

type TimelineModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const TimelineModal = ({ open, onClose, title, subtitle, children }: TimelineModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
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
                {title}
              </Typography>
              {subtitle ? (
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                  {subtitle}
                </Typography>
              ) : null}

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25, alignItems: "center" }}>
                <Chip
                  icon={<TimelineIcon sx={{ fontSize: 16 }} />}
                  label="Histórico completo"
                  size="small"
                  sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 900, "& .MuiChip-icon": { color: "#1877F2" } }}
                />
                <Chip
                  icon={<FilterAltIcon sx={{ fontSize: 16 }} />}
                  label="Filtros e busca"
                  size="small"
                  sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900 }}
                />
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{ width: 40, height: 40, color: "#64748b", "&:hover": { backgroundColor: "#f1f5f9" } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#FAFBFC", flex: 1, overflow: "auto" }}>{children}</Box>
      </DialogContent>
    </Dialog>
  );
};

function TimelineRow({
  item,
  dense = false,
  onOpen,
  onDownload,
}: {
  item: TimelineItem;
  dense?: boolean;
  onOpen?: () => void;
  onDownload?: () => void;
}) {
  const sev = chipForSeverity(item.severity);
  const authorName = safeString(item.author?.nome);
  const authorCargo = safeString(item.author?.cargo);

  const canOpen = item.canOpen !== false;
  const canDownload = item.canDownload === true;

  return (
    <Box
      sx={{
        border: "1px solid #E4E6EB",
        borderRadius: 2,
        bgcolor: "#fff",
        px: dense ? 1.5 : 2,
        py: dense ? 1.25 : 1.5,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "#F0F2F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {iconForType(item.type)}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: dense ? "0.9rem" : "0.95rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: 220, sm: 420, md: 560 },
              }}
              title={item.title}
            >
              {item.title}
            </Typography>

            <Chip
              label={typeLabel(item.type)}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#475569",
                fontWeight: 900,
                height: 22,
                fontSize: "0.72rem",
              }}
            />
          </Box>

          {item.description ? (
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.35, whiteSpace: "pre-wrap" }}>
              {item.description}
            </Typography>
          ) : null}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.8 }}>
            <Chip
              icon={<PersonIcon sx={{ fontSize: 16 }} />}
              label={authorName ? (authorCargo ? `${authorName} • ${authorCargo}` : authorName) : "—"}
              size="small"
              sx={{
                bgcolor: "#FAFBFC",
                color: "#334155",
                fontWeight: 900,
                height: 22,
                "& .MuiChip-icon": { color: "#64748b" },
              }}
            />
            <Chip
              label={item.createdAt}
              size="small"
              sx={{
                bgcolor: "#FAFBFC",
                color: "#64748b",
                fontWeight: 900,
                height: 22,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}>
        <Chip
          icon={sev.icon}
          label={sev.label}
          size="small"
          sx={{
            bgcolor: sev.bg,
            color: sev.color,
            fontWeight: 900,
            height: 22,
            "& .MuiChip-icon": { color: sev.color, ml: 0.5 },
          }}
        />

        <Tooltip title={canOpen ? "Abrir detalhe" : "Indisponível"} arrow>
          <span>
            <IconButton
              onClick={onOpen}
              disabled={!canOpen}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#F8F9FA" },
              }}
            >
              <OpenInFullIcon sx={{ fontSize: 18, color: canOpen ? "#1877F2" : "#94a3b8" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title={canDownload ? "Baixar" : "Sem download"} arrow>
          <span>
            <IconButton
              onClick={onDownload}
              disabled={!canDownload}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#F8F9FA" },
              }}
            >
              <DownloadIcon sx={{ fontSize: 18, color: canDownload ? "#0f172a" : "#94a3b8" }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export const TimelineComponent = ({ component, isReadOnly, stageCompleted, onEvent }: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const normalized = normalizeConfig(component.config);
    const items = normalized.items?.length ? normalized.items : MOCK_ITEMS;

    return {
      titulo: normalized.titulo || component.label || "Timeline",
      descricao: normalized.descricao || component.description || "Histórico de eventos da etapa",
      items: sortDescByDate(items),
      canOpenModal: normalized.canOpenModal ?? true,
      showSearch: normalized.showSearch ?? true,
      showFilters: normalized.showFilters ?? true,
      defaultFilter: normalized.defaultFilter ?? "all",
      maxItemsPreview: normalized.maxItemsPreview ?? 6,
    };
  }, [component.config, component.label, component.description]);

  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | TimelineItemType>(cfg.defaultFilter || "all");
  const [query, setQuery] = useState("");

  const openModal = () => {
    if (!cfg.canOpenModal) return;
    setModalOpen(true);
    onEvent?.("timeline:modal:open", { componentKey: component.key });
  };

  const closeModal = () => {
    setModalOpen(false);
    onEvent?.("timeline:modal:close", { componentKey: component.key });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cfg.items.filter((it) => {
      if (filter !== "all" && it.type !== filter) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.description || ""} ${it.author?.nome || ""} ${it.author?.cargo || ""} ${it.createdAt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [cfg.items, filter, query]);

  const preview = useMemo(() => filtered.slice(0, Math.max(0, cfg.maxItemsPreview)), [filtered, cfg.maxItemsPreview]);

  const stats = useMemo(() => {
    const total = cfg.items.length;
    const shown = filtered.length;
    const byType = cfg.items.reduce((acc, it) => {
      acc[it.type] = (acc[it.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, shown, byType };
  }, [cfg.items, filtered.length]);

  const headerChipLabel = `${stats.shown}/${stats.total}`;

  const handleOpenItem = (item: TimelineItem) => {
    onEvent?.("timeline:item:open", { componentKey: component.key, itemId: item.id, type: item.type, meta: item.meta });
    // Se vier href, abre (opcional)
    if (item.href) {
      try {
        window.open(item.href, "_blank");
      } catch {
        // silêncio: fluxo real pode tratar via onEvent
      }
    }
  };

  const handleDownloadItem = async (item: TimelineItem) => {
    onEvent?.("timeline:item:download", { componentKey: component.key, itemId: item.id, type: item.type, meta: item.meta });
    // preview: sem download real aqui
    await new Promise((r) => setTimeout(r, 250));
  };

  return (
    <>
      <BaseStageComponentCard
        title={cfg.titulo}
        subtitle={cfg.descricao}
        icon={<TimelineIcon sx={{ fontSize: 18 }} />}
        required={component.required}
        lockedAfterCompletion={component.lockedAfterCompletion}
        isReadOnly={isReadOnly}
        rightSlot={
          <Chip
            label={headerChipLabel}
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
        {/* Toolbar */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {cfg.showFilters ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    icon={<FilterAltIcon sx={{ fontSize: 16 }} />}
                    label="Filtro"
                    size="small"
                    sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900, "& .MuiChip-icon": { color: "#64748b" } }}
                  />
                  <Select
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    sx={{
                      minWidth: 170,
                      bgcolor: "#fff",
                      borderRadius: 2,
                      fontWeight: 900,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="status">Status ({stats.byType.status || 0})</MenuItem>
                    <MenuItem value="versao">Versões ({stats.byType.versao || 0})</MenuItem>
                    <MenuItem value="comentario">Comentários ({stats.byType.comentario || 0})</MenuItem>
                    <MenuItem value="arquivo">Arquivos ({stats.byType.arquivo || 0})</MenuItem>
                    <MenuItem value="acao">Ações ({stats.byType.acao || 0})</MenuItem>
                    <MenuItem value="sistema">Sistema ({stats.byType.sistema || 0})</MenuItem>
                  </Select>
                </Box>
              ) : null}

              {cfg.showSearch ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    size="small"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar evento..."
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#94a3b8", mr: 1 }} />,
                    }}
                    sx={{
                      width: { xs: "100%", sm: 300 },
                      bgcolor: "#fff",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                    }}
                  />
                </Box>
              ) : null}
            </Box>

            <Button
              onClick={openModal}
              variant="outlined"
              disabled={!cfg.canOpenModal}
              startIcon={<OpenInFullIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
              }}
            >
              Ver completo
            </Button>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Preview list */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {preview.length === 0 ? (
              <Box
                sx={{
                  border: "1px dashed #CBD5E1",
                  bgcolor: "#FAFBFC",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <InfoIcon sx={{ color: "#1877F2" }} />
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Nenhum evento encontrado</Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                    Ajuste o filtro ou o termo de busca.
                  </Typography>
                </Box>
              </Box>
            ) : (
              preview.map((it) => (
                <TimelineRow
                  key={it.id}
                  item={it}
                  dense
                  onOpen={() => handleOpenItem(it)}
                  onDownload={() => handleDownloadItem(it)}
                />
              ))
            )}

            {filtered.length > preview.length ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
                <Button
                  onClick={openModal}
                  variant="contained"
                  sx={{
                    bgcolor: "#1877F2",
                    "&:hover": { bgcolor: "#166FE5" },
                    textTransform: "none",
                    fontWeight: 900,
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  Ver mais ({filtered.length - preview.length})
                </Button>
              </Box>
            ) : null}
          </Box>
        </Box>
      </BaseStageComponentCard>

      <TimelineModal open={modalOpen} onClose={closeModal} title={cfg.titulo} subtitle={cfg.descricao}>
        {/* Conteúdo do modal (mesmos controles, agora com lista completa) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              border: "1px solid #E4E6EB",
              borderRadius: 2,
              bgcolor: "#fff",
              p: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {cfg.showFilters ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    icon={<FilterAltIcon sx={{ fontSize: 16 }} />}
                    label="Filtro"
                    size="small"
                    sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900, "& .MuiChip-icon": { color: "#64748b" } }}
                  />
                  <Select
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    sx={{
                      minWidth: 190,
                      bgcolor: "#fff",
                      borderRadius: 2,
                      fontWeight: 900,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="status">Status ({stats.byType.status || 0})</MenuItem>
                    <MenuItem value="versao">Versões ({stats.byType.versao || 0})</MenuItem>
                    <MenuItem value="comentario">Comentários ({stats.byType.comentario || 0})</MenuItem>
                    <MenuItem value="arquivo">Arquivos ({stats.byType.arquivo || 0})</MenuItem>
                    <MenuItem value="acao">Ações ({stats.byType.acao || 0})</MenuItem>
                    <MenuItem value="sistema">Sistema ({stats.byType.sistema || 0})</MenuItem>
                  </Select>
                </Box>
              ) : null}

              {cfg.showSearch ? (
                <TextField
                  size="small"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar evento..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#94a3b8", mr: 1 }} />,
                  }}
                  sx={{
                    width: { xs: "100%", sm: 340 },
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />
              ) : null}
            </Box>

            <Chip
              label={`${filtered.length} itens`}
              size="small"
              sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 900 }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {filtered.length === 0 ? (
              <Box
                sx={{
                  border: "1px dashed #CBD5E1",
                  bgcolor: "#FAFBFC",
                  borderRadius: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <InfoIcon sx={{ color: "#1877F2" }} />
                <Box>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Nenhum evento encontrado</Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                    Ajuste o filtro ou o termo de busca.
                  </Typography>
                </Box>
              </Box>
            ) : (
              filtered.map((it) => (
                <TimelineRow
                  key={it.id}
                  item={it}
                  onOpen={() => handleOpenItem(it)}
                  onDownload={() => handleDownloadItem(it)}
                />
              ))
            )}
          </Box>
        </Box>
      </TimelineModal>
    </>
  );
};
