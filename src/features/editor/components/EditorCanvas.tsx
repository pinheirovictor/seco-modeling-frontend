import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type NodeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react';

import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  getActorTypeDefinition,
  isActorType,
} from '../../../domain/catalogs';

import {
  ActorNode,
} from './ActorNode';

import {
  CommercialRelationshipEdge,
} from './CommercialRelationshipEdge';

import {
  EditorContextMenu,
  type EditorContext,
} from './EditorContextMenu';

import {
  useEditorStore,
} from '../store/editorStore';

import {
  toFlowEdges,
  toFlowNodes,
  type ActorFlowNode,
  type CommercialRelationshipFlowEdge,
} from '../adapters/reactFlowAdapter';

/* =========================================================
   NODE TYPES
   ========================================================= */

/**
 * Tipos de nodes atualmente renderizados pelo React Flow.
 *
 * Nesta etapa:
 *
 * - actor
 *
 * O modelo canônico já suporta:
 *
 * - annotations;
 * - gateways.
 *
 * Esses elementos serão registrados aqui quando seus
 * respectivos componentes visuais forem implementados.
 */
const nodeTypes = {
  actor:
    ActorNode,
};

/* =========================================================
   EDGE TYPES
   ========================================================= */

/**
 * Relação Comercial é representada como um edge customizado.
 *
 * A Relação Comercial:
 *
 * - conecta dois atores;
 * - não possui direção;
 * - não possui seta;
 * - utiliza linha preta sólida;
 * - pode possuir um ou mais Fluxos.
 */
const edgeTypes = {
  commercialRelationship:
    CommercialRelationshipEdge,
};

/* =========================================================
   CANVAS INTERNO
   ========================================================= */

function EditorCanvasInner() {
  /* =======================================================
     STORE
     ======================================================= */

  const model =
    useEditorStore(
      (state) =>
        state.model,
    );

  const selection =
    useEditorStore(
      (state) =>
        state.selection,
    );

  const addActor =
    useEditorStore(
      (state) =>
        state.addActor,
    );

  const moveActor =
    useEditorStore(
      (state) =>
        state.moveActor,
    );

  const addCommercialRelationship =
    useEditorStore(
      (state) =>
        state.addCommercialRelationship,
    );

  const setSelection =
    useEditorStore(
      (state) =>
        state.setSelection,
    );

  const clearSelection =
    useEditorStore(
      (state) =>
        state.clearSelection,
    );

  const selectOnlyActor =
    useEditorStore(
      (state) =>
        state.selectOnlyActor,
    );

  const selectOnlyCommercialRelationship =
    useEditorStore(
      (state) =>
        state.selectOnlyCommercialRelationship,
    );

  const beginTransaction =
    useEditorStore(
      (state) =>
        state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) =>
        state.commitTransaction,
    );

  const showNotice =
    useEditorStore(
      (state) =>
        state.showNotice,
    );

  /* =======================================================
     REACT FLOW
     ======================================================= */

  const {
    screenToFlowPosition,
  } =
    useReactFlow<
      ActorFlowNode,
      CommercialRelationshipFlowEdge
    >();

  /* =======================================================
     MENU DE CONTEXTO
     ======================================================= */

  const [
    context,
    setContext,
  ] =
    useState<
      EditorContext | null
    >(null);

  /* =======================================================
     MODELO → REACT FLOW
     ======================================================= */

  /**
   * Nesta etapa ainda renderizamos apenas atores.
   *
   * O modelo canônico já possui annotations e o adapter
   * já está preparado para convertê-las, mas a troca para
   * toEditorFlowNodes() será feita quando o AnnotationNode
   * for implementado.
   */
  const nodes =
    useMemo(
      () =>
        toFlowNodes(
          model,
          selection,
        ),
      [
        model,
        selection,
      ],
    );

  const edges =
    useMemo(
      () =>
        toFlowEdges(
          model,
          selection,
        ),
      [
        model,
        selection,
      ],
    );

  /* =======================================================
     MOVIMENTAÇÃO DOS ATORES
     ======================================================= */

  /**
   * React Flow controla a interação visual, mas a posição
   * real pertence ao modelo canônico.
   */
  const handleNodesChange =
    useCallback(
      (
        changes:
          NodeChange<
            ActorFlowNode
          >[],
      ) => {
        for (
          const change
          of changes
        ) {
          if (
            change.type ===
              'position' &&
            change.position
          ) {
            moveActor(
              change.id,
              {
                x:
                  change.position.x,

                y:
                  change.position.y,
              },
            );
          }
        }
      },
      [
        moveActor,
      ],
    );

  /* =======================================================
     CRIAÇÃO DE RELAÇÃO COMERCIAL
     ======================================================= */

  /**
   * Ao conectar dois atores pelos handles, criamos
   * uma Relação Comercial.
   *
   * IMPORTANTE:
   *
   * React Flow utiliza internamente source e target.
   * Esses campos são necessários apenas para desenhar
   * a aresta.
   *
   * No domínio SSN, a Relação Comercial NÃO possui direção.
   *
   * Portanto:
   *
   * A ───────── B
   *
   * é semanticamente equivalente a:
   *
   * B ───────── A
   *
   * A direção pertence exclusivamente aos Fluxos.
   */
  const handleConnect =
    useCallback(
      (
        connection:
          Connection,
      ) => {
        if (
          !connection.source ||
          !connection.target
        ) {
          return;
        }

        addCommercialRelationship(
          connection.source,
          connection.target,
        );
      },
      [
        addCommercialRelationship,
      ],
    );

  /* =======================================================
     SELEÇÃO
     ======================================================= */

  /**
   * Nodes atualmente selecionáveis no React Flow
   * representam atores.
   *
   * Edges selecionados representam Relações Comerciais.
   *
   * Fluxos são selecionados diretamente pelas caixas
   * P.1, S.1, F.1 e C.1 renderizadas no edge customizado.
   *
   * annotationIds permanece vazio enquanto as anotações
   * ainda não forem renderizadas no canvas.
   */
  const handleSelectionChange =
    useCallback(
      ({
        nodes:
          selectedNodes,
        edges:
          selectedEdges,
      }: OnSelectionChangeParams<
        ActorFlowNode,
        CommercialRelationshipFlowEdge
      >) => {
        setSelection(
          selectedNodes.map(
            (node) =>
              node.id,
          ),

          selectedEdges.map(
            (edge) =>
              edge.id,
          ),

          [],

          [],

          [],
        );
      },
      [
        setSelection,
      ],
    );

  /* =======================================================
     CRIAÇÃO DE ATOR POR DROP
     ======================================================= */

  const addAtScreenPosition =
    useCallback(
      (
        clientX: number,
        clientY: number,
        rawType: string,
      ) => {
        /**
         * O tipo recebido pelo DataTransfer é validado
         * antes de entrar no modelo.
         */
        if (
          !isActorType(
            rawType,
          )
        ) {
          showNotice(
            'Tipo de ator SSN inválido.',
            'error',
          );

          return;
        }

        const position =
          screenToFlowPosition({
            x:
              clientX,

            y:
              clientY,
          });

        addActor(
          rawType,
          position,
        );

        setContext(
          null,
        );
      },
      [
        addActor,
        screenToFlowPosition,
        showNotice,
      ],
    );

  /* =======================================================
     MINIMAPA
     ======================================================= */

  /**
   * O minimapa utiliza as cores semânticas definidas
   * no catálogo SSN.
   *
   * Como apenas ActorFlowNode é renderizado nesta etapa,
   * podemos acessar diretamente node.data.type.
   */
  const miniMapNodeColor =
    useCallback(
      (
        node:
          ActorFlowNode,
      ): string => {
        return getActorTypeDefinition(
          node.data.type,
        ).surface;
      },
      [],
    );

  /* =======================================================
     CONTADORES
     ======================================================= */

  const actorCount =
    model.actors.length;

  const commercialRelationshipCount =
    model
      .commercialRelationships
      .length;

  const flowCount =
    model.flows.length;

  /**
   * Incluímos annotationIds mesmo que as anotações ainda
   * não estejam visíveis no React Flow.
   *
   * Isso mantém o contador compatível com o modelo de
   * seleção canônico.
   */
  const selectedCount =
    selection.actorIds.length +
    selection
      .commercialRelationshipIds
      .length +
    selection.flowIds.length +
    selection.gatewayIds.length +
    selection.annotationIds.length;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main
      className="canvas-shell"
      aria-label="Editor visual do ecossistema"
      onDragOver={(
        event,
      ) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
          'copy';
      }}
      onDrop={(
        event,
      ) => {
        event.preventDefault();

        const actorType =
          event.dataTransfer.getData(
            'application/ecos-actor',
          );

        if (
          !actorType
        ) {
          return;
        }

        addAtScreenPosition(
          event.clientX,
          event.clientY,
          actorType,
        );
      }}
    >
      <ReactFlow<
        ActorFlowNode,
        CommercialRelationshipFlowEdge
      >
        nodes={
          nodes
        }

        edges={
          edges
        }

        nodeTypes={
          nodeTypes
        }

        edgeTypes={
          edgeTypes
        }

        /* -----------------------------------------------
           MOVIMENTAÇÃO DOS ATORES
           ----------------------------------------------- */

        onNodesChange={
          handleNodesChange
        }

        /* -----------------------------------------------
           CRIAÇÃO DA RELAÇÃO COMERCIAL
           ----------------------------------------------- */

        onConnect={
          handleConnect
        }

        isValidConnection={(
          connection,
        ) => {
          if (
            !connection.source ||
            !connection.target
          ) {
            return false;
          }

          /**
           * Não permitimos relação do ator com ele mesmo.
           *
           * A Store continua sendo responsável pela
           * validação definitiva, inclusive por impedir
           * relações comerciais duplicadas.
           */
          return (
            connection.source !==
            connection.target
          );
        }}

        /* -----------------------------------------------
           SELEÇÃO
           ----------------------------------------------- */

        onSelectionChange={
          handleSelectionChange
        }

        selectionKeyCode="Shift"

        multiSelectionKeyCode={[
          'Meta',
          'Control',
        ]}

        /* -----------------------------------------------
           CANVAS
           ----------------------------------------------- */

        onPaneClick={() => {
          clearSelection();

          setContext(
            null,
          );
        }}

        onPaneContextMenu={(
          event,
        ) => {
          event.preventDefault();

          setContext({
            kind:
              'canvas',

            x:
              event.clientX,

            y:
              event.clientY,

            flowPosition:
              screenToFlowPosition({
                x:
                  event.clientX,

                y:
                  event.clientY,
              }),
          });
        }}

        /* -----------------------------------------------
           MENU DO ATOR
           ----------------------------------------------- */

        onNodeContextMenu={(
          event,
          node,
        ) => {
          event.preventDefault();

          /**
           * Se o ator já fizer parte de uma seleção
           * múltipla, preservamos a seleção.
           *
           * Caso contrário, ele passa a ser o único
           * ator selecionado.
           */
          if (
            !selection.actorIds.includes(
              node.id,
            )
          ) {
            selectOnlyActor(
              node.id,
            );
          }

          setContext({
            kind:
              'actor',

            x:
              event.clientX,

            y:
              event.clientY,

            actorId:
              node.id,
          });
        }}

        /* -----------------------------------------------
           MENU DA RELAÇÃO COMERCIAL
           ----------------------------------------------- */

        onEdgeContextMenu={(
          event,
          edge,
        ) => {
          event.preventDefault();

          /**
           * Garante que a Relação Comercial clicada
           * esteja selecionada antes de abrir o menu.
           */
          if (
            !selection
              .commercialRelationshipIds
              .includes(
                edge.id,
              )
          ) {
            selectOnlyCommercialRelationship(
              edge.id,
            );
          }

          setContext({
            kind:
              'commercialRelationship',

            x:
              event.clientX,

            y:
              event.clientY,

            commercialRelationshipId:
              edge.id,
          });
        }}

        /* -----------------------------------------------
           HISTÓRICO DE MOVIMENTAÇÃO
           ----------------------------------------------- */

        onNodeDragStart={() => {
          beginTransaction();

          setContext(
            null,
          );
        }}

        onNodeDragStop={() => {
          commitTransaction();
        }}

        /* -----------------------------------------------
           TECLADO
           ----------------------------------------------- */

        /**
         * React Flow não deve excluir nodes ou edges
         * diretamente.
         *
         * Toda exclusão é realizada pela Store para
         * preservar:
         *
         * - modelo canônico;
         * - exclusões em cascata;
         * - Undo/Redo;
         * - Fluxos associados às relações.
         */
        deleteKeyCode={
          null
        }

        /* -----------------------------------------------
           VIEWPORT
           ----------------------------------------------- */

        fitView

        fitViewOptions={{
          padding:
            0.25,

          maxZoom:
            1.1,
        }}

        minZoom={
          0.2
        }

        maxZoom={
          2.2
        }

        /* -----------------------------------------------
           INTERAÇÃO
           ----------------------------------------------- */

        nodesDraggable

        nodesConnectable

        elementsSelectable

        panOnDrag

        zoomOnScroll

        zoomOnPinch

        zoomOnDoubleClick={
          false
        }
      >
        {/* =================================================
            FUNDO
            ================================================= */}

        <Background
          variant={
            BackgroundVariant.Dots
          }
          gap={
            24
          }
          size={
            1
          }
          color="#d8dee7"
        />

        {/* =================================================
            MINIMAPA
            ================================================= */}

        <MiniMap<ActorFlowNode>
          pannable
          zoomable
          nodeBorderRadius={
            0
          }
          nodeColor={
            miniMapNodeColor
          }
          nodeStrokeColor="#111827"
          nodeStrokeWidth={
            1
          }
          maskColor="rgba(241, 245, 249, 0.72)"
        />

        {/* =================================================
            CONTROLES
            ================================================= */}

        <Controls
          position="bottom-left"
          showInteractive={
            false
          }
        />
      </ReactFlow>

      {/* ===================================================
          AJUDA
          =================================================== */}

      <div
        className="canvas-help"
        aria-hidden="true"
      >
        <span>
          Arraste atores da paleta
        </span>

        <i />

        <span>
          Conecte dois atores para criar uma Relação Comercial
        </span>

        <i />

        <span>
          Selecione a relação para adicionar Fluxos
        </span>
      </div>

      {/* ===================================================
          STATUS DO MODELO
          =================================================== */}

      <div
        className="canvas-status"
        aria-live="polite"
      >
        <span>
          {actorCount}{' '}
          {actorCount === 1
            ? 'ator'
            : 'atores'}
        </span>

        <i />

        <span>
          {commercialRelationshipCount}{' '}
          {commercialRelationshipCount === 1
            ? 'relação comercial'
            : 'relações comerciais'}
        </span>

        <i />

        <span>
          {flowCount}{' '}
          {flowCount === 1
            ? 'fluxo'
            : 'fluxos'}
        </span>

        <i />

        <span>
          {selectedCount}{' '}
          selecionado
          {selectedCount === 1
            ? ''
            : 's'}
        </span>
      </div>

      {/* ===================================================
          MENU DE CONTEXTO
          =================================================== */}

      {context ? (
        <EditorContextMenu
          context={
            context
          }
          onClose={() => {
            setContext(
              null,
            );
          }}
        />
      ) : null}
    </main>
  );
}

/* =========================================================
   PROVIDER
   ========================================================= */

export function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <EditorCanvasInner />
    </ReactFlowProvider>
  );
}