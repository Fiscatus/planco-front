import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type FieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio";

type Option = { value: string; label: string };

type FormFieldModel = {
  id: string; // unique key
  label: string;
  type: FieldType;

  name: string; // key no objeto values
  placeholder?: string;
  helperText?: string;

  required?: boolean;
  disabled?: boolean;

  options?: Option[]; // select/multiselect/radio
  min?: number;
  max?: number;

  // layout
  width?: "full" | "half" | "third";
};

type FormConfig = {
  title?: string;
  subtitle?: string;

  // Fields / values
  fields?: FormFieldModel[];
  values?: Record<string, unknown>;

  // behavior
  canSave?: boolean; // default true
  showSearch?: boolean; // default false
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

function normalizeOptions(raw: unknown): Option[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => {
      const obj = (o ?? {}) as Record<string, unknown>;
      const value = safeString(obj.value);
      const label = safeString(obj.label);
      if (!value || !label) return null;
      return { value, label } as Option;
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
  const allowed: FieldType[] = ["text", "number", "date", "textarea", "select", "multiselect", "radio"];
  if (!label || !name) return null;
  if (!allowed.includes(type)) return null;

  const widthRaw = safeString(obj.width) as FormFieldModel["width"];
  const width: FormFieldModel["width"] = widthRaw === "half" || widthRaw === "third" ? widthRaw : "full";

  const field: FormFieldModel = {
    id,
    label,
    name,
    type,
    placeholder: safeString(obj.placeholder) || undefined,
    helperText: safeString(obj.helperText) || undefined,
    required: Boolean(obj.required),
    disabled: Boolean(obj.disabled),
    options: normalizeOptions(obj.options),
    min: typeof obj.min === "number" ? obj.min : undefined,
    max: typeof obj.max === "number" ? obj.max : undefined,
    width,
  };

  // opções obrigatórias para select/multiselect/radio
  if ((type === "select" || type === "multiselect" || type === "radio") && (!field.options || field.options.length === 0)) {
    // ainda retorna, mas render vai mostrar vazio (não quebra)
  }

  return field;
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
  if (type === "multiselect") {
    return Array.isArray(value) && value.length > 0;
  }
  const s = safeString(value);
  return Boolean(s);
}

function fieldToGridSpan(width: FormFieldModel["width"]) {
  if (width === "third") return { xs: "1fr", md: "1fr 1fr 1fr" };
  if (width === "half") return { xs: "1fr", md: "1fr 1fr" };
  return { xs: "1fr", md: "1fr" };
}

/* -------------------------------------------------------------------------- */
/* Mocks (preview)                                                            */
/* -------------------------------------------------------------------------- */

const MOCK_FIELDS: FormFieldModel[] = [
  { id: "f1", name: "objeto", label: "Objeto", type: "text", required: true, width: "full", placeholder: "Descreva o objeto..." },
  { id: "f2", name: "modalidade", label: "Modalidade", type: "select", required: true, width: "half", options: [
    { value: "pregao", label: "Pregão" },
    { value: "concorrencia", label: "Concorrência" },
    { value: "dispensa", label: "Dispensa" },
  ]},
  { id: "f3", name: "prazo", label: "Prazo (dias)", type: "number", required: false, width: "half", min: 0, placeholder: "0" },
  { id: "f4", name: "data_base", label: "Data base", type: "date", required: false, width: "half" },
  { id: "f5", name: "criterio", label: "Critério de julgamento", type: "radio", required: true, width: "half", options: [
    { value: "menor_preco", label: "Menor preço" },
    { value: "tecnica_preco", label: "Técnica e preço" },
  ]},
  { id: "f6", name: "categorias", label: "Categorias", type: "multiselect", required: false, width: "full", options: [
    { value: "medicamentos", label: "Medicamentos" },
    { value: "insumos", label: "Insumos" },
    { value: "servicos", label: "Serviços" },
  ]},
  { id: "f7", name: "observacoes", label: "Observações", type: "textarea", required: false, width: "full", placeholder: "Escreva observações..." },
];

const MOCK_VALUES: Record<string, unknown> = {
  objeto: "",
  modalidade: "",
  prazo: "",
  data_base: "",
  criterio: "",
  categorias: [],
  observacoes: "",
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

    return {
      title: safeString(config.title) || (component.label || "Formulário"),
      subtitle: safeString(config.subtitle) || (component.description || "Preencha os campos desta etapa"),
      fields: fields.length ? fields : MOCK_FIELDS,
      values: Object.keys(values).length ? values : MOCK_VALUES,
      canSave,
      showSearch,
    };
  }, [component.config, component.label, component.description]);

  const locked = isReadOnly || stageCompleted;

  const [values, setValues] = useState<Record<string, unknown>>(cfg.values);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [query, setQuery] = useState("");

  const filteredFields = useMemo(() => {
    if (!cfg.showSearch) return cfg.fields;
    const q = safeString(query).toLowerCase();
    if (!q) return cfg.fields;
    return cfg.fields.filter((f) => {
      return (
        f.label.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        safeString(values[f.name]).toLowerCase().includes(q)
      );
    });
  }, [cfg.fields, cfg.showSearch, query, values]);

  const stats = useMemo(() => {
    const total = cfg.fields.length;
    const filled = cfg.fields.reduce((acc, f) => acc + (isFilled(f.type, values[f.name]) ? 1 : 0), 0);
    return { total, filled };
  }, [cfg.fields, values]);

  const validate = (): boolean => {
    const next: FieldErrorMap = {};

    cfg.fields.forEach((f) => {
      if (!f.required) return;

      const ok = isFilled(f.type, values[f.name]);
      if (!ok) next[f.name] = "Campo obrigatório";
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
    setValues((prev) => {
      const next = { ...prev, [name]: val };
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

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
    });
  };

  const renderField = (f: FormFieldModel) => {
    const disabled = locked || Boolean(f.disabled);
    const err = errors[f.name];

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
        />
      );
    }

    if (f.type === "number") {
      const v = safeString(values[f.name]);
      return (
        <TextField
          fullWidth
          label={f.required ? `${f.label} *` : f.label}
          value={v}
          onChange={(e) => {
            const next = e.target.value;
            // mantém string para não quebrar UX; backend normaliza depois
            setFieldValue(f.name, next);
          }}
          disabled={disabled}
          placeholder={f.placeholder}
          helperText={err || f.helperText}
          error={Boolean(err)}
          inputProps={{
            inputMode: "numeric",
            min: f.min,
            max: f.max,
          }}
        />
      );
    }

    if (f.type === "date") {
      // padrão: yyyy-mm-dd no input
      const v = safeString(values[f.name]);
      return (
        <TextField
          fullWidth
          type="date"
          label={f.required ? `${f.label} *` : f.label}
          value={v}
          onChange={(e) => setFieldValue(f.name, e.target.value)}
          disabled={disabled}
          helperText={err || f.helperText}
          error={Boolean(err)}
          InputLabelProps={{ shrink: true }}
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
        />
      );
    }

    if (f.type === "select") {
      const v = safeString(values[f.name]);
      return (
        <TextField
          select
          fullWidth
          label={f.required ? `${f.label} *` : f.label}
          value={v}
          onChange={(e) => setFieldValue(f.name, e.target.value)}
          disabled={disabled}
          helperText={err || f.helperText}
          error={Boolean(err)}
        >
          <MenuItem value="">
            <em>{f.placeholder || "Selecione"}</em>
          </MenuItem>
          {(f.options || []).map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (f.type === "multiselect") {
      const current = Array.isArray(values[f.name]) ? (values[f.name] as unknown[]) : [];
      const selected = current.map((x) => safeString(x)).filter(Boolean);

      return (
        <Box sx={{ border: "1px solid #E4E6EB", borderRadius: 2, p: 1.5, bgcolor: disabled ? "#F8FAFC" : "#fff" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "0.9rem" }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>
          {f.helperText ? (
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.25 }}>
              {f.helperText}
            </Typography>
          ) : null}

          {err ? (
            <Typography variant="body2" sx={{ color: "#B91C1C", fontWeight: 900, mt: 0.5 }}>
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

    if (f.type === "radio") {
      const v = safeString(values[f.name]);

      return (
        <FormControl
          disabled={disabled}
          error={Boolean(err)}
          sx={{
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            p: 1.5,
            bgcolor: disabled ? "#F8FAFC" : "#fff",
          }}
        >
          <FormLabel sx={{ fontWeight: 900, color: "#0f172a" }}>
            {f.required ? `${f.label} *` : f.label}
          </FormLabel>

          <RadioGroup
            value={v}
            onChange={(e) => setFieldValue(f.name, e.target.value)}
            sx={{ mt: 0.75 }}
          >
            {(f.options || []).map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={
                  <Typography sx={{ fontWeight: 800, color: "#334155" }}>
                    {opt.label}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>

          {err ? (
            <Typography variant="body2" sx={{ color: "#B91C1C", fontWeight: 900, mt: 0.5 }}>
              {err}
            </Typography>
          ) : null}
        </FormControl>
      );
    }

    // fallback (não deveria acontecer)
    return (
      <TextField
        fullWidth
        label={f.label}
        value={safeString(values[f.name])}
        onChange={(e) => setFieldValue(f.name, e.target.value)}
        disabled
        helperText="Tipo de campo não suportado"
      />
    );
  };

  // grid layout simples: respeita widths, mas sem complexidade (padrão MUI)
  const grouped = useMemo(() => {
    // agrupamento por "linhas": full ocupa a linha toda; half/two por linha; third/three por linha
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

      // se mudou o modo, fecha a linha
      if (mode !== w) {
        flush();
        mode = w;
      }

      current.push(f);

      const limit = w === "half" ? 2 : 3;
      if (current.length >= limit) {
        flush();
      }
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
      {cfg.showSearch ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar campo..."
            fullWidth
            disabled={locked}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      ) : null}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {grouped.map((line, idx) => {
          const w = line[0]?.width || "full";
          const tpl = fieldToGridSpan(w);

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
                <Box key={f.id}>{renderField(f)}</Box>
              ))}
            </Box>
          );
        })}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        <Box sx={{ mt: 2, border: "1px solid #E4E6EB", borderRadius: 2, bgcolor: "#FAFBFC", p: 2 }}>
          <Typography sx={{ fontWeight: 900, color: "#475569" }}>
            Este formulário está em modo somente leitura.
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.5 }}>
            {stageCompleted ? "A etapa foi concluída e foi bloqueada." : "Você não tem permissão para editar agora."}
          </Typography>
        </Box>
      ) : null}
    </BaseStageComponentCard>
  );
};
