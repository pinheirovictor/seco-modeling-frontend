import type { CSSProperties, ReactNode } from 'react';

import {
  getActorTypeDefinition,
  type ActorShape as ActorShapeKind,
} from '../../../domain/catalogs';

import type { ActorType } from '../../../domain/model';

interface ActorShapeProps {
  type: ActorType;
  className?: string;
  children?: ReactNode;
  compact?: boolean;
  selected?: boolean;
  invalid?: boolean;
}

/**
 * Dimensões internas utilizadas para desenhar as formas SSN.
 *
 * O SVG usa sempre o mesmo viewBox para que todos os atores
 * mantenham proporções consistentes no canvas e na paleta.
 */
const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = 80;

/**
 * Formas poligonais oficiais utilizadas pelos atores SSN.
 *
 * Referência visual:
 *
 * Companhia de Interesse
 * ┌──────────────────────────────┐
 * │                              │
 * └──────────────────────────────┘
 *
 * Fornecedor
 * ┌───────────────────────\
 * │                        >
 * └───────────────────────/
 *
 * Cliente
 *        /───────────────────────┐
 * <─────                         │
 *        \───────────────────────┘
 *
 * Intermediário
 *       __________________
 *     /                    \
 *   <                        >
 *     \____________________/
 *
 * Cliente do Cliente
 * ┌────────────────────────\
 * │                         <
 * └────────────────────────/
 *
 * Agregador
 *      ______________________
 *     /                     /
 *    /_____________________/
 */
const POLYGONS: Partial<Record<ActorShapeKind, string>> = {
  /**
   * Fornecedor:
   * caixa com ponta direcionada para a direita.
   */
  'arrow-right': [
    '4,4',
    '198,4',
    '236,40',
    '198,76',
    '4,76',
  ].join(' '),

  /**
   * Cliente:
   * caixa com ponta direcionada para a esquerda.
   */
  'arrow-left': [
    '42,4',
    '236,4',
    '236,76',
    '42,76',
    '4,40',
  ].join(' '),

  /**
   * Intermediário:
   * hexágono horizontal.
   */
  hexagon: [
    '38,4',
    '202,4',
    '236,40',
    '202,76',
    '38,76',
    '4,40',
  ].join(' '),

  /**
   * Cliente do Cliente:
   * retângulo com recorte em V na lateral direita.
   */
  'notched-right': [
    '4,4',
    '236,4',
    '198,40',
    '236,76',
    '4,76',
  ].join(' '),

  /**
   * Agregador:
   * paralelogramo inclinado.
   */
  parallelogram: [
    '42,4',
    '236,4',
    '198,76',
    '4,76',
  ].join(' '),
};

export function ActorShape({
  type,
  className = '',
  children,
  compact = false,
  selected = false,
  invalid = false,
}: ActorShapeProps) {
  const definition = getActorTypeDefinition(type);

  const style = {
    '--actor-accent': definition.accent,
    '--actor-surface': definition.surface,
    '--actor-text': definition.text,
  } as CSSProperties;

  const classes = [
    'actor-shape',
    `actor-shape--${type}`,
    `actor-shape--shape-${definition.shape}`,
    compact ? 'actor-shape--compact' : '',
    selected ? 'actor-shape--selected' : '',
    invalid ? 'actor-shape--invalid' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const polygonPoints = POLYGONS[definition.shape];

  return (
    <div
      className={classes}
      style={style}
      data-actor-type={type}
      data-actor-shape={definition.shape}
    >
      <svg
        className="actor-shape__svg"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {definition.shape === 'rectangle' ? (
          /**
           * Companhia de Interesse:
           * retângulo azul de borda sólida.
           *
           * Não utilizamos cantos arredondados porque a
           * representação formal da notação utiliza um
           * retângulo convencional.
           */
          <rect
            x="4"
            y="4"
            width="232"
            height="72"
            rx="0"
            ry="0"
            vectorEffect="non-scaling-stroke"
          />
        ) : polygonPoints ? (
          <polygon
            points={polygonPoints}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="miter"
          />
        ) : null}
      </svg>

      {children ? (
        <div className="actor-shape__content">
          {children}
        </div>
      ) : null}
    </div>
  );
}