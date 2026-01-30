import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
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

  // permissões simples (podemos evoluir depois)
  userRoleIds?: string[];

  /**
   * ⚠️ IMPORTANTE:
   * - readOnly default precisa ser FALSE para não travar todos os componentes por engano.
   * - O “modo somente leitura” deve ser decidido pelo container (runtime real) ou pelo StagePreviewModal quando quiser.
   */
  readOnly?: boolean;

  // flags de runtime (quando estiver no processo real)
  stageCompleted?: boolean;

  // callbacks futuros (salvar dados etc.)
  onEvent?: (eventType: string, payload?: Record<string, any>) => void;
};

function hasIntersection(a: string[] = [], b: string[] = []) {
  if (!a.length || !b.length) return false;
  const setB = new Set(b);
  return a.some((x) => setB.has(x));
}

export const StageComponentsRenderer = ({
  components,
  stageComponents, // ✅ novo
  userRoleIds = [],
  readOnly = false, // ✅ default editável para não travar em cascata
  stageCompleted = false,
  onEvent,
}: StageComponentsRendererProps) => {
  const safeComponents = useMemo(() => {
    const arr = Array.isArray(components) ? components.slice() : [];
    return arr
      .map((c) => ({
        ...c,
        order: Number.isFinite(c.order) ? c.order : 0,
        visibilityRoles: Array.isArray(c.visibilityRoles)
          ? c.visibilityRoles
          : [],
        editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
        config: c.config ?? {},
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [components]);

  // ✅ lista completa segura (fallback = components)
  const safeStageComponents = useMemo(() => {
    const base = stageComponents ?? components;
    const arr = Array.isArray(base) ? base.slice() : [];
    return arr.map((c) => ({
      ...c,
      order: Number.isFinite(c.order) ? c.order : 0,
      visibilityRoles: Array.isArray(c.visibilityRoles)
        ? c.visibilityRoles
        : [],
      editableRoles: Array.isArray(c.editableRoles) ? c.editableRoles : [],
      config: c.config ?? {},
    }));
  }, [stageComponents, components]);

  const visibleComponents = useMemo(() => {
    return safeComponents.filter((c) => {
      const visibility = c.visibilityRoles || [];
      // se não tem restrição, mostra
      if (!visibility.length) return true;
      // se tem restrição, precisa bater algum role do usuário
      return hasIntersection(visibility, userRoleIds);
    });
  }, [safeComponents, userRoleIds]);

  if (!visibleComponents.length) {
    return (
      <Box sx={{ py: 2, width: "100%" }}>
        <Typography
          variant="body2"
          sx={{ color: "#94a3b8", textAlign: "center" }}
        >
          Nenhum componente disponível para este usuário.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        // ✅ garante que cada componente fique um embaixo do outro e ocupe 100%
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        width: "100%",
        minWidth: 0,
      }}
    >
      {visibleComponents.map((comp) => {
        const entry = componentRegistry[comp.type];
        const Renderer = entry?.Renderer;

        const canEditByRole =
          !comp.editableRoles?.length ||
          hasIntersection(comp.editableRoles, userRoleIds);

        const isReadOnly =
          !!readOnly ||
          !canEditByRole ||
          (stageCompleted && !!comp.lockedAfterCompletion);

        if (!Renderer) {
          return (
            <Box
              key={comp.key}
              sx={{
                width: "100%",
                minWidth: 0,
                bgcolor: "background.paper",
                border: "1px solid #E4E6EB",
                borderRadius: 2,
                p: 2.5,
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
          // ✅ wrapper: impede “aperto”, evita overflow e força o componente a 100%
          <Box
            key={comp.key}
            sx={{
              width: "100%",
              minWidth: 0,
              "& > *": { width: "100%", minWidth: 0 },
            }}
          >
            <Renderer
              component={comp}
              stageComponents={safeComponents} // ✅ passa a etapa inteira pro runtime
              isReadOnly={isReadOnly}
              stageCompleted={stageCompleted}
              onEvent={onEvent}
            />
          </Box>
        );
      })}
    </Box>
  );
};
