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
      // Decay is spoilage, nothing else — eating is consumption and sits on the
      // need tier. Without a store almost nothing survives the tick.
      decayPerTick: 0.9,
      // Sedentism makes food storable — a rule the phase reads (E23). Not
      // storable *for free*: holding a store still costs, which is what makes
      // the buffer against a bad year a trade-off rather than a formality (E19).
      decayWhenRule: [{ rule: "settled", decayPerTick: 0.12 }],
    },
    // Labour: made every tick out of the people, gone by the next one.
    { id: "labor", decayPerTick: 1 },
    { id: "wood", decayPerTick: 0.02 },
    // Buildings need upkeep: maintenance is simply rebuilding what fell apart,
    // and it keeps absorbing labour instead of being a one-off (E19).
    { id: "housing", decayPerTick: 0.02 },
  ],

  // ------------------------------------------------------------------- areas
  areaTypes: [
    { id: "wilderness" },
    { id: "cleared" },
    // People are a capacity like land: occupied for a tick, not used up.
    { id: "people", fromPopulation: true },
  ],

  // ---------------------------------------------------------------- branches
  branches: [
    { id: "labor", produces: "labor", unlockedFromStart: true },
    { id: "food", produces: "food", unlockedFromStart: true },
    { id: "wood", produces: "wood", unlockedFromStart: false },
    { id: "housing", produces: "housing", unlockedFromStart: false },
  ],

  // --------------------------------------------------------------- processes
  processes: [
    // Labour is produced like anything else: out of the capacity "people".
    // Quality carries work ability and productivity, so one head yields exactly
    // its performance.
    {
      id: "labor",
      branch: "labor",
      priority: 999,
      areaPerOutput: { people: 1 },
      intermediatesPerOutput: {},
      exposure: {},
      qualityWeight: 1,
      unlockedFromStart: true,
    },

    // The gathering chain: techniques without a capacity input, so each
    // replaces its predecessor entirely and no fallback is ever needed (E5).
    {
      id: "gathering",
      branch: "food",
      priority: 100,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: { labor: 0.769231 },
      exposure: { weather: 0.7 },
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      id: "gathering_tools",
      branch: "food",
      priority: 110,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: { labor: 0.625 },
      exposure: { weather: 0.7 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "gathering_cooked",
      branch: "food",
      priority: 120,
      areaPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: { labor: 0.512821 },
      exposure: { weather: 0.7 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "hunting",
      branch: "food",
      priority: 130,
      areaPerOutput: { wilderness: 2.6 },
      intermediatesPerOutput: { labor: 0.434783 },
      exposure: { weather: 0.8 },
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
      areaPerOutput: { cleared: 0.35 },
      intermediatesPerOutput: { labor: 0.625 },
      exposure: { weather: 0.6 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    // Intensification: more per hectare, at the price of more labour per unit.
    // This is the way out of the trap — expansion runs into the fixed factor,
    // and only working the same land harder gets past it (E6, E13).
    {
      id: "farming_fallow",
      branch: "food",
      priority: 210,
      areaPerOutput: { cleared: 0.2 },
      intermediatesPerOutput: { labor: 0.740741 },
      exposure: { weather: 0.5 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    {
      id: "forestry",
      branch: "wood",
      priority: 100,
      areaPerOutput: { wilderness: 1.2 },
      intermediatesPerOutput: { labor: 1.111111 },
      exposure: { weather: 0.2 },
      qualityWeight: 0.4,
      unlockedFromStart: false,
    },
    {
      id: "building",
      branch: "housing",
      priority: 100,
      areaPerOutput: { cleared: 0.05 },
      intermediatesPerOutput: { labor: 2.857143, wood: 1.4 },
      exposure: { weather: 0.0 },
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
      consumedOnUse: 1,
      deathRate: { atZero: 0.08, atFull: 0 },
    },
    // Firewood. The biggest bulk good of the pre-industrial economy: cooking
    // and heating took far more wood than building did. Deliberately the *same*
    // stock as construction timber, so the ranking decides — and at rank 150,
    // ahead of shelter at 200, people burn their building material first.
    // Which is what happened.
    {
      id: "warmth_fire",
      rank: 150,
      stock: "wood",
      branch: "wood",
      perHead: 0.1,
      consumedOnUse: 1,
      deathRate: { atZero: 0.02, atFull: 0 },
    },
    {
      id: "shelter_roof",
      rank: 200,
      stock: "housing",
      branch: "housing",
      perHead: 0.3,
      consumedOnUse: 0,
      deathRate: { atZero: 0.005, atFull: 0 },
      birthRate: { atZero: 0, atFull: 0.003 },
    },
    {
      id: "food_satiety",
      rank: 300,
      stock: "food",
      branch: "food",
      perHead: 0.8,
      consumedOnUse: 1,
      birthRate: { atZero: 0, atFull: 0.011 },
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
      availableWhen: [{ kind: "population", min: 45 }],
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
      // Clearing is hard work and slow. That is what makes the fixed factor
      // bite: a growing population outruns what can be cleared (E7, E13).
      laborCost: 60,
      stockCost: {},
      minTicks: 15,
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

    // Costs almost nothing but time: crop rotation is an agreement, not a
    // building. It becomes available once enough fields have been worked —
    // learning by doing, expressed through the finished projects that are in
    // the state anyway (E12).
    {
      id: "fallowing",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        { kind: "projectDone", id: "clearing", min: 4 },
      ],
      laborCost: 6,
      stockCost: {},
      minTicks: 30,
      repeatable: false,
      effects: [{ type: "process", id: "farming_fallow" }],
      sector: "households",
    },

    {
      id: "land_taking",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        // The cap of the epoch (E13). Beyond it only an institution helps.
        { kind: "landTakings", max: 6 },
      ],
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
    baseBirthRate: 0.01,
    baseDeathRate: 0.01,
    minimumViableSize: 12,
  },

  shocks: { weather: { shape: "powerLeftSkewed", exponent: 8 } },

  // Risk aversion: how strongly a thin store pushes towards the reliable
  // process (E5).
  risk: { aversion: 0.5 },

  // The player may set the order by hand from the start; a later institution
  // unsets this rule (E23) and the economy decides alone from then on.
  rulesFromStart: ["manualProcessChoice"],

  land: { baseQuality: 1.0, qualityDecayPerTaking: 0.05 },

  carried: { baseProductivity: 1.0, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
