// src/pages/FlowModels/components/stage-preview/componentRegistry.tsx

import type { ComponentType, FlowModelComponent, FlowModelStage } from "@/hooks/useFlowModels";
import type { ComponentType as ReactComponentType } from "react";

import { SignatureComponent } from "./stage-components/SignatureComponent";
import { FormComponent } from "./stage-components/FormComponent";
import { FilesManagementComponent } from "./stage-components/FilesManagementComponent";
import { CommentsComponent } from "./stage-components/CommentsComponent";
import { ApprovalComponent } from "./stage-components/ApprovalComponent";
import { TimelineComponent } from "./stage-components/TimelineComponent";
import { FileViewerComponent } from "./stage-components/FileViewerComponent";
import { ChecklistComponent } from "./stage-components/ChecklistComponent";
import { StageSummaryCard } from "./stage-components/StageSummaryCard";

/**
 * ✅ Props padrão que TODOS os componentes de etapa recebem
 * ✅ Agora inclui `stage` para suportar fallback e contexto real
 */
export type StageComponentRuntimeProps = {
  component: FlowModelComponent;

  /**
   * ✅ NOVO:
   * Etapa completa (inclui aprovadores, regras etc.)
   */
  stage?: FlowModelStage | null;

  /**
   * Lista completa de componentes da etapa
   * (necessário para APPROVAL, SUMMARY etc.)
   */
  stageComponents?: FlowModelComponent[];

  isReadOnly: boolean;
  stageCompleted: boolean;
  onEvent?: (eventType: string, payload?: Record<string, any>) => void;
};

type RegistryEntry = {
  label: string;
  Renderer: ReactComponentType<StageComponentRuntimeProps>;
};

/**
 * ✅ Registry central de componentes de etapa
 * Ordem visual é controlada pelo `order` no FlowModel
 */
export const componentRegistry: Record<ComponentType, RegistryEntry> = {
  SIGNATURE: {
    label: "Assinatura Eletrônica",
    Renderer: SignatureComponent,
  },

  FORM: {
    label: "Formulário",
    Renderer: FormComponent,
  },

  FILES_MANAGMENT: {
    label: "Gerenciar Arquivos",
    Renderer: FilesManagementComponent,
  },

  FILE_VIEWER: {
    label: "Visualizador de Arquivos",
    Renderer: FileViewerComponent,
  },

  COMMENTS: {
    label: "Comentários",
    Renderer: CommentsComponent,
  },

  CHECKLIST: {
    label: "Checklist",
    Renderer: ChecklistComponent,
  },

  TIMELINE: {
    label: "Linha do Tempo",
    Renderer: TimelineComponent,
  },

  APPROVAL: {
    label: "Aprovação",
    Renderer: ApprovalComponent,
  },

  STAGE_SUMMARY: {
    label: "Resumo da etapa",
    Renderer: StageSummaryCard,
  },
};
