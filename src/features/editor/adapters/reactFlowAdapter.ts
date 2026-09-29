import {
  MarkerType,
  type Edge,
  type Node,
} from '@xyflow/react';

import {
  relationshipTypeLabel,
} from '../../../domain/catalogs';

import type {
  ActorType,
  EcosystemModel,
  EditorSelection,
} from '../../../domain/model';

import {
  getDuplicateActorIds,
} from '../../../domain/validation';

/* =========================================================
   NODE DATA
   ========================================================= */

/**
 * Dados visuais enviados para o ActorNode.
 *
 * Importante:
 *
 * Esta estrutura NÃO é o modelo do ator.
 *
 * O modelo canônico continua sendo Actor, definido em
 * domain/model.ts.
 *
 * ActorNodeData contém apenas as informações necessárias
 * para renderizar o ator dentro do React Flow.
 */
export interface ActorNodeData
  extends Record<string, unknown> {
  /**
   * Nome do ator no ecossistema.
   */
  name: string;

  /**
   * Tipo SSN.
   *
   * Ex.:
   * - company_of_interest
   * - supplier
   * - customer
   * - intermediary
   * - customer_of_customer
   * - aggregator
   */
  type: ActorType;

  /**
   * Indica se o nome deste ator também está sendo
   * utilizado por outro ator do mesmo modelo.
   *
   * Essa informação é calculada pelo mecanismo de
   * validação do domínio e apenas repassada ao componente.
   */
  duplicateName: boolean;
}

/**
 * Tipo utilizado pelo React Flow para representar um ator.
 */
export type ActorFlowNode =
  Node<
    ActorNodeData,
    'actor'
  >;

/* =========================================================
   MODEL → REACT FLOW NODES
   ========================================================= */

/**
 * Converte os atores do modelo canônico em nodes
 * utilizados pelo React Flow.
 *
 * Fluxo:
 *
 * EcosystemModel
 *      ↓
 * Actor[]
 *      ↓
 * toFlowNodes()
 *      ↓
 * React Flow Node[]
 *
 * O React Flow nunca altera diretamente a estrutura
 * conceitual do modelo SSN.
 */
export function toFlowNodes(
  model: EcosystemModel,
  selection: EditorSelection,
): ActorFlowNode[] {
  /**
   * Calculamos a validação uma única vez para todo
   * o conjunto de atores.
   */
  const duplicateActorIds =
    getDuplicateActorIds(model);

  /**
   * Set melhora as consultas de seleção quando o modelo
   * possuir muitos atores.
   */
  const selectedActorIds =
    new Set(
      selection.actorIds,
    );

  return model.actors.map(
    (actor): ActorFlowNode => ({
      id:
        actor.id,

      /**
       * Deve corresponder ao nodeTypes definido no
       * EditorCanvas.
       */
      type:
        'actor',

      /**
       * A posição visual pertence ao modelo canônico
       * para que seja preservada no salvamento,
       * importação/exportação e versionamento.
       */
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
   MODEL → REACT FLOW EDGES
   ========================================================= */

/**
 * Converte as conexões provisórias do modelo em edges
 * do React Flow.
 *
 * IMPORTANTE:
 *
 * A estrutura atual de Relationship ainda NÃO representa
 * completamente a notação SSN.
 *
 * Posteriormente iremos separar formalmente:
 *
 * - Relação Comercial;
 * - Fluxo;
 * - OU Gateway;
 * - XOU Gateway.
 *
 * Portanto, a renderização abaixo é temporária e serve
 * apenas para manter funcional o editor durante a
 * implementação dos atores.
 */
export function toFlowEdges(
  model: EcosystemModel,
  selection: EditorSelection,
): Edge[] {
  const selectedRelationshipIds =
    new Set(
      selection.relationshipIds,
    );

  return model.relationships.map(
    (relationship): Edge => {
      const label =
        relationship.name.trim() ||
        relationshipTypeLabel(
          relationship.type,
        );

      return {
        id:
          relationship.id,

        source:
          relationship.sourceActorId,

        target:
          relationship.targetActorId,

        selected:
          selectedRelationshipIds.has(
            relationship.id,
          ),

        /**
         * Este label ainda representa provisoriamente
         * o tipo da conexão.
         */
        label,

        /**
         * smoothstep facilita a leitura enquanto ainda
         * estamos trabalhando com a estrutura provisória.
         *
         * A geometria definitiva será definida junto
         * com Relação Comercial e Fluxo.
         */
        type:
          'smoothstep',

        /**
         * Marcador provisório.
         *
         * A Relação Comercial formal da SSN será
         * representada posteriormente como linha preta
         * sólida, enquanto a direção pertence ao Fluxo.
         */
        markerEnd: {
          type:
            MarkerType.ArrowClosed,

          width:
            15,

          height:
            15,
        },

        style: {
          strokeWidth:
            1.7,

          stroke:
            '#475569',
        },

        labelStyle: {
          fontSize:
            10,

          fontWeight:
            700,

          fill:
            '#334155',
        },

        labelBgStyle: {
          fill:
            '#ffffff',

          fillOpacity:
            0.95,
        },

        labelBgPadding:
          [7, 4],

        labelBgBorderRadius:
          5,
      };
    },
  );
}