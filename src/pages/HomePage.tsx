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
              Plataforma de Modelagem, Repositório e Análise de Evolução,
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

         

        <div
  className="home-hero__visual"
  aria-hidden="true"
>
  <div className="home-ecos-preview">
    <svg
      className="home-ecos-preview__svg"
      viewBox="0 0 1080 330"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ===================================================
          RELACIONAMENTOS COMERCIAIS
          =================================================== */}

      <g className="home-ecos-preview__relationships">
        {/* Fornecedor 1 - Empresa */}
        <line
          x1="145"
          y1="63"
          x2="290"
          y2="157"
        />

        {/* Fornecedor 2 - Empresa */}
        <line
          x1="146"
          y1="174"
          x2="290"
          y2="157"
        />

        {/* Fornecedor 3 - Empresa */}
        <line
          x1="148"
          y1="279"
          x2="290"
          y2="157"
        />

        {/* Empresa - Intermediário */}
        <line
          x1="445"
          y1="157"
          x2="475"
          y2="92"
        />

        {/* Intermediário - Cliente 1 */}
        <line
          x1="603"
          y1="92"
          x2="708"
          y2="85"
        />

        {/* Empresa - Cliente 2 */}
        <line
          x1="445"
          y1="157"
          x2="706"
          y2="168"
        />

        {/* Empresa - Agregador */}
        <line
          x1="445"
          y1="157"
          x2="478"
          y2="255"
        />

        {/* Agregador - Cliente 3 */}
        <line
          x1="609"
          y1="255"
          x2="700"
          y2="261"
        />

        {/* Cliente 2 - Cliente do Cliente */}
        <line
          x1="835"
          y1="168"
          x2="910"
          y2="185"
        />
      </g>

      {/* ===================================================
          FORNECEDORES
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__supplier"
          points="
            14,42
            121,42
            145,63
            121,84
            14,84
          "
        />

        <text
          x="72"
          y="65"
          textAnchor="middle"
        >
          Fornecedor 1
        </text>
      </g>

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__supplier"
          points="
            18,152
            124,152
            146,174
            124,195
            18,195
          "
        />

        <text
          x="75"
          y="177"
          textAnchor="middle"
        >
          Fornecedor 2
        </text>
      </g>

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__supplier"
          points="
            20,258
            126,258
            148,279
            126,300
            20,300
          "
        />

        <text
          x="77"
          y="282"
          textAnchor="middle"
        >
          Fornecedor 3
        </text>
      </g>

      {/* ===================================================
          EMPRESA DE INTERESSE
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <rect
          className="home-ecos-preview__coi"
          x="290"
          y="136"
          width="155"
          height="43"
          rx="1"
        />

        <text
          className="home-ecos-preview__actor-text--light"
          x="367.5"
          y="161"
          textAnchor="middle"
        >
          Empresa de Interesse
        </text>
      </g>

      {/* ===================================================
          INTERMEDIÁRIO
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__intermediary"
          points="
            493,72
            584,72
            603,92
            584,113
            493,113
            475,92
          "
        />

        <text
          x="539"
          y="95"
          textAnchor="middle"
        >
          Intermediário
        </text>
      </g>

      {/* ===================================================
          AGREGADOR
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__aggregator"
          points="
            493,235
            609,235
            594,276
            478,276
          "
        />

        <text
          x="544"
          y="258"
          textAnchor="middle"
        >
          Agregador
        </text>
      </g>

      {/* ===================================================
          CLIENTES
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__customer"
          points="
            727,65
            837,65
            837,106
            727,106
            708,85
          "
        />

        <text
          x="779"
          y="88"
          textAnchor="middle"
        >
          Cliente 1
        </text>
      </g>

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__customer"
          points="
            726,148
            835,148
            835,189
            726,189
            706,168
          "
        />

        <text
          x="778"
          y="172"
          textAnchor="middle"
        >
          Cliente 2
        </text>
      </g>

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__customer"
          points="
            720,241
            828,241
            828,282
            720,282
            700,261
          "
        />

        <text
          x="772"
          y="265"
          textAnchor="middle"
        >
          Cliente 3
        </text>
      </g>

      {/* ===================================================
          CLIENTE DO CLIENTE
          =================================================== */}

      <g className="home-ecos-preview__actor">
        <polygon
          className="home-ecos-preview__customer-of-customer"
          points="
            910,164
            1064,164
            1044,185
            1064,206
            910,206
          "
        />

        <text
          x="977"
          y="188"
          textAnchor="middle"
        >
          Cliente do Cliente
        </text>
      </g>

      {/* ===================================================
          FLUXOS
          =================================================== */}

      {/* Fornecedor 1 -> Empresa */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            196,96
            224,96
            233,105
            224,114
            196,114
          "
        />

        <text
          x="212"
          y="108"
          textAnchor="middle"
        >
          P.1
        </text>
      </g>

      {/* Fornecedor 2 -> Empresa */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            205,156
            233,156
            242,165
            233,174
            205,174
          "
        />

        <text
          x="221"
          y="168"
          textAnchor="middle"
        >
          P.2
        </text>
      </g>

      {/* Fornecedor 3 -> Empresa */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            205,210
            233,210
            242,219
            233,228
            205,228
          "
        />

        <text
          x="221"
          y="222"
          textAnchor="middle"
        >
          P.3
        </text>
      </g>

      {/* Intermediário -> Cliente 1 */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            638,80
            666,80
            675,89
            666,98
            638,98
          "
        />

        <text
          x="654"
          y="92"
          textAnchor="middle"
        >
          C.1
        </text>
      </g>

      {/* Empresa -> Cliente 2 */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            552,153
            580,153
            589,162
            580,171
            552,171
          "
        />

        <text
          x="568"
          y="165"
          textAnchor="middle"
        >
          S.1
        </text>
      </g>

      {/* Agregador -> Cliente 3 */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            637,247
            665,247
            674,256
            665,265
            637,265
          "
        />

        <text
          x="653"
          y="259"
          textAnchor="middle"
        >
          F.1
        </text>
      </g>

      {/* Cliente 2 -> Cliente do Cliente */}

      <g className="home-ecos-preview__flow">
        <polygon
          points="
            854,168
            882,168
            891,177
            882,186
            854,186
          "
        />

        <text
          x="870"
          y="180"
          textAnchor="middle"
        >
          S.2
        </text>
      </g>
    </svg>
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