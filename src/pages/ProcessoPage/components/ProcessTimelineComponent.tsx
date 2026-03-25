import { useState, useMemo } from "react";
import { Box, Button, Chip, Collapse, Dialog, DialogActions, DialogContent, IconButton, TextField, MenuItem, Typography, ToggleButtonGroup, ToggleButton, Tooltip, CircularProgress, Autocomplete } from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { useTimeline, useCreateTimelineEvent, useUpdateTimelineEvent, useDeleteTimelineEvent } from "@/hooks";
import { useUsers } from "@/hooks/useUsers";

type ViewMode = "day" | "week" | "month";

const getPriorityChip = (priority?: string) => {
  if (priority === "high" || priority === "Alta") return { label: "Alta", bg: "#FEE2E2", color: "#B91C1C" };
  if (priority === "medium" || priority === "Média") return { label: "Média", bg: "#FEF3C7", color: "#92400E" };
  return { label: "Baixa", bg: "#E0F2FE", color: "#075985" };
};

const formatDate = (date: Date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const formatWeekDay = (date: Date) => date.toLocaleDateString("pt-BR", { weekday: "short" });
const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let i = firstDay.getDay(); i > 0; i--) days.push(new Date(year, month, 1 - i));
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
  for (let i = 1; i <= 42 - days.length; i++) days.push(new Date(year, month + 1, i));
  return days;
};

const getWeekDays = (date: Date) => {
  const days: Date[] = [];
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
  return days;
};

type ProcessTimelineComponentProps = {
  label?: string;
  description?: string;
  context: { processId: string; stageId: string; componentKey: string };
  enabled?: boolean;
  readOnly?: boolean;
};

const TimelineContent = ({
  context,
  enabled,
  readOnly = false,
}: {
  context: ProcessTimelineComponentProps["context"];
  enabled: boolean;
  readOnly?: boolean;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", eventDate: "", description: "", responsavelId: "", priority: "Média" });

  const { users, fetchUsers } = useUsers();

  const timelineFilters = useMemo(() => {
    if (viewMode === "day") {
      const s = new Date(currentDate); s.setHours(0, 0, 0, 0);
      const e = new Date(currentDate); e.setHours(23, 59, 59, 999);
      return { dateFrom: s.toISOString(), dateTo: e.toISOString() };
    }
    if (viewMode === "week") {
      const w = getWeekDays(currentDate);
      const s = new Date(w[0]); s.setHours(0, 0, 0, 0);
      const e = new Date(w[6]); e.setHours(23, 59, 59, 999);
      return { dateFrom: s.toISOString(), dateTo: e.toISOString() };
    }
    const m = getMonthDays(currentDate);
    const s = new Date(m[0]); s.setHours(0, 0, 0, 0);
    const e = new Date(m[m.length - 1]); e.setHours(23, 59, 59, 999);
    return { dateFrom: s.toISOString(), dateTo: e.toISOString() };
  }, [currentDate, viewMode]);

  const { data: timelineData, isLoading } = useTimeline(context, timelineFilters, enabled);
  const createMutation = useCreateTimelineEvent();
  const updateMutation = useUpdateTimelineEvent();
  const deleteMutation = useDeleteTimelineEvent();

  const events = timelineData?.items || [];

  const filteredEvents = events;

  const displayDate = useMemo(() => {
    if (viewMode === "month") return currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    if (viewMode === "week") { const w = getWeekDays(currentDate); return `${formatDate(w[0])} - ${formatDate(w[6])}`; }
    return formatDate(currentDate);
  }, [currentDate, viewMode]);

  const handlePrevious = () => {
    const d = new Date(currentDate);
    if (viewMode === "day") d.setDate(d.getDate() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "day") d.setDate(d.getDate() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleDayClick = (date: Date) => { setCurrentDate(date); setViewMode("day"); };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      description: event.description || "",
      responsavelId: event.responsavel?._id || "",
      priority: event.priority || "Média",
    });
    setShowEditModal(true);
  };

  const handleCreateEvent = () => {
    createMutation.mutate({ context, data: { title: formData.title, eventDate: new Date(formData.eventDate).toISOString(), description: formData.description, responsavel: formData.responsavelId || undefined, priority: formData.priority } }, {
      onSuccess: () => { setShowCreateModal(false); setFormData({ title: "", eventDate: "", description: "", responsavelId: "", priority: "Média" }); }
    });
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    updateMutation.mutate({ id: selectedEvent._id, data: { title: formData.title, eventDate: new Date(formData.eventDate).toISOString(), description: formData.description, responsavel: formData.responsavelId || undefined, priority: formData.priority }, context }, {
      onSuccess: () => { setShowEditModal(false); setSelectedEvent(null); setFormData({ title: "", eventDate: "", description: "", responsavelId: "", priority: "Média" }); }
    });
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Deseja realmente deletar este evento?")) deleteMutation.mutate({ id, context });
  };

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;

  const renderDayView = () => {
    const dayEvents = filteredEvents.slice().sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    return (
      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", mb: 1.5 }}>
          {dayEvents.length} {dayEvents.length === 1 ? "evento" : "eventos"}
        </Typography>
        {dayEvents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
            <EventIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Nenhum evento para este dia</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {dayEvents.map((event: any) => {
              const priority = getPriorityChip(event.priority);
              return (
                <Box key={event._id} sx={{ p: 1.5, bgcolor: "#FAFBFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip label={new Date(event.eventDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{event.title}</Typography>
                      </Box>
                      {event.description && <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", mb: 0.5 }}>{event.description}</Typography>}
                      {event.responsavel && <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Responsável: {event.responsavel.firstName} {event.responsavel.lastName}</Typography>}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Chip label={priority.label} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                      {!readOnly && <Tooltip title="Editar evento">
                        <IconButton size="small" onClick={() => handleEditEvent(event)} sx={{ color: "#1877F2" }}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>}
                      {!readOnly && <Tooltip title="Deletar evento">
                        <IconButton size="small" onClick={() => handleDeleteEvent(event._id)} sx={{ color: "#F02849" }}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    return (
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {weekDays.map((day, idx) => {
            const dayEvents = filteredEvents.filter((e: any) => isSameDay(new Date(e.eventDate), day));
            const isToday = isSameDay(day, new Date());
            return (
              <Box key={idx} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, overflow: "hidden", bgcolor: isToday ? "#F0F9FF" : "#fff", cursor: "pointer", "&:hover": { borderColor: "#1877F2" } }} onClick={() => handleDayClick(day)}>
                <Box sx={{ p: 1, bgcolor: isToday ? "#E7F3FF" : "#FAFBFC", borderBottom: "1px solid #E4E6EB", textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: isToday ? "#1877F2" : "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>{formatWeekDay(day)}</Typography>
                  <Typography sx={{ fontWeight: 900, color: isToday ? "#1877F2" : "#0f172a", fontSize: "1.1rem" }}>{day.getDate()}</Typography>
                </Box>
                <Box sx={{ p: 0.75, minHeight: 80 }}>
                  {dayEvents.slice(0, 3).map((event: any) => (
                    <Box key={event._id} sx={{ mb: 0.5, p: 0.5, bgcolor: "#E7F3FF", borderRadius: 1, borderLeft: "3px solid #1877F2" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {new Date(event.eventDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {event.title}
                      </Typography>
                    </Box>
                  ))}
                  {dayEvents.length > 3 && <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textAlign: "center", mt: 0.5 }}>+{dayEvents.length - 3} mais</Typography>}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    const weekDayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
          {weekDayLabels.map((d) => (
            <Box key={d} sx={{ textAlign: "center", py: 0.5 }}>
              <Typography sx={{ fontWeight: 900, color: "#64748b", fontSize: "0.75rem" }}>{d}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {monthDays.map((day, idx) => {
            const dayEvents = filteredEvents.filter((e: any) => isSameDay(new Date(e.eventDate), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            return (
              <Box key={idx} sx={{ border: "1px solid #E4E6EB", borderRadius: 1, minHeight: 70, p: 0.5, bgcolor: isToday ? "#F0F9FF" : "#fff", opacity: isCurrentMonth ? 1 : 0.4, cursor: "pointer", "&:hover": { borderColor: "#1877F2" } }} onClick={() => handleDayClick(day)}>
                <Typography sx={{ fontWeight: 700, color: isToday ? "#1877F2" : "#0f172a", fontSize: "0.8rem", mb: 0.25 }}>{day.getDate()}</Typography>
                {dayEvents.slice(0, 2).map((event: any) => (
                  <Box key={event._id} sx={{ mb: 0.25, p: 0.25, bgcolor: "#E7F3FF", borderRadius: 0.5, borderLeft: "2px solid #1877F2" }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.title}</Typography>
                  </Box>
                ))}
                {dayEvents.length > 2 && <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>+{dayEvents.length - 2}</Typography>}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const eventForm = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField label="Título" fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      <TextField label="Data e Horário" type="datetime-local" fullWidth value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} InputLabelProps={{ shrink: true }} />
      <TextField label="Descrição" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      <Autocomplete
        options={users}
        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
        value={users.find((u) => u._id === formData.responsavelId) || null}
        onChange={(_, v) => setFormData({ ...formData, responsavelId: v?._id || "" })}
        onOpen={() => { if (users.length === 0) fetchUsers({ limit: 100 }); }}
        renderInput={(params) => <TextField {...params} label="Responsável" />}
      />
      <TextField label="Prioridade" select fullWidth value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
        <MenuItem value="Baixa">Baixa</MenuItem>
        <MenuItem value="Média">Média</MenuItem>
        <MenuItem value="Alta">Alta</MenuItem>
      </TextField>
    </Box>
  );

  return (
    <>
      <Box sx={{ px: 2.25, py: 1.5, bgcolor: "#F8FAFC", borderBottom: "1px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={handlePrevious} size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F0F9FF", borderColor: "#1877F2" } }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Button onClick={() => setCurrentDate(new Date())} variant="outlined" size="small" startIcon={<TodayIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, borderColor: "#E4E6EB", color: "#0f172a", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
              Hoje
            </Button>
            <IconButton onClick={handleNext} size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F0F9FF", borderColor: "#1877F2" } }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", ml: 1 }}>{displayDate}</Typography>
          </Box>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small">
            <ToggleButton value="day" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Dia</ToggleButton>
            <ToggleButton value="week" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Semana</ToggleButton>
            <ToggleButton value="month" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Mês</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}

      <Box sx={{ px: 2.25, pb: 2.25, pt: 1, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC", display: "flex", justifyContent: "flex-end" }}>
        {!readOnly && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)} sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
          Criar evento
        </Button>
        )}
      </Box>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Criar Evento</Typography>
          </Box>
          <Box sx={{ p: 3 }}>{eventForm}</Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button onClick={() => setShowCreateModal(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateEvent} disabled={createMutation.isPending || !formData.title || !formData.eventDate}
            startIcon={createMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {createMutation.isPending ? "Criando..." : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedEvent(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Editar Evento</Typography>
          </Box>
          <Box sx={{ p: 3 }}>{eventForm}</Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button onClick={() => { setShowEditModal(false); setSelectedEvent(null); }} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateEvent} disabled={updateMutation.isPending || !formData.title || !formData.eventDate}
            startIcon={updateMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const ProcessTimelineComponent = ({ label, description, context, enabled = true, readOnly = false }: ProcessTimelineComponentProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const headerContent = (onClose?: () => void) => (
    <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: onClose ? "1.1rem" : "0.95rem" }}>{label || "Cronograma de Eventos"}</Typography>
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
          <TimelineContent context={context} enabled={enabled} readOnly={readOnly} />
        </Collapse>
      </Box>

      <Dialog open={fullscreen} onClose={() => setFullscreen(false)} fullScreen>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {headerContent(() => setFullscreen(false))}
          <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#fff" }}>
            <TimelineContent context={context} enabled={enabled} readOnly={readOnly} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
