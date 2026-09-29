import {
  actorTypeLabel,
} from './catalogs';

import type {
  Actor,
  ActorType,
  EcosystemModel,
  Position,
  Relationship,
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
 * O modelo nasce sem atores e sem relações.
 * A Companhia de Interesse é adicionada explicitamente
 * pelo usuário durante a modelagem.
 */
export function createEmptyModel(): EcosystemModel {
  const now =
    new Date().toISOString();

  return {
    schemaVersion:
      '4.0-draft',

    id:
      crypto.randomUUID(),

    name:
      'Meu Ecossistema',

    description:
      '',

    actors:
      [],

    relationships:
      [],

    updatedAt:
      now,
  };
}

/* =========================================================
   ATORES
   ========================================================= */

/**
 * Cria um ator da notação SSN.
 *
 * O nome inicial é derivado do tipo do ator.
 *
 * Exemplos:
 *
 * Companhia de Interesse
 * Fornecedor
 * Cliente
 *
 * Caso já exista um ator com o mesmo nome:
 *
 * Fornecedor 2
 * Fornecedor 3
 * ...
 *
 * A regra de unicidade da Companhia de Interesse não é
 * aplicada aqui porque pertence ao domínio/store, que possui
 * acesso ao modelo completo.
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
   RELAÇÕES
   ========================================================= */

/**
 * Cria uma conexão provisória entre dois atores.
 *
 * IMPORTANTE:
 *
 * Esta estrutura ainda pertence ao MVP inicial da Sprint 1.
 *
 * Na notação SSN completa, posteriormente vamos separar:
 *
 * - Relação Comercial;
 * - Fluxo;
 * - OU Gateway;
 * - XOU Gateway.
 *
 * Portanto, Relationship ainda não deve ser entendido como
 * a implementação definitiva de uma Relação Comercial SSN.
 */
export function createRelationship(
  sourceActorId: string,
  targetActorId: string,
): Relationship {
  return {
    id:
      crypto.randomUUID(),

    sourceActorId,

    targetActorId,

    /**
     * Valor padrão temporário.
     *
     * Quando implementarmos formalmente Fluxo, essa decisão
     * será movida para a criação específica de fluxos.
     */
    type:
      'service',

    name:
      '',

    description:
      '',
  };
}