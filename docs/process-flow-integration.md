# Integração Front + Back — Processo / Snapshot / Componentes

Este documento consolida o contrato para o front montar o estado de fluxo por instância de processo e mapear dados de componentes por etapa.

## Endpoints atuais do backend (confirmado no código)

- `GET /flows/instances/process/:processId` → carrega a instância de fluxo do processo (snapshot + execuções de etapa).
- Componentes por contexto (`processId`, `stageId`, `componentKey`):
  - `GET /forms`, `PUT /forms`
  - `GET /checklist`, `POST /checklist`, `PATCH /checklist/:id`, `PATCH /checklist/:id/toggle`
  - `GET /comments`, `POST /comments`
  - `GET /files`, `POST /files/upload`, `POST /files/:fileId/send-to-approval`
  - `GET /timeline`, `POST /timeline`, `PATCH /timeline/:id`, `DELETE /timeline/:id`
  - `GET /signatures`, `PUT /signatures/signatories`, `POST /signatures/sign`
- Aprovação:
  - `GET /approvals` (histórico por componente) usa `instanceId + stageId + componentKey`
  - `GET /approvals/pending` e `PATCH /approvals/resolve` usam `processId`

## IDs e relacionamento de referência

- `processId` → id do processo (`processes._id`)
- `processInstanceId` → id da instância de fluxo (`flowInstance._id`)
- `stageId` → id lógico da etapa no modelo/snapshot
- `stageInstanceId` → no backend atual é representado pelo próprio `stageId` (stage execution indexado por `stageId`)
- `componentKey` → chave lógica do componente dentro da etapa

Chave canônica no front para estado de componente:

```ts
componentInstanceKey = `${processInstanceId}:${stageInstanceId}:${componentKey}`;
```

## Estratégia de consistência de snapshot

1. Buscar `GET /flows/instances/process/:processId` antes de chamar APIs de componente.
2. Extrair `snapshotVersion` (ou fallback para `updatedAt` da instância, quando versão explícita não existir).
3. Enviar contexto completo nas queries dos componentes.
4. Se uma resposta de componente retornar versão divergente, marcar como stale e fazer refetch da instância.

## Contrato recomendado (esqueleto agregador para backend)

> Recomendação para reduzir N chamadas no front e evitar drift de snapshot.

**Endpoint sugerido**

- `GET /flows/instances/process/:processId/components-state`

**Query params sugeridos**

- `include=FORM,CHECKLIST,COMMENTS,FILES_MANAGEMENT,TIMELINE,SIGNATURE,APPROVAL`
- `strictSnapshot=true`

**Resposta sugerida**

```json
{
  "processId": "507f1f77bcf86cd799439011",
  "processInstanceId": "66aa11bb22cc33dd44ee55ff",
  "snapshotVersion": "2026-03-23T21:20:00.000Z",
  "stages": [
    {
      "stageId": "analise-juridica",
          "stageInstanceId": "analise-juridica",
      "status": "IN_PROGRESS",
      "components": [
        {
          "componentKey": "form_principal",
          "componentType": "FORM",
          "componentInstanceKey": "66aa11bb22cc33dd44ee55ff:analise-juridica:form_principal",
          "state": {
            "data": { "fields": [] },
            "updatedAt": "2026-03-23T21:15:00.000Z"
          },
          "error": null
        }
      ]
    }
  ],
  "errors": []
}
```

**Convenção de erro sugerida**

```json
{
  "code": "SNAPSHOT_CONFLICT",
  "message": "Snapshot mudou durante agregação",
  "details": {
    "expectedSnapshotVersion": "2026-03-23T21:20:00.000Z",
    "receivedSnapshotVersion": "2026-03-23T21:21:30.000Z"
  }
}
```

## Esqueleto backend (NestJS) para implementar agregação

```ts
// flows.controller.ts
@Get('instances/process/:processId/components-state')
@CheckPolicies({ action: Action.READ, subject: Subject.FLOW_INSTANCE })
getComponentsState(
  @Param('processId') processId: string,
  @Query('include') include?: string,
  @Query('strictSnapshot') strictSnapshot?: string,
  @CurrentUser() user: JwtPayload,
) {
  return this.flowsService.getComponentsState({
    processId,
    include: include?.split(',') ?? [],
    strictSnapshot: strictSnapshot === 'true',
    user,
  });
}
```

```ts
// flows.service.ts (estrutura)
async getComponentsState(params: GetComponentsStateParams) {
  const instance = await this.findFlowInstanceByProcess(params.processId, params.user.org?._id);
  const snapshotVersion = instance.updatedAt?.toISOString(); // ou version real quando existir

  const stages = await Promise.all(
    instance.snapshotStages.map(async (stage) => {
      const components = await Promise.all(
        stage.components
          .filter((component) => params.include.length === 0 || params.include.includes(component.type))
          .map((component) => this.resolveComponentState({
            processId: params.processId,
            instanceId: String(instance._id),
            stageId: stage.stageId,
            componentKey: component.key,
            componentType: component.type,
            snapshotVersion,
          })),
      );

      return {
        stageId: stage.stageId,
        stageInstanceId: stage.stageId,
        status: this.findExecutionStatus(instance.stageExecutions, stage.stageId),
        components,
      };
    }),
  );

  return {
    processId: params.processId,
    processInstanceId: String(instance._id),
    snapshotVersion,
    stages,
    errors: [],
  };
}
```

> Alinhado com OpenCode#2: `GET /approvals` usa `instanceId + stageId + componentKey`; já `GET /approvals/pending` e `PATCH /approvals/resolve` usam `processId`.
