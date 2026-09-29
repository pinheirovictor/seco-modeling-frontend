import {
  actorTypeLabel,
} from './catalogs';

import {
  MODEL_SCHEMA_VERSION,
  type Actor,
  type ActorType,
  type Annotation,
  type CommercialRelationship,
  type EcosystemModel,
  type Flow,
  type FlowType,
  type Gateway,
  type GatewayType,
  type ModelReference,
  type Position,
  type SecoGuideData,
} from './model';

import {
  uniqueActorName,
} from './validation';

/* =========================================================
   SECO-GUIDE
   ========================================================= */

/**
 * Cria a estrutura inicial de dados do SECO-Guide.
 *
 * O SECO-Guide não mantém cópias de atores,
 * relações comerciais ou fluxos.
 *
 * Essas informações continuam pertencendo ao modelo
 * SSN canônico.
 */
export function createEmptySecoGuideData(): SecoGuideData {
  return {
    /* -----------------------------------------------------
       ETAPA 1 — ESCOPO E OBJETIVOS
       ----------------------------------------------------- */

    scope: {
      purpose: '',
      boundaries: '',
      objectives: '',
    },

    /* -----------------------------------------------------
       ETAPA 2 — ATORES DIRETOS
       ----------------------------------------------------- */

    directActors: {
      notes: '',
    },

    /* -----------------------------------------------------
       ETAPA 3 — ATORES INTERMEDIÁRIOS
       ----------------------------------------------------- */

    intermediaryActors: {
      notes: '',
      reviewed: false,
    },

    /* -----------------------------------------------------
       ETAPA 4 — RELACIONAMENTOS
       ----------------------------------------------------- */

    relationships: {
      notes: '',
    },

    /* -----------------------------------------------------
       ETAPA 5 — FLUXOS DE VALOR
       ----------------------------------------------------- */

    valueFlows: {
      notes: '',
    },

    /* -----------------------------------------------------
       ETAPA 6 — DIAGRAMA SSN
       ----------------------------------------------------- */

    diagram: {
      organizationCriteria: '',
      notes: '',
      visuallyReviewed: false,
    },

    /* -----------------------------------------------------
       ETAPA 7 — REVISÃO E REFINAMENTO
       ----------------------------------------------------- */

    review: {
      reviewedPoints: '',
      pendingIssues: '',
      completed: false,
    },
  };
}

/* =========================================================
   MODELO
   ========================================================= */

/**
 * Cria um novo modelo vazio da ECOS Modeling 4.0.
 *
 * O modelo nasce sem atores, relações comerciais,
 * fluxos, gateways ou anotações.
 *
 * Os metadados gerais e a estrutura do SECO-Guide
 * são inicializados com valores vazios.
 */
export function createEmptyModel(): EcosystemModel {
  return {
    schemaVersion:
      MODEL_SCHEMA_VERSION,

    id:
      crypto.randomUUID(),

    name:
      'Meu Ecossistema',

    description:
      '',

    domain:
      '',

    keywords:
      [],

    references:
      [],

    actors:
      [],

    commercialRelationships:
      [],

    flows:
      [],

    gateways:
      [],

    annotations:
      [],

    secoGuide:
      createEmptySecoGuideData(),

    updatedAt:
      new Date().toISOString(),
  };
}

/* =========================================================
   REFERÊNCIAS
   ========================================================= */

/**
 * Cria uma referência associada ao modelo.
 *
 * A referência pode representar:
 *
 * - artigo científico;
 * - documentação;
 * - relatório;
 * - página institucional;
 * - outra fonte utilizada durante a modelagem.
 */
export function createModelReference(
  text = '',
  url?: string,
): ModelReference {
  return {
    id:
      crypto.randomUUID(),

    text,

    ...(url
      ? {
          url,
        }
      : {}),
  };
}

/* =========================================================
   ATORES
   ========================================================= */

/**
 * Cria um ator da notação SSN.
 *
 * O nome inicial é derivado do tipo.
 *
 * Exemplos:
 *
 * Companhia de Interesse
 * Fornecedor
 * Fornecedor 2
 * Cliente
 * Cliente 2
 */
export function createActor(
  type: ActorType,
  position: Position,
  existingActors: Actor[] = [],
): Actor {
  const baseName =
    actorTypeLabel(type);

  const name =
    uniqueActorName(
      baseName,
      existingActors,
    );

  return {
    id:
      crypto.randomUUID(),

    name,

    type,

    description:
      '',

    position: {
      x:
        position.x,

      y:
        position.y,
    },
  };
}

/* =========================================================
   RELAÇÃO COMERCIAL
   ========================================================= */

/**
 * Cria uma Relação Comercial entre dois atores.
 *
 * Uma Relação Comercial:
 *
 * - conecta exatamente dois atores;
 * - não possui direção;
 * - não possui seta;
 * - pode possuir um ou mais Fluxos.
 *
 * Exemplo visual:
 *
 * Fornecedor ───────────────── Companhia de Interesse
 *
 * actorAId e actorBId não representam origem e destino.
 * Eles representam apenas os dois participantes
 * da relação.
 */
export function createCommercialRelationship(
  actorAId: string,
  actorBId: string,
): CommercialRelationship {
  return {
    id:
      crypto.randomUUID(),

    actorAId,

    actorBId,

    description:
      '',
  };
}

/* =========================================================
   IDENTIFICADORES DE FLUXO
   ========================================================= */

/**
 * Calcula o próximo identificador disponível para um
 * determinado tipo de Fluxo.
 *
 * Exemplos:
 *
 * nenhum Produto existente:
 *
 * P.1
 *
 * já existem P.1, P.2 e P.3:
 *
 * próximo = P.4
 *
 * A numeração é independente entre os tipos:
 *
 * P.1
 * P.2
 * S.1
 * F.1
 * C.1
 */
export function nextFlowIdentifier(
  type: FlowType,
  existingFlows: Flow[],
): number {
  const identifiers =
    existingFlows
      .filter(
        (flow) =>
          flow.type === type,
      )
      .map(
        (flow) =>
          flow.identifier,
      )
      .filter(
        (identifier) =>
          Number.isInteger(
            identifier,
          ) &&
          identifier > 0,
      );

  if (
    identifiers.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...identifiers,
    ) + 1
  );
}

/* =========================================================
   FLUXOS
   ========================================================= */

/**
 * Cria um Fluxo associado a uma Relação Comercial.
 *
 * O Fluxo:
 *
 * - pertence a uma Relação Comercial;
 * - possui direção;
 * - possui tipo;
 * - recebe identificador automaticamente.
 *
 * Exemplo:
 *
 * type = product
 * identifier = 1
 *
 * representação visual:
 *
 * P.1
 *
 * Unity ───────── [ P.1 ] ───────── SkinnerBox
 *
 * Semanticamente:
 *
 * Unity → SkinnerBox
 */
export function createFlow(
  commercialRelationshipId: string,
  sourceActorId: string,
  targetActorId: string,
  type: FlowType,
  existingFlows: Flow[] = [],
): Flow {
  const identifier =
    nextFlowIdentifier(
      type,
      existingFlows,
    );

  return {
    id:
      crypto.randomUUID(),

    commercialRelationshipId,

    sourceActorId,

    targetActorId,

    type,

    identifier,

    name:
      '',

    description:
      '',
  };
}

/* =========================================================
   GATEWAYS
   ========================================================= */

/**
 * Cria um Gateway lógico da notação SSN.
 *
 * Tipos:
 *
 * - OR  -> OU
 * - XOR -> XOU
 *
 * A implementação visual e as regras específicas
 * serão finalizadas posteriormente.
 */
export function createGateway(
  type: GatewayType,
  position: Position,
): Gateway {
  return {
    id:
      crypto.randomUUID(),

    type,

    position: {
      x:
        position.x,

      y:
        position.y,
    },
  };
}

/* =========================================================
   ANOTAÇÕES
   ========================================================= */

/**
 * Cria uma anotação textual livre no canvas.
 *
 * Anotações servem apenas como apoio visual e
 * documental.
 *
 * Elas não fazem parte da estrutura semântica SSN
 * e não devem participar das métricas do ecossistema.
 */
export function createAnnotation(
  position: Position,
  text = 'Anotação',
): Annotation {
  return {
    id:
      crypto.randomUUID(),

    text,

    position: {
      x:
        position.x,

      y:
        position.y,
    },
  };
}