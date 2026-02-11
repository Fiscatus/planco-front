import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  Checkbox,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

type FieldType = "text" | "textarea" | "number" | "date" | "select" | "multiselect";
type FieldWidth = "full" | "half";

type FormField = {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  width: FieldWidth;
  required: boolean;
  options?: { label: string; value: string }[];
  value?: string | string[];
};

type FormComponentProps = {
  config?: {
    fields?: FormField[];
  };
  label?: string;
  description?: string;
};

const DEFAULT_FIELDS: FormField[] = [
  { id: "1", name: "projectName", label: "Nome do Projeto", type: "text", width: "full", required: true, value: "Projeto Exemplo" },
  { id: "2", name: "startDate", label: "Data de Início", type: "date", width: "half", required: true, value: "2025-01-15" },
  { id: "3", name: "endDate", label: "Data de Término", type: "date", width: "half", required: false, value: "2025-12-31" },
  { id: "4", name: "description", label: "Descrição do Projeto", type: "textarea", width: "full", required: false, value: "Este é um projeto de exemplo." },
];

export const FormComponent = ({ config, label, description }: FormComponentProps) => {
  const fields = config?.fields || DEFAULT_FIELDS;
  const [values, setValues] = useState<Record<string, unknown>>({});

  const stats = useMemo(() => {
    const total = fields.filter((f) => f.required).length;
    const filled = fields.filter((f) => f.required && f.value).length;
    return { total, filled };
  }, [fields]);

  const renderField = (f: FormField) => {
    const baseSx = {
      "& .MuiOutlinedInput-root": {
        bgcolor: "#F8FAFC",
        "& fieldset": { borderColor: "#E4E6EB" },
        borderRadius: 2,
      },
    };

    const dateSx = {
      ...baseSx,
      "& .MuiOutlinedInput-root": {
        ...baseSx["& .MuiOutlinedInput-root"],
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          cursor: "pointer",
          filter: "invert(47%) sepia(89%) saturate(2476%) hue-rotate(197deg) brightness(98%) contrast(97%)",
        },
      },
    };

    if (f.type === "textarea") {
      return (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>
          <TextField
            fullWidth
            value={values[f.name] || ""}
            onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))}
            multiline
            rows={4}
            placeholder="Campo de texto longo..."
            sx={baseSx}
          />
        </Box>
      );
    }

    if (f.type === "select") {
      return (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>
          <TextField
            fullWidth
            select
            value={values[f.name] || ""}
            onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))}
            sx={baseSx}
          >
            {(f.options || []).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      );
    }

    if (f.type === "date") {
      return (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>
          <TextField
            fullWidth
            type="date"
            value={values[f.name] || ""}
            onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{
              ...baseSx,
              "& .MuiOutlinedInput-root": {
                ...baseSx["& .MuiOutlinedInput-root"],
                "& input[type='date']::-webkit-calendar-picker-indicator": {
                  cursor: "pointer",
                  filter: "invert(47%) sepia(89%) saturate(2476%) hue-rotate(197deg) brightness(98%) contrast(97%)",
                  width: 20,
                  height: 20,
                },
                "& input[type='date']": {
                  fontWeight: 700,
                  color: "#0f172a",
                },
              },
            }}
          />
        </Box>
      );
    }

    if (f.type === "multiselect") {
      const selected = Array.isArray(values[f.name]) ? values[f.name] as string[] : [];
      return (
        <Box sx={{ width: "100%" }}>
          <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
            {f.required ? `${f.label} *` : f.label}
          </Typography>
          <Box
            sx={{
              width: "100%",
              border: "1px solid #E4E6EB",
              borderRadius: 2,
              p: 2,
              bgcolor: "#fff",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {(f.options || []).map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <Box
                    key={opt.value}
                    onClick={() => {
                      const next = checked
                        ? selected.filter(v => v !== opt.value)
                        : [...selected, opt.value];
                      setValues(prev => ({ ...prev, [f.name]: next }));
                    }}
                    sx={{
                      border: "1px solid #E4E6EB",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      bgcolor: checked ? "#E7F3FF" : "#fff",
                      "&:hover": { borderColor: "#1877F2", bgcolor: checked ? "#E7F3FF" : "#F5FAFF" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: "#334155" }}>
                      {opt.label}
                    </Typography>
                    <Checkbox checked={checked} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.5 }}>
          {f.required ? `${f.label} *` : f.label}
        </Typography>
        <TextField
          fullWidth
          type={f.type}
          value={values[f.name] || ""}
          onChange={(e) => setValues(prev => ({ ...prev, [f.name]: e.target.value }))}
          placeholder="Campo de texto..."
          sx={baseSx}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E4E6EB", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, bgcolor: "#FAFBFC", borderBottom: "1px solid #E4E6EB" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionIcon sx={{ fontSize: 20, color: "#1877F2" }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.125rem" }}>
              {label || "Formulário"}
            </Typography>
            {description && (
              <Tooltip title={description} arrow>
                <InfoIcon sx={{ fontSize: 18, color: "#1877F2", cursor: "help" }} />
              </Tooltip>
            )}
          </Box>
          {stats.total > 0 && false && (
            <Chip
              label={`${stats.filled}/${stats.total}`}
              size="small"
              sx={{
                bgcolor: "#E7F3FF",
                color: "#1877F2",
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ px: 3, py: 3 }}>
        {fields.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "#94a3b8", mb: 1 }}>Nenhum campo configurado</Typography>
            <Typography variant="body2" sx={{ color: "#CBD5E1" }}>Configure os campos do formulário nas opções do componente</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {fields.map((f) => (
              <Box key={f.id} sx={{ width: f.width === "half" ? "calc(50% - 8px)" : "100%" }}>
                {renderField(f)}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
