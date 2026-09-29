import {
  Outlet,
} from 'react-router-dom';

import './PlatformLayout.css';

import {
  PlatformHeader,
} from './PlatformHeader';

/* =========================================================
   PLATFORM LAYOUT
   ========================================================= */

/**
 * Layout global da ECOS Modeling 4.0.
 *
 * Responsabilidades:
 *
 * - exibir o cabeçalho principal da plataforma;
 * - fornecer a área onde cada página será renderizada;
 * - manter uma estrutura visual consistente entre os módulos.
 *
 * O conteúdo específico de cada rota é renderizado
 * através do <Outlet /> do React Router.
 *
 * Exemplo:
 *
 * /
 *   -> HomePage
 *
 * /repositorio
 *   -> RepositoryPage
 *
 * /evolucao
 *   -> EvolutionPage
 *
 * /artigos
 *   -> ArticlesPage
 */
export function PlatformLayout() {
  return (
    <div className="platform-layout">
      {/* ===================================================
          CABEÇALHO GLOBAL
          =================================================== */}

      <PlatformHeader />

      {/* ===================================================
          CONTEÚDO DA PÁGINA
          =================================================== */}

      <main
        className="platform-layout__content"
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  );
}