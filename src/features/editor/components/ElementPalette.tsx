import { GripVertical, Plus } from 'lucide-react';

import {
  ACTOR_TYPES,
  type ActorGroup,
  type ActorTypeDefinition,
} from '../../../domain/catalogs';

import type { ActorType } from '../../../domain/model';

import { useEditorStore } from '../store/editorStore';

import { ActorShape } from './ActorShape';

interface PaletteActorProps {
  actor: ActorTypeDefinition;
  disabled: boolean;
  onAdd: (type: ActorType) => void;
}

/**
 * Item individual da paleta de atores SSN.
 *
 * Cada elemento:
 * - preserva a forma e a cor da notação;
 * - pode ser adicionado por clique;
 * - pode ser arrastado para o canvas;
 * - exibe sua descrição formal.
 */
function PaletteActor({
  actor,
  disabled,
  onAdd,
}: PaletteActorProps) {
  const disabledMessage =
    actor.value === 'company_of_interest'
      ? 'Já existe uma Companhia de Interesse neste modelo.'
      : 'Este ator não pode ser adicionado no momento.';

  return (
    <button
      type="button"
      className="palette-actor"
      draggable={!disabled}
      disabled={disabled}
      aria-disabled={disabled}
      title={
        disabled
          ? disabledMessage
          : `Adicionar ${actor.label}`
      }
      onDragStart={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        /**
         * O tipo do ator é transportado no drag-and-drop.
         *
         * O EditorCanvas recupera esse valor para criar
         * exatamente o ator selecionado na posição do drop.
         */
        event.dataTransfer.setData(
          'application/ecos-actor',
          actor.value,
        );

        event.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => {
        if (!disabled) {
          onAdd(actor.value);
        }
      }}
    >
      <GripVertical
        size={14}
        className="palette-actor__grip"
        aria-hidden="true"
      />

      <ActorShape
        type={actor.value}
        compact
      />

      <span className="palette-actor__content">
        <strong>
          {actor.label}
        </strong>

        <small>
          {disabled
            ? 'Já adicionada ao modelo'
            : actor.description}
        </small>
      </span>

      <Plus
        size={15}
        className="palette-actor__plus"
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * Painel lateral responsável pelos elementos
 * disponíveis da notação SSN.
 *
 * Nesta etapa da ECOS Modeling 4.0, a paleta apresenta
 * apenas os atores. Fluxos, Relações Comerciais e Gateways
 * serão adicionados posteriormente em seções próprias.
 */
export function ElementPalette() {
  const model = useEditorStore(
    (state) => state.model,
  );

  const addActor = useEditorStore(
    (state) => state.addActor,
  );

  /**
   * A Companhia de Interesse representa a organização
   * focal do ecossistema.
   *
   * Por regra da ECOS Modeling, permitimos somente uma
   * Companhia de Interesse por modelo.
   */
  const companyOfInterestExists =
    model.actors.some(
      (actor) =>
        actor.type ===
        'company_of_interest',
    );

  /**
   * Quando o usuário adiciona um ator por clique,
   * posicionamos o elemento próximo ao centro inicial
   * do canvas com pequeno deslocamento incremental.
   *
   * O posicionamento preciso pelo mouse é tratado
   * pelo drag-and-drop.
   */
  const addCenteredActor = (
    type: ActorType,
  ) => {
    const index = model.actors.length;

    const column =
      index % 4;

    const row =
      Math.floor(index / 4) % 4;

    addActor(
      type,
      {
        x: 180 + column * 34,
        y: 120 + row * 34,
      },
    );
  };

  /**
   * Renderiza uma categoria da notação.
   */
  const renderGroup = (
    group: ActorGroup,
  ) =>
    ACTOR_TYPES
      .filter(
        (actor) =>
          actor.group === group,
      )
      .map((actor) => {
        const isCompanyOfInterest =
          actor.value ===
          'company_of_interest';

        const disabled =
          isCompanyOfInterest &&
          companyOfInterestExists;

        return (
          <PaletteActor
            key={actor.value}
            actor={actor}
            disabled={disabled}
            onAdd={addCenteredActor}
          />
        );
      });

  const directActorsCount =
    ACTOR_TYPES.filter(
      (actor) =>
        actor.group === 'direct',
    ).length;

  const indirectActorsCount =
    ACTOR_TYPES.filter(
      (actor) =>
        actor.group === 'indirect',
    ).length;

  return (
    <aside
      className="panel palette"
      aria-label="Paleta da notação SSN"
    >
      <div className="panel__heading">
        <div>
          <span className="eyebrow">
            Notação SSN
          </span>

          <h2>
            Atores do ecossistema
          </h2>
        </div>
      </div>

      <p className="panel__hint">
        Arraste um ator para o canvas
        ou clique para adicioná-lo.
        Cada ator mantém a forma e a cor
        definidas pela notação SSN.
      </p>

      {/* =====================================================
          ATORES DIRETOS
          ===================================================== */}

      <section
        className="palette-group"
        aria-labelledby="direct-actors-title"
      >
        <div className="palette-group__heading">
          <h3 id="direct-actors-title">
            Atores diretos
          </h3>

          <span>
            {directActorsCount}{' '}
            {directActorsCount === 1
              ? 'tipo'
              : 'tipos'}
          </span>
        </div>

        <p>
          Participantes diretamente
          relacionados à Companhia de
          Interesse.
        </p>

        <div className="palette-group__items">
          {renderGroup('direct')}
        </div>
      </section>

      {/* =====================================================
          ATORES INDIRETOS
          ===================================================== */}

      <section
        className="palette-group"
        aria-labelledby="indirect-actors-title"
      >
        <div className="palette-group__heading">
          <h3 id="indirect-actors-title">
            Atores indiretos
          </h3>

          <span>
            {indirectActorsCount}{' '}
            {indirectActorsCount === 1
              ? 'tipo'
              : 'tipos'}
          </span>
        </div>

        <p>
          Participantes relacionados ao
          ecossistema por meio dos atores
          diretos.
        </p>

        <div className="palette-group__items">
          {renderGroup('indirect')}
        </div>
      </section>

      {/* =====================================================
          AJUDA
          ===================================================== */}

      <div className="palette__section">
        <span className="eyebrow">
          Seleção
        </span>

        <p className="palette-shortcut-hint">
          <kbd>⌘/Ctrl</kbd> + clique
          seleciona vários elementos.
          {' '}
          <kbd>Shift</kbd> + arraste
          cria uma área de seleção.
        </p>
      </div>
    </aside>
  );
}