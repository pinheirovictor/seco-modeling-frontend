import { create } from 'zustand';

import {
  isActorType,
  isFlowType,
  isGatewayType,
} from '../../../domain/catalogs';

import {
  createActor,
  createCommercialRelationship,
  createEmptyModel,
  createFlow,
  nextFlowIdentifier,
} from '../../../domain/factory';

import {
  MODEL_SCHEMA_VERSION,
  type Actor,
  type ActorType,
  type CommercialRelationship,
  type EcosystemModel,
  type EditorNotice,
  type EditorSelection,
  type Flow,
  type FlowType,
  type Gateway,
  type Position,
} from '../../../domain/model';

import {
  actorExists,
  commercialRelationshipExistsBetween,
  flowMatchesCommercialRelationship,
  isValidFlowIdentifier,
  uniqueActorName,
  validateCompanyOfInterest,
} from '../../../domain/validation';

/* =========================================================
   CONSTANTES
   ========================================================= */

const STORAGE_KEY =
  'ecos-modeling:v4:sprint1:ssn-model';

const HISTORY_LIMIT = 100;

const EMPTY_SELECTION: EditorSelection = {
  actorIds: [],
  commercialRelationshipIds: [],
  flowIds: [],
  gatewayIds: [],
};

/* =========================================================
   CLIPBOARD
   ========================================================= */

/**
 * Ao copiar atores, preservamos também:
 *
 * - Relações Comerciais internas à seleção;
 * - Fluxos pertencentes a essas relações.
 *
 * Gateways ainda não são copiados nesta etapa.
 */
interface ActorClipboard {
  actors: Actor[];

  commercialRelationships: CommercialRelationship[];

  flows: Flow[];

  origin: Position;

  pasteCount: number;
}

interface PasteResult {
  model: EcosystemModel;

  actorIds: string[];

  commercialRelationshipIds: string[];

  flowIds: string[];

  skippedCompanyOfInterest: boolean;
}

/* =========================================================
   MODELO LEGADO DA SPRINT ANTERIOR
   ========================================================= */

/**
 * Estrutura utilizada antes da separação entre:
 *
 * Relação Comercial
 * e
 * Fluxo.
 *
 * Ela existe apenas para permitir migração do
 * localStorage durante esta fase de desenvolvimento.
 */
interface LegacyRelationship {
  id: string;

  sourceActorId: string;

  targetActorId: string;

  type:
    | 'product'
    | 'service'
    | 'financial'
    | 'information';

  name: string;

  description: string;
}

interface LegacyModel {
  schemaVersion: '4.0-draft';

  id: string;

  name: string;

  description: string;

  actors: Actor[];

  relationships: LegacyRelationship[];

  updatedAt: string;
}

/* =========================================================
   HELPERS GERAIS
   ========================================================= */

function cloneModel(
  model: EcosystemModel,
): EcosystemModel {
  return structuredClone(model);
}

function touch(
  model: EcosystemModel,
): EcosystemModel {
  return {
    ...model,

    updatedAt:
      new Date().toISOString(),
  };
}

function sameModel(
  a: EcosystemModel,
  b: EcosystemModel,
): boolean {
  const left = {
    ...a,
    updatedAt: '',
  };

  const right = {
    ...b,
    updatedAt: '',
  };

  return (
    JSON.stringify(left) ===
    JSON.stringify(right)
  );
}

function unique(
  values: string[],
): string[] {
  return [
    ...new Set(values),
  ];
}

/* =========================================================
   COMPANHIA DE INTERESSE
   ========================================================= */

function hasCompanyOfInterest(
  model: EcosystemModel,
  ignoredActorId?: string,
): boolean {
  return model.actors.some(
    (actor) =>
      actor.id !== ignoredActorId &&
      actor.type ===
        'company_of_interest',
  );
}

/* =========================================================
   RELAÇÃO COMERCIAL
   ========================================================= */

function commercialRelationshipExists(
  model: EcosystemModel,
  relationshipId: string,
): boolean {
  return model.commercialRelationships.some(
    (relationship) =>
      relationship.id ===
      relationshipId,
  );
}

function getCommercialRelationship(
  model: EcosystemModel,
  relationshipId: string,
): CommercialRelationship | undefined {
  return model.commercialRelationships.find(
    (relationship) =>
      relationship.id ===
      relationshipId,
  );
}

/* =========================================================
   FLUXOS
   ========================================================= */

function flowExists(
  model: EcosystemModel,
  flowId: string,
): boolean {
  return model.flows.some(
    (flow) =>
      flow.id === flowId,
  );
}

/**
 * Verifica se já existe outro fluxo com o mesmo código.
 *
 * Exemplo:
 *
 * P.1
 *
 * não pode aparecer duas vezes.
 */
function flowCodeExists(
  model: EcosystemModel,
  type: FlowType,
  identifier: number,
  ignoredFlowId?: string,
): boolean {
  return model.flows.some(
    (flow) =>
      flow.id !== ignoredFlowId &&
      flow.type === type &&
      flow.identifier === identifier,
  );
}

/* =========================================================
   GATEWAYS
   ========================================================= */

function gatewayExists(
  model: EcosystemModel,
  gatewayId: string,
): boolean {
  return model.gateways.some(
    (gateway) =>
      gateway.id === gatewayId,
  );
}

/* =========================================================
   CLIPBOARD
   ========================================================= */

/**
 * Constrói o clipboard a partir dos atores selecionados.
 *
 * Exemplo:
 *
 * A ───── B ───── C
 *
 * Se A e B forem selecionados:
 *
 * - A é copiado;
 * - B é copiado;
 * - relação A-B é copiada;
 * - fluxos da relação A-B são copiados;
 * - relação B-C não é copiada.
 */
function buildClipboard(
  model: EcosystemModel,
  actorIds: string[],
): ActorClipboard | null {
  const ids =
    new Set(actorIds);

  const actors =
    model.actors.filter(
      (actor) =>
        ids.has(actor.id),
    );

  if (
    actors.length === 0
  ) {
    return null;
  }

  const commercialRelationships =
    model.commercialRelationships.filter(
      (relationship) =>
        ids.has(
          relationship.actorAId,
        ) &&
        ids.has(
          relationship.actorBId,
        ),
    );

  const relationshipIds =
    new Set(
      commercialRelationships.map(
        (relationship) =>
          relationship.id,
      ),
    );

  const flows =
    model.flows.filter(
      (flow) =>
        relationshipIds.has(
          flow.commercialRelationshipId,
        ),
    );

  return {
    actors:
      structuredClone(
        actors,
      ),

    commercialRelationships:
      structuredClone(
        commercialRelationships,
      ),

    flows:
      structuredClone(
        flows,
      ),

    origin: {
      x:
        Math.min(
          ...actors.map(
            (actor) =>
              actor.position.x,
          ),
        ),

      y:
        Math.min(
          ...actors.map(
            (actor) =>
              actor.position.y,
          ),
        ),
    },

    pasteCount:
      0,
  };
}

/**
 * Cola atores e recria corretamente:
 *
 * - IDs dos atores;
 * - Relações Comerciais;
 * - Fluxos;
 * - códigos dos Fluxos.
 *
 * Os códigos dos Fluxos são recalculados para evitar
 * duplicidades como dois P.1 no mesmo modelo.
 */
function pasteActors(
  model: EcosystemModel,
  clipboard: ActorClipboard,
  targetPosition?: Position,
): PasteResult {
  const actorIdMap =
    new Map<
      string,
      string
    >();

  const relationshipIdMap =
    new Map<
      string,
      string
    >();

  const createdActors:
    Actor[] = [];

  const createdRelationships:
    CommercialRelationship[] =
      [];

  const createdFlows:
    Flow[] = [];

  let skippedCompanyOfInterest =
    false;

  let companyAlreadyExists =
    hasCompanyOfInterest(
      model,
    );

  const step =
    38 *
    (
      clipboard.pasteCount +
      1
    );

  const offset =
    targetPosition
      ? {
          x:
            targetPosition.x -
            clipboard.origin.x,

          y:
            targetPosition.y -
            clipboard.origin.y,
        }
      : {
          x: step,
          y: step,
        };

  /* -------------------------------------------------------
     ATORES
     ------------------------------------------------------- */

  for (
    const source
    of clipboard.actors
  ) {
    if (
      source.type ===
        'company_of_interest' &&
      companyAlreadyExists
    ) {
      skippedCompanyOfInterest =
        true;

      continue;
    }

    const id =
      crypto.randomUUID();

    const baseName =
      source.name.trim() ||
      'Ator';

    const preferredName =
      `${baseName} (cópia)`;

    const name =
      uniqueActorName(
        preferredName,
        [
          ...model.actors,
          ...createdActors,
        ],
      );

    createdActors.push({
      ...structuredClone(
        source,
      ),

      id,

      name,

      position: {
        x:
          source.position.x +
          offset.x,

        y:
          source.position.y +
          offset.y,
      },
    });

    actorIdMap.set(
      source.id,
      id,
    );

    if (
      source.type ===
      'company_of_interest'
    ) {
      companyAlreadyExists =
        true;
    }
  }

  /* -------------------------------------------------------
     RELAÇÕES COMERCIAIS
     ------------------------------------------------------- */

  for (
    const source
    of clipboard.commercialRelationships
  ) {
    const actorAId =
      actorIdMap.get(
        source.actorAId,
      );

    const actorBId =
      actorIdMap.get(
        source.actorBId,
      );

    /**
     * Caso algum ator tenha sido ignorado,
     * como a CoI, esta relação também não é copiada.
     */
    if (
      !actorAId ||
      !actorBId
    ) {
      continue;
    }

    const id =
      crypto.randomUUID();

    createdRelationships.push({
      ...structuredClone(
        source,
      ),

      id,

      actorAId,

      actorBId,
    });

    relationshipIdMap.set(
      source.id,
      id,
    );
  }

  /* -------------------------------------------------------
     FLUXOS
     ------------------------------------------------------- */

  for (
    const source
    of clipboard.flows
  ) {
    const commercialRelationshipId =
      relationshipIdMap.get(
        source.commercialRelationshipId,
      );

    const sourceActorId =
      actorIdMap.get(
        source.sourceActorId,
      );

    const targetActorId =
      actorIdMap.get(
        source.targetActorId,
      );

    if (
      !commercialRelationshipId ||
      !sourceActorId ||
      !targetActorId
    ) {
      continue;
    }

    /**
     * A numeração precisa considerar:
     *
     * - Fluxos já existentes no modelo;
     * - Fluxos criados nesta mesma operação.
     */
    const identifier =
      nextFlowIdentifier(
        source.type,
        [
          ...model.flows,
          ...createdFlows,
        ],
      );

    createdFlows.push({
      ...structuredClone(
        source,
      ),

      id:
        crypto.randomUUID(),

      commercialRelationshipId,

      sourceActorId,

      targetActorId,

      identifier,
    });
  }

  return {
    model: {
      ...model,

      actors: [
        ...model.actors,
        ...createdActors,
      ],

      commercialRelationships: [
        ...model.commercialRelationships,
        ...createdRelationships,
      ],

      flows: [
        ...model.flows,
        ...createdFlows,
      ],
    },

    actorIds:
      createdActors.map(
        (actor) =>
          actor.id,
      ),

    commercialRelationshipIds:
      createdRelationships.map(
        (relationship) =>
          relationship.id,
      ),

    flowIds:
      createdFlows.map(
        (flow) =>
          flow.id,
      ),

    skippedCompanyOfInterest,
  };
}

/* =========================================================
   MIGRAÇÃO DO MODELO ANTIGO
   ========================================================= */

function isLegacyRelationship(
  value: unknown,
): value is LegacyRelationship {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const candidate =
    value as Partial<
      LegacyRelationship
    >;

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.sourceActorId ===
      'string' &&
    typeof candidate.targetActorId ===
      'string' &&
    (
      candidate.type ===
        'product' ||
      candidate.type ===
        'service' ||
      candidate.type ===
        'financial' ||
      candidate.type ===
        'information'
    )
  );
}

function isLegacyModel(
  value: unknown,
): value is LegacyModel {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const candidate =
    value as Partial<
      LegacyModel
    >;

  return (
    Array.isArray(
      candidate.actors,
    ) &&
    Array.isArray(
      candidate.relationships,
    ) &&
    candidate.relationships.every(
      isLegacyRelationship,
    )
  );
}

/**
 * Migra automaticamente o modelo utilizado na versão
 * anterior deste frontend.
 *
 * Cada Relationship antigo se transforma em:
 *
 * 1 Relação Comercial
 * +
 * 1 Fluxo
 */
function migrateLegacyModel(
  legacy: LegacyModel,
): EcosystemModel {
  const commercialRelationships:
    CommercialRelationship[] =
      [];

  const flows:
    Flow[] = [];

  for (
    const oldRelationship
    of legacy.relationships
  ) {
    const relationship =
      createCommercialRelationship(
        oldRelationship.sourceActorId,
        oldRelationship.targetActorId,
      );

    relationship.description =
      oldRelationship.description ??
      '';

    commercialRelationships.push(
      relationship,
    );

    const flowType: FlowType =
      oldRelationship.type ===
      'information'
        ? 'content'
        : oldRelationship.type;

    const flow =
      createFlow(
        relationship.id,
        oldRelationship.sourceActorId,
        oldRelationship.targetActorId,
        flowType,
        flows,
      );

    flow.name =
      oldRelationship.name ??
      '';

    flow.description =
      oldRelationship.description ??
      '';

    flows.push(
      flow,
    );
  }

  return {
    schemaVersion:
      MODEL_SCHEMA_VERSION,

    id:
      legacy.id ||
      crypto.randomUUID(),

    name:
      legacy.name ||
      'Meu Ecossistema',

    description:
      legacy.description ||
      '',

    actors:
      structuredClone(
        legacy.actors,
      ),

    commercialRelationships,

    flows,

    gateways:
      [],

    updatedAt:
      new Date().toISOString(),
  };
}

/* =========================================================
   VALIDAÇÃO DE PERSISTÊNCIA
   ========================================================= */

function isValidStoredActor(
  actor: unknown,
): actor is Actor {
  if (
    !actor ||
    typeof actor !==
      'object'
  ) {
    return false;
  }

  const candidate =
    actor as Partial<Actor>;

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.name ===
      'string' &&
    typeof candidate.description ===
      'string' &&
    isActorType(
      candidate.type,
    ) &&
    candidate.position !==
      undefined &&
    typeof candidate.position.x ===
      'number' &&
    typeof candidate.position.y ===
      'number'
  );
}

function isValidStoredCommercialRelationship(
  relationship: unknown,
): relationship is CommercialRelationship {
  if (
    !relationship ||
    typeof relationship !==
      'object'
  ) {
    return false;
  }

  const candidate =
    relationship as Partial<
      CommercialRelationship
    >;

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.actorAId ===
      'string' &&
    typeof candidate.actorBId ===
      'string' &&
    typeof candidate.description ===
      'string'
  );
}

function isValidStoredFlow(
  flow: unknown,
): flow is Flow {
  if (
    !flow ||
    typeof flow !==
      'object'
  ) {
    return false;
  }

  const candidate =
    flow as Partial<Flow>;

  return (
    typeof candidate.id ===
      'string' &&
    typeof candidate.commercialRelationshipId ===
      'string' &&
    typeof candidate.sourceActorId ===
      'string' &&
    typeof candidate.targetActorId ===
      'string' &&
    isFlowType(
      candidate.type,
    ) &&
    typeof candidate.identifier ===
      'number' &&
    isValidFlowIdentifier(
      candidate.identifier,
    ) &&
    typeof candidate.name ===
      'string' &&
    typeof candidate.description ===
      'string'
  );
}

function isValidStoredGateway(
  gateway: unknown,
): gateway is Gateway {
  if (
    !gateway ||
    typeof gateway !==
      'object'
  ) {
    return false;
  }

  const candidate =
    gateway as Partial<Gateway>;

  return (
    typeof candidate.id ===
      'string' &&
    isGatewayType(
      candidate.type,
    ) &&
    candidate.position !==
      undefined &&
    typeof candidate.position.x ===
      'number' &&
    typeof candidate.position.y ===
      'number'
  );
}

function isCurrentModel(
  value: unknown,
): value is EcosystemModel {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const candidate =
    value as Partial<
      EcosystemModel
    >;

  return (
    candidate.schemaVersion ===
      MODEL_SCHEMA_VERSION &&
    typeof candidate.id ===
      'string' &&
    typeof candidate.name ===
      'string' &&
    typeof candidate.description ===
      'string' &&
    Array.isArray(
      candidate.actors,
    ) &&
    candidate.actors.every(
      isValidStoredActor,
    ) &&
    Array.isArray(
      candidate.commercialRelationships,
    ) &&
    candidate.commercialRelationships.every(
      isValidStoredCommercialRelationship,
    ) &&
    Array.isArray(
      candidate.flows,
    ) &&
    candidate.flows.every(
      isValidStoredFlow,
    ) &&
    Array.isArray(
      candidate.gateways,
    ) &&
    candidate.gateways.every(
      isValidStoredGateway,
    ) &&
    typeof candidate.updatedAt ===
      'string'
  );
}

/* =========================================================
   ESTADO
   ========================================================= */

interface EditorState {
  model: EcosystemModel;

  selection: EditorSelection;

  past: EcosystemModel[];

  future: EcosystemModel[];

  transactionBase:
    | EcosystemModel
    | null;

  clipboard:
    | ActorClipboard
    | null;

  notice:
    | EditorNotice
    | null;

  /* -------------------------------------------------------
     ATORES
     ------------------------------------------------------- */

  addActor: (
    type: ActorType,
    position: Position,
  ) => string | null;

  updateActor: (
    id: string,
    patch:
      Partial<
        Omit<
          Actor,
          'id'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  moveActor: (
    id: string,
    position: Position,
  ) => void;

  /* -------------------------------------------------------
     RELAÇÕES COMERCIAIS
     ------------------------------------------------------- */

  addCommercialRelationship: (
    actorAId: string,
    actorBId: string,
  ) => string | null;

  updateCommercialRelationship: (
    id: string,
    patch:
      Partial<
        Omit<
          CommercialRelationship,
          | 'id'
          | 'actorAId'
          | 'actorBId'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  /* -------------------------------------------------------
     FLUXOS
     ------------------------------------------------------- */

  addFlow: (
    commercialRelationshipId: string,
    sourceActorId: string,
    targetActorId: string,
    type?: FlowType,
  ) => string | null;

  updateFlow: (
    id: string,
    patch:
      Partial<
        Omit<
          Flow,
          | 'id'
          | 'commercialRelationshipId'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  swapFlowDirection: (
    id: string,
  ) => void;

  /* -------------------------------------------------------
     SELEÇÃO
     ------------------------------------------------------- */

  deleteSelection:
    () => void;

  setSelection: (
    actorIds: string[],
    commercialRelationshipIds?: string[],
    flowIds?: string[],
    gatewayIds?: string[],
  ) => void;

  selectOnlyActor: (
    id: string,
  ) => void;

  selectOnlyCommercialRelationship: (
    id: string,
  ) => void;

  selectOnlyFlow: (
    id: string,
  ) => void;

  selectOnlyGateway: (
    id: string,
  ) => void;

  clearSelection:
    () => void;

  selectAllActors:
    () => void;

  /* -------------------------------------------------------
     MODELO
     ------------------------------------------------------- */

  setModelName: (
    name: string,
    recordHistory?: boolean,
  ) => void;

  /* -------------------------------------------------------
     HISTÓRICO
     ------------------------------------------------------- */

  beginTransaction:
    () => void;

  commitTransaction:
    () => void;

  undo:
    () => void;

  redo:
    () => void;

  /* -------------------------------------------------------
     CLIPBOARD
     ------------------------------------------------------- */

  copySelectedActors:
    () => boolean;

  pasteClipboard: (
    targetPosition?: Position,
  ) => boolean;

  duplicateSelectedActors:
    () => boolean;

  /* -------------------------------------------------------
     PERSISTÊNCIA
     ------------------------------------------------------- */

  saveLocal: (
    silent?: boolean,
  ) => void;

  loadLocal:
    () => boolean;

  resetModel:
    () => void;

  exportJson:
    () => void;

  /* -------------------------------------------------------
     FEEDBACK
     ------------------------------------------------------- */

  showNotice: (
    message: string,
    tone?:
      EditorNotice['tone'],
  ) => void;

  clearNotice:
    () => void;
}

/* =========================================================
   SET STATE
   ========================================================= */

type SetState = (
  partial:
    | Partial<EditorState>
    | ((
        state: EditorState,
      ) =>
        Partial<EditorState>),
) => void;

/* =========================================================
   HISTÓRICO
   ========================================================= */

function commitMutation(
  set: SetState,
  mutate: (
    model: EcosystemModel,
  ) => EcosystemModel,
): void {
  set(
    (state) => {
      const previous =
        cloneModel(
          state.model,
        );

      const next =
        touch(
          mutate(
            cloneModel(
              state.model,
            ),
          ),
        );

      if (
        sameModel(
          previous,
          next,
        )
      ) {
        return {};
      }

      return {
        model:
          next,

        past: [
          ...state.past,
          previous,
        ].slice(
          -HISTORY_LIMIT,
        ),

        future:
          [],

        transactionBase:
          null,
      };
    },
  );
}

/* =========================================================
   STORE
   ========================================================= */

export const useEditorStore =
  create<EditorState>(
    (set, get) => ({
      model:
        createEmptyModel(),

      selection:
        EMPTY_SELECTION,

      past:
        [],

      future:
        [],

      transactionBase:
        null,

      clipboard:
        null,

      notice:
        null,

      /* ===================================================
         ATORES
         =================================================== */

      addActor: (
        type,
        position,
      ) => {
        if (
          type ===
            'company_of_interest' &&
          hasCompanyOfInterest(
            get().model,
          )
        ) {
          get().showNotice(
            'O modelo pode possuir apenas uma Companhia de Interesse (CoI).',
            'warning',
          );

          return null;
        }

        const actor =
          createActor(
            type,
            position,
            get().model.actors,
          );

        commitMutation(
          set,
          (model) => ({
            ...model,

            actors: [
              ...model.actors,
              actor,
            ],
          }),
        );

        set({
          selection: {
            ...EMPTY_SELECTION,

            actorIds: [
              actor.id,
            ],
          },
        });

        return actor.id;
      },

      updateActor: (
        id,
        patch,
        recordHistory = true,
      ) => {
        if (
          patch.type ===
            'company_of_interest' &&
          hasCompanyOfInterest(
            get().model,
            id,
          )
        ) {
          get().showNotice(
            'Já existe uma Companhia de Interesse (CoI) neste modelo.',
            'warning',
          );

          return;
        }

        if (
          patch.type !==
            undefined &&
          !isActorType(
            patch.type,
          )
        ) {
          get().showNotice(
            'O tipo de ator informado não pertence à notação SSN suportada.',
            'error',
          );

          return;
        }

        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          actors:
            model.actors.map(
              (actor) =>
                actor.id === id
                  ? {
                      ...actor,
                      ...patch,
                    }
                  : actor,
            ),
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      moveActor: (
        id,
        position,
      ) => {
        get().updateActor(
          id,
          {
            position,
          },
          false,
        );
      },

      /* ===================================================
         RELAÇÃO COMERCIAL
         =================================================== */

      addCommercialRelationship: (
        actorAId,
        actorBId,
      ) => {
        const model =
          get().model;

        if (
          !actorExists(
            model,
            actorAId,
          ) ||
          !actorExists(
            model,
            actorBId,
          )
        ) {
          get().showNotice(
            'Não foi possível criar a Relação Comercial porque um dos atores não existe.',
            'error',
          );

          return null;
        }

        if (
          actorAId ===
          actorBId
        ) {
          get().showNotice(
            'Uma Relação Comercial deve conectar dois atores diferentes.',
            'warning',
          );

          return null;
        }

        /**
         * Relação Comercial não possui direção.
         *
         * A-B e B-A representam a mesma relação.
         */
        if (
          commercialRelationshipExistsBetween(
            model,
            actorAId,
            actorBId,
          )
        ) {
          get().showNotice(
            'Já existe uma Relação Comercial entre esses atores.',
            'info',
          );

          return null;
        }

        const relationship =
          createCommercialRelationship(
            actorAId,
            actorBId,
          );

        commitMutation(
          set,
          (current) => ({
            ...current,

            commercialRelationships: [
              ...current.commercialRelationships,
              relationship,
            ],
          }),
        );

        set({
          selection: {
            ...EMPTY_SELECTION,

            commercialRelationshipIds: [
              relationship.id,
            ],
          },
        });

        return relationship.id;
      },

      updateCommercialRelationship: (
        id,
        patch,
        recordHistory = true,
      ) => {
        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          commercialRelationships:
            model.commercialRelationships.map(
              (relationship) =>
                relationship.id === id
                  ? {
                      ...relationship,
                      ...patch,
                    }
                  : relationship,
            ),
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      /* ===================================================
         FLUXOS
         =================================================== */

      addFlow: (
        commercialRelationshipId,
        sourceActorId,
        targetActorId,
        type = 'service',
      ) => {
        const model =
          get().model;

        const relationship =
          getCommercialRelationship(
            model,
            commercialRelationshipId,
          );

        if (
          !relationship
        ) {
          get().showNotice(
            'A Relação Comercial informada não existe.',
            'error',
          );

          return null;
        }

        if (
          !isFlowType(
            type,
          )
        ) {
          get().showNotice(
            'Tipo de Fluxo SSN inválido.',
            'error',
          );

          return null;
        }

        if (
          sourceActorId ===
          targetActorId
        ) {
          get().showNotice(
            'Um Fluxo deve ocorrer entre dois atores diferentes.',
            'warning',
          );

          return null;
        }

        const validDirection =
          (
            relationship.actorAId ===
              sourceActorId &&
            relationship.actorBId ===
              targetActorId
          ) ||
          (
            relationship.actorAId ===
              targetActorId &&
            relationship.actorBId ===
              sourceActorId
          );

        if (
          !validDirection
        ) {
          get().showNotice(
            'O Fluxo deve ocorrer entre os dois atores pertencentes à Relação Comercial.',
            'warning',
          );

          return null;
        }

        const flow =
          createFlow(
            commercialRelationshipId,
            sourceActorId,
            targetActorId,
            type,
            model.flows,
          );

        commitMutation(
          set,
          (current) => ({
            ...current,

            flows: [
              ...current.flows,
              flow,
            ],
          }),
        );

        set({
          selection: {
            ...EMPTY_SELECTION,

            flowIds: [
              flow.id,
            ],
          },
        });

        return flow.id;
      },

      updateFlow: (
        id,
        patch,
        recordHistory = true,
      ) => {
        const model =
          get().model;

        const current =
          model.flows.find(
            (flow) =>
              flow.id === id,
          );

        if (
          !current
        ) {
          return;
        }

        if (
          patch.type !==
            undefined &&
          !isFlowType(
            patch.type,
          )
        ) {
          get().showNotice(
            'Tipo de Fluxo SSN inválido.',
            'error',
          );

          return;
        }

        const candidate: Flow = {
          ...current,
          ...patch,
        };

        if (
          !isValidFlowIdentifier(
            candidate.identifier,
          )
        ) {
          get().showNotice(
            'O identificador do Fluxo deve ser um número inteiro maior que zero.',
            'warning',
          );

          return;
        }

        if (
          !flowMatchesCommercialRelationship(
            model,
            candidate,
          )
        ) {
          get().showNotice(
            'A origem e o destino do Fluxo devem corresponder aos atores da Relação Comercial.',
            'warning',
          );

          return;
        }

        if (
          flowCodeExists(
            model,
            candidate.type,
            candidate.identifier,
            id,
          )
        ) {
          get().showNotice(
            'Já existe outro Fluxo com esse código.',
            'warning',
          );

          return;
        }

        const mutate = (
          currentModel:
            EcosystemModel,
        ): EcosystemModel => ({
          ...currentModel,

          flows:
            currentModel.flows.map(
              (flow) =>
                flow.id === id
                  ? candidate
                  : flow,
            ),
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      swapFlowDirection: (
        id,
      ) => {
        const flow =
          get()
            .model
            .flows
            .find(
              (item) =>
                item.id === id,
            );

        if (!flow) {
          return;
        }

        get().updateFlow(
          id,
          {
            sourceActorId:
              flow.targetActorId,

            targetActorId:
              flow.sourceActorId,
          },
        );
      },

      /* ===================================================
         EXCLUSÃO
         =================================================== */

      deleteSelection:
        () => {
          const selection =
            get().selection;

          const actorSet =
            new Set(
              selection.actorIds,
            );

          const relationshipSet =
            new Set(
              selection.commercialRelationshipIds,
            );

          const flowSet =
            new Set(
              selection.flowIds,
            );

          const gatewaySet =
            new Set(
              selection.gatewayIds,
            );

          const totalSelected =
            actorSet.size +
            relationshipSet.size +
            flowSet.size +
            gatewaySet.size;

          if (
            totalSelected === 0
          ) {
            return;
          }

          commitMutation(
            set,
            (model) => {
              /**
               * Descobre relações removidas por exclusão
               * direta ou por exclusão de ator.
               */
              const removedRelationshipIds =
                new Set(
                  model.commercialRelationships
                    .filter(
                      (relationship) =>
                        relationshipSet.has(
                          relationship.id,
                        ) ||
                        actorSet.has(
                          relationship.actorAId,
                        ) ||
                        actorSet.has(
                          relationship.actorBId,
                        ),
                    )
                    .map(
                      (relationship) =>
                        relationship.id,
                    ),
                );

              return {
                ...model,

                actors:
                  model.actors.filter(
                    (actor) =>
                      !actorSet.has(
                        actor.id,
                      ),
                  ),

                commercialRelationships:
                  model.commercialRelationships.filter(
                    (relationship) =>
                      !removedRelationshipIds.has(
                        relationship.id,
                      ),
                  ),

                /**
                 * Excluir Relação Comercial remove
                 * automaticamente seus Fluxos.
                 */
                flows:
                  model.flows.filter(
                    (flow) =>
                      !flowSet.has(
                        flow.id,
                      ) &&
                      !removedRelationshipIds.has(
                        flow.commercialRelationshipId,
                      ) &&
                      !actorSet.has(
                        flow.sourceActorId,
                      ) &&
                      !actorSet.has(
                        flow.targetActorId,
                      ),
                  ),

                gateways:
                  model.gateways.filter(
                    (gateway) =>
                      !gatewaySet.has(
                        gateway.id,
                      ),
                  ),
              };
            },
          );

          set({
            selection:
              EMPTY_SELECTION,
          });
        },

      /* ===================================================
         SELEÇÃO
         =================================================== */

      setSelection: (
        actorIds,
        commercialRelationshipIds = [],
        flowIds = [],
        gatewayIds = [],
      ) => {
        const model =
          get().model;

        set({
          selection: {
            actorIds:
              unique(
                actorIds,
              ).filter(
                (id) =>
                  actorExists(
                    model,
                    id,
                  ),
              ),

            commercialRelationshipIds:
              unique(
                commercialRelationshipIds,
              ).filter(
                (id) =>
                  commercialRelationshipExists(
                    model,
                    id,
                  ),
              ),

            flowIds:
              unique(
                flowIds,
              ).filter(
                (id) =>
                  flowExists(
                    model,
                    id,
                  ),
              ),

            gatewayIds:
              unique(
                gatewayIds,
              ).filter(
                (id) =>
                  gatewayExists(
                    model,
                    id,
                  ),
              ),
          },
        });
      },

      selectOnlyActor: (
        id,
      ) => {
        if (
          !actorExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            ...EMPTY_SELECTION,

            actorIds: [
              id,
            ],
          },
        });
      },

      selectOnlyCommercialRelationship: (
        id,
      ) => {
        if (
          !commercialRelationshipExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            ...EMPTY_SELECTION,

            commercialRelationshipIds: [
              id,
            ],
          },
        });
      },

      selectOnlyFlow: (
        id,
      ) => {
        if (
          !flowExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            ...EMPTY_SELECTION,

            flowIds: [
              id,
            ],
          },
        });
      },

      selectOnlyGateway: (
        id,
      ) => {
        if (
          !gatewayExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            ...EMPTY_SELECTION,

            gatewayIds: [
              id,
            ],
          },
        });
      },

      clearSelection:
        () => {
          set({
            selection:
              EMPTY_SELECTION,
          });
        },

      selectAllActors:
        () => {
          set({
            selection: {
              ...EMPTY_SELECTION,

              actorIds:
                get()
                  .model
                  .actors
                  .map(
                    (actor) =>
                      actor.id,
                  ),
            },
          });
        },

      /* ===================================================
         NOME DO MODELO
         =================================================== */

      setModelName: (
        name,
        recordHistory = true,
      ) => {
        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,
          name,
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      /* ===================================================
         TRANSAÇÕES
         =================================================== */

      beginTransaction:
        () => {
          if (
            !get()
              .transactionBase
          ) {
            set({
              transactionBase:
                cloneModel(
                  get().model,
                ),
            });
          }
        },

      commitTransaction:
        () => {
          const base =
            get()
              .transactionBase;

          if (!base) {
            return;
          }

          const current =
            get().model;

          if (
            !sameModel(
              base,
              current,
            )
          ) {
            set(
              (state) => ({
                past: [
                  ...state.past,
                  base,
                ].slice(
                  -HISTORY_LIMIT,
                ),

                future:
                  [],

                transactionBase:
                  null,
              }),
            );
          } else {
            set({
              transactionBase:
                null,
            });
          }
        },

      /* ===================================================
         UNDO / REDO
         =================================================== */

      undo:
        () => {
          const {
            past,
            model,
          } = get();

          if (
            past.length === 0
          ) {
            return;
          }

          const previous =
            past[
              past.length - 1
            ];

          set(
            (state) => ({
              model:
                cloneModel(
                  previous,
                ),

              past:
                state.past.slice(
                  0,
                  -1,
                ),

              future: [
                cloneModel(
                  model,
                ),
                ...state.future,
              ].slice(
                0,
                HISTORY_LIMIT,
              ),

              selection:
                EMPTY_SELECTION,

              transactionBase:
                null,
            }),
          );
        },

      redo:
        () => {
          const {
            future,
            model,
          } = get();

          if (
            future.length === 0
          ) {
            return;
          }

          const next =
            future[0];

          set(
            (state) => ({
              model:
                cloneModel(
                  next,
                ),

              past: [
                ...state.past,
                cloneModel(
                  model,
                ),
              ].slice(
                -HISTORY_LIMIT,
              ),

              future:
                state.future.slice(
                  1,
                ),

              selection:
                EMPTY_SELECTION,

              transactionBase:
                null,
            }),
          );
        },

      /* ===================================================
         COPIAR
         =================================================== */

      copySelectedActors:
        () => {
          const clipboard =
            buildClipboard(
              get().model,
              get()
                .selection
                .actorIds,
            );

          if (!clipboard) {
            get().showNotice(
              'Selecione pelo menos um ator para copiar.',
              'info',
            );

            return false;
          }

          set({
            clipboard,
          });

          get().showNotice(
            clipboard.actors.length ===
              1
              ? 'Ator copiado.'
              : `${clipboard.actors.length} atores copiados.`,
            'success',
          );

          return true;
        },

      /* ===================================================
         COLAR
         =================================================== */

      pasteClipboard: (
        targetPosition,
      ) => {
        const clipboard =
          get().clipboard;

        if (!clipboard) {
          get().showNotice(
            'Não há atores copiados para colar.',
            'info',
          );

          return false;
        }

        const result =
          pasteActors(
            get().model,
            clipboard,
            targetPosition,
          );

        if (
          result.actorIds.length ===
          0
        ) {
          if (
            result
              .skippedCompanyOfInterest
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) é única e não pode ser duplicada.',
              'warning',
            );
          }

          return false;
        }

        commitMutation(
          set,
          () =>
            result.model,
        );

        set({
          selection: {
            actorIds:
              result.actorIds,

            commercialRelationshipIds:
              result.commercialRelationshipIds,

            flowIds:
              result.flowIds,

            gatewayIds:
              [],
          },

          clipboard: {
            ...clipboard,

            pasteCount:
              clipboard.pasteCount +
              1,
          },
        });

        if (
          result
            .skippedCompanyOfInterest
        ) {
          get().showNotice(
            'Os demais atores foram colados. A Companhia de Interesse (CoI) foi ignorada porque é única no modelo.',
            'warning',
          );
        }

        return true;
      },

      /* ===================================================
         DUPLICAR
         =================================================== */

      duplicateSelectedActors:
        () => {
          const clipboard =
            buildClipboard(
              get().model,
              get()
                .selection
                .actorIds,
            );

          if (!clipboard) {
            get().showNotice(
              'Selecione pelo menos um ator para duplicar.',
              'info',
            );

            return false;
          }

          const result =
            pasteActors(
              get().model,
              clipboard,
            );

          if (
            result.actorIds.length ===
            0
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) é única e não pode ser duplicada.',
              'warning',
            );

            return false;
          }

          commitMutation(
            set,
            () =>
              result.model,
        );

          set({
            selection: {
              actorIds:
                result.actorIds,

              commercialRelationshipIds:
                result.commercialRelationshipIds,

              flowIds:
                result.flowIds,

              gatewayIds:
                [],
            },
          });

          if (
            result
              .skippedCompanyOfInterest
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) foi ignorada. Os demais atores foram duplicados.',
              'warning',
            );
          }

          return true;
        },

      /* ===================================================
         SALVAR LOCALMENTE
         =================================================== */

      saveLocal: (
        silent = false,
      ) => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              get().model,
            ),
          );

          if (!silent) {
            get().showNotice(
              'Modelo salvo localmente.',
              'success',
            );
          }
        } catch {
          get().showNotice(
            'Não foi possível salvar o modelo localmente.',
            'error',
          );
        }
      },

      /* ===================================================
         CARREGAR LOCALMENTE
         =================================================== */

      loadLocal:
        () => {
          const raw =
            localStorage.getItem(
              STORAGE_KEY,
            );

          if (!raw) {
            return false;
          }

          try {
            const parsed:
              unknown =
                JSON.parse(raw);

            let model:
              EcosystemModel;

            /**
             * Modelo novo.
             */
            if (
              isCurrentModel(
                parsed,
              )
            ) {
              model =
                parsed;
            }

            /**
             * Modelo salvo antes da separação entre
             * Relação Comercial e Fluxo.
             */
            else if (
              isLegacyModel(
                parsed,
              )
            ) {
              model =
                migrateLegacyModel(
                  parsed,
                );

              get().showNotice(
                'O rascunho anterior foi migrado para a nova estrutura de Relações Comerciais e Fluxos.',
                'info',
              );
            } else {
              get().showNotice(
                'O rascunho local é incompatível com a estrutura SSN atual e não foi carregado.',
                'warning',
              );

              return false;
            }

            if (
              !validateCompanyOfInterest(
                model,
              )
            ) {
              get().showNotice(
                'O rascunho possui mais de uma Companhia de Interesse e não pôde ser carregado.',
                'warning',
              );

              return false;
            }

            set({
              model,

              selection:
                EMPTY_SELECTION,

              past:
                [],

              future:
                [],

              transactionBase:
                null,
            });

            return true;
          } catch {
            get().showNotice(
              'Não foi possível carregar o rascunho local.',
              'error',
            );

            return false;
          }
        },

      /* ===================================================
         NOVO MODELO
         =================================================== */

      resetModel:
        () => {
          const previous =
            cloneModel(
              get().model,
            );

          set(
            (state) => ({
              model:
                createEmptyModel(),

              selection:
                EMPTY_SELECTION,

              past: [
                ...state.past,
                previous,
              ].slice(
                -HISTORY_LIMIT,
              ),

              future:
                [],

              transactionBase:
                null,
            }),
          );

          get().showNotice(
            'Novo modelo criado. Use Desfazer para recuperar o modelo anterior.',
            'info',
          );
        },

      /* ===================================================
         EXPORTAÇÃO JSON
         =================================================== */

      exportJson:
        () => {
          const model =
            get().model;

          const blob =
            new Blob(
              [
                JSON.stringify(
                  model,
                  null,
                  2,
                ),
              ],
              {
                type:
                  'application/json',
              },
            );

          const url =
            URL.createObjectURL(
              blob,
            );

          const anchor =
            document.createElement(
              'a',
            );

          anchor.href =
            url;

          anchor.download =
            `${
              model.name
                .trim()
                .replace(
                  /\s+/g,
                  '-',
                )
                .toLowerCase() ||
              'ecos-model'
            }.json`;

          document.body.appendChild(
            anchor,
          );

          anchor.click();

          anchor.remove();

          URL.revokeObjectURL(
            url,
          );
        },

      /* ===================================================
         NOTIFICAÇÕES
         =================================================== */

      showNotice: (
        message,
        tone = 'info',
      ) => {
        set({
          notice: {
            id:
              crypto.randomUUID(),

            tone,

            message,
          },
        });
      },

      clearNotice:
        () => {
          set({
            notice:
              null,
          });
        },
    }),
  );