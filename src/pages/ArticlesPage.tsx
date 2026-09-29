import './ArticlesPage.css';

import {
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  LibraryBig,
} from 'lucide-react';

/* =========================================================
   TYPES
   ========================================================= */

interface Publication {
  title: string;
  year: string;
  type: string;
  venue: string;
  link: string;
  tags: string[];
}

interface PublicationGroup {
  title: string;
  items: Publication[];
}

interface Thesis {
  title: string;
  year: string;
  link: string;
}

/* =========================================================
   PUBLICATIONS
   ========================================================= */

const PUBLICATION_GROUPS: PublicationGroup[] = [
  {
    title: 'Modelagem de Ecossistemas de Software',

    items: [
      {
        title:
          'A Tool for Supporting the Teaching and Modeling of Software Ecosystems Using SSN Notation',

        year: '2022',

        type: 'Artigo em periódico',

        venue:
          'Journal on Interactive Systems',

        link:
          'https://journals-sol.sbc.org.br/index.php/jis/article/view/2602',

        tags: [
          'Modelagem de ECOS',
          'Notação SSN',
          'ECOS Modeling',
        ],
      },

      {
        title:
          'Estudo Preliminar sobre a Modelagem de Ecossistemas de Software: O Caso do ECOS SIPPA',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SBSC',

        link:
          'https://sol.sbc.org.br/index.php/sbsc/article/view/35802',

        tags: [
          'Modelagem SSN',
          'Estudo de caso',
          'SIPPA',
        ],
      },

      {
        title:
          'Modelagem de Ecossistemas de Software das Plataformas de Computação em Nuvem AWS e GCP',

        year: '2023',

        type: 'Resumo expandido',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi_estendido/article/view/24614',

        tags: [
          'Modelagem de ECOS',
          'AWS',
          'GCP',
        ],
      },
    ],
  },

  {
    title: 'Evolução de Ecossistemas de Software',

    items: [
      {
        title:
          'A Software Delivery Network-based Approach to Software Ecosystem Evolution Analysis',

        year: '2023',

        type: 'Trabalho completo',

        venue: 'VEM',

        link:
          'https://sol.sbc.org.br/index.php/vem/article/view/25840',

        tags: [
          'Evolução de ECOS',
          'SDN',
          'SSN',
        ],
      },

      {
        title:
          'Uma Abordagem Baseada em Rede de Fornecimento de Software para Análise da Evolução de Ecossistemas de Software',

        year: '2024',

        type: 'Trabalho completo',

        venue: 'CTD-SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi_estendido/article/view/28603',

        tags: [
          'Evolução de ECOS',
          'Software Supply Network',
        ],
      },

      {
        title:
          'ECOS Modeling: A Modeling Tool, Repository for Models and Evolution Analysis of Software Ecosystems',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi/article/view/34353',

        tags: [
          'ECOS Modeling',
          'Repositório',
          'Evolução de ECOS',
        ],
      },
    ],
  },

  {
    title:
      'Saúde e Qualidade de Ecossistemas de Software',

    items: [
      {
        title:
          'Um Estudo Preliminar Sobre a Saúde de Ecossistemas de Software',

        year: '2021',

        type: 'Artigo em periódico',

        venue:
          'Revista Sistemas e Mídias Digitais',

        link:
          'https://revistasmd.virtual.ufc.br/arquivos/volume-6/numero-1/rsmd-v6-n1-3.pdf',

        tags: [
          'Saúde de ECOS',
          'Métricas de avaliação',
        ],
      },

      {
        title:
          'Uma Abordagem Baseada em Modelos SSN para Análise da Saúde e Qualidade de Ecossistemas de Software',

        year: '2025',

        type: 'Resumo expandido',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi_estendido/article/view/34633',

        tags: [
          'Saúde',
          'Qualidade',
          'SSN',
        ],
      },

      {
        title:
          'Avaliação da Saúde e Qualidade do Ecossistema de Software SIPPA Utilizando Modelagem SSN',

        year: '2026',

        type: 'Trabalho completo',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi_estendido/article/view/42025',

        tags: [
          'Saúde de ECOS',
          'Qualidade de ECOS',
          'SIPPA',
        ],
      },
    ],
  },

  {
    title:
      'Estudos Secundários sobre ECOS',

    items: [
      {
        title:
          'A Systematic Mapping of Health, Quality, Evolution, Simulation and Modeling in Software Ecosystems',

        year: '2024',

        type: 'Trabalho completo',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi/article/view/30848',

        tags: [
          'Saúde',
          'Qualidade',
          'Evolução',
          'Modelagem',
        ],
      },
    ],
  },

  {
    title:
      'Ecossistemas de Software Específicos',

    items: [
      {
        title:
          'Compreendendo o Ecossistema de Software Elixir: Uma Abordagem Baseada em Redes de Suprimento de Software',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SE4FP',

        link:
          'https://sol.sbc.org.br/index.php/se4fp/article/view/37106',

        tags: [
          'ECOS Elixir',
          'SSN',
        ],
      },

      {
        title:
          'Analyzing a Blockchain-Based Educational Application from the Software Ecosystems View',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SBSC',

        link:
          'https://sol.sbc.org.br/index.php/sbsc/article/view/35801',

        tags: [
          'Blockchain',
          'ECOS',
        ],
      },

      {
        title:
          'Estudo Preliminar sobre a Modelagem de Ecossistemas de Software: O Caso do ECOS SIPPA',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SBSC',

        link:
          'https://sol.sbc.org.br/index.php/sbsc/article/view/35802',

        tags: [
          'SIPPA',
          'Modelagem SSN',
        ],
      },

      {
        title:
          'Avaliação da Saúde e Qualidade do Ecossistema de Software SIPPA Utilizando Modelagem SSN',

        year: '2026',

        type: 'Trabalho completo',

        venue: 'SBSI',

        link:
          'https://sol.sbc.org.br/index.php/sbsi_estendido/article/view/42025',

        tags: [
          'SIPPA',
          'Saúde e Qualidade',
        ],
      },
    ],
  },

  {
    title:
      'LLMs em Ecossistemas de Software',

    items: [
      {
        title:
          'Investigando a Integração Estrutural de LLMs em Ecossistemas de Software: Um Estudo com Modelagem SSN',

        year: '2025',

        type: 'Trabalho completo',

        venue: 'SBES',

        link:
          'https://sol.sbc.org.br/index.php/sbes/article/view/37066',

        tags: [
          'LLMs',
          'Estrutura de ECOS',
          'SSN',
        ],
      },
    ],
  },

  {
    title:
      'Educação e Ciência Aberta em ECOS',

    items: [
      {
        title:
          'Aplicando Ecossistemas de Software na Disciplina Engenharia de Software',

        year: '2021',

        type: 'Resumo',

        venue: 'EDUCOMP',

        link:
          'https://sol.sbc.org.br/index.php/educomp_estendido/article/view/14844',

        tags: [
          'Ensino de Engenharia de Software',
          'ECOS na educação',
        ],
      },

      {
        title:
          'Uma Proposta para Open Science em Ecossistemas de Software com Foco em Pesquisa e Educação em Engenharia de Software',

        year: '2021',

        type: 'Resumo expandido',

        venue: 'OpenScienSE',

        link:
          'https://sol.sbc.org.br/index.php/opensciense/article/view/17141',

        tags: [
          'Open Science',
          'ECOS',
          'Educação',
        ],
      },
    ],
  },
];

/* =========================================================
   THESES
   ========================================================= */

const THESES: Thesis[] = [
  {
    title:
      'Uma ferramenta web para apoiar a modelagem de ecossistemas de software utilizando a notação SSN',

    year: '2021',

    link:
      'https://repositorio.ufc.br/handle/riufc/59039',
  },

  {
    title:
      'Ecos Modeling 3.0: uma ferramenta de modelagem de ecossistemas de software e repositório para modelos',

    year: '2023',

    link:
      'https://repositorio.ufc.br/handle/riufc/70836',
  },

  {
    title:
      'Modelagem de ecossistemas de software das plataformas de computação em nuvem: Amazon Web Services e Google Cloud Platform',

    year: '2023',

    link:
      'https://repositorio.ufc.br/handle/riufc/70833',
  },

  {
    title:
      'Uma abordagem baseada em modelos de rede de fornecimento de software para análise de saúde e qualidade de ecossistemas de software',

    year: '2025',

    link:
      'https://repositorio.ufc.br/handle/riufc/85659',
  },
];

/* =========================================================
   PUBLICATION CARD
   ========================================================= */

function PublicationCard({
  publication,
}: {
  publication: Publication;
}) {
  return (
    <article className="publication-card">
      <div className="publication-card__meta">
        <span className="publication-card__type">
          <FileText
            size={12}
            aria-hidden="true"
          />

          {publication.type}
        </span>

        <span className="publication-card__year">
          {publication.year}
        </span>
      </div>

      <h3>
        {publication.title}
      </h3>

      <p className="publication-card__venue">
        {publication.venue}
      </p>

      <div className="publication-card__tags">
        {publication.tags.map(
          (tag) => (
            <span key={tag}>
              {tag}
            </span>
          ),
        )}
      </div>

      <div className="publication-card__footer">
        <a
          href={publication.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar publicação

          <ExternalLink
            size={13}
            aria-hidden="true"
          />
        </a>
      </div>
    </article>
  );
}

/* =========================================================
   THESIS CARD
   ========================================================= */

function ThesisCard({
  thesis,
}: {
  thesis: Thesis;
}) {
  return (
    <article className="publication-card publication-card--thesis">
      <div className="publication-card__meta">
        <span className="publication-card__type">
          <GraduationCap
            size={13}
            aria-hidden="true"
          />

          TCC
        </span>

        <span className="publication-card__year">
          {thesis.year}
        </span>
      </div>

      <h3>
        {thesis.title}
      </h3>

      <p className="publication-card__venue">
        Repositório Institucional da UFC
      </p>

      <div className="publication-card__footer">
        <a
          href={thesis.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Acessar TCC

          <ExternalLink
            size={13}
            aria-hidden="true"
          />
        </a>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export function ArticlesPage() {
  const totalPublications =
    PUBLICATION_GROUPS.reduce(
      (total, group) =>
        total + group.items.length,
      0,
    );

  return (
    <div className="articles-page">
      {/* ===================================================
          HERO
          =================================================== */}

      <section className="articles-hero">
        <div className="articles-container articles-hero__content">
          <div className="articles-hero__icon">
            <BookOpen
              size={25}
              aria-hidden="true"
            />
          </div>

          <div>
            <span className="articles-eyebrow">
              ECOS Modeling 4.0
            </span>

            <h1>
              Publicações
            </h1>

            <p>
              Trabalhos científicos e acadêmicos
              relacionados à ECOS Modeling e às
              pesquisas em modelagem, evolução,
              saúde e qualidade de Ecossistemas
              de Software.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
          =================================================== */}

      <main className="articles-content">
        <div className="articles-container">
          {/* =================================================
              SUMMARY
              ================================================= */}

          <section className="articles-summary">
            <div className="articles-summary__card">
              <BookOpen
                size={20}
                aria-hidden="true"
              />

              <div>
                <strong>
                  {totalPublications}
                </strong>

                <span>
                  Publicações
                </span>
              </div>
            </div>

            <div className="articles-summary__card">
              <LibraryBig
                size={20}
                aria-hidden="true"
              />

              <div>
                <strong>
                  {
                    PUBLICATION_GROUPS.length
                  }
                </strong>

                <span>
                  Áreas temáticas
                </span>
              </div>
            </div>

            <div className="articles-summary__card">
              <GraduationCap
                size={20}
                aria-hidden="true"
              />

              <div>
                <strong>
                  {THESES.length}
                </strong>

                <span>
                  TCCs derivados
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              PUBLICATION GROUPS
              ================================================= */}

          <div className="articles-groups">
            {PUBLICATION_GROUPS.map(
              (group) => (
                <section
                  key={group.title}
                  className="article-group"
                >
                  <header className="article-group__header">
                    <div>
                      <span>
                        Linha de pesquisa
                      </span>

                      <h2>
                        {group.title}
                      </h2>
                    </div>

                    <span className="article-group__count">
                      {group.items.length}{' '}
                      {group.items.length === 1
                        ? 'publicação'
                        : 'publicações'}
                    </span>
                  </header>

                  <div className="articles-list">
                    {group.items.map(
                      (publication) => (
                        <PublicationCard
                          key={`${publication.title}-${publication.year}`}
                          publication={
                            publication
                          }
                        />
                      ),
                    )}
                  </div>
                </section>
              ),
            )}

            {/* =================================================
                THESES
                ================================================= */}

            <section className="article-group article-group--theses">
              <header className="article-group__header">
                <div>
                  <span>
                    Formação acadêmica
                  </span>

                  <h2>
                    TCCs Derivados
                  </h2>
                </div>

                <span className="article-group__count">
                  {THESES.length}{' '}
                  {THESES.length === 1
                    ? 'trabalho'
                    : 'trabalhos'}
                </span>
              </header>

              <div className="articles-list">
                {THESES.map(
                  (thesis) => (
                    <ThesisCard
                      key={`${thesis.title}-${thesis.year}`}
                      thesis={thesis}
                    />
                  ),
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}