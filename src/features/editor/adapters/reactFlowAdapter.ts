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
  /**
   * Nome concreto do ator.
   */
  name: string;

  /**
   * Tipo SSN do ator.
   */
  type: ActorType;

  /**
   * Indica se existe outro ator com o mesmo nome
   * dentro do modelo.
   */
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
   ANNOTATION NODE DATA
   ========================================================= */

/**
 * Dados enviados ao futuro componente visual
 * AnnotationNode.
 *
 * A anotação é apenas um recurso de apoio visual
 * e documental.
 *
 * Ela não possui semântica SSN e não participa
 * das métricas estruturais do ecossistema.
 */
export interface AnnotationNodeData
  extends Record<string, unknown> {
  /**
   * Texto apresentado no canvas.
   */
  text: string;
}

/**
 * Node do React Flow utilizado para representar
 * uma anotação textual.
 */
export type AnnotationFlowNode =
  Node<
    AnnotationNodeData,
    'annotation'
  >;

/**
 * União dos nodes atualmente conhecidos pelo editor.
 *
 * Gateways poderão ser adicionados posteriormente
 * sem alterar o modelo canônico.
 */
export type EditorFlowNode =
  | ActorFlowNode
  | AnnotationFlowNode;

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
 */
export type CommercialRelationshipFlowEdge =
  Edge<
    CommercialRelationshipEdgeData,
    'commercialRelationship'
  >;

/* =========================================================
   MODEL → ACTOR NODES
   ========================================================= */

/**
 * Converte atores do modelo canônico em nodes
 * do React Flow.
 *
 * Esta função continua retornando exclusivamente atores
 * para manter compatibilidade com o EditorCanvas atual.
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
    (
      actor,
    ): ActorFlowNode => ({
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
   MODEL → ANNOTATION NODES
   ========================================================= */

/**
 * Converte anotações do modelo canônico em nodes
 * do React Flow.
 *
 * A renderização visual será feita posteriormente
 * através de um AnnotationNode customizado.
 */
export function toAnnotationFlowNodes(
  model: EcosystemModel,
  selection: EditorSelection,
): AnnotationFlowNode[] {
  const selectedAnnotationIds =
    new Set(
      selection.annotationIds,
    );

  return model.annotations.map(
    (
      annotation,
    ): AnnotationFlowNode => ({
      id:
        annotation.id,

      type:
        'annotation',

      position: {
        x:
          annotation.position.x,

        y:
          annotation.position.y,
      },

      selected:
        selectedAnnotationIds.has(
          annotation.id,
        ),

      data: {
        text:
          annotation.text,
      },
    }),
  );
}

/* =========================================================
   MODEL → ALL EDITOR NODES
   ========================================================= */

/**
 * Converte todos os elementos representados como nodes
 * no React Flow.
 *
 * Atualmente:
 *
 * - Atores;
 * - Anotações.
 *
 * Gateways poderão ser incorporados aqui posteriormente.
 */
export function toEditorFlowNodes(
  model: EcosystemModel,
  selection: EditorSelection,
): EditorFlowNode[] {
  return [
    ...toFlowNodes(
      model,
      selection,
    ),

    ...toAnnotationFlowNodes(
      model,
      selection,
    ),
  ];
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
   * Isso é importante quando existem vários Fluxos
   * na mesma Relação Comercial.
   */
  for (
    const flows
    of flowsByRelationship.values()
  ) {
    flows.sort(
      (
        first,
        second,
      ) => {
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
       * Aqui source/target NÃO possuem significado
       * semântico de direção.
       *
       * Eles representam apenas os dois extremos da
       * Relação Comercial.
       */
      source:
        relationship.actorAId,

      target:
        relationship.actorBId,

      /**
       * Componente customizado responsável por
       * representar a Relação Comercial.
       */
      type:
        'commercialRelationship',

      selected:
        selectedRelationshipIds.has(
          relationship.id,
        ),

      /**
       * Não utilizamos markerStart ou markerEnd.
       *
       * A Relação Comercial SSN não possui direção.
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