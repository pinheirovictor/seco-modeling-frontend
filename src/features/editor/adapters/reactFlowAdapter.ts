import {
  type Edge,
  type Node,
} from '@xyflow/react';

import {
  formatFlowCode,
} from '../../../domain/catalogs';

import type {
  ActorType,
  EcosystemModel,
  EditorSelection,
  FlowType,
} from '../../../domain/model';

import {
  getDuplicateActorIds,
} from '../../../domain/validation';

/* =========================================================
   ACTOR NODE DATA
   ========================================================= */

/**
 * Dados enviados ao componente visual ActorNode.
 *
 * Esta estrutura pertence apenas à camada de adaptação
 * para o React Flow.
 *
 * O modelo canônico continua sendo Actor.
 */
export interface ActorNodeData
  extends Record<string, unknown> {
  name: string;

  type: ActorType;

  duplicateName: boolean;
}

/**
 * Node do React Flow utilizado para representar
 * um ator SSN.
 */
export type ActorFlowNode =
  Node<
    ActorNodeData,
    'actor'
  >;

/* =========================================================
   FLOW VISUAL DATA
   ========================================================= */

/**
 * Representação de um Fluxo utilizada exclusivamente
 * pelo componente visual da Relação Comercial.
 *
 * Exemplo:
 *
 * {
 *   id: '...',
 *   code: 'P.1',
 *   type: 'product',
 *   ...
 * }
 */
export interface CommercialRelationshipFlowData {
  /**
   * ID real do Fluxo no modelo canônico.
   */
  id: string;

  /**
   * Código apresentado no diagrama.
   *
   * Exemplos:
   *
   * P.1
   * S.1
   * F.1
   * C.1
   */
  code: string;

  /**
   * Tipo do Fluxo.
   */
  type: FlowType;

  /**
   * Identificador numérico.
   */
  identifier: number;

  /**
   * Nome semântico opcional.
   */
  name: string;

  /**
   * Origem do Fluxo.
   *
   * A direção existe no Fluxo, não na Relação Comercial.
   */
  sourceActorId: string;

  /**
   * Destino do Fluxo.
   */
  targetActorId: string;

  /**
   * Indica se o Fluxo está selecionado no editor.
   */
  selected: boolean;
}

/* =========================================================
   COMMERCIAL RELATIONSHIP EDGE DATA
   ========================================================= */

/**
 * Dados fornecidos ao componente visual da
 * Relação Comercial.
 *
 * A Relação Comercial é representada no React Flow
 * como um edge, porém sua semântica permanece no
 * modelo canônico.
 */
export interface CommercialRelationshipEdgeData
  extends Record<string, unknown> {
  /**
   * ID da Relação Comercial no modelo.
   */
  relationshipId: string;

  /**
   * Primeiro ator participante.
   *
   * Não significa origem.
   */
  actorAId: string;

  /**
   * Segundo ator participante.
   *
   * Não significa destino.
   */
  actorBId: string;

  /**
   * Descrição da relação.
   */
  description: string;

  /**
   * Fluxos pertencentes à Relação Comercial.
   */
  flows: CommercialRelationshipFlowData[];
}

/**
 * Edge específico da Relação Comercial.
 *
 * O tipo "commercialRelationship" será associado
 * posteriormente a um componente customizado do React Flow.
 */
export type CommercialRelationshipFlowEdge =
  Edge<
    CommercialRelationshipEdgeData,
    'commercialRelationship'
  >;

/* =========================================================
   MODEL → REACT FLOW NODES
   ========================================================= */

/**
 * Converte atores do modelo canônico em nodes
 * do React Flow.
 */
export function toFlowNodes(
  model: EcosystemModel,
  selection: EditorSelection,
): ActorFlowNode[] {
  const duplicateActorIds =
    getDuplicateActorIds(
      model,
    );

  const selectedActorIds =
    new Set(
      selection.actorIds,
    );

  return model.actors.map(
    (actor): ActorFlowNode => ({
      id:
        actor.id,

      type:
        'actor',

      position: {
        x:
          actor.position.x,

        y:
          actor.position.y,
      },

      selected:
        selectedActorIds.has(
          actor.id,
        ),

      data: {
        name:
          actor.name,

        type:
          actor.type,

        duplicateName:
          duplicateActorIds.has(
            actor.id,
          ),
      },
    }),
  );
}

/* =========================================================
   MODEL → COMMERCIAL RELATIONSHIP EDGES
   ========================================================= */

/**
 * Converte Relações Comerciais do modelo canônico
 * para edges do React Flow.
 *
 * IMPORTANTE:
 *
 * Uma Relação Comercial:
 *
 * - conecta dois atores;
 * - NÃO possui direção;
 * - NÃO possui seta;
 * - é representada por linha preta sólida;
 * - pode possuir um ou mais Fluxos.
 *
 *
 * Exemplo:
 *
 * Fornecedor ───────── [ P.1 ] ───────── CoI
 *
 *
 * O edge representa a linha.
 *
 * Os Fluxos são entregues através de edge.data.flows
 * para que o componente visual desenhe as caixas.
 */
export function toFlowEdges(
  model: EcosystemModel,
  selection: EditorSelection,
): CommercialRelationshipFlowEdge[] {
  const selectedRelationshipIds =
    new Set(
      selection.commercialRelationshipIds,
    );

  const selectedFlowIds =
    new Set(
      selection.flowIds,
    );

  /**
   * Agrupa os Fluxos por Relação Comercial.
   *
   * Isso evita executar filter() para cada relação.
   */
  const flowsByRelationship =
    new Map<
      string,
      CommercialRelationshipFlowData[]
    >();

  for (
    const flow
    of model.flows
  ) {
    const visualFlow:
      CommercialRelationshipFlowData = {
      id:
        flow.id,

      code:
        formatFlowCode(
          flow.type,
          flow.identifier,
        ),

      type:
        flow.type,

      identifier:
        flow.identifier,

      name:
        flow.name,

      sourceActorId:
        flow.sourceActorId,

      targetActorId:
        flow.targetActorId,

      selected:
        selectedFlowIds.has(
          flow.id,
        ),
    };

    const current =
      flowsByRelationship.get(
        flow.commercialRelationshipId,
      ) ?? [];

    current.push(
      visualFlow,
    );

    flowsByRelationship.set(
      flow.commercialRelationshipId,
      current,
    );
  }

  /**
   * Mantém os Fluxos em uma ordem previsível.
   *
   * Primeiro pelo tipo e depois pelo identificador.
   *
   * Isso será importante quando houver vários Fluxos
   * na mesma Relação Comercial.
   */
  for (
    const flows
    of flowsByRelationship.values()
  ) {
    flows.sort(
      (first, second) => {
        const typeComparison =
          first.type.localeCompare(
            second.type,
          );

        if (
          typeComparison !== 0
        ) {
          return typeComparison;
        }

        return (
          first.identifier -
          second.identifier
        );
      },
    );
  }

  return model.commercialRelationships.map(
    (
      relationship,
    ): CommercialRelationshipFlowEdge => ({
      id:
        relationship.id,

      /**
       * React Flow exige source e target para desenhar
       * uma aresta.
       *
       * Aqui source/target NÃO têm significado semântico
       * de direção.
       *
       * Eles representam apenas os dois extremos da
       * Relação Comercial.
       */
      source:
        relationship.actorAId,

      target:
        relationship.actorBId,

      /**
       * Componente customizado que criaremos para
       * representar a Relação Comercial.
       */
      type:
        'commercialRelationship',

      selected:
        selectedRelationshipIds.has(
          relationship.id,
        ),

      /**
       * Relação Comercial não possui arrow marker.
       *
      
     
       */

      data: {
        relationshipId:
          relationship.id,

        actorAId:
          relationship.actorAId,

        actorBId:
          relationship.actorBId,

        description:
          relationship.description,

        flows:
          flowsByRelationship.get(
            relationship.id,
          ) ?? [],
      },
    }),
  );
}