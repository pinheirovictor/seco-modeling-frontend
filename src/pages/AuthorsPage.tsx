import './AuthorsPage.css';

import {
  Building2,
  ExternalLink,
  Network,
} from 'lucide-react';
import { useState } from 'react';

/* =========================================================
   TYPES
   ========================================================= */

interface Author {
  name: string;
  institution: string;
  description: string;
  category: 'professor' | 'collaborator';
  photo?: string;
  lattes?: string;
  source?: string;
}

/* =========================================================
   IMAGES
   ========================================================= */

const AUTHORS_IMAGE_BASE =
  'https://raw.githubusercontent.com/erickgabrielfg/TCC-front/main/src/assets/images/authors';

/* =========================================================
   AUTHORS
   ========================================================= */

const AUTHORS: Author[] = [
  {
    name: 'Prof. Francisco Victor da Silva Pinheiro',

    institution:
      'UFC Quixadá',

    category:
      'professor',

    description:
      'Professor da Universidade Federal do Ceará, Campus Quixadá, com atuação em Engenharia de Software, Ecossistemas de Software, desenvolvimento web/mobile, Internet das Coisas e Ciência de Dados.',

    photo:
      `${AUTHORS_IMAGE_BASE}/victor.png`,

    lattes:
      'https://lattes.cnpq.br/3822537365616539',

    source:
      'https://www.quixada.ufc.br/docente/francisco-victor-da-silva-pinheiro/',
  },

  {
    name:
      'Prof. Emanuel Ferreira Coutinho',

    institution:
      'UFC Quixadá',

    category:
      'professor',

    description:
      'Professor da Universidade Federal do Ceará, Campus Quixadá, com experiência em Computação em Nuvem, Análise de Desempenho, Sistemas de Informação e Engenharia de Software.',

    photo:
      `${AUTHORS_IMAGE_BASE}/emanuel.png`,

    lattes:
      'http://lattes.cnpq.br/9359546788802277',

    source:
      'https://www.quixada.ufc.br/docente/emanuel-ferreira-coutinho/',
  },

  {
    name:
      'Profa. Carla Ilane Moreira Bezerra',

    institution:
      'UFC Quixadá',

    category:
      'professor',

    description:
      'Professora da Universidade Federal do Ceará, Campus Quixadá, pesquisadora nas áreas de Qualidade de Software, Melhoria de Processos, Testes de Software, Computação Ubíqua e Internet das Coisas.',

    photo:
      `${AUTHORS_IMAGE_BASE}/carla.png`,

    lattes:
      'http://lattes.cnpq.br/4277471687235814',

    source:
      'https://www.quixada.ufc.br/docente/carla-ilane-moreira-bezerra/',
  },

  {
    name:
      'Profa. Rossana Maria de Castro Andrade',

    institution:
      'GREat/UFC',

    category:
      'professor',

    description:
      'Professora titular da Universidade Federal do Ceará e membro do GREat, com atuação em Engenharia de Software, reúso, teste, qualidade de software, redes de computadores, computação móvel, computação ubíqua e Internet das Coisas.',

    photo:
      `${AUTHORS_IMAGE_BASE}/rossana.png`,

    lattes:
      'https://lattes.cnpq.br/9576713124661835',

    source:
      'https://mdcc.ufc.br/pt/corpo-docente-antiga/rossana-maria-de-castro-andrade/',
  },

  {
    name:
      'Ronier da Silva Lima',

    institution:
      'Egresso do curso de Sistemas de Informação',

    category:
      'collaborator',

    description:
      'Egresso do curso de Sistemas de Informação da UFC Quixadá e colaborador no desenvolvimento da ferramenta ECOS Modeling.',

    photo:
      `${AUTHORS_IMAGE_BASE}/ronier.jpeg`,

    lattes:
      'http://lattes.cnpq.br/0961092419724488',
  },

  {
    name:
      'Maria Erilane Lima da Silva',

    institution:
      'Egressa do curso de Redes de Computadores',

    category:
      'collaborator',

    description:
      'Egressa do curso de Redes de Computadores da UFC Quixadá e colaboradora no desenvolvimento da ferramenta ECOS Modeling.',

    photo:
      `${AUTHORS_IMAGE_BASE}/erilane.jpeg`,

    lattes:
      'https://lattes.cnpq.br/7286192837980192',
  },

  {
    name:
      'André Luís Carvalho da Silva',

    institution:
      'Egresso do curso de Engenharia de Software',

    category:
      'collaborator',

    description:
      'Egresso do curso de Engenharia de Software da UFC Quixadá e colaborador no desenvolvimento da ferramenta ECOS Modeling.',

    photo:
      `${AUTHORS_IMAGE_BASE}/andre.jpg`,

    lattes:
      'http://lattes.cnpq.br/1858831432352247',
  },

  {
    name:
      'Erick Gabriel Ferreira Gaspar',

    institution:
      'Aluno de Engenharia de Software',

    category:
      'collaborator',

    description:
      'Aluno do curso de Engenharia de Software da UFC Quixadá e colaborador no desenvolvimento e evolução da ferramenta ECOS Modeling.',

    photo:
      `${AUTHORS_IMAGE_BASE}/erick.png`,

    lattes:
      'http://lattes.cnpq.br/6760118683092162',
  },
];

/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(
  name: string,
) {
  return name
    .replace(
      /Prof\.|Profa\./g,
      '',
    )
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0],
    )
    .join('')
    .toUpperCase();
}

/* =========================================================
   AUTHOR PHOTO
   ========================================================= */

function AuthorPhoto({
  author,
}: {
  author: Author;
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const showPhoto =
    Boolean(
      author.photo,
    ) &&
    !imageError;

  return (
    <div className="author-card__photo-wrapper">
      {showPhoto ? (
        <img
          className="author-card__photo"
          src={author.photo}
          alt={author.name}
          loading="lazy"
          onError={() =>
            setImageError(
              true,
            )
          }
        />
      ) : (
        <div className="author-card__photo-placeholder">
          {getInitials(
            author.name,
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   AUTHOR CARD
   ========================================================= */

function AuthorCard({
  author,
}: {
  author: Author;
}) {
  return (
    <article className="author-card">
      <AuthorPhoto
        author={author}
      />

      <div className="author-card__content">
        <div className="author-card__identity">
          <span className="author-card__institution">
            <Building2
              size={12}
              aria-hidden="true"
            />

            {
              author.institution
            }
          </span>

          <h3>
            {author.name}
          </h3>
        </div>

        <p className="author-card__description">
          {
            author.description
          }
        </p>

        <div className="author-card__links">
          {author.lattes && (
            <a
              href={
                author.lattes
              }
              target="_blank"
              rel="noopener noreferrer"
              className="author-card__link author-card__link--primary"
            >
              Currículo Lattes

              <ExternalLink
                size={12}
                aria-hidden="true"
              />
            </a>
          )}

          {author.source && (
            <a
              href={
                author.source
              }
              target="_blank"
              rel="noopener noreferrer"
              className="author-card__link author-card__link--secondary"
            >
              Página institucional

              <ExternalLink
                size={12}
                aria-hidden="true"
              />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export function AuthorsPage() {
  const professors =
    AUTHORS.filter(
      (author) =>
        author.category ===
        'professor',
    );

  const collaborators =
    AUTHORS.filter(
      (author) =>
        author.category ===
        'collaborator',
    );

  return (
    <div className="authors-page">
      <section className="authors-hero">
        <div className="authors-container authors-hero__content">
          <div className="authors-hero__icon">
            <Network
              size={25}
              aria-hidden="true"
            />
          </div>

          <div>
            <span className="authors-eyebrow">
              ECOS Modeling 4.0
            </span>

            <h1>
              Autores da Ferramenta
            </h1>

            <p>
              Pesquisadores,
              professores, alunos
              e egressos que
              contribuíram para o
              desenvolvimento e
              evolução da ECOS
              Modeling.
            </p>
          </div>
        </div>
      </section>

      <main className="authors-content">
        <div className="authors-container">
          <section className="authors-section">
            <div className="authors-section__heading">
              <span>
                Pesquisa e
                orientação
              </span>

              <h2>
                Professores e
                pesquisadores
              </h2>

              <p>
                Pesquisadores
                envolvidos na
                concepção,
                desenvolvimento e
                evolução científica
                da ECOS Modeling.
              </p>
            </div>

            <div className="authors-grid">
              {professors.map(
                (author) => (
                  <AuthorCard
                    key={
                      author.name
                    }
                    author={
                      author
                    }
                  />
                ),
              )}
            </div>
          </section>

          <section className="authors-section authors-section--collaborators">
            <div className="authors-section__heading">
              <span>
                Desenvolvimento
              </span>

              <h2>
                Colaboradores
              </h2>

              <p>
                Alunos e egressos
                da UFC Quixadá que
                participaram do
                desenvolvimento e
                da evolução da
                ferramenta.
              </p>
            </div>

            <div className="authors-grid">
              {collaborators.map(
                (author) => (
                  <AuthorCard
                    key={
                      author.name
                    }
                    author={
                      author
                    }
                  />
                ),
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}