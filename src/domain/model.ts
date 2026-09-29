/* =========================================================
   VERSÃO DO MODELO
   ========================================================= */

/**
 * Versão atual do modelo canônico da ECOS Modeling 4.0.
 *
 * Enquanto a estrutura ainda estiver em evolução,
 * utilizamos o sufixo "draft".
 */
export const MODEL_SCHEMA_VERSION =
  '4.0-draft' as const;

export type ModelSchemaVersion =
  typeof MODEL_SCHEMA_VERSION;

/* =========================================================
   POSIÇÃO
   ========================================================= */

/**
 * Coordenada de um elemento no canvas.
 */
export interface Position {
  x: number;
  y: number;
}

/* =========================================================
   ATORES SSN
   ========================================================= */

/**
 * Tipos de atores utilizados pela notação SSN
 * da ECOS Modeling.
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
export type ActorType =
  | 'company_of_interest'
  | 'supplier'
  | 'customer'
  | 'intermediary'
  | 'customer_of_customer'
  | 'aggregator';

/**
 * Representação canônica de um ator SSN.
 *
 * Informações visuais como cor e forma não são
 * armazenadas aqui. Elas são determinadas pelo
 * catálogo SSN a partir do ActorType.
 */
export interface Actor {
  /**
   * Identificador único do ator.
   */
  id: string;

  /**
   * Nome concreto do ator no ecossistema.
   *
   * Exemplos:
   * - GitHub
   * - Unity
   * - Professores
   * - Google Drive
   */
  name: string;

  /**
   * Tipo do ator segundo a notação SSN.
   */
  type: ActorType;

  /**
   * Descrição específica da participação do ator
   * no ecossistema modelado.
   */
  description: string;

  /**
   * Posição no canvas.
   */
  position: Position;
}

/* =========================================================
   RELAÇÃO COMERCIAL
   ========================================================= */

/**
 * Relação Comercial da notação SSN.
 *
 * Uma Relação Comercial conecta exatamente dois atores.
 *
 * IMPORTANTE:
 *
 * A Relação Comercial NÃO possui direção.
 *
 * Visualmente ela é representada por uma linha preta,
 * sólida e sem seta.
 *
 * A direção pertence aos Fluxos associados a ela.
 *
 * Exemplo:
 *
 * Fornecedor ───────────────── Companhia de Interesse
 *
 * Esta linha representa apenas a existência de uma
 * relação comercial entre os dois atores.
 */
export interface CommercialRelationship {
  /**
   * Identificador único da relação.
   */
  id: string;

  /**
   * Primeiro ator participante da relação.
   */
  actorAId: string;

  /**
   * Segundo ator participante da relação.
   */
  actorBId: string;

  /**
   * Descrição opcional da relação comercial.
   */
  description: string;
}

/* =========================================================
   FLUXOS
   ========================================================= */

/**
 * Tipos de fluxo utilizados pela notação SSN.
 *
 * Cada tipo possui posteriormente uma representação
 * textual como:
 *
 * Produto     -> P
 * Serviço     -> S
 * Financeiro  -> F
 * Conteúdo    -> C
 */
export type FlowType =
  | 'product'
  | 'service'
  | 'financial'
  | 'content';

/**
 * Um Fluxo representa um artefato ou serviço transferido
 * de um ator para outro dentro de uma Relação Comercial.
 *
 * Diferentemente da Relação Comercial, o Fluxo possui
 * direção.
 *
 * Exemplo:
 *
 * Unity ───────── [ P.1 ] ───────── SkinnerBox
 *
 * onde:
 *
 * P = Produto
 * 1 = identificador do fluxo
 */
export interface Flow {
  /**
   * Identificador interno único.
   */
  id: string;

  /**
   * Relação Comercial à qual este fluxo pertence.
   */
  commercialRelationshipId: string;

  /**
   * Ator de origem do fluxo.
   */
  sourceActorId: string;

  /**
   * Ator de destino do fluxo.
   */
  targetActorId: string;

  /**
   * Tipo do fluxo.
   */
  type: FlowType;

  /**
   * Número utilizado na representação visual.
   *
   * Exemplo:
   *
   * type = product
   * identifier = 1
   *
   * representação:
   *
   * P.1
   */
  identifier: number;

  /**
   * Nome opcional utilizado para descrever semanticamente
   * o fluxo.
   *
   * Exemplo:
   *
   * "Licença do Unity"
   * "Serviço de armazenamento"
   */
  name: string;

  /**
   * Descrição detalhada opcional.
   */
  description: string;
}

/* =========================================================
   GATEWAYS
   ========================================================= */

/**
 * Tipos de Gateway definidos pela notação SSN.
 *
 * OR:
 * permite um ou mais fluxos.
 *
 * XOR:
 * permite apenas uma alternativa.
 */
export type GatewayType =
  | 'or'
  | 'xor';

/**
 * Estrutura reservada para os Gateways SSN.
 *
 * A representação e as regras de conexão serão
 * implementadas em uma próxima etapa.
 *
 * Já incluímos o conceito no modelo para evitar nova
 * ruptura da estrutura de persistência em seguida.
 */
export interface Gateway {
  id: string;

  type: GatewayType;

  position: Position;
}

/* =========================================================
   MODELO DO ECOSSISTEMA
   ========================================================= */

/**
 * Representação canônica de um modelo SSN.
 *
 * Esta estrutura é independente do React Flow.
 */
export interface EcosystemModel {
  /**
   * Versão da estrutura do modelo.
   */
  schemaVersion: ModelSchemaVersion;

  /**
   * Identificador único.
   */
  id: string;

  /**
   * Nome do modelo/ecossistema.
   */
  name: string;

  /**
   * Descrição geral.
   */
  description: string;

  /**
   * Atores SSN.
   */
  actors: Actor[];

  /**
   * Relações Comerciais.
   *
   * Visualmente:
   *
   * Ator ───────────────── Ator
   */
  commercialRelationships: CommercialRelationship[];

  /**
   * Fluxos associados às Relações Comerciais.
   *
   * Visualmente:
   *
   * ───────── [ P.1 ] ─────────
   */
  flows: Flow[];

  /**
   * Gateways OU/XOU.
   *
   * A implementação visual será feita posteriormente.
   */
  gateways: Gateway[];

  /**
   * Data/hora da última modificação.
   */
  updatedAt: string;
}

/* =========================================================
   SELEÇÃO DO EDITOR
   ========================================================= */

/**
 * Seleção atual do editor.
 *
 * Já separamos os tipos de elementos para que o painel
 * de propriedades consiga tratar cada conceito SSN
 * individualmente.
 */
export interface EditorSelection {
  actorIds: string[];

  commercialRelationshipIds: string[];

  flowIds: string[];

  gatewayIds: string[];
}

/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

export type EditorNoticeTone =
  | 'info'
  | 'warning'
  | 'error'
  | 'success';

export interface EditorNotice {
  id: string;

  tone: EditorNoticeTone;

  message: string;
}