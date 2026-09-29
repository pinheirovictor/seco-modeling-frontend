import type { ActorType, RelationshipType } from './model';

export type ActorGroup = 'direct' | 'indirect';

export type ActorShape =
  | 'rectangle'
  | 'arrow-right'
  | 'arrow-left'
  | 'hexagon'
  | 'notched-right'
  | 'parallelogram';

export interface ActorTypeDefinition {
  value: ActorType;
  label: string;
  shortLabel: string;
  group: ActorGroup;
  description: string;
  shape: ActorShape;

  /**
   * Cor utilizada na borda/destaques do ator.
   *
   * A identidade visual segue a notação SSN utilizada pela
   * ECOS Modeling, baseada em Boucharas et al. (2009) e
   * na extensão de Costa et al. (2013).
   */
  accent: string;

  /**
   * Cor principal de preenchimento da forma.
   */
  surface: string;

  /**
   * Cor utilizada no texto apresentado dentro da forma.
   */
  text: string;
}

/**
 * Catálogo oficial dos atores suportados pela notação SSN
 * na ECOS Modeling.
 *
 * Atores diretos:
 * - Companhia de Interesse
 * - Fornecedor
 * - Cliente
 *
 * Atores indiretos:
 * - Intermediário
 * - Cliente do Cliente
 * - Agregador
 */
export const ACTOR_TYPES: ActorTypeDefinition[] = [
  {
    value: 'company_of_interest',
    label: 'Companhia de Interesse',
    shortLabel: 'CoI',
    group: 'direct',

    description:
      'Companhia que entrega o produto de interesse que está sob análise no ecossistema.',

    shape: 'rectangle',

    // Azul
    accent: '#172554',
    surface: '#1D4ED8',
    text: '#FFFFFF',
  },

  {
    value: 'supplier',
    label: 'Fornecedor',
    shortLabel: 'F',
    group: 'direct',

    description:
      'Ator que fornece um ou mais produtos ou serviços ao ecossistema.',

    shape: 'arrow-right',

    // Laranja
    accent: '#92400E',
    surface: '#F59E0B',
    text: '#111827',
  },

  {
    value: 'customer',
    label: 'Cliente',
    shortLabel: 'C',
    group: 'direct',

    description:
      'Ator que adquire ou faz uso do produto de interesse, de forma direta ou indireta.',

    shape: 'arrow-left',

    // Amarelo
    accent: '#854D0E',
    surface: '#FDEB00',
    text: '#111827',
  },

  {
    value: 'intermediary',
    label: 'Intermediário',
    shortLabel: 'I',
    group: 'indirect',

    description:
      'Ator que atua como intermediário entre duas partes que se relacionam, como revendedores ou distribuidores.',

    shape: 'hexagon',

    // Verde
    accent: '#166534',
    surface: '#22C55E',
    text: '#052E16',
  },

  {
    value: 'customer_of_customer',
    label: 'Cliente do Cliente',
    shortLabel: 'CC',
    group: 'indirect',

    description:
      'Cliente de um cliente do ecossistema que utiliza produtos ou serviços relacionados direta ou indiretamente à Companhia de Interesse.',

    shape: 'notched-right',

    // Cinza
    accent: '#475569',
    surface: '#D1D5DB',
    text: '#111827',
  },

  {
    value: 'aggregator',
    label: 'Agregador',
    shortLabel: 'A',
    group: 'indirect',

    description:
      'Empresa, produto ou serviço direta ou indiretamente ligado à Companhia de Interesse.',

    // A representação visual adotada pela ECOS Modeling
    // utiliza o paralelogramo vermelho apresentado na notação.
    shape: 'parallelogram',

    // Vermelho
    accent: '#991B1B',
    surface: '#EF4444',
    text: '#FFFFFF',
  },
];

/**
 * Tipos atualmente utilizados pelo modelo para classificar
 * relacionamentos/fluxos.
 *
 * Esta definição será revisada posteriormente quando tratarmos
 * formalmente Fluxo, Relação Comercial, OU Gateway e XOU Gateway.
 */
export const RELATIONSHIP_TYPES: Array<{
  value: RelationshipType;
  label: string;
}> = [
  {
    value: 'product',
    label: 'Produto',
  },
  {
    value: 'service',
    label: 'Serviço',
  },
  {
    value: 'financial',
    label: 'Financeiro',
  },
  {
    value: 'information',
    label: 'Informação',
  },
];

/**
 * Recupera a definição completa de um tipo de ator SSN.
 */
export function getActorTypeDefinition(
  type: ActorType,
): ActorTypeDefinition {
  const definition = ACTOR_TYPES.find(
    (item) => item.value === type,
  );

  if (!definition) {
    throw new Error(
      `Tipo de ator SSN desconhecido: ${String(type)}`,
    );
  }

  return definition;
}

/**
 * Retorna apenas os atores diretos.
 */
export function getDirectActorTypes(): ActorTypeDefinition[] {
  return ACTOR_TYPES.filter(
    (actor) => actor.group === 'direct',
  );
}

/**
 * Retorna apenas os atores indiretos.
 */
export function getIndirectActorTypes(): ActorTypeDefinition[] {
  return ACTOR_TYPES.filter(
    (actor) => actor.group === 'indirect',
  );
}

/**
 * Retorna o nome amigável de um tipo de ator.
 */
export function actorTypeLabel(type: ActorType): string {
  return getActorTypeDefinition(type).label;
}

/**
 * Retorna o nome amigável de um tipo de relacionamento.
 */
export function relationshipTypeLabel(
  type: RelationshipType,
): string {
  return (
    RELATIONSHIP_TYPES.find(
      (item) => item.value === type,
    )?.label ?? type
  );
}

/**
 * Verifica se um valor recebido representa um ActorType válido.
 *
 * Útil principalmente no drag-and-drop, importação JSON
 * e validação de dados externos.
 */
export function isActorType(
  value: unknown,
): value is ActorType {
  if (typeof value !== 'string') {
    return false;
  }

  return ACTOR_TYPES.some(
    (actor) => actor.value === value,
  );
}