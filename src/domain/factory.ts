import {
  actorTypeLabel,
} from './catalogs';

import {
  MODEL_SCHEMA_VERSION,
  type Actor,
  type ActorType,
  type CommercialRelationship,
  type EcosystemModel,
  type Flow,
  type FlowType,
  type Gateway,
  type GatewayType,
  type Position,
} from './model';

import {
  uniqueActorName,
} from './validation';

/* =========================================================
   MODELO
   ========================================================= */

/**
 * Cria um novo modelo vazio da ECOS Modeling 4.0.
 *
 * O modelo nasce sem atores, relações comerciais,
 * fluxos ou gateways.
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

    actors:
      [],

    commercialRelationships:
      [],

    flows:
      [],

    gateways:
      [],

    updatedAt:
      new Date().toISOString(),
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
 * - pode conter um ou mais Fluxos.
 *
 * Exemplo visual:
 *
 * Fornecedor ───────────────── Companhia de Interesse
 *
 * actorAId e actorBId não representam origem/destino.
 * Eles representam apenas os dois participantes da relação.
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
 *
 * Unity ───────── [ P.1 ] ───────── SkinnerBox
 *
 * semanticamente:
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
 * Os Gateways serão implementados visualmente em uma
 * etapa posterior.
 *
 * Tipos:
 *
 * - OR  -> OU Gateway
 * - XOR -> XOU Gateway
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