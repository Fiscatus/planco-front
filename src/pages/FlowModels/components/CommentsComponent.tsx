import { useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  Select,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  AlternateEmail as MentionIcon,
  Reply as ReplyIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

type Attachment = {
  id: string;
  name: string;
  url?: string;
  size?: number;
};

type Comment = {
  id: string;
  author: string;
  role?: string;
  message: string;
  datetime: string;
  isCurrentUser?: boolean;
  attachments?: Attachment[];
  replyTo?: string;
};

type CommentsComponentProps = {
  config?: Record<string, unknown>;
  label?: string;
  description?: string;
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Lucas Moreira",
    role: "Gerente de RH",
    message: "Documento enviado para análise técnica.",
    datetime: "2025-01-15T09:00:00Z",
  },
  {
    id: "2",
    author: "Maria Santos",
    role: "Gerente de Projetos",
    message: "Revisão concluída. @Lucas Moreira pode prosseguir.",
    datetime: "2025-01-15T14:30:00Z",
    replyTo: "1",
  },
  {
    id: "3",
    author: "Pedro Lima",
    role: "Coordenador",
    message: "Solicitando esclarecimentos sobre requisitos.",
    datetime: "2025-01-14T16:00:00Z",
    attachments: [{ id: "a1", name: "requisitos.pdf", size: 245000 }],
  },
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = ["#1877F2", "#7C3AED", "#059669", "#F59E0B", "#E11D48", "#14B8A6"];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderMessage = (text: string, commentId: string) => {
  const regex = /@([A-Za-zÀ-ÿ\s]+)/g;
  const parts: Array<{ text: string; isMention?: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  match = regex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }
    parts.push({ text: match[0], isMention: true });
    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return (
    <Typography variant="body2" sx={{ color: "#0f172a", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {parts.map((p, i) =>
        p.isMention ? (
          <Box key={`mention-${i}-${p.text}`} component="span" sx={{ color: "#1877F2", fontWeight: 700, bgcolor: "rgba(24,119,242,0.1)", px: 0.5, py: 0.2, borderRadius: 1 }}>
            {p.text}
          </Box>
        ) : (
          <span key={`text-${i}-${p.text.slice(0, 10)}`}>{p.text}</span>
        )
      )}
    </Typography>
  );
};

export const CommentsComponent = ({ label, description }: CommentsComponentProps) => {
  const [comments] = useState<Comment[]>(MOCK_COMMENTS);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Comment[]>();
    comments.forEach(c => {
      const key = formatDate(c.datetime);
      if (!map.has(key)) {
        map.set(key, []);
      }
      const items = map.get(key);
      if (items) {
        items.push(c);
      }
    });
    const entries = Array.from(map.entries());
    return entries.sort((a, b) => sortOrder === "desc" ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]));
  }, [comments, sortOrder]);

  const commentMap = useMemo(() => {
    const m = new Map<string, Comment>();
    comments.forEach(c => m.set(c.id, c));
    return m;
  }, [comments]);

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E4E6EB", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, bgcolor: "#FAFBFC", borderBottom: "1px solid #E4E6EB" }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.125rem", mb: 2 }}>
          {label || "Comentários"}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            {description}
          </Typography>
        )}
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "#F8FAFC", border: "1px solid #E4E6EB", borderRadius: 2, px: 2, py: 1, cursor: "not-allowed" }}>
            <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
            <input
              type="text"
              placeholder="Pesquisar comentários (bloqueado no preview)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "14px",
                fontFamily: "inherit",
                color: "#94a3b8",
                backgroundColor: "transparent",
                cursor: "not-allowed",
              }}
            />
          </Box>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            size="small"
            sx={{
              minWidth: 160,
              bgcolor: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E4E6EB" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1877F2" },
            }}
          >
            <MenuItem value="desc">Mais Recentes</MenuItem>
            <MenuItem value="asc">Mais Antigos</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto", px: 3, py: 2 }}>
        {grouped.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Nenhum comentário ainda
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {grouped.map(([date, items]) => (
              <Box key={date}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Chip label={date} size="small" sx={{ bgcolor: "#F0F2F5", color: "#475569", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {items.map((comment) => {
                    const replyTarget = comment.replyTo ? commentMap.get(comment.replyTo) : null;
                    return (
                      <Box key={comment.id} sx={{ display: "flex", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: getAvatarColor(comment.author),
                            fontWeight: 700,
                            fontSize: "0.875rem",
                          }}
                        >
                          {getInitials(comment.author)}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9375rem" }}>
                                {comment.author}
                              </Typography>
                              {comment.role && (
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                                  • {comment.role}
                                </Typography>
                              )}
                              {comment.isCurrentUser && (
                                <Chip label="Você" size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, height: 20 }} />
                              )}
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
                              <TimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {formatDateTime(comment.datetime)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              bgcolor: comment.isCurrentUser ? "#F0F7FF" : "#FAFBFC",
                              border: "1px solid",
                              borderColor: comment.isCurrentUser ? "#BFDBFE" : "#E4E6EB",
                              borderRadius: 2,
                              p: 1.5,
                              position: "relative",
                            }}
                          >
                            {replyTarget && (
                              <Box
                                sx={{
                                  mb: 1,
                                  p: 1,
                                  bgcolor: "#fff",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: 1.5,
                                  cursor: "pointer",
                                  "&:hover": { bgcolor: "#F8FAFC" },
                                }}
                              >
                                <Typography variant="caption" sx={{ color: "#475569", fontWeight: 700, display: "block" }}>
                                  Respondendo a {replyTarget.author}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#64748b",
                                    display: "block",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {replyTarget.message.slice(0, 80)}...
                                </Typography>
                              </Box>
                            )}

                            <Box sx={{ pr: 5 }}>{renderMessage(comment.message, comment.id)}</Box>

                            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                              <Tooltip title="Responder">
                                <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.9)", "&:hover": { bgcolor: "#F1F5F9" } }}>
                                  <ReplyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {comment.attachments && comment.attachments.length > 0 && (
                              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #E4E6EB" }}>
                                {comment.attachments.map((att) => (
                                  <Box
                                    key={att.id}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 1,
                                      p: 1,
                                      bgcolor: "#fff",
                                      border: "1px solid #E4E6EB",
                                      borderRadius: 1.5,
                                      cursor: "pointer",
                                      "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
                                    }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                      <AttachFileIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                                      <Typography variant="body2" sx={{ color: "#1877F2", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {att.name}
                                      </Typography>
                                    </Box>
                                    {att.size && (
                                      <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                                        {formatBytes(att.size)}
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
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

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC" }}>
        <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
          <Tooltip title="Anexar arquivo">
            <IconButton size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F1F5F9" } }}>
              <AttachFileIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mencionar pessoa">
            <IconButton size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F1F5F9" } }}>
              <MentionIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva um comentário..."
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "12px",
              border: "1px solid #E4E6EB",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              color: "#0f172a",
            }}
          />
          <Button
            variant="contained"
            disabled={!text.trim()}
            sx={{
              bgcolor: "#1877F2",
              color: "#fff",
              minWidth: 48,
              height: 48,
              borderRadius: 2,
              "&:hover": { bgcolor: "#166FE5" },
              "&:disabled": { bgcolor: "#CBD5E1" },
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
