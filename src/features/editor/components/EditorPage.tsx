import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  EditorCanvas,
} from './EditorCanvas';

import {
  EditorNotice,
} from './EditorNotice';

import {
  EditorShortcuts,
} from './EditorShortcuts';

import {
  EditorToolbar,
} from './EditorToolbar';

import {
  ElementPalette,
} from './ElementPalette';

import {
  PropertiesPanel,
} from './PropertiesPanel';

import {
  useEditorStore,
} from '../store/editorStore';

/**
 * Tela principal do editor da ECOS Modeling.
 *
 * Responsabilidades:
 *
 * - montar as regiões principais do editor;
 * - tentar recuperar o último rascunho local;
 * - realizar autosave;
 * - ativar os atalhos globais.
 *
 * Regras da notação SSN permanecem no domínio/store.
 */
export function EditorPage() {
  const model =
    useEditorStore(
      (state) => state.model,
    );

  const loadLocal =
    useEditorStore(
      (state) => state.loadLocal,
    );

  const saveLocal =
    useEditorStore(
      (state) => state.saveLocal,
    );

  /**
   * Evita que o autosave execute antes de terminarmos
   * a tentativa inicial de recuperar o rascunho.
   */
  const [
    localModelReady,
    setLocalModelReady,
  ] =
    useState(false);

  /**
   * Evita repetir a inicialização durante ciclos extras
   * de efeitos no ambiente de desenvolvimento.
   */
  const initializationStarted =
    useRef(false);

  /* =======================================================
     CARREGAMENTO INICIAL
     ======================================================= */

  useEffect(() => {
    if (
      initializationStarted.current
    ) {
      return;
    }

    initializationStarted.current =
      true;

    /**
     * loadLocal retorna false quando:
     *
     * - não existe rascunho;
     * - o rascunho é inválido;
     * - ocorreu erro de leitura.
     *
     * Em qualquer desses casos podemos continuar
     * utilizando o modelo vazio criado pela factory.
     */
    loadLocal();

    setLocalModelReady(
      true,
    );
  }, [
    loadLocal,
  ]);

  /* =======================================================
     AUTOSAVE
     ======================================================= */

  useEffect(() => {
    /**
     * Muito importante:
     *
     * não salvamos o modelo vazio antes de tentar carregar
     * um rascunho existente.
     */
    if (
      !localModelReady
    ) {
      return;
    }

    /**
     * Debounce simples.
     *
     * Movimentar um ator ou digitar um texto pode gerar
     * várias atualizações sucessivas. Esperamos um pequeno
     * período de inatividade antes de persistir.
     */
    const timeout =
      window.setTimeout(
        () => {
          saveLocal(
            true,
          );
        },
        650,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    localModelReady,
    model,
    saveLocal,
  ]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="app-shell">
      {/*
       * Componente sem interface visual.
       *
       * Apenas registra os atalhos globais da aplicação.
       */}
      <EditorShortcuts />

      <EditorToolbar />

      <div className="editor-layout">
        <ElementPalette />

        <EditorCanvas />

        <PropertiesPanel />
      </div>

      <EditorNotice />
    </div>
  );
}