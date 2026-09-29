import {
  ArrowLeftRight,
  Copy,
  Files,
  Plus,
  Trash2,
} from 'lucide-react';

import {
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

import {
  ACTOR_TYPES,
  FLOW_TYPES,
  formatFlowCode,
  getActorTypeDefinition,
} from '../../../domain/catalogs';

import {
  nextFlowIdentifier,
} from '../../../domain/factory';

import type {
  ActorType,
  FlowType,
} from '../../../domain/model';

import {
  actorHasDuplicateName,
} from '../../../domain/validation';

import {
  useEditorStore,
} from '../store/editorStore';

import {
  ActorShape,
} from './ActorShape';

/* =========================================================
   INPUTS COM TRANSAÇÃO
   ========================================================= */

/**
 * Campos de texto iniciam uma transação ao receber foco
 * e finalizam ao perder o foco.
 *
 * Dessa forma, várias teclas digitadas são registradas
 * como uma única operação de Undo/Redo.
 */
function TransactionInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const beginTransaction =
    useEditorStore(
      (state) =>
        state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) =>
        state.commitTransaction,
    );

  return (
    <input
      {...props}
      onFocus={(event) => {
        beginTransaction();

        props.onFocus?.(
          event,
        );
      }}
      onBlur={(event) => {
        commitTransaction();

        props.onBlur?.(
          event,
        );
      }}
    />
  );
}

function TransactionTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const beginTransaction =
    useEditorStore(
      (state) =>
        state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) =>
        state.commitTransaction,
    );

  return (
    <textarea
      {...props}
      onFocus={(event) => {
        beginTransaction();

        props.onFocus?.(
          event,
        );
      }}
      onBlur={(event) => {
        commitTransaction();

        props.onBlur?.(
          event,
        );
      }}
    />
  );
}

/* =========================================================
   PROPERTIES PANEL
   ========================================================= */

export function PropertiesPanel() {
  /* -------------------------------------------------------
     ESTADO LOCAL PARA CRIAÇÃO DE FLUXO
     ------------------------------------------------------- */

  const [
    newFlowType,
    setNewFlowType,
  ] =
    useState<FlowType>(
      'product',
    );

  const [
    newFlowDirection,
    setNewFlowDirection,
  ] =
    useState<
      'a-to-b' |
      'b-to-a'
    >(
      'a-to-b',
    );

  /* -------------------------------------------------------
     STORE
     ------------------------------------------------------- */

  const model =
    useEditorStore(
      (state) =>
        state.model,
    );

  const selection =
    useEditorStore(
      (state) =>
        state.selection,
    );

  const updateActor =
    useEditorStore(
      (state) =>
        state.updateActor,
    );

  const updateCommercialRelationship =
    useEditorStore(
      (state) =>
        state.updateCommercialRelationship,
    );

  const addFlow =
    useEditorStore(
      (state) =>
        state.addFlow,
    );

  const updateFlow =
    useEditorStore(
      (state) =>
        state.updateFlow,
    );

  const swapFlowDirection =
    useEditorStore(
      (state) =>
        state.swapFlowDirection,
    );

  const selectOnlyFlow =
    useEditorStore(
      (state) =>
        state.selectOnlyFlow,
    );

  const deleteSelection =
    useEditorStore(
      (state) =>
        state.deleteSelection,
    );

  const copySelectedActors =
    useEditorStore(
      (state) =>
        state.copySelectedActors,
    );

  const duplicateSelectedActors =
    useEditorStore(
      (state) =>
        state.duplicateSelectedActors,
    );

  /* =======================================================
     SELEÇÃO
     ======================================================= */

  const totalSelected =
    selection.actorIds.length +
    selection
      .commercialRelationshipIds
      .length +
    selection.flowIds.length +
    selection.gatewayIds.length;

  /* -------------------------------------------------------
     ATOR
     ------------------------------------------------------- */

  const actor =
    totalSelected === 1 &&
    selection.actorIds.length === 1
      ? model.actors.find(
          (item) =>
            item.id ===
            selection.actorIds[0],
        )
      : undefined;

  /* -------------------------------------------------------
     RELAÇÃO COMERCIAL
     ------------------------------------------------------- */

  const commercialRelationship =
    totalSelected === 1 &&
    selection
      .commercialRelationshipIds
      .length === 1
      ? model
          .commercialRelationships
          .find(
            (item) =>
              item.id ===
              selection
                .commercialRelationshipIds[0],
          )
      : undefined;

  /* -------------------------------------------------------
     FLUXO
     ------------------------------------------------------- */

  const flow =
    totalSelected === 1 &&
    selection.flowIds.length === 1
      ? model.flows.find(
          (item) =>
            item.id ===
            selection.flowIds[0],
        )
      : undefined;

  /* =======================================================
     DADOS DO ATOR
     ======================================================= */

  const actorDefinition =
    actor
      ? getActorTypeDefinition(
          actor.type,
        )
      : undefined;

  const duplicateName =
    actor
      ? actorHasDuplicateName(
          model,
          actor.id,
        )
      : false;

  const anotherCompanyOfInterestExists =
    actor
      ? model.actors.some(
          (item) =>
            item.id !==
              actor.id &&
            item.type ===
              'company_of_interest',
        )
      : false;

  /* =======================================================
     DADOS DA RELAÇÃO COMERCIAL
     ======================================================= */

  const actorA =
    commercialRelationship
      ? model.actors.find(
          (item) =>
            item.id ===
            commercialRelationship
              .actorAId,
        )
      : undefined;

  const actorB =
    commercialRelationship
      ? model.actors.find(
          (item) =>
            item.id ===
            commercialRelationship
              .actorBId,
        )
      : undefined;

  const relationshipFlows =
    commercialRelationship
      ? model.flows.filter(
          (item) =>
            item
              .commercialRelationshipId ===
            commercialRelationship.id,
        )
      : [];

  /* =======================================================
     DADOS DO FLUXO
     ======================================================= */

  const flowRelationship =
    flow
      ? model
          .commercialRelationships
          .find(
            (item) =>
              item.id ===
              flow
                .commercialRelationshipId,
          )
      : undefined;

  const flowSourceActor =
    flow
      ? model.actors.find(
          (item) =>
            item.id ===
            flow.sourceActorId,
        )
      : undefined;

  const flowTargetActor =
    flow
      ? model.actors.find(
          (item) =>
            item.id ===
            flow.targetActorId,
        )
      : undefined;

  /* =======================================================
     CRIAÇÃO DE FLUXO
     ======================================================= */

  function handleAddFlow() {
    if (
      !commercialRelationship
    ) {
      return;
    }

    const sourceActorId =
      newFlowDirection ===
      'a-to-b'
        ? commercialRelationship
            .actorAId
        : commercialRelationship
            .actorBId;

    const targetActorId =
      newFlowDirection ===
      'a-to-b'
        ? commercialRelationship
            .actorBId
        : commercialRelationship
            .actorAId;

    addFlow(
      commercialRelationship.id,
      sourceActorId,
      targetActorId,
      newFlowType,
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <aside
      className="panel properties-panel"
      aria-label="Propriedades do elemento selecionado"
    >
      <div className="panel__heading">
        <div>
          <span className="eyebrow">
            Inspetor
          </span>

          <h2>
            Propriedades
          </h2>
        </div>
      </div>

      {/* ===================================================
          NENHUMA SELEÇÃO
          =================================================== */}

      {totalSelected === 0 ? (
        <div className="empty-properties">
          <div className="empty-properties__icon">
            ⌁
          </div>

          <strong>
            Nenhum elemento selecionado
          </strong>

          <p>
            Selecione um ator, uma Relação Comercial
            ou um Fluxo para visualizar e editar suas
            propriedades.
          </p>
        </div>
      ) : null}

      {/* ===================================================
          SELEÇÃO MÚLTIPLA
          =================================================== */}

      {totalSelected > 1 ? (
        <div className="multi-properties">
          <div className="properties-badge">
            Seleção múltipla
          </div>

          <strong>
            {totalSelected}{' '}
            elementos selecionados
          </strong>

          <p>
            {selection.actorIds.length}{' '}
            ator(es),{' '}
            {
              selection
                .commercialRelationshipIds
                .length
            }{' '}
            relação(ões) comercial(is) e{' '}
            {selection.flowIds.length}{' '}
            fluxo(s).
          </p>

          {selection.actorIds.length > 0 ? (
            <div className="multi-properties__actions">
              <button
                type="button"
                onClick={
                  copySelectedActors
                }
              >
                <Copy size={15} />

                Copiar atores
              </button>

              <button
                type="button"
                onClick={
                  duplicateSelectedActors
                }
              >
                <Files size={15} />

                Duplicar atores
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ===================================================
          ATOR SSN
          =================================================== */}

      {actor && actorDefinition ? (
        <div className="form-stack">
          {/* -----------------------------------------------
              PREVIEW
              ----------------------------------------------- */}

          <div className="actor-preview">
            <ActorShape
              type={actor.type}
              compact
            />

            <div>
              <span className="eyebrow">
                Ator SSN
              </span>

              <strong>
                {actorDefinition.label}
              </strong>
            </div>
          </div>

          {/* -----------------------------------------------
              TIPO
              ----------------------------------------------- */}

          <label>
            Tipo de ator

            <select
              value={actor.type}
              onChange={(event) => {
                updateActor(
                  actor.id,
                  {
                    type:
                      event.target
                        .value as ActorType,
                  },
                );
              }}
            >
              <optgroup label="Atores diretos">
                {ACTOR_TYPES
                  .filter(
                    (type) =>
                      type.group ===
                      'direct',
                  )
                  .map(
                    (type) => (
                      <option
                        key={
                          type.value
                        }
                        value={
                          type.value
                        }
                        disabled={
                          type.value ===
                            'company_of_interest' &&
                          actor.type !==
                            'company_of_interest' &&
                          anotherCompanyOfInterestExists
                        }
                      >
                        {
                          type.label
                        }
                      </option>
                    ),
                  )}
              </optgroup>

              <optgroup label="Atores indiretos">
                {ACTOR_TYPES
                  .filter(
                    (type) =>
                      type.group ===
                      'indirect',
                  )
                  .map(
                    (type) => (
                      <option
                        key={
                          type.value
                        }
                        value={
                          type.value
                        }
                      >
                        {
                          type.label
                        }
                      </option>
                    ),
                  )}
              </optgroup>
            </select>

            <small className="field-help">
              Um modelo pode possuir apenas uma
              Companhia de Interesse (CoI).
            </small>
          </label>

          {/* -----------------------------------------------
              DEFINIÇÃO SSN
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Definição SSN
            </span>

            <p>
              {
                actorDefinition
                  .description
              }
            </p>

            <small>
              {actorDefinition.group ===
              'direct'
                ? 'Ator direto'
                : 'Ator indireto'}
            </small>
          </div>

          {/* -----------------------------------------------
              NOME
              ----------------------------------------------- */}

          <label>
            Nome

            <TransactionInput
              className={
                duplicateName
                  ? 'field-invalid'
                  : undefined
              }
              aria-invalid={
                duplicateName
              }
              value={
                actor.name
              }
              placeholder="Nome do ator"
              autoComplete="off"
              onChange={(event) => {
                updateActor(
                  actor.id,
                  {
                    name:
                      event.target
                        .value,
                  },
                  false,
                );
              }}
            />

            {duplicateName ? (
              <small className="field-error">
                Já existe outro ator com este nome
                no modelo.
              </small>
            ) : (
              <small className="field-help">
                Os nomes dos atores devem ser únicos
                dentro do mesmo modelo.
              </small>
            )}
          </label>

          {/* -----------------------------------------------
              DESCRIÇÃO
              ----------------------------------------------- */}

          <label>
            Descrição no modelo

            <TransactionTextarea
              rows={6}
              value={
                actor.description
              }
              placeholder="Descreva o papel específico deste ator no ecossistema modelado."
              onChange={(event) => {
                updateActor(
                  actor.id,
                  {
                    description:
                      event.target
                        .value,
                  },
                  false,
                );
              }}
            />

            <small className="field-help">
              Esta descrição pertence ao ator deste
              modelo e não altera sua definição SSN.
            </small>
          </label>
        </div>
      ) : null}

      {/* ===================================================
          RELAÇÃO COMERCIAL
          =================================================== */}

      {commercialRelationship ? (
        <div className="form-stack">
          <div className="properties-badge">
            Relação Comercial
          </div>

          {/* -----------------------------------------------
              ATORES DA RELAÇÃO
              ----------------------------------------------- */}

          <div className="relationship-summary">
            <div>
              <span>
                Ator
              </span>

              <strong>
                {actorA?.name ||
                  'Ator não encontrado'}
              </strong>
            </div>

            <span className="relationship-summary__arrow">
              —
            </span>

            <div>
              <span>
                Ator
              </span>

              <strong>
                {actorB?.name ||
                  'Ator não encontrado'}
              </strong>
            </div>
          </div>

          <small className="field-help">
            A Relação Comercial não possui direção.
            A direção é definida individualmente em
            cada Fluxo.
          </small>

          {/* -----------------------------------------------
              DESCRIÇÃO DA RELAÇÃO
              ----------------------------------------------- */}

          <label>
            Descrição da relação

            <TransactionTextarea
              rows={4}
              value={
                commercialRelationship
                  .description
              }
              placeholder="Descreva a relação comercial entre os atores."
              onChange={(event) => {
                updateCommercialRelationship(
                  commercialRelationship.id,
                  {
                    description:
                      event.target
                        .value,
                  },
                  false,
                );
              }}
            />
          </label>

          {/* -----------------------------------------------
              FLUXOS EXISTENTES
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Fluxos
            </span>

            {relationshipFlows.length ===
            0 ? (
              <p>
                Esta Relação Comercial ainda não possui
                Fluxos.
              </p>
            ) : (
              <div className="relationship-flows">
                {relationshipFlows.map(
                  (item) => {
                    const source =
                      model.actors.find(
                        (actorItem) =>
                          actorItem.id ===
                          item.sourceActorId,
                      );

                    const target =
                      model.actors.find(
                        (actorItem) =>
                          actorItem.id ===
                          item.targetActorId,
                      );

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        className="relationship-flow-item"
                        onClick={() => {
                          selectOnlyFlow(
                            item.id,
                          );
                        }}
                      >
                        <strong>
                          {formatFlowCode(
                            item.type,
                            item.identifier,
                          )}
                        </strong>

                        <span>
                          {source?.name ??
                            'Ator'}{' '}
                          →{' '}
                          {target?.name ??
                            'Ator'}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* -----------------------------------------------
              NOVO FLUXO
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Adicionar Fluxo
            </span>

            <label>
              Tipo

              <select
                value={
                  newFlowType
                }
                onChange={(event) => {
                  setNewFlowType(
                    event.target
                      .value as FlowType,
                  );
                }}
              >
                {FLOW_TYPES.map(
                  (type) => (
                    <option
                      key={
                        type.value
                      }
                      value={
                        type.value
                      }
                    >
                      {
                        type.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Direção

              <select
                value={
                  newFlowDirection
                }
                onChange={(event) => {
                  setNewFlowDirection(
                    event.target.value as
                      | 'a-to-b'
                      | 'b-to-a',
                  );
                }}
              >
                <option value="a-to-b">
                  {actorA?.name ??
                    'Ator A'}{' '}
                  →{' '}
                  {actorB?.name ??
                    'Ator B'}
                </option>

                <option value="b-to-a">
                  {actorB?.name ??
                    'Ator B'}{' '}
                  →{' '}
                  {actorA?.name ??
                    'Ator A'}
                </option>
              </select>
            </label>

            <button
              type="button"
              onClick={
                handleAddFlow
              }
            >
              <Plus size={15} />

              Adicionar fluxo
            </button>

            <small className="field-help">
              O código será gerado automaticamente,
              por exemplo P.1, S.1, F.1 ou C.1.
            </small>
          </div>
        </div>
      ) : null}

      {/* ===================================================
          FLUXO
          =================================================== */}

      {flow ? (
        <div className="form-stack">
          <div className="properties-badge">
            Fluxo{' '}
            {formatFlowCode(
              flow.type,
              flow.identifier,
            )}
          </div>

          {/* -----------------------------------------------
              RELAÇÃO À QUAL PERTENCE
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Relação Comercial
            </span>

            <p>
              {flowRelationship
                ? `${
                    model.actors.find(
                      (item) =>
                        item.id ===
                        flowRelationship.actorAId,
                    )?.name ??
                    'Ator'
                  } — ${
                    model.actors.find(
                      (item) =>
                        item.id ===
                        flowRelationship.actorBId,
                    )?.name ??
                    'Ator'
                  }`
                : 'Relação não encontrada'}
            </p>
          </div>

          {/* -----------------------------------------------
              TIPO
              ----------------------------------------------- */}

          <label>
            Tipo de fluxo

            <select
              value={
                flow.type
              }
              onChange={(event) => {
                const type =
                  event.target
                    .value as FlowType;

                if (
                  type ===
                  flow.type
                ) {
                  return;
                }

                const otherFlows =
                  model.flows.filter(
                    (item) =>
                      item.id !==
                      flow.id,
                  );

                updateFlow(
                  flow.id,
                  {
                    type,

                    identifier:
                      nextFlowIdentifier(
                        type,
                        otherFlows,
                      ),
                  },
                );
              }}
            >
              {FLOW_TYPES.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          {/* -----------------------------------------------
              IDENTIFICADOR
              ----------------------------------------------- */}

          <label>
            Identificador

            <TransactionInput
              type="number"
              min={1}
              step={1}
              value={
                flow.identifier
              }
              onChange={(event) => {
                const identifier =
                  Number(
                    event.target
                      .value,
                  );

                if (
                  !Number.isInteger(
                    identifier,
                  ) ||
                  identifier < 1
                ) {
                  return;
                }

                updateFlow(
                  flow.id,
                  {
                    identifier,
                  },
                  false,
                );
              }}
            />

            <small className="field-help">
              Representação atual:{' '}
              <strong>
                {formatFlowCode(
                  flow.type,
                  flow.identifier,
                )}
              </strong>
            </small>
          </label>

          {/* -----------------------------------------------
              DIREÇÃO
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Direção do Fluxo
            </span>

            <div className="relationship-summary">
              <div>
                <span>
                  Origem
                </span>

                <strong>
                  {flowSourceActor?.name ||
                    'Ator não encontrado'}
                </strong>
              </div>

              <span className="relationship-summary__arrow">
                →
              </span>

              <div>
                <span>
                  Destino
                </span>

                <strong>
                  {flowTargetActor?.name ||
                    'Ator não encontrado'}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                swapFlowDirection(
                  flow.id,
                );
              }}
            >
              <ArrowLeftRight
                size={15}
              />

              Inverter direção
            </button>
          </div>

          {/* -----------------------------------------------
              NOME
              ----------------------------------------------- */}

          <label>
            Nome

            <TransactionInput
              value={
                flow.name
              }
              placeholder="Nome opcional do fluxo"
              autoComplete="off"
              onChange={(event) => {
                updateFlow(
                  flow.id,
                  {
                    name:
                      event.target
                        .value,
                  },
                  false,
                );
              }}
            />

            <small className="field-help">
              O nome descreve semanticamente o Fluxo,
              mas no diagrama será exibido apenas o
              código.
            </small>
          </label>

          {/* -----------------------------------------------
              DESCRIÇÃO
              ----------------------------------------------- */}

          <label>
            Descrição

            <TransactionTextarea
              rows={5}
              value={
                flow.description
              }
              placeholder="Descreva o produto, serviço, finança ou conteúdo transferido."
              onChange={(event) => {
                updateFlow(
                  flow.id,
                  {
                    description:
                      event.target
                        .value,
                  },
                  false,
                );
              }}
            />
          </label>
        </div>
      ) : null}

      {/* ===================================================
          EXCLUSÃO
          =================================================== */}

      {totalSelected > 0 ? (
        <button
          type="button"
          className="danger-button"
          onClick={
            deleteSelection
          }
        >
          <Trash2 size={16} />

          {totalSelected === 1
            ? 'Excluir elemento'
            : 'Excluir selecionados'}
        </button>
      ) : null}
    </aside>
  );
}