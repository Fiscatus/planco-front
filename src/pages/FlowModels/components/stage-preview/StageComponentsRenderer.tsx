// src/pages/FlowModels/components/stage-preview/StageComponentsRenderer.tsx

import { Box, Typography } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlowModelComponent } from "@/hooks/useFlowModels";
import { componentRegistry } from "./componentRegistry";

export type StageComponentsRendererProps = {
  components: FlowModelComponent[];

  /**
   * ✅ NOVO:
   * lista completa de componentes da etapa (mesmo que alguns não sejam renderizados),
   * útil para componentes como APPROVAL que precisam checar dependências (ex: FILES_MANAGMENT).
   *
   * - Se não for enviado, usamos `components` como fallback.
   */
  stageComponents?: FlowModelComponent[];

  userRoleIds?: string[];
  readOnly?: boolean;
  stageCompleted?: boolean;
  onEvent?: (eventType: string, payload?: Record<string, any>) => void;

  /**
   * ✅ NOVO:
   * id do anchor para highlight após scroll
   */
  highlightedAnchorId?: string | null;
};

function hasIntersection(a: string[] = [], b: string[] = []) {
  if (!a.length || !b.length) return false;
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

function supportsIntersectionObserver() {
  return typeof window !== "undefined" && "IntersectionObserver" in window;
}

function safeString(v: unknown) {
  return String(v ?? "").trim();
}

/**
 * Scroll helper:
 * - Usa o anchorId (id real no DOM)
 * - scrollIntoView rola o ancestral rolável mais próximo (modal OU página)
 */
function scrollToAnchor(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (!el) return false;

  // scrollMarginTop já está no anchor wrapper (12px).
  el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  return true;
}

export const StageComponentsRenderer = ({
  components,
  stageComponents,
  userRoleIds = [],
  readOnly = false,
  stageCompleted = false,
  onEvent,
  highlightedAnchorId = null,
}: StageComponentsRendererProps) => {
  const safeComponents = useMemo(() => {
    const arr = Array.isArray(components) ? components.slice() : [];
    return arr
      .map((c) => ({
        ...c,
        order: Number.isFinite(c.order) ? c.order : 0,
        visibilityRoles: Array.isArray(c.visibilityRoles) ? c.visibilityRoles : [],
        editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
        config: c.config ?? {},
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [components]);

  const safeStageComponents = useMemo(() => {
    const base = stageComponents ?? components;
    const arr = Array.isArray(base) ? base.slice() : [];
    return arr.map((c) => ({
      ...c,
      order: Number.isFinite(c.order) ? c.order : 0,
      visibilityRoles: Array.isArray(c.visibilityRoles) ? c.visibilityRoles : [],
      editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
      config: c.config ?? {},
    }));
  }, [stageComponents, components]);

  const visibleComponents = useMemo(() => {
    return safeComponents.filter((c) => {
      const visibility = c.visibilityRoles || [];
      if (!visibility.length) return true;
      return hasIntersection(visibility, userRoleIds);
    });
  }, [safeComponents, userRoleIds]);

  /**
   * 🎯 Active highlight (OpenAI-like)
   * - Ativo por "mais visível" no viewport (scroll)
   * - E também por foco (focus-within)
   */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeKey, setActiveKey] = useState<string>("");

  const setItemRef = (key: string) => (el: HTMLDivElement | null) => {
    itemRefs.current[key] = el;
  };

  useEffect(() => {
    if (!supportsIntersectionObserver()) return;
    if (!visibleComponents.length) return;

    const root = containerRef.current ?? undefined;
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;

        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const key = el?.dataset?.componentKey || "";
          if (!key) continue;

          ratios.set(key, entry.isIntersecting ? entry.intersectionRatio : 0);
          changed = true;
        }

        if (!changed) return;

        let bestKey = "";
        let bestRatio = 0;

        ratios.forEach((r, k) => {
          if (r > bestRatio) {
            bestRatio = r;
            bestKey = k;
          }
        });

        if (bestKey && bestRatio >= 0.2) {
          setActiveKey((prev) => (prev === bestKey ? prev : bestKey));
        }
      },
      {
        root,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.9, 1],
      },
    );

    for (const c of visibleComponents) {
      const el = itemRefs.current[c.key];
      if (el) observer.observe(el);
    }

    setActiveKey((prev) => prev || visibleComponents[0]?.key || "");

    return () => observer.disconnect();
  }, [visibleComponents]);

  const handleFocusCapture = (key: string) => {
    setActiveKey(key);
  };

  /**
   * ✅ Scroll resolver:
   * - por key
   * - por type
   * - por preferredTypes
   */
  const resolveTargetComponent = useCallback(
    (opts: {
      componentKey?: string;
      componentType?: FlowModelComponent["type"];
      preferredTypes?: FlowModelComponent["type"][];
    }) => {
      const list = Array.isArray(visibleComponents) ? visibleComponents : [];
      if (!list.length) return null;

      const key = safeString(opts.componentKey);
      const type = safeString(opts.componentType) as FlowModelComponent["type"];
      const preferredTypes = Array.isArray(opts.preferredTypes) ? opts.preferredTypes : [];

      let target: FlowModelComponent | null = null;

      if (key) target = list.find((c) => safeString(c.key) === key) || null;
      if (!target && type) target = list.find((c) => c.type === type) || null;

      if (!target && preferredTypes.length) {
        for (const t of preferredTypes) {
          const found = list.find((c) => c.type === t);
          if (found) {
            target = found;
            break;
          }
        }
      }

      return target;
    },
    [visibleComponents],
  );

  const doScrollToComponent = useCallback(
    (opts: {
      componentKey?: string;
      componentType?: FlowModelComponent["type"];
      preferredTypes?: FlowModelComponent["type"][];
    }) => {
      const target = resolveTargetComponent(opts);
      if (!target) return false;

      const anchorId = `stage-comp-${safeString(target.key) || `order-${target.order}`}`;
      const ok = scrollToAnchor(anchorId);

      if (ok) {
        // deixa o item como "ativo" também (UX melhor)
        setActiveKey(safeString(target.key));
      }

      return ok;
    },
    [resolveTargetComponent],
  );

  /**
   * ✅ Wrapper do onEvent:
   * Intercepta eventos de navegação e faz scroll aqui mesmo,
   * depois repassa para o handler externo (se existir).
   */
  const emitEvent = useCallback(
    (eventType: string, payload?: Record<string, any>) => {
      // ✅ Evento real vindo do StageSummary (pendências / botões)
      if (eventType === "stageSummary:scrollToComponent") {
        const componentKey = safeString(payload?.targetKey);
        const componentType = safeString(payload?.targetType) as
          | FlowModelComponent["type"]
          | undefined;

        doScrollToComponent({
          componentKey: componentKey || undefined,
          componentType: componentType || undefined,
        });
      }

      // ✅ Compat: botão "Ir para Gerenciar Arquivos" (se existir em algum lugar antigo)
      if (eventType === "stageSummary:openFiles") {
        doScrollToComponent({
          preferredTypes: ["FILES_MANAGMENT", "FILE_VIEWER"],
        });
      }

      // ✅ Compat: "Ver pendências" (vai na primeira pendência)
      if (eventType === "stageSummary:jumpToPending") {
        const pendingKeys = Array.isArray(payload?.pendingKeys) ? payload?.pendingKeys : [];
        const firstKey = safeString(pendingKeys[0]);
        if (firstKey) doScrollToComponent({ componentKey: firstKey });
      }

      // ✅ Evento genérico para navegação (se algum componente usar)
      if (eventType === "ui:scrollToComponent") {
        doScrollToComponent({
          componentKey: payload?.componentKey,
          componentType: payload?.componentType,
          preferredTypes: payload?.preferredTypes,
        });
      }

      // ✅ sempre repassa pro pai (runtime do modal etc.)
      onEvent?.(eventType, payload);
    },
    [doScrollToComponent, onEvent],
  );

  if (!visibleComponents.length) {
    return (
      <Box sx={{ py: 2, width: "100%" }}>
        <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center" }}>
          Nenhum componente disponível para este usuário.
        </Typography>
      </Box>
    );
  }

  const activeShadow = "0 0 0 3px rgba(59,130,246,0.08), 0 12px 28px rgba(15,23,42,0.06)";
  const focusShadow = "0 0 0 3px rgba(59,130,246,0.12), 0 12px 28px rgba(15,23,42,0.06)";
  const jumpShadow = "0 0 0 3px rgba(24,119,242,0.14), 0 12px 28px rgba(15,23,42,0.08)";

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 2, sm: 2.5, md: 3 },
        width: "100%",
        minWidth: 0,
      }}
    >
      {visibleComponents.map((comp, idx) => {
        const entry = componentRegistry[comp.type];
        const Renderer = entry?.Renderer;

        const canEditByRole =
          !comp.editableRoles?.length || hasIntersection(comp.editableRoles, userRoleIds);

        const isReadOnly =
          !!readOnly || !canEditByRole || (stageCompleted && !!comp.lockedAfterCompletion);

        const isActive = activeKey === comp.key;

        const anchorId = `stage-comp-${safeString(comp.key) || `order-${comp.order}`}`;
        const isJumpHighlighted = highlightedAnchorId === anchorId;

        if (!Renderer) {
          return (
            <Box
              key={comp.key}
              sx={{
                width: "100%",
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E6EB",
                borderRadius: 3,
                p: { xs: 2, sm: 2.5 },
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#212121" }}>
                {comp.label || "Componente"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#616161", mt: 0.5 }}>
                Tipo não suportado: {String(comp.type)}
              </Typography>
            </Box>
          );
        }

        return (
          <Box key={comp.key} sx={{ width: "100%", minWidth: 0 }}>
            {/* 🔹 Anchor real (id) + observer + foco */}
            <Box
              id={anchorId}
              ref={setItemRef(comp.key)}
              data-component-key={comp.key}
              onFocusCapture={() => handleFocusCapture(comp.key)}
              sx={{
                width: "100%",
                minWidth: 0,
                scrollMarginTop: 12,
              }}
            >
              {/* ✅ Wrapper premium + active/jump highlight */}
              <Box
                sx={{
                  width: "100%",
                  bgcolor: isActive ? "#FBFCFF" : "#FFFFFF",
                  border: "1px solid",
                  borderColor: isJumpHighlighted ? "#93C5FD" : isActive ? "#D6E4FF" : "#EEF2F7",
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  position: "relative",
                  transition: "background-color .18s ease, border-color .18s ease, box-shadow .18s ease",

                  boxShadow: isJumpHighlighted ? jumpShadow : isActive ? activeShadow : "none",

                  "&:hover": {
                    bgcolor: isActive ? "#FBFCFF" : "#FAFBFC",
                    borderColor: isJumpHighlighted ? "#60A5FA" : isActive ? "#BFDBFE" : "#E2E8F0",
                  },

                  "&:focus-within": {
                    borderColor: "#BFDBFE",
                    boxShadow: isJumpHighlighted ? jumpShadow : focusShadow,
                  },

                  outline: isJumpHighlighted ? "3px solid rgba(24,119,242,0.25)" : "none",
                  outlineOffset: isJumpHighlighted ? 2 : 0,

                  "& > *": { width: "100%", minWidth: 0 },
                }}
              >
                <Renderer
                  component={comp}
                  stageComponents={safeStageComponents}
                  isReadOnly={isReadOnly}
                  stageCompleted={stageCompleted}
                  onEvent={emitEvent} // ✅ usa wrapper que faz scroll
                />
              </Box>
            </Box>

            {/* 🌈 Separador em gradiente */}
            {idx < visibleComponents.length - 1 && (
              <Box
                sx={{
                  height: 1,
                  my: { xs: 2, sm: 2.5, md: 3 },
                  background:
                    "linear-gradient(90deg, rgba(226,232,240,0) 0%, rgba(226,232,240,0.9) 50%, rgba(226,232,240,0) 100%)",
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};
