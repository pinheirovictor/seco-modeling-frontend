import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react';

import type {
  MouseEvent,
} from 'react';

import type {
  CommercialRelationshipFlowEdge,
} from '../adapters/reactFlowAdapter';

import {
  useEditorStore,
} from '../store/editorStore';

/* =========================================================
   CONSTANTES VISUAIS
   ========================================================= */

const FLOW_WIDTH =
  60;

const FLOW_HEIGHT =
  30;

const FLOW_SPACING =
  34;

/* =========================================================
   COMMERCIAL RELATIONSHIP EDGE
   ========================================================= */

/**
 * Representação visual de uma Relação Comercial SSN.
 *
 * Relação Comercial:
 *
 * - conecta dois atores;
 * - não possui direção;
 * - é representada por linha preta sólida;
 * - não possui seta.
 *
 * Fluxo:
 *
 * - pertence à Relação Comercial;
 * - é exibido sobre a linha;
 * - permanece horizontal mesmo quando a relação
 *   estiver inclinada;
 * - possui formato direcional semelhante a uma
 *   etiqueta/seta.
 *
 * Exemplo:
 *
 *
 * Fornecedor
 *       \
 *        \       ┌──────\
 *         \──────│ P.1   >────── CoI
 *                └──────/
 *
 *
 * A Relação Comercial pode estar inclinada.
 *
 * O Fluxo permanece horizontal.
 */
export function CommercialRelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  data,
}: EdgeProps<CommercialRelationshipFlowEdge>) {
  /* =======================================================
     STORE
     ======================================================= */

  const selectOnlyCommercialRelationship =
    useEditorStore(
      (state) =>
        state.selectOnlyCommercialRelationship,
    );

  const selectOnlyFlow =
    useEditorStore(
      (state) =>
        state.selectOnlyFlow,
    );

  /* =======================================================
     GEOMETRIA DA RELAÇÃO COMERCIAL
     ======================================================= */

  /**
   * A Relação Comercial é uma linha reta.
   *
   * getStraightPath também fornece o ponto central
   * geométrico da relação:
   *
   * labelX
   * labelY
   *
   * Esse ponto será utilizado para posicionar os Fluxos.
   */
  const [
    edgePath,
    labelX,
    labelY,
  ] =
    getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

  const flows =
    data?.flows ?? [];

  /* =======================================================
     SELEÇÃO DA RELAÇÃO
     ======================================================= */

  function handleRelationshipClick(
    event:
      MouseEvent<SVGPathElement>,
  ) {
    event.stopPropagation();

    selectOnlyCommercialRelationship(
      id,
    );
  }

  /* =======================================================
     SELEÇÃO DO FLUXO
     ======================================================= */

  function handleFlowClick(
    event:
      MouseEvent<HTMLButtonElement>,
    flowId: string,
  ) {
    event.stopPropagation();

    selectOnlyFlow(
      flowId,
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* ===================================================
          RELAÇÃO COMERCIAL
          =================================================== */}

      <BaseEdge
        id={id}
        path={edgePath}
        interactionWidth={20}
        style={{
          stroke:
            selected
              ? '#2563eb'
              : '#111827',

          strokeWidth:
            selected
              ? 2.4
              : 1.7,

          cursor:
            'pointer',
        }}
      />

      {/*
       * Área de interação transparente.
       *
       * Ela torna mais fácil clicar em uma Relação
       * Comercial sem modificar sua aparência.
       */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={18}
        className="commercial-relationship-edge__interaction"
        onClick={
          handleRelationshipClick
        }
        style={{
          cursor:
            'pointer',
        }}
      />

      {/* ===================================================
          FLUXOS
          =================================================== */}

      {flows.length > 0 ? (
        <EdgeLabelRenderer>
          <div
            className="commercial-relationship-edge__flows"
            style={{
              position:
                'absolute',

              /**
               * IMPORTANTE:
               *
               * O Fluxo é posicionado sobre a Relação
               * Comercial, porém NÃO é rotacionado.
               *
               * Portanto, mesmo em uma linha inclinada:
               *
               *        /
               *   P.1 /
               *      /
               *
               * a forma P.1 continua horizontal.
               */
              transform:
                `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,

              pointerEvents:
                'all',
            }}
          >
            {flows.map(
              (
                flow,
                index,
              ) => {
                /* =========================================
                   POSICIONAMENTO
                   ========================================= */

                /**
                 * Caso exista mais de um Fluxo na mesma
                 * Relação Comercial, os elementos ficam
                 * distribuídos verticalmente ao redor
                 * do ponto central.
                 *
                 * Exemplo:
                 *
                 *        P.1
                 * -------S.1-------
                 *        C.1
                 */
                const middle =
                  (
                    flows.length -
                    1
                  ) /
                  2;

                const offsetY =
                  (
                    index -
                    middle
                  ) *
                  FLOW_SPACING;

                /* =========================================
                   DIREÇÃO
                   ========================================= */

                /**
                 * actorAId e actorBId existem apenas porque
                 * o React Flow precisa de source/target para
                 * desenhar a Relação Comercial.
                 *
                 * A Relação Comercial continua sendo
                 * semanticamente não direcional.
                 *
                 * Aqui utilizamos os IDs somente para
                 * determinar a direção visual do Fluxo.
                 */
                const pointsRight =
                  flow.sourceActorId ===
                    data?.actorAId &&
                  flow.targetActorId ===
                    data?.actorBId;

                /* =========================================
                   POLÍGONOS
                   ========================================= */

                /**
                 * Direção para a direita:
                 *
                 * ┌────────\
                 * │  P.1    >
                 * └────────/
                 */
                const rightPoints =
                  '1,1 46,1 59,15 46,29 1,29';

                /**
                 * Direção para a esquerda:
                 *
                 *        ────────┐
                 * <  P.1        │
                 *        ────────┘
                 */
                const leftPoints =
                  '14,1 59,1 59,29 14,29 1,15';

                return (
                  <button
                    key={
                      flow.id
                    }
                    type="button"
                    className={[
                      'commercial-relationship-edge__flow',

                      flow.selected
                        ? 'commercial-relationship-edge__flow--selected'
                        : '',

                      pointsRight
                        ? 'commercial-relationship-edge__flow--right'
                        : 'commercial-relationship-edge__flow--left',
                    ]
                      .filter(
                        Boolean,
                      )
                      .join(
                        ' ',
                      )}
                    style={{
                      transform:
                        `translateY(${offsetY}px)`,

                      width:
                        FLOW_WIDTH,

                      height:
                        FLOW_HEIGHT,

                      padding:
                        0,

                      border:
                        0,

                      background:
                        'transparent',

                      boxShadow:
                        'none',
                    }}
                    onClick={(
                      event,
                    ) => {
                      handleFlowClick(
                        event,
                        flow.id,
                      );
                    }}
                    title={
                      flow.name.trim()
                        ? `${flow.code} — ${flow.name}`
                        : flow.code
                    }
                    aria-label={
                      flow.name.trim()
                        ? `Fluxo ${flow.code}: ${flow.name}`
                        : `Fluxo ${flow.code}`
                    }
                  >
                    <svg
                      className="commercial-relationship-edge__flow-svg"
                      viewBox="0 0 60 30"
                      width={
                        FLOW_WIDTH
                      }
                      height={
                        FLOW_HEIGHT
                      }
                      aria-hidden="true"
                    >
                      <polygon
                        className="commercial-relationship-edge__flow-shape"
                        points={
                          pointsRight
                            ? rightPoints
                            : leftPoints
                        }
                        fill="#ffffff"
                        stroke={
                          flow.selected
                            ? '#2563eb'
                            : '#111827'
                        }
                        strokeWidth={
                          flow.selected
                            ? 2
                            : 1.4
                        }
                        strokeLinejoin="miter"
                      />

                      <text
                        className="commercial-relationship-edge__flow-text"
                        x="30"
                        y="15"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={
                          flow.selected
                            ? '#1d4ed8'
                            : '#111827'
                        }
                        fontSize="10"
                        fontWeight="800"
                      >
                        {
                          flow.code
                        }
                      </text>
                    </svg>
                  </button>
                );
              },
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}