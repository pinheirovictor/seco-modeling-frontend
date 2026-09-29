import {
  ClipboardPaste,
  Copy,
  Files,
  Plus,
  Trash2,
} from 'lucide-react';

import {
  getDirectActorTypes,
  getIndirectActorTypes,
  type ActorTypeDefinition,
} from '../../../domain/catalogs';

import type {
  Position,
} from '../../../domain/model';

import {
  useEditorStore,
} from '../store/editorStore';

/* =========================================================
   CONTEXTO
   ========================================================= */

export type EditorContext =
  | {
      kind: 'canvas';
      x: number;
      y: number;
      flowPosition: Position;
    }
  | {
      kind: 'actor';
      x: number;
      y: number;
      actorId: string;
    }
  | {
      kind: 'relationship';
      x: number;
      y: number;
      relationshipId: string;
    };

interface EditorContextMenuProps {
  context: EditorContext;
  onClose: () => void;
}

/* =========================================================
   CONSTANTES
   ========================================================= */

const MENU_WIDTH = 278;
const SCREEN_MARGIN = 8;

/* =========================================================
   COMPONENTE
   ========================================================= */

export function EditorContextMenu({
  context,
  onClose,
}: EditorContextMenuProps) {
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

  const clipboard =
    useEditorStore(
      (state) => state.clipboard,
    );

  const addActor =
    useEditorStore(
      (state) => state.addActor,
    );

  const copySelectedActors =
    useEditorStore(
      (state) => state.copySelectedActors,
    );

  const pasteClipboard =
    useEditorStore(
      (state) => state.pasteClipboard,
    );

  const duplicateSelectedActors =
    useEditorStore(
      (state) => state.duplicateSelectedActors,
    );

  const deleteSelection =
    useEditorStore(
      (state) => state.deleteSelection,
    );

  /* -------------------------------------------------------
     ATORES SSN
     ------------------------------------------------------- */

  const directActors =
    getDirectActorTypes();

  const indirectActors =
    getIndirectActorTypes();

  const companyOfInterestExists =
    model.actors.some(
      (actor) =>
        actor.type ===
        'company_of_interest',
    );

  /* -------------------------------------------------------
     POSICIONAMENTO DO MENU
     ------------------------------------------------------- */

  /**
   * O menu é reposicionado caso seja aberto próximo
   * às bordas da janela.
   */
  const estimatedHeight =
    context.kind === 'canvas'
      ? 455
      : context.kind === 'actor'
        ? 190
        : 120;

  const viewportWidth =
    typeof window !== 'undefined'
      ? window.innerWidth
      : 1280;

  const viewportHeight =
    typeof window !== 'undefined'
      ? window.innerHeight
      : 720;

  const left =
    Math.min(
      Math.max(
        context.x,
        SCREEN_MARGIN,
      ),
      Math.max(
        SCREEN_MARGIN,
        viewportWidth -
          MENU_WIDTH -
          SCREEN_MARGIN,
      ),
    );

  const top =
    Math.min(
      Math.max(
        context.y,
        SCREEN_MARGIN,
      ),
      Math.max(
        SCREEN_MARGIN,
        viewportHeight -
          estimatedHeight -
          SCREEN_MARGIN,
      ),
    );

  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */

  const closeAfter = (
    action: () => unknown,
  ) => {
    action();
    onClose();
  };

  const selectedActorCount =
    selection.actorIds.length;

  const selectedRelationshipCount =
    selection.relationshipIds.length;

  /**
   * Renderiza um tipo de ator no menu do canvas.
   */
  const renderActorOption = (
    actor: ActorTypeDefinition,
  ) => {
    const isCompanyOfInterest =
      actor.value ===
      'company_of_interest';

    const disabled =
      isCompanyOfInterest &&
      companyOfInterestExists;

    return (
      <button
        type="button"
        key={actor.value}
        disabled={disabled}
        title={
          disabled
            ? 'Já existe uma Companhia de Interesse (CoI) neste modelo.'
            : actor.description
        }
        onClick={() => {
          closeAfter(() =>
            addActor(
              actor.value,
              context.kind === 'canvas'
                ? context.flowPosition
                : {
                    x: 0,
                    y: 0,
                  },
            ),
          );
        }}
      >
        {/*
         * Pequena amostra da cor formal da notação.
         *
         * Usamos surface, pois representa a cor de
         * preenchimento do ator SSN.
         */}
        <span
          className="context-menu__color"
          style={{
            background:
              actor.surface,

            border:
              '1px solid #111827',
          }}
          aria-hidden="true"
        />

        <span>
          {actor.label}
        </span>

        <Plus
          size={14}
          aria-hidden="true"
        />
      </button>
    );
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div
      className="context-menu-layer"
      onMouseDown={onClose}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <div
        className="context-menu"
        style={{
          left,
          top,
        }}
        role="menu"
        aria-label="Menu de contexto do editor"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* =================================================
            CANVAS
            ================================================= */}

        {context.kind === 'canvas' ? (
          <>
            <div className="context-menu__title">
              Adicionar ator SSN
            </div>

            {/* ---------------------------------------------
                ATORES DIRETOS
                --------------------------------------------- */}

            <div className="context-menu__title">
              Atores diretos
            </div>

            {directActors.map(
              renderActorOption,
            )}

            {/* ---------------------------------------------
                ATORES INDIRETOS
                --------------------------------------------- */}

            <div className="context-menu__separator" />

            <div className="context-menu__title">
              Atores indiretos
            </div>

            {indirectActors.map(
              renderActorOption,
            )}

            {/* ---------------------------------------------
                COLAR
                --------------------------------------------- */}

            <div className="context-menu__separator" />

            <button
              type="button"
              disabled={!clipboard}
              onClick={() => {
                closeAfter(() =>
                  pasteClipboard(
                    context.flowPosition,
                  ),
                );
              }}
            >
              <ClipboardPaste
                size={15}
                aria-hidden="true"
              />

              <span>
                Colar aqui
              </span>

              <kbd>
                ⌘/Ctrl+V
              </kbd>
            </button>
          </>
        ) : null}

        {/* =================================================
            ATOR
            ================================================= */}

        {context.kind === 'actor' ? (
          <>
            <div className="context-menu__title">
              {selectedActorCount > 1
                ? `${selectedActorCount} atores selecionados`
                : 'Ator selecionado'}
            </div>

            <button
              type="button"
              onClick={() => {
                closeAfter(
                  copySelectedActors,
                );
              }}
            >
              <Copy
                size={15}
                aria-hidden="true"
              />

              <span>
                Copiar
              </span>

              <kbd>
                ⌘/Ctrl+C
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => {
                closeAfter(
                  duplicateSelectedActors,
                );
              }}
            >
              <Files
                size={15}
                aria-hidden="true"
              />

              <span>
                Duplicar
              </span>

              <kbd>
                ⌘/Ctrl+D
              </kbd>
            </button>

            <div className="context-menu__separator" />

            <button
              type="button"
              className="context-menu__danger"
              onClick={() => {
                closeAfter(
                  deleteSelection,
                );
              }}
            >
              <Trash2
                size={15}
                aria-hidden="true"
              />

              <span>
                {selectedActorCount > 1
                  ? 'Excluir atores'
                  : 'Excluir ator'}
              </span>

              <kbd>
                Del
              </kbd>
            </button>
          </>
        ) : null}

        {/* =================================================
            RELAÇÃO PROVISÓRIA
            ================================================= */}

        {context.kind === 'relationship' ? (
          <>
            <div className="context-menu__title">
              {selectedRelationshipCount > 1
                ? `${selectedRelationshipCount} relações selecionadas`
                : 'Relação selecionada'}
            </div>

            {/*
             * Esta opção pertence à estrutura provisória.
             *
             * Quando implementarmos Relação Comercial,
             * Fluxo e Gateways, este menu será revisado.
             */}
            <button
              type="button"
              className="context-menu__danger"
              onClick={() => {
                closeAfter(
                  deleteSelection,
                );
              }}
            >
              <Trash2
                size={15}
                aria-hidden="true"
              />

              <span>
                {selectedRelationshipCount > 1
                  ? 'Excluir relações'
                  : 'Excluir relação'}
              </span>

              <kbd>
                Del
              </kbd>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}