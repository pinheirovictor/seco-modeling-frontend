import type {
  Actor,
  CommercialRelationship,
  EcosystemModel,
  Flow,
} from './model';

/* =========================================================
   NORMALIZAÇÃO DE NOMES
   ========================================================= */

/**
 * Normaliza um nome de ator para comparação.
 *
 * Exemplos:
 *
 * "  Amazon   Web Services "
 * "amazon web services"
 * "AMAZON WEB SERVICES"
 *
 * são considerados equivalentes.
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
   NOMES OBRIGATÓRIOS
   ========================================================= */

export function isActorNameEmpty(
  name: string,
): boolean {
  return normalizeActorName(name) === '';
}

export function getUnnamedActorIds(
  model: EcosystemModel,
): Set<string> {
  return new Set(
    model.actors
      .filter((actor) =>
        isActorNameEmpty(actor.name),
      )
      .map((actor) => actor.id),
  );
}

/* =========================================================
   NOMES DUPLICADOS
   ========================================================= */

export function actorHasDuplicateName(
  model: EcosystemModel,
  actorId: string,
): boolean {
  const actor =
    model.actors.find(
      (item) => item.id === actorId,
    );

  if (!actor) {
    return false;
  }

  const normalized =
    normalizeActorName(actor.name);

  if (!normalized) {
    return false;
  }

  return model.actors.some(
    (item) =>
      item.id !== actor.id &&
      normalizeActorName(item.name) === normalized,
  );
}

export function getDuplicateActorIds(
  model: EcosystemModel,
): Set<string> {
  const counts =
    new Map<string, number>();

  for (const actor of model.actors) {
    const normalized =
      normalizeActorName(actor.name);

    if (!normalized) {
      continue;
    }

    counts.set(
      normalized,
      (counts.get(normalized) ?? 0) + 1,
    );
  }

  return new Set(
    model.actors
      .filter((actor) => {
        const normalized =
          normalizeActorName(actor.name);

        return (
          normalized !== '' &&
          (counts.get(normalized) ?? 0) > 1
        );
      })
      .map((actor) => actor.id),
  );
}

export function validateUniqueActorNames(
  model: EcosystemModel,
): boolean {
  return (
    getDuplicateActorIds(model).size === 0
  );
}

/* =========================================================
   GERAÇÃO DE NOMES ÚNICOS
   ========================================================= */

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
            actor.id !== ignoredActorId,
        )
        .map((actor) =>
          normalizeActorName(actor.name),
        )
        .filter(Boolean),
    );

  if (
    !used.has(
      normalizeActorName(base),
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
 * Durante a edição:
 *
 * 0 CoI -> permitido
 * 1 CoI -> permitido
 * 2+    -> inválido
 */
export function validateCompanyOfInterest(
  model: EcosystemModel,
): boolean {
  return (
    countCompaniesOfInterest(model) <= 1
  );
}

/**
 * Utilizado posteriormente para validação final,
 * publicação ou completude.
 */
export function hasCompanyOfInterest(
  model: EcosystemModel,
): boolean {
  return (
    countCompaniesOfInterest(model) === 1
  );
}

/* =========================================================
   VALIDAÇÕES DOS ATORES
   ========================================================= */

export function validateActorNamesRequired(
  model: EcosystemModel,
): boolean {
  return model.actors.every(
    (actor) =>
      !isActorNameEmpty(actor.name),
  );
}

export function validateActors(
  model: EcosystemModel,
): boolean {
  return (
    validateCompanyOfInterest(model) &&
    validateActorNamesRequired(model) &&
    validateUniqueActorNames(model)
  );
}

/* =========================================================
   HELPERS DE ATORES
   ========================================================= */

export function actorExists(
  model: EcosystemModel,
  actorId: string,
): boolean {
  return model.actors.some(
    (actor) =>
      actor.id === actorId,
  );
}

/* =========================================================
   RELAÇÃO COMERCIAL
   ========================================================= */

/**
 * Localiza uma Relação Comercial.
 */
export function getCommercialRelationship(
  model: EcosystemModel,
  relationshipId: string,
): CommercialRelationship | undefined {
  return model.commercialRelationships.find(
    (relationship) =>
      relationship.id === relationshipId,
  );
}

/**
 * Verifica se determinado ator participa da relação.
 */
export function commercialRelationshipContainsActor(
  relationship: CommercialRelationship,
  actorId: string,
): boolean {
  return (
    relationship.actorAId === actorId ||
    relationship.actorBId === actorId
  );
}

/**
 * Retorna o outro participante da Relação Comercial.
 */
export function getOtherActorId(
  relationship: CommercialRelationship,
  actorId: string,
): string | null {
  if (
    relationship.actorAId === actorId
  ) {
    return relationship.actorBId;
  }

  if (
    relationship.actorBId === actorId
  ) {
    return relationship.actorAId;
  }

  return null;
}

/**
 * Compara duas relações sem considerar direção.
 *
 * A-B é equivalente a B-A.
 */
export function sameCommercialRelationshipActors(
  first: CommercialRelationship,
  second: CommercialRelationship,
): boolean {
  return (
    (
      first.actorAId === second.actorAId &&
      first.actorBId === second.actorBId
    ) ||
    (
      first.actorAId === second.actorBId &&
      first.actorBId === second.actorAId
    )
  );
}

/**
 * Verifica se já existe uma Relação Comercial entre
 * dois atores.
 *
 * Como Relação Comercial não possui direção:
 *
 * A-B
 *
 * e:
 *
 * B-A
 *
 * são consideradas a mesma relação.
 */
export function commercialRelationshipExistsBetween(
  model: EcosystemModel,
  actorAId: string,
  actorBId: string,
  ignoredRelationshipId?: string,
): boolean {
  return model.commercialRelationships.some(
    (relationship) => {
      if (
        relationship.id ===
        ignoredRelationshipId
      ) {
        return false;
      }

      return (
        (
          relationship.actorAId === actorAId &&
          relationship.actorBId === actorBId
        ) ||
        (
          relationship.actorAId === actorBId &&
          relationship.actorBId === actorAId
        )
      );
    },
  );
}

/**
 * Uma Relação Comercial estruturalmente válida:
 *
 * - conecta dois atores existentes;
 * - conecta atores diferentes.
 */
export function isCommercialRelationshipValid(
  model: EcosystemModel,
  relationship: CommercialRelationship,
): boolean {
  if (
    relationship.actorAId ===
    relationship.actorBId
  ) {
    return false;
  }

  if (
    !actorExists(
      model,
      relationship.actorAId,
    )
  ) {
    return false;
  }

  if (
    !actorExists(
      model,
      relationship.actorBId,
    )
  ) {
    return false;
  }

  return true;
}

/**
 * Relações duplicadas também são inválidas.
 */
export function getDuplicateCommercialRelationshipIds(
  model: EcosystemModel,
): Set<string> {
  const duplicated =
    new Set<string>();

  for (
    let i = 0;
    i <
    model.commercialRelationships.length;
    i += 1
  ) {
    const first =
      model.commercialRelationships[i];

    for (
      let j = i + 1;
      j <
      model.commercialRelationships.length;
      j += 1
    ) {
      const second =
        model.commercialRelationships[j];

      if (
        sameCommercialRelationshipActors(
          first,
          second,
        )
      ) {
        duplicated.add(first.id);
        duplicated.add(second.id);
      }
    }
  }

  return duplicated;
}

/**
 * Recupera todas as relações estruturalmente inválidas.
 */
export function getInvalidCommercialRelationshipIds(
  model: EcosystemModel,
): Set<string> {
  const invalid =
    new Set<string>();

  for (
    const relationship
    of model.commercialRelationships
  ) {
    if (
      !isCommercialRelationshipValid(
        model,
        relationship,
      )
    ) {
      invalid.add(
        relationship.id,
      );
    }
  }

  for (
    const id
    of getDuplicateCommercialRelationshipIds(model)
  ) {
    invalid.add(id);
  }

  return invalid;
}

export function validateCommercialRelationships(
  model: EcosystemModel,
): boolean {
  return (
    getInvalidCommercialRelationshipIds(model)
      .size === 0
  );
}

/* =========================================================
   RELAÇÕES SEM FLUXO
   ========================================================= */

/**
 * Durante a edição é permitido criar primeiro a Relação
 * Comercial e adicionar o Fluxo depois.
 *
 * Por isso, ausência de Fluxo não é tratada como erro
 * estrutural imediato.
 *
 * Essa função será útil para validação de qualidade,
 * completude ou publicação.
 */
export function getCommercialRelationshipsWithoutFlows(
  model: EcosystemModel,
): Set<string> {
  const usedRelationshipIds =
    new Set(
      model.flows.map(
        (flow) =>
          flow.commercialRelationshipId,
      ),
    );

  return new Set(
    model.commercialRelationships
      .filter(
        (relationship) =>
          !usedRelationshipIds.has(
            relationship.id,
          ),
      )
      .map(
        (relationship) =>
          relationship.id,
      ),
  );
}

export function validateCommercialRelationshipsHaveFlows(
  model: EcosystemModel,
): boolean {
  return (
    getCommercialRelationshipsWithoutFlows(
      model,
    ).size === 0
  );
}

/* =========================================================
   FLUXOS
   ========================================================= */

/**
 * Um identificador de Fluxo deve ser inteiro e positivo.
 */
export function isValidFlowIdentifier(
  identifier: number,
): boolean {
  return (
    Number.isInteger(identifier) &&
    identifier > 0
  );
}

/**
 * Verifica se os atores de origem e destino do Fluxo são
 * exatamente os dois participantes da Relação Comercial.
 *
 * São aceitos:
 *
 * A -> B
 *
 * ou:
 *
 * B -> A
 *
 * Não são aceitos:
 *
 * A -> C
 * C -> B
 * A -> A
 */
export function flowMatchesCommercialRelationship(
  model: EcosystemModel,
  flow: Flow,
): boolean {
  const relationship =
    getCommercialRelationship(
      model,
      flow.commercialRelationshipId,
    );

  if (!relationship) {
    return false;
  }

  if (
    flow.sourceActorId ===
    flow.targetActorId
  ) {
    return false;
  }

  const direct =
    relationship.actorAId ===
      flow.sourceActorId &&
    relationship.actorBId ===
      flow.targetActorId;

  const reverse =
    relationship.actorAId ===
      flow.targetActorId &&
    relationship.actorBId ===
      flow.sourceActorId;

  return (
    direct ||
    reverse
  );
}

/**
 * Validação estrutural básica de um Fluxo.
 */
export function isFlowValid(
  model: EcosystemModel,
  flow: Flow,
): boolean {
  if (
    !isValidFlowIdentifier(
      flow.identifier,
    )
  ) {
    return false;
  }

  if (
    !actorExists(
      model,
      flow.sourceActorId,
    )
  ) {
    return false;
  }

  if (
    !actorExists(
      model,
      flow.targetActorId,
    )
  ) {
    return false;
  }

  return (
    flowMatchesCommercialRelationship(
      model,
      flow,
    )
  );
}

/* =========================================================
   CÓDIGOS DE FLUXO DUPLICADOS
   ========================================================= */

/**
 * A combinação:
 *
 * tipo + identificador
 *
 * deve ser única no modelo.
 *
 * Exemplos:
 *
 * P.1
 * P.2
 * S.1
 *
 * são válidos.
 *
 * Dois P.1 no mesmo modelo são considerados duplicados.
 */
export function getDuplicateFlowIds(
  model: EcosystemModel,
): Set<string> {
  const groups =
    new Map<string, string[]>();

  for (
    const flow
    of model.flows
  ) {
    const key =
      `${flow.type}:${flow.identifier}`;

    const ids =
      groups.get(key) ?? [];

    ids.push(flow.id);

    groups.set(
      key,
      ids,
    );
  }

  const duplicated =
    new Set<string>();

  for (
    const ids
    of groups.values()
  ) {
    if (
      ids.length <= 1
    ) {
      continue;
    }

    for (
      const id
      of ids
    ) {
      duplicated.add(id);
    }
  }

  return duplicated;
}

/**
 * Recupera Fluxos estruturalmente inválidos.
 */
export function getInvalidFlowIds(
  model: EcosystemModel,
): Set<string> {
  const invalid =
    new Set<string>();

  for (
    const flow
    of model.flows
  ) {
    if (
      !isFlowValid(
        model,
        flow,
      )
    ) {
      invalid.add(
        flow.id,
      );
    }
  }

  for (
    const id
    of getDuplicateFlowIds(model)
  ) {
    invalid.add(id);
  }

  return invalid;
}

export function validateFlows(
  model: EcosystemModel,
): boolean {
  return (
    getInvalidFlowIds(model).size === 0
  );
}

/* =========================================================
   MODELO SSN — VALIDAÇÃO ESTRUTURAL
   ========================================================= */

/**
 * Validação estrutural atualmente suportada pela
 * ECOS Modeling.
 *
 * Verifica:
 *
 * Atores:
 * - no máximo uma CoI;
 * - nomes preenchidos;
 * - nomes únicos.
 *
 * Relações Comerciais:
 * - atores existentes;
 * - atores diferentes;
 * - ausência de relações duplicadas.
 *
 * Fluxos:
 * - Relação Comercial existente;
 * - origem e destino pertencem à relação;
 * - origem e destino diferentes;
 * - identificador positivo;
 * - código do Fluxo não duplicado.
 *
 * Uma Relação Comercial ainda pode ficar temporariamente
 * sem Fluxo durante a edição.
 */
export function validateModelStructure(
  model: EcosystemModel,
): boolean {
  return (
    validateActors(model) &&
    validateCommercialRelationships(model) &&
    validateFlows(model)
  );
}

/* =========================================================
   MODELO SSN — VALIDAÇÃO DE COMPLETUDE
   ========================================================= */

/**
 * Validação mais restritiva.
 *
 * Além da integridade estrutural:
 *
 * - exige exatamente uma Companhia de Interesse;
 * - exige pelo menos um Fluxo em cada Relação Comercial.
 *
 * Esta função será útil futuramente para:
 *
 * - publicação;
 * - relatório de qualidade;
 * - índice de completude;
 * - validação final.
 */
export function validateModelCompleteness(
  model: EcosystemModel,
): boolean {
  return (
    validateModelStructure(model) &&
    hasCompanyOfInterest(model) &&
    validateCommercialRelationshipsHaveFlows(model)
  );
}