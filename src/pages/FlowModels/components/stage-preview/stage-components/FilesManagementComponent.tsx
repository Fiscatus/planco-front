import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Folder as FolderIcon,
  UploadFile as UploadFileIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Article as ArticleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import type { StageComponentRuntimeProps } from "../componentRegistry";
import { BaseStageComponentCard } from "./BaseStageComponentCard";

/* =========================
 * Types
 * ========================= */

type FileItem = {
  id: string;
  name: string;
  sizeBytes?: number;
  mimeType?: string;
  category?: string;
  createdAt?: string; // ISO
  version?: number;
  createdBy?: string;

  /**
   * URL (S3 presigned) pronto pra abrir em nova guia.
   * (backend depois ajusta; front já preparado)
   */
  url?: string;
};

/* =========================
 * Helpers
 * ========================= */

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

function safeArrayOfStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => safeString(x)).filter(Boolean);
}

function formatBytes(n?: number) {
  if (!n || !Number.isFinite(n)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = n;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function formatDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExt(name: string) {
  const n = safeString(name).toLowerCase();
  const dot = n.lastIndexOf(".");
  if (dot <= 0) return "";
  return n.slice(dot + 1);
}

function acceptToLabel(accept: string) {
  const a = safeString(accept).toLowerCase();
  const parts: string[] = [];
  if (a.includes("application/pdf")) parts.push("PDF");
  if (a.includes("application/msword") || a.includes("word") || a.includes(".doc"))
    parts.push("Word");
  if (
    a.includes("excel") ||
    a.includes("spreadsheet") ||
    a.includes(".xls") ||
    a.includes(".xlsx") ||
    a.includes(".csv")
  )
    parts.push("Excel");
  if (a.includes("image")) parts.push("Imagens");
  if (!parts.length) return "Arquivos";
  return parts.join(" • ");
}

function fileIconFor(file: FileItem) {
  const ext = getExt(file.name);
  const mime = safeString(file.mimeType).toLowerCase();

  const isPdf = ext === "pdf" || mime.includes("pdf");
  const isWord =
    ["doc", "docx"].includes(ext) ||
    mime.includes("msword") ||
    mime.includes("officedocument.wordprocessingml");
  const isExcel =
    ["xls", "xlsx", "csv"].includes(ext) ||
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    mime.includes("csv");
  const isImage =
    mime.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext);

  if (isPdf)
    return { Icon: ArticleIcon, bg: "#FEF2F2", fg: "#B91C1C", label: "PDF" };
  if (isWord)
    return { Icon: DescriptionIcon, bg: "#EFF6FF", fg: "#1D4ED8", label: "Word" };
  if (isExcel)
    return { Icon: TableChartIcon, bg: "#ECFDF3", fg: "#065F46", label: "Excel" };
  if (isImage)
    return { Icon: ImageIcon, bg: "#F5F3FF", fg: "#6D28D9", label: "Imagem" };

  return {
    Icon: InsertDriveFileIcon,
    bg: "#F1F5F9",
    fg: "#334155",
    label: ext ? ext.toUpperCase() : "ARQ",
  };
}

function normalizeQuery(q: string) {
  return safeString(q).toLowerCase();
}

/* =========================
 * Component
 * ========================= */

export const FilesManagementComponent = ({
  component,
  isReadOnly,
  stageCompleted,
  onEvent,
}: StageComponentRuntimeProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const cfg = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;

    const categories = safeArrayOfStrings(raw.categories);

    const maxFiles =
      typeof raw.maxFiles === "number" &&
      Number.isFinite(raw.maxFiles) &&
      raw.maxFiles > 0
        ? Math.floor(raw.maxFiles)
        : 20;

    const maxSizeMB =
      typeof raw.maxSizeMB === "number" &&
      Number.isFinite(raw.maxSizeMB) &&
      raw.maxSizeMB > 0
        ? raw.maxSizeMB
        : 25;

    const accept =
      safeString(raw.accept) ||
      "application/pdf,.doc,.docx,.xls,.xlsx,.csv,image/*";

    const multiple = raw.multiple === false ? false : true;
    const showVersions = raw.showVersions === true;
    const requiredCategories = raw.requiredCategories === true;

    return {
      categories,
      maxFiles,
      maxSizeMB,
      accept,
      multiple,
      showVersions,
      requiredCategories,
    };
  }, [component.config]);

  const locked = isReadOnly || stageCompleted;

  const initialFiles = useMemo(() => {
    const raw = (component.config ?? {}) as Record<string, unknown>;
    const files = raw.files as unknown;

    if (!Array.isArray(files)) return [] as FileItem[];

    return files
      .map((f) => {
        const obj = (f ?? {}) as Record<string, unknown>;
        const id = safeString(obj.id) || safeString(obj._id) || "";
        const name = safeString(obj.name);
        if (!id || !name) return null;

        return {
          id,
          name,
          sizeBytes:
            typeof obj.sizeBytes === "number" && Number.isFinite(obj.sizeBytes)
              ? obj.sizeBytes
              : undefined,
          mimeType: safeString(obj.mimeType) || undefined,
          category: safeString(obj.category) || undefined,
          createdAt: safeString(obj.createdAt) || undefined,
          version:
            typeof obj.version === "number" && Number.isFinite(obj.version)
              ? obj.version
              : undefined,
          createdBy: safeString(obj.createdBy) || undefined,
          url:
            safeString(obj.url) ||
            safeString(obj.pdfUrl) ||
            safeString(obj.downloadUrl) ||
            undefined,
        } as FileItem;
      })
      .filter(Boolean) as FileItem[];
  }, [component.config]);

  const [localFiles, setLocalFiles] = useState<FileItem[]>(initialFiles);
  useEffect(() => setLocalFiles(initialFiles), [initialFiles]);

  // ✅ Google Drive feel
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<
    "recent_desc" | "recent_asc" | "size_desc" | "size_asc" | "az" | "za"
  >("recent_desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm remove (em massa ou unitário)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"single" | "bulk">("single");
  const [confirmSingleId, setConfirmSingleId] = useState<string | null>(null);

  const canAddMore = localFiles.length < cfg.maxFiles;

  const emitList = useCallback(
    (files: FileItem[]) => {
      onEvent?.("files:setList", {
        componentKey: component.key,
        files: files.map((f) => ({
          id: f.id,
          name: f.name,
          sizeBytes: f.sizeBytes,
          mimeType: f.mimeType,
          category: f.category,
          createdAt: f.createdAt,
          version: f.version,
          createdBy: f.createdBy,
          url: f.url,
        })),
      });
    },
    [component.key, onEvent],
  );

  const openFilePicker = useCallback(() => {
    if (locked) return;
    if (!canAddMore) return;
    inputRef.current?.click();
  }, [locked, canAddMore]);

  const handlePickedFiles = useCallback(
    (picked: File[]) => {
      if (locked) return;

      const maxBytes = cfg.maxSizeMB * 1024 * 1024;

      const filtered = picked
        .slice(0, cfg.multiple ? picked.length : 1)
        .filter((f) => {
          if (!f.name) return false;
          if (f.size && f.size > maxBytes) return false;
          return true;
        });

      if (!filtered.length) return;

      const remaining = cfg.maxFiles - localFiles.length;
      const slice = filtered.slice(0, remaining);

      const nowIso = new Date().toISOString();
      const newItems: FileItem[] = slice.map((f) => ({
        id: `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: f.name,
        sizeBytes: f.size,
        mimeType: f.type,
        category: cfg.categories[0] || undefined,
        createdAt: nowIso,
        version: cfg.showVersions ? 1 : undefined,
        createdBy: "Você",
        url: undefined,
      }));

      setLocalFiles((prev) => {
        const next = [...prev, ...newItems];
        emitList(next);
        return next;
      });

      onEvent?.("files:add", {
        componentKey: component.key,
        files: slice.map((f) => ({
          name: f.name,
          sizeBytes: f.size,
          mimeType: f.type,
        })),
      });
    },
    [
      locked,
      cfg.maxSizeMB,
      cfg.multiple,
      cfg.maxFiles,
      cfg.categories,
      cfg.showVersions,
      localFiles.length,
      emitList,
      onEvent,
      component.key,
    ],
  );

  const handleFilesSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list || list.length === 0) {
        e.target.value = "";
        return;
      }
      handlePickedFiles(Array.from(list));
      e.target.value = "";
    },
    [handlePickedFiles],
  );

  // ✅ Filtro + ordenação (Drive-like)
  const visibleFiles = useMemo(() => {
    const q = normalizeQuery(query);

    const arr = localFiles.filter((f) => {
      if (!q) return true;
      const hay = `${f.name} ${safeString(f.createdBy)} ${formatDateTime(
        f.createdAt,
      )} ${safeString(f.category)}`.toLowerCase();
      return hay.includes(q);
    });

    const timeOf = (x: FileItem) => {
      const t = x.createdAt ? new Date(x.createdAt).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };

    const sizeOf = (x: FileItem) => {
      const s =
        typeof x.sizeBytes === "number" && Number.isFinite(x.sizeBytes)
          ? x.sizeBytes
          : 0;
      return s;
    };

    const nameOf = (x: FileItem) => safeString(x.name).toLowerCase();

    arr.sort((a, b) => {
      if (sortMode === "recent_desc")
        return timeOf(b) - timeOf(a) || nameOf(a).localeCompare(nameOf(b));
      if (sortMode === "recent_asc")
        return timeOf(a) - timeOf(b) || nameOf(a).localeCompare(nameOf(b));
      if (sortMode === "size_desc")
        return sizeOf(b) - sizeOf(a) || nameOf(a).localeCompare(nameOf(b));
      if (sortMode === "size_asc")
        return sizeOf(a) - sizeOf(b) || nameOf(a).localeCompare(nameOf(b));
      if (sortMode === "az") return nameOf(a).localeCompare(nameOf(b), "pt-BR");
      if (sortMode === "za") return nameOf(b).localeCompare(nameOf(a), "pt-BR");
      return 0;
    });

    return arr;
  }, [localFiles, query, sortMode]);

  // ✅ Seleção estilo Drive (usa visibleFiles)
  const allIdsInView = useMemo(() => visibleFiles.map((x) => x.id), [visibleFiles]);
  const selectedCount = selectedIds.size;

  const isAllSelected = useMemo(() => {
    if (allIdsInView.length === 0) return false;
    return allIdsInView.every((id) => selectedIds.has(id));
  }, [allIdsInView, selectedIds]);

  const isIndeterminate = useMemo(() => {
    if (allIdsInView.length === 0) return false;
    const any = allIdsInView.some((id) => selectedIds.has(id));
    return any && !isAllSelected;
  }, [allIdsInView, selectedIds, isAllSelected]);

  const toggleSelect = useCallback((fileId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }, []);

  const toggleSelectAllInView = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allIdsInView.length === 0) return next;

      const allSelected = allIdsInView.every((id) => next.has(id));
      if (allSelected) {
        allIdsInView.forEach((id) => next.delete(id));
        return next;
      }

      allIdsInView.forEach((id) => next.add(id));
      return next;
    });
  }, [allIdsInView]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const requestRemoveSingle = useCallback((fileId: string) => {
    setConfirmMode("single");
    setConfirmSingleId(fileId);
    setConfirmOpen(true);
  }, []);

  const requestRemoveBulk = useCallback(() => {
    if (selectedIds.size === 0) return;
    setConfirmMode("bulk");
    setConfirmSingleId(null);
    setConfirmOpen(true);
  }, [selectedIds.size]);

  const confirmRemove = useCallback(() => {
    setConfirmOpen(false);

    if (confirmMode === "single" && confirmSingleId) {
      const id = confirmSingleId;

      setLocalFiles((prev) => {
        const next = prev.filter((x) => x.id !== id);
        emitList(next);
        return next;
      });

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      onEvent?.("files:remove", { componentKey: component.key, fileId: id });
      setConfirmSingleId(null);
      return;
    }

    if (confirmMode === "bulk") {
      const ids = Array.from(selectedIds);

      setLocalFiles((prev) => {
        const next = prev.filter((x) => !selectedIds.has(x.id));
        emitList(next);
        return next;
      });

      clearSelection();

      onEvent?.("files:removeMany", {
        componentKey: component.key,
        fileIds: ids,
      });
    }
  }, [
    confirmMode,
    confirmSingleId,
    selectedIds,
    emitList,
    onEvent,
    component.key,
    clearSelection,
  ]);

  // ✅ VER: (front pronto) – você ajusta com seu dev depois
  const handleOpenInNewTab = useCallback(
    (fileId: string) => {
      const f = localFiles.find((x) => x.id === fileId);
      const url = safeString(f?.url);

      onEvent?.("files:select", { componentKey: component.key, fileId });

      if (!url) {
        onEvent?.("files:pdf:openInNewTab", {
          componentKey: component.key,
          fileId,
          url: "",
        });
        onEvent?.("files:download", { componentKey: component.key, fileId });
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      onEvent?.("files:pdf:openInNewTab", { componentKey: component.key, fileId, url });
    },
    [localFiles, onEvent, component.key],
  );

  const handleDownload = useCallback(
    (fileId: string) => {
      onEvent?.("files:download", { componentKey: component.key, fileId });
    },
    [onEvent, component.key],
  );

  const handleDownloadSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    onEvent?.("files:downloadMany", {
      componentKey: component.key,
      fileIds: ids,
    });
  }, [selectedIds, onEvent, component.key]);

  const handleChangeCategory = useCallback(
    (fileId: string, category: string) => {
      if (locked) return;

      setLocalFiles((prev) => {
        const next = prev.map((x) => (x.id === fileId ? { ...x, category } : x));
        emitList(next);
        return next;
      });

      onEvent?.("files:update", {
        componentKey: component.key,
        fileId,
        patch: { category },
      });
    },
    [locked, emitList, onEvent, component.key],
  );

  return (
    <BaseStageComponentCard
      title={component.label || "Gerenciar Arquivos"}
      subtitle={component.description || "Anexe os documentos desta etapa"}
      icon={<FolderIcon sx={{ fontSize: 18 }} />}
      required={component.required}
      lockedAfterCompletion={component.lockedAfterCompletion}
      isReadOnly={isReadOnly}
      rightSlot={
        <Chip
          icon={<LabelIcon sx={{ fontSize: 16 }} />}
          label={`${localFiles.length}/${cfg.maxFiles}`}
          size="small"
          sx={{
            bgcolor: "#E7F3FF",
            color: "#1877F2",
            fontWeight: 900,
            fontSize: "0.75rem",
            height: 24,
            "& .MuiChip-icon": { ml: 0.5, color: "#1877F2" },
          }}
        />
      }
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={cfg.multiple}
        accept={cfg.accept}
        onChange={handleFilesSelected}
      />

      {/* =========================
       * DRIVE-LIKE TOP AREA
       * ========================= */}

      {/* 1) Header do módulo (limpo) */}
      <Box
        sx={{
          border: "1px solid #EEF2F7",
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 2,
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexWrap: { xs: "wrap", sm: "nowrap" },
            borderBottom: "1px solid #EEF2F7",
            background: "linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950, color: "#0f172a", fontSize: "1.05rem" }}>
              Anexos desta etapa
            </Typography>


            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25 }}>
              <Chip
                label={`Limite: ${cfg.maxFiles}`}
                size="small"
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#334155",
                  fontWeight: 900,
                  height: 24,
                }}
              />
              <Chip
                label={`Máx.: ${cfg.maxSizeMB}MB`}
                size="small"
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#334155",
                  fontWeight: 900,
                  height: 24,
                }}
              />
              <Chip
                label={acceptToLabel(cfg.accept)}
                size="small"
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1D4ED8",
                  fontWeight: 900,
                  height: 24,
                }}
              />
              {cfg.showVersions ? (
                <Chip
                  label="Versões"
                  size="small"
                  sx={{
                    bgcolor: "#FFF7ED",
                    color: "#9A3412",
                    fontWeight: 900,
                    height: 24,
                  }}
                />
              ) : null}
              {stageCompleted ? (
                <Chip
                  label="Etapa concluída"
                  size="small"
                  sx={{
                    bgcolor: "#ECFDF3",
                    color: "#065F46",
                    fontWeight: 900,
                    height: 24,
                  }}
                />
              ) : null}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
            }}
          >
            <Chip
              icon={<LabelIcon sx={{ fontSize: 16 }} />}
              label={`${localFiles.length}/${cfg.maxFiles}`}
              size="small"
              sx={{
                bgcolor: "#E7F3FF",
                color: "#1877F2",
                fontWeight: 950,
                height: 28,
                "& .MuiChip-icon": { ml: 0.5, color: "#1877F2" },
              }}
            />

            <Button
              onClick={openFilePicker}
              variant="contained"
              startIcon={<UploadFileIcon />}
              disabled={locked || !canAddMore}
              sx={{
                bgcolor: "#1877F2",
                "&:hover": { bgcolor: "#166FE5" },
                textTransform: "none",
                fontWeight: 950,
                borderRadius: 999,
                boxShadow: "none",
                px: 2.75,
                height: 42,
                minWidth: { xs: 190, sm: 200 },
                "&:disabled": { bgcolor: "#E4E6EB", color: "#8A8D91" },
              }}
            >
              Adicionar arquivo
            </Button>
          </Box>
        </Box>

        {/* 2) Toolbar do sistema (busca sempre à esquerda + ordenar à direita) */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 1.25,
            flexWrap: "wrap",
          }}
        >
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar arquivos..."
            size="small"
            sx={{
              flex: 1,
              minWidth: { xs: "100%", md: 420 },
              "& .MuiInputBase-root": {
                height: 42,
                borderRadius: 999,
                bgcolor: "#F8FAFC",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            value={sortMode}
            size="small"
            onChange={(e) =>
              setSortMode(
                e.target.value as
                  | "recent_desc"
                  | "recent_asc"
                  | "size_desc"
                  | "size_asc"
                  | "az"
                  | "za",
              )
            }
            sx={{
              minWidth: { xs: "100%", sm: 240 },
              "& .MuiInputBase-root": { height: 42, borderRadius: 2 },
            }}
          >
            <MenuItem value="recent_desc">Mais recentes</MenuItem>
            <MenuItem value="recent_asc">Mais antigos</MenuItem>
            <MenuItem value="size_desc">Maior tamanho</MenuItem>
            <MenuItem value="size_asc">Menor tamanho</MenuItem>
            <MenuItem value="az">A → Z</MenuItem>
            <MenuItem value="za">Z → A</MenuItem>
          </TextField>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }} />

      {/* 3) Barra de seleção/ações (fica embaixo, como Drive) */}
      {selectedCount > 0 ? (
        <Box
          sx={{
            border: "1px solid #EEF2F7",
            borderRadius: 2,
            bgcolor: "#E7F3FF",
            px: { xs: 2, sm: 2.5 },
            py: 1.25,
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 1.25,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontWeight: 950, color: "#0f172a" }}>
            {selectedCount} selecionado(s)
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              onClick={handleDownloadSelected}
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                height: 40,
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#BFDBFE",
                color: "#0f172a",
                fontWeight: 950,
                bgcolor: "#FFFFFF",
                "&:hover": { borderColor: "#93C5FD", bgcolor: "#FFFFFF" },
              }}
            >
              Baixar
            </Button>

            {!locked ? (
              <Button
                onClick={requestRemoveBulk}
                variant="outlined"
                startIcon={<DeleteIcon />}
                sx={{
                  height: 40,
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "#FECACA",
                  color: "#B91C1C",
                  fontWeight: 950,
                  bgcolor: "#FFFFFF",
                  "&:hover": { borderColor: "#FCA5A5", bgcolor: "#FFFFFF" },
                }}
              >
                Remover
              </Button>
            ) : null}

            <Button
              onClick={clearSelection}
              variant="text"
              sx={{
                height: 40,
                textTransform: "none",
                fontWeight: 950,
                color: "#475569",
              }}
            >
              Limpar
            </Button>
          </Box>
        </Box>
      ) : null}

      <Box sx={{ mt: 1.5 }} />

      {/* =========================
       * LIST
       * ========================= */}

      {visibleFiles.length === 0 ? (
        <Box
          sx={{
            border: "1px solid #EEF2F7",
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            p: 2.5,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: "#F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 1.25,
            }}
          >
            <FolderIcon sx={{ color: "#64748b" }} />
          </Box>

          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
            {localFiles.length === 0 ? "Nenhum arquivo anexado" : "Nenhum resultado"}
          </Typography>

          <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700, mt: 0.5 }}>
            {localFiles.length === 0
              ? locked
                ? "Este componente está em modo somente leitura."
                : "Clique em “Adicionar arquivo” para anexar documentos."
              : "Tente ajustar sua busca."}
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* Cabeçalho estilo tabela (Drive) */}
          <Box
            sx={{
              border: "1px solid #EEF2F7",
              borderBottom: "none",
              borderRadius: "16px 16px 0 0",
              bgcolor: "#FAFBFC",
              px: 1.25,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={toggleSelectAllInView}
              sx={{ "&.Mui-checked": { color: "#1877F2" } }}
            />

            <Typography sx={{ fontWeight: 900, color: "#475569", flex: 1 }}>
              Nome
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                color: "#475569",
                width: 120,
                textAlign: "right",
                display: { xs: "none", md: "block" },
              }}
            >
              Tamanho
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                color: "#475569",
                width: 180,
                textAlign: "right",
                display: { xs: "none", md: "block" },
              }}
            >
              Data
            </Typography>

            <Box sx={{ width: 120, flexShrink: 0 }} />
          </Box>

          <Box
            sx={{
              border: "1px solid #EEF2F7",
              borderRadius: "0 0 16px 16px",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            {visibleFiles.map((f, idx) => (
              <React.Fragment key={f.id}>
                <MemoFileRow
                  file={f}
                  locked={locked}
                  showVersions={cfg.showVersions}
                  categories={cfg.categories}
                  isSelected={selectedIds.has(f.id)}
                  onToggleSelect={toggleSelect}
                  onOpenInNewTab={handleOpenInNewTab}
                  onDownload={handleDownload}
                  onRequestRemove={requestRemoveSingle}
                  onChangeCategory={handleChangeCategory}
                />
                {idx < visibleFiles.length - 1 ? (
                  <Divider sx={{ borderColor: "#EEF2F7" }} />
                ) : null}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}

      {/* Confirm remove dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a" }}>
          Remover arquivo{confirmMode === "bulk" ? "s" : ""}?
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography sx={{ color: "#475569", fontWeight: 700 }}>
            {confirmMode === "bulk"
              ? `Você está prestes a remover ${selectedCount} arquivo(s) desta etapa.`
              : "Esta ação remove o arquivo da lista desta etapa."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1.25 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#E4E6EB",
              color: "#0f172a",
              fontWeight: 900,
              "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#fff" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmRemove}
            variant="contained"
            sx={{
              bgcolor: "#F02849",
              "&:hover": { bgcolor: "#D61F3D" },
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </BaseStageComponentCard>
  );
};

/* =========================
 * Row
 * ========================= */

type FileRowProps = {
  file: FileItem;
  locked: boolean;
  showVersions: boolean;
  categories: string[];
  isSelected: boolean;
  onToggleSelect: (fileId: string) => void;
  onOpenInNewTab: (fileId: string) => void;
  onDownload: (fileId: string) => void;
  onRequestRemove: (fileId: string) => void;
  onChangeCategory: (fileId: string, category: string) => void;
};

const FileRow = ({
  file,
  locked,
  showVersions,
  categories,
  isSelected,
  onToggleSelect,
  onOpenInNewTab,
  onDownload,
  onRequestRemove,
  onChangeCategory,
}: FileRowProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const { Icon, bg, fg, label } = fileIconFor(file);

  const metaDate = formatDateTime(file.createdAt);
  const author = safeString(file.createdBy) || "—";

  const closeMenu = () => setAnchorEl(null);

  const categoryChip =
    categories.length > 0 ? (
      <Chip
        label={file.category || "Sem categoria"}
        size="small"
        sx={{
          bgcolor: file.category ? "#ECFDF3" : "#FEF3C7",
          color: file.category ? "#065F46" : "#92400E",
          fontWeight: 900,
          fontSize: "0.75rem",
          height: 22,
          cursor: locked ? "default" : "pointer",
        }}
        onClick={() => {
          if (locked) return;
          const idx = Math.max(0, categories.indexOf(file.category || ""));
          const next = categories[(idx + 1) % categories.length];
          onChangeCategory(file.id, next);
        }}
      />
    ) : null;

  return (
    <Box
      onClick={() => onToggleSelect(file.id)}
      role="row"
      sx={{
        px: 1.25,
        py: 1.1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        bgcolor: isSelected ? "#E7F3FF" : "#FFFFFF",
        cursor: "pointer",
        "&:hover": { bgcolor: isSelected ? "#DCEEFF" : "#F8FAFC" },
      }}
    >
      {/* Left */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
        <Checkbox
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          sx={{ "&.Mui-checked": { color: "#1877F2" } }}
        />

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: fg }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.15,
            }}
            title={file.name}
          >
            {file.name}
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5, alignItems: "center" }}>
            <Chip
              label={label}
              size="small"
              sx={{
                bgcolor: "#F1F5F9",
                color: "#334155",
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 22,
              }}
            />

            {file.sizeBytes ? (
              <Chip
                label={formatBytes(file.sizeBytes)}
                size="small"
                sx={{
                  bgcolor: "#F1F5F9",
                  color: "#334155",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
            ) : null}

            {showVersions && file.version ? (
              <Chip
                label={`v${file.version}`}
                size="small"
                sx={{
                  bgcolor: "#E7F3FF",
                  color: "#1877F2",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
            ) : null}

            {categoryChip}

            <Chip
              label={`${metaDate || "—"} • ${author}`}
              size="small"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #EEF2F7",
                color: "#475569",
                fontWeight: 900,
                fontSize: "0.75rem",
                height: 22,
              }}
            />
          </Box>
        </Box>

        {/* Colunas "tabela" à direita (desktop) */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, alignItems: "center" }}>
          <Typography
            sx={{
              width: 120,
              textAlign: "right",
              color: "#475569",
              fontWeight: 900,
              fontSize: "0.85rem",
            }}
            title={file.sizeBytes ? formatBytes(file.sizeBytes) : "—"}
          >
            {file.sizeBytes ? formatBytes(file.sizeBytes) : "—"}
          </Typography>

          <Typography
            sx={{
              width: 180,
              textAlign: "right",
              color: "#475569",
              fontWeight: 900,
              fontSize: "0.85rem",
            }}
            title={metaDate || "—"}
          >
            {metaDate || "—"}
          </Typography>
        </Box>
      </Box>

      {/* Right: actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, width: 120, justifyContent: "flex-end" }}>
        <Tooltip title="Ver (nova guia)">
          <span>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onOpenInNewTab(file.id);
              }}
              sx={{
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                bgcolor: "#fff",
                "&:hover": { borderColor: "#1877F2", bgcolor: "#F0F9FF" },
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ color: "#1877F2" }} />
            </IconButton>
          </span>
        </Tooltip>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          sx={{
            border: "1px solid #E4E6EB",
            borderRadius: 2,
            bgcolor: "#fff",
            "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
          }}
        >
          <MoreVertIcon fontSize="small" sx={{ color: "#64748b" }} />
        </IconButton>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu}>
          <MenuItem
            onClick={() => {
              closeMenu();
              onOpenInNewTab(file.id);
            }}
          >
            <VisibilityIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
            Ver em nova guia
          </MenuItem>

          <MenuItem
            onClick={() => {
              closeMenu();
              onDownload(file.id);
            }}
          >
            <DownloadIcon sx={{ mr: 1, fontSize: 20, color: "#1877F2" }} />
            Baixar
          </MenuItem>

          {!locked ? (
            <MenuItem
              onClick={() => {
                closeMenu();
                onRequestRemove(file.id);
              }}
            >
              <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#F02849" }} />
              Remover
            </MenuItem>
          ) : null}
        </Menu>
      </Box>
    </Box>
  );
};

const MemoFileRow = React.memo(FileRow);
