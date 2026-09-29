import {
  useEffect,
} from 'react';

import {
  useEditorStore,
} from '../store/editorStore';

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Verifica se o usuário está digitando em algum campo.
 *
 * Enquanto o foco estiver em:
 *
 * - input;
 * - textarea;
 * - select;
 * - elemento contentEditable;
 *
 * os atalhos globais do editor não devem interferir
 * nas operações normais do campo ou do navegador.
 */
function isEditableTarget(
  target: EventTarget | null,
): boolean {
  if (
    !(target instanceof HTMLElement)
  ) {
    return false;
  }

  const tagName =
    target.tagName;

  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/* =========================================================
   COMPONENTE
   ========================================================= */

/**
 * Atalhos globais do editor da ECOS Modeling.
 *
 * macOS:
 * Cmd
 *
 * Windows/Linux:
 * Ctrl
 *
 * Atalhos:
 *
 * Delete / Backspace
 *   Excluir elementos selecionados.
 *
 * Esc
 *   Limpar seleção.
 *
 * Ctrl/Cmd + Z
 *   Desfazer.
 *
 * Ctrl/Cmd + Shift + Z
 *   Refazer.
 *
 * Ctrl + Y
 *   Refazer.
 *
 * Ctrl/Cmd + C
 *   Copiar atores selecionados.
 *
 * Ctrl/Cmd + V
 *   Colar atores.
 *
 * Ctrl/Cmd + D
 *   Duplicar atores selecionados.
 *
 * Ctrl/Cmd + A
 *   Selecionar todos os atores.
 *
 * Ctrl/Cmd + S
 *   Salvar localmente.
 */
export function EditorShortcuts() {
  /* =======================================================
     ESTADO
     ======================================================= */

  const selectedActorCount =
    useEditorStore(
      (state) =>
        state.selection.actorIds.length,
    );

  const clipboard =
    useEditorStore(
      (state) =>
        state.clipboard,
    );

  /* =======================================================
     AÇÕES
     ======================================================= */

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

  const deleteSelection =
    useEditorStore(
      (state) =>
        state.deleteSelection,
    );

  const clearSelection =
    useEditorStore(
      (state) =>
        state.clearSelection,
    );

  const selectAllActors =
    useEditorStore(
      (state) =>
        state.selectAllActors,
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

  const saveLocal =
    useEditorStore(
      (state) =>
        state.saveLocal,
    );

  /* =======================================================
     ATALHOS
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      /* ---------------------------------------------------
         CAMPOS EDITÁVEIS
         --------------------------------------------------- */

      if (
        isEditableTarget(
          event.target,
        )
      ) {
        return;
      }

      /* ---------------------------------------------------
         ALT
         --------------------------------------------------- */

      /**
       * Evita conflito com atalhos do sistema operacional
       * e do navegador.
       */
      if (
        event.altKey
      ) {
        return;
      }

      const command =
        event.ctrlKey ||
        event.metaKey;

      const key =
        event.key.toLowerCase();

      /* ===================================================
         DELETE
         =================================================== */

      /**
       * deleteSelection() já conhece todos os elementos
       * atualmente suportados:
       *
       * - atores;
       * - Relações Comerciais;
       * - Fluxos;
       * - Gateways.
       */
      if (
        event.key === 'Delete' ||
        event.key === 'Backspace'
      ) {
        event.preventDefault();

        deleteSelection();

        return;
      }

      /* ===================================================
         ESCAPE
         =================================================== */

      if (
        event.key === 'Escape'
      ) {
        clearSelection();

        return;
      }

      /**
       * Os comandos abaixo exigem Ctrl ou Cmd.
       */
      if (
        !command
      ) {
        return;
      }

      /* ===================================================
         UNDO / REDO
         =================================================== */

      if (
        key === 'z'
      ) {
        event.preventDefault();

        if (
          event.shiftKey
        ) {
          redo();
        } else {
          undo();
        }

        return;
      }

      /**
       * Ctrl+Y é mantido principalmente para
       * Windows/Linux.
       */
      if (
        key === 'y'
      ) {
        event.preventDefault();

        redo();

        return;
      }

      /* ===================================================
         COPIAR
         =================================================== */

      /**
       * A operação de copiar continua orientada a atores.
       *
       * Relações Comerciais e Fluxos existentes entre
       * os atores selecionados são incluídos
       * automaticamente no clipboard pela Store.
       *
       * Se apenas uma Relação Comercial ou Fluxo estiver
       * selecionado, não interceptamos Ctrl/Cmd+C.
       */
      if (
        key === 'c' &&
        selectedActorCount > 0
      ) {
        event.preventDefault();

        copySelectedActors();

        return;
      }

      /* ===================================================
         COLAR
         =================================================== */

      /**
       * Só interceptamos o comando quando realmente existe
       * conteúdo no clipboard interno da ECOS Modeling.
       */
      if (
        key === 'v' &&
        clipboard !== null
      ) {
        event.preventDefault();

        pasteClipboard();

        return;
      }

      /* ===================================================
         DUPLICAR
         =================================================== */

      /**
       * Duplicação também continua sendo baseada
       * na seleção de atores.
       */
      if (
        key === 'd' &&
        selectedActorCount > 0
      ) {
        event.preventDefault();

        duplicateSelectedActors();

        return;
      }

      /* ===================================================
         SELECIONAR TODOS OS ATORES
         =================================================== */

      if (
        key === 'a'
      ) {
        event.preventDefault();

        selectAllActors();

        return;
      }

      /* ===================================================
         SALVAR
         =================================================== */

      if (
        key === 's'
      ) {
        event.preventDefault();

        saveLocal(
          false,
        );
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    clearSelection,
    clipboard,
    copySelectedActors,
    deleteSelection,
    duplicateSelectedActors,
    pasteClipboard,
    redo,
    saveLocal,
    selectAllActors,
    selectedActorCount,
    undo,
  ]);

  /**
   * Componente comportamental.
   *
   * Não possui representação visual.
   */
  return null;
}