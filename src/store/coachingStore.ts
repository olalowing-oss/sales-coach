import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Battlecard, ObjectionHandler, CaseStudy, TriggerPattern } from '../types';
import {
  TRIGGER_PATTERNS as DEFAULT_TRIGGERS,
  BATTLECARDS as DEFAULT_BATTLECARDS,
  OBJECTION_HANDLERS as DEFAULT_OBJECTIONS,
  CASE_STUDIES as DEFAULT_CASES
} from '../data/knowledgeBase';
import {
  loadTriggerPatternsFromDb,
  syncTriggerPatternsToDb,
  loadBattlecardsFromDb,
  syncBattlecardsToDb,
  loadObjectionHandlersFromDb,
  syncObjectionHandlersToDb,
  loadCaseStudiesFromDb,
  syncCaseStudiesToDb
} from '../lib/supabaseOperations';

interface CoachingDataState {
  // Data
  triggerPatterns: Record<string, TriggerPattern>;
  battlecards: Battlecard[];
  objectionHandlers: ObjectionHandler[];
  caseStudies: CaseStudy[];

  // Initialize from database
  initializeFromDb: () => Promise<void>;

  // Trigger actions
  addTriggerPattern: (id: string, pattern: TriggerPattern) => void;
  updateTriggerPattern: (id: string, pattern: Partial<TriggerPattern>) => void;
  deleteTriggerPattern: (id: string) => void;

  // Battlecard actions
  addBattlecard: (battlecard: Omit<Battlecard, 'id'>) => void;
  updateBattlecard: (id: string, battlecard: Partial<Battlecard>) => void;
  deleteBattlecard: (id: string) => void;

  // Objection actions
  addObjectionHandler: (handler: Omit<ObjectionHandler, 'id'>) => void;
  updateObjectionHandler: (id: string, handler: Partial<ObjectionHandler>) => void;
  deleteObjectionHandler: (id: string) => void;

  // Case study actions
  addCaseStudy: (caseStudy: Omit<CaseStudy, 'id'>) => void;
  updateCaseStudy: (id: string, caseStudy: Partial<CaseStudy>) => void;
  deleteCaseStudy: (id: string) => void;

  // Reset
  resetToDefaults: () => void;
}

export const useCoachingStore = create<CoachingDataState>()(
  persist(
    (set, get) => ({
      // Initial data from knowledgeBase
      triggerPatterns: DEFAULT_TRIGGERS,
      battlecards: DEFAULT_BATTLECARDS,
      objectionHandlers: DEFAULT_OBJECTIONS,
      caseStudies: DEFAULT_CASES,

      // === INITIALIZE FROM DATABASE ===
      initializeFromDb: async () => {
        try {
          const [triggers, battlecards, objections, cases] = await Promise.all([
            loadTriggerPatternsFromDb(),
            loadBattlecardsFromDb(),
            loadObjectionHandlersFromDb(),
            loadCaseStudiesFromDb()
          ]);

          // Check if database is empty
          const dbIsEmpty = !triggers && !battlecards && !objections && !cases;

          if (dbIsEmpty) {
            // Database is empty - sync current localStorage data to database
            const state = get();
            console.log('📤 Databasen är tom - synkar localStorage-data till databas...');

            await Promise.all([
              syncTriggerPatternsToDb(state.triggerPatterns),
              syncBattlecardsToDb(state.battlecards),
              syncObjectionHandlersToDb(state.objectionHandlers),
              syncCaseStudiesToDb(state.caseStudies)
            ]);

            console.log('✅ Initial data synkad till databas');
          } else {
            // Database has data - load it into the store
            const updates: Partial<CoachingDataState> = {};

            if (triggers) updates.triggerPatterns = triggers;
            if (battlecards) updates.battlecards = battlecards;
            if (objections) updates.objectionHandlers = objections;
            if (cases) updates.caseStudies = cases;

            if (Object.keys(updates).length > 0) {
              set(updates);
              console.log('✅ Coaching-data laddad från databas');
            }
          }
        } catch (error) {
          console.error('❌ Fel vid laddning av coaching-data:', error);
        }
      },

      // === TRIGGER PATTERNS ===
      addTriggerPattern: (id, pattern) =>
        set((state) => {
          const updated = { ...state.triggerPatterns, [id]: pattern };
          syncTriggerPatternsToDb(updated).catch(err =>
            console.error('Failed to sync triggers to DB:', err)
          );
          return { triggerPatterns: updated };
        }),

      updateTriggerPattern: (id, pattern) =>
        set((state) => {
          const updated = {
            ...state.triggerPatterns,
            [id]: { ...state.triggerPatterns[id], ...pattern }
          };
          syncTriggerPatternsToDb(updated).catch(err =>
            console.error('Failed to sync triggers to DB:', err)
          );
          return { triggerPatterns: updated };
        }),

      deleteTriggerPattern: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.triggerPatterns;
          syncTriggerPatternsToDb(rest).catch(err =>
            console.error('Failed to sync triggers to DB:', err)
          );
          return { triggerPatterns: rest };
        }),

      // === BATTLECARDS ===
      addBattlecard: (battlecard) =>
        set((state) => {
          const updated = [...state.battlecards, { ...battlecard, id: uuidv4() }];
          syncBattlecardsToDb(updated).catch(err =>
            console.error('Failed to sync battlecards to DB:', err)
          );
          return { battlecards: updated };
        }),

      updateBattlecard: (id, battlecard) =>
        set((state) => {
          const updated = state.battlecards.map((bc) =>
            bc.id === id ? { ...bc, ...battlecard } : bc
          );
          syncBattlecardsToDb(updated).catch(err =>
            console.error('Failed to sync battlecards to DB:', err)
          );
          return { battlecards: updated };
        }),

      deleteBattlecard: (id) =>
        set((state) => {
          const updated = state.battlecards.filter((bc) => bc.id !== id);
          syncBattlecardsToDb(updated).catch(err =>
            console.error('Failed to sync battlecards to DB:', err)
          );
          return { battlecards: updated };
        }),

      // === OBJECTION HANDLERS ===
      addObjectionHandler: (handler) =>
        set((state) => {
          const updated = [...state.objectionHandlers, { ...handler, id: uuidv4() }];
          syncObjectionHandlersToDb(updated).catch(err =>
            console.error('Failed to sync objections to DB:', err)
          );
          return { objectionHandlers: updated };
        }),

      updateObjectionHandler: (id, handler) =>
        set((state) => {
          const updated = state.objectionHandlers.map((oh) =>
            oh.id === id ? { ...oh, ...handler } : oh
          );
          syncObjectionHandlersToDb(updated).catch(err =>
            console.error('Failed to sync objections to DB:', err)
          );
          return { objectionHandlers: updated };
        }),

      deleteObjectionHandler: (id) =>
        set((state) => {
          const updated = state.objectionHandlers.filter((oh) => oh.id !== id);
          syncObjectionHandlersToDb(updated).catch(err =>
            console.error('Failed to sync objections to DB:', err)
          );
          return { objectionHandlers: updated };
        }),

      // === CASE STUDIES ===
      addCaseStudy: (caseStudy) =>
        set((state) => {
          const updated = [...state.caseStudies, { ...caseStudy, id: uuidv4() }];
          syncCaseStudiesToDb(updated).catch(err =>
            console.error('Failed to sync cases to DB:', err)
          );
          return { caseStudies: updated };
        }),

      updateCaseStudy: (id, caseStudy) =>
        set((state) => {
          const updated = state.caseStudies.map((cs) =>
            cs.id === id ? { ...cs, ...caseStudy } : cs
          );
          syncCaseStudiesToDb(updated).catch(err =>
            console.error('Failed to sync cases to DB:', err)
          );
          return { caseStudies: updated };
        }),

      deleteCaseStudy: (id) =>
        set((state) => {
          const updated = state.caseStudies.filter((cs) => cs.id !== id);
          syncCaseStudiesToDb(updated).catch(err =>
            console.error('Failed to sync cases to DB:', err)
          );
          return { caseStudies: updated };
        }),

      // === RESET ===
      resetToDefaults: () => {
        set({
          triggerPatterns: DEFAULT_TRIGGERS,
          battlecards: DEFAULT_BATTLECARDS,
          objectionHandlers: DEFAULT_OBJECTIONS,
          caseStudies: DEFAULT_CASES
        });

        // Sync defaults to DB
        const state = get();
        Promise.all([
          syncTriggerPatternsToDb(state.triggerPatterns),
          syncBattlecardsToDb(state.battlecards),
          syncObjectionHandlersToDb(state.objectionHandlers),
          syncCaseStudiesToDb(state.caseStudies)
        ]).catch(err => console.error('Failed to sync defaults to DB:', err));
      }
    }),
    {
      name: 'b3-coaching-data',
      version: 1
    }
  )
);
