import type { Config } from "../sim/config.ts";

/**
 * Stage one and sedentism (E29). All numbers are placeholders: what can be
 * decided by thinking is decided; the rest is found by playing (E27).
 *
 * Content declares, the engine interprets (T3). Nothing here is a function.
 */

export const STAGE1: Config = {
  // ------------------------------------------------------------------ stocks
  stocks: [
    {
      id: "food",
      // Measured in nutrition, not in mass (E5): that is why cooking is an
      // ordinary process raising the yield instead of a disguised cut in
      // consumption.
      decayPerTick: 0.85,
      // Sedentism makes food storable — a rule the phase reads (E23).
      decayWhenRule: [{ rule: "settled", decayPerTick: 0.06 }],
    },
    { id: "wood", decayPerTick: 0.02 },
    { id: "housing", decayPerTick: 0.004 },
  ],

  // ------------------------------------------------------------------- areas
  areaTypes: [{ id: "wilderness" }, { id: "cleared" }],

  // ---------------------------------------------------------------- branches
  branches: [
    { id: "food", produces: "food", unlockedFromStart: true },
    { id: "wood", produces: "wood", unlockedFromStart: false },
    { id: "housing", produces: "housing", unlockedFromStart: false },
  ],

  // --------------------------------------------------------------- processes
  processes: [
    // The gathering chain: techniques without a capacity input, so each
    // replaces its predecessor entirely and no fallback is ever needed (E5).
    {
      id: "gathering",
      branch: "food",
      priority: 100,
      outputPerLabor: 1.0,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.7,
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      id: "gathering_tools",
      branch: "food",
      priority: 110,
      outputPerLabor: 1.35,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.7,
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "gathering_cooked",
      branch: "food",
      priority: 120,
      outputPerLabor: 1.75,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.7,
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "hunting",
      branch: "food",
      priority: 130,
      outputPerLabor: 2.15,
      areaPerOutput: { wilderness: 2.6 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.8,
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },

    // Farming: far more per area, distinctly less per unit of labour — Boserup.
    // It stands above the gathering chain so that cleared land is used, and the
    // chain remains the fallback for whatever the fields cannot carry (E5).
    {
      id: "farming",
      branch: "food",
      priority: 200,
      outputPerLabor: 0.8,
      areaPerOutput: { cleared: 0.35 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.6,
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    {
      id: "forestry",
      branch: "wood",
      priority: 100,
      outputPerLabor: 0.9,
      areaPerOutput: { wilderness: 1.2 },
      intermediatesPerOutput: {},
      weatherSensitivity: 0.2,
      qualityWeight: 0.4,
      unlockedFromStart: false,
    },
    {
      id: "building",
      branch: "housing",
      priority: 100,
      outputPerLabor: 0.35,
      areaPerOutput: { cleared: 0.05 },
      intermediatesPerOutput: { wood: 1.4 },
      weatherSensitivity: 0.0,
      qualityWeight: 0.0,
      unlockedFromStart: false,
    },
  ],

  // ------------------------------------------------------------------- needs
  // Absolute rank numbers with gaps (E9): the order in which branches are
  // unlocked does not matter, and a tier can be inserted between later.
  needTiers: [
    {
      id: "food_survival",
      rank: 100,
      stock: "food",
      branch: "food",
      perHead: 1.0,
      deathRate: { atZero: 0.075, atFull: 0 },
    },
    {
      id: "shelter_roof",
      rank: 200,
      stock: "housing",
      branch: "housing",
      perHead: 0.3,
      deathRate: { atZero: 0.012, atFull: 0 },
      birthRate: { atZero: 0, atFull: 0.006 },
    },
    {
      id: "food_satiety",
      rank: 300,
      stock: "food",
      branch: "food",
      perHead: 0.8,
      birthRate: { atZero: 0, atFull: 0.02 },
      productivity: { atZero: 0, atFull: 0.2 },
    },
  ],

  // ---------------------------------------------------------------- projects
  projects: [
    {
      id: "better_tools",
      visibleWhen: [],
      availableWhen: [],
      laborCost: 14,
      stockCost: {},
      minTicks: 8,
      repeatable: false,
      effects: [{ type: "process", id: "gathering_tools" }],
      sector: "households",
    },
    {
      id: "use_fire",
      visibleWhen: [],
      availableWhen: [{ kind: "projectDone", id: "better_tools", min: 1 }],
      laborCost: 24,
      stockCost: {},
      minTicks: 12,
      repeatable: false,
      effects: [{ type: "process", id: "gathering_cooked" }],
      sector: "households",
    },
    {
      id: "hunting_weapons",
      visibleWhen: [{ kind: "projectDone", id: "better_tools", min: 1 }],
      availableWhen: [{ kind: "projectDone", id: "use_fire", min: 1 }],
      laborCost: 40,
      stockCost: {},
      minTicks: 16,
      repeatable: false,
      effects: [{ type: "process", id: "hunting" }],
      sector: "households",
    },

    // The institution. Its name is not "farming": it changes rules, and a
    // process is only one of the things it brings (E12, E29).
    {
      id: "sedentism",
      visibleWhen: [{ kind: "projectDone", id: "better_tools", min: 1 }],
      availableWhen: [{ kind: "population", min: 60 }],
      laborCost: 120,
      stockCost: {},
      minTicks: 40,
      repeatable: false,
      effects: [
        { type: "rule", id: "settled", set: true },
        { type: "process", id: "farming" },
        { type: "process", id: "forestry" },
        { type: "process", id: "building" },
        { type: "branch", id: "wood" },
        { type: "branch", id: "housing" },
        // The first fields: wilderness becomes cleared land, inheriting its
        // quality (E13).
        {
          type: "capacity",
          areaType: "wilderness",
          amount: -20,
        },
        {
          type: "capacity",
          areaType: "cleared",
          sector: "households",
          amount: 20,
          quality: { kind: "from", areaType: "wilderness" },
        },
      ],
      sector: "households",
    },

    {
      id: "clearing",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        { kind: "unownedArea", areaType: "wilderness", min: 10 },
      ],
      laborCost: 18,
      stockCost: {},
      minTicks: 6,
      repeatable: true,
      effects: [
        { type: "capacity", areaType: "wilderness", amount: -10 },
        {
          type: "capacity",
          areaType: "cleared",
          sector: "households",
          amount: 10,
          quality: { kind: "from", areaType: "wilderness" },
        },
      ],
      sector: "households",
    },

    {
      id: "land_taking",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [{ kind: "rule", id: "settled", set: true }],
      laborCost: 70,
      stockCost: {},
      minTicks: 20,
      repeatable: true,
      effects: [
        // New territory arrives as wilderness and belongs to nobody (E13).
        // Each taking is worse than the one before it — Ricardo.
        {
          type: "capacity",
          areaType: "wilderness",
          amount: 40,
          quality: { kind: "nextTaking" },
        },
      ],
      sector: "households",
    },
  ],

  // -------------------------------------------------------------- population
  // Equal base rates: with rank 100 fully covered and nothing above it, births
  // equal deaths and the population stands (E20).
  population: {
    baseBirthRate: 0.012,
    baseDeathRate: 0.012,
    minimumViableSize: 12,
  },

  weather: { shape: "powerLeftSkewed", exponent: 8 },

  land: { baseQuality: 1.0, qualityDecayPerTaking: 0.05 },

  carried: { baseProductivity: 1.0, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
