import type {
  Actor,
  EcosystemModel,
} from './model';

/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

/**
 * Normaliza um nome de ator para fins de comparação.
 *
 * Exemplos:
 *
 * "  Amazon   Web Services "
 * "amazon web services"
 * "AMAZON WEB SERVICES"
 *
 * são considerados o mesmo nome.
 *
 * A função:
 * - normaliza caracteres Unicode;
 * - remove espaços extras;
 * - remove espaços nas extremidades;
 * - ignora diferenças entre maiúsculas e minúsculas.
 */
export function normalizeActorName(
  name: string,
): string {
  return name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR');
}

/* =========================================================
   NOME OBRIGATÓRIO
   ========================================================= */

/**
 * Verifica se o nome informado pode ser considerado vazio.
 */
export function isActorNameEmpty(
  name: string,
): boolean {
  return (
    normalizeActorName(name) === ''
  );
}

/**
 * Retorna os IDs dos atores sem nome.
 *
 * Esta validação será utilizada posteriormente pelo
 * mecanismo de qualidade da ECOS Modeling.
 */
export function getUnnamedActorIds(
  model: EcosystemModel,
): Set<string> {
  return new Set(
    model.actors
      .filter(
        (actor) =>
          isActorNameEmpty(
            actor.name,
          ),
      )
      .map(
        (actor) =>
          actor.id,
      ),
  );
}

/* =========================================================
   NOMES DUPLICADOS
   ========================================================= */

/**
 * Verifica se determinado ator possui o mesmo nome
 * de outro ator do modelo.
 *
 * A comparação não diferencia:
 * - letras maiúsculas/minúsculas;
 * - espaços duplicados;
 * - espaços nas extremidades.
 */
export function actorHasDuplicateName(
  model: EcosystemModel,
  actorId: string,
): boolean {
  const actor =
    model.actors.find(
      (item) =>
        item.id === actorId,
    );

  if (!actor) {
    return false;
  }

  const normalized =
    normalizeActorName(
      actor.name,
    );

  /**
   * Ator sem nome não é tratado aqui como duplicado.
   *
   * Nome obrigatório constitui uma regra de validação
   * diferente.
   */
  if (!normalized) {
    return false;
  }

  return model.actors.some(
    (item) =>
      item.id !== actor.id &&
      normalizeActorName(
        item.name,
      ) === normalized,
  );
}

/**
 * Recupera todos os atores que possuem nomes duplicados.
 *
 * Exemplo:
 *
 * Cliente A
 * Cliente A
 * Fornecedor B
 *
 * Os dois primeiros atores são retornados.
 */
export function getDuplicateActorIds(
  model: EcosystemModel,
): Set<string> {
  const counts =
    new Map<string, number>();

  for (
    const actor
    of model.actors
  ) {
    const normalized =
      normalizeActorName(
        actor.name,
      );

    if (!normalized) {
      continue;
    }

    counts.set(
      normalized,
      (
        counts.get(
          normalized,
        ) ?? 0
      ) + 1,
    );
  }

  return new Set(
    model.actors
      .filter((actor) => {
        const normalized =
          normalizeActorName(
            actor.name,
          );

        if (!normalized) {
          return false;
        }

        return (
          (
            counts.get(
              normalized,
            ) ?? 0
          ) > 1
        );
      })
      .map(
        (actor) =>
          actor.id,
      ),
  );
}

/**
 * Verifica se todos os nomes preenchidos são únicos.
 *
 * Atores sem nome não são tratados nesta função,
 * pois "nome ausente" é uma regra independente.
 */
export function validateUniqueActorNames(
  model: EcosystemModel,
): boolean {
  return (
    getDuplicateActorIds(
      model,
    ).size === 0
  );
}

/* =========================================================
   GERAÇÃO DE NOMES ÚNICOS
   ========================================================= */

/**
 * Gera um nome que não conflita com os atores existentes.
 *
 * Exemplos:
 *
 * Fornecedor
 *
 * caso já exista:
 *
 * Fornecedor 2
 *
 * caso também exista:
 *
 * Fornecedor 3
 *
 * ignoredActorId é útil durante edição/renomeação.
 */
export function uniqueActorName(
  preferredName: string,
  actors: Actor[],
  ignoredActorId?: string,
): string {
  const base =
    preferredName
      .normalize('NFC')
      .trim()
      .replace(/\s+/g, ' ') ||
    'Ator';

  const used =
    new Set(
      actors
        .filter(
          (actor) =>
            actor.id !==
            ignoredActorId,
        )
        .map(
          (actor) =>
            normalizeActorName(
              actor.name,
            ),
        )
        .filter(Boolean),
    );

  const normalizedBase =
    normalizeActorName(base);

  if (
    !used.has(
      normalizedBase,
    )
  ) {
    return base;
  }

  let suffix = 2;

  while (
    used.has(
      normalizeActorName(
        `${base} ${suffix}`,
      ),
    )
  ) {
    suffix += 1;
  }

  return `${base} ${suffix}`;
}

/* =========================================================
   COMPANHIA DE INTERESSE
   ========================================================= */

/**
 * Retorna a quantidade de Companhias de Interesse
 * presentes no modelo.
 */
export function countCompaniesOfInterest(
  model: EcosystemModel,
): number {
  return model.actors.filter(
    (actor) =>
      actor.type ===
      'company_of_interest',
  ).length;
}

/**
 * Verifica a regra estrutural atualmente adotada pela
 * ECOS Modeling:
 *
 * um modelo pode possuir no máximo uma
 * Companhia de Interesse (CoI).
 *
 * IMPORTANTE:
 *
 * "no máximo uma" é diferente de "exatamente uma".
 *
 * Durante a edição é permitido existir temporariamente
 * um modelo sem CoI.
 *
 * Futuramente, no processo de publicação/validação final,
 * podemos estabelecer que um modelo SSN válido deve possuir
 * exatamente uma Companhia de Interesse.
 */
export function validateCompanyOfInterest(
  model: EcosystemModel,
): boolean {
  return (
    countCompaniesOfInterest(
      model,
    ) <= 1
  );
}

/**
 * Verifica se o modelo possui uma Companhia de Interesse.
 *
 * Esta função será útil posteriormente para validação
 * de completude/publicação.
 */
export function hasCompanyOfInterest(
  model: EcosystemModel,
): boolean {
  return (
    countCompaniesOfInterest(
      model,
    ) === 1
  );
}

/* =========================================================
   VALIDAÇÕES BÁSICAS DOS ATORES
   ========================================================= */

/**
 * Verifica se todos os atores possuem nome.
 */
export function validateActorNamesRequired(
  model: EcosystemModel,
): boolean {
  return model.actors.every(
    (actor) =>
      !isActorNameEmpty(
        actor.name,
      ),
  );
}

/**
 * Validação estrutural básica dos atores.
 *
 * Esta função não representa ainda toda a validação SSN.
 * Ela apenas concentra as regras já definidas nesta etapa.
 *
 * Atualmente:
 *
 * - no máximo uma Companhia de Interesse;
 * - nomes obrigatórios;
 * - nomes únicos.
 */
export function validateActors(
  model: EcosystemModel,
): boolean {
  return (
    validateCompanyOfInterest(
      model,
    ) &&
    validateActorNamesRequired(
      model,
    ) &&
    validateUniqueActorNames(
      model,
    )
  );
}