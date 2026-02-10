import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  MenuItem,
  Select,
  Tooltip,
  Switch,
  FormControlLabel,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Event as EventIcon,
  Sort as SortIcon,
  Flag as FlagIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Bolt as BoltIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type TimelineItemType = "status" | "versao" | "comentario" | "arquivo" | "acao" | "sistema";
type TimelineItemSeverity = "info" | "success" | "warning" | "danger";
type DeadlineStatus = "FUTURO" | "HOJE" | "ATRASADO";

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
  maxItemsPreview?: number; // default 6 (mantido por compatibilidade)
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
    title: "Etapa aprovada",
    description: "Etapa concluída e próxima etapa liberada.",
    type: "acao",
    severity: "success",
    createdAt: "2026-01-14T15:00:00.000Z",
    author: { nome: "Analista GSP", cargo: "GSP" },
    canOpen: true,
    meta: {
      isDeadline: true,
      dueAt: "2026-01-20T15:00:00.000Z",
      deadlineStatus: "FUTURO",
      occurrence: "created",
    },
  },
];

function iconForType(type: TimelineItemType) {
  const base = { fontSize: 18 };
  switch (type) {
    case "status":
      return <HistoryIcon sx={{ ...base, color: "#1877F2" }} />;
    case "versao":
      return <ScheduleIcon sx={{ ...base, color: "#92400E" }} />;
    case "comentario":
      return <CommentIcon sx={{ ...base, color: "#64748b" }} />;
    case "arquivo":
      return <FilePresentIcon sx={{ ...base, color: "#0f172a" }} />;
    case "acao":
      return <CheckCircleIcon sx={{ ...base, color: "#16A34A" }} />;
    default:
      return <InfoIcon sx={{ ...base, color: "#475569" }} />;
  }
}

function chipForSeverity(sev?: TimelineItemSeverity) {
  if (sev === "success") return { label: "Concluído", bg: "#ECFDF3", color: "#065F46", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
  if (sev === "danger") return { label: "Urgente", bg: "#FEE2E2", color: "#B91C1C", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
  if (sev === "warning") return { label: "Atenção", bg: "#FEF3C7", color: "#92400E", icon: <ScheduleIcon sx={{ fontSize: 16 }} /> };
  return { label: "Normal", bg: "#E7F3FF", color: "#1877F2", icon: <InfoIcon sx={{ fontSize: 16 }} /> };
}

function chipForDeadlineStatus(status: DeadlineStatus) {
  if (status === "ATRASADO") return { label: "ATRASADO", bg: "#FEE2E2", color: "#B91C1C" };
  if (status === "HOJE") return { label: "HOJE", bg: "#FEF3C7", color: "#92400E" };
  return { label: "FUTURO", bg: "#E7F3FF", color: "#1877F2" };
}

function typeLabel(t: TimelineItemType) {
  if (t === "status") return "Andamento";
  if (t === "versao") return "Documento";
  if (t === "comentario") return "Observação";
  if (t === "arquivo") return "Anexo";
  if (t === "acao") return "Conclusão";
  return "Registro";
}

function sortDescByDate(items: TimelineItem[]) {
  return [...items].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return db - da;
  });
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function isValidDate(d: Date) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function parseCreatedAt(createdAt: string): Date | null {
  const raw = safeString(createdAt);
  if (!raw) return null;

  const isoCandidate = new Date(raw);
  if (isValidDate(isoCandidate)) return isoCandidate;

  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const hh = m[4] ? Number(m[4]) : 0;
    const min = m[5] ? Number(m[5]) : 0;
    const d = new Date(yyyy, Math.max(0, mm - 1), dd, hh, min, 0, 0);
    if (isValidDate(d)) return d;
  }

  return null;
}

function toDayKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatPtBRDate(d: Date) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatMonthTitle(d: Date) {
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1, 0, 0, 0, 0);
}

function startOfCalendarGrid(monthStart: Date) {
  const day = monthStart.getDay(); // 0=Dom
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - day);
  gridStart.setHours(0, 0, 0, 0);
  return gridStart;
}

function typeDotColor(type: TimelineItemType) {
  if (type === "acao") return "#16A34A";
  if (type === "status") return "#1877F2";
  if (type === "arquivo") return "#0f172a";
  if (type === "comentario") return "#64748b";
  if (type === "versao") return "#92400E";
  return "#94a3b8";
}

/** Helpers novos (mantendo padrão do arquivo) */
function buildIsoFromDateTime(dateStr: string, timeStr: string) {
  const d = safeString(dateStr);
  const t = safeString(timeStr) || "00:00";
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const mt = t.match(/^(\d{2}):(\d{2})$/);
  if (!m || !mt) return "";
  const yyyy = Number(m[1]);
  const mm = Number(m[2]);
  const dd = Number(m[3]);
  const hh = Number(mt[1]);
  const min = Number(mt[2]);
  const local = new Date(yyyy, Math.max(0, mm - 1), dd, hh, min, 0, 0);
  if (!isValidDate(local)) return "";
  return local.toISOString();
}

function formatDateTimePtBR(createdAt: string) {
  const d = parseCreatedAt(createdAt);
  if (!d) return safeString(createdAt) || "—";
  return `${formatPtBRDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function computeDeadlineStatus(dueIso: string, now: Date) {
  const due = parseCreatedAt(dueIso);
  if (!due) return "FUTURO" as const;

  const n = new Date(now);
  const dueDay = new Date(due);
  n.setHours(0, 0, 0, 0);
  dueDay.setHours(0, 0, 0, 0);

  const nKey = toDayKey(n);
  const dKey = toDayKey(dueDay);
  if (nKey === dKey) return "HOJE" as const;

  const dueTs = due.getTime();
  const nowTs = now.getTime();
  return dueTs < nowTs ? ("ATRASADO" as const) : ("FUTURO" as const);
}

function groupItemsByDay(items: TimelineItem[]) {
  const map: Record<string, TimelineItem[]> = {};

  for (const it of items) {
    const d = parseCreatedAt(it.createdAt);
    if (!d) continue;
    const key = toDayKey(d);
    (map[key] ||= []).push(it);
  }

  Object.keys(map).forEach((k) => {
    map[k] = [...map[k]].sort((a, b) => {
      const da = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
      const db = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
      return da - db;
    });
  });

  const orderedKeys = Object.keys(map).sort((a, b) => {
    const da = parseCreatedAt(`${a}T00:00:00.000Z`)?.getTime() ?? 0;
    const db = parseCreatedAt(`${b}T00:00:00.000Z`)?.getTime() ?? 0;
    return db - da;
  });

  return { map, orderedKeys };
}

function normalizeDeadlineMeta(meta?: Record<string, unknown>) {
  const m = meta && typeof meta === "object" ? meta : undefined;
  const isDeadline = safeBool(m?.isDeadline, false);
  const dueAt = safeString(m?.dueAt) || "";
  const deadlineStatus = safeString(m?.deadlineStatus) as DeadlineStatus | "";
  return {
    isDeadline,
    dueAt: dueAt || undefined,
    deadlineStatus: deadlineStatus === "FUTURO" || deadlineStatus === "HOJE" || deadlineStatus === "ATRASADO" ? (deadlineStatus as DeadlineStatus) : undefined,
  };
}

/** ✅ Novo: ocorrência no calendário (evento criado + prazo final) */
type CalendarOccurrence = "created" | "deadline";

function getOccurrence(it: TimelineItem): CalendarOccurrence {
  const occ = safeString(it.meta?.occurrence);
  if (occ === "deadline") return "deadline";
  return "created";
}

function withOccurrenceMeta(meta: Record<string, unknown> | undefined, occurrence: CalendarOccurrence) {
  return {
    ...(meta || {}),
    occurrence,
  } as Record<string, unknown>;
}

/**
 * ✅ Regra:
 * - todo evento aparece no dia createdAt (ocorrência "created")
 * - se tiver prazo (meta.isDeadline + meta.dueAt), aparece também no dia dueAt (ocorrência "deadline")
 */
function expandItemsForCalendar(items: TimelineItem[]) {
  const out: TimelineItem[] = [];

  for (const it of items) {
    const base: TimelineItem = {
      ...it,
      meta: withOccurrenceMeta(it.meta, "created"),
    };
    out.push(base);

    const dl = normalizeDeadlineMeta(it.meta);
    if (dl.isDeadline && dl.dueAt) {
      const due = parseCreatedAt(dl.dueAt);
      if (due) {
        const ghost: TimelineItem = {
          ...it,
          id: `${it.id}__deadline`,
          createdAt: dl.dueAt,
          title: `Prazo final: ${it.title}`,
          meta: withOccurrenceMeta(it.meta, "deadline"),
        };
        out.push(ghost);
      }
    }
  }

  return out;
}

/** ✅ Novo: indicadores claros no calendário (criado vs prazo final) */
function deadlineVisual(now: Date, it: TimelineItem) {
  const dl = normalizeDeadlineMeta(it.meta);
  const occ = getOccurrence(it);
  if (occ !== "deadline") return null;

  const dueAt = dl.dueAt || it.createdAt;
  const status = computeDeadlineStatus(dueAt, now);

  if (status === "ATRASADO") {
    return { icon: <EventBusyIcon sx={{ fontSize: 14, color: "#B91C1C" }} />, bg: "rgba(225,29,72,0.12)", label: "Prazo atrasado" };
  }
  if (status === "HOJE") {
    return { icon: <BoltIcon sx={{ fontSize: 14, color: "#92400E" }} />, bg: "rgba(245,158,11,0.18)", label: "Prazo é hoje" };
  }
  return { icon: <FlagIcon sx={{ fontSize: 14, color: "#1877F2" }} />, bg: "rgba(24,119,242,0.12)", label: "Prazo final" };
}

function calendarGlyphs(items: TimelineItem[], now: Date) {
  const glyphs: Array<{ key: string; node: ReactNode; label: string }> = [];

  const deadlines = items.filter((it) => getOccurrence(it) === "deadline");
  const created = items.filter((it) => getOccurrence(it) === "created");

  for (const it of deadlines.slice(0, 2)) {
    const v = deadlineVisual(now, it);
    if (!v) continue;
    glyphs.push({
      key: `${it.id}__dl`,
      label: v.label,
      node: (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: v.bg,
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {v.icon}
        </Box>
      ),
    });
  }

  if (created.length > 0) {
    glyphs.push({
      key: "created",
      label: "Evento criado",
      node: (
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(22,163,74,0.12)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <EventAvailableIcon sx={{ fontSize: 14, color: "#16A34A" }} />
        </Box>
      ),
    });
  }

  return glyphs.slice(0, 3);
}

type TimelineModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
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
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.15rem", sm: "1.25rem" } }}>{title}</Typography>
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
                  label="Filtros, busca e ordenação"
                  size="small"
                  sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900 }}
                />
              </Box>
            </Box>

            <IconButton onClick={onClose} sx={{ width: 40, height: 40, color: "#64748b", "&:hover": { backgroundColor: "#f1f5f9" } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#FAFBFC", flex: 1, overflow: "auto" }}>{children}</Box>
      </DialogContent>
    </Dialog>
  );
};

type CreateEventModalProps = {
  open: boolean;
  onClose: () => void;
  prefillDayKey?: string | null;
  onCreate: (item: TimelineItem, dayKey: string | null) => void;
};

const CreateEventModal = ({ open, onClose, prefillDayKey, onCreate }: CreateEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<TimelineItemType>("status");
  const [severity, setSeverity] = useState<TimelineItemSeverity>("info");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("00:00");

  const [isDeadline, setIsDeadline] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("00:00");

  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");

  useEffect(() => {
    if (!open) return;

    const day = safeString(prefillDayKey);
    const m = day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const defaultDate = m ? `${m[1]}-${m[2]}-${m[3]}` : "";

    setTitle("");
    setDescription("");
    setType("status");
    setSeverity("info");
    setDate(defaultDate || "");
    setTime("00:00");
    setIsDeadline(false);
    setDueDate(defaultDate || "");
    setDueTime("00:00");
    setAuthorName("");
    setAuthorRole("");
  }, [open, prefillDayKey]);

  const titleTrimmed = title.trim();
  const titleError = titleTrimmed.length > 0 && titleTrimmed.length < 3 ? "Digite pelo menos 3 caracteres." : "";

  const dateIso = date ? buildIsoFromDateTime(date, time || "00:00") : "";
  const dueIso = isDeadline && dueDate ? buildIsoFromDateTime(dueDate, dueTime || "00:00") : "";

  const deadlineStatus = useMemo(() => {
    if (!isDeadline || !dueIso) return undefined;
    return computeDeadlineStatus(dueIso, new Date());
  }, [dueIso, isDeadline]);

  const isDateValid = !!dateIso;
  const isDueValid = !isDeadline || !!dueIso;
  const canSubmit = titleTrimmed.length >= 3 && isDateValid && isDueValid;

  const selectedDayKeyForPayload = useMemo(() => {
    const dk = safeString(prefillDayKey);
    return dk ? dk : null;
  }, [prefillDayKey]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const id = `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const item: TimelineItem = {
      id,
      title: titleTrimmed,
      description: safeString(description) || undefined,
      type,
      severity,
      createdAt: dateIso,
      author: {
        nome: safeString(authorName) || undefined,
        cargo: safeString(authorRole) || undefined,
      },
      meta: isDeadline
        ? ({
            isDeadline: true,
            dueAt: dueIso,
            deadlineStatus: deadlineStatus || computeDeadlineStatus(dueIso, new Date()),
            occurrence: "created",
          } as Record<string, unknown>)
        : ({ occurrence: "created" } as Record<string, unknown>),
      canOpen: true,
    };

    onCreate(item, selectedDayKeyForPayload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
            px: { xs: 2, sm: 3 },
            py: { xs: 1.75, sm: 2 },
            borderBottom: "1px solid #E4E6EB",
            bgcolor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: { xs: "1.1rem", sm: "1.2rem" } }}>Criar evento</Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.5 }}>
                Registre um andamento, documento, observação ou prazo desta etapa.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              sx={{
                width: 40,
                height: 40,
                color: "#64748b",
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { backgroundColor: "#f8fafc" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#FAFBFC", flex: 1, overflow: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", bgcolor: "#FAFBFC" }}>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Informações</Typography>
              </Box>

              <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                <TextField
                  label="Título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  error={!!titleError}
                  helperText={titleError || "Ex: “Enviado para análise”, “Anexo incluído”, “Ajustes solicitados”"}
                  sx={{
                    gridColumn: { xs: "1 / -1", sm: "1 / -1" },
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />

                <Select
                  size="small"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    fontWeight: 900,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                >
                  <MenuItem value="status">Categoria: Andamento</MenuItem>
                  <MenuItem value="versao">Categoria: Documento</MenuItem>
                  <MenuItem value="arquivo">Categoria: Anexo</MenuItem>
                  <MenuItem value="comentario">Categoria: Observação</MenuItem>
                  <MenuItem value="acao">Categoria: Conclusão</MenuItem>
                  <MenuItem value="sistema">Categoria: Registro</MenuItem>
                </Select>

                <Select
                  size="small"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    fontWeight: 900,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                >
                  <MenuItem value="info">Prioridade: Normal</MenuItem>
                  <MenuItem value="warning">Prioridade: Atenção</MenuItem>
                  <MenuItem value="danger">Prioridade: Urgente</MenuItem>
                  <MenuItem value="success">Prioridade: Concluído</MenuItem>
                </Select>

                <TextField
                  label="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  minRows={3}
                  sx={{
                    gridColumn: { xs: "1 / -1", sm: "1 / -1" },
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />

                <TextField
                  label="Criado por (nome) (opcional)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="—"
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />

                <TextField
                  label="Criado por (cargo) (opcional)"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="—"
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", bgcolor: "#FAFBFC" }}>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Data do evento</Typography>
              </Box>

              <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                <TextField
                  label="Data"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />

                <TextField
                  label="Hora (opcional)"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", bgcolor: "#FAFBFC" }}>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Prazo (opcional)</Typography>
              </Box>

              <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                <FormControlLabel
                  control={<Switch checked={isDeadline} onChange={(e) => setIsDeadline(e.target.checked)} />}
                  label={<Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Este evento tem prazo</Typography>}
                  sx={{ m: 0, "& .MuiSwitch-root": { ml: 0.5 } }}
                />

                {isDeadline ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                    <TextField
                      label="Data do prazo"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                      sx={{
                        bgcolor: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                      }}
                    />

                    <TextField
                      label="Hora do prazo (opcional)"
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        bgcolor: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                      }}
                    />

                    {dueIso && deadlineStatus ? (
                      <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" }, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                          icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                          label="Prazo registrado"
                          size="small"
                          sx={{ bgcolor: "#FAFBFC", color: "#475569", fontWeight: 900, "& .MuiChip-icon": { color: "#64748b" } }}
                        />
                        <Chip
                          label={`Status: ${deadlineStatus}`}
                          size="small"
                          sx={{
                            bgcolor: chipForDeadlineStatus(deadlineStatus).bg,
                            color: chipForDeadlineStatus(deadlineStatus).color,
                            fontWeight: 950,
                          }}
                        />
                      </Box>
                    ) : null}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                    Use prazo para destacar entregas, datas-limite e pendências.
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", bgcolor: "#FAFBFC" }}>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Pré-visualização</Typography>
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mb: 1 }}>
                  Como o evento ficará no cronograma:
                </Typography>

                <TimelineRow
                  item={{
                    id: "preview",
                    title: titleTrimmed || "—",
                    description: safeString(description) || undefined,
                    type,
                    severity,
                    createdAt: dateIso || "—",
                    author: {
                      nome: safeString(authorName) || undefined,
                      cargo: safeString(authorRole) || undefined,
                    },
                    meta: isDeadline && dueIso ? { isDeadline: true, dueAt: dueIso, deadlineStatus: deadlineStatus || "FUTURO", occurrence: "created" } : { occurrence: "created" },
                    canOpen: true,
                  }}
                  mode="detailed"
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
              <Button
                onClick={onClose}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E4E6EB",
                  color: "#212121",
                  fontWeight: 900,
                  "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8F9FA" },
                }}
              >
                Cancelar
              </Button>

              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={!canSubmit}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#1877F2",
                  "&:hover": { bgcolor: "#166FE5" },
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                Criar evento
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

type DayEventsModalProps = {
  open: boolean;
  onClose: () => void;
  dayLabel: string;
  items: TimelineItem[];
  onCreateEvent?: () => void;
};

const DayEventsModal = ({ open, onClose, dayLabel, items, onCreateEvent }: DayEventsModalProps) => {
  const [quickFilter, setQuickFilter] = useState<"all" | "deadlines" | "overdue">("all");

  useEffect(() => {
    if (!open) return;
    setQuickFilter("all");
  }, [open]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
      const db = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
      return da - db;
    });
  }, [items]);

  const filtered = useMemo(() => {
    if (quickFilter === "all") return sorted;

    const isDeadline = (it: TimelineItem) => getOccurrence(it) === "deadline";
    const isOverdue = (it: TimelineItem) => {
      if (getOccurrence(it) !== "deadline") return false;
      const dl = normalizeDeadlineMeta(it.meta);
      const dueAt = dl.dueAt || it.createdAt;
      return computeDeadlineStatus(dueAt, new Date()) === "ATRASADO";
    };

    if (quickFilter === "deadlines") return sorted.filter(isDeadline);
    return sorted.filter(isOverdue);
  }, [quickFilter, sorted]);

  const summary = useMemo(() => {
    const total = items.length;
    const deadlines = items.filter((it) => getOccurrence(it) === "deadline").length;
    const overdue = items.filter((it) => {
      if (getOccurrence(it) !== "deadline") return false;
      const dl = normalizeDeadlineMeta(it.meta);
      const dueAt = dl.dueAt || it.createdAt;
      return computeDeadlineStatus(dueAt, new Date()) === "ATRASADO";
    }).length;
    return { total, deadlines, overdue };
  }, [items]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
            px: { xs: 2, sm: 3 },
            py: { xs: 1.75, sm: 2 },
            borderBottom: "1px solid #E4E6EB",
            bgcolor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Chip
                  icon={<EventIcon sx={{ fontSize: 16 }} />}
                  label="Eventos do dia"
                  size="small"
                  sx={{
                    bgcolor: "#E7F3FF",
                    color: "#1877F2",
                    fontWeight: 900,
                    "& .MuiChip-icon": { color: "#1877F2" },
                  }}
                />
                <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: { xs: "1.05rem", sm: "1.1rem" } }}>{dayLabel}</Typography>
                <Chip
                  label={`${summary.total} itens`}
                  size="small"
                  sx={{
                    bgcolor: "#F0F2F5",
                    color: "#334155",
                    fontWeight: 900,
                    height: 24,
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.75 }}>
                Resumo: {summary.deadlines} prazos • {summary.overdue} atrasados
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                <Chip
                  label="Todos"
                  clickable
                  onClick={() => setQuickFilter("all")}
                  sx={{
                    bgcolor: quickFilter === "all" ? "#E7F3FF" : "#F0F2F5",
                    color: quickFilter === "all" ? "#1877F2" : "#475569",
                    fontWeight: 950,
                    height: 26,
                    cursor: "pointer",
                  }}
                />
                <Chip
                  icon={<FlagIcon sx={{ fontSize: 16 }} />}
                  label="Prazos"
                  clickable
                  onClick={() => setQuickFilter("deadlines")}
                  sx={{
                    bgcolor: quickFilter === "deadlines" ? "#E7F3FF" : "#F0F2F5",
                    color: quickFilter === "deadlines" ? "#1877F2" : "#475569",
                    fontWeight: 950,
                    height: 26,
                    cursor: "pointer",
                    "& .MuiChip-icon": { color: quickFilter === "deadlines" ? "#1877F2" : "#64748b" },
                  }}
                />
                <Chip
                  icon={<EventBusyIcon sx={{ fontSize: 16 }} />}
                  label="Atrasados"
                  clickable
                  onClick={() => setQuickFilter("overdue")}
                  sx={{
                    bgcolor: quickFilter === "overdue" ? "#FEE2E2" : "#F0F2F5",
                    color: quickFilter === "overdue" ? "#B91C1C" : "#475569",
                    fontWeight: 950,
                    height: 26,
                    cursor: "pointer",
                    "& .MuiChip-icon": { color: quickFilter === "overdue" ? "#B91C1C" : "#64748b" },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {onCreateEvent ? (
                <Button
                  onClick={onCreateEvent}
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: "#1877F2",
                    "&:hover": { bgcolor: "#166FE5" },
                    textTransform: "none",
                    fontWeight: 950,
                    borderRadius: 2,
                    boxShadow: "none",
                  }}
                >
                  Criar evento
                </Button>
              ) : null}

              <IconButton
                onClick={onClose}
                sx={{
                  width: 40,
                  height: 40,
                  color: "#64748b",
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { backgroundColor: "#f8fafc" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#FAFBFC", flex: 1, overflow: "auto" }}>
          {filtered.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed #CBD5E1",
                bgcolor: "#FFFFFF",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <InfoIcon sx={{ color: "#1877F2" }} />
              <Box>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Sem registros para este filtro</Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  Ajuste o filtro ou selecione outro dia do calendário.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {filtered.map((it) => (
                <TimelineRow key={it.id} item={it} mode="detailed" />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

function TimelineRow({ item, mode = "compact" }: { item: TimelineItem; mode?: "compact" | "detailed" }) {
  const sev = chipForSeverity(item.severity);
  const authorName = safeString(item.author?.nome);
  const authorCargo = safeString(item.author?.cargo);

  const dl = normalizeDeadlineMeta(item.meta);
  const dueAt = dl.isDeadline ? dl.dueAt : undefined;
  const liveStatus = useMemo(() => {
    if (!dl.isDeadline || !dueAt) return undefined;
    return computeDeadlineStatus(dueAt, new Date());
  }, [dl.isDeadline, dueAt]);

  const showDeadlineLine = dl.isDeadline && !!dueAt && !!liveStatus;
  const deadlineChip = showDeadlineLine ? chipForDeadlineStatus(liveStatus!) : null;

  const dense = mode === "compact";
  const occurrence = getOccurrence(item);
  const isDeadlineOccurrence = occurrence === "deadline";

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
            bgcolor: isDeadlineOccurrence ? "rgba(24,119,242,0.10)" : "#F0F2F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: isDeadlineOccurrence ? "1px solid rgba(24,119,242,0.18)" : "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {isDeadlineOccurrence ? <FlagIcon sx={{ fontSize: 18, color: "#1877F2" }} /> : iconForType(item.type)}
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
                maxWidth: { xs: 210, sm: 520, md: 680 },
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

            {isDeadlineOccurrence ? (
              <Chip
                icon={<FlagIcon sx={{ fontSize: 16 }} />}
                label="Prazo final"
                size="small"
                sx={{
                  bgcolor: "rgba(24,119,242,0.12)",
                  color: "#1877F2",
                  fontWeight: 950,
                  height: 22,
                  fontSize: "0.72rem",
                  "& .MuiChip-icon": { color: "#1877F2" },
                }}
              />
            ) : (
              <Chip
                icon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
                label="Evento criado"
                size="small"
                sx={{
                  bgcolor: "rgba(22,163,74,0.12)",
                  color: "#166534",
                  fontWeight: 950,
                  height: 22,
                  fontSize: "0.72rem",
                  "& .MuiChip-icon": { color: "#16A34A" },
                }}
              />
            )}
          </Box>

          {item.description ? (
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.35, whiteSpace: "pre-wrap" }}>
              {item.description}
            </Typography>
          ) : null}

          {showDeadlineLine ? (
            <Box
              sx={{
                mt: 0.9,
                border: "1px solid #F0F2F5",
                bgcolor: "#FAFBFC",
                borderRadius: 2,
                px: 1.25,
                py: 0.9,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Chip
                icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                label={`Prazo: ${formatDateTimePtBR(dueAt!)}`}
                size="small"
                sx={{
                  bgcolor: "#fff",
                  color: "#475569",
                  fontWeight: 900,
                  height: 22,
                  "& .MuiChip-icon": { color: "#64748b" },
                }}
              />
              <Chip
                label={deadlineChip!.label}
                size="small"
                sx={{
                  bgcolor: deadlineChip!.bg,
                  color: deadlineChip!.color,
                  fontWeight: 950,
                  height: 22,
                }}
              />
            </Box>
          ) : null}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.9 }}>
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
              label={formatDateTimePtBR(item.createdAt)}
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
      </Box>
    </Box>
  );
}

function CalendarLegend() {
  return (
    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", alignItems: "center" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#16A34A" }} />
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 900 }}>
          Evento criado
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1877F2" }} />
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 900 }}>
          Prazo final
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#92400E" }} />
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 900 }}>
          Prazo hoje
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#B91C1C" }} />
        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 900 }}>
          Prazo atrasado
        </Typography>
      </Box>
    </Box>
  );
}

type SortMode = "recent" | "oldest" | "typeAZ" | "severity";

function sortSeverityValue(sev?: TimelineItemSeverity) {
  // danger > warning > info > success
  if (sev === "danger") return 4;
  if (sev === "warning") return 3;
  if (sev === "info") return 2;
  if (sev === "success") return 1;
  return 0;
}

export const TimelineComponent = ({ component, isReadOnly, stageCompleted, onEvent }: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const normalized = normalizeConfig(component.config);
    const items = normalized.items?.length ? normalized.items : MOCK_ITEMS;

    return {
      titulo: normalized.titulo || component.label || "Cronograma",
      descricao: normalized.descricao || component.description || "Histórico de eventos da etapa",
      items: sortDescByDate(items),
      canOpenModal: normalized.canOpenModal ?? true,
      showSearch: normalized.showSearch ?? true,
      showFilters: normalized.showFilters ?? true,
      defaultFilter: normalized.defaultFilter ?? "all",
      maxItemsPreview: normalized.maxItemsPreview ?? 6, // mantido por compatibilidade (não usado no calendário)
    };
  }, [component.config, component.label, component.description]);

  /** Estado local: fonte de verdade para UI */
  const [itemsState, setItemsState] = useState<TimelineItem[]>(() => cfg.items);

  useEffect(() => {
    setItemsState(cfg.items);
  }, [cfg.items]);

  const [modalOpen, setModalOpen] = useState(false);

  /** Filtros do CALENDÁRIO (toolbar do componente) */
  const [filter, setFilter] = useState<"all" | TimelineItemType>(cfg.defaultFilter || "all");
  const [query, setQuery] = useState("");

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  /** Modal Criar evento */
  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefillDayKey, setCreatePrefillDayKey] = useState<string | null>(null);

  /** Estados do MODAL Histórico (independentes do calendário) */
  const [modalTypeFilter, setModalTypeFilter] = useState<"all" | TimelineItemType>("all");
  const [modalSeverityFilter, setModalSeverityFilter] = useState<"all" | TimelineItemSeverity>("all");
  const [modalQuery, setModalQuery] = useState("");
  const [modalOnlyDeadlines, setModalOnlyDeadlines] = useState(false);
  const [modalOnlyOverdue, setModalOnlyOverdue] = useState(false);
  const [modalSort, setModalSort] = useState<SortMode>("recent");

  useEffect(() => {
    // ao abrir modal, faz reset leve mantendo padrão previsível
    if (!modalOpen) return;
    setModalTypeFilter("all");
    setModalSeverityFilter("all");
    setModalQuery("");
    setModalOnlyDeadlines(false);
    setModalOnlyOverdue(false);
    setModalSort("recent");
  }, [modalOpen]);

  const openModal = () => {
    if (!cfg.canOpenModal) return;
    setModalOpen(true);
    onEvent?.("timeline:modal:open", { componentKey: component.key });
  };

  const closeModal = () => {
    setModalOpen(false);
    onEvent?.("timeline:modal:close", { componentKey: component.key });
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return itemsState.filter((it) => {
      if (filter !== "all" && it.type !== filter) return false;
      if (!q) return true;
      const hay = `${it.title} ${it.description || ""} ${it.author?.nome || ""} ${it.author?.cargo || ""} ${it.createdAt}`.toLowerCase();
      return hay.includes(q);
    });
  }, [itemsState, filter, query]);

  const stats = useMemo(() => {
    const total = itemsState.length;
    const shown = filtered.length;
    const byType = itemsState.reduce((acc, it) => {
      acc[it.type] = (acc[it.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, shown, byType };
  }, [itemsState, filtered.length]);

  const headerChipLabel = `${stats.shown}/${stats.total}`;

  const [activeMonth, setActiveMonth] = useState(() => startOfMonth(new Date()));

  /** ✅ Novo: a camada do calendário usa eventos expandidos (created + due) */
  const filteredForCalendar = useMemo(() => {
    return expandItemsForCalendar(filtered);
  }, [filtered]);

  const itemsByDay = useMemo(() => {
    const map: Record<string, TimelineItem[]> = {};

    for (const it of filteredForCalendar) {
      const d = parseCreatedAt(it.createdAt);
      if (!d) continue;
      const key = toDayKey(d);
      (map[key] ||= []).push(it);
    }

    Object.keys(map).forEach((k) => {
      map[k] = [...map[k]].sort((a, b) => {
        const da = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
        const db = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
        return da - db;
      });
    });

    return map;
  }, [filteredForCalendar]);

  const monthGrid = useMemo(() => {
    const monthStart = startOfMonth(activeMonth);
    const gridStart = startOfCalendarGrid(monthStart);

    const cells = Array.from({ length: 42 }).map((_, idx) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + idx);
      d.setHours(0, 0, 0, 0);

      const dayKey = toDayKey(d);
      const isInMonth = d.getMonth() === monthStart.getMonth() && d.getFullYear() === monthStart.getFullYear();
      const isToday = dayKey === toDayKey(today);

      const items = itemsByDay[dayKey] || [];
      const now = new Date();

      const glyphs = calendarGlyphs(items, now);
      const extra = Math.max(0, items.length - glyphs.length);

      return {
        date: d,
        dayKey,
        isInMonth,
        isToday,
        itemsCount: items.length,
        glyphs,
        extra,
      };
    });

    return cells;
  }, [activeMonth, itemsByDay, today]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDayKey) return "—";
    const parts = selectedDayKey.split("-");
    if (parts.length !== 3) return "—";
    const yyyy = Number(parts[0]);
    const mm = Number(parts[1]);
    const dd = Number(parts[2]);
    const d = new Date(yyyy, Math.max(0, mm - 1), dd, 0, 0, 0, 0);
    if (!isValidDate(d)) return "—";
    return formatPtBRDate(d);
  }, [selectedDayKey]);

  const selectedItems = useMemo(() => {
    if (!selectedDayKey) return [];
    return itemsByDay[selectedDayKey] || [];
  }, [itemsByDay, selectedDayKey]);

  const openDayModal = (dayKey: string) => {
    setSelectedDayKey(dayKey);
    setDayModalOpen(true);
    onEvent?.("timeline:calendar:day:open", { componentKey: component.key, dayKey });
  };

  const closeDayModal = () => {
    setDayModalOpen(false);
    onEvent?.("timeline:calendar:day:close", { componentKey: component.key, dayKey: selectedDayKey });
  };

  const openCreateEvent = (prefillDayKey?: string | null) => {
    setCreatePrefillDayKey(prefillDayKey ?? null);
    setCreateOpen(true);
  };

  const closeCreateEvent = () => {
    setCreateOpen(false);
  };

  const handleCreateEventFromToolbar = () => {
    openCreateEvent(selectedDayKey || null);
  };

  const handleCreateItem = (item: TimelineItem, dayKey: string | null) => {
    setItemsState((prev) => sortDescByDate([...prev, item]));
    onEvent?.("timeline:item:create", { componentKey: component.key, item, dayKey: dayKey || null });
  };

  /** Modal Histórico completo: filtros + ordenação + agrupamento */
  const modalFiltered = useMemo(() => {
    const q = modalQuery.trim().toLowerCase();

    const base = itemsState.filter((it) => {
      if (modalTypeFilter !== "all" && it.type !== modalTypeFilter) return false;
      if (modalSeverityFilter !== "all" && (it.severity || "info") !== modalSeverityFilter) return false;

      const dl = normalizeDeadlineMeta(it.meta);
      if (modalOnlyDeadlines && !dl.isDeadline) return false;
      if (modalOnlyOverdue) {
        if (!dl.isDeadline || !dl.dueAt) return false;
        if (computeDeadlineStatus(dl.dueAt, new Date()) !== "ATRASADO") return false;
      }

      if (!q) return true;
      const hay = `${it.title} ${it.description || ""} ${it.author?.nome || ""} ${it.author?.cargo || ""} ${it.createdAt}`.toLowerCase();
      return hay.includes(q);
    });

    const ordered = [...base].sort((a, b) => {
      if (modalSort === "typeAZ") return typeLabel(a.type).localeCompare(typeLabel(b.type));
      if (modalSort === "severity") return sortSeverityValue(b.severity) - sortSeverityValue(a.severity);
      const da = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
      const db = parseCreatedAt(b.createdAt)?.getTime() ?? 0;
      if (modalSort === "oldest") return da - db;
      return db - da; // recent
    });

    return ordered;
  }, [itemsState, modalOnlyDeadlines, modalOnlyOverdue, modalQuery, modalSeverityFilter, modalSort, modalTypeFilter]);

  const modalGrouped = useMemo(() => {
    const { map, orderedKeys } = groupItemsByDay(modalFiltered);
    return { map, orderedKeys };
  }, [modalFiltered]);

  const modalDeadlinesSummary = useMemo(() => {
    const all = itemsState.filter((it) => normalizeDeadlineMeta(it.meta).isDeadline);
    const overdue = all.filter((it) => {
      const dl = normalizeDeadlineMeta(it.meta);
      if (!dl.dueAt) return false;
      return computeDeadlineStatus(dl.dueAt, new Date()) === "ATRASADO";
    }).length;

    const todayCount = all.filter((it) => {
      const dl = normalizeDeadlineMeta(it.meta);
      if (!dl.dueAt) return false;
      return computeDeadlineStatus(dl.dueAt, new Date()) === "HOJE";
    }).length;

    const next7 = all.filter((it) => {
      const dl = normalizeDeadlineMeta(it.meta);
      if (!dl.dueAt) return false;
      const due = parseCreatedAt(dl.dueAt);
      if (!due) return false;
      const now = new Date();
      const diff = due.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    }).length;

    return { total: itemsState.length, overdue, today: todayCount, next7 };
  }, [itemsState]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {/* Toolbar */}
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
                    <MenuItem value="status">Andamento ({stats.byType.status || 0})</MenuItem>
                    <MenuItem value="versao">Documentos ({stats.byType.versao || 0})</MenuItem>
                    <MenuItem value="comentario">Observações ({stats.byType.comentario || 0})</MenuItem>
                    <MenuItem value="arquivo">Anexos ({stats.byType.arquivo || 0})</MenuItem>
                    <MenuItem value="acao">Conclusões ({stats.byType.acao || 0})</MenuItem>
                    <MenuItem value="sistema">Registros ({stats.byType.sistema || 0})</MenuItem>
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
                      width: { xs: "100%", sm: 320 },
                      bgcolor: "#fff",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                    }}
                  />
                </Box>
              ) : null}
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                onClick={handleCreateEventFromToolbar}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#1877F2",
                  "&:hover": { bgcolor: "#166FE5" },
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                Criar evento
              </Button>

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
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* CALENDÁRIO */}
          <Box
            sx={{
              border: "1px solid #E4E6EB",
              borderRadius: 2,
              bgcolor: "#fff",
              overflow: "hidden",
            }}
          >
            {/* Header do calendário */}
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: { xs: 1.5, sm: 1.75 },
                borderBottom: "1px solid #E4E6EB",
                bgcolor: "#FAFBFC",
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<TimelineIcon sx={{ fontSize: 16 }} />}
                  label="Calendário"
                  size="small"
                  sx={{
                    bgcolor: "#E7F3FF",
                    color: "#1877F2",
                    fontWeight: 900,
                    "& .MuiChip-icon": { color: "#1877F2" },
                  }}
                />
                <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: { xs: "1.05rem", sm: "1.1rem" } }}>
                  {formatMonthTitle(activeMonth)}
                </Typography>
                <Chip label={`${filtered.length} itens`} size="small" sx={{ bgcolor: "#F0F2F5", color: "#334155", fontWeight: 900, height: 24 }} />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title="Mês anterior" arrow>
                  <IconButton
                    onClick={() => setActiveMonth((m) => addMonths(m, -1))}
                    sx={{
                      width: 38,
                      height: 38,
                      border: "1px solid #E4E6EB",
                      borderRadius: 2,
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: "#F8F9FA" },
                    }}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 20, color: "#0f172a" }} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Próximo mês" arrow>
                  <IconButton
                    onClick={() => setActiveMonth((m) => addMonths(m, 1))}
                    sx={{
                      width: 38,
                      height: 38,
                      border: "1px solid #E4E6EB",
                      borderRadius: 2,
                      bgcolor: "#fff",
                      "&:hover": { bgcolor: "#F8F9FA" },
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 20, color: "#0f172a" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mt: 0.75 }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  Clique em um dia para ver os eventos daquele dia.
                </Typography>
                <CalendarLegend />
              </Box>
            </Box>

            {/* Linha dos dias da semana */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #E4E6EB", bgcolor: "#fff" }}>
              {weekDays.map((wd) => (
                <Box key={wd} sx={{ px: 1.25, py: 1.1, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950, letterSpacing: 0.2 }}>
                    {wd}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Grade do calendário */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "#fff" }}>
              {monthGrid.map((cell, idx) => {
                const dayNum = cell.date.getDate();
                const hasEvents = cell.itemsCount > 0;

                const isRightEdge = (idx + 1) % 7 === 0;
                const isBottomEdge = idx >= 35;

                return (
                  <Box
                    key={cell.dayKey}
                    onClick={() => openDayModal(cell.dayKey)}
                    sx={{
                      cursor: "pointer",
                      minHeight: { xs: 78, sm: 96, md: 112 },
                      p: { xs: 1.1, sm: 1.35 },
                      borderRight: isRightEdge ? "none" : "1px solid #F0F2F5",
                      borderBottom: isBottomEdge ? "none" : "1px solid #F0F2F5",
                      bgcolor: "#fff",
                      opacity: cell.isInMonth ? 1 : 0.42,
                      transition: "background-color 140ms ease, box-shadow 140ms ease",
                      "&:hover": { bgcolor: "#FAFBFC" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 950, color: cell.isToday ? "#1877F2" : "#0f172a", lineHeight: 1 }}>{dayNum}</Typography>

                        {cell.isToday ? (
                          <Chip
                            label="Hoje"
                            size="small"
                            sx={{
                              bgcolor: "#E7F3FF",
                              color: "#1877F2",
                              fontWeight: 950,
                              height: 20,
                              fontSize: "0.68rem",
                            }}
                          />
                        ) : null}
                      </Box>

                      {hasEvents ? (
                        <Chip
                          label={cell.itemsCount}
                          size="small"
                          sx={{
                            bgcolor: "#F0F2F5",
                            color: "#334155",
                            fontWeight: 950,
                            height: 20,
                            fontSize: "0.68rem",
                          }}
                        />
                      ) : null}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.15, flexWrap: "wrap" }}>
                      {cell.glyphs.map((g) => (
                        <Tooltip key={g.key} title={g.label} arrow>
                          <Box>{g.node}</Box>
                        </Tooltip>
                      ))}
                      {cell.extra > 0 ? (
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950 }}>
                          +{cell.extra}
                        </Typography>
                      ) : null}
                    </Box>

                    {!hasEvents ? (
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 900, mt: 1, display: "block" }}>
                        —
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </BaseStageComponentCard>

      {/* Modal do dia */}
      <DayEventsModal open={dayModalOpen} onClose={closeDayModal} dayLabel={selectedDayLabel} items={selectedItems} onCreateEvent={() => openCreateEvent(selectedDayKey)} />

      {/* Modal Criar evento */}
      <CreateEventModal open={createOpen} onClose={closeCreateEvent} prefillDayKey={createPrefillDayKey} onCreate={handleCreateItem} />

      {/* Modal "Ver completo" */}
      <TimelineModal open={modalOpen} onClose={closeModal} title={cfg.titulo} subtitle={cfg.descricao}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Resumo topo */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", p: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950 }}>
                Total
              </Typography>
              <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.1rem", mt: 0.25 }}>{modalDeadlinesSummary.total}</Typography>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", p: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950 }}>
                Atrasados (prazos)
              </Typography>
              <Typography sx={{ fontWeight: 950, color: "#B91C1C", fontSize: "1.1rem", mt: 0.25 }}>{modalDeadlinesSummary.overdue}</Typography>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", p: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950 }}>
                Hoje (prazos)
              </Typography>
              <Typography sx={{ fontWeight: 950, color: "#92400E", fontSize: "1.1rem", mt: 0.25 }}>{modalDeadlinesSummary.today}</Typography>
            </Box>

            <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", p: 1.5 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 950 }}>
                Próximos 7 dias (prazos)
              </Typography>
              <Typography sx={{ fontWeight: 950, color: "#1877F2", fontSize: "1.1rem", mt: 0.25 }}>{modalDeadlinesSummary.next7}</Typography>
            </Box>
          </Box>

          {/* Barra de filtros */}
          <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #E4E6EB", bgcolor: "#FAFBFC", display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              <Chip
                icon={<FilterAltIcon sx={{ fontSize: 16 }} />}
                label="Filtros"
                size="small"
                sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900, "& .MuiChip-icon": { color: "#64748b" } }}
              />
              <Chip
                icon={<SortIcon sx={{ fontSize: 16 }} />}
                label="Ordenação"
                size="small"
                sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 900, "& .MuiChip-icon": { color: "#64748b" } }}
              />
              <Chip label={`${modalFiltered.length} itens`} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 900 }} />
            </Box>

            <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 1.25 }}>
              <Select
                size="small"
                value={modalTypeFilter}
                onChange={(e) => setModalTypeFilter(e.target.value as any)}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  fontWeight: 900,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                }}
              >
                <MenuItem value="all">Categoria: Todas</MenuItem>
                <MenuItem value="status">Categoria: Andamento</MenuItem>
                <MenuItem value="versao">Categoria: Documento</MenuItem>
                <MenuItem value="arquivo">Categoria: Anexo</MenuItem>
                <MenuItem value="comentario">Categoria: Observação</MenuItem>
                <MenuItem value="acao">Categoria: Conclusão</MenuItem>
                <MenuItem value="sistema">Categoria: Registro</MenuItem>
              </Select>

              <Select
                size="small"
                value={modalSeverityFilter}
                onChange={(e) => setModalSeverityFilter(e.target.value as any)}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  fontWeight: 900,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                }}
              >
                <MenuItem value="all">Prioridade: Todas</MenuItem>
                <MenuItem value="info">Prioridade: Normal</MenuItem>
                <MenuItem value="warning">Prioridade: Atenção</MenuItem>
                <MenuItem value="danger">Prioridade: Urgente</MenuItem>
                <MenuItem value="success">Prioridade: Concluído</MenuItem>
              </Select>

              <Select
                size="small"
                value={modalSort}
                onChange={(e) => setModalSort(e.target.value as any)}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  fontWeight: 900,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                }}
              >
                <MenuItem value="recent">Ordenar: Mais recentes primeiro</MenuItem>
                <MenuItem value="oldest">Ordenar: Mais antigos primeiro</MenuItem>
                <MenuItem value="typeAZ">Ordenar: Categoria (A-Z)</MenuItem>
                <MenuItem value="severity">Ordenar: Prioridade (Urgente&gt;Atenção&gt;Normal&gt;Concluído)</MenuItem>
              </Select>

              <Box sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" }, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <TextField
                  size="small"
                  value={modalQuery}
                  onChange={(e) => setModalQuery(e.target.value)}
                  placeholder="Buscar evento..."
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ fontSize: 18, color: "#94a3b8", mr: 1 }} />,
                    endAdornment: modalQuery ? (
                      <Button onClick={() => setModalQuery("")} variant="text" sx={{ textTransform: "none", fontWeight: 900, color: "#1877F2", minWidth: 0, px: 1 }}>
                        Limpar
                      </Button>
                    ) : undefined,
                  }}
                  sx={{
                    width: { xs: "100%", md: 520 },
                    bgcolor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  }}
                />

                <FormControlLabel
                  control={<Switch checked={modalOnlyDeadlines} onChange={(e) => setModalOnlyDeadlines(e.target.checked)} />}
                  label={<Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Somente prazos</Typography>}
                  sx={{ m: 0, "& .MuiSwitch-root": { ml: 0.5 } }}
                />

                <FormControlLabel
                  control={<Switch checked={modalOnlyOverdue} onChange={(e) => setModalOnlyOverdue(e.target.checked)} />}
                  label={<Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Somente atrasados</Typography>}
                  sx={{ m: 0, "& .MuiSwitch-root": { ml: 0.5 } }}
                />
              </Box>
            </Box>
          </Box>

          {/* Lista agrupada por dia */}
          {modalFiltered.length === 0 ? (
            <Box sx={{ border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF", borderRadius: 2, p: 2, display: "flex", alignItems: "center", gap: 1.25 }}>
              <InfoIcon sx={{ color: "#1877F2" }} />
              <Box>
                <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>Nenhum evento encontrado</Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                  Ajuste os filtros, a busca ou a ordenação.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {modalGrouped.orderedKeys.map((dayKey) => {
                const parts = dayKey.split("-");
                const d = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 0, 0, 0, 0) : null;
                const label = d && isValidDate(d) ? formatPtBRDate(d) : dayKey;

                const list = modalGrouped.map[dayKey] || [];
                return (
                  <Box key={dayKey} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.25,
                        borderBottom: "1px solid #E4E6EB",
                        bgcolor: "#FAFBFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>{label}</Typography>
                        <Chip label={`${list.length} itens`} size="small" sx={{ bgcolor: "#F0F2F5", color: "#334155", fontWeight: 900, height: 22 }} />
                      </Box>
                      <Chip
                        label={dayKey === toDayKey(today) ? "Hoje" : "—"}
                        size="small"
                        sx={{
                          bgcolor: dayKey === toDayKey(today) ? "#E7F3FF" : "#F0F2F5",
                          color: dayKey === toDayKey(today) ? "#1877F2" : "#94a3b8",
                          fontWeight: 950,
                          height: 22,
                        }}
                      />
                    </Box>

                    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                      {list.map((it) => (
                        <TimelineRow key={it.id} item={it} mode="detailed" />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </TimelineModal>
    </>
  );
};