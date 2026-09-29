import './HomePage.css';

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Clipboard,
  Database,
  GitCompareArrows,
  HeartPulse,
  Library,
  Network,
} from 'lucide-react';

import {
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

/* =========================================================
   BIBTEX
   ========================================================= */

const ECOS_MODELING_BIBTEX = `@article{pinheiro2022ecosmodeling,
  author = {Pinheiro, Francisco Victor da Silva and Coutinho, Emanuel Ferreira and Santos, Italo and Bezerra, Carla Ilane Moreira},
  title = {A Tool for Supporting the Teaching and Modeling of Software Ecosystems Using SSN Notation},
  journal = {Journal on Interactive Systems},
  volume = {13},
  number = {1},
  pages = {192--204},
  year = {2022},
  doi = {10.5753/jis.2022.2602}
}`;

/* =========================================================
   FUNCIONALIDADES
   ========================================================= */

const FEATURES = [
  {
    icon: Network,
    title: 'Modelagem de ECOS',
    description:
      'Construa modelos de Ecossistemas de Software utilizando a notação Software Supply Network (SSN).',
  },

  {
    icon: Library,
    title: 'Repositório de Modelos',
    description:
      'Armazene, organize e compartilhe modelos de diferentes Ecossistemas de Software.',
  },

  {
    icon: GitCompareArrows,
    title: 'Análise de Evolução',
    description:
      'Compare diferentes versões de um mesmo ecossistema e identifique mudanças ao longo do tempo.',
  },

  {
    icon: HeartPulse,
    title: 'Saúde e Qualidade',
    description:
      'Analise indicadores de saúde, características estruturais e problemas de qualidade dos modelos.',
  },
];

/* =========================================================
   HOME PAGE
   ========================================================= */

export function HomePage() {
  const [
    copied,
    setCopied,
  ] = useState(false);

  /* =======================================================
     COPIAR BIBTEX
     ======================================================= */

  async function copyBibtex() {
    try {
      await navigator.clipboard.writeText(
        ECOS_MODELING_BIBTEX,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2000,
      );
    } catch {
      setCopied(false);
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="home-page">
      {/* ===================================================
          HERO
          =================================================== */}

      <section className="home-hero">
        <div className="home-container home-hero__content">
          <div className="home-hero__text">
            <span className="home-hero__eyebrow">
              ECOS Modeling 4.0
            </span>

            <h1>
              Modelagem, Repositório e Análise de Evolução,
              Saúde e Qualidade de Ecossistemas de Software
            </h1>

            <p>
              Uma plataforma para apoiar pesquisadores,
              profissionais e estudantes na construção,
              armazenamento, compartilhamento e análise
              de modelos de Ecossistemas de Software.
            </p>

            <div className="home-hero__actions">
              <Link
                to="/modelagem"
                className="home-button home-button--primary"
              >
                Começar modelagem

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/repositorio"
                className="home-button home-button--secondary"
              >
                Explorar modelos
              </Link>
            </div>
          </div>

          {/* -----------------------------------------------
              REPRESENTAÇÃO VISUAL
              ----------------------------------------------- */}

          <div
            className="home-hero__visual"
            aria-hidden="true"
          >
            <div className="home-ecos-preview">
              <div className="home-ecos-preview__node home-ecos-preview__node--supplier">
                Fornecedor
              </div>

              <div className="home-ecos-preview__relationship">
                <span className="home-ecos-preview__flow">
                  P.1
                </span>
              </div>

              <div className="home-ecos-preview__node home-ecos-preview__node--coi">
                Companhia de Interesse
              </div>

              <div className="home-ecos-preview__relationship home-ecos-preview__relationship--second">
                <span className="home-ecos-preview__flow">
                  S.1
                </span>
              </div>

              <div className="home-ecos-preview__node home-ecos-preview__node--customer">
                Cliente
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          SOBRE
          =================================================== */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-section__heading">
            <span>
              Sobre
            </span>

            <h2>
              ECOS Modeling 4.0
            </h2>
          </div>

          <div className="home-about">
            <p>
              A ferramenta ECOS Modeling 4.0 surge com o
              propósito de apoiar a comunidade de
              Ecossistemas de Software (ECOS) na modelagem,
              armazenamento e análise da evolução de seus
              ecossistemas. Além de possibilitar a criação
              de modelos utilizando a notação Software
              Supply Network (SSN), a ferramenta busca
              promover a padronização da modelagem na área
              e facilitar o compartilhamento de conhecimento
              entre pesquisadores e profissionais.
            </p>

            <p>
              Entre as funcionalidades disponibilizadas
              estão a construção de modelos por meio de uma
              interface gráfica intuitiva, o armazenamento
              centralizado de diferentes versões dos
              modelos, a importação e exportação em múltiplos
              formatos e a geração de relatórios estatísticos
              sobre os elementos presentes no ecossistema.
              Como principal evolução em relação às versões
              anteriores, a ferramenta incorpora mecanismos
              de análise evolutiva, permitindo comparar
              diferentes versões de um mesmo modelo e
              identificar mudanças ocorridas ao longo do
              tempo por meio de métricas, tabelas e gráficos
              comparativos.
            </p>

            <p>
              Além disso, a plataforma oferece suporte à
              análise de saúde e qualidade dos ecossistemas,
              controle de acesso aos modelos e,
              progressivamente, suporte a múltiplos idiomas,
              ampliando sua usabilidade e alcance para a
              comunidade internacional de ECOS.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          PRINCIPAIS RECURSOS
          =================================================== */}

      <section className="home-section home-section--soft">
        <div className="home-container">
          <div className="home-section__heading">
            <span>
              Plataforma
            </span>

            <h2>
              Principais funcionalidades
            </h2>

            <p>
              A ECOS Modeling 4.0 integra diferentes etapas
              do processo de representação e análise de
              Ecossistemas de Software em uma única
              plataforma.
            </p>
          </div>

          <div className="home-features">
            {FEATURES.map(
              (feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="home-feature-card"
                  >
                    <div className="home-feature-card__icon">
                      <Icon
                        size={22}
                        aria-hidden="true"
                      />
                    </div>

                    <h3>
                      {feature.title}
                    </h3>

                    <p>
                      {feature.description}
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          MODELOS DISPONÍVEIS
          =================================================== */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-models-overview">
            <div>
              <div className="home-section__heading">
                <span>
                  Repositório
                </span>

                <h2>
                  Modelos disponíveis
                </h2>

                <p>
                  Explore modelos de Ecossistemas de
                  Software construídos e compartilhados na
                  plataforma.
                </p>
              </div>

              <Link
                to="/repositorio"
                className="home-inline-link"
              >
                Acessar repositório

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="home-model-counter">
              <Database
                size={24}
                aria-hidden="true"
              />

              <strong>
                1
              </strong>

              <span>
                modelo disponível
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          INDICADORES
          =================================================== */}

      <section className="home-section home-section--soft">
        <div className="home-container">
          <div className="home-statistics">
            <div className="home-statistic">
              <Network
                size={20}
                aria-hidden="true"
              />

              <strong>
                SSN
              </strong>

              <span>
                Notação de modelagem
              </span>
            </div>

            <div className="home-statistic">
              <GitCompareArrows
                size={20}
                aria-hidden="true"
              />

              <strong>
                Evolução
              </strong>

              <span>
                Comparação entre versões
              </span>
            </div>

            <div className="home-statistic">
              <BarChart3
                size={20}
                aria-hidden="true"
              />

              <strong>
                Métricas
              </strong>

              <span>
                Análises estruturais
              </span>
            </div>

            <div className="home-statistic">
              <HeartPulse
                size={20}
                aria-hidden="true"
              />

              <strong>
                Saúde
              </strong>

              <span>
                Indicadores do ecossistema
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          REFERÊNCIA CIENTÍFICA
          =================================================== */}

      <section className="home-section">
        <div className="home-container">
          <div className="home-reference">
            <div className="home-reference__icon">
              <BookOpen
                size={22}
                aria-hidden="true"
              />
            </div>

            <div className="home-reference__content">
              <div className="home-section__heading">
                <span>
                  Referência
                </span>

                <h2>
                  Publicação da ECOS Modeling
                </h2>
              </div>

              <p className="home-reference__citation">
                PINHEIRO, F. V. da S.; COUTINHO, E. F.;
                SANTOS, I.; BEZERRA, C. I. M.
                <strong>
                  {' '}
                  A Tool for Supporting the Teaching and
                  Modeling of Software Ecosystems Using SSN
                  Notation.
                </strong>{' '}
                Journal on Interactive Systems, Porto Alegre,
                RS, v. 13, n. 1, p. 192–204, 2022.
                DOI: 10.5753/jis.2022.2602.
              </p>

              <div className="home-reference__actions">
                <a
                  href="https://sol.sbc.org.br/journals/index.php/jis/article/view/2602"
                  target="_blank"
                  rel="noreferrer"
                  className="home-button home-button--secondary"
                >
                  Ver artigo

                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                  />
                </a>

                <button
                  type="button"
                  className="home-button home-button--secondary"
                  onClick={copyBibtex}
                >
                  {copied ? (
                    <Check
                      size={15}
                      aria-hidden="true"
                    />
                  ) : (
                    <Clipboard
                      size={15}
                      aria-hidden="true"
                    />
                  )}

                  {copied
                    ? 'BibTeX copiado'
                    : 'Copiar BibTeX'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CTA FINAL
          =================================================== */}

      <section className="home-cta">
        <div className="home-container home-cta__content">
          <div>
            <span>
              ECOS Modeling 4.0
            </span>

            <h2>
              Comece a modelar seu Ecossistema de Software
            </h2>

            <p>
              Utilize o editor SSN para representar atores,
              Relações Comerciais e Fluxos do ecossistema.
            </p>
          </div>

          <Link
            to="/modelagem"
            className="home-button home-button--light"
          >
            Abrir editor

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="home-footer">
        <div className="home-container home-footer__content">
          <div>
            <strong>
              ECOS Modeling
            </strong>

            <span>
              Versão 4.0
            </span>
          </div>

          <p>
            Ferramenta para modelagem e análise de
            Ecossistemas de Software.
          </p>
        </div>
      </footer>
    </div>
  );
}