import type { Config } from "../sim/config.ts";

/**
 * Stage one and sedentism (E29). All numbers are placeholders: what can be
 * decided by thinking is decided; the rest is found by playing (E27).
 *
 * Content declares, the engine interprets (T3). Nothing here is a function.
 */

/**
 * Where a project's claim stands unless the player moves it: above every need
 * (E18 — projects are financed first). Every project starts there because that
 * is the rule; the player lowers it for anything he is not willing to go hungry
 * for, and each project carries its own number, so a granary and a monument
 * need not be equally urgent.
 */
const PROJECTS_FIRST = 0;

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
      // Three rates, and they have to stand in this order: unsheltered, a pit
      // dug by people who move on, and a store in a place someone lives in and
      // guards. A wanderer's pit must never keep better than a village.
      //
      // Storing comes first and is what makes staying possible (Testart), not
      // the other way round — so the pits work before sedentism. Settling then
      // makes the *same* pits keep far better, which is what a permanent place
      // buys: maintenance and a guard.
      protectedBy: {
        capacity: "storage",
        decayPerTick: 0.4,
        decayWhenRule: [{ rule: "settled", decayPerTick: 0.12 }],
      },
    },
    // Labour: made every tick out of the people, gone by the next one.
    { id: "labor", decayPerTick: 1 },
    { id: "wood", decayPerTick: 0.02 },
    // Buildings need upkeep: maintenance is simply rebuilding what fell apart,
    // and it keeps absorbing labour instead of being a one-off (E19).
    { id: "housing", decayPerTick: 0.02 },
  ],

  // ------------------------------------------------------------------- capacityHeld
  capacities: [
    { id: "wilderness" },
    { id: "cleared" },
    // People are a capacity like land: occupied for a tick, not used up.
    { id: "people", fromPopulation: true },
    // The first capacity that is neither land nor people — and the first that
    // decays: a pit collapses and lets the damp in. Keeping it means digging
    // again (E19), there is no separate upkeep.
    { id: "storage", decayPerTick: 0.01 },
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
      capacityPerOutput: { people: 1 },
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
      capacityPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: { labor: 0.769231 },
      exposure: { weather: 1.0 },
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      id: "gathering_sickle",
      branch: "food",
      priority: 110,
      capacityPerOutput: { wilderness: 3.0 },
      intermediatesPerOutput: { labor: 0.625 },
      exposure: { weather: 1.0 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "hunting",
      branch: "food",
      priority: 130,
      capacityPerOutput: { wilderness: 2.6 },
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
      capacityPerOutput: { cleared: 0.35 },
      intermediatesPerOutput: { labor: 0.625 },
      exposure: { weather: 0.6 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    // Intensification: more per unit of ground, at the price of more labour per unit.
    // This is the way out of the trap — expansion runs into the fixed factor,
    // and only working the same land harder gets past it (E6, E13).
    {
      id: "farming_fallow",
      branch: "food",
      priority: 210,
      capacityPerOutput: { cleared: 0.2 },
      intermediatesPerOutput: { labor: 0.740741 },
      exposure: { weather: 0.5 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    {
      id: "forestry",
      branch: "wood",
      priority: 100,
      capacityPerOutput: { wilderness: 1.2 },
      intermediatesPerOutput: { labor: 1.111111 },
      exposure: { weather: 0.2 },
      qualityWeight: 0.4,
      unlockedFromStart: false,
    },
    {
      id: "building",
      branch: "housing",
      priority: 100,
      capacityPerOutput: { cleared: 0.05 },
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
      // Most of what a subsistence society eats is not discretionary. With 1,0
      // against 0,8 for satiety, 44 % of the food need could be given up in a
      // bad year — measured, that made famine impossible: at tick 124 the worst
      // draw of the whole run (0,39) still left hunger fully covered. A society
      // with 44 % of its calories to spare is not a subsistence society. At
      // 1,4 against 0,4 the cushion is 22 %, and a bad year reaches through it.
      perHead: 1.2,
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
      // A cold year takes the harvest and calls for more firewood at the same
      // time (E24). Less exposed than the harvest itself: one heats against the
      // winter one has, and a poor summer is not a hard winter.
      exposure: { weather: 0.4 },
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
      perHead: 0.6,
      consumedOnUse: 1,
      birthRate: { atZero: 0, atFull: 0.011 },
      productivity: { atZero: 0, atFull: 0.2 },
    },
  ],

  // ---------------------------------------------------------------- projects
  projects: [
    // Three at once from the first tick, none needing another, each with a
    // different payoff profile — sure and small, delayed and large, immediate
    // but on the other side of the ledger. Three buttons that all mean "number
    // goes up" would be no choice however many there are.
    //
    // All three are Natufian, so they belong to one world rather than to three
    // epochs: sickle blades with gloss and mortars are its type fossils
    // (Flannery's broad spectrum revolution), and the storage structures of
    // Dhra' precede domestication by about a thousand years (Kuijt & Finlayson
    // 2009). "Tools" and "fire" were both too general — fire had been mastered
    // a million years earlier.
    {
      id: "sickle_blades",
      visibleWhen: [],
      availableWhen: [],
      defaultRank: PROJECTS_FIRST,
      laborCost: 90,
      stockCost: {},
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "gathering_sickle" }],
      sector: "households",
    },
    {
      // Acts on consumption, not on production: grinding makes hard seeds
      // digestible, so the same harvest feeds more. No process can reach that —
      // it is the per-head cost of the need itself.
      id: "grinding_stones",
      visibleWhen: [],
      availableWhen: [],
      defaultRank: PROJECTS_FIRST,
      laborCost: 90,
      stockCost: {},
      minTicks: 12,
      limit: 1,
      effects: [{ type: "tier", id: "food_survival", perHead: 1.02 }],
      sector: "households",
    },
    {
      // Repeatable, because the pits fall in: keeping a capacity is building it
      // again (E19). It is also the only one that pays nothing at all today —
      // it pays in the years that would otherwise have killed people.
      id: "storage_pits",
      visibleWhen: [],
      availableWhen: [],
      defaultRank: PROJECTS_FIRST,
      laborCost: 90,
      stockCost: {},
      minTicks: 12,
      effects: [
        {
          type: "capacity",
          capacity: "storage",
          sector: "households",
          amount: 40,
          quality: { kind: "fixed", value: 1 },
        },
      ],
      sector: "households",
    },
    {
      // Second wave: it does something the first three do not — it opens a
      // *second* process on the same wilderness, so the ground becomes
      // contested and the player sees for the first time that the allocation
      // mixes rather than switches.
      id: "hunting_weapons",
      visibleWhen: [],
      availableWhen: [{ kind: "projectDone", id: "sickle_blades", min: 1 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 90,
      stockCost: {},
      minTicks: 16,
      limit: 1,
      effects: [{ type: "process", id: "hunting" }],
      sector: "households",
    },

    // The institution. Its name is not "farming": it changes rules, and a
    // process is only one of the things it brings (E12, E29).
    {
      id: "sedentism",
      visibleWhen: [{ kind: "projectDone", id: "storage_pits", min: 1 }],
      // Not a population that arrives by itself, and not a store that happens
      // to be full after a good year — but pits actually dug. What ties people
      // to a place is capital they cannot carry (Testart): a full granary after
      // a good harvest makes nobody sedentary, a pit does.
      //
      // It also has to be this and not the held stock, because a held stock
      // moves with the weather: bad luck may delay a transition, never block it.
      availableWhen: [{ kind: "capacityPerHead", capacity: "storage", min: 2 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: {},
      minTicks: 40,
      limit: 1,
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
          capacity: "wilderness",
          amount: -20,
        },
        {
          type: "capacity",
          capacity: "cleared",
          sector: "households",
          amount: 20,
          quality: { kind: "from", capacity: "wilderness" },
        },
      ],
      sector: "households",
    },

    {
      id: "clearing",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        { kind: "unownedCapacity", capacity: "wilderness", min: 10 },
      ],
      defaultRank: PROJECTS_FIRST,
      // Clearing is hard work and slow. That is what makes the fixed factor
      // bite: a growing population outruns what can be cleared (E7, E13).
      laborCost: 60,
      stockCost: {},
      minTicks: 15,
      effects: [
        { type: "capacity", capacity: "wilderness", amount: -10 },
        {
          type: "capacity",
          capacity: "cleared",
          sector: "households",
          amount: 10,
          quality: { kind: "from", capacity: "wilderness" },
        },
      ],
      sector: "households",
    },

    // The way back out of the clearing. Without it the wilderness can only ever
    // shrink, and a settlement that cleared too much is stuck without wood,
    // without houses and with a death penalty it can never lift — measured, it
    // bled out from 1774 people over six hundred ticks with hunger fully
    // covered the whole way. E20 says there is no state without a way back.
    //
    // Cheap in labour and very slow: putting land back into forest is mostly a
    // decision to stop farming it, but a forest takes its time. So noticing
    // late still hurts, which is what makes watching the wood worth doing.
    // Historically this is coppice and Hauberg management — forest deliberately
    // held beside the fields rather than left over.
    {
      id: "afforestation",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        { kind: "ownedCapacity", capacity: "cleared", min: 10 },
      ],
      defaultRank: PROJECTS_FIRST,
      laborCost: 20,
      stockCost: {},
      minTicks: 40,
      effects: [
        { type: "capacity", capacity: "cleared", sector: "households", amount: -10 },
        {
          type: "capacity",
          capacity: "wilderness",
          amount: 10,
          quality: { kind: "from", capacity: "cleared" },
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
      defaultRank: PROJECTS_FIRST,
      laborCost: 6,
      stockCost: {},
      minTicks: 30,
      limit: 1,
      effects: [{ type: "process", id: "farming_fallow" }],
      sector: "households",
    },

    {
      id: "land_taking",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [{ kind: "rule", id: "settled", set: true }],
      // The cap of the epoch (E13). Beyond it only an institution helps — and
      // it is a limit on the project, not a missing prerequisite: nothing is
      // lacking once it is spent, there is simply nothing left.
      limit: 6,
      defaultRank: PROJECTS_FIRST,
      laborCost: 70,
      stockCost: {},
      minTicks: 20,
      effects: [
        // New territory arrives as wilderness and belongs to nobody (E13).
        // Each taking is worse than the one before it — Ricardo.
        {
          type: "capacity",
          capacity: "wilderness",
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
    // Birdsell's "magic numbers": a band of about 25 is the smallest that
    // sustains itself — below it a group has to join another or it is gone.
    // Twelve was too low to be honest, because nothing recovers from twelve.
    minimumViableSize: 25,
  },

  shocks: { weather: { shape: "powerLeftSkewed", exponent: 4 } },

  // Risk aversion: how strongly a thin store pushes towards the reliable
  // process (E5).
  risk: { aversion: 0.5 },

  // The player may set the order by hand from the start; a later institution
  // unsets this rule (E23) and the economy decides alone from then on.
  rulesFromStart: [],

  land: { baseQuality: 1.0, qualityDecayPerTaking: 0.05 },

  carried: { baseProductivity: 1.0, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
