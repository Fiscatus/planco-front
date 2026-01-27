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
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

type AttachmentItem = {
  id: string;
  name: string;
  url?: string;
  sizeBytes?: number;
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
};

type GroupedComments = {
  dateLabel: string; // dd/mm/yyyy
  dateKey: string; // yyyy-mm-dd (pra ordenar)
  comments: CommentItem[];
};

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function getInitials(name: string): string {
  const parts = safeString(name).split(/\s+/).filter(Boolean);
  const letters = parts.map((p) => p.charAt(0)).join("");
  return letters.toUpperCase().slice(0, 2) || "??";
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// yyyy-mm-dd (mais fácil ordenar)
function dateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// cor estável baseada no nome (MUI Avatar)
function avatarColor(name: string) {
  const palette = ["#1877F2", "#7C3AED", "#059669", "#F59E0B", "#0EA5E9", "#E11D48", "#14B8A6", "#6366F1"];
  const str = safeString(name);
  const hash = str.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

// destaque de @menções (simples e seguro — sem dangerouslySetInnerHTML)
function renderMessageWithMentions(message: string) {
  const text = safeString(message);
  if (!text) return null;

  // casa "@Algo Algo" (bem parecido com seu regex antigo)
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
    <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {parts.map((p, idx) =>
        p.isMention ? (
          <Box
            key={idx}
            component="span"
            sx={{ color: "#4F46E5", fontWeight: 800 }}
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

// Mock leve só pra preview, mas você pode alimentar via component.config.comments depois
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
  },
];

export const CommentsComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  // Bootstrap: se vier config.comments, usa; senão mock
  const initial = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const cfgComments = raw.comments as unknown;

    if (!Array.isArray(cfgComments)) return MOCK;

    const normalized = cfgComments
      .map((c) => {
        const obj = (c ?? {}) as Record<string, unknown>;
        const id = safeString(obj.id) || safeString(obj._id);
        const name = safeString(obj.name);
        const message = safeString(obj.message);
        const datetime = safeString(obj.datetime);
        if (!id || !name || !message || !datetime) return null;

        const role = safeString(obj.role) || undefined;

        const isCurrentUser = !!obj.isCurrentUser;
        const initials = safeString(obj.initials) || getInitials(name);

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
                } as AttachmentItem;
              })
              .filter(Boolean) as AttachmentItem[])
          : [];

        return {
          id,
          initials,
          name,
          role,
          message,
          datetime,
          isCurrentUser,
          attachments: attachments.length ? attachments : undefined,
        } as CommentItem;
      })
      .filter(Boolean) as CommentItem[];

    return normalized.length ? normalized : MOCK;
  }, [component.config]);

  const [comments, setComments] = useState<CommentItem[]>(initial);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const historyRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // quando muda config (preview), reseta para ficar previsível
  useEffect(() => {
    setComments(initial);
    setText("");
    setIsSubmitting(false);
  }, [initial]);

  // scroll pro topo (mais recentes em cima)
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = 0;
  }, [comments]);

  const grouped = useMemo<GroupedComments[]>(() => {
    const arr = (Array.isArray(comments) ? comments.slice() : []).sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );

    const map = new Map<string, { label: string; items: CommentItem[] }>();

    for (const c of arr) {
      const k = dateKey(c.datetime);
      const label = formatDateLabel(c.datetime);
      if (!map.has(k)) map.set(k, { label, items: [] });
      map.get(k)!.items.push(c);
    }

    return Array.from(map.entries())
      .sort(([kA], [kB]) => (kA < kB ? 1 : -1)) // recente primeiro
      .map(([k, v]) => ({ dateKey: k, dateLabel: v.label, comments: v.items }));
  }, [comments]);

  const countReal = useMemo(() => comments.filter((c) => !c.isOptimistic).length, [comments]);

  const handleInsertMention = () => {
    if (isReadOnly) return;
    setText((prev) => (prev.endsWith("@") ? prev : `${prev}@`));
    textareaRef.current?.focus();
    onEvent?.("comments:insertMention", { componentKey: component.key });
  };

  const handleReply = (c: CommentItem) => {
    if (isReadOnly) return;
    setText(`@${c.name} `);
    textareaRef.current?.focus();
    onEvent?.("comments:reply", { componentKey: component.key, commentId: c.id });
  };

  const handleCopy = async (c: CommentItem) => {
    try {
      await navigator.clipboard.writeText(c.message);
    } catch {
      // fallback silencioso
    }
    onEvent?.("comments:copy", { componentKey: component.key, commentId: c.id });
  };

  const handleDelete = (commentId: string) => {
    if (isReadOnly) return;
    const ok = window.confirm("Excluir este comentário?");
    if (!ok) return;

    setComments((prev) => prev.filter((x) => x.id !== commentId));
    onEvent?.("comments:delete", { componentKey: component.key, commentId });
  };

  const handleSubmit = useCallback(async () => {
    if (isReadOnly) return;

    const msg = safeString(text);
    if (!msg) return;

    const nowIso = new Date().toISOString();
    const optimistic: CommentItem = {
      id: `temp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      initials: "VC",
      name: "Você",
      role: "Analista",
      message: msg,
      datetime: nowIso,
      isCurrentUser: true,
      isOptimistic: true,
    };

    setComments((prev) => [...prev, optimistic]);
    setText("");
    setIsSubmitting(true);

    onEvent?.("comments:add", {
      componentKey: component.key,
      message: msg,
      datetime: nowIso,
      optimisticId: optimistic.id,
    });

    // no preview, “simula API”
    try {
      await new Promise((r) => setTimeout(r, 900));

      const finalId = String(Date.now());
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? { ...c, id: finalId, isOptimistic: false } : c)),
      );

      onEvent?.("comments:add:confirmed", {
        componentKey: component.key,
        optimisticId: optimistic.id,
        commentId: finalId,
      });
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setText(msg);

      onEvent?.("comments:add:failed", {
        componentKey: component.key,
        optimisticId: optimistic.id,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [component.key, isReadOnly, onEvent, text]);

  const disabledSend = isReadOnly || isSubmitting || !safeString(text);

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
            bgcolor: "#F0F2F5",
            color: "#212121",
            fontWeight: 900,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      }
    >
      {/* Header interno */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <AddCommentIcon sx={{ fontSize: 18, color: "#1877F2" }} />
          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.95rem" }}>
            Histórico
          </Typography>
          {stageCompleted ? (
            <Chip
              label="Etapa concluída"
              size="small"
              sx={{
                ml: 0.5,
                bgcolor: "#ECFDF3",
                color: "#065F46",
                fontWeight: 900,
                fontSize: "0.72rem",
                height: 22,
              }}
            />
          ) : null}
        </Box>

        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 800 }}>
          Mais recentes primeiro
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Histórico */}
      <Box
        ref={historyRef}
        sx={{
          maxHeight: 420,
          overflowY: "auto",
          pr: 1,
          pb: 0.5,
        }}
      >
        {!grouped.length ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                bgcolor: "#F0F2F5",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <CommentsIcon sx={{ color: "#94a3b8" }} />
            </Box>
            <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>Sem comentários</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Ainda não há comentários nesta etapa.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {grouped.map((g) => (
              <Box key={g.dateKey}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Chip
                    label={g.dateLabel}
                    size="small"
                    sx={{
                      bgcolor: "#FAFBFC",
                      border: "1px solid #E4E6EB",
                      color: "#475569",
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      height: 22,
                    }}
                  />
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {g.comments.map((c) => (
                    <Box
                      key={c.id}
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
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center", minWidth: 0, flexWrap: "wrap" }}>
                            <Typography
                              sx={{
                                fontWeight: 900,
                                color: "#0f172a",
                                fontSize: "0.875rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: { xs: "100%", sm: 340 },
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
                                  maxWidth: { xs: "100%", sm: 320 },
                                }}
                                title={c.role}
                              >
                                • {c.role}
                              </Typography>
                            ) : null}
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
                            <ClockIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 800 }}>
                              {formatTime(c.datetime)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: 1,
                            position: "relative",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: c.isCurrentUser ? "#C7D2FE" : "#E4E6EB",
                            bgcolor: c.isCurrentUser ? "#EEF2FF" : "#FAFBFC",
                            p: 1.5,
                            opacity: c.isOptimistic ? 0.75 : 1,
                          }}
                        >
                          {/* Actions */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              display: "flex",
                              gap: 0.5,
                              bgcolor: "rgba(255,255,255,0.85)",
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
                                  disabled={isReadOnly}
                                  sx={{ color: "#64748b" }}
                                >
                                  <ReplyIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Copiar">
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(c)}
                                sx={{ color: "#64748b" }}
                              >
                                <CopyIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>

                            {c.isCurrentUser && !c.isOptimistic ? (
                              <Tooltip title="Excluir">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(c.id)}
                                    disabled={isReadOnly}
                                    sx={{ color: "#F02849" }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : null}
                          </Box>

                          {/* message */}
                          <Box sx={{ pr: 7 /* espaço pras actions */ }}>
                            {renderMessageWithMentions(c.message)}
                          </Box>

                          {/* optimistic status */}
                          {c.isOptimistic ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                              <CircularProgress size={14} />
                              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>
                                Enviando...
                              </Typography>
                            </Box>
                          ) : null}

                          {/* attachments (preview) */}
                          {c.attachments?.length ? (
                            <Box sx={{ mt: 1.25, pt: 1.25, borderTop: "1px solid #E4E6EB" }}>
                              {c.attachments.map((a) => (
                                <Box key={a.id} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                  <PaperclipIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#1877F2",
                                      fontWeight: 900,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 520,
                                      cursor: a.url ? "pointer" : "default",
                                    }}
                                    onClick={() => {
                                      if (!a.url) return;
                                      onEvent?.("comments:attachment:open", {
                                        componentKey: component.key,
                                        commentId: c.id,
                                        attachmentId: a.id,
                                        url: a.url,
                                      });
                                    }}
                                    title={a.name}
                                  >
                                    {a.name}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Composer */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <AddCommentIcon sx={{ fontSize: 18, color: "#4F46E5" }} />
          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.95rem" }}>
            Adicionar comentário
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 800, ml: "auto" }}>
            Ctrl/⌘ + Enter para enviar
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
          <Tooltip title="Inserir menção @">
            <span>
              <IconButton
                onClick={handleInsertMention}
                disabled={isReadOnly}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8F9FA" },
                }}
              >
                <AtSignIcon sx={{ fontSize: 18, color: "#4F46E5" }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Anexar (em breve)">
            <span>
              <IconButton
                disabled
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  opacity: 0.55,
                }}
              >
                <PaperclipIcon sx={{ fontSize: 18, color: "#64748b" }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

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
          placeholder={isReadOnly ? "Somente leitura" : "Escreva um comentário… use @ para mencionar"}
          disabled={isReadOnly}
          style={{
            width: "100%",
            minHeight: 44,
            maxHeight: 200,
            resize: "vertical",
            borderRadius: 12,
            border: "1px solid #CBD5E1",
            padding: "12px",
            fontSize: "14px",
            lineHeight: "1.5",
            outline: "none",
            background: isReadOnly ? "#F8FAFC" : "#fff",
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={isSubmitting ? undefined : <SendIcon />}
            disabled={disabledSend}
            sx={{
              bgcolor: "#4F46E5",
              "&:hover": { bgcolor: "#4338CA" },
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: "none",
              px: 2.25,
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
    </BaseStageComponentCard>
  );
};
