import { useState } from "react";
import { Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, LinearProgress, TextField, Tooltip, Typography, Avatar, Autocomplete } from "@mui/material";
import { BorderColor as SignatureIcon, CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Person as PersonIcon, OpenInNew as OpenInNewIcon, Download as DownloadIcon, Description as DescriptionIcon, Lock as LockIcon, Info as InfoIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, Fullscreen as FullscreenIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, GroupAdd as GroupAddIcon } from "@mui/icons-material";
import { useSignature, useSetSignatories, useSignDocument } from "@/hooks";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks";
import { useNotification } from "@/components/NotificationProvider";
import { api } from "@/services";

type ProcessSignatureComponentProps = {
  label?: string;
  description?: string;
  context: { processId: string; stageId: string; componentKey: string };
  enabled?: boolean;
  readOnly?: boolean;
  canManage?: boolean;
};

export const ProcessSignatureComponent = ({ label, description, context, enabled = true, readOnly = false, canManage = false }: ProcessSignatureComponentProps) => {
  const { data: sigData, isLoading } = useSignature(context, enabled);
  const setSignatoriesMutation = useSetSignatories();
  const signMutation = useSignDocument();
  const { users, fetchUsers } = useUsers();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [editSignatories, setEditSignatories] = useState(false);
  const [selectedSignatories, setSelectedSignatories] = useState<any[]>([]);

  const signatories = sigData?.signatories || [];
  const file = sigData?.file;
  const signedCount = sigData?.signedCount ?? 0;
  const totalSignatories = sigData?.totalSignatories ?? 0;
  const allSigned = sigData?.allSigned ?? false;

  const currentUserSignatory = signatories.find((s: any) => s.userId === currentUser?._id || s.userId?._id === currentUser?._id);
  const canSign = !!currentUserSignatory && !currentUserSignatory.signed && !readOnly;

  const handleSaveSignatories = () => {
    setSignatoriesMutation.mutate({ context, signatoryIds: selectedSignatories.map((u) => u._id) }, {
      onSuccess: () => { showNotification("Signatários definidos com sucesso!", "success"); setEditSignatories(false); },
      onError: (err: any) => { showNotification(err?.response?.data?.message || "Erro ao definir signatários", "error"); }
    });
  };

  const handleSign = async () => {
    if (!password.trim()) return;
    setSigningLoading(true);
    try {
      const email = currentUser?.email;
      if (!email) { showNotification("Não foi possível identificar o usuário logado.", "error"); return; }
      await api.post("/auth/login", { email, password });
      signMutation.mutate(context, {
        onSuccess: () => { showNotification("Documento assinado com sucesso!", "success"); setSignOpen(false); setPassword(""); },
        onError: (err: any) => { showNotification(err?.response?.data?.message || "Erro ao assinar documento", "error"); }
      });
    } catch {
      showNotification("Senha incorreta. Verifique e tente novamente.", "error");
    } finally {
      setSigningLoading(false);
    }
  };

  const header = (onClose?: () => void) => (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.1rem" : "0.95rem" }}>{label || "Assinatura Eletrônica"}</Typography>
        {description && <Tooltip title={description} arrow><InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} /></Tooltip>}
        {allSigned && <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="Todos assinaram" size="small" sx={{ bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700, "& .MuiChip-icon": { color: "#16A34A" } }} />}
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

  const content = (
    <Box sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 2 }}>
      {isLoading ? <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box> : (
        <>
          <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <DescriptionIcon sx={{ color: "#1877F2", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>Documento para assinatura</Typography>
            </Box>
            {file ? (
              <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 2, border: "1px solid #E4E6EB", display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <DescriptionIcon sx={{ color: "#1877F2", fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName}</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Documento aprovado para assinatura</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Tooltip title="Abrir em nova aba">
                    <IconButton size="small" component="a" href={file.signedUrl} target="_blank" rel="noopener noreferrer" sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
                      <OpenInNewIcon fontSize="small" sx={{ color: "#1877F2" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Baixar documento">
                    <IconButton size="small" component="a" href={file.signedUrl} download={file.fileName} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
                      <DownloadIcon fontSize="small" sx={{ color: "#1877F2" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px dashed #CBD5E1", textAlign: "center" }}>
                <DescriptionIcon sx={{ fontSize: 32, color: "#CBD5E1", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>Nenhum documento vinculado ainda</Typography>
                <Typography variant="caption" sx={{ color: "#CBD5E1" }}>O documento será vinculado após a aprovação da etapa anterior</Typography>
              </Box>
            )}
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>Signatários</Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>{signedCount} de {totalSignatories} assinaram</Typography>
              </Box>
              {canManage && !readOnly && (
                <Button variant="contained" startIcon={<GroupAddIcon />}
                  onClick={() => { setSelectedSignatories(signatories.map((s: any) => ({ _id: s.userId?._id || s.userId, firstName: s.displayName?.split(" ")[0] || "", lastName: s.displayName?.split(" ").slice(1).join(" ") || "" }))); setEditSignatories(true); }}
                  sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, fontSize: "0.8rem", "&:hover": { bgcolor: "#166FE5" } }}>
                  {signatories.length === 0 ? "Adicionar signatários" : "Editar signatários"}
                </Button>
              )}
            </Box>
            {totalSignatories > 0 && (
              <LinearProgress variant="determinate" value={Math.round((signedCount / totalSignatories) * 100)}
                sx={{ height: 6, borderRadius: 1, bgcolor: "#E4E6EB", "& .MuiLinearProgress-bar": { bgcolor: allSigned ? "#16A34A" : "#1877F2", borderRadius: 1 } }} />
            )}
          </Box>

          {signatories.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
              <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body2">Nenhum signatário definido</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {signatories.map((s: any, idx: number) => (
                <Box key={s.userId?._id || s.userId || idx}>
                  <Box sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: s.signed ? "#16A34A" : "#94a3b8", fontSize: "0.8rem", fontWeight: 700 }}>{s.displayName?.charAt(0) || "?"}</Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>{s.displayName}</Typography>
                        {s.signed && s.signedAt && (
                          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                            Assinado em {new Date(s.signedAt).toLocaleDateString("pt-BR")} às {new Date(s.signedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Chip icon={s.signed ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <ScheduleIcon sx={{ fontSize: 14 }} />} label={s.signed ? "Assinado" : "Pendente"} size="small"
                      sx={{ bgcolor: s.signed ? "#DCFCE7" : "#FEF3C7", color: s.signed ? "#16A34A" : "#92400E", fontWeight: 700, fontSize: "0.72rem", "& .MuiChip-icon": { color: s.signed ? "#16A34A" : "#92400E" } }} />
                  </Box>
                  {idx < signatories.length - 1 && <Divider sx={{ borderColor: "#F1F5F9" }} />}
                </Box>
              ))}
            </Box>
          )}

          {canSign && (
            <Button variant="contained" startIcon={<SignatureIcon />} onClick={() => setSignOpen(true)} fullWidth
              sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2, mt: 1 }}>
              Assinar Documento
            </Button>
          )}
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
        {header()}
        <Collapse in={!collapsed}>{content}</Collapse>
      </Box>
      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {header(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>{content}</Box>
        </Box>
      </Dialog>

      <Dialog open={editSignatories} onClose={() => setEditSignatories(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GroupAddIcon sx={{ fontSize: 18, color: "#1877F2" }} />
            </Box>
            {signatories.length === 0 ? "Adicionar Signatários" : "Editar Signatários"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>Selecione os usuários que devem assinar este documento.</Typography>
          <Autocomplete multiple options={users} getOptionLabel={(u) => `${u.firstName} ${u.lastName}`} value={selectedSignatories}
            onChange={(_, v) => setSelectedSignatories(v)} onOpen={() => { if (users.length === 0) fetchUsers({ limit: 100 }); }}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "#1877F2", fontSize: "0.75rem", fontWeight: 700 }}>{`${option.firstName?.charAt(0) || ""}${option.lastName?.charAt(0) || ""}`.toUpperCase()}</Avatar>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{option.firstName} {option.lastName}</Typography>
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Buscar usuários" placeholder="Digite para buscar..." />}
            isOptionEqualToValue={(a, b) => a._id === b._id} noOptionsText="Nenhum usuário encontrado" />
          {selectedSignatories.length > 0 && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, display: "block", mb: 1 }}>{selectedSignatories.length} signatário(s) selecionado(s)</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {selectedSignatories.map((u) => (
                  <Chip key={u._id} label={`${u.firstName} ${u.lastName}`} size="small"
                    avatar={<Avatar sx={{ bgcolor: "#1877F2", fontSize: "0.65rem" }}>{`${u.firstName?.charAt(0) || ""}${u.lastName?.charAt(0) || ""}`.toUpperCase()}</Avatar>}
                    sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem" }} />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditSignatories(false)} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSaveSignatories} variant="contained" disabled={setSignatoriesMutation.isPending}
            startIcon={setSignatoriesMutation.isPending ? <CircularProgress size={16} /> : <GroupAddIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {setSignatoriesMutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={signOpen} onClose={() => { setSignOpen(false); setPassword(""); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "#E7F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LockIcon sx={{ fontSize: 18, color: "#1877F2" }} />
            </Box>
            Confirmar Assinatura
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>Digite sua senha para confirmar a assinatura digital do documento.</Typography>
          <TextField fullWidth label="Senha" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSign(); }}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((v) => !v)} edge="end">{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "#EFF6FF", borderRadius: 2, border: "1px solid #BFDBFE", display: "flex", gap: 1 }}>
            <LockIcon sx={{ fontSize: 16, color: "#2563EB", mt: "2px", flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: "#1D4ED8", fontWeight: 600, fontSize: "0.8rem" }}>Sua senha valida a autenticidade da assinatura eletrônica.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => { setSignOpen(false); setPassword(""); }} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleSign} variant="contained" disabled={signingLoading || !password.trim()}
            startIcon={signingLoading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SignatureIcon />}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {signingLoading ? "Verificando..." : "Assinar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
