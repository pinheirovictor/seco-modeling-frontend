/* =========================================================
   VERSÃO DO MODELO
   ========================================================= */

/**
 * Versão atual do modelo canônico da ECOS Modeling 4.0.
 *
 * Enquanto a estrutura do modelo estiver em desenvolvimento,
 * utilizamos o sufixo "draft".
 */
export const MODEL_SCHEMA_VERSION =
  '4.0-draft' as const;

export type ModelSchemaVersion =
  typeof MODEL_SCHEMA_VERSION;

/* =========================================================
   ATORES SSN
   ========================================================= */

/**
 * Tipos de atores definidos pela notação SSN utilizada
 * pela ECOS Modeling.
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

/* =========================================================
   POSIÇÃO
   ========================================================= */

/**
 * Posição visual de um elemento no canvas.
 *
 * A posição faz parte do modelo porque deve ser preservada
 * ao salvar, exportar, importar e versionar um modelo.
 */
export interface Position {
  x: number;
  y: number;
}

/* =========================================================
   ATOR
   ========================================================= */

/**
 * Representação canônica de um ator SSN.
 *
 * Informações de apresentação visual como:
 *
 * - cor;
 * - forma;
 * - ícone;
 * - tamanho;
 *
 * NÃO são armazenadas aqui.
 *
 * Elas são definidas pelo catálogo SSN a partir de ActorType.
 */
export interface Actor {
  /**
   * Identificador único do ator dentro do modelo.
   */
  id: string;

  /**
   * Nome do ator no ecossistema modelado.
   *
   * Ex.:
   * GitHub
   * Microsoft
   * Desenvolvedor
   */
  name: string;

  /**
   * Papel do ator segundo a notação SSN.
   */
  type: ActorType;

  /**
   * Descrição específica da participação deste ator
   * no ecossistema representado.
   *
   * Esta descrição é diferente da definição formal
   * do tipo de ator existente em catalogs.ts.
   */
  description: string;

  /**
   * Posição do ator no diagrama.
   */
  position: Position;
}

/* =========================================================
   RELAÇÕES — ESTRUTURA PROVISÓRIA
   ========================================================= */

/**
 * IMPORTANTE:
 *
 * Esta enumeração ainda pertence ao MVP inicial.
 *
 * Pela definição formal da SSN, posteriormente vamos
 * representar separadamente:
 *
 * - Relação Comercial;
 * - Fluxo;
 * - OU Gateway;
 * - XOU Gateway.
 *
 * Portanto, RelationshipType não representa ainda
 * a estrutura definitiva da notação.
 */
export type RelationshipType =
  | 'product'
  | 'service'
  | 'financial'
  | 'information';

/**
 * Representação temporária de uma conexão entre atores.
 *
 * Esta interface será substituída/refatorada quando
 * implementarmos formalmente Relações Comerciais e Fluxos.
 */
export interface Relationship {
  id: string;

  sourceActorId: string;

  targetActorId: string;

  type: RelationshipType;

  name: string;

  description: string;
}

/* =========================================================
   MODELO DO ECOSSISTEMA
   ========================================================= */

/**
 * Modelo canônico da ECOS Modeling.
 *
 * Essa estrutura deve permanecer independente do React Flow.
 *
 * React Flow recebe uma adaptação desse modelo para gerar
 * nodes e edges no editor.
 */
export interface EcosystemModel {
  /**
   * Versão da estrutura de persistência.
   */
  schemaVersion: ModelSchemaVersion;

  /**
   * Identificador único do modelo.
   */
  id: string;

  /**
   * Nome do ecossistema/modelo.
   */
  name: string;

  /**
   * Descrição geral do ecossistema.
   */
  description: string;

  /**
   * Atores SSN.
   */
  actors: Actor[];

  /**
   * Estrutura provisória de relacionamentos.
   *
   * Será substituída posteriormente pela representação
   * formal de Relação Comercial, Fluxo e Gateways.
   */
  relationships: Relationship[];

  /**
   * Última alteração realizada no modelo.
   */
  updatedAt: string;
}

/* =========================================================
   SELEÇÃO DO EDITOR
   ========================================================= */

/**
 * Estado da seleção visual do editor.
 *
 * Permite seleção simples e múltipla.
 */
export interface EditorSelection {
  actorIds: string[];

  relationshipIds: string[];
}

/* =========================================================
   NOTIFICAÇÕES DO EDITOR
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