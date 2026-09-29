import { create } from 'zustand';

import {
  isActorType,
  isFlowType,
  isGatewayType,
} from '../../../domain/catalogs';

import {
  createActor,
  createAnnotation,
  createCommercialRelationship,
  createEmptyModel,
  createEmptySecoGuideData,
  createFlow,
  createModelReference,
  nextFlowIdentifier,
} from '../../../domain/factory';

import {
  MODEL_SCHEMA_VERSION,
  type Actor,
  type ActorType,
  type Annotation,
  type CommercialRelationship,
  type EcosystemModel,
  type EditorNotice,
  type EditorSelection,
  type Flow,
  type FlowType,
  type Gateway,
  type ModelReference,
  type Position,
  type SecoGuideData,
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
  annotationIds: [],
};

/* =========================================================
   TIPOS AUXILIARES
   ========================================================= */

type ModelMetadataPatch =
  Partial<
    Pick<
      EcosystemModel,
      | 'description'
      | 'domain'
      | 'keywords'
    >
  >;

/* =========================================================
   CLIPBOARD
   ========================================================= */

/**
 * Ao copiar atores, preservamos também:
 *
 * - Relações Comerciais internas à seleção;
 * - Fluxos pertencentes a essas relações.
 *
 * Gateways e anotações não são copiados nesta etapa.
 */
interface ActorClipboard {
  actors: Actor[];

  commercialRelationships:
    CommercialRelationship[];

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

function asString(
  value: unknown,
): string {
  return typeof value === 'string'
    ? value
    : '';
}

function asBoolean(
  value: unknown,
): boolean {
  return typeof value === 'boolean'
    ? value
    : false;
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
   ANOTAÇÕES
   ========================================================= */

function annotationExists(
  model: EcosystemModel,
  annotationId: string,
): boolean {
  return model.annotations.some(
    (annotation) =>
      annotation.id === annotationId,
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
   VALIDAÇÃO DOS DADOS ARMAZENADOS
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

/* =========================================================
   NORMALIZAÇÃO DE REFERÊNCIAS
   ========================================================= */

function normalizeReferences(
  value: unknown,
): ModelReference[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (item) => {
        if (
          !item ||
          typeof item !==
            'object'
        ) {
          return null;
        }

        const candidate =
          item as Partial<
            ModelReference
          >;

        if (
          typeof candidate.text !==
            'string'
        ) {
          return null;
        }

        const reference:
          ModelReference = {
            id:
              typeof candidate.id ===
                'string' &&
              candidate.id
                .trim()
                .length > 0
                ? candidate.id
                : crypto.randomUUID(),

            text:
              candidate.text,
          };

        if (
          typeof candidate.url ===
            'string' &&
          candidate.url.trim()
        ) {
          reference.url =
            candidate.url;
        }

        return reference;
      },
    )
    .filter(
      (
        item,
      ): item is ModelReference =>
        item !== null,
    );
}

/* =========================================================
   NORMALIZAÇÃO DE ANOTAÇÕES
   ========================================================= */

function normalizeAnnotations(
  value: unknown,
): Annotation[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (item) => {
        if (
          !item ||
          typeof item !==
            'object'
        ) {
          return null;
        }

        const candidate =
          item as Partial<
            Annotation
          >;

        if (
          typeof candidate.text !==
            'string' ||
          !candidate.position ||
          typeof candidate.position.x !==
            'number' ||
          typeof candidate.position.y !==
            'number'
        ) {
          return null;
        }

        return {
          id:
            typeof candidate.id ===
              'string' &&
            candidate.id
              .trim()
              .length > 0
              ? candidate.id
              : crypto.randomUUID(),

          text:
            candidate.text,

          position: {
            x:
              candidate.position.x,

            y:
              candidate.position.y,
          },
        };
      },
    )
    .filter(
      (
        item,
      ): item is Annotation =>
        item !== null,
    );
}

/* =========================================================
   NORMALIZAÇÃO DO SECO-GUIDE
   ========================================================= */

/**
 * Normaliza os dados do SECO-Guide.
 *
 * Isso é necessário porque modelos salvos antes do M1
 * ainda não possuem essa estrutura.
 */
function normalizeSecoGuideData(
  value: unknown,
): SecoGuideData {
  const fallback =
    createEmptySecoGuideData();

  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return fallback;
  }

  const candidate =
    value as Partial<
      SecoGuideData
    >;

  return {
    scope: {
      purpose:
        asString(
          candidate.scope
            ?.purpose,
        ),

      boundaries:
        asString(
          candidate.scope
            ?.boundaries,
        ),

      objectives:
        asString(
          candidate.scope
            ?.objectives,
        ),
    },

    directActors: {
      notes:
        asString(
          candidate.directActors
            ?.notes,
        ),
    },

    intermediaryActors: {
      notes:
        asString(
          candidate.intermediaryActors
            ?.notes,
        ),

      reviewed:
        asBoolean(
          candidate.intermediaryActors
            ?.reviewed,
        ),
    },

    relationships: {
      notes:
        asString(
          candidate.relationships
            ?.notes,
        ),
    },

    valueFlows: {
      notes:
        asString(
          candidate.valueFlows
            ?.notes,
        ),
    },

    diagram: {
      organizationCriteria:
        asString(
          candidate.diagram
            ?.organizationCriteria,
        ),

      notes:
        asString(
          candidate.diagram
            ?.notes,
        ),

      visuallyReviewed:
        asBoolean(
          candidate.diagram
            ?.visuallyReviewed,
        ),
    },

    review: {
      reviewedPoints:
        asString(
          candidate.review
            ?.reviewedPoints,
        ),

      pendingIssues:
        asString(
          candidate.review
            ?.pendingIssues,
        ),

      completed:
        asBoolean(
          candidate.review
            ?.completed,
        ),
    },
  };
}

/* =========================================================
   NORMALIZAÇÃO DO MODELO 4.0
   ========================================================= */

/**
 * Aceita tanto:
 *
 * - o modelo M1 atual;
 * - o modelo 4.0 salvo antes do M1.
 *
 * Os novos campos são preenchidos automaticamente quando
 * ainda não existem no rascunho armazenado.
 */
function normalizeCurrentModel(
  value: unknown,
): EcosystemModel | null {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return null;
  }

  const candidate =
    value as Partial<
      EcosystemModel
    >;

  if (
    candidate.schemaVersion !==
      MODEL_SCHEMA_VERSION ||
    typeof candidate.id !==
      'string' ||
    typeof candidate.name !==
      'string' ||
    typeof candidate.description !==
      'string' ||
    !Array.isArray(
      candidate.actors,
    ) ||
    !candidate.actors.every(
      isValidStoredActor,
    ) ||
    !Array.isArray(
      candidate.commercialRelationships,
    ) ||
    !candidate.commercialRelationships.every(
      isValidStoredCommercialRelationship,
    ) ||
    !Array.isArray(
      candidate.flows,
    ) ||
    !candidate.flows.every(
      isValidStoredFlow,
    )
  ) {
    return null;
  }

  const gateways =
    Array.isArray(
      candidate.gateways,
    )
      ? candidate.gateways
      : [];

  if (
    !gateways.every(
      isValidStoredGateway,
    )
  ) {
    return null;
  }

  const keywords =
    Array.isArray(
      candidate.keywords,
    )
      ? unique(
          candidate.keywords.filter(
            (
              keyword,
            ): keyword is string =>
              typeof keyword ===
              'string',
          ),
        )
      : [];

  return {
    schemaVersion:
      MODEL_SCHEMA_VERSION,

    id:
      candidate.id,

    name:
      candidate.name,

    description:
      candidate.description,

    domain:
      typeof candidate.domain ===
        'string'
        ? candidate.domain
        : '',

    keywords,

    references:
      normalizeReferences(
        candidate.references,
      ),

    actors:
      structuredClone(
        candidate.actors,
      ),

    commercialRelationships:
      structuredClone(
        candidate.commercialRelationships,
      ),

    flows:
      structuredClone(
        candidate.flows,
      ),

    gateways:
      structuredClone(
        gateways,
      ),

    annotations:
      normalizeAnnotations(
        candidate.annotations,
      ),

    secoGuide:
      normalizeSecoGuideData(
        candidate.secoGuide,
      ),

    updatedAt:
      typeof candidate.updatedAt ===
        'string'
        ? candidate.updatedAt
        : new Date()
            .toISOString(),
  };
}

/**
 * Indica se o modelo armazenado ainda não possui
 * completamente os campos adicionados no M1.
 */
function needsM1Normalization(
  value: unknown,
): boolean {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;

  return (
    !(
      'domain'
      in candidate
    ) ||
    !(
      'keywords'
      in candidate
    ) ||
    !(
      'references'
      in candidate
    ) ||
    !(
      'annotations'
      in candidate
    ) ||
    !(
      'secoGuide'
      in candidate
    )
  );
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
    candidate.actors.every(
      isValidStoredActor,
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
 * Migra automaticamente o modelo utilizado antes
 * da separação entre Relação Comercial e Fluxo.
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

  const base =
    createEmptyModel();

  return {
    ...base,

    id:
      legacy.id ||
      base.id,

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

    updatedAt:
      new Date()
        .toISOString(),
  };
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
     ANOTAÇÕES
     ------------------------------------------------------- */

  addAnnotation: (
    position: Position,
    text?: string,
  ) => string;

  updateAnnotation: (
    id: string,
    patch:
      Partial<
        Omit<
          Annotation,
          'id'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  moveAnnotation: (
    id: string,
    position: Position,
  ) => void;

  /* -------------------------------------------------------
     METADADOS DO MODELO
     ------------------------------------------------------- */

  updateModelMetadata: (
    patch: ModelMetadataPatch,
    recordHistory?: boolean,
  ) => void;

  addModelReference: (
    text?: string,
    url?: string,
  ) => string;

  updateModelReference: (
    id: string,
    patch:
      Partial<
        Omit<
          ModelReference,
          'id'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  removeModelReference: (
    id: string,
  ) => void;

  /* -------------------------------------------------------
     SECO-GUIDE
     ------------------------------------------------------- */

  updateSecoGuideSection:
    <
      K extends keyof SecoGuideData,
    >(
      section: K,
      patch:
        Partial<
          SecoGuideData[K]
        >,
      recordHistory?: boolean,
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
    annotationIds?: string[],
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

  selectOnlyAnnotation: (
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
            get()
              .model
              .actors,
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
         RELAÇÕES COMERCIAIS
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

        if (!current) {
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
         ANOTAÇÕES
         =================================================== */

      addAnnotation: (
        position,
        text = 'Anotação',
      ) => {
        const annotation =
          createAnnotation(
            position,
            text,
          );

        commitMutation(
          set,
          (model) => ({
            ...model,

            annotations: [
              ...model.annotations,
              annotation,
            ],
          }),
        );

        set({
          selection: {
            ...EMPTY_SELECTION,

            annotationIds: [
              annotation.id,
            ],
          },
        });

        return annotation.id;
      },

      updateAnnotation: (
        id,
        patch,
        recordHistory = true,
      ) => {
        if (
          !annotationExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          annotations:
            model.annotations.map(
              (annotation) =>
                annotation.id === id
                  ? {
                      ...annotation,
                      ...patch,
                    }
                  : annotation,
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

      moveAnnotation: (
        id,
        position,
      ) => {
        get().updateAnnotation(
          id,
          {
            position,
          },
          false,
        );
      },

      /* ===================================================
         METADADOS DO MODELO
         =================================================== */

      updateModelMetadata: (
        patch,
        recordHistory = true,
      ) => {
        const normalizedPatch:
          ModelMetadataPatch = {
            ...patch,
          };

        if (
          patch.keywords
        ) {
          normalizedPatch.keywords =
            unique(
              patch.keywords
                .map(
                  (keyword) =>
                    keyword.trim(),
                )
                .filter(Boolean),
            );
        }

        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,
          ...normalizedPatch,
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
         REFERÊNCIAS
         =================================================== */

      addModelReference: (
        text = '',
        url,
      ) => {
        const reference =
          createModelReference(
            text,
            url,
          );

        commitMutation(
          set,
          (model) => ({
            ...model,

            references: [
              ...model.references,
              reference,
            ],
          }),
        );

        return reference.id;
      },

      updateModelReference: (
        id,
        patch,
        recordHistory = true,
      ) => {
        const exists =
          get()
            .model
            .references
            .some(
              (reference) =>
                reference.id === id,
            );

        if (!exists) {
          return;
        }

        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          references:
            model.references.map(
              (reference) =>
                reference.id === id
                  ? {
                      ...reference,
                      ...patch,
                    }
                  : reference,
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

      removeModelReference: (
        id,
      ) => {
        const exists =
          get()
            .model
            .references
            .some(
              (reference) =>
                reference.id === id,
            );

        if (!exists) {
          return;
        }

        commitMutation(
          set,
          (model) => ({
            ...model,

            references:
              model.references.filter(
                (reference) =>
                  reference.id !== id,
              ),
          }),
        );
      },

      /* ===================================================
         SECO-GUIDE
         =================================================== */

      updateSecoGuideSection: (
        section,
        patch,
        recordHistory = true,
      ) => {
        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => {
          const nextSecoGuide = {
            ...model.secoGuide,

            [section]: {
              ...model.secoGuide[
                section
              ],

              ...patch,
            },
          } as SecoGuideData;

          return {
            ...model,

            secoGuide:
              nextSecoGuide,
          };
        };

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

          const annotationSet =
            new Set(
              selection.annotationIds,
            );

          const totalSelected =
            actorSet.size +
            relationshipSet.size +
            flowSet.size +
            gatewaySet.size +
            annotationSet.size;

          if (
            totalSelected === 0
          ) {
            return;
          }

          commitMutation(
            set,
            (model) => {
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

                annotations:
                  model.annotations.filter(
                    (annotation) =>
                      !annotationSet.has(
                        annotation.id,
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
        annotationIds = [],
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

            annotationIds:
              unique(
                annotationIds,
              ).filter(
                (id) =>
                  annotationExists(
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

      selectOnlyAnnotation: (
        id,
      ) => {
        if (
          !annotationExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            ...EMPTY_SELECTION,

            annotationIds: [
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

            annotationIds:
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

              annotationIds:
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
                JSON.parse(
                  raw,
                );

            let model:
              EcosystemModel;

            const needsNormalization =
              needsM1Normalization(
                parsed,
              );

            const normalized =
              normalizeCurrentModel(
                parsed,
              );

            /**
             * Modelo 4.0 atual.
             *
             * Também aceita os modelos 4.0 salvos
             * antes da introdução dos metadados,
             * SECO-Guide e anotações.
             */
            if (normalized) {
              model =
                normalized;

              if (
                needsNormalization
              ) {
                get().showNotice(
                  'O rascunho foi atualizado automaticamente para a nova estrutura da ECOS Modeling 4.0.',
                  'info',
                );
              }
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

            /**
             * Após uma normalização ou migração,
             * salvamos novamente para evitar repetir
             * a conversão a cada carregamento.
             */
            if (
              needsNormalization ||
              isLegacyModel(
                parsed,
              )
            ) {
              try {
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify(
                    model,
                  ),
                );
              } catch {
                // A falha aqui não impede que o
                // modelo já carregado seja utilizado.
              }
            }

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