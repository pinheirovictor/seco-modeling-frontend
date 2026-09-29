import {
  EditorPage,
} from '../features/editor/components/EditorPage';

/* =========================================================
   MODELING PAGE
   ========================================================= */

/**
 * Página responsável pela modelagem de Ecossistemas
 * de Software utilizando a notação SSN.
 *
 * Neste momento, ela apenas encapsula o editor atual.
 *
 * Futuramente, poderá receber elementos da plataforma como:
 *
 * - cabeçalho global;
 * - breadcrumb;
 * - identificação do usuário;
 * - informações do modelo carregado;
 * - permissões;
 * - navegação entre versões.
 */
export function ModelingPage() {
  return (
    <EditorPage />
  );
}