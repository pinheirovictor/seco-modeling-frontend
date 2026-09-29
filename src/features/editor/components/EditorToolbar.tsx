import {
  ClipboardPaste,
  Copy,
  Download,
  Files,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react';

import {
  useEditorStore,
} from '../store/editorStore';

/**
 * Barra superior principal do editor da ECOS Modeling.
 *
 * Responsabilidades:
 *
 * - identificação da ferramenta;
 * - edição do nome do modelo;
 * - Undo/Redo;
 * - copiar/colar/duplicar atores;
 * - exclusão de elementos;
 * - criação de novo modelo;
 * - exportação;
 * - salvamento local.
 *
 * A Toolbar não contém regras da notação SSN.
 * Essas regras permanecem no domínio/store.
 */
export function EditorToolbar() {
  /* =======================================================
     ESTADO
     ======================================================= */

  const model =
    useEditorStore(
      (state) =>
        state.model,
    );

  const past =
    useEditorStore(
      (state) =>
        state.past,
    );

  const future =
    useEditorStore(
      (state) =>
        state.future,
    );

  const selection =
    useEditorStore(
      (state) =>
        state.selection,
    );

  const clipboard =
    useEditorStore(
      (state) =>
        state.clipboard,
    );

  /* =======================================================
     AÇÕES
     ======================================================= */

  const setModelName =
    useEditorStore(
      (state) =>
        state.setModelName,
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

  const undo =
    useEditorStore(
      (state) =>
        state.undo,
    );

  const redo =
    useEditorStore(
      (state) =>
        state.redo,
    );

  const copySelectedActors =
    useEditorStore(
      (state) =>
        state.copySelectedActors,
    );

  const pasteClipboard =
    useEditorStore(
      (state) =>
        state.pasteClipboard,
    );

  const duplicateSelectedActors =
    useEditorStore(
      (state) =>
        state.duplicateSelectedActors,
    );

  const deleteSelection =
    useEditorStore(
      (state) =>
        state.deleteSelection,
    );

  const saveLocal =
    useEditorStore(
      (state) =>
        state.saveLocal,
    );

  const resetModel =
    useEditorStore(
      (state) =>
        state.resetModel,
    );

  const exportJson =
    useEditorStore(
      (state) =>
        state.exportJson,
    );

  /* =======================================================
     ESTADO DERIVADO
     ======================================================= */

  const selectedActorCount =
    selection.actorIds.length;

  const selectedCommercialRelationshipCount =
    selection
      .commercialRelationshipIds
      .length;

  const selectedFlowCount =
    selection.flowIds.length;

  const selectedGatewayCount =
    selection.gatewayIds.length;

  const totalSelected =
    selectedActorCount +
    selectedCommercialRelationshipCount +
    selectedFlowCount +
    selectedGatewayCount;

  /**
   * Copiar e duplicar continuam sendo operações
   * baseadas em atores.
   *
   * Relações Comerciais e Fluxos internos entre os
   * atores selecionados são preservados automaticamente
   * pela Store.
   */
  const hasActorsSelected =
    selectedActorCount > 0;

  const canUndo =
    past.length > 0;

  const canRedo =
    future.length > 0;

  const canPaste =
    clipboard !== null;

  const canDelete =
    totalSelected > 0;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <header
      className="toolbar"
      aria-label="Barra de ferramentas do editor"
    >
      {/* ===================================================
          MARCA
          =================================================== */}

      <div className="brand">
        <div
          className="brand__mark"
          aria-hidden="true"
        >
          E
        </div>

        <div>
          <strong>
            ECOS Modeling
          </strong>

          <span>
            4.0 · Editor SSN
          </span>
        </div>
      </div>

      {/* ===================================================
          MODELO
          =================================================== */}

      <div className="model-title">
        <span>
          Modelo
        </span>

        <input
          type="text"
          value={
            model.name
          }
          aria-label="Nome do modelo"
          placeholder="Nome do ecossistema"
          autoComplete="off"
          onFocus={() => {
            beginTransaction();
          }}
          onBlur={() => {
            commitTransaction();
          }}
          onChange={(event) => {
            setModelName(
              event.target.value,
              false,
            );
          }}
        />
      </div>

      {/* ===================================================
          AÇÕES
          =================================================== */}

      <div
        className="toolbar__actions"
        role="toolbar"
        aria-label="Ações do modelo"
      >
        {/* -------------------------------------------------
            HISTÓRICO
            ------------------------------------------------- */}

        <button
          type="button"
          title="Desfazer (⌘/Ctrl+Z)"
          aria-label="Desfazer"
          disabled={
            !canUndo
          }
          onClick={
            undo
          }
        >
          <Undo2
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          title="Refazer (⌘/Ctrl+Shift+Z)"
          aria-label="Refazer"
          disabled={
            !canRedo
          }
          onClick={
            redo
          }
        >
          <Redo2
            size={17}
            aria-hidden="true"
          />
        </button>

        <div
          className="toolbar__divider"
          aria-hidden="true"
        />

        {/* -------------------------------------------------
            CLIPBOARD / SELEÇÃO
            ------------------------------------------------- */}

        <button
          type="button"
          title={
            hasActorsSelected
              ? selectedActorCount === 1
                ? 'Copiar ator (⌘/Ctrl+C)'
                : `Copiar ${selectedActorCount} atores (⌘/Ctrl+C)`
              : 'Selecione pelo menos um ator para copiar'
          }
          aria-label="Copiar atores selecionados"
          disabled={
            !hasActorsSelected
          }
          onClick={
            copySelectedActors
          }
        >
          <Copy
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          title={
            canPaste
              ? 'Colar atores (⌘/Ctrl+V)'
              : 'Nenhum ator copiado'
          }
          aria-label="Colar atores"
          disabled={
            !canPaste
          }
          onClick={() => {
            pasteClipboard();
          }}
        >
          <ClipboardPaste
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          title={
            hasActorsSelected
              ? selectedActorCount === 1
                ? 'Duplicar ator (⌘/Ctrl+D)'
                : `Duplicar ${selectedActorCount} atores (⌘/Ctrl+D)`
              : 'Selecione pelo menos um ator para duplicar'
          }
          aria-label="Duplicar atores selecionados"
          disabled={
            !hasActorsSelected
          }
          onClick={
            duplicateSelectedActors
          }
        >
          <Files
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          title={
            canDelete
              ? totalSelected === 1
                ? 'Excluir elemento selecionado'
                : `Excluir ${totalSelected} elementos selecionados`
              : 'Nenhum elemento selecionado'
          }
          aria-label="Excluir elementos selecionados"
          disabled={
            !canDelete
          }
          onClick={
            deleteSelection
          }
        >
          <Trash2
            size={17}
            aria-hidden="true"
          />
        </button>

        <div
          className="toolbar__divider"
          aria-hidden="true"
        />

        {/* -------------------------------------------------
            MODELO
            ------------------------------------------------- */}

        <button
          type="button"
          title="Criar novo modelo"
          aria-label="Criar novo modelo"
          onClick={
            resetModel
          }
        >
          <RotateCcw
            size={17}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          title="Exportar modelo em JSON"
          aria-label="Exportar modelo em JSON"
          onClick={
            exportJson
          }
        >
          <Download
            size={17}
            aria-hidden="true"
          />
        </button>

        {/* -------------------------------------------------
            SALVAMENTO
            ------------------------------------------------- */}

        <button
          type="button"
          className="button-primary"
          title="Salvar modelo localmente"
          onClick={() => {
            saveLocal(
              false,
            );
          }}
        >
          <Save
            size={17}
            aria-hidden="true"
          />

          <span>
            Salvar
          </span>
        </button>
      </div>
    </header>
  );
}