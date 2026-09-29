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
 * Tela principal do editor da ECOS Modeling 4.0.
 *
 * Responsabilidades:
 *
 * - montar as regiões principais do editor;
 * - recuperar o último rascunho local;
 * - realizar autosave do modelo canônico;
 * - ativar os atalhos globais;
 * - manter a interface desacoplada da persistência.
 *
 * O modelo salvo inclui:
 *
 * - metadados;
 * - atores;
 * - relações comerciais;
 * - fluxos;
 * - gateways;
 * - anotações;
 * - dados do SECO-Guide.
 *
 * Regras da notação SSN e alterações do modelo
 * permanecem no domínio/store.
 */
export function EditorPage() {
  const model =
    useEditorStore(
      (state) =>
        state.model,
    );

  const loadLocal =
    useEditorStore(
      (state) =>
        state.loadLocal,
    );

  const saveLocal =
    useEditorStore(
      (state) =>
        state.saveLocal,
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
     * loadLocal também é responsável por normalizar
     * modelos 4.0 armazenados antes da estrutura atual.
     *
     * Caso não exista rascunho, o modelo vazio criado
     * pela factory continua sendo utilizado.
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
     * Não salvamos o modelo vazio antes da tentativa
     * inicial de recuperar um rascunho existente.
     */
    if (
      !localModelReady
    ) {
      return;
    }

    /**
     * Debounce simples.
     *
     * Movimentação de elementos e edição de campos podem
     * gerar várias atualizações sucessivas.
     *
     * O modelo canônico completo é persistido após um
     * pequeno período de inatividade.
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
       * Registra os atalhos globais da aplicação.
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