import {
  useEffect,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';

import {
  useEditorStore,
} from '../store/editorStore';

/**
 * Notificação temporária do editor.
 *
 * Utilizada para:
 *
 * - sucesso;
 * - informação;
 * - aviso;
 * - erro.
 *
 * As mensagens são geradas pelo domínio/store e
 * apresentadas aqui sem conter regras de negócio.
 */
export function EditorNotice() {
  const notice =
    useEditorStore(
      (state) => state.notice,
    );

  const clearNotice =
    useEditorStore(
      (state) => state.clearNotice,
    );

  /* =======================================================
     FECHAMENTO AUTOMÁTICO
     ======================================================= */

  useEffect(() => {
    if (!notice) {
      return;
    }

    /**
     * Erros e avisos permanecem um pouco mais na tela
     * para permitir leitura adequada.
     */
    const duration =
      notice.tone === 'error' ||
      notice.tone === 'warning'
        ? 4500
        : 3000;

    const timeout =
      window.setTimeout(
        () => {
          clearNotice();
        },
        duration,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    notice,
    clearNotice,
  ]);

  if (!notice) {
    return null;
  }

  /* =======================================================
     ÍCONE
     ======================================================= */

  const Icon =
    notice.tone === 'success'
      ? CheckCircle2
      : notice.tone === 'warning'
        ? AlertTriangle
        : notice.tone === 'error'
          ? XCircle
          : Info;

  /* =======================================================
     ACESSIBILIDADE
     ======================================================= */

  /**
   * Erros e avisos são anunciados imediatamente.
   *
   * Informações e sucessos podem utilizar uma região
   * menos intrusiva.
   */
  const role =
    notice.tone === 'error' ||
    notice.tone === 'warning'
      ? 'alert'
      : 'status';

  return (
    <div
      key={notice.id}
      className={[
        'editor-notice',
        `editor-notice--${notice.tone}`,
      ].join(' ')}
      role={role}
      aria-live={
        role === 'alert'
          ? 'assertive'
          : 'polite'
      }
      aria-atomic="true"
    >
      <Icon
        size={17}
        aria-hidden="true"
      />

      <span className="editor-notice__message">
        {notice.message}
      </span>

      <button
        type="button"
        className="editor-notice__close"
        aria-label="Fechar notificação"
        title="Fechar"
        onClick={clearNotice}
      >
        <X
          size={14}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}