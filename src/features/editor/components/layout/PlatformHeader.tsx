import {
  NavLink,
} from 'react-router-dom';

import './PlatformHeader.css';

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

interface NavigationItem {
  label: string;
  to: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label:
      'Início',
    to:
      '/',
  },
  {
    label:
      'Modelagem de ECOS',
    to:
      '/modelagem',
  },
  {
    label:
      'Repositório de Modelos',
    to:
      '/repositorio',
  },
  {
    label:
      'Análise de Evolução',
    to:
      '/evolucao',
  },
  {
    label:
      'Análise de Saúde e Qualidade',
    to:
      '/saude-qualidade',
  },
  {
    label:
      'Artigos',
    to:
      '/artigos',
  },
  {
    label:
      'Autores',
    to:
      '/autores',
  },
];

/* =========================================================
   PLATFORM HEADER
   ========================================================= */

/**
 * Cabeçalho global da ECOS Modeling 4.0.
 *
 * Este componente pertence à plataforma como um todo
 * e não ao editor de modelagem.
 *
 * Ele deve ser utilizado nas páginas:
 *
 * - Início;
 * - Modelagem;
 * - Repositório;
 * - Evolução;
 * - Saúde e Qualidade;
 * - Artigos;
 * - Autores;
 * - Cadastro;
 * - Entrar.
 *
 * A toolbar com Undo, Redo, Salvar etc. permanece
 * exclusiva da página de modelagem.
 */
export function PlatformHeader() {
  return (
    <header
      className="platform-header"
      aria-label="Cabeçalho principal da ECOS Modeling"
    >
      {/* ===================================================
          BARRA SUPERIOR
          =================================================== */}

      <div className="platform-header__top">
        <div className="platform-header__top-content">
          <span
            className="platform-header__language"
            title="Idioma atual"
          >
            PT-BR
          </span>
        </div>
      </div>

      {/* ===================================================
          NAVEGAÇÃO PRINCIPAL
          =================================================== */}

      <div className="platform-header__main">
        <div className="platform-header__container">
          {/* -----------------------------------------------
              MARCA
              ----------------------------------------------- */}

          <NavLink
            to="/"
            className="platform-brand"
            aria-label="ECOS Modeling — Página inicial"
          >
            <span className="platform-brand__ecos">
              ECOS
            </span>

            <span className="platform-brand__modeling">
              Modeling
            </span>
          </NavLink>

          {/* -----------------------------------------------
              MENU
              ----------------------------------------------- */}

          <nav
            className="platform-nav"
            aria-label="Navegação principal"
          >
            {NAVIGATION_ITEMS.map(
              (item) => (
                <NavLink
                  key={
                    item.to
                  }
                  to={
                    item.to
                  }
                  end={
                    item.to ===
                    '/'
                  }
                  className={({
                    isActive,
                  }) =>
                    [
                      'platform-nav__link',

                      isActive
                        ? 'platform-nav__link--active'
                        : '',
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        ' ',
                      )
                  }
                >
                  {
                    item.label
                  }
                </NavLink>
              ),
            )}
          </nav>

          {/* -----------------------------------------------
              ACESSO
              ----------------------------------------------- */}

          <div className="platform-header__account">
            <NavLink
              to="/cadastro"
              className={({
                isActive,
              }) =>
                [
                  'platform-header__account-link',

                  isActive
                    ? 'platform-header__account-link--active'
                    : '',
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  )
              }
            >
              Cadastro
            </NavLink>

            <NavLink
              to="/entrar"
              className={({
                isActive,
              }) =>
                [
                  'platform-header__account-link',
                  'platform-header__account-link--login',

                  isActive
                    ? 'platform-header__account-link--active'
                    : '',
                ]
                  .filter(
                    Boolean,
                  )
                  .join(
                    ' ',
                  )
              }
            >
              Entrar
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}