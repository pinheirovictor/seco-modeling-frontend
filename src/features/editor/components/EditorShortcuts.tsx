import {
  useEffect,
} from 'react';

import {
  useEditorStore,
} from '../store/editorStore';

/**
 * Verifica se o usuário está digitando em algum campo.
 *
 * Nesse caso os atalhos do editor não devem interferir
 * nas operações normais do navegador/campo.
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

/**
 * Atalhos globais do editor da ECOS Modeling.
 *
 * macOS:
 * Cmd
 *
 * Windows/Linux:
 * Ctrl
 */
export function EditorShortcuts() {
  const undo =
    useEditorStore(
      (state) => state.undo,
    );

  const redo =
    useEditorStore(
      (state) => state.redo,
    );

  const deleteSelection =
    useEditorStore(
      (state) => state.deleteSelection,
    );

  const clearSelection =
    useEditorStore(
      (state) => state.clearSelection,
    );

  const selectAllActors =
    useEditorStore(
      (state) => state.selectAllActors,
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

  const saveLocal =
    useEditorStore(
      (state) => state.saveLocal,
    );

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      /**
       * Não executamos atalhos do editor enquanto
       * o usuário estiver digitando.
       */
      if (
        isEditableTarget(
          event.target,
        )
      ) {
        return;
      }

      /**
       * Evita interferência de combinações com Alt.
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
       * Os comandos restantes exigem Ctrl ou Cmd.
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
       * Ctrl+Y continua disponível principalmente
       * para usuários Windows/Linux.
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

      if (
        key === 'c'
      ) {
        event.preventDefault();

        copySelectedActors();

        return;
      }

      /* ===================================================
         COLAR
         =================================================== */

      if (
        key === 'v'
      ) {
        event.preventDefault();

        pasteClipboard();

        return;
      }

      /* ===================================================
         DUPLICAR
         =================================================== */

      if (
        key === 'd'
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
    copySelectedActors,
    deleteSelection,
    duplicateSelectedActors,
    pasteClipboard,
    redo,
    saveLocal,
    selectAllActors,
    undo,
  ]);

  /**
   * Este componente não possui interface visual.
   */
  return null;
}