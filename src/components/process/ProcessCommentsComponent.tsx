import { useState, useRef } from "react";
import { Box, Button, Avatar, Collapse, Dialog, IconButton, Paper, TextField, Tooltip, Typography, CircularProgress, Chip } from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Info as InfoIcon,
  ChatBubbleOutline as ChatIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { useComments, useCreateComment } from "@/hooks";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks";

type ProcessCommentsComponentProps = {
  label?: string;
  description?: string;
  required?: boolean;
  context: {
    processId: string;
    stageId: string;
    componentKey: string;
  };
  enabled?: boolean;
  readOnly?: boolean;
};

import { renderCommentText } from '@/utils/renderCommentText';

const CommentsContent = ({ context, enabled, limitHeight = true, readOnly = false }: {
  context: ProcessCommentsComponentProps["context"];
  enabled: boolean;
  limitHeight?: boolean;
  readOnly?: boolean;
}) => {
  const { data: commentsData, isLoading } = useComments(context, undefined, enabled);
  const createMutation = useCreateComment();
  const { users, fetchUsers } = useUsers();
  const { user: currentUser } = useAuth();

  const [displayComment, setDisplayComment] = useState("");
  const [mentionMap, setMentionMap] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionAnchorPos, setMentionAnchorPos] = useState<{ top: number; left: number } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredUsers = mentionQuery !== null
    ? users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6)
    : [];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDisplayComment(val);
    const cursor = e.target.selectionStart ?? val.length;
    const atMatch = val.slice(0, cursor).match(/@(\w*)$/);
    if (atMatch) {
      if (users.length === 0) fetchUsers({ limit: 100 });
      setMentionQuery(atMatch[1]);
      const textarea = textareaRef.current;
      const container = containerRef.current;
      if (textarea && container) {
        const rect = container.getBoundingClientRect();
        const taRect = textarea.getBoundingClientRect();
        setMentionAnchorPos({ top: taRect.top - rect.top - 8, left: taRect.left - rect.left });
      }
    } else {
      setMentionQuery(null);
      setMentionAnchorPos(null);
    }
  };

  const handleSelectMention = (user: any) => {
    const displayName = `${user.firstName} ${user.lastName}`;
    const cursor = textareaRef.current?.selectionStart ?? displayComment.length;
    const before = displayComment.slice(0, cursor);
    const after = displayComment.slice(cursor);
    const newDisplay = before.replace(/@(\w*)$/, `@${displayName} `) + after;
    setDisplayComment(newDisplay);
    setMentionMap((prev) => ({ ...prev, [displayName]: user._id }));
    setMentionQuery(null);
    setMentionAnchorPos(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const buildTextWithIds = (display: string) => {
    let result = display;
    Object.entries(mentionMap).forEach(([name, id]) => { result = result.replaceAll(`@${name}`, `@${id}`); });
    return result;
  };

  const handleSubmit = () => {
    if (!displayComment.trim() && !selectedFile) return;
    createMutation.mutate({ context, data: { text: buildTextWithIds(displayComment) }, file: selectedFile || undefined }, {
      onSuccess: () => { setDisplayComment(""); setSelectedFile(null); setMentionQuery(null); setMentionMap({}); }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && mentionQuery === null) { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { setMentionQuery(null); setMentionAnchorPos(null); }
  };

  const getAuthorName = (author: any) => {
    if (!author) return "Usuário";
    return `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.email || "Usuário";
  };

  const getAuthorInitials = (author: any) => {
    if (!author) return "?";
    const f = author.firstName || "";
    const l = author.lastName || "";
    if (f && l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
    if (f) return f.charAt(0).toUpperCase();
    return author.email?.charAt(0).toUpperCase() || "?";
  };

  const rawComments = commentsData?.items || [];
  const comments = sortDesc
    ? [...rawComments].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [...rawComments].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Mapa userId → avatarUrl para uso nas menções
  const avatarMap = rawComments.reduce((acc: Record<string, string | null>, c: any) => {
    if (c.authorId?._id) acc[c.authorId._id] = c.authorId.avatarUrl ?? null;
    return acc;
  }, {} as Record<string, string | null>);

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: limitHeight ? undefined : "100%" }}>
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem" }}>
          {rawComments.length} {rawComments.length === 1 ? "comentário" : "comentários"}
        </Typography>
        <Tooltip title={sortDesc ? "Mostrar mais antigos primeiro" : "Mostrar mais recentes primeiro"}>
          <Button size="small" variant="outlined"
            startIcon={sortDesc ? <ArrowDownwardIcon sx={{ fontSize: 14 }} /> : <ArrowUpwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => setSortDesc((v) => !v)}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, borderColor: "#E4E6EB", color: "#64748b", fontSize: "0.75rem", py: 0.25 }}>
            {sortDesc ? "Mais recentes" : "Mais antigos"}
          </Button>
        </Tooltip>
      </Box>

      <Box sx={{ maxHeight: limitHeight ? 520 : undefined, flex: limitHeight ? undefined : 1, overflow: "auto", p: 2, minHeight: 80 }}>
        {comments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
            <ChatIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Nenhum comentário ainda</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {comments.map((comment: any) => {
              const isOwn = currentUser?._id === comment.authorId?._id;
              return (
                <Box key={comment._id} sx={{ display: "flex", gap: 1.5, flexDirection: isOwn ? "row-reverse" : "row" }}>
                  <Avatar src={comment.authorId?.avatarUrl ?? undefined} sx={{ width: 32, height: 32, bgcolor: isOwn ? "#16A34A" : "#1877F2", fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>
                    {getAuthorInitials(comment.authorId)}
                  </Avatar>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                    <Box sx={{ display: "inline-block", bgcolor: isOwn ? "#E7F3FF" : "#F0F2F5", borderRadius: isOwn ? "12px 0 12px 12px" : "0 12px 12px 12px", px: 1.5, py: 1, maxWidth: "80%" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.8rem", mb: 0.25 }}>{getAuthorName(comment.authorId)}</Typography>
                      <Typography sx={{ color: "#0f172a", fontSize: "0.875rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {renderCommentText(comment.text, comment.mentions, avatarMap)}
                      </Typography>
                      {comment.attachmentUrl && (
                        <Box sx={{ mt: 1 }}>
                          {comment.attachmentMimeType?.startsWith("image/") ? (
                            <Box component="img" src={comment.attachmentUrl} alt={comment.attachmentFileName}
                              sx={{ maxWidth: "100%", maxHeight: 240, borderRadius: 1, cursor: "zoom-in", display: "block" }}
                              onClick={() => setLightboxUrl(comment.attachmentUrl)} />
                          ) : (
                            <Box sx={{ p: 1, bgcolor: "#E7F3FF", borderRadius: 1, display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                              onClick={() => window.open(comment.attachmentUrl, "_blank")}>
                              <AttachFileIcon sx={{ fontSize: 16, color: "#1877F2" }} />
                              <Typography sx={{ fontSize: "0.8rem", color: "#1877F2", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {comment.attachmentFileName}
                              </Typography>
                              <DownloadIcon sx={{ fontSize: 16, color: "#1877F2" }} />
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", ml: 0.5 }}>{comment.createdAtBR}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {lightboxUrl && (
        <Dialog open onClose={() => setLightboxUrl(null)} maxWidth={false}
          PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none", m: 1 } }}
          onClick={() => setLightboxUrl(null)}>
          <Box component="img" src={lightboxUrl} sx={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 2, display: "block", cursor: "zoom-out" }} />
        </Dialog>
      )}

      {!readOnly && (
        <Box ref={containerRef} sx={{ p: 2, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC", position: "relative", flexShrink: 0 }}>
          {mentionQuery !== null && filteredUsers.length > 0 && mentionAnchorPos && (
            <Paper elevation={4} sx={{ position: "absolute", bottom: "100%", left: mentionAnchorPos.left, zIndex: 10, minWidth: 200, maxWidth: 280, borderRadius: 2, overflow: "hidden", mb: 0.5 }}>
              {filteredUsers.map((user) => (
                <Box key={user._id} onMouseDown={(e) => { e.preventDefault(); handleSelectMention(user); }}
                  sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", "&:hover": { bgcolor: "#F0F2F5" } }}>
                  <Avatar src={(user as any).avatarUrl ?? undefined} sx={{ width: 28, height: 28, bgcolor: "#1877F2", fontSize: "0.75rem" }}>
                    {`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a" }}>{user.firstName} {user.lastName}</Typography>
                </Box>
              ))}
            </Paper>
          )}
          {selectedFile && (
            <Box sx={{ mb: 1, p: 1, bgcolor: "#E7F3FF", borderRadius: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <AttachFileIcon sx={{ fontSize: 16, color: "#1877F2" }} />
              <Typography sx={{ fontSize: "0.75rem", color: "#1877F2", fontWeight: 600, flex: 1 }}>{selectedFile.name}</Typography>
              <IconButton size="small" onClick={() => setSelectedFile(null)} sx={{ p: 0.25 }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>✕</Typography>
              </IconButton>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
            <TextField fullWidth multiline minRows={3} maxRows={6}
              placeholder="Escreva um comentário... (@ para mencionar)"
              value={displayComment} onChange={handleTextChange} onKeyDown={handleKeyDown} inputRef={textareaRef}
              sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: 3, fontSize: "0.95rem" } }} />
            <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); }} />
            <Tooltip title="Anexar arquivo">
              <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: "#64748b", border: "1px solid #E4E6EB", borderRadius: 2 }}>
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleSubmit} disabled={createMutation.isPending || (!displayComment.trim() && !selectedFile)}
              sx={{ bgcolor: "#1877F2", color: "#fff", borderRadius: 2, "&:hover": { bgcolor: "#166FE5" }, "&.Mui-disabled": { bgcolor: "#E4E6EB" } }}>
              {createMutation.isPending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
            Enter para enviar • Shift+Enter para nova linha • @ para mencionar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const ProcessCommentsComponent = ({ label, description, required, context, enabled = true, readOnly = false }: ProcessCommentsComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const headerContent = (onClose?: () => void) => (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.1rem" : "0.95rem" }}>{label || "Comentários"}</Typography>
        {required && !onClose && <Chip label="Obrigatório" size="small" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700, fontSize: "0.65rem", height: 18 }} />}
        {description && <Tooltip title={description} arrow><InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} /></Tooltip>}
      </Box>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {onClose ? (
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
        ) : (
          <>
            <Tooltip title="Tela cheia"><IconButton size="small" onClick={() => setFullscreen(true)} sx={{ color: "#64748b" }}><FullscreenIcon fontSize="small" /></IconButton></Tooltip>
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
        <Collapse in={!collapsed}><CommentsContent context={context} enabled={enabled} readOnly={readOnly} /></Collapse>
      </Box>
      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {headerContent(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "hidden", bgcolor: "#fff", display: "flex", flexDirection: "column" }}>
            <CommentsContent context={context} enabled={enabled} limitHeight={false} readOnly={readOnly} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
