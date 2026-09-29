import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
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
} from '../adapters/reactFlowAdapter';

/* =========================================================
   NODE TYPES
   ========================================================= */

/**
 * Tipos visuais reconhecidos pelo React Flow.
 *
 * Nesta etapa temos apenas atores SSN.
 *
 * Posteriormente poderão existir também:
 *
 * - Fluxo;
 * - OU Gateway;
 * - XOU Gateway;
 *
 * Relação Comercial provavelmente continuará sendo
 * representada como edge.
 */
const nodeTypes = {
  actor: ActorNode,
};

/* =========================================================
   CANVAS INTERNO
   ========================================================= */

function EditorCanvasInner() {
  /* -------------------------------------------------------
     STORE
     ------------------------------------------------------- */

  const model =
    useEditorStore(
      (state) => state.model,
    );

  const selection =
    useEditorStore(
      (state) => state.selection,
    );

  const addActor =
    useEditorStore(
      (state) => state.addActor,
    );

  const moveActor =
    useEditorStore(
      (state) => state.moveActor,
    );

  const addRelationship =
    useEditorStore(
      (state) => state.addRelationship,
    );

  const setSelection =
    useEditorStore(
      (state) => state.setSelection,
    );

  const clearSelection =
    useEditorStore(
      (state) => state.clearSelection,
    );

  const selectOnlyActor =
    useEditorStore(
      (state) => state.selectOnlyActor,
    );

  const selectOnlyRelationship =
    useEditorStore(
      (state) =>
        state.selectOnlyRelationship,
    );

  const beginTransaction =
    useEditorStore(
      (state) => state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) => state.commitTransaction,
    );

  const showNotice =
    useEditorStore(
      (state) => state.showNotice,
    );

  /* -------------------------------------------------------
     REACT FLOW
     ------------------------------------------------------- */

  const {
    screenToFlowPosition,
  } =
    useReactFlow<ActorFlowNode>();

  /* -------------------------------------------------------
     MENU DE CONTEXTO
     ------------------------------------------------------- */

  const [
    context,
    setContext,
  ] =
    useState<EditorContext | null>(
      null,
    );

  /* -------------------------------------------------------
     MODEL → REACT FLOW
     ------------------------------------------------------- */

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
   * O React Flow informa mudanças visuais nos nodes.
   *
   * Como a posição pertence ao modelo canônico,
   * qualquer movimentação precisa ser refletida
   * no Actor correspondente.
   */
  const handleNodesChange =
    useCallback(
      (
        changes:
          NodeChange<ActorFlowNode>[],
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
     CONEXÕES
     ======================================================= */

  /**
   * Estrutura provisória da Sprint 1.
   *
   * Atualmente conectar dois handles cria um Relationship.
   *
   * Quando implementarmos formalmente a notação SSN,
   * iremos distinguir:
   *
   * - Relação Comercial;
   * - Fluxo;
   * - OU Gateway;
   * - XOU Gateway.
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

        addRelationship(
          connection.source,
          connection.target,
        );
      },
      [
        addRelationship,
      ],
    );

  /* =======================================================
     SELEÇÃO
     ======================================================= */

  const handleSelectionChange =
    useCallback(
      ({
        nodes:
          selectedNodes,
        edges:
          selectedEdges,
      }: OnSelectionChangeParams) => {
        setSelection(
          selectedNodes.map(
            (node) =>
              node.id,
          ),

          selectedEdges.map(
            (edge) =>
              edge.id,
          ),
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
         * Nunca confiamos diretamente no conteúdo
         * recebido pelo DataTransfer.
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
            x: clientX,
            y: clientY,
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
   * O minimapa utiliza as mesmas cores semânticas
   * definidas pela notação SSN.
   */
  const miniMapNodeColor =
    useCallback(
      (
        node:
          ActorFlowNode,
      ) => {
        return getActorTypeDefinition(
          node.data.type,
        ).surface;
      },
      [],
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main
      className="canvas-shell"
      aria-label="Editor visual do ecossistema"
      onDragOver={(event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
          'copy';
      }}
      onDrop={(event) => {
        event.preventDefault();

        const actorType =
          event.dataTransfer.getData(
            'application/ecos-actor',
          );

        if (!actorType) {
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
        Edge
      >
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}

        /* -----------------------------------------------
           ALTERAÇÕES DOS ATORES
           ----------------------------------------------- */
        onNodesChange={
          handleNodesChange
        }

        /* -----------------------------------------------
           CONEXÕES
           ----------------------------------------------- */
        onConnect={
          handleConnect
        }

        isValidConnection={(
          connection,
        ) =>
          Boolean(
            connection.source &&
              connection.target &&
              connection.source !==
                connection.target,
          )
        }

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
           * Se o ator já faz parte de uma seleção múltipla,
           * preservamos essa seleção.
           *
           * Caso contrário, ele passa a ser o único
           * elemento selecionado.
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
           MENU DA RELAÇÃO
           ----------------------------------------------- */
        onEdgeContextMenu={(
          event,
          edge,
        ) => {
          event.preventDefault();

          if (
            !selection.relationshipIds.includes(
              edge.id,
            )
          ) {
            selectOnlyRelationship(
              edge.id,
            );
          }

          setContext({
            kind:
              'relationship',

            x:
              event.clientX,

            y:
              event.clientY,

            relationshipId:
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
         * Exclusão é controlada pelo EditorToolbar /
         * atalhos próprios da aplicação.
         *
         * Isso evita que React Flow altere visualmente
         * nodes sem atualizar o modelo canônico.
         */
        deleteKeyCode={null}

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
           EXPERIÊNCIA DE USO
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
          gap={24}
          size={1}
          color="#d8dee7"
        />

        {/* =================================================
            MINIMAPA
            ================================================= */}

        <MiniMap
          pannable
          zoomable
          nodeBorderRadius={0}
          nodeColor={
            miniMapNodeColor
          }
          nodeStrokeColor="#111827"
          nodeStrokeWidth={1}
          maskColor="rgba(241, 245, 249, 0.72)"
        />

        {/* =================================================
            CONTROLES
            ================================================= */}

        <Controls
          position="bottom-left"
          showInteractive={false}
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
          Conecte pelos pontos laterais
        </span>

        <i />

        <span>
          Botão direito abre o menu
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
          {model.actors.length}{' '}
          {model.actors.length === 1
            ? 'ator'
            : 'atores'}
        </span>

        <i />

        <span>
          {model.relationships.length}{' '}
          {model.relationships.length === 1
            ? 'relação'
            : 'relações'}
        </span>

        <i />

        <span>
          {selection.actorIds.length +
            selection.relationshipIds.length}{' '}
          selecionado
          {selection.actorIds.length +
            selection.relationshipIds.length ===
          1
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
          onClose={() =>
            setContext(
              null,
            )
          }
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