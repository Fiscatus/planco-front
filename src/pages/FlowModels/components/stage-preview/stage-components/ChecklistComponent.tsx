import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  MenuItem,
} from "@mui/material";
import {
  Checklist as ChecklistIcon,
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  AutoAwesome as AutoAwesomeIcon,
  DragIndicator as DragIndicatorIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ChecklistSource = "manual" | "auto";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;

  source: ChecklistSource; // manual | auto
  autoKey?: string; // ✅ chave estável p/ itens automáticos (dedupe)
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO (opcional)
  createdAt: string; // ISO
};

type AutoSuggestion = {
  id: string;
  label: string;
  autoKey?: string; // opcional (se o container já mandar uma chave)
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO
  relatedComponentKey?: string;
  relatedComponentType?: string;
  meta?: Record<string, any>;
};

type ChecklistConfig = {
  title?: string;
  subtitle?: string;

  items?: ChecklistItem[];

  // flags
  canEdit?: boolean; // default true
  allowAuto?: boolean; // default true (mostrar botão "Sincronizar automático")
  showCompleted?: boolean; // default true

  /**
   * ✅ Caminho A:
   * Container injeta sugestões inteligentes derivadas dos outros componentes.
   */
  autoSuggestions?: AutoSuggestion[];

  /**
   * ✅ Opcional: runtime pode injetar snapshot (processo real).
   * Checklist NÃO calcula sozinho. Ele apenas solicita sync via onEvent.
   */
  runtimeSnapshot?: Record<string, any>;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function uid(prefix = "chk") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()
    .toString(16)
    .slice(-4)}`;
}

/** hash simples e estável para gerar autoKey */
function stableKey(input: string) {
  const s = safeString(input).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `k_${h.toString(16)}`;
}

function normalizeItems(raw: unknown): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      const obj = (x ?? {}) as Record<string, unknown>;
      const text = safeString(obj.text);
      if (!text) return null;

      const source = (safeString(obj.source) as ChecklistSource) || "manual";
      const src: ChecklistSource = source === "auto" ? "auto" : "manual";

      const id = safeString(obj.id) || uid(src === "auto" ? "auto" : "it");
      const done = Boolean(obj.done);

      const priority = safeString(obj.priority) as ChecklistItem["priority"];
      const dueDate = safeString(obj.dueDate) || undefined;
      const createdAt = safeString(obj.createdAt) || new Date().toISOString();

      const autoKeyRaw = safeString(obj.autoKey);
      const autoKey =
        src === "auto" ? (autoKeyRaw || stableKey(text)) : undefined;

      return {
        id,
        text,
        done,
        source: src,
        autoKey,
        priority:
          priority === "high" || priority === "medium" || priority === "low"
            ? priority
            : undefined,
        dueDate,
        createdAt,
      } as ChecklistItem;
    })
    .filter(Boolean) as ChecklistItem[];
}

function normalizeAutoSuggestions(raw: unknown): AutoSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      const obj = (x ?? {}) as Record<string, unknown>;
      const id = safeString(obj.id);
      const label = safeString(obj.label);
      if (!id || !label) return null;

      const autoKey = safeString(obj.autoKey) || undefined;

      const pr = safeString(obj.priority) as AutoSuggestion["priority"];
      const priority =
        pr === "high" || pr === "medium" || pr === "low" ? pr : undefined;

      const dueDate = safeString(obj.dueDate) || undefined;

      return {
        id,
        label,
        autoKey,
        priority,
        dueDate,
        relatedComponentKey: safeString(obj.relatedComponentKey) || undefined,
        relatedComponentType: safeString(obj.relatedComponentType) || undefined,
        meta: (obj.meta ?? {}) as Record<string, any>,
      } as AutoSuggestion;
    })
    .filter(Boolean) as AutoSuggestion[];
}

function priorityColor(p?: ChecklistItem["priority"]) {
  if (p === "high") return { bg: "rgba(225,29,72,0.12)", fg: "#BE123C" };
  if (p === "medium") return { bg: "rgba(245,158,11,0.14)", fg: "#B45309" };
  if (p === "low") return { bg: "rgba(5,150,105,0.12)", fg: "#047857" };
  return { bg: "#F1F5F9", fg: "#475569" };
}

/** merge de itens automáticos mantendo status (done) e evitando duplicar */
function mergeAutoItems(current: ChecklistItem[], incomingAuto: ChecklistItem[]) {
  const next = current.slice();

  const byAutoKey = new Map<string, ChecklistItem>();
  next.forEach((it) => {
    if (it.source === "auto" && it.autoKey) byAutoKey.set(it.autoKey, it);
  });

  for (const it of incomingAuto) {
    const k = it.autoKey || stableKey(it.text);
    const existing = byAutoKey.get(k);

    if (existing) {
      // preserva done/prio do usuário, mas atualiza texto/dueDate se vierem
      const merged: ChecklistItem = {
        ...existing,
        text: safeString(it.text) || existing.text,
        dueDate: it.dueDate || existing.dueDate,
        // priority: mantém do usuário se já setou
        priority: existing.priority || it.priority,
      };

      const idx = next.findIndex((x) => x.id === existing.id);
      if (idx >= 0) next[idx] = merged;
    } else {
      next.push({ ...it, autoKey: k, source: "auto" });
    }
  }

  return next;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const ChecklistComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const config = raw as ChecklistConfig;

    const items = normalizeItems(config.items);

    const canEdit = typeof config.canEdit === "boolean" ? config.canEdit : true;
    const allowAuto =
      typeof config.allowAuto === "boolean" ? config.allowAuto : true;
    const showCompleted =
      typeof config.showCompleted === "boolean" ? config.showCompleted : true;

    const autoSuggestions = normalizeAutoSuggestions(config.autoSuggestions);

    return {
      title: safeString(config.title) || component.label || "Checklist da etapa",
      subtitle:
        safeString(config.subtitle) ||
        component.description ||
        "Acompanhe tarefas e pendências desta etapa",
      items,
      canEdit,
      allowAuto,
      showCompleted,
      autoSuggestions,
      runtimeSnapshot: (config.runtimeSnapshot ?? {}) as Record<string, any>,
    };
  }, [component.config, component.label, component.description]);

  const locked = isReadOnly || stageCompleted || !cfg.canEdit;

  const [items, setItems] = useState<ChecklistItem[]>(cfg.items);
  const [newText, setNewText] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  // DND simples
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setItems(cfg.items);
    setNewText("");
    setFilter("all");
    setDraggingId(null);
    setOverId(null);
  }, [cfg.items]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.reduce((acc, it) => acc + (it.done ? 1 : 0), 0);
    const open = total - done;
    return { total, done, open };
  }, [items]);

  const visible = useMemo(() => {
    const source = items.slice();
    const filtered =
      filter === "open"
        ? source.filter((x) => !x.done)
        : filter === "done"
          ? source.filter((x) => x.done)
          : source;

    if (!cfg.showCompleted) return filtered.filter((x) => !x.done);
    return filtered;
  }, [cfg.showCompleted, filter, items]);

  const persist = (next: ChecklistItem[], reason: string) => {
    setItems(next);

    onEvent?.("checklist:update", {
      componentKey: component.key,
      items: next,
      reason,
    });
  };

  const addItem = () => {
    if (locked) return;

    const t = safeString(newText);
    if (!t) return;

    const next: ChecklistItem[] = [
      ...items,
      {
        id: uid("it"),
        text: t,
        done: false,
        source: "manual",
        priority: "medium",
        createdAt: new Date().toISOString(),
      },
    ];

    setNewText("");
    persist(next, "add");
  };

  const toggle = (id: string) => {
    if (locked) return;

    const next = items.map((x) => (x.id === id ? { ...x, done: !x.done } : x));
    persist(next, "toggle");
  };

  const remove = (id: string) => {
    if (locked) return;

    const next = items.filter((x) => x.id !== id);
    persist(next, "remove");
  };

  const updateText = (id: string, text: string) => {
    if (locked) return;

    const target = items.find((x) => x.id === id);
    if (!target) return;

    // ✅ regra de produto: itens auto não podem ter texto editado (evita drift)
    if (target.source === "auto") return;

    const next = items.map((x) => (x.id === id ? { ...x, text } : x));
    persist(next, "edit:text");
  };

  const updatePriority = (id: string, pr: ChecklistItem["priority"]) => {
    if (locked) return;

    const next = items.map((x) => (x.id === id ? { ...x, priority: pr } : x));
    persist(next, "edit:priority");
  };

  // ---------------------------------------------------------------------------
  // DND
  // ---------------------------------------------------------------------------
  const reorder = (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return;

    const fromIndex = items.findIndex((x) => x.id === fromId);
    const toIndex = items.findIndex((x) => x.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const next = [...items];
    const [it] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, it);
    persist(next, "reorder");
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    if (locked) return;
    setDraggingId(id);
    setOverId(null);

    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const handleDragOverRow = (id: string) => (e: React.DragEvent) => {
    if (locked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggingId && draggingId !== id) setOverId(id);
  };

  const handleDropOnRow = (id: string) => (e: React.DragEvent) => {
    if (locked) return;
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    reorder(fromId, id);
    setDraggingId(null);
    setOverId(null);
  };

  // ---------------------------------------------------------------------------
  // AUTO (Caminho A): aplica autoSuggestions injetadas pelo container
  // ---------------------------------------------------------------------------
  const applyInjectedAutoSuggestions = () => {
    if (locked) return;

    onEvent?.("checklist:auto:request", {
      componentKey: component.key,
      source: "injected:autoSuggestions",
      suggestionsCount: cfg.autoSuggestions.length,
    });

    const incomingAuto: ChecklistItem[] = cfg.autoSuggestions
      .map((s) => {
        const text = safeString(s.label);
        if (!text) return null;

        const k = safeString(s.autoKey) || stableKey(`${s.id}::${text}`);

        return {
          id: uid("auto"),
          text,
          done: false,
          source: "auto",
          autoKey: k,
          priority: s.priority || "medium",
          dueDate: s.dueDate || undefined,
          createdAt: new Date().toISOString(),
        } as ChecklistItem;
      })
      .filter(Boolean) as ChecklistItem[];

    if (!incomingAuto.length) return;

    const merged = mergeAutoItems(items, incomingAuto);
    persist(merged, "auto:merge:injected");

    onEvent?.("checklist:auto:applied", {
      componentKey: component.key,
      count: incomingAuto.length,
      mergedTotal: merged.length,
    });
  };

  // ✅ fallback “mínimo inteligente” (mantém para preview)
  const handleFallbackAuto = () => {
    const s = cfg.runtimeSnapshot || {};
    const auto: string[] = [];

    if (s?.form?.hasRequiredMissing) auto.push("Preencher campos obrigatórios do formulário");
    if (s?.files?.count === 0) auto.push("Anexar documentos necessários");
    if (s?.signature?.pending) auto.push("Realizar assinatura pendente");
    if (s?.approval?.pending) auto.push("Enviar para aprovação / registrar aprovação");
    if (s?.comments?.shouldRegisterDecision) auto.push("Registrar decisão/parecer nos comentários da etapa");

    if (!auto.length) {
      auto.push("Revisar pendências da etapa");
      auto.push("Anexar documentos necessários");
      auto.push("Registrar decisão/parecer nos comentários da etapa");
    }

    const incomingAuto = auto
      .map((t) => safeString(t))
      .filter(Boolean)
      .map(
        (t) =>
          ({
            id: uid("auto"),
            text: t,
            done: false,
            source: "auto",
            autoKey: stableKey(t),
            priority: "medium",
            createdAt: new Date().toISOString(),
          }) as ChecklistItem,
      );

    const merged = mergeAutoItems(items, incomingAuto);
    persist(merged, "auto:merge:fallback");

    onEvent?.("checklist:auto:applied", {
      componentKey: component.key,
      count: incomingAuto.length,
      mergedTotal: merged.length,
      source: "fallback",
    });
  };

  const canSyncAuto = cfg.allowAuto && !locked;
  const hasInjectedSuggestions = cfg.autoSuggestions.length > 0;

  return (
    <BaseStageComponentCard
      title={cfg.title}
      subtitle={cfg.subtitle}
      icon={<ChecklistIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        <Chip
          label={`${stats.done}/${stats.total}`}
          size="small"
          sx={{
            bgcolor: stats.open === 0 ? "rgba(5,150,105,0.12)" : "#E7F3FF",
            color: stats.open === 0 ? "#047857" : "#1877F2",
            fontWeight: 900,
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      }
    >
      {/* Header actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.25,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField
            select
            size="small"
            label="Filtro"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            disabled={false}
            sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="open">Pendentes</MenuItem>
            <MenuItem value="done">Concluídos</MenuItem>
          </TextField>

          {cfg.allowAuto ? (
            <>
              <Button
                onClick={applyInjectedAutoSuggestions}
                disabled={!canSyncAuto || !hasInjectedSuggestions}
                startIcon={<SyncIcon />}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#E4E6EB",
                  color: "#0f172a",
                  fontWeight: 900,
                  "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
                  "&:disabled": { color: "#8A8D91", borderColor: "#E4E6EB" },
                }}
              >
                Sincronizar automático
              </Button>

              <Button
                onClick={handleFallbackAuto}
                disabled={!canSyncAuto}
                startIcon={<AutoAwesomeIcon />}
                variant="text"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  color: "#475569",
                  fontWeight: 900,
                }}
              >
                Gerar rápido
              </Button>
            </>
          ) : null}
        </Box>

        <Chip
          label={stats.open === 0 ? "Tudo concluído" : `${stats.open} pendente(s)`}
          size="small"
          sx={{
            bgcolor: stats.open === 0 ? "rgba(5,150,105,0.12)" : "#F1F5F9",
            color: stats.open === 0 ? "#047857" : "#475569",
            fontWeight: 900,
            height: 24,
          }}
        />
      </Box>

      {/* Hint quando não tem sugestões injetadas */}
      {cfg.allowAuto && !locked && !hasInjectedSuggestions ? (
        <Box
          sx={{
            mb: 1.5,
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            bgcolor: "#FAFBFC",
            p: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#475569" }}>
            Sem sugestões automáticas disponíveis.
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.25 }}>
            O container (preview/runtime) precisa injetar <b>autoSuggestions</b> com base nos outros componentes da etapa.
          </Typography>
        </Box>
      ) : null}

      {/* Add */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1.5 }}>
        <TextField
          fullWidth
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder={locked ? "Somente leitura" : "Adicionar item ao checklist…"}
          disabled={locked}
          onKeyDown={(e: any) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addItem();
          }}
          sx={{
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        />
        <Button
          onClick={addItem}
          disabled={locked || !safeString(newText)}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            boxShadow: "none",
            height: 44,
            px: 2,
            "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
          }}
        >
          Adicionar
        </Button>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* List */}
      {visible.length === 0 ? (
        <Box
          sx={{
            border: "1px dashed #CBD5E1",
            borderRadius: 2,
            p: 2.25,
            bgcolor: "#fff",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            Nenhum item aqui ainda
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.5, fontWeight: 800 }}
          >
            {filter === "done"
              ? "Sem concluídos."
              : filter === "open"
                ? "Sem pendências."
                : "Adicione um item ou sincronize automaticamente."}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {visible.map((it) => {
            const p = priorityColor(it.priority);
            const isAuto = it.source === "auto";

            return (
              <Box
                key={it.id}
                onDragOver={handleDragOverRow(it.id)}
                onDrop={handleDropOnRow(it.id)}
                sx={{
                  border: "1px solid #E4E6EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  overflow: "hidden",
                  boxShadow:
                    overId === it.id ? "0 0 0 3px rgba(24,119,242,0.18)" : "none",
                  opacity: draggingId === it.id ? 0.92 : 1,
                }}
              >
                <Box
                  sx={{
                    px: 1.25,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    draggable={!locked}
                    onDragStart={handleDragStart(it.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    title={locked ? "Bloqueado" : "Arraste para reordenar"}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: locked ? "not-allowed" : "grab",
                      color: "#64748b",
                      userSelect: "none",
                      flexShrink: 0,
                      "&:hover": locked
                        ? undefined
                        : { bgcolor: "#F1F5F9", color: "#334155" },
                      "&:active": locked ? undefined : { cursor: "grabbing" },
                    }}
                  >
                    <DragIndicatorIcon fontSize="small" />
                  </Box>

                  <Checkbox
                    checked={it.done}
                    onChange={() => toggle(it.id)}
                    disabled={locked}
                  />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <TextField
                      fullWidth
                      value={it.text}
                      onChange={(e) => updateText(it.id, e.target.value)}
                      disabled={locked || isAuto} // ✅ trava edição de texto para auto
                      placeholder="Item do checklist"
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E4E6EB",
                        },
                        "& .MuiInputBase-input": {
                          fontWeight: 850,
                          color: it.done ? "#64748b" : "#0f172a",
                          textDecoration: it.done ? "line-through" : "none",
                          cursor: isAuto ? "default" : undefined,
                        },
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        mt: 0.75,
                      }}
                    >
                      <Chip
                        label={isAuto ? "Automático" : "Manual"}
                        size="small"
                        sx={{
                          bgcolor: isAuto ? "rgba(124,58,237,0.12)" : "#F1F5F9",
                          color: isAuto ? "#6D28D9" : "#475569",
                          fontWeight: 900,
                          height: 22,
                        }}
                      />
                      {it.priority ? (
                        <Chip
                          label={
                            it.priority === "high"
                              ? "Alta"
                              : it.priority === "medium"
                                ? "Média"
                                : "Baixa"
                          }
                          size="small"
                          sx={{
                            bgcolor: p.bg,
                            color: p.fg,
                            fontWeight: 900,
                            height: 22,
                          }}
                        />
                      ) : null}
                      {it.done ? (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          label="Concluído"
                          size="small"
                          sx={{
                            bgcolor: "rgba(5,150,105,0.12)",
                            color: "#047857",
                            fontWeight: 900,
                            height: 22,
                          }}
                        />
                      ) : (
                        <Chip
                          icon={<ErrorOutlineIcon sx={{ fontSize: 16 }} />}
                          label="Pendente"
                          size="small"
                          sx={{
                            bgcolor: "#F1F5F9",
                            color: "#475569",
                            fontWeight: 900,
                            height: 22,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <TextField
                      select
                      size="small"
                      value={it.priority || "medium"}
                      disabled={locked}
                      onChange={(e) =>
                        updatePriority(it.id, e.target.value as any)
                      }
                      sx={{
                        minWidth: 110,
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      }}
                    >
                      <MenuItem value="low">Baixa</MenuItem>
                      <MenuItem value="medium">Média</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                    </TextField>

                    <Tooltip title={isAuto ? "Itens automáticos não podem ser removidos diretamente" : "Remover item"}>
                      <span>
                        <IconButton
                          onClick={() => remove(it.id)}
                          disabled={locked || isAuto} // ✅ regra: não remove auto direto
                          size="small"
                          sx={{
                            color: isAuto ? "#94a3b8" : "#B91C1C",
                            "&:hover": { bgcolor: isAuto ? "transparent" : "#FEF2F2" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {locked ? (
        <Box
          sx={{
            mt: 2,
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            bgcolor: "#FAFBFC",
            p: 2,
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#475569" }}>
            Este checklist está em modo somente leitura.
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 700, mt: 0.5 }}
          >
            {stageCompleted
              ? "A etapa foi concluída e foi bloqueada."
              : "Você não tem permissão para editar agora."}
          </Typography>
        </Box>
      ) : null}
    </BaseStageComponentCard>
  );
};
