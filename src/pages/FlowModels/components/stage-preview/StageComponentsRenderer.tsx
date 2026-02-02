import { Box, Typography } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
};

function hasIntersection(a: string[] = [], b: string[] = []) {
  if (!a.length || !b.length) return false;
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

function supportsIntersectionObserver() {
  return typeof window !== "undefined" && "IntersectionObserver" in window;
}

export const StageComponentsRenderer = ({
  components,
  stageComponents,
  userRoleIds = [],
  readOnly = false,
  stageCompleted = false,
  onEvent,
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

    // Guardamos ratios e escolhemos o maior como "active"
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

        // escolhe o mais visível (ratio maior).
        // se nenhum visível, mantém o atual.
        let bestKey = "";
        let bestRatio = 0;

        ratios.forEach((r, k) => {
          if (r > bestRatio) {
            bestRatio = r;
            bestKey = k;
          }
        });

        // só troca se tiver um "melhor" razoável,
        // evita piscadas quando está entre dois componentes
        if (bestKey && bestRatio >= 0.2) {
          setActiveKey((prev) => (prev === bestKey ? prev : bestKey));
        }
      },
      {
        // root = container do renderer, se existir, senão viewport
        root,
        // "janela" de ativação: favorece o componente central
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.9, 1],
      },
    );

    // observa todos os itens
    for (const c of visibleComponents) {
      const el = itemRefs.current[c.key];
      if (el) observer.observe(el);
    }

    // define ativo inicial (primeiro) se ainda não tiver
    setActiveKey((prev) => prev || visibleComponents[0]?.key || "");

    return () => observer.disconnect();
  }, [visibleComponents]);

  // Focus-within: quando o user clicar/digitar em algum componente,
  // esse componente vira ativo imediatamente.
  const handleFocusCapture = (key: string) => {
    setActiveKey(key);
  };

  if (!visibleComponents.length) {
    return (
      <Box sx={{ py: 2, width: "100%" }}>
        <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center" }}>
          Nenhum componente disponível para este usuário.
        </Typography>
      </Box>
    );
  }

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
            {/* 🔹 Anchor do observer + foco */}
            <Box
              ref={setItemRef(comp.key)}
              data-component-key={comp.key}
              onFocusCapture={() => handleFocusCapture(comp.key)}
              sx={{
                width: "100%",
                minWidth: 0,
              }}
            >
              {/* ✅ Wrapper premium + active highlight */}
              <Box
                sx={{
                  width: "100%",
                  bgcolor: isActive ? "#F8FAFF" : "#FFFFFF",
                  border: "1px solid",
                  borderColor: isActive ? "#C7D2FE" : "#EEF2F7",
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  position: "relative",
                  transition:
                    "background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease",

                  // OpenAI-like: highlight sutil, nada chamativo
                  boxShadow: isActive
                    ? "0 0 0 4px rgba(99,102,241,0.10), 0 12px 28px rgba(15,23,42,0.06)"
                    : "none",

                  "&:hover": {
                    bgcolor: isActive ? "#F8FAFF" : "#FAFBFC",
                    borderColor: isActive ? "#A5B4FC" : "#E2E8F0",
                  },

                  "&:focus-within": {
                    borderColor: "#A5B4FC",
                    boxShadow: "0 0 0 4px rgba(99,102,241,0.14), 0 12px 28px rgba(15,23,42,0.06)",
                  },

                  "& > *": { width: "100%", minWidth: 0 },
                }}
              >
                <Renderer
                  component={comp}
                  stageComponents={safeStageComponents}
                  isReadOnly={isReadOnly}
                  stageCompleted={stageCompleted}
                  onEvent={onEvent}
                />
              </Box>
            </Box>

            {/* 🌈 Separador em gradiente (suave, claro, fluido) */}
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
