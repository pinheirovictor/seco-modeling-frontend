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

  const invalid =
    hasDuplicateName;

  const displayName =
    hasName
      ? actorName
      : definition.label;

  const tooltip =
    hasDuplicateName
      ? `Já existe outro ator chamado "${displayName}". Os nomes dos atores devem ser únicos dentro do modelo.`
      : `${definition.label}: ${displayName}`;

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
      data-selected={
        selected
          ? 'true'
          : 'false'
      }
      data-invalid={
        invalid
          ? 'true'
          : 'false'
      }
    >
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
          <strong
            className="actor-node__name"
          >
            {displayName}
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