import {
  Copy,
  Files,
  Trash2,
} from 'lucide-react';

import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import {
  ACTOR_TYPES,
  RELATIONSHIP_TYPES,
  getActorTypeDefinition,
} from '../../../domain/catalogs';

import type {
  ActorType,
  RelationshipType,
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
 * Os campos de texto iniciam uma transação ao receber foco
 * e a finalizam ao perder o foco.
 *
 * Isso evita gerar uma entrada de Undo/Redo para cada tecla
 * digitada pelo usuário.
 */
function TransactionInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  const beginTransaction =
    useEditorStore(
      (state) => state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) => state.commitTransaction,
    );

  return (
    <input
      {...props}
      onFocus={(event) => {
        beginTransaction();

        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        commitTransaction();

        props.onBlur?.(event);
      }}
    />
  );
}

function TransactionTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const beginTransaction =
    useEditorStore(
      (state) => state.beginTransaction,
    );

  const commitTransaction =
    useEditorStore(
      (state) => state.commitTransaction,
    );

  return (
    <textarea
      {...props}
      onFocus={(event) => {
        beginTransaction();

        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        commitTransaction();

        props.onBlur?.(event);
      }}
    />
  );
}

/* =========================================================
   PROPERTIES PANEL
   ========================================================= */

export function PropertiesPanel() {
  const model =
    useEditorStore(
      (state) => state.model,
    );

  const selection =
    useEditorStore(
      (state) => state.selection,
    );

  const updateActor =
    useEditorStore(
      (state) => state.updateActor,
    );

  const updateRelationship =
    useEditorStore(
      (state) => state.updateRelationship,
    );

  const deleteSelection =
    useEditorStore(
      (state) => state.deleteSelection,
    );

  const copySelectedActors =
    useEditorStore(
      (state) => state.copySelectedActors,
    );

  const duplicateSelectedActors =
    useEditorStore(
      (state) => state.duplicateSelectedActors,
    );

  /* =======================================================
     SELEÇÃO
     ======================================================= */

  const totalSelected =
    selection.actorIds.length +
    selection.relationshipIds.length;

  const actor =
    totalSelected === 1 &&
    selection.actorIds.length === 1
      ? model.actors.find(
          (item) =>
            item.id ===
            selection.actorIds[0],
        )
      : undefined;

  const relationship =
    totalSelected === 1 &&
    selection.relationshipIds.length === 1
      ? model.relationships.find(
          (item) =>
            item.id ===
            selection.relationshipIds[0],
        )
      : undefined;

  /* =======================================================
     ATOR
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

  /**
   * Verifica se já existe uma Companhia de Interesse
   * diferente do ator atualmente selecionado.
   *
   * Isso impede que um segundo ator seja convertido em CoI.
   */
  const anotherCompanyOfInterestExists =
    actor
      ? model.actors.some(
          (item) =>
            item.id !== actor.id &&
            item.type ===
              'company_of_interest',
        )
      : false;

  /* =======================================================
     RELACIONAMENTO
     ======================================================= */

  const sourceActor =
    relationship
      ? model.actors.find(
          (item) =>
            item.id ===
            relationship.sourceActorId,
        )
      : undefined;

  const targetActor =
    relationship
      ? model.actors.find(
          (item) =>
            item.id ===
            relationship.targetActorId,
        )
      : undefined;

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
            Selecione um ator no canvas para
            visualizar e editar suas propriedades.
            Use <kbd>⌘/Ctrl</kbd> + clique para
            selecionar vários elementos.
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
            ator(es) e{' '}
            {selection.relationshipIds.length}{' '}
            relação(ões).
          </p>

          {selection.actorIds.length > 0 ? (
            <div className="multi-properties__actions">
              <button
                type="button"
                onClick={copySelectedActors}
              >
                <Copy size={15} />

                Copiar atores
              </button>

              <button
                type="button"
                onClick={duplicateSelectedActors}
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
                  .map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      disabled={
                        type.value ===
                          'company_of_interest' &&
                        actor.type !==
                          'company_of_interest' &&
                        anotherCompanyOfInterestExists
                      }
                    >
                      {type.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Atores indiretos">
                {ACTOR_TYPES
                  .filter(
                    (type) =>
                      type.group ===
                      'indirect',
                  )
                  .map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
              </optgroup>
            </select>

            <small className="field-help">
              Um modelo pode possuir apenas
              uma Companhia de Interesse (CoI).
            </small>
          </label>

          {/* -----------------------------------------------
              DEFINIÇÃO FORMAL
              ----------------------------------------------- */}

          <div className="actor-definition">
            <span className="eyebrow">
              Definição SSN
            </span>

            <p>
              {actorDefinition.description}
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
              value={actor.name}
              placeholder="Nome do ator"
              autoComplete="off"
              onChange={(event) => {
                updateActor(
                  actor.id,
                  {
                    name:
                      event.target.value,
                  },
                  false,
                );
              }}
            />

            {duplicateName ? (
              <small className="field-error">
                Já existe outro ator com
                este nome no modelo.
              </small>
            ) : (
              <small className="field-help">
                Os nomes dos atores devem
                ser únicos dentro do mesmo
                modelo.
              </small>
            )}
          </label>

          {/* -----------------------------------------------
              DESCRIÇÃO DO ATOR NO MODELO
              ----------------------------------------------- */}

          <label>
            Descrição no modelo

            <TransactionTextarea
              rows={6}
              value={actor.description}
              placeholder="Descreva o papel específico deste ator no ecossistema modelado."
              onChange={(event) => {
                updateActor(
                  actor.id,
                  {
                    description:
                      event.target.value,
                  },
                  false,
                );
              }}
            />

            <small className="field-help">
              Esta descrição pertence ao
              ator deste modelo e não altera
              sua definição na notação SSN.
            </small>
          </label>
        </div>
      ) : null}

      {/* ===================================================
          CONEXÃO / RELAÇÃO
          =================================================== */}

      {relationship ? (
        <div className="form-stack">
          <div className="properties-badge">
            Relação
          </div>

          <div className="relationship-summary">
            <div>
              <span>
                Origem
              </span>

              <strong>
                {sourceActor?.name ||
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
                {targetActor?.name ||
                  'Ator não encontrado'}
              </strong>
            </div>
          </div>

          {/*
           * IMPORTANTE:
           *
           * Esta parte ainda representa a estrutura
           * provisória da Sprint 1.
           *
           * Na notação formal SSN, devemos posteriormente
           * separar:
           *
           * - Relação Comercial;
           * - Fluxo;
           * - OU Gateway;
           * - XOU Gateway.
           *
           * Portanto, não devemos considerar este trecho
           * como o modelo definitivo das relações SSN.
           */}

          <label>
            Tipo de fluxo

            <select
              value={
                relationship.type
              }
              onChange={(event) => {
                updateRelationship(
                  relationship.id,
                  {
                    type:
                      event.target
                        .value as RelationshipType,
                  },
                );
              }}
            >
              {RELATIONSHIP_TYPES.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Nome

            <TransactionInput
              value={
                relationship.name
              }
              placeholder="Nome opcional"
              onChange={(event) => {
                updateRelationship(
                  relationship.id,
                  {
                    name:
                      event.target.value,
                  },
                  false,
                );
              }}
            />
          </label>

          <label>
            Descrição

            <TransactionTextarea
              rows={5}
              value={
                relationship.description
              }
              placeholder="Descreva a conexão entre os atores."
              onChange={(event) => {
                updateRelationship(
                  relationship.id,
                  {
                    description:
                      event.target.value,
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
          onClick={deleteSelection}
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