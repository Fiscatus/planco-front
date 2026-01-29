import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type FieldType = "text" | "textarea" | "radio" | "multiselect";
type Option = { value: string; label: string };

type FormFieldModel = {
  id: string;
  label: string;
  type: FieldType;
  name: string;

  required?: boolean;
  disabled?: boolean;

  placeholder?: string;
  helperText?: string;
  options?: Option[];

  width?: "full" | "half" | "third";
};

type FormConfig = {
  title?: string;
  subtitle?: string;

  fields?: FormFieldModel[];
  values?: Record<string, unknown>;

  canSave?: boolean;
  showSearch?: boolean;

  builderMode?: boolean; // default true
};

type FieldErrorMap = Record<string, string | undefined>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function safeBool(v: unknown, fallback: boolean) {
  if (typeof v === "boolean") return v;
  return fallback;
}

function uid(prefix = "f") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()
    .toString(16)
    .slice(-4)}`;
}

function safeText(v: unknown) {
  return String(v ?? "");
}

function slugifyName(label: string) {
  const base = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

  return base || "campo";
}

function normalizeOptions(raw: unknown): Option[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => {
      const obj = (o ?? {}) as Record<string, unknown>;
      const value = safeString(obj.value);
      const label = safeString(obj.label);
      if (!value || !label) return null;
      return { value, label };
    })
    .filter(Boolean) as Option[];
}

function normalizeField(raw: unknown, idx: number): FormFieldModel | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = safeString(obj.id) || `field_${idx}`;
  const label = safeString(obj.label);
  const name = safeString(obj.name);

  const type = safeString(obj.type) as FieldType;
  const allowed: FieldType[] = ["text", "textarea", "radio", "multiselect"];
  if (!label || !name) return null;
  if (!allowed.includes(type)) return null;

  const widthRaw = safeString(obj.width) as FormFieldModel["width"];
  const width: FormFieldModel["width"] =
    widthRaw === "half" || widthRaw === "third" ? widthRaw : "full";

  return {
    id,
    label,
    name,
    type,
    required: Boolean(obj.required),
    disabled: Boolean(obj.disabled),
    placeholder: safeString(obj.placeholder) || undefined,
    helperText: safeString(obj.helperText) || undefined,
    options: normalizeOptions(obj.options),
    width,
  };
}

function normalizeFields(raw: unknown): FormFieldModel[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f, idx) => normalizeField(f, idx))
    .filter(Boolean) as FormFieldModel[];
}

function normalizeValues(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, unknown>;
}

function isFilled(type: FieldType, value: unknown) {
  if (type === "multiselect") return Array.isArray(value) && value.length > 0;
  return Boolean(safeString(value));
}

function fieldToGridSpan(width: FormFieldModel["width"]) {
  if (width === "third") return { xs: "1fr", md: "1fr 1fr 1fr" };
  if (width === "half") return { xs: "1fr", md: "1fr 1fr" };
  return { xs: "1fr", md: "1fr" };
}

/** Acessibilidade: detecta "espaço" em TODOS os browsers */
function isSpaceKey(e: React.KeyboardEvent) {
  // modern
  if (e.code === "Space") return true;
  // key variations
  if (e.key === " " || e.key === "Spacebar" || e.key === "Space") return true;
  return false;
}
function isEnterKey(e: React.KeyboardEvent) {
  return e.key === "Enter" || e.code === "Enter";
}

/* -------------------------------------------------------------------------- */
/* Mocks                                                                      */
/* -------------------------------------------------------------------------- */

const MOCK_FIELDS: FormFieldModel[] = [
  {
    id: "q1",
    name: "objeto",
    label: "Objeto",
    type: "text",
    required: true,
    width: "full",
    placeholder: "Descreva o objeto...",
  },
  {
    id: "q2",
    name: "tem_etp",
    label: "Já existe ETP?",
    type: "radio",
    required: true,
    width: "half",
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
    ],
  },
  {
    id: "q3",
    name: "criterio",
    label: "Critério de julgamento",
    type: "radio",
    required: true,
    width: "half",
    options: [
      { value: "menor_preco", label: "Menor preço" },
      { value: "tecnica_preco", label: "Técnica e preço" },
    ],
  },
  {
    id: "q4",
    name: "observacoes",
    label: "Observações",
    type: "textarea",
    required: false,
    width: "full",
    placeholder: "Escreva observações...",
  },
];

const MOCK_VALUES: Record<string, unknown> = {
  objeto: "",
  tem_etp: "",
  criterio: "",
  observacoes: "",
};

/* -------------------------------------------------------------------------- */
/* Builder: “Criar perguntas” (com opções em LISTA + botão adicionar)         */
/* -------------------------------------------------------------------------- */

type SimpleQuestionType = "texto_curto" | "texto_longo" | "sim_nao" | "opcoes";

type SimpleQuestionDraft = {
  id: string;
  pergunta: string;
  tipo: SimpleQuestionType;
  obrigatorio: boolean;
  opcoesText?: string; // opções em linhas (compatível com draftToField)
};

function draftToField(
  draft: SimpleQuestionDraft,
  usedNames: Set<string>,
): FormFieldModel {
  const label = safeString(draft.pergunta) || "Pergunta";

  const base = slugifyName(label);
  let name = base;
  let n = 2;
  while (usedNames.has(name)) name = `${base}_${n++}`;
  usedNames.add(name);

  if (draft.tipo === "texto_longo") {
    return {
      id: draft.id,
      label,
      name,
      type: "textarea",
      required: draft.obrigatorio,
      width: "full",
      placeholder: "Digite aqui...",
    };
  }

  if (draft.tipo === "sim_nao") {
    return {
      id: draft.id,
      label,
      name,
      type: "radio",
      required: draft.obrigatorio,
      width: "half",
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
      ],
    };
  }

  if (draft.tipo === "opcoes") {
    const lines = safeString(draft.opcoesText)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    // garantir mínimo 2
    const normalized =
      lines.length >= 2 ? lines : [lines[0] || "Opção 1", "Opção 2"];

    const options = normalized.map((l) => ({
      value: slugifyName(l),
      label: l,
    }));

    return {
      id: draft.id,
      label,
      name,
      type: "radio",
      required: draft.obrigatorio,
      width: "half",
      options,
    };
  }

  return {
    id: draft.id,
    label,
    name,
    type: "text",
    required: draft.obrigatorio,
    width: "full",
    placeholder: "Digite aqui...",
  };
}

type SimpleBuilderDialogProps = {
  open: boolean;
  locked: boolean;
  initialFields: FormFieldModel[];
  onClose: () => void;
  onApply: (nextFields: FormFieldModel[]) => void;
};

const SimpleBuilderDialog = ({
  open,
  locked,
  initialFields,
  onClose,
  onApply,
}: SimpleBuilderDialogProps) => {
  const [drafts, setDrafts] = useState<SimpleQuestionDraft[]>([]);

  // ---------------------------------------------------------------------------
  // DND (HTML5) - reordenar perguntas
  // ---------------------------------------------------------------------------
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reorderDrafts = (fromId: string, toId: string) => {
    if (!fromId || !toId || fromId === toId) return;

    setDrafts((prev) => {
      const fromIndex = prev.findIndex((x) => x.id === fromId);
      const toIndex = prev.findIndex((x) => x.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    if (locked) return;

    setDraggingId(id);
    setOverId(null);

    // dataTransfer obrigatório para funcionar cross-browser
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const handleDragOverCard = (id: string) => (e: React.DragEvent) => {
    if (locked) return;

    // ✅ ESSENCIAL: permite drop
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // dá highlight do card alvo
    if (draggingId && draggingId !== id) setOverId(id);
  };

  const handleDropOnCard = (id: string) => (e: React.DragEvent) => {
    if (locked) return;

    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    const toId = id;

    reorderDrafts(fromId, toId);

    setDraggingId(null);
    setOverId(null);
  };

  const parseOptionsEdit = (raw?: string) =>
    safeText(raw)
      .replace(/\r/g, "")
      .split("\n")
      .map((x) => x); // NÃO trim, NÃO filter(Boolean)

  const ensureMin2Edit = (options: string[]) => {
    const next = [...options];
    while (next.length < 2) next.push("");
    return next;
  };

  const parseOptionsFinal = (raw?: string) =>
    safeText(raw)
      .replace(/\r/g, "")
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  const ensureMin2Final = (options: string[]) => {
    if (options.length >= 2) return options;
    if (options.length === 1) return [options[0] || "Opção 1", "Opção 2"];
    return ["Opção 1", "Opção 2"];
  };

  // resync ao abrir (useMemo é ok aqui porque você já usa assim no arquivo)
  useMemo(() => {
    if (!open) return;

    const next: SimpleQuestionDraft[] = (initialFields || []).map((f) => {
      const labels = (f.options || []).map((o) =>
        (o.label || "").toLowerCase(),
      );
      const isYesNo =
        f.type === "radio" &&
        (f.options || []).length === 2 &&
        labels.includes("sim") &&
        (labels.includes("não") || labels.includes("nao"));

      const tipo: SimpleQuestionType = isYesNo
        ? "sim_nao"
        : f.type === "textarea"
          ? "texto_longo"
          : f.type === "radio"
            ? "opcoes"
            : "texto_curto";

      const opcoesText =
        tipo === "opcoes"
          ? ensureMin2Final((f.options || []).map((o) => o.label)).join("\n")
          : "";

      return {
        id: f.id || uid("q"),
        pergunta: f.label || "Pergunta",
        tipo,
        obrigatorio: Boolean(f.required),
        opcoesText,
      };
    });

    setDrafts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addQuestion = () => {
    setDrafts((prev) => [
      ...prev,
      {
        id: uid("q"),
        pergunta: "",
        tipo: "sim_nao",
        obrigatorio: true,
        opcoesText: "Opção 1\nOpção 2",
      },
    ]);
  };

  const update = (id: string, patch: Partial<SimpleQuestionDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  };

  const remove = (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  /** ✅ Opções 100% funcionais (sem depender de estado "stale") */
  const addOption = (draftId: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;

        const current = ensureMin2Edit(parseOptionsEdit(d.opcoesText));
        const next = [...current, ""];
        return { ...d, opcoesText: next.join("\n") };
      }),
    );
  };

  const updateOption = (draftId: string, index: number, value: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;
        const current = ensureMin2Edit(parseOptionsEdit(d.opcoesText));
        const next = [...current];
        next[index] = value; // pode ser ""
        return { ...d, opcoesText: next.join("\n") };
      }),
    );
  };

  const removeOption = (draftId: string, index: number) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== draftId) return d;
        const current = ensureMin2Edit(parseOptionsEdit(d.opcoesText));
        const next = current.filter((_, i) => i !== index);
        const safeNext = ensureMin2Edit(next); // só garante 2 linhas vazias
        return { ...d, opcoesText: safeNext.join("\n") };
      }),
    );
  };

  const apply = () => {
    const used = new Set<string>();
    const nextFields = drafts
      .filter((d) => safeString(d.pergunta))
      .map((d) => {
        if (d.tipo === "opcoes") {
          // garante mínimo 2 antes de converter
          const safe = ensureMin2Final(parseOptionsFinal(d.opcoesText)).join(
            "\n",
          );
          return draftToField({ ...d, opcoesText: safe }, used);
        }
        return draftToField(d, used);
      });

    onApply(nextFields);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          p: 2.25,
          borderBottom: "1px solid #E4E6EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "#E7F3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TuneIcon sx={{ color: "#1877F2", fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
              Criar perguntas (modo enquete)
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
              Crie formulários sem “atalhos escondidos”: botões claros e
              intuitivos.
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#FAFBFC" }}>
        <Box
          sx={{
            px: 2.25,
            pt: 2,
            pb: 1.5,
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "#FAFBFC",
            borderBottom: "1px solid #EEF2F7",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Button
              onClick={addQuestion}
              disabled={locked}
              startIcon={<AddIcon />}
              variant="contained"
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                px: 2,
                py: 1,
                "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
              }}
            >
              Adicionar pergunta
            </Button>

            <Chip
              label={`${drafts.length} pergunta(s)`}
              size="small"
              sx={{
                bgcolor: "#F0F2F5",
                color: "#475569",
                fontWeight: 900,
                height: 24,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 2.25, pt: 2 }}>
          {drafts.length === 0 ? (
            <Box
              sx={{
                border: "1px dashed #CBD5E1",
                borderRadius: 2,
                p: 2.5,
                bgcolor: "#fff",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                Nenhuma pergunta ainda
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                Clique em “Adicionar pergunta”.
              </Typography>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {drafts.map((d, idx) => {
              const options =
                d.tipo === "opcoes"
                  ? ensureMin2Edit(parseOptionsEdit(d.opcoesText))
                  : [];

              return (
                <Box
                  key={d.id}
                  onDragOver={handleDragOverCard(d.id)}
                  onDrop={handleDropOnCard(d.id)}
                  sx={{
                    border: "1px solid #E4E6EB",
                    borderRadius: 2,
                    bgcolor: "#fff",
                    overflow: "hidden",
                    // highlight visual ao passar por cima
                    boxShadow:
                      overId === d.id
                        ? "0 0 0 3px rgba(24,119,242,0.18)"
                        : "none",
                    opacity: draggingId === d.id ? 0.92 : 1,
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      bgcolor: "#FFFFFF",
                    }}
                  >
                    {/* ESQUERDA: handle + título */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {/* HANDLE (único lugar draggable) */}
                      <Box
                        draggable={!locked}
                        onDragStart={handleDragStart(d.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => {
                          // evita o browser tentar "abrir" algo ao arrastar
                          e.preventDefault();
                        }}
                        onMouseDown={(e) => {
                          // impede selecionar texto/ativar drag no header inteiro
                          e.stopPropagation();
                        }}
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
                          "&:active": locked
                            ? undefined
                            : { cursor: "grabbing" },
                        }}
                      >
                        <DragIndicatorIcon fontSize="small" />
                      </Box>

                      <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                        Pergunta {idx + 1}
                      </Typography>
                    </Box>

                    {/* DIREITA: ações */}
                    <IconButton
                      onClick={() => remove(d.id)}
                      disabled={locked}
                      aria-label="Remover pergunta"
                      size="small"
                      sx={{
                        color: "#B91C1C",
                        "&:hover": { bgcolor: "#FEF2F2" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                      alignItems: "start",
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Pergunta"
                      placeholder="Ex: Já existe ETP?"
                      value={safeText(d.pergunta)} // ✅ não remove espaço/enter
                      disabled={locked}
                      multiline // ✅ balão de texto
                      minRows={2}
                      maxRows={6}
                      onChange={(e) =>
                        update(d.id, { pergunta: e.target.value })
                      }
                      onKeyDownCapture={(e) => {
                        // ✅ impede o pai de roubar atalhos
                        e.stopPropagation();
                      }}
                      onPasteCapture={(e) => {
                        e.stopPropagation();
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      }}
                    />

                    <TextField
                      select
                      fullWidth
                      label="Resposta"
                      value={d.tipo}
                      disabled={locked}
                      onChange={(e) => {
                        const tipo = e.target.value as SimpleQuestionType;

                        if (tipo === "opcoes") {
                          update(d.id, {
                            tipo,
                            opcoesText: ensureMin2Edit(
                              parseOptionsEdit(d.opcoesText),
                            ).join("\n"),
                          });
                          return;
                        }

                        update(d.id, { tipo, opcoesText: "" });
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    >
                      <MenuItem value="texto_curto">Texto curto</MenuItem>
                      <MenuItem value="texto_longo">Texto longo</MenuItem>
                      <MenuItem value="sim_nao">Sim / Não</MenuItem>
                      <MenuItem value="opcoes">Opções</MenuItem>
                    </TextField>

                    {d.tipo === "opcoes" ? (
                      <Box sx={{ gridColumn: "1 / -1" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography
                            sx={{ fontWeight: 900, color: "#0f172a" }}
                          >
                            Opções
                          </Typography>

                          <Button
                            onClick={() => addOption(d.id)}
                            disabled={locked}
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: 900,
                              borderRadius: 2,
                            }}
                          >
                            Adicionar opção
                          </Button>
                        </Box>

                        <Box
                          sx={{
                            border: "1px solid #E4E6EB",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            p: 1.25,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {options.map((opt, i) => (
                            <Box
                              key={`${d.id}_opt_${i}`}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <TextField
                                fullWidth
                                value={opt}
                                disabled={locked}
                                placeholder={`Opção ${i + 1}`}
                                onChange={(e) =>
                                  updateOption(d.id, i, e.target.value)
                                }
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                  },
                                }}
                              />

                              <IconButton
                                aria-label="Remover opção"
                                disabled={locked || options.length <= 2}
                                onClick={() => removeOption(d.id, i)}
                                size="small"
                                sx={{
                                  color: "#B91C1C",
                                  "&:hover": { bgcolor: "#FEF2F2" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}

                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontWeight: 700, mt: 0.25 }}
                          >
                            Mantenha pelo menos 2 opções.
                          </Typography>
                        </Box>
                      </Box>
                    ) : null}

                    {d.tipo === "sim_nao" ? (
                      <Box
                        sx={{
                          gridColumn: "1 / -1",
                          border: "1px solid #E4E6EB",
                          borderRadius: 2,
                          bgcolor: "#FAFBFC",
                          p: 1.25,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, color: "#334155" }}>
                          Resposta Sim/Não (automático)
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", mt: 0.25 }}
                        >
                          O formulário mostrará “Sim” e “Não”.
                        </Typography>
                      </Box>
                    ) : null}

                    <Box
                      sx={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        flexWrap: "wrap",
                        pt: 0.25,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={d.obrigatorio}
                            disabled={locked}
                            onChange={(e) =>
                              update(d.id, { obrigatorio: e.target.checked })
                            }
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontWeight: 800, color: "#334155" }}
                          >
                            Obrigatório
                          </Typography>
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#E4E6EB",
                color: "#212121",
                fontWeight: 900,
                flex: 1,
                "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
              }}
            >
              Cancelar
            </Button>

            <Button
              onClick={apply}
              variant="contained"
              disabled={locked}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 2,
                boxShadow: "none",
                flex: 1,
                "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
              }}
            >
              Aplicar perguntas
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const FormComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const config = raw as FormConfig;

    const fields = normalizeFields(config.fields);
    const values = normalizeValues(config.values);

    const canSave = safeBool(config.canSave, true);
    const showSearch = safeBool(config.showSearch, false);
    const builderMode = safeBool(config.builderMode, true);

    return {
      title: safeString(config.title) || component.label || "Formulário",
      subtitle:
        safeString(config.subtitle) ||
        component.description ||
        "Preencha os campos desta etapa",
      fields: fields.length ? fields : MOCK_FIELDS,
      values: Object.keys(values).length ? values : MOCK_VALUES,
      canSave,
      showSearch,
      builderMode,
    };
  }, [component.config, component.label, component.description]);

  const locked = isReadOnly || stageCompleted;

  const [values, setValues] = useState<Record<string, unknown>>(cfg.values);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [query, setQuery] = useState("");

  const [fields, setFields] = useState<FormFieldModel[]>(cfg.fields);
  const [builderOpen, setBuilderOpen] = useState(false);

  const filteredFields = useMemo(() => {
    const source = fields;
    if (!cfg.showSearch) return source;

    const q = safeString(query).toLowerCase();
    if (!q) return source;

    return source.filter((f) => {
      return (
        f.label.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        safeString(values[f.name]).toLowerCase().includes(q)
      );
    });
  }, [cfg.showSearch, fields, query, values]);

  const stats = useMemo(() => {
    const total = fields.length;
    const filled = fields.reduce(
      (acc, f) => acc + (isFilled(f.type, values[f.name]) ? 1 : 0),
      0,
    );
    return { total, filled };
  }, [fields, values]);

  const validate = (): boolean => {
    const next: FieldErrorMap = {};
    fields.forEach((f) => {
      if (!f.required) return;
      if (!isFilled(f.type, values[f.name])) next[f.name] = "Campo obrigatório";
    });

    setErrors(next);

    const hasErrors = Object.values(next).some(Boolean);
    if (hasErrors) {
      onEvent?.("form:validate:failed", {
        componentKey: component.key,
        errors: next,
      });
    }

    return !hasErrors;
  };

  const setFieldValue = (name: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));

    onEvent?.("form:change", {
      componentKey: component.key,
      name,
      value: val,
    });
  };

  const handleSave = () => {
    if (locked) return;
    if (!validate()) return;

    onEvent?.("form:save", {
      componentKey: component.key,
      values,
      fields,
    });
  };

  const renderField = (f: FormFieldModel) => {
    const disabled = locked || Boolean(f.disabled);
    const err = errors[f.name];

    const baseSx = {
      "& .MuiOutlinedInput-root": { borderRadius: 2 },
      "& .MuiInputLabel-root": { fontWeight: 800 },
    };

    if (f.type === "text") {
      return (
        <TextField
          fullWidth
          label={f.required ? `${f.label} *` : f.label}
          value={safeString(values[f.name])}
          onChange={(e) => setFieldValue(f.name, e.target.value)}
          disabled={disabled}
          placeholder={f.placeholder}
          helperText={err || f.helperText}
          error={Boolean(err)}
          sx={baseSx}
        />
      );
    }

    if (f.type === "textarea") {
      return (
        <TextField
          fullWidth
          multiline
          minRows={4}
          label={f.required ? `${f.label} *` : f.label}
          value={safeString(values[f.name])}
          onChange={(e) => setFieldValue(f.name, e.target.value)}
          disabled={disabled}
          placeholder={f.placeholder}
          helperText={err || f.helperText}
          error={Boolean(err)}
          sx={baseSx}
        />
      );
    }

    // ✅ RADIO: click + teclado (Enter/Space) 100%
    if (f.type === "radio") {
      const v = safeString(values[f.name]);
      const opts = f.options || [];

      return (
        <Box
          sx={{
            width: "100%",
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            p: 2,
            bgcolor: disabled ? "#F8FAFC" : "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>

          {f.helperText ? (
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontWeight: 700, mt: 0.25 }}
            >
              {f.helperText}
            </Typography>
          ) : null}

          {err ? (
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 900, mt: 0.5 }}
            >
              {err}
            </Typography>
          ) : null}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {opts.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: "#94a3b8", fontWeight: 800 }}
              >
                Sem opções configuradas.
              </Typography>
            ) : null}

            {opts.map((opt) => {
              const selected = v === opt.value;

              return (
                <Box
                  key={opt.value}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-disabled={disabled ? "true" : "false"}
                  aria-pressed={selected ? "true" : "false"}
                  onClick={() => {
                    if (disabled) return;
                    setFieldValue(f.name, opt.value);
                  }}
                  onKeyDown={(e) => {
                    if (disabled) return;
                    // IMPORTANTÍSSIMO: Space dá scroll; previne.
                    if (isEnterKey(e) || isSpaceKey(e)) {
                      e.preventDefault();
                      e.stopPropagation();
                      setFieldValue(f.name, opt.value);
                    }
                  }}
                  sx={{
                    width: "100%", // ✅ ocupa tudo
                    border: "1px solid #E4E6EB",
                    borderRadius: 2,
                    px: 1.5, // ✅ mais "profissional" (menos apertado)
                    py: 1.25,
                    minHeight: 44, // ✅ altura padrão de item clicável
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.7 : 1,
                    bgcolor: selected ? "#E7F3FF" : "#fff",
                    outline: "none",
                    "&:hover": disabled
                      ? undefined
                      : { borderColor: "#1877F2", backgroundColor: "#F5FAFF" },
                    "&:focus-visible": disabled
                      ? undefined
                      : {
                          boxShadow: "0 0 0 3px rgba(24, 119, 242, 0.18)",
                          borderColor: "#1877F2",
                        },
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: "#334155" }}>
                    {opt.label}
                  </Typography>

                  <Checkbox checked={selected} disabled />
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    }

    if (f.type === "multiselect") {
      const current = Array.isArray(values[f.name])
        ? (values[f.name] as unknown[])
        : [];
      const selected = current.map((x) => safeString(x)).filter(Boolean);

      return (
        <Box
          sx={{
            width: "100%", // ✅ ocupa tudo
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            p: 2, // ✅ mais respiro que 1.5
            bgcolor: disabled ? "#F8FAFC" : "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>

          {err ? (
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 900, mt: 0.5 }}
            >
              {err}
            </Typography>
          ) : null}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {(f.options || []).map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  onClick={() => {
                    if (disabled) return;
                    const next = checked
                      ? selected.filter((x) => x !== opt.value)
                      : [...selected, opt.value];
                    setFieldValue(f.name, next);
                  }}
                  sx={{
                    bgcolor: checked ? "#E7F3FF" : "#F0F2F5",
                    color: checked ? "#1877F2" : "#475569",
                    fontWeight: 900,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      );
    }

    if (f.type === "multiselect") {
      const current = Array.isArray(values[f.name])
        ? (values[f.name] as unknown[])
        : [];
      const selected = current.map((x) => safeString(x)).filter(Boolean);

      return (
        <Box
          sx={{
            width: "100%",
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            p: 2,
            bgcolor: disabled ? "#F8FAFC" : "#fff",
          }}
        >
          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>

          {err ? (
            <Typography
              variant="body2"
              sx={{ color: "#B91C1C", fontWeight: 900, mt: 0.5 }}
            >
              {err}
            </Typography>
          ) : null}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {(f.options || []).map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  onClick={() => {
                    if (disabled) return;
                    const next = checked
                      ? selected.filter((x) => x !== opt.value)
                      : [...selected, opt.value];
                    setFieldValue(f.name, next);
                  }}
                  sx={{
                    bgcolor: checked ? "#E7F3FF" : "#F0F2F5",
                    color: checked ? "#1877F2" : "#475569",
                    fontWeight: 900,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      );
    }

    return (
      <TextField
        fullWidth
        label={f.label}
        value={safeString(values[f.name])}
        onChange={(e) => setFieldValue(f.name, e.target.value)}
        disabled
        helperText="Tipo de campo não suportado"
        sx={baseSx}
      />
    );
  };

  const grouped = useMemo(() => {
    const lines: FormFieldModel[][] = [];
    let current: FormFieldModel[] = [];
    let mode: FormFieldModel["width"] | null = null;

    const flush = () => {
      if (current.length) lines.push(current);
      current = [];
      mode = null;
    };

    filteredFields.forEach((f) => {
      const w = f.width || "full";
      if (w === "full") {
        flush();
        lines.push([f]);
        return;
      }

      if (!mode) mode = w;
      if (mode !== w) {
        flush();
        mode = w;
      }

      current.push(f);

      const limit = w === "half" ? 2 : 3;
      if (current.length >= limit) flush();
    });

    flush();
    return lines;
  }, [filteredFields]);

  return (
    <BaseStageComponentCard
      title={cfg.title}
      subtitle={cfg.subtitle}
      icon={<DescriptionIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        <Chip
          label={`${stats.filled}/${stats.total}`}
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
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        {cfg.showSearch ? (
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            fullWidth
            disabled={locked}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
        ) : (
          <Box />
        )}

        {cfg.builderMode ? (
          <Button
            onClick={() => setBuilderOpen(true)}
            variant="outlined"
            disabled={locked}
            startIcon={<TuneIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#E4E6EB",
              color: "#212121",
              fontWeight: 900,
              "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
              "&:disabled": { color: "#8A8D91", borderColor: "#E4E6EB" },
            }}
          >
            Criar perguntas
          </Button>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {grouped.map((line, idx) => {
          const w = line[0]?.width || "full";

          // ✅ Se a linha estiver “incompleta”, vira 100% e elimina buraco branco
          const isIncompleteHalf = w === "half" && line.length < 2;
          const isIncompleteThird = w === "third" && line.length < 3;

          const tpl =
            w === "full" || isIncompleteHalf || isIncompleteThird
              ? { xs: "1fr", md: "1fr" }
              : fieldToGridSpan(w);

          return (
            <Box
              key={`line_${idx}`}
              sx={{
                display: "grid",
                gridTemplateColumns: tpl,
                gap: 2,
                alignItems: "start",
              }}
            >
              {line.map((f) => (
                <Box key={f.id} sx={{ width: "100%" }}>
                  {renderField(f)}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          {Object.values(errors).some(Boolean) ? (
            <>
              <ErrorOutlineIcon sx={{ color: "#B91C1C" }} />
              <Typography sx={{ fontWeight: 900, color: "#B91C1C" }}>
                Existem campos obrigatórios pendentes.
              </Typography>
            </>
          ) : (
            <>
              <CheckCircleIcon sx={{ color: "#16A34A" }} />
              <Typography sx={{ fontWeight: 900, color: "#16A34A" }}>
                Pronto para salvar.
              </Typography>
            </>
          )}
        </Box>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={locked || !cfg.canSave}
          startIcon={<SaveIcon />}
          sx={{
            bgcolor: "#1877F2",
            "&:hover": { bgcolor: "#166FE5" },
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            boxShadow: "none",
            "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
          }}
        >
          Salvar
        </Button>
      </Box>

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
            Este formulário está em modo somente leitura.
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

      <SimpleBuilderDialog
        open={builderOpen}
        locked={locked}
        initialFields={fields}
        onClose={() => setBuilderOpen(false)}
        onApply={(nextFields) => {
          setFields(nextFields);

          setValues((prev) => {
            const next = { ...prev };
            nextFields.forEach((f) => {
              if (typeof next[f.name] === "undefined") {
                next[f.name] = f.type === "multiselect" ? [] : "";
              }
            });
            return next;
          });

          onEvent?.("form:fields:update", {
            componentKey: component.key,
            fields: nextFields,
          });
        }}
      />
    </BaseStageComponentCard>
  );
};
