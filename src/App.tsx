import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  PlatformLayout,
} from './features/editor/components/layout/PlatformLayout';

import {
  HomePage,
} from './pages/HomePage';

import {
  ModelingPage,
} from './pages/ModelingPage';

import {
  RepositoryPage,
} from './pages/RepositoryPage';

import {
  EvolutionPage,
} from './pages/EvolutionPage';

import {
  HealthQualityPage,
} from './pages/HealthQualityPage';

import {
  ArticlesPage,
} from './pages/ArticlesPage';

import {
  AuthorsPage,
} from './pages/AuthorsPage';

import {
  RegisterPage,
} from './pages/RegisterPage';

import {
  LoginPage,
} from './pages/LoginPage';

/* =========================================================
   APP
   ========================================================= */

/**
 * Ponto principal de navegação da ECOS Modeling 4.0.
 *
 * Todas as páginas da plataforma utilizam o mesmo
 * PlatformLayout, que contém:
 *
 * - cabeçalho global;
 * - navegação principal;
 * - área de conteúdo através do Outlet.
 *
 * Estrutura:
 *
 * PlatformLayout
 * ├── PlatformHeader
 * └── Outlet
 *      ├── HomePage
 *      ├── ModelingPage
 *      ├── RepositoryPage
 *      ├── EvolutionPage
 *      ├── HealthQualityPage
 *      ├── ArticlesPage
 *      ├── AuthorsPage
 *      ├── RegisterPage
 *      └── LoginPage
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================
            LAYOUT GLOBAL DA PLATAFORMA
            ================================================= */}

        <Route
          element={
            <PlatformLayout />
          }
        >
          {/* ===============================================
              INÍCIO
              =============================================== */}

          <Route
            index
            element={
              <HomePage />
            }
          />

          {/* ===============================================
              MODELAGEM DE ECOS
              =============================================== */}

          <Route
            path="modelagem"
            element={
              <ModelingPage />
            }
          />

          {/* ===============================================
              REPOSITÓRIO DE MODELOS
              =============================================== */}

          <Route
            path="repositorio"
            element={
              <RepositoryPage />
            }
          />

          {/* ===============================================
              ANÁLISE DE EVOLUÇÃO
              =============================================== */}

          <Route
            path="evolucao"
            element={
              <EvolutionPage />
            }
          />

          {/* ===============================================
              SAÚDE E QUALIDADE
              =============================================== */}

          <Route
            path="saude-qualidade"
            element={
              <HealthQualityPage />
            }
          />

          {/* ===============================================
              ARTIGOS
              =============================================== */}

          <Route
            path="artigos"
            element={
              <ArticlesPage />
            }
          />

          {/* ===============================================
              AUTORES
              =============================================== */}

          <Route
            path="autores"
            element={
              <AuthorsPage />
            }
          />

          {/* ===============================================
              CADASTRO
              =============================================== */}

          <Route
            path="cadastro"
            element={
              <RegisterPage />
            }
          />

          {/* ===============================================
              ENTRAR
              =============================================== */}

          <Route
            path="entrar"
            element={
              <LoginPage />
            }
          />
        </Route>

        {/* =================================================
            ROTA NÃO ENCONTRADA
            ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}