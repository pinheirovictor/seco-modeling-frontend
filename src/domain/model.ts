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
   METADADOS DO MODELO
   ========================================================= */

/**
 * Referência associada ao ecossistema modelado.
 *
 * O campo "text" pode armazenar uma referência bibliográfica,
 * documentação, relatório, página institucional ou outra fonte
 * utilizada durante a construção do modelo.
 *
 * "url" é opcional porque nem toda referência possui
 * endereço eletrônico.
 */
export interface ModelReference {
  id: string;

  text: string;

  url?: string;
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
   * Descrição/observações sobre a participação
   * do ator no ecossistema modelado.
   *
   * Este campo também pode registrar a justificativa
   * para inclusão do ator no escopo do modelo.
   */
  description: string;

  /**
   * Posição do ator no canvas.
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
   * Descrição ou significado da relação comercial.
   */
  description: string;
}

/* =========================================================
   FLUXOS
   ========================================================= */

/**
 * Tipos de fluxo utilizados pela notação SSN.
 *
 * Cada tipo possui uma representação textual:
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
 * Um Fluxo representa um elemento de valor transferido
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
   * Nome utilizado para descrever semanticamente
   * o elemento de valor.
   *
   * Exemplos:
   *
   * "Licença do Unity"
   * "Serviço de armazenamento"
   * "Pagamento"
   */
  name: string;

  /**
   * Descrição detalhada do fluxo.
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
 * permite uma ou mais alternativas.
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
 * A representação visual e as regras específicas
 * de conexão serão implementadas posteriormente.
 */
export interface Gateway {
  /**
   * Identificador único.
   */
  id: string;

  /**
   * Tipo do gateway.
   */
  type: GatewayType;

  /**
   * Posição no canvas.
   */
  position: Position;
}

/* =========================================================
   ANOTAÇÕES
   ========================================================= */

/**
 * Anotação textual livre utilizada para auxiliar
 * a organização e compreensão do diagrama.
 *
 * Anotações não fazem parte da estrutura semântica SSN
 * e, portanto, não devem participar das métricas
 * estruturais do ecossistema.
 */
export interface Annotation {
  /**
   * Identificador único.
   */
  id: string;

  /**
   * Conteúdo textual da anotação.
   */
  text: string;

  /**
   * Posição da anotação no canvas.
   */
  position: Position;
}

/* =========================================================
   SECO-GUIDE
   ========================================================= */

/**
 * Etapa 1 — Scope and Objectives Definition.
 *
 * Registra as decisões de escopo que não podem ser
 * representadas apenas pelo diagrama SSN.
 */
export interface SecoGuideScope {
  /**
   * Propósito da modelagem.
   */
  purpose: string;

  /**
   * Limites considerados para o ecossistema.
   */
  boundaries: string;

  /**
   * Objetivos específicos da modelagem.
   */
  objectives: string;
}

/**
 * Etapa 2 — Direct Actors Identification.
 *
 * Os atores propriamente ditos NÃO são duplicados aqui.
 * Eles permanecem exclusivamente em EcosystemModel.actors.
 */
export interface SecoGuideDirectActors {
  /**
   * Observações gerais sobre a identificação,
   * seleção e classificação dos atores diretos.
   */
  notes: string;
}

/**
 * Etapa 3 — Intermediary Actors Identification.
 *
 * Um ecossistema pode não possuir atores intermediários.
 * Por isso, o campo "reviewed" permite registrar que
 * essa possibilidade foi efetivamente analisada.
 */
export interface SecoGuideIntermediaryActors {
  /**
   * Observações sobre intermediários, agregadores,
   * clientes dos clientes e outros atores mediadores.
   */
  notes: string;

  /**
   * Indica que a necessidade de atores intermediários
   * foi analisada pelo modelador.
   *
   * Não significa necessariamente que algum ator
   * intermediário tenha sido identificado.
   */
  reviewed: boolean;
}

/**
 * Etapa 4 — Relationship Definition.
 *
 * As relações permanecem exclusivamente em
 * commercialRelationships.
 */
export interface SecoGuideRelationships {
  /**
   * Observações gerais sobre a definição
   * dos relacionamentos.
   */
  notes: string;
}

/**
 * Etapa 5 — Value Flow Mapping.
 *
 * Os fluxos permanecem exclusivamente em flows.
 */
export interface SecoGuideValueFlows {
  /**
   * Observações gerais sobre os elementos de valor
   * e as trocas identificadas.
   */
  notes: string;
}

/**
 * Etapa 6 — SSN Diagram Construction.
 */
export interface SecoGuideDiagram {
  /**
   * Critério utilizado para organizar visualmente
   * o diagrama.
   *
   * Exemplos:
   * - agrupamento por papel;
   * - proximidade estrutural;
   * - organização em torno da Companhia de Interesse.
   */
  organizationCriteria: string;

  /**
   * Observações sobre a organização do diagrama.
   */
  notes: string;

  /**
   * Indica que o modelador realizou a inspeção
   * visual prevista pelo SECO-Guide.
   *
   * Alguns aspectos de legibilidade não podem ser
   * determinados integralmente de forma automática.
   */
  visuallyReviewed: boolean;
}

/**
 * Etapa 7 — Diagram Review and Refinement.
 */
export interface SecoGuideReview {
  /**
   * Registro dos principais aspectos revisados.
   */
  reviewedPoints: string;

  /**
   * Problemas ou decisões ainda pendentes.
   */
  pendingIssues: string;

  /**
   * Indica que o ciclo de revisão foi executado.
   *
   * Isso não significa necessariamente que o modelo
   * não possua avisos ou sugestões.
   */
  completed: boolean;
}

/**
 * Dados produzidos durante a execução do SECO-Guide.
 *
 * IMPORTANTE:
 *
 * Esta estrutura não contém cópias de atores,
 * relações ou fluxos.
 *
 * Esses elementos pertencem ao modelo SSN canônico.
 * O SECO-Guide armazena somente decisões e informações
 * complementares produzidas durante o processo
 * de modelagem.
 */
export interface SecoGuideData {
  /**
   * Etapa 1.
   */
  scope: SecoGuideScope;

  /**
   * Etapa 2.
   */
  directActors: SecoGuideDirectActors;

  /**
   * Etapa 3.
   */
  intermediaryActors: SecoGuideIntermediaryActors;

  /**
   * Etapa 4.
   */
  relationships: SecoGuideRelationships;

  /**
   * Etapa 5.
   */
  valueFlows: SecoGuideValueFlows;

  /**
   * Etapa 6.
   */
  diagram: SecoGuideDiagram;

  /**
   * Etapa 7.
   */
  review: SecoGuideReview;
}

/* =========================================================
   MODELO DO ECOSSISTEMA
   ========================================================= */

/**
 * Representação canônica de um modelo SSN.
 *
 * Esta estrutura é independente do React Flow.
 *
 * React Flow deve ser tratado somente como camada
 * de visualização e interação.
 */
export interface EcosystemModel {
  /**
   * Versão da estrutura do modelo.
   */
  schemaVersion: ModelSchemaVersion;

  /**
   * Identificador único do modelo.
   */
  id: string;

  /**
   * Nome do modelo/ecossistema.
   */
  name: string;

  /**
   * Descrição geral do modelo.
   */
  description: string;

  /**
   * Domínio do ecossistema.
   *
   * Exemplos:
   * - Educação
   * - Saúde
   * - Governo
   * - Desenvolvimento de Software
   */
  domain: string;

  /**
   * Palavras-chave associadas ao modelo.
   */
  keywords: string[];

  /**
   * Referências utilizadas durante a modelagem.
   */
  references: ModelReference[];

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
   * Gateways OR/XOR.
   *
   * A implementação visual será finalizada
   * posteriormente.
   */
  gateways: Gateway[];

  /**
   * Anotações textuais livres do diagrama.
   *
   * Não fazem parte da estrutura semântica SSN.
   */
  annotations: Annotation[];

  /**
   * Informações complementares produzidas durante
   * a execução do SECO-Guide.
   */
  secoGuide: SecoGuideData;

  /**
   * Data/hora da última modificação.
   *
   * Formato ISO 8601.
   */
  updatedAt: string;
}

/* =========================================================
   SELEÇÃO DO EDITOR
   ========================================================= */

/**
 * Seleção atual do editor.
 *
 * Os tipos de elementos são mantidos separadamente para
 * que o painel de propriedades e as ações do editor
 * possam tratar cada conceito individualmente.
 */
export interface EditorSelection {
  /**
   * Atores selecionados.
   */
  actorIds: string[];

  /**
   * Relações Comerciais selecionadas.
   */
  commercialRelationshipIds: string[];

  /**
   * Fluxos selecionados.
   */
  flowIds: string[];

  /**
   * Gateways selecionados.
   */
  gatewayIds: string[];

  /**
   * Anotações selecionadas.
   */
  annotationIds: string[];
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
  /**
   * Identificador da notificação.
   */
  id: string;

  /**
   * Tipo visual/semântico da notificação.
   */
  tone: EditorNoticeTone;

  /**
   * Mensagem apresentada ao usuário.
   */
  message: string;
}