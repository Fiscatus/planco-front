import type { ComponentType, FlowModelComponent } from "@/hooks/useFlowModels";
import type { ComponentType as ReactComponentType } from "react";

import { SignatureComponent } from "./stage-components/SignatureComponent";
import { FormComponent } from "./stage-components/FormComponent";
import { FilesManagementComponent } from "./stage-components/FilesManagementComponent";
import { CommentsComponent } from "./stage-components/CommentsComponent";
import { ApprovalComponent } from "./stage-components/ApprovalComponent";
import { TimelineComponent } from "./stage-components/TimelineComponent";
import { FileViewerComponent } from "./stage-components/FileViewerComponent";
import { ChecklistComponent } from "./stage-components/ChecklistComponent";

import { Box, Typography } from "@mui/material";

/**
 * ✅ Importante:
 * - Componentes são renderizados separadamente e ordenados por "order".
 * - O preview simula apenas o runtime necessário (ex: FILE_VIEWER/FILES_MANAGMENT).
 */

export type StageComponentRuntimeProps = {
  component: FlowModelComponent;

  /**
   * ✅ lista completa de componentes da etapa
   * (necessário para APPROVAL enxergar FILES_MANAGMENT etc.)
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
  COMMENTS: {
    label: "Comentários",
    Renderer: CommentsComponent,
  },
  APPROVAL: {
    label: "Aprovação",
    Renderer: ApprovalComponent,
  },
  TIMELINE: {
    label: "Linha do Tempo",
    Renderer: TimelineComponent,
  },
  FILE_VIEWER: {
    label: "Visualizador de Arquivos",
    Renderer: FileViewerComponent,
  },

  CHECKLIST: {
    label: "Checklist",
    Renderer: ChecklistComponent,
  },
};
