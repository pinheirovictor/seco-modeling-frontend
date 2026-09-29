import type {
  ActorType,
  FlowType,
  GatewayType,
} from './model';

/* =========================================================
   ATORES SSN
   ========================================================= */

export type ActorGroup =
  | 'direct'
  | 'indirect';

export type ActorShape =
  | 'rectangle'
  | 'arrow-right'
  | 'arrow-left'
  | 'hexagon'
  | 'notched-right'
  | 'parallelogram';

export interface ActorTypeDefinition {
  /**
   * Valor persistido no modelo.
   */
  value: ActorType;

  /**
   * Nome apresentado ao usuário.
   */
  label: string;

  /**
   * Abreviação do tipo.
   */
  shortLabel: string;

  /**
   * Classificação do ator dentro da notação.
   */
  group: ActorGroup;

  /**
   * Definição semântica do ator.
   */
  description: string;

  /**
   * Forma utilizada na representação visual.
   */
  shape: ActorShape;

  /**
   * Cor semântica utilizada em destaques.
   */
  accent: string;

  /**
   * Cor de preenchimento da forma.
   */
  surface: string;

  /**
   * Cor do texto.
   */
  text: string;
}

/**
 * Catálogo dos atores utilizados pela notação SSN
 * na ECOS Modeling.
 *
 * Atores diretos:
 *
 * - Companhia de Interesse
 * - Fornecedor
 * - Cliente
 *
 * Atores indiretos:
 *
 * - Intermediário
 * - Cliente do Cliente
 * - Agregador
 */
export const ACTOR_TYPES: ActorTypeDefinition[] = [
  {
    value:
      'company_of_interest',

    label:
      'Companhia de Interesse',

    shortLabel:
      'CoI',

    group:
      'direct',

    description:
      'Companhia que entrega o produto de interesse que está sob análise no ecossistema.',

    shape:
      'rectangle',

    // Azul
    accent:
      '#172554',

    surface:
      '#123CFF',

    text:
      '#FFFFFF',
  },

  {
    value:
      'supplier',

    label:
      'Fornecedor',

    shortLabel:
      'F',

    group:
      'direct',

    description:
      'Ator que fornece um ou mais produtos ou serviços.',

    shape:
      'arrow-right',

    // Laranja
    accent:
      '#92400E',

    surface:
      '#FFA412',

    text:
      '#111111',
  },

  {
    value:
      'customer',

    label:
      'Cliente',

    shortLabel:
      'C',

    group:
      'direct',

    description:
      'Ator que adquire ou faz uso do produto de interesse, seja esse uso direto ou indireto.',

    shape:
      'arrow-left',

    // Amarelo
    accent:
      '#854D0E',

    surface:
      '#FFF200',

    text:
      '#111111',
  },

  {
    value:
      'intermediary',

    label:
      'Intermediário',

    shortLabel:
      'I',

    group:
      'indirect',

    description:
      'Ator que atua como intermediário entre duas partes que se relacionam, como revendedores ou distribuidores.',

    shape:
      'hexagon',

    // Verde
    accent:
      '#166534',

    surface:
      '#32CC32',

    text:
      '#111111',
  },

  {
    value:
      'customer_of_customer',

    label:
      'Cliente do Cliente',

    shortLabel:
      'CC',

    group:
      'indirect',

    description:
      'Cliente de um cliente do ecossistema que utiliza produtos ou serviços relacionados direta ou indiretamente à Companhia de Interesse.',

    shape:
      'notched-right',

    // Cinza
    accent:
      '#475569',

    surface:
      '#D3D3D3',

    text:
      '#111111',
  },

  {
    value:
      'aggregator',

    label:
      'Agregador',

    shortLabel:
      'A',

    group:
      'indirect',

    description:
      'Empresa, produto ou serviço direta ou indiretamente ligado à Companhia de Interesse.',

    /*
     * A ECOS Modeling adota a representação visual
     * apresentada no diagrama de referência:
     * paralelogramo vermelho.
     */
    shape:
      'parallelogram',

    // Vermelho
    accent:
      '#991B1B',

    surface:
      '#FF1B1B',

    text:
      '#111111',
  },
];

/* =========================================================
   FLUXOS SSN
   ========================================================= */

/**
 * Tipos de Fluxo suportados pela notação.
 *
 * Um Fluxo representa um produto, serviço, finança
 * ou conteúdo transferido entre dois atores dentro
 * de uma Relação Comercial.
 */
export interface FlowTypeDefinition {
  /**
   * Valor persistido no modelo.
   */
  value: FlowType;

  /**
   * Nome apresentado ao usuário.
   */
  label: string;

  /**
   * Prefixo utilizado na representação do fluxo.
   *
   * Exemplos:
   *
   * P.1
   * S.1
   * F.1
   * C.1
   */
  prefix: string;

  /**
   * Descrição do tipo.
   */
  description: string;
}

export const FLOW_TYPES: FlowTypeDefinition[] = [
  {
    value:
      'product',

    label:
      'Produto',

    prefix:
      'P',

    description:
      'Fluxo correspondente à transferência de um produto entre atores.',
  },

  {
    value:
      'service',

    label:
      'Serviço',

    prefix:
      'S',

    description:
      'Fluxo correspondente à prestação ou disponibilização de um serviço entre atores.',
  },

  {
    value:
      'financial',

    label:
      'Finança',

    prefix:
      'F',

    description:
      'Fluxo financeiro existente entre os atores de uma Relação Comercial.',
  },

  {
    value:
      'content',

    label:
      'Conteúdo',

    prefix:
      'C',

    description:
      'Fluxo correspondente à transferência de conteúdo ou informação entre atores.',
  },
];

/* =========================================================
   GATEWAYS SSN
   ========================================================= */

export interface GatewayTypeDefinition {
  value: GatewayType;

  label: string;

  shortLabel: string;

  description: string;

  surface: string;

  text: string;
}

/**
 * Gateways lógicos utilizados na notação SSN.
 */
export const GATEWAY_TYPES: GatewayTypeDefinition[] = [
  {
    value:
      'or',

    label:
      'OU Gateway',

    shortLabel:
      'OU',

    description:
      'Relação lógica entre fluxos que permite um ou mais, ou todos, os relacionamentos comerciais e seus fluxos entre entradas e saídas.',

    surface:
      '#000000',

    text:
      '#FFFFFF',
  },

  {
    value:
      'xor',

    label:
      'XOU Gateway',

    shortLabel:
      'XOU',

    description:
      'Relação lógica entre fluxos que permite apenas uma alternativa entre os relacionamentos comerciais e seus fluxos de entrada e saída.',

    surface:
      '#000000',

    text:
      '#FFFFFF',
  },
];

/* =========================================================
   FUNÇÕES — ATORES
   ========================================================= */

/**
 * Recupera a definição completa de um tipo de ator.
 */
export function getActorTypeDefinition(
  type: ActorType,
): ActorTypeDefinition {
  const definition =
    ACTOR_TYPES.find(
      (item) =>
        item.value === type,
    );

  if (!definition) {
    throw new Error(
      `Tipo de ator SSN desconhecido: ${String(type)}`,
    );
  }

  return definition;
}

/**
 * Retorna os atores diretos.
 */
export function getDirectActorTypes():
  ActorTypeDefinition[] {
  return ACTOR_TYPES.filter(
    (actor) =>
      actor.group ===
      'direct',
  );
}

/**
 * Retorna os atores indiretos.
 */
export function getIndirectActorTypes():
  ActorTypeDefinition[] {
  return ACTOR_TYPES.filter(
    (actor) =>
      actor.group ===
      'indirect',
  );
}

/**
 * Nome amigável de um tipo de ator.
 */
export function actorTypeLabel(
  type: ActorType,
): string {
  return getActorTypeDefinition(
    type,
  ).label;
}

/**
 * Verifica se um valor representa um ActorType.
 */
export function isActorType(
  value: unknown,
): value is ActorType {
  if (
    typeof value !==
    'string'
  ) {
    return false;
  }

  return ACTOR_TYPES.some(
    (actor) =>
      actor.value === value,
  );
}

/* =========================================================
   FUNÇÕES — FLUXOS
   ========================================================= */

/**
 * Recupera a definição de um tipo de fluxo.
 */
export function getFlowTypeDefinition(
  type: FlowType,
): FlowTypeDefinition {
  const definition =
    FLOW_TYPES.find(
      (item) =>
        item.value === type,
    );

  if (!definition) {
    throw new Error(
      `Tipo de fluxo SSN desconhecido: ${String(type)}`,
    );
  }

  return definition;
}

/**
 * Retorna o nome amigável de um tipo de fluxo.
 */
export function flowTypeLabel(
  type: FlowType,
): string {
  return getFlowTypeDefinition(
    type,
  ).label;
}

/**
 * Retorna o prefixo utilizado pelo fluxo.
 *
 * Exemplos:
 *
 * product   -> P
 * service   -> S
 * financial -> F
 * content   -> C
 */
export function flowTypePrefix(
  type: FlowType,
): string {
  return getFlowTypeDefinition(
    type,
  ).prefix;
}

/**
 * Gera a representação textual de um fluxo.
 *
 * Exemplos:
 *
 * formatFlowCode('product', 1)
 * -> P.1
 *
 * formatFlowCode('service', 3)
 * -> S.3
 */
export function formatFlowCode(
  type: FlowType,
  identifier: number,
): string {
  return `${flowTypePrefix(type)}.${identifier}`;
}

/**
 * Verifica se um valor representa um FlowType.
 */
export function isFlowType(
  value: unknown,
): value is FlowType {
  if (
    typeof value !==
    'string'
  ) {
    return false;
  }

  return FLOW_TYPES.some(
    (flow) =>
      flow.value === value,
  );
}

/* =========================================================
   FUNÇÕES — GATEWAYS
   ========================================================= */

/**
 * Recupera a definição de um Gateway.
 */
export function getGatewayTypeDefinition(
  type: GatewayType,
): GatewayTypeDefinition {
  const definition =
    GATEWAY_TYPES.find(
      (item) =>
        item.value === type,
    );

  if (!definition) {
    throw new Error(
      `Tipo de Gateway SSN desconhecido: ${String(type)}`,
    );
  }

  return definition;
}

/**
 * Retorna o nome amigável de um Gateway.
 */
export function gatewayTypeLabel(
  type: GatewayType,
): string {
  return getGatewayTypeDefinition(
    type,
  ).label;
}

/**
 * Verifica se um valor representa um GatewayType.
 */
export function isGatewayType(
  value: unknown,
): value is GatewayType {
  if (
    typeof value !==
    'string'
  ) {
    return false;
  }

  return GATEWAY_TYPES.some(
    (gateway) =>
      gateway.value === value,
  );
}