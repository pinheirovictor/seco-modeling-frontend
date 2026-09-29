import { create } from 'zustand';

import {
  isActorType,
} from '../../../domain/catalogs';

import {
  createActor,
  createEmptyModel,
  createRelationship,
} from '../../../domain/factory';

import type {
  Actor,
  ActorType,
  EcosystemModel,
  EditorNotice,
  EditorSelection,
  Position,
  Relationship,
} from '../../../domain/model';

import {
  uniqueActorName,
  validateCompanyOfInterest,
} from '../../../domain/validation';

/* =========================================================
   CONSTANTES
   ========================================================= */

const STORAGE_KEY =
  'ecos-modeling:v4:sprint1:ssn-model';

const HISTORY_LIMIT = 100;

const EMPTY_SELECTION: EditorSelection = {
  actorIds: [],
  relationshipIds: [],
};

/* =========================================================
   CLIPBOARD
   ========================================================= */

interface ActorClipboard {
  actors: Actor[];
  relationships: Relationship[];
  origin: Position;
  pasteCount: number;
}

interface PasteResult {
  model: EcosystemModel;
  actorIds: string[];
  relationshipIds: string[];
  skippedCompanyOfInterest: boolean;
}

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Cria uma cópia independente do modelo.
 *
 * structuredClone é suportado pelos navegadores modernos
 * definidos como alvo da ECOS Modeling 4.0.
 */
function cloneModel(
  model: EcosystemModel,
): EcosystemModel {
  return structuredClone(model);
}

/**
 * Atualiza a data de modificação do modelo.
 */
function touch(
  model: EcosystemModel,
): EcosystemModel {
  return {
    ...model,
    updatedAt:
      new Date().toISOString(),
  };
}

/**
 * Compara o conteúdo de dois modelos ignorando
 * apenas o campo updatedAt.
 *
 * Isso evita criar entradas inúteis no histórico.
 */
function sameModel(
  a: EcosystemModel,
  b: EcosystemModel,
): boolean {
  const left = {
    ...a,
    updatedAt: '',
  };

  const right = {
    ...b,
    updatedAt: '',
  };

  return (
    JSON.stringify(left) ===
    JSON.stringify(right)
  );
}

/**
 * Remove IDs repetidos preservando a ordem.
 */
function unique(
  values: string[],
): string[] {
  return [
    ...new Set(values),
  ];
}

/**
 * Verifica se já existe uma Companhia de Interesse.
 *
 * ignoredActorId é utilizado durante a edição do próprio
 * ator, permitindo que uma CoI continue sendo CoI sem
 * conflitar consigo mesma.
 */
function hasCompanyOfInterest(
  model: EcosystemModel,
  ignoredActorId?: string,
): boolean {
  return model.actors.some(
    (actor) =>
      actor.id !==
        ignoredActorId &&
      actor.type ===
        'company_of_interest',
  );
}

/**
 * Verifica se um ator realmente existe no modelo.
 */
function actorExists(
  model: EcosystemModel,
  actorId: string,
): boolean {
  return model.actors.some(
    (actor) =>
      actor.id === actorId,
  );
}

/**
 * Gera o conteúdo temporário de copiar/colar.
 *
 * As relações copiadas são apenas aquelas cujas duas
 * extremidades pertencem à seleção.
 *
 * Exemplo:
 *
 * A ─── B ─── C
 *
 * Se A e B forem copiados, a relação A-B também é copiada.
 * A relação B-C não é copiada porque C não pertence
 * à seleção.
 */
function buildClipboard(
  model: EcosystemModel,
  actorIds: string[],
): ActorClipboard | null {
  const ids =
    new Set(actorIds);

  const actors =
    model.actors.filter(
      (actor) =>
        ids.has(actor.id),
    );

  if (
    actors.length === 0
  ) {
    return null;
  }

  const relationships =
    model.relationships.filter(
      (relationship) =>
        ids.has(
          relationship.sourceActorId,
        ) &&
        ids.has(
          relationship.targetActorId,
        ),
    );

  return {
    actors:
      structuredClone(actors),

    relationships:
      structuredClone(
        relationships,
      ),

    origin: {
      x: Math.min(
        ...actors.map(
          (actor) =>
            actor.position.x,
        ),
      ),

      y: Math.min(
        ...actors.map(
          (actor) =>
            actor.position.y,
        ),
      ),
    },

    pasteCount: 0,
  };
}

/**
 * Cola atores previamente copiados.
 *
 * Regras:
 *
 * 1. IDs são sempre recriados.
 * 2. Nomes continuam únicos.
 * 3. Relações internas da seleção são preservadas.
 * 4. A Companhia de Interesse não pode ser duplicada.
 */
function pasteActors(
  model: EcosystemModel,
  clipboard: ActorClipboard,
  targetPosition?: Position,
): PasteResult {
  const idMap =
    new Map<string, string>();

  const createdActors:
    Actor[] = [];

  let skippedCompanyOfInterest =
    false;

  let companyAlreadyExists =
    hasCompanyOfInterest(model);

  /**
   * Cada colagem realizada pelo teclado desloca
   * progressivamente os novos elementos.
   */
  const step =
    38 *
    (clipboard.pasteCount + 1);

  /**
   * Quando targetPosition é recebido, a origem da seleção
   * é posicionada naquele ponto.
   *
   * Isso é usado, por exemplo, pelo menu de contexto
   * do canvas.
   */
  const offset =
    targetPosition
      ? {
          x:
            targetPosition.x -
            clipboard.origin.x,

          y:
            targetPosition.y -
            clipboard.origin.y,
        }
      : {
          x: step,
          y: step,
        };

  for (
    const source
    of clipboard.actors
  ) {
    /**
     * A CoI representa a organização focal
     * do ecossistema e é única no modelo.
     */
    if (
      source.type ===
        'company_of_interest' &&
      companyAlreadyExists
    ) {
      skippedCompanyOfInterest =
        true;

      continue;
    }

    const id =
      crypto.randomUUID();

    const baseName =
      source.name.trim() ||
      'Ator';

    const preferredName =
      `${baseName} (cópia)`;

    const name =
      uniqueActorName(
        preferredName,
        [
          ...model.actors,
          ...createdActors,
        ],
      );

    const copiedActor: Actor = {
      ...structuredClone(
        source,
      ),

      id,

      name,

      position: {
        x:
          source.position.x +
          offset.x,

        y:
          source.position.y +
          offset.y,
      },
    };

    createdActors.push(
      copiedActor,
    );

    idMap.set(
      source.id,
      id,
    );

    if (
      source.type ===
      'company_of_interest'
    ) {
      companyAlreadyExists =
        true;
    }
  }

  /**
   * Recria apenas as relações cujos dois atores
   * conseguiram ser copiados.
   *
   * Isso é especialmente importante quando uma CoI
   * é ignorada durante a duplicação.
   */
  const createdRelationships:
    Relationship[] =
      clipboard.relationships
        .filter(
          (relationship) =>
            idMap.has(
              relationship
                .sourceActorId,
            ) &&
            idMap.has(
              relationship
                .targetActorId,
            ),
        )
        .map(
          (relationship) => ({
            ...structuredClone(
              relationship,
            ),

            id:
              crypto.randomUUID(),

            sourceActorId:
              idMap.get(
                relationship
                  .sourceActorId,
              )!,

            targetActorId:
              idMap.get(
                relationship
                  .targetActorId,
              )!,
          }),
        );

  return {
    model: {
      ...model,

      actors: [
        ...model.actors,
        ...createdActors,
      ],

      relationships: [
        ...model.relationships,
        ...createdRelationships,
      ],
    },

    actorIds:
      createdActors.map(
        (actor) => actor.id,
      ),

    relationshipIds:
      createdRelationships.map(
        (relationship) =>
          relationship.id,
      ),

    skippedCompanyOfInterest,
  };
}

/* =========================================================
   ESTADO
   ========================================================= */

interface EditorState {
  model: EcosystemModel;

  selection: EditorSelection;

  past: EcosystemModel[];

  future: EcosystemModel[];

  transactionBase:
    | EcosystemModel
    | null;

  clipboard:
    | ActorClipboard
    | null;

  notice:
    | EditorNotice
    | null;

  /* -------------------------------------------------------
     ATORES
     ------------------------------------------------------- */

  addActor: (
    type: ActorType,
    position: Position,
  ) => string | null;

  updateActor: (
    id: string,
    patch:
      Partial<
        Omit<Actor, 'id'>
      >,
    recordHistory?: boolean,
  ) => void;

  moveActor: (
    id: string,
    position: Position,
  ) => void;

  /* -------------------------------------------------------
     RELAÇÕES
     ------------------------------------------------------- */

  addRelationship: (
    sourceActorId: string,
    targetActorId: string,
  ) => void;

  updateRelationship: (
    id: string,
    patch:
      Partial<
        Omit<
          Relationship,
          | 'id'
          | 'sourceActorId'
          | 'targetActorId'
        >
      >,
    recordHistory?: boolean,
  ) => void;

  /* -------------------------------------------------------
     SELEÇÃO
     ------------------------------------------------------- */

  deleteSelection:
    () => void;

  setSelection: (
    actorIds: string[],
    relationshipIds?: string[],
  ) => void;

  selectOnlyActor: (
    id: string,
  ) => void;

  selectOnlyRelationship: (
    id: string,
  ) => void;

  clearSelection:
    () => void;

  selectAllActors:
    () => void;

  /* -------------------------------------------------------
     MODELO
     ------------------------------------------------------- */

  setModelName: (
    name: string,
    recordHistory?: boolean,
  ) => void;

  /* -------------------------------------------------------
     TRANSAÇÕES / HISTÓRICO
     ------------------------------------------------------- */

  beginTransaction:
    () => void;

  commitTransaction:
    () => void;

  undo:
    () => void;

  redo:
    () => void;

  /* -------------------------------------------------------
     CLIPBOARD
     ------------------------------------------------------- */

  copySelectedActors:
    () => boolean;

  pasteClipboard: (
    targetPosition?: Position,
  ) => boolean;

  duplicateSelectedActors:
    () => boolean;

  /* -------------------------------------------------------
     PERSISTÊNCIA LOCAL
     ------------------------------------------------------- */

  saveLocal: (
    silent?: boolean,
  ) => void;

  loadLocal:
    () => boolean;

  resetModel:
    () => void;

  exportJson:
    () => void;

  /* -------------------------------------------------------
     FEEDBACK
     ------------------------------------------------------- */

  showNotice: (
    message: string,
    tone?:
      EditorNotice['tone'],
  ) => void;

  clearNotice:
    () => void;
}

type SetState = (
  partial:
    | Partial<EditorState>
    | ((
        state: EditorState,
      ) =>
        Partial<EditorState>),
) => void;

/* =========================================================
   HISTÓRICO
   ========================================================= */

/**
 * Executa uma alteração registrando o estado anterior
 * para Undo.
 */
function commitMutation(
  set: SetState,
  mutate: (
    model: EcosystemModel,
  ) => EcosystemModel,
): void {
  set((state) => {
    const previous =
      cloneModel(
        state.model,
      );

    const next =
      touch(
        mutate(
          cloneModel(
            state.model,
          ),
        ),
      );

    if (
      sameModel(
        previous,
        next,
      )
    ) {
      return {};
    }

    return {
      model: next,

      past: [
        ...state.past,
        previous,
      ].slice(
        -HISTORY_LIMIT,
      ),

      future: [],

      transactionBase: null,
    };
  });
}

/* =========================================================
   STORE
   ========================================================= */

export const useEditorStore =
  create<EditorState>(
    (set, get) => ({
      model:
        createEmptyModel(),

      selection:
        EMPTY_SELECTION,

      past: [],

      future: [],

      transactionBase:
        null,

      clipboard:
        null,

      notice:
        null,

      /* ===================================================
         ATORES
         =================================================== */

      addActor: (
        type,
        position,
      ) => {
        /**
         * Regra SSN da ECOS Modeling:
         *
         * somente uma Companhia de Interesse
         * pode existir por modelo.
         */
        if (
          type ===
            'company_of_interest' &&
          hasCompanyOfInterest(
            get().model,
          )
        ) {
          get().showNotice(
            'O modelo pode possuir apenas uma Companhia de Interesse (CoI).',
            'warning',
          );

          return null;
        }

        const actor =
          createActor(
            type,
            position,
            get().model.actors,
          );

        commitMutation(
          set,
          (model) => ({
            ...model,

            actors: [
              ...model.actors,
              actor,
            ],
          }),
        );

        set({
          selection: {
            actorIds: [
              actor.id,
            ],

            relationshipIds: [],
          },
        });

        return actor.id;
      },

      updateActor: (
        id,
        patch,
        recordHistory = true,
      ) => {
        /**
         * Impede conversão de outro ator
         * para CoI quando uma CoI já existe.
         */
        if (
          patch.type ===
            'company_of_interest' &&
          hasCompanyOfInterest(
            get().model,
            id,
          )
        ) {
          get().showNotice(
            'Já existe uma Companhia de Interesse (CoI) neste modelo.',
            'warning',
          );

          return;
        }

        /**
         * Se patch.type veio de alguma fonte externa,
         * garantimos também que seja um ator reconhecido.
         */
        if (
          patch.type !==
            undefined &&
          !isActorType(
            patch.type,
          )
        ) {
          get().showNotice(
            'O tipo de ator informado não pertence à notação SSN suportada.',
            'error',
          );

          return;
        }

        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          actors:
            model.actors.map(
              (actor) =>
                actor.id === id
                  ? {
                      ...actor,
                      ...patch,
                    }
                  : actor,
            ),
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      moveActor: (
        id,
        position,
      ) => {
        get().updateActor(
          id,
          {
            position,
          },
          false,
        );
      },

      /* ===================================================
         RELAÇÕES
         =================================================== */

      addRelationship: (
        sourceActorId,
        targetActorId,
      ) => {
        const model =
          get().model;

        /**
         * Ambas as extremidades devem existir.
         */
        if (
          !actorExists(
            model,
            sourceActorId,
          ) ||
          !actorExists(
            model,
            targetActorId,
          )
        ) {
          get().showNotice(
            'Não foi possível criar a relação porque um dos atores não existe.',
            'error',
          );

          return;
        }

        /**
         * Uma relação não conecta o ator a ele mesmo.
         */
        if (
          sourceActorId ===
          targetActorId
        ) {
          get().showNotice(
            'Uma relação deve conectar dois atores diferentes.',
            'warning',
          );

          return;
        }

        /**
         * Evita duplicação direta da mesma relação.
         *
         * Relações em sentidos opostos continuam permitidas
         * porque representam conexões distintas.
         */
        const alreadyExists =
          model.relationships.some(
            (
              relationship,
            ) =>
              relationship
                .sourceActorId ===
                sourceActorId &&
              relationship
                .targetActorId ===
                targetActorId,
          );

        if (
          alreadyExists
        ) {
          get().showNotice(
            'Essa relação já existe entre os dois atores.',
            'info',
          );

          return;
        }

        const relationship =
          createRelationship(
            sourceActorId,
            targetActorId,
          );

        commitMutation(
          set,
          (current) => ({
            ...current,

            relationships: [
              ...current.relationships,
              relationship,
            ],
          }),
        );

        set({
          selection: {
            actorIds: [],

            relationshipIds: [
              relationship.id,
            ],
          },
        });
      },

      updateRelationship: (
        id,
        patch,
        recordHistory = true,
      ) => {
        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          relationships:
            model.relationships.map(
              (
                relationship,
              ) =>
                relationship.id === id
                  ? {
                      ...relationship,
                      ...patch,
                    }
                  : relationship,
            ),
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      /* ===================================================
         EXCLUSÃO
         =================================================== */

      deleteSelection:
        () => {
          const {
            actorIds,
            relationshipIds,
          } =
            get().selection;

          if (
            actorIds.length ===
              0 &&
            relationshipIds.length ===
              0
          ) {
            return;
          }

          const actorSet =
            new Set(
              actorIds,
            );

          const relationshipSet =
            new Set(
              relationshipIds,
            );

          commitMutation(
            set,
            (model) => ({
              ...model,

              actors:
                model.actors.filter(
                  (actor) =>
                    !actorSet.has(
                      actor.id,
                    ),
                ),

              /**
               * Ao excluir um ator, todas as relações
               * associadas são removidas junto com ele.
               */
              relationships:
                model.relationships.filter(
                  (
                    relationship,
                  ) =>
                    !relationshipSet.has(
                      relationship.id,
                    ) &&
                    !actorSet.has(
                      relationship
                        .sourceActorId,
                    ) &&
                    !actorSet.has(
                      relationship
                        .targetActorId,
                    ),
                ),
            }),
          );

          set({
            selection:
              EMPTY_SELECTION,
          });
        },

      /* ===================================================
         SELEÇÃO
         =================================================== */

      setSelection: (
        actorIds,
        relationshipIds = [],
      ) => {
        const model =
          get().model;

        /**
         * Mantemos apenas IDs que ainda existem.
         */
        const validActorIds =
          unique(
            actorIds,
          ).filter(
            (id) =>
              model.actors.some(
                (actor) =>
                  actor.id === id,
              ),
          );

        const validRelationshipIds =
          unique(
            relationshipIds,
          ).filter(
            (id) =>
              model.relationships.some(
                (
                  relationship,
                ) =>
                  relationship.id ===
                  id,
              ),
          );

        set({
          selection: {
            actorIds:
              validActorIds,

            relationshipIds:
              validRelationshipIds,
          },
        });
      },

      selectOnlyActor: (
        id,
      ) => {
        if (
          !actorExists(
            get().model,
            id,
          )
        ) {
          return;
        }

        set({
          selection: {
            actorIds: [id],

            relationshipIds: [],
          },
        });
      },

      selectOnlyRelationship: (
        id,
      ) => {
        const exists =
          get()
            .model
            .relationships
            .some(
              (
                relationship,
              ) =>
                relationship.id ===
                id,
            );

        if (
          !exists
        ) {
          return;
        }

        set({
          selection: {
            actorIds: [],

            relationshipIds: [
              id,
            ],
          },
        });
      },

      clearSelection:
        () => {
          set({
            selection:
              EMPTY_SELECTION,
          });
        },

      selectAllActors:
        () => {
          set({
            selection: {
              actorIds:
                get()
                  .model
                  .actors
                  .map(
                    (actor) =>
                      actor.id,
                  ),

              relationshipIds: [],
            },
          });
        },

      /* ===================================================
         NOME DO MODELO
         =================================================== */

      setModelName: (
        name,
        recordHistory = true,
      ) => {
        const mutate = (
          model:
            EcosystemModel,
        ): EcosystemModel => ({
          ...model,

          name,
        });

        if (
          recordHistory
        ) {
          commitMutation(
            set,
            mutate,
          );
        } else {
          set(
            (state) => ({
              model:
                touch(
                  mutate(
                    cloneModel(
                      state.model,
                    ),
                  ),
                ),
            }),
          );
        }
      },

      /* ===================================================
         TRANSAÇÕES
         =================================================== */

      beginTransaction:
        () => {
          if (
            !get()
              .transactionBase
          ) {
            set({
              transactionBase:
                cloneModel(
                  get().model,
                ),
            });
          }
        },

      commitTransaction:
        () => {
          const base =
            get()
              .transactionBase;

          if (
            !base
          ) {
            return;
          }

          const current =
            get().model;

          if (
            !sameModel(
              base,
              current,
            )
          ) {
            set(
              (state) => ({
                past: [
                  ...state.past,
                  base,
                ].slice(
                  -HISTORY_LIMIT,
                ),

                future: [],

                transactionBase:
                  null,
              }),
            );
          } else {
            set({
              transactionBase:
                null,
            });
          }
        },

      /* ===================================================
         UNDO
         =================================================== */

      undo:
        () => {
          const {
            past,
            model,
          } = get();

          if (
            past.length ===
            0
          ) {
            return;
          }

          const previous =
            past[
              past.length - 1
            ];

          set(
            (state) => ({
              model:
                cloneModel(
                  previous,
                ),

              past:
                state.past.slice(
                  0,
                  -1,
                ),

              future: [
                cloneModel(
                  model,
                ),
                ...state.future,
              ].slice(
                0,
                HISTORY_LIMIT,
              ),

              selection:
                EMPTY_SELECTION,

              transactionBase:
                null,
            }),
          );
        },

      /* ===================================================
         REDO
         =================================================== */

      redo:
        () => {
          const {
            future,
            model,
          } = get();

          if (
            future.length ===
            0
          ) {
            return;
          }

          const next =
            future[0];

          set(
            (state) => ({
              model:
                cloneModel(
                  next,
                ),

              past: [
                ...state.past,
                cloneModel(
                  model,
                ),
              ].slice(
                -HISTORY_LIMIT,
              ),

              future:
                state.future.slice(
                  1,
                ),

              selection:
                EMPTY_SELECTION,

              transactionBase:
                null,
            }),
          );
        },

      /* ===================================================
         COPIAR
         =================================================== */

      copySelectedActors:
        () => {
          const clipboard =
            buildClipboard(
              get().model,
              get()
                .selection
                .actorIds,
            );

          if (
            !clipboard
          ) {
            get().showNotice(
              'Selecione pelo menos um ator para copiar.',
              'info',
            );

            return false;
          }

          set({
            clipboard,
          });

          get().showNotice(
            clipboard
              .actors
              .length === 1
              ? 'Ator copiado.'
              : `${clipboard.actors.length} atores copiados.`,
            'success',
          );

          return true;
        },

      /* ===================================================
         COLAR
         =================================================== */

      pasteClipboard: (
        targetPosition,
      ) => {
        const clipboard =
          get().clipboard;

        if (
          !clipboard
        ) {
          get().showNotice(
            'Não há atores copiados para colar.',
            'info',
          );

          return false;
        }

        const result =
          pasteActors(
            get().model,
            clipboard,
            targetPosition,
          );

        if (
          result
            .actorIds
            .length === 0
        ) {
          if (
            result
              .skippedCompanyOfInterest
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) é única e não pode ser duplicada.',
              'warning',
            );
          }

          return false;
        }

        commitMutation(
          set,
          () =>
            result.model,
        );

        set({
          selection: {
            actorIds:
              result.actorIds,

            relationshipIds:
              result.relationshipIds,
          },

          clipboard: {
            ...clipboard,

            pasteCount:
              clipboard.pasteCount +
              1,
          },
        });

        if (
          result
            .skippedCompanyOfInterest
        ) {
          get().showNotice(
            'Os demais atores foram colados. A Companhia de Interesse (CoI) foi ignorada porque é única no modelo.',
            'warning',
          );
        }

        return true;
      },

      /* ===================================================
         DUPLICAR
         =================================================== */

      duplicateSelectedActors:
        () => {
          const clipboard =
            buildClipboard(
              get().model,
              get()
                .selection
                .actorIds,
            );

          if (
            !clipboard
          ) {
            get().showNotice(
              'Selecione pelo menos um ator para duplicar.',
              'info',
            );

            return false;
          }

          const result =
            pasteActors(
              get().model,
              clipboard,
            );

          if (
            result
              .actorIds
              .length === 0
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) é única e não pode ser duplicada.',
              'warning',
            );

            return false;
          }

          commitMutation(
            set,
            () =>
              result.model,
          );

          set({
            selection: {
              actorIds:
                result.actorIds,

              relationshipIds:
                result.relationshipIds,
            },
          });

          if (
            result
              .skippedCompanyOfInterest
          ) {
            get().showNotice(
              'A Companhia de Interesse (CoI) foi ignorada. Os demais atores foram duplicados.',
              'warning',
            );
          }

          return true;
        },

      /* ===================================================
         SALVAR LOCALMENTE
         =================================================== */

      saveLocal: (
        silent = false,
      ) => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
              get().model,
            ),
          );

          if (
            !silent
          ) {
            get().showNotice(
              'Modelo salvo localmente.',
              'success',
            );
          }
        } catch {
          get().showNotice(
            'Não foi possível salvar o modelo localmente.',
            'error',
          );
        }
      },

      /* ===================================================
         CARREGAR LOCALMENTE
         =================================================== */

      loadLocal:
        () => {
          const raw =
            localStorage.getItem(
              STORAGE_KEY,
            );

          if (
            !raw
          ) {
            return false;
          }

          try {
            const model =
              JSON.parse(
                raw,
              ) as EcosystemModel;

            const valid =
              model.schemaVersion ===
                '4.0-draft' &&
              Array.isArray(
                model.actors,
              ) &&
              Array.isArray(
                model.relationships,
              ) &&
              model.actors.every(
                (actor) =>
                  actor &&
                  typeof actor.id ===
                    'string' &&
                  typeof actor.name ===
                    'string' &&
                  actor.position &&
                  typeof actor
                    .position.x ===
                    'number' &&
                  typeof actor
                    .position.y ===
                    'number' &&
                  isActorType(
                    actor.type,
                  ),
              ) &&
              validateCompanyOfInterest(
                model,
              );

            if (
              !valid
            ) {
              get().showNotice(
                'O rascunho local é incompatível com a estrutura SSN atual e não foi carregado.',
                'warning',
              );

              return false;
            }

            set({
              model,

              selection:
                EMPTY_SELECTION,

              past: [],

              future: [],

              transactionBase:
                null,
            });

            return true;
          } catch {
            get().showNotice(
              'Não foi possível carregar o rascunho local.',
              'error',
            );

            return false;
          }
        },

      /* ===================================================
         NOVO MODELO
         =================================================== */

      resetModel:
        () => {
          const previous =
            cloneModel(
              get().model,
            );

          set(
            (state) => ({
              model:
                createEmptyModel(),

              selection:
                EMPTY_SELECTION,

              past: [
                ...state.past,
                previous,
              ].slice(
                -HISTORY_LIMIT,
              ),

              future: [],

              transactionBase:
                null,
            }),
          );

          get().showNotice(
            'Novo modelo criado. Use Desfazer para recuperar o modelo anterior.',
            'info',
          );
        },

      /* ===================================================
         EXPORTAÇÃO JSON
         =================================================== */

      exportJson:
        () => {
          const model =
            get().model;

          const blob =
            new Blob(
              [
                JSON.stringify(
                  model,
                  null,
                  2,
                ),
              ],
              {
                type:
                  'application/json',
              },
            );

          const url =
            URL.createObjectURL(
              blob,
            );

          const anchor =
            document.createElement(
              'a',
            );

          anchor.href =
            url;

          anchor.download =
            `${
              model.name
                .trim()
                .replace(
                  /\s+/g,
                  '-',
                )
                .toLowerCase() ||
              'ecos-model'
            }.json`;

          document.body.appendChild(
            anchor,
          );

          anchor.click();

          anchor.remove();

          URL.revokeObjectURL(
            url,
          );
        },

      /* ===================================================
         NOTIFICAÇÕES
         =================================================== */

      showNotice: (
        message,
        tone = 'info',
      ) => {
        set({
          notice: {
            id:
              crypto.randomUUID(),

            tone,

            message,
          },
        });
      },

      clearNotice:
        () => {
          set({
            notice: null,
          });
        },
    }),
  );