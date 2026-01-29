import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  ChatBubbleOutline as CommentsIcon,
  Send as SendIcon,
  Schedule as ClockIcon,
  AddComment as AddCommentIcon,
  AlternateEmail as AtSignIcon,
  AttachFile as PaperclipIcon,
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type AttachmentItem = {
  id: string;
  name: string;
  url?: string;
  sizeBytes?: number;
  mime?: string;
};

type PendingAttachment = {
  id: string;
  file: File;
  objectUrl: string;
};

type CommentItem = {
  id: string;
  initials: string;
  name: string;
  role?: string;
  message: string;
  datetime: string; // ISO
  isCurrentUser?: boolean;
  isOptimistic?: boolean;
  attachments?: AttachmentItem[];
  replyToCommentId?: string;
};

type GroupedComments = {
  dateLabel: string; // dd/mm/yyyy
  dateKey: string; // yyyy-mm-dd
  comments: CommentItem[];
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function safeText(v: unknown) {
  return String(v ?? "");
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()
    .toString(16)
    .slice(-4)}`;
}

function getInitials(name: string): string {
  const parts = safeString(name).split(/\s+/).filter(Boolean);
  const letters = parts.map((p) => p.charAt(0)).join("");
  return letters.toUpperCase().slice(0, 2) || "??";
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function avatarColor(name: string) {
  const palette = [
    "#1877F2",
    "#7C3AED",
    "#059669",
    "#F59E0B",
    "#0EA5E9",
    "#E11D48",
    "#14B8A6",
    "#6366F1",
  ];
  const str = safeString(name);
  const hash = str.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function formatBytes(bytes?: number) {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function renderMessageWithMentions(message: string) {
  const text = safeString(message);
  if (!text) return null;

  const regex = /@([A-Za-zÀ-ÿ\s]+)/g;
  const parts: Array<{ t: string; isMention?: boolean }> = [];

  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    if (start > last) parts.push({ t: text.slice(last, start) });
    parts.push({ t: text.slice(start, end), isMention: true });
    last = end;
  }

  if (last < text.length) parts.push({ t: text.slice(last) });

  return (
    <Typography
      variant="body2"
      sx={{
        color: "#0f172a",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontWeight: 650,
      }}
    >
      {parts.map((p, idx) =>
        p.isMention ? (
          <Box
            key={idx}
            component="span"
            sx={{
              color: "#1D4ED8",
              fontWeight: 950,
              bgcolor: "rgba(29,78,216,0.10)",
              px: 0.6,
              py: 0.15,
              borderRadius: 999,
            }}
          >
            {p.t}
          </Box>
        ) : (
          <Box key={idx} component="span">
            {p.t}
          </Box>
        ),
      )}
    </Typography>
  );
}

const MOCK: CommentItem[] = [
  {
    id: "1",
    initials: "LM",
    name: "Lucas Moreira Brito",
    role: "Gerente de Recursos Humanos",
    message: "DFD enviado para análise técnica da GSP.",
    datetime: "2025-01-15T07:00:00Z",
  },
  {
    id: "2",
    initials: "MS",
    name: "Maria Santos",
    role: "Gerente de Projetos",
    message: "Revisão concluída. Documento aprovado. @Lucas Moreira Brito, pode prosseguir.",
    datetime: "2025-01-15T10:30:00Z",
    replyToCommentId: "1",
  },
  {
    id: "3",
    initials: "PL",
    name: "Pedro Lima",
    role: "Coordenador",
    message: "Solicitando esclarecimentos sobre requisitos técnicos.",
    datetime: "2025-01-14T14:15:00Z",
    attachments: [{ id: "att1", name: "requisitos-tecnicos.pdf", url: "#" }],
  },
  {
    id: "4",
    initials: "VC",
    name: "Você",
    role: "Analista",
    message: "Entendido, vou revisar e dar continuidade.",
    datetime: "2025-01-15T16:45:00Z",
    isCurrentUser: true,
    replyToCommentId: "3",
  },
];

export const CommentsComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const initial = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const cfgComments = raw.comments as unknown;

    if (!Array.isArray(cfgComments)) return MOCK;

    const normalized = cfgComments
      .map((c) => {
        const obj = (c ?? {}) as Record<string, unknown>;
        const id = safeString(obj.id) || safeString(obj._id);
        const name = safeString(obj.name);
        const message = safeText(obj.message); // não trim aqui para preservar quebras
        const datetime = safeString(obj.datetime);
        if (!id || !name || !datetime) return null;

        const role = safeString(obj.role) || undefined;
        const isCurrentUser = !!obj.isCurrentUser;
        const initials = safeString(obj.initials) || getInitials(name);

        const replyToCommentId = safeString(obj.replyToCommentId) || undefined;

        const attachmentsRaw = obj.attachments as unknown;
        const attachments: AttachmentItem[] = Array.isArray(attachmentsRaw)
          ? (attachmentsRaw
              .map((a) => {
                const at = (a ?? {}) as Record<string, unknown>;
                const aid = safeString(at.id) || safeString(at._id);
                const aname = safeString(at.name);
                if (!aid || !aname) return null;
                return {
                  id: aid,
                  name: aname,
                  url: safeString(at.url) || undefined,
                  sizeBytes:
                    typeof at.sizeBytes === "number" && Number.isFinite(at.sizeBytes)
                      ? at.sizeBytes
                      : undefined,
                  mime: safeString(at.mime) || undefined,
                } as AttachmentItem;
              })
              .filter(Boolean) as AttachmentItem[])
          : [];

        return {
          id,
          initials,
          name,
          role,
          message: safeText(message),
          datetime,
          isCurrentUser,
          attachments: attachments.length ? attachments : undefined,
          replyToCommentId,
        } as CommentItem;
      })
      .filter(Boolean) as CommentItem[];

    return normalized.length ? normalized : MOCK;
  }, [component.config]);

  const [comments, setComments] = useState<CommentItem[]>(initial);
  const [search, setSearch] = useState("");
  const [orderMode, setOrderMode] = useState<"desc" | "asc">("desc");

  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // ✅ anexos no composer
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const locked = isReadOnly || stageCompleted;

  const commentById = useMemo(() => {
    const m = new Map<string, CommentItem>();
    (comments || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [comments]);

  useEffect(() => {
    setComments(initial);
    setText("");
    setIsSubmitting(false);
    setCopiedId(null);
    setReplyToId(null);
    setHighlightId(null);

    // reset anexos ao trocar config
    setPendingAttachments((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.objectUrl));
      return [];
    });
  }, [initial]);

  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    if (orderMode === "desc") el.scrollTop = 0;
    else el.scrollTop = el.scrollHeight;
  }, [comments, orderMode]);

  const grouped = useMemo<GroupedComments[]>(() => {
    const q = safeString(search).toLowerCase();

    const filtered = (Array.isArray(comments) ? comments.slice() : []).filter((c) => {
      if (!q) return true;
      const hay = `${safeString(c.name)} ${safeString(c.role)} ${safeString(c.message)}`.toLowerCase();
      return hay.includes(q);
    });

    filtered.sort((a, b) => {
      const ta = new Date(a.datetime).getTime();
      const tb = new Date(b.datetime).getTime();
      return orderMode === "desc" ? tb - ta : ta - tb;
    });

    const map = new Map<string, { label: string; items: CommentItem[] }>();
    for (const c of filtered) {
      const k = dateKey(c.datetime);
      const label = formatDateLabel(c.datetime);
      if (!map.has(k)) map.set(k, { label, items: [] });
      map.get(k)!.items.push(c);
    }

    return Array.from(map.entries())
      .sort(([kA], [kB]) => {
        if (orderMode === "desc") return kA < kB ? 1 : -1;
        return kA > kB ? 1 : -1;
      })
      .map(([k, v]) => ({ dateKey: k, dateLabel: v.label, comments: v.items }));
  }, [comments, search, orderMode]);

  const countReal = useMemo(() => comments.filter((c) => !c.isOptimistic).length, [comments]);

  const handleInsertMention = () => {
    if (locked) return;
    setText((prev) => (prev.endsWith("@") ? prev : `${prev}@`));
    textareaRef.current?.focus();
    onEvent?.("comments:insertMention", { componentKey: component.key });
  };

  const handleReply = (c: CommentItem) => {
    if (locked) return;

    setReplyToId(c.id);
    setText((prev) => {
      const base = safeString(prev);
      const mention = `@${c.name} `;
      if (!base) return mention;
      if (base.startsWith(mention) || base.includes(mention)) return base;
      return `${mention}${base}`;
    });

    textareaRef.current?.focus();
    onEvent?.("comments:reply", { componentKey: component.key, commentId: c.id });
  };

  const handleCancelReply = () => {
    setReplyToId(null);
    onEvent?.("comments:reply:cancel", { componentKey: component.key });
    textareaRef.current?.focus();
  };

  const handleJumpTo = (commentId: string) => {
    const el = document.getElementById(`comment_${commentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightId(commentId);
      window.setTimeout(() => setHighlightId(null), 1400);
    }
    onEvent?.("comments:jumpTo", { componentKey: component.key, commentId });
  };

  const handleCopy = async (c: CommentItem) => {
    try {
      await navigator.clipboard.writeText(c.message);
      setCopiedId(c.id);
      window.setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // silencioso
    }
    onEvent?.("comments:copy", { componentKey: component.key, commentId: c.id });
  };

  // ---------------------------------------------------------------------------
  // ✅ Anexos: escolher arquivo(s)
  // ---------------------------------------------------------------------------
  const MAX_FILES = 12;
  const MAX_BYTES_PER_FILE = 25 * 1024 * 1024; // 25MB
  const ACCEPT =
    ".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.gif,.txt,.zip,.rar";

  const openFilePicker = () => {
    if (locked) return;
    fileInputRef.current?.click();
  };

  const cleanupPending = (items: PendingAttachment[]) => {
    items.forEach((p) => {
      try {
        URL.revokeObjectURL(p.objectUrl);
      } catch {
        // ok
      }
    });
  };

  const handlePickFiles = (files: FileList | null) => {
    if (locked) return;
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    const currentCount = pendingAttachments.length;
    const allowed = incoming.slice(0, Math.max(0, MAX_FILES - currentCount));

    const next: PendingAttachment[] = [];
    for (const f of allowed) {
      // valida tamanho
      if (f.size > MAX_BYTES_PER_FILE) continue;

      // evita duplicados básicos (nome+tamanho)
      const already = pendingAttachments.some((p) => p.file.name === f.name && p.file.size === f.size);
      if (already) continue;

      next.push({
        id: uid("att"),
        file: f,
        objectUrl: URL.createObjectURL(f),
      });
    }

    if (next.length) setPendingAttachments((prev) => [...prev, ...next]);

    // reset do input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) fileInputRef.current.value = "";

    onEvent?.("comments:attachment:pick", {
      componentKey: component.key,
      count: next.length,
    });
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) cleanupPending([target]);
      return prev.filter((p) => p.id !== id);
    });
    onEvent?.("comments:attachment:remove", { componentKey: component.key, attachmentId: id });
  };

  const clearPendingAttachments = () => {
    setPendingAttachments((prev) => {
      cleanupPending(prev);
      return [];
    });
  };

  // ---------------------------------------------------------------------------
  // ✅ Abrir/baixar anexo (url remota OU objectUrl local)
  // ---------------------------------------------------------------------------
  const openAttachment = (a: AttachmentItem) => {
    if (!a.url) return;

    // abre em nova aba (download depende do servidor/headers)
    window.open(a.url, "_blank", "noopener,noreferrer");
    onEvent?.("comments:attachment:open", {
      componentKey: component.key,
      attachmentId: a.id,
      url: a.url,
      name: a.name,
    });
  };

  const handleSubmit = useCallback(async () => {
    if (locked) return;

    const msg = safeString(text);
    const hasFiles = pendingAttachments.length > 0;

    // ✅ permite mandar "só anexo"
    if (!msg && !hasFiles) return;

    const nowIso = new Date().toISOString();

    const optimisticAttachments: AttachmentItem[] | undefined = hasFiles
      ? pendingAttachments.map((p) => ({
          id: p.id,
          name: p.file.name,
          url: p.objectUrl, // local para abrir/baixar já
          sizeBytes: p.file.size,
          mime: p.file.type || undefined,
        }))
      : undefined;

    const optimistic: CommentItem = {
      id: `temp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      initials: "VC",
      name: "Você",
      role: "Analista",
      message: msg || "", // pode ser vazio
      datetime: nowIso,
      isCurrentUser: true,
      isOptimistic: true,
      replyToCommentId: replyToId || undefined,
      attachments: optimisticAttachments,
    };

    setComments((prev) => [...prev, optimistic]);
    setText("");
    setIsSubmitting(true);
    setReplyToId(null);

    // payload de anexos (arquivos reais) para o backend tratar upload
    const filesPayload = pendingAttachments.map((p) => p.file);

    onEvent?.("comments:add", {
      componentKey: component.key,
      message: msg || "",
      datetime: nowIso,
      optimisticId: optimistic.id,
      replyToCommentId: optimistic.replyToCommentId,
      attachmentsMeta: optimisticAttachments?.map((a) => ({
        id: a.id,
        name: a.name,
        sizeBytes: a.sizeBytes,
        mime: a.mime,
      })),
      // ✅ IMPORTANTÍSSIMO: arquivos em si (para o host decidir como subir)
      files: filesPayload,
    });

    // limpa seleção local após "enfileirar" o envio
    clearPendingAttachments();

    try {
      await new Promise((r) => setTimeout(r, 900));

      // simula confirmação: em produção você deve receber anexos com URLs finais do backend
      const finalId = String(Date.now());
      setComments((prev) =>
        prev.map((c) =>
          c.id === optimistic.id
            ? {
                ...c,
                id: finalId,
                isOptimistic: false,
                // aqui no real, substitua por urls finais retornadas
              }
            : c,
        ),
      );

      onEvent?.("comments:add:confirmed", {
        componentKey: component.key,
        optimisticId: optimistic.id,
        commentId: finalId,
      });
    } catch {
      // rollback
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(msg);

      onEvent?.("comments:add:failed", {
        componentKey: component.key,
        optimisticId: optimistic.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [component.key, locked, onEvent, pendingAttachments, replyToId, text]);

  const disabledSend = locked || isSubmitting || (!safeString(text) && pendingAttachments.length === 0);

  const replyTarget = useMemo(() => {
    if (!replyToId) return null;
    return commentById.get(replyToId) || null;
  }, [commentById, replyToId]);

  // ✅ fonte única (textarea/input iguais aos comentários)
  const unifiedTextStyle = useMemo(
    () => ({
      fontFamily: "inherit",
      fontSize: "14px",
      fontWeight: 650,
      lineHeight: "1.6",
      color: "#0f172a",
    }),
    [],
  );

  return (
    <BaseStageComponentCard
      title={component.label || "Comentários"}
      subtitle={component.description || "Registro de observações e decisões da etapa"}
      icon={<CommentsIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        <Chip
          label={String(countReal)}
          size="small"
          sx={{
            bgcolor: "#F1F5F9",
            color: "#0f172a",
            fontWeight: 950,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      }
    >
      <Box
        sx={{
          bgcolor: "#ffffff",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.25 },
            py: 1.75,
            bgcolor: "#FAFBFC",
            borderBottom: "1px solid #E8EEF5",
            background: "linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)",
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "#E7F3FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CommentsIcon sx={{ fontSize: 18, color: "#1877F2" }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", lineHeight: 1.15 }}>
                Comentários da etapa
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25, fontWeight: 800 }}>
                {stageCompleted ? "Etapa concluída (somente leitura)" : "Histórico e comunicação"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={orderMode === "desc" ? "Recentes" : "Antigos"}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#475569",
                fontWeight: 900,
                height: 24,
              }}
            />
            {stageCompleted ? (
              <Chip
                label="Somente leitura"
                size="small"
                sx={{
                  bgcolor: "#F0F2F5",
                  color: "#475569",
                  fontWeight: 900,
                  height: 24,
                }}
              />
            ) : null}
          </Box>
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.25 },
            py: 1.5,
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 1.25,
            flexWrap: "wrap",
            borderBottom: "1px solid #EEF2F7",
            bgcolor: "#ffffff",
          }}
        >
          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 360 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid #E4E6EB",
                bgcolor: "#F8FAFC",
                borderRadius: 999,
                px: 1.75,
                height: 42,
              }}
            >
              <Box
                component="input"
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                placeholder="Pesquisar comentários…"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  ...unifiedTextStyle,
                }}
              />
              {search ? (
                <Button
                  onClick={() => setSearch("")}
                  variant="text"
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    color: "#64748b",
                    minWidth: "auto",
                    px: 1,
                  }}
                >
                  Limpar
                </Button>
              ) : null}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <Button
              onClick={() => setOrderMode("desc")}
              variant={orderMode === "desc" ? "contained" : "outlined"}
              sx={{
                height: 42,
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: orderMode === "desc" ? "#1877F2" : "#fff",
                color: orderMode === "desc" ? "#fff" : "#0f172a",
                borderColor: "#E4E6EB",
                "&:hover": {
                  bgcolor: orderMode === "desc" ? "#166FE5" : "#F8FAFC",
                  borderColor: "#CBD5E1",
                },
                flex: { xs: 1, sm: "unset" },
              }}
            >
              Recentes
            </Button>

            <Button
              onClick={() => setOrderMode("asc")}
              variant={orderMode === "asc" ? "contained" : "outlined"}
              sx={{
                height: 42,
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                bgcolor: orderMode === "asc" ? "#1877F2" : "#fff",
                color: orderMode === "asc" ? "#fff" : "#0f172a",
                borderColor: "#E4E6EB",
                "&:hover": {
                  bgcolor: orderMode === "asc" ? "#166FE5" : "#F8FAFC",
                  borderColor: "#CBD5E1",
                },
                flex: { xs: 1, sm: "unset" },
              }}
            >
              Antigos
            </Button>
          </Box>
        </Box>

        {/* Histórico */}
        <Box
          ref={historyRef}
          sx={{
            maxHeight: 460,
            overflowY: "auto",
            px: { xs: 2, sm: 2.25 },
            py: 2,
            bgcolor: "#ffffff",
          }}
        >
          {!grouped.length ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: "#F1F5F9",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.25,
                }}
              >
                <CommentsIcon sx={{ color: "#94a3b8" }} />
              </Box>
              <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                {safeString(search) ? "Nenhum resultado" : "Sem comentários"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5, fontWeight: 800 }}>
                {safeString(search) ? "Tente ajustar a pesquisa." : "Ainda não há comentários nesta etapa."}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {grouped.map((g) => (
                <Box key={g.dateKey}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Chip
                      label={g.dateLabel}
                      size="small"
                      sx={{
                        bgcolor: "#F0F2F5",
                        color: "#475569",
                        fontWeight: 900,
                        fontSize: "0.72rem",
                        height: 22,
                      }}
                    />
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {g.comments.map((c) => {
                      const isMine = !!c.isCurrentUser;
                      const dt = formatDateTime(c.datetime);
                      const replied = c.replyToCommentId ? commentById.get(c.replyToCommentId) : null;
                      const replyPreview = replied ? safeString(replied.message) : "";
                      const previewText =
                        replyPreview.length > 120 ? `${replyPreview.slice(0, 120)}…` : replyPreview;

                      const isHighlighted = highlightId === c.id;

                      return (
                        <Box
                          key={c.id}
                          id={`comment_${c.id}`}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "40px 1fr",
                            gap: 1.25,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: avatarColor(c.name),
                              opacity: c.isOptimistic ? 0.6 : 1,
                              fontWeight: 900,
                              fontSize: "0.85rem",
                            }}
                          >
                            {c.initials || getInitials(c.name)}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: { xs: "flex-start", sm: "center" },
                                justifyContent: "space-between",
                                gap: 1,
                                flexDirection: { xs: "column", sm: "row" },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                  minWidth: 0,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 900,
                                    color: "#0f172a",
                                    fontSize: "0.9rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: { xs: "100%", sm: 360 },
                                  }}
                                  title={c.name}
                                >
                                  {c.name}
                                </Typography>

                                {c.role ? (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 800,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: { xs: "100%", sm: 340 },
                                    }}
                                    title={c.role}
                                  >
                                    • {c.role}
                                  </Typography>
                                ) : null}

                                {isMine ? (
                                  <Chip
                                    label="Você"
                                    size="small"
                                    sx={{
                                      bgcolor: "#E7F3FF",
                                      color: "#1877F2",
                                      fontWeight: 900,
                                      height: 20,
                                    }}
                                  />
                                ) : null}
                              </Box>

                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, color: "#94a3b8" }}>
                                <ClockIcon sx={{ fontSize: 16 }} />
                                <Typography variant="caption" sx={{ fontWeight: 800 }} title={dt}>
                                  {dt}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                mt: 1,
                                position: "relative",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: isMine ? "#BFDBFE" : "#E4E6EB",
                                bgcolor: isMine ? "#F0F7FF" : "#FAFBFC",
                                p: 1.75,
                                opacity: c.isOptimistic ? 0.78 : 1,
                                transition: "box-shadow 140ms ease, border-color 140ms ease",
                                boxShadow: isHighlighted
                                  ? "0 0 0 3px rgba(24,119,242,0.20)"
                                  : "0 1px 0 rgba(15, 23, 42, 0.04)",
                                "&:hover": {
                                  borderColor: isMine ? "#93C5FD" : "#CBD5E1",
                                  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                                },
                              }}
                            >
                              {c.replyToCommentId ? (
                                <Box
                                  sx={{
                                    mb: 1.25,
                                    borderRadius: 1.5,
                                    border: "1px solid #E5E7EB",
                                    bgcolor: "#FFFFFF",
                                    p: 1,
                                    cursor: replied ? "pointer" : "default",
                                    "&:hover": replied ? { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" } : undefined,
                                  }}
                                  onClick={() => {
                                    if (!c.replyToCommentId) return;
                                    handleJumpTo(c.replyToCommentId);
                                  }}
                                >
                                  <Typography variant="caption" sx={{ color: "#475569", fontWeight: 900, display: "block" }}>
                                    Respondendo a {replied ? replied.name : "comentário anterior"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 800,
                                      display: "block",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    title={replyPreview}
                                  >
                                    {replied ? previewText : "Comentário não disponível (filtro/pesquisa)"}
                                  </Typography>
                                </Box>
                              ) : null}

                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 10,
                                  right: 10,
                                  display: "flex",
                                  gap: 0.5,
                                  bgcolor: "rgba(255,255,255,0.92)",
                                  border: "1px solid #E4E6EB",
                                  borderRadius: 2,
                                  p: 0.25,
                                }}
                              >
                                <Tooltip title="Responder">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleReply(c)}
                                      disabled={locked}
                                      sx={{ color: "#475569", "&:hover": { bgcolor: "#F1F5F9" } }}
                                    >
                                      <ReplyIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title={copiedId === c.id ? "Copiado!" : "Copiar"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCopy(c)}
                                    sx={{
                                      color: copiedId === c.id ? "#059669" : "#475569",
                                      "&:hover": { bgcolor: "#F1F5F9" },
                                    }}
                                  >
                                    <CopyIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {/* ✅ mensagem (pode ser vazia quando for só anexo) */}
                              {safeString(c.message) ? <Box sx={{ pr: 7 }}>{renderMessageWithMentions(c.message)}</Box> : null}

                              {c.isOptimistic ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.2 }}>
                                  <CircularProgress size={14} />
                                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                                    Enviando...
                                  </Typography>
                                </Box>
                              ) : null}

                              {/* ✅ anexos compactos: só link/linha (sem preview grande) */}
                              {c.attachments?.length ? (
                                <Box sx={{ mt: safeString(c.message) ? 1.25 : 0, pt: safeString(c.message) ? 1.25 : 0, borderTop: safeString(c.message) ? "1px solid #E4E6EB" : "none" }}>
                                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {c.attachments.map((a) => (
                                      <Box
                                        key={a.id}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 1,
                                          border: "1px solid #E4E6EB",
                                          borderRadius: 2,
                                          px: 1.25,
                                          py: 0.9,
                                          bgcolor: "#FFFFFF",
                                          cursor: a.url ? "pointer" : "default",
                                          "&:hover": a.url ? { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" } : undefined,
                                        }}
                                        onClick={() => {
                                          if (!a.url) return;
                                          openAttachment(a);
                                        }}
                                      >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                          <PaperclipIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: a.url ? "#1877F2" : "#64748b",
                                              fontWeight: 900,
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              maxWidth: { xs: 220, sm: 520 },
                                            }}
                                            title={a.name}
                                          >
                                            {a.name}
                                          </Typography>
                                        </Box>

                                        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 900 }}>
                                          {formatBytes(a.sizeBytes)}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              ) : null}
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: "#EEF2F7" }} />

        {/* Composer */}
        <Box sx={{ px: { xs: 2, sm: 2.25 }, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AddCommentIcon sx={{ fontSize: 18, color: "#1877F2" }} />
            <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.98rem" }}>
              Novo comentário
            </Typography>
          </Box>

          {replyTarget ? (
            <Box
              sx={{
                mb: 1,
                borderRadius: 2,
                border: "1px solid #E4E6EB",
                bgcolor: "#F8FAFC",
                px: 1.25,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: "#475569", fontWeight: 900, display: "block" }}>
                  Respondendo a {replyTarget.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 800,
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: { xs: 260, sm: 520 },
                  }}
                  title={safeString(replyTarget.message)}
                >
                  {safeString(replyTarget.message).slice(0, 120)}
                  {safeString(replyTarget.message).length > 120 ? "…" : ""}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                <Button
                  size="small"
                  onClick={() => handleJumpTo(replyTarget.id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    color: "#1877F2",
                    minWidth: "auto",
                  }}
                >
                  Ver
                </Button>
                <Button
                  size="small"
                  onClick={handleCancelReply}
                  sx={{
                    textTransform: "none",
                    fontWeight: 900,
                    color: "#475569",
                    minWidth: "auto",
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
            <Tooltip title="Inserir menção @">
              <span>
                <IconButton
                  onClick={handleInsertMention}
                  disabled={locked}
                  sx={{
                    border: "1px solid #E4E6EB",
                    borderRadius: 2,
                    bgcolor: "#fff",
                    "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
                    "&:disabled": { opacity: 0.6 },
                  }}
                >
                  <AtSignIcon sx={{ fontSize: 18, color: "#1877F2" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={locked ? "Somente leitura" : "Anexar arquivos"}>
              <span>
                <IconButton
                  onClick={openFilePicker}
                  disabled={locked}
                  sx={{
                    border: "1px solid #E4E6EB",
                    borderRadius: 2,
                    bgcolor: "#fff",
                    "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
                    "&:disabled": { opacity: 0.6 },
                  }}
                >
                  <PaperclipIcon sx={{ fontSize: 18, color: "#64748b" }} />
                </IconButton>
              </span>
            </Tooltip>

            {/* input real escondido */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              style={{ display: "none" }}
              onChange={(e) => handlePickFiles(e.target.files)}
            />
          </Box>

          {/* ✅ lista compacta de anexos selecionados (antes de enviar) */}
          {pendingAttachments.length ? (
            <Box
              sx={{
                mb: 1,
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#FAFBFC",
                p: 1.25,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Anexos</Typography>
                <Button
                  onClick={clearPendingAttachments}
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 900, color: "#475569", minWidth: "auto" }}
                >
                  Limpar
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {pendingAttachments.map((p) => (
                  <Box
                    key={p.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      border: "1px solid #E4E6EB",
                      borderRadius: 2,
                      bgcolor: "#fff",
                      px: 1.25,
                      py: 0.9,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <PaperclipIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#0f172a",
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: { xs: 220, sm: 520 },
                        }}
                        title={p.file.name}
                      >
                        {p.file.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 900 }}>
                        {formatBytes(p.file.size)}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => removePendingAttachment(p.id)}
                      aria-label="Remover anexo"
                      sx={{ color: "#475569", "&:hover": { bgcolor: "#F1F5F9" } }}
                    >
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, display: "block", mt: 1 }}>
                Máx. {MAX_FILES} arquivos • até {formatBytes(MAX_BYTES_PER_FILE)} por arquivo.
              </Typography>
            </Box>
          ) : null}

          <Box
            component="textarea"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e: any) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={locked ? "Somente leitura" : "Escreva um comentário… ou envie só anexos (sem texto) se quiser"}
            disabled={locked}
            style={{
              width: "100%",
              minHeight: 46,
              maxHeight: 220,
              resize: "vertical",
              borderRadius: 14,
              border: "1px solid #CBD5E1",
              padding: "12px 12px",
              outline: "none",
              background: locked ? "#F8FAFC" : "#fff",
              ...unifiedTextStyle,
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.25 }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={isSubmitting ? undefined : <SendIcon />}
              disabled={disabledSend}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                px: 2.25,
                height: 42,
                "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: "#0f172a" }} />
                  Enviando
                </Box>
              ) : (
                "Adicionar"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </BaseStageComponentCard>
  );
};
