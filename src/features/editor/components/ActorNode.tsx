import {
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';

import {
  AlertTriangle,
} from 'lucide-react';

import {
  getActorTypeDefinition,
} from '../../../domain/catalogs';

import type {
  ActorFlowNode,
} from '../adapters/reactFlowAdapter';

import {
  ActorShape,
} from './ActorShape';

/**
 * Nó visual utilizado pelo React Flow para representar
 * um ator da notação SSN.
 *
 * A semântica do ator não é definida neste componente.
 * O ActorNode apenas apresenta visualmente os dados do
 * modelo canônico da ECOS Modeling.
 */
export function ActorNode({
  data,
  selected,
}: NodeProps<ActorFlowNode>) {
  const definition =
    getActorTypeDefinition(data.type);

  const actorName =
    data.name?.trim() ?? '';

  const hasName =
    actorName.length > 0;

  const hasDuplicateName =
    Boolean(data.duplicateName);

  /**
   * Por enquanto, a invalidação visual considera nomes
   * duplicados.
   *
   * A validação de nome obrigatório será tratada pelo
   * mecanismo de validação SSN posteriormente.
   */
  const invalid =
    hasDuplicateName;

  const tooltip = hasDuplicateName
    ? `Já existe outro ator chamado "${actorName}". Os nomes dos atores devem ser únicos dentro do modelo.`
    : `${definition.label}${hasName ? `: ${actorName}` : ''}`;

  return (
    <div
      className={[
        'actor-node',
        `actor-node--${data.type}`,
        selected
          ? 'actor-node--selected'
          : '',
        invalid
          ? 'actor-node--invalid'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={tooltip}
      data-actor-type={data.type}
      data-selected={selected ? 'true' : 'false'}
      data-invalid={invalid ? 'true' : 'false'}
    >
      {/*
       * Handle de entrada.
       *
       * Mantemos os handles discretos e separados da forma
       * visual do ator. Eles aparecem principalmente durante
       * hover ou seleção.
       *
       * A estratégia completa de conexão será revisada quando
       * implementarmos formalmente Relação Comercial e Fluxo.
       */}
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className={[
          'actor-node__handle',
          'actor-node__handle--target',
          'actor-node__handle--left',
        ].join(' ')}
        aria-label={`Entrada de ${definition.label}`}
      />

      <ActorShape
        type={data.type}
        selected={selected}
        invalid={invalid}
      >
        <div className="actor-node__content">
          {/*
           * Identificação semântica do elemento.
           *
           * Ex.:
           * COMPANHIA DE INTERESSE
           * GitHub
           */}
          <span
            className="actor-node__type"
            title={definition.label}
          >
            {definition.label}
          </span>

          <strong
            className={[
              'actor-node__name',
              !hasName
                ? 'actor-node__name--empty'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {hasName
              ? actorName
              : 'Sem nome'}
          </strong>
        </div>

        {hasDuplicateName ? (
          <span
            className="actor-node__warning"
            role="img"
            aria-label="Nome de ator duplicado"
            title="Já existe outro ator com este nome."
          >
            <AlertTriangle
              size={15}
              aria-hidden="true"
            />
          </span>
        ) : null}
      </ActorShape>

      {/*
       * Handle de saída.
       */}
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        className={[
          'actor-node__handle',
          'actor-node__handle--source',
          'actor-node__handle--right',
        ].join(' ')}
        aria-label={`Saída de ${definition.label}`}
      />
    </div>
  );
}