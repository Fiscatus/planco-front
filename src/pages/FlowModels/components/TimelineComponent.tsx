import { useState, useMemo } from "react";
import { Box, Button, Chip, IconButton, Typography, ToggleButtonGroup, ToggleButton, Tooltip, Dialog, DialogContent, TextField, MenuItem, DialogActions, Select, Pagination } from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  owner?: string;
  priority?: "low" | "medium" | "high";
};

type ViewMode = "day" | "week" | "month";

const MOCK_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Reunião de Planejamento", date: new Date(), time: "09:00", description: "Planejamento trimestral", owner: "João Silva", priority: "high" },
  { id: "2", title: "Revisão de Documentos", date: new Date(), time: "14:30", description: "Análise de contratos", owner: "Maria Santos", priority: "medium" },
  { id: "3", title: "Entrega de Relatório", date: new Date(Date.now() + 86400000), time: "16:00", description: "Relatório mensal", owner: "Pedro Costa", priority: "high" },
  { id: "4", title: "Treinamento Equipe", date: new Date(Date.now() + 172800000), time: "10:00", description: "Capacitação interna", owner: "Ana Silva", priority: "low" },
  { id: "5", title: "Apresentação de Resultados", date: new Date(Date.now() + 259200000), time: "15:00", description: "Apresentação para diretoria", owner: "Carlos Mendes", priority: "high" },
  { id: "6", title: "Auditoria Interna", date: new Date(Date.now() + 345600000), time: "11:30", description: "Verificação de processos", owner: "Juliana Oliveira", priority: "medium" },
];

const getPriorityChip = (priority?: string) => {
  if (priority === "high") return { label: "Alta", bg: "#FEE2E2", color: "#B91C1C" };
  if (priority === "medium") return { label: "Média", bg: "#FEF3C7", color: "#92400E" };
  return { label: "Baixa", bg: "#E0F2FE", color: "#075985" };
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatWeekDay = (date: Date) => {
  return date.toLocaleDateString("pt-BR", { weekday: "short" });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
};

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  
  const startDay = firstDay.getDay();
  for (let i = startDay; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const getWeekDays = (date: Date) => {
  const days: Date[] = [];
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  
  return days;
};

export const TimelineComponent = ({ config, label, description }: { config?: { events?: CalendarEvent[] }; label?: string; description?: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const events = config?.events || MOCK_EVENTS;

  const totalEvents = events.length;
  const totalPages = Math.ceil(totalEvents / limit);
  const paginatedEvents = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(startIndex, startIndex + limit);
  }, [events, page, limit]);

  const displayDate = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    }
    if (viewMode === "week") {
      const weekDays = getWeekDays(currentDate);
      return `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;
    }
    return formatDate(currentDate);
  }, [currentDate, viewMode]);

  const filteredEvents = useMemo(() => {
    if (viewMode === "day") {
      return events.filter(e => isSameDay(e.date, currentDate));
    }
    if (viewMode === "week") {
      const weekDays = getWeekDays(currentDate);
      return events.filter(e => e.date >= weekDays[0] && e.date <= weekDays[6]);
    }
    const monthDays = getMonthDays(currentDate);
    return events.filter(e => e.date >= monthDays[0] && e.date <= monthDays[monthDays.length - 1]);
  }, [events, currentDate, viewMode]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const renderDayView = () => {
    const dayEvents = filteredEvents.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    
    return (
      <Box sx={{ p: 2.25 }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", mb: 1.5 }}>
          {dayEvents.length} {dayEvents.length === 1 ? "evento" : "eventos"} hoje
        </Typography>
        {dayEvents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
            <EventIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2">Nenhum evento para este dia</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {dayEvents.map((event) => {
              const priority = getPriorityChip(event.priority);
              return (
                <Box key={event.id} sx={{ p: 1.5, bgcolor: "#FAFBFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, mb: 0.75 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        {event.time && <Chip label={event.time} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{event.title}</Typography>
                      </Box>
                      {event.description && <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", mb: 0.5 }}>{event.description}</Typography>}
                      {event.owner && <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Responsável: {event.owner}</Typography>}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Chip label={priority.label} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                      <Tooltip title="Editar evento">
                        <IconButton size="small" onClick={() => handleEditEvent(event)} sx={{ color: "#1877F2" }}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Deletar (visualização)">
                        <IconButton size="small" sx={{ color: "#F02849", opacity: 0.5 }}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
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
            const dayEvents = events.filter(e => isSameDay(e.date, day));
            const isToday = isSameDay(day, new Date());
            
            return (
              <Box key={idx} sx={{ border: "1px solid #E4E6EB", borderRadius: 2, overflow: "hidden", bgcolor: isToday ? "#F0F9FF" : "#fff", cursor: "pointer", "&:hover": { borderColor: "#1877F2" } }} onClick={() => handleDayClick(day)}>
                <Box sx={{ p: 1, bgcolor: isToday ? "#E7F3FF" : "#FAFBFC", borderBottom: "1px solid #E4E6EB", textAlign: "center" }}>
                  <Typography sx={{ fontWeight: 700, color: isToday ? "#1877F2" : "#64748b", fontSize: "0.7rem", textTransform: "uppercase" }}>
                    {formatWeekDay(day)}
                  </Typography>
                  <Typography sx={{ fontWeight: 900, color: isToday ? "#1877F2" : "#0f172a", fontSize: "1.1rem" }}>
                    {day.getDate()}
                  </Typography>
                </Box>
                <Box sx={{ p: 0.75, minHeight: 80 }}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <Box key={event.id} sx={{ mb: 0.5, p: 0.5, bgcolor: "#E7F3FF", borderRadius: 1, borderLeft: "3px solid #1877F2" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.time && `${event.time} - `}{event.title}
                      </Typography>
                    </Box>
                  ))}
                  {dayEvents.length > 3 && (
                    <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textAlign: "center", mt: 0.5 }}>
                      +{dayEvents.length - 3} mais
                    </Typography>
                  )}
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
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    return (
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
          {weekDays.map((day) => (
            <Box key={day} sx={{ textAlign: "center", py: 0.5 }}>
              <Typography sx={{ fontWeight: 900, color: "#64748b", fontSize: "0.75rem" }}>{day}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {monthDays.map((day, idx) => {
            const dayEvents = events.filter(e => isSameDay(e.date, day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <Box key={idx} sx={{ border: "1px solid #E4E6EB", borderRadius: 1, minHeight: 70, p: 0.5, bgcolor: isToday ? "#F0F9FF" : "#fff", opacity: isCurrentMonth ? 1 : 0.4, cursor: "pointer", "&:hover": { borderColor: "#1877F2" } }} onClick={() => handleDayClick(day)}>
                <Typography sx={{ fontWeight: 700, color: isToday ? "#1877F2" : "#0f172a", fontSize: "0.8rem", mb: 0.25 }}>
                  {day.getDate()}
                </Typography>
                {dayEvents.slice(0, 2).map((event) => (
                  <Box key={event.id} sx={{ mb: 0.25, p: 0.25, bgcolor: "#E7F3FF", borderRadius: 0.5, borderLeft: "2px solid #1877F2" }}>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {event.title}
                    </Typography>
                  </Box>
                ))}
                {dayEvents.length > 2 && (
                  <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700 }}>+{dayEvents.length - 2}</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#fff", overflow: "hidden" }}>
      <Box sx={{ px: 2.25, py: 2, bgcolor: "#F8FAFC", borderBottom: "2px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{label || "Cronograma de Eventos"}</Typography>
          {description && (
            <Tooltip title={description} arrow>
              <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <IconButton onClick={handlePrevious} size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F0F9FF", borderColor: "#1877F2" } }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Button onClick={handleToday} variant="outlined" size="small" startIcon={<TodayIcon />} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, borderColor: "#E4E6EB", color: "#0f172a", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
              Hoje
            </Button>
            <IconButton onClick={handleNext} size="small" sx={{ bgcolor: "#fff", border: "1px solid #E4E6EB", "&:hover": { bgcolor: "#F0F9FF", borderColor: "#1877F2" } }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem", ml: 1 }}>{displayDate}</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small">
              <ToggleButton value="day" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Dia</ToggleButton>
              <ToggleButton value="week" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Semana</ToggleButton>
              <ToggleButton value="month" sx={{ textTransform: "none", fontWeight: 700, px: 2 }}>Mês</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}

      <Box sx={{ px: 2.25, pb: 2.25, pt: 1, borderTop: "1px solid #E4E6EB", bgcolor: "#FAFBFC", display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button variant="outlined" startIcon={<TimelineIcon />} onClick={() => setShowAllEvents(true)} sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700, borderColor: "#E4E6EB", color: "#0f172a", "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" } }}>
          Ver cronograma
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)} sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
          Criar evento
        </Button>
      </Box>

      <Dialog open={showAllEvents} onClose={() => { setShowAllEvents(false); setPage(1); }} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh", display: "flex", flexDirection: "column" } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Todos os Eventos</Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>Lista completa de eventos do calendário</Typography>
            <TextField
              fullWidth
              placeholder="Buscar por nome, data, descrição ou responsável..."
              disabled
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} />,
                endAdornment: <LockIcon sx={{ color: "#94a3b8", fontSize: 20 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#F8F9FA",
                },
              }}
            />
          </Box>
          <Box sx={{ p: 3, maxHeight: "50vh", overflow: "auto", flex: 1 }}>
            {totalEvents === 0 ? (
              <Typography sx={{ textAlign: "center", color: "#94a3b8", py: 4 }}>Nenhum evento cadastrado</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {paginatedEvents.map((event) => {
                  const priority = getPriorityChip(event.priority);
                  return (
                    <Box key={event.id} sx={{ p: 1.5, bgcolor: "#FAFBFC", borderRadius: 2, border: "1px solid #E4E6EB" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                            <Chip label={formatDate(event.date)} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                            {event.time && <Chip label={event.time} size="small" sx={{ bgcolor: "#E7F3FF", color: "#1877F2", fontWeight: 700, fontSize: "0.75rem", height: 22 }} />}
                            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>{event.title}</Typography>
                          </Box>
                          {event.description && <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8rem", mb: 0.5 }}>{event.description}</Typography>}
                          {event.owner && <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>Responsável: {event.owner}</Typography>}
                        </Box>
                        <Chip label={priority.label} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 700, fontSize: "0.75rem", height: 22 }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
          {totalEvents > 0 && (
            <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB", display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: "center", gap: 2, bgcolor: "#f8fafc" }}>
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                {((page - 1) * limit) + 1}-{Math.min(page * limit, totalEvents)} de {totalEvents}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} sx={{ minWidth: 120, height: 32, fontSize: "0.875rem" }}>
                  {[5, 10, 25, 50].map((limitOption) => (
                    <MenuItem key={limitOption} value={limitOption} sx={{ "&.Mui-selected": { backgroundColor: "#f1f5f9", "&:hover": { backgroundColor: "#f1f5f9" } } }}>
                      {limitOption} por página
                    </MenuItem>
                  ))}
                </Select>
                <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} variant="outlined" shape="rounded" />
              </Box>
            </Box>
          )}
          <Box sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB", display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => { setShowAllEvents(false); setPage(1); }} variant="contained" sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Fechar</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Criar Evento</Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>Preencha os dados do novo evento (preview)</Typography>
          </Box>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Título" fullWidth disabled placeholder="Ex: Reunião de Planejamento" />
            <TextField label="Data" type="date" fullWidth disabled InputLabelProps={{ shrink: true }} />
            <TextField label="Horário" type="time" fullWidth disabled InputLabelProps={{ shrink: true }} />
            <TextField label="Descrição" fullWidth multiline rows={3} disabled placeholder="Descreva o evento..." />
            <TextField label="Responsável" fullWidth disabled placeholder="Nome do responsável" />
            <TextField label="Prioridade" select fullWidth disabled value="medium">
              <MenuItem value="low">Baixa</MenuItem>
              <MenuItem value="medium">Média</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button onClick={() => setShowCreateModal(false)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" disabled sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Criar (preview)</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedEvent(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E4E6EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#0f172a" }}>Editar Evento</Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>Modifique os dados do evento (preview)</Typography>
          </Box>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Título" fullWidth disabled value={selectedEvent?.title || ""} />
            <TextField label="Data" type="date" fullWidth disabled value={selectedEvent?.date ? selectedEvent.date.toISOString().split('T')[0] : ""} InputLabelProps={{ shrink: true }} />
            <TextField label="Horário" type="time" fullWidth disabled value={selectedEvent?.time || ""} InputLabelProps={{ shrink: true }} />
            <TextField label="Descrição" fullWidth multiline rows={3} disabled value={selectedEvent?.description || ""} />
            <TextField label="Responsável" fullWidth disabled value={selectedEvent?.owner || ""} />
            <TextField label="Prioridade" select fullWidth disabled value={selectedEvent?.priority || "medium"}>
              <MenuItem value="low">Baixa</MenuItem>
              <MenuItem value="medium">Média</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #E4E6EB" }}>
          <Button onClick={() => { setShowEditModal(false); setSelectedEvent(null); }} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Cancelar</Button>
          <Button variant="contained" disabled sx={{ bgcolor: "#1877F2", textTransform: "none", fontWeight: 700, borderRadius: 2 }}>Salvar (preview)</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
