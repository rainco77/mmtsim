import type { Config } from "../sim/config.ts";

/**
 * Stage one and sedentism (E29). The structure is decided; the numbers are
 * hypotheses. What can be settled by thinking is settled here, the rest is
 * found by playing (E27) — so costs and effect sizes live in this file and not
 * in the concept, until they have been measured.
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
  //
  // Three of them are E19's three ways a stock can behave, and the epoch was
  // cut so that all three are on the table at once: food is eaten *and* spoils,
  // warmth is spent the moment it is made, clothing wears out slowly.
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
    // A fire is out by morning. Warmth is the one stock that cannot be held at
    // all, and that is the point of making it a good of its own rather than a
    // need pointed at wood: it is produced from wood and spent at once.
    { id: "warmth", decayPerTick: 1 },
    // Animals are not an area (E29). A hectare of forest is not used up by
    // hunting over it; the deer on it are. So game is a stock that is taken and
    // breeds again, and the wilderness only says how many of them the range can
    // carry. Out of that comes the epoch's own history: hunt the big game down
    // and fish and hard seeds begin to pay.
    {
      id: "game",
      decayPerTick: 0,
      regrowth: { ratePerTick: 0.3, capacity: "wilderness", densityPerArea: 3.0, refuge: 2 },
    },
    {
      id: "fish",
      decayPerTick: 0,
      regrowth: { ratePerTick: 0.4, capacity: "water", densityPerArea: 4.0, refuge: 2 },
    },
    { id: "hides", decayPerTick: 0.05 },
    { id: "fibre", decayPerTick: 0.04 },
    {
      // Clothing is not eaten and not burnt — it wears out. Sewing with an eyed
      // needle is what turns wrapped skins into garments that survive a season,
      // so the needle acts here and not on any process (E19).
      id: "clothing",
      decayPerTick: 0.03,
      decayWhenRule: [{ rule: "sewn", decayPerTick: 0.012 }],
    },
    // Buildings need upkeep: maintenance is simply rebuilding what fell apart,
    // and it keeps absorbing labour instead of being a one-off (E19).
    { id: "housing", decayPerTick: 0.02 },
  ],

  // -------------------------------------------------------------- capacities
  capacities: [
    { id: "wilderness" },
    // The second axis, and structurally the most important thing about the
    // epoch (E29): without it everything competes for the same wilderness and
    // every improvement only shifts who gets the ground. The European
    // Mesolithic is largely an adaptation to coast and river — people settled
    // down at the fish before they settled down at the grain.
    { id: "water" },
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
    { id: "wood", produces: "wood", unlockedFromStart: true },
    { id: "warmth", produces: "warmth", unlockedFromStart: true },
    { id: "hides", produces: "hides", unlockedFromStart: true },
    { id: "fibre", produces: "fibre", unlockedFromStart: true },
    { id: "clothing", produces: "clothing", unlockedFromStart: true },
    { id: "housing", produces: "housing", unlockedFromStart: false },
  ],

  // --------------------------------------------------------------- processes
  //
  // Named after the activity throughout (E29): what is done, not what comes
  // out. Eight of them run from the first tick — a game in which hunting has to
  // be invented claims nonsense, since people had been hunting big game for
  // hundreds of thousands of years (the Schöningen spears).
  processes: [
    // Labour is produced like anything else: out of the capacity "people".
    // Quality carries work ability and productivity, so one head yields exactly
    // its performance.
    {
      id: "labor",
      branch: "labor",
      activity: "working",
      priority: 999,
      capacityPerOutput: { people: 1 },
      intermediatesPerOutput: {},
      exposure: {},
      qualityWeight: 1,
      unlockedFromStart: true,
    },

    // ---- food: three ways, two axes of land ----
    //
    // Gathering is good per hand and poor per area; hunting is worse on both
    // counts until the bow, but it is what puts hides on the ground; fishing is
    // poor per hand and almost untouched by the year. The last is the whole
    // point of the water: it does not fail when the harvest fails.
    {
      id: "gathering",
      branch: "food",
      activity: "gathering",
      priority: 100,
      capacityPerOutput: { wilderness: 1.6 },
      intermediatesPerOutput: { labor: 0.28 },
      exposure: { weather: 1.0 },
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      // A hafted sickle roughly doubles the rate at which wild grain can be cut
      // (Harlan's experiment on Karacadağ). Less than that here, because the
      // sickle helps with the cutting and not with the walking and the
      // threshing.
      id: "gathering_sickle",
      branch: "food",
      activity: "gathering",
      priority: 105,
      capacityPerOutput: { wilderness: 1.6 },
      intermediatesPerOutput: { labor: 0.182 },
      exposure: { weather: 1.0 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      // The mortar's road: the same ground carries more, because small hard
      // seeds become edible and more of what already grows there counts as
      // food. Not a smaller appetite — the need is physiology (E29).
      //
      // Sickle and mortar stand beside each other rather than combining. A
      // process is unlocked by a set, so "both done" cannot be expressed
      // without a combined fourth process, and with every further improver that
      // doubles again. Holding both is still strictly better than holding
      // either, because the allocation may pick whichever the binding
      // constraint favours — it just does not get the product of the two.
      id: "gathering_mortar",
      branch: "food",
      activity: "gathering",
      priority: 103,
      capacityPerOutput: { wilderness: 1.2 },
      intermediatesPerOutput: { labor: 0.28 },
      exposure: { weather: 1.0 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      id: "hunting",
      branch: "food",
      activity: "hunting",
      priority: 90,
      capacityPerOutput: { wilderness: 1.5 },
      intermediatesPerOutput: { labor: 0.45, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      id: "hunting_bow",
      branch: "food",
      activity: "hunting",
      priority: 95,
      capacityPerOutput: { wilderness: 1.5 },
      intermediatesPerOutput: { labor: 0.27, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0.5,
      unlockedFromStart: false,
    },
    {
      // From the shore, with hands and a spear. Available from the first tick
      // and meagre: technology does not create a resource, it opens one (E29).
      id: "fishing",
      branch: "food",
      activity: "fishing",
      priority: 80,
      capacityPerOutput: { water: 0.8 },
      intermediatesPerOutput: { labor: 1.2, fish: 1.0 },
      exposure: { weather: 0.15 },
      qualityWeight: 0.2,
      unlockedFromStart: true,
    },
    {
      // A set net fishes while you sleep. Still worse per hand than gathering —
      // but it does not touch the wilderness and it does not fail in a bad
      // year, and once the land is full that is what decides.
      id: "fishing_net",
      branch: "food",
      activity: "fishing",
      priority: 85,
      capacityPerOutput: { water: 0.8 },
      intermediatesPerOutput: { labor: 0.48, fish: 1.0 },
      exposure: { weather: 0.15 },
      qualityWeight: 0.2,
      unlockedFromStart: false,
    },

    // Farming: far more per area, distinctly less per unit of labour — Boserup.
    // It stands above the gathering chain so that cleared land is used, and the
    // chain remains the fallback for whatever the fields cannot carry (E5).
    {
      id: "farming",
      branch: "food",
      activity: "farming",
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
      activity: "farming",
      priority: 210,
      capacityPerOutput: { cleared: 0.2 },
      intermediatesPerOutput: { labor: 0.740741 },
      exposure: { weather: 0.5 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    // ---- wood: the one change of technique in the epoch ----
    {
      // Picking up deadwood: much walking for little wood. A leftover, not a
      // stock.
      id: "wood_gathering",
      branch: "wood",
      activity: "woodcutting",
      priority: 100,
      capacityPerOutput: { wilderness: 0.6 },
      intermediatesPerOutput: { labor: 0.6 },
      exposure: { weather: 0.2 },
      qualityWeight: 0.4,
      unlockedFromStart: true,
    },
    {
      // Taking what stands instead of what lies. The biggest single jump of the
      // epoch, and the same sentence as the boat: technology does not create
      // the resource, it opens it.
      id: "felling",
      branch: "wood",
      activity: "woodcutting",
      priority: 110,
      capacityPerOutput: { wilderness: 0.6 },
      intermediatesPerOutput: { labor: 0.24 },
      exposure: { weather: 0.2 },
      qualityWeight: 0.4,
      unlockedFromStart: false,
    },

    // ---- warmth: made out of wood, spent at once ----
    {
      id: "open_fire",
      branch: "warmth",
      activity: "firemaking",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.3, wood: 1.5 },
      exposure: {},
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      // A covered pit of hot stones holds the heat instead of letting it go
      // straight up. The only effect in the epoch on the *intermediate* axis —
      // the ancestor of every later efficiency.
      id: "earth_oven",
      branch: "warmth",
      activity: "firemaking",
      priority: 110,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.3, wood: 0.9 },
      exposure: {},
      qualityWeight: 0,
      unlockedFromStart: false,
    },

    // ---- the two roads to clothing ----
    //
    // Hides want much ground and little labour, fibre little ground and much
    // labour. That is the first real alternative of the epoch (E31): it shifts
    // the risk profile, not the outcome. When land is tight fibre wins, when
    // hands are tight hides win — and it says something true, because it was
    // exactly when land grew tight that people went from animal to plant
    // materials.
    //
    // The difference in ground does not sit in these two processes but one step
    // above them, in hunting and bast gathering. The player feels it all the
    // same, because the allocation reckons in chain coefficients (E21).
    {
      id: "hunting_hides",
      branch: "hides",
      activity: "hunting",
      priority: 100,
      capacityPerOutput: { wilderness: 1.5 },
      intermediatesPerOutput: { labor: 0.3, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0.5,
      unlockedFromStart: true,
    },
    {
      id: "bast_gathering",
      branch: "fibre",
      activity: "bastgathering",
      priority: 100,
      capacityPerOutput: { wilderness: 0.5 },
      intermediatesPerOutput: { labor: 1.0 },
      exposure: { weather: 0.4 },
      qualityWeight: 0.4,
      unlockedFromStart: true,
    },
    {
      id: "hide_dressing",
      branch: "clothing",
      activity: "clothmaking",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.5, hides: 1.0 },
      exposure: {},
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      // Bark and brain tanning: the skin stops being a stiff board.
      id: "tanning",
      branch: "clothing",
      activity: "clothmaking",
      priority: 110,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.35, hides: 1.0 },
      exposure: {},
      qualityWeight: 0,
      unlockedFromStart: false,
    },
    {
      // Two fibres twisted against each other hold a great deal more than loose
      // bast and work up far faster. The counterpart of tanning: both are the
      // preparation that turns a raw material into a workable one, one on each
      // road to clothing — so neither road is the poor relation.
      //
      // *Zwirnbindung* — twining — is both the everyday word and the term the
      // archaeology uses for the textiles of this epoch. Twisted fibre is known
      // from the Abri du Maras at some 41,000 years, cord impressions run right
      // through the Mesolithic, and the net of Antrea is twisted bast.
      id: "twining",
      branch: "clothing",
      priority: 95,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.42, fibre: 1.0 },
      exposure: {},
      qualityWeight: 0,
      activity: "clothmaking",
      unlockedFromStart: false,
    },
    {
      id: "plaiting",
      branch: "clothing",
      activity: "clothmaking",
      priority: 90,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.6, fibre: 1.0 },
      exposure: {},
      qualityWeight: 0,
      unlockedFromStart: true,
    },

    {
      id: "building",
      branch: "housing",
      activity: "building",
      priority: 100,
      capacityPerOutput: { cleared: 0.05 },
      intermediatesPerOutput: { labor: 2.857143, wood: 1.4 },
      exposure: { weather: 0.0 },
      qualityWeight: 0.0,
      unlockedFromStart: false,
    },
  ],

  // ------------------------------------------------------------------- needs
  //
  // Determined by physiology, not by technique (E29): what a person needs in
  // order not to die, to have children and to be able to work. Ranks run in
  // hundreds because project ranks live in the same number space (E18), which
  // leaves ninety-nine places between them for projects and for needs inserted
  // later — housing is such a later one and sits at 350.
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
    {
      // Fire. It kills when it fails, which is why it ranks straight above
      // hunger and above everything else.
      id: "warmth_fire",
      rank: 200,
      // A cold year takes the harvest and calls for more firewood at the same
      // time (E24). Less exposed than the harvest itself: one heats against the
      // winter one has, and a poor summer is not a hard winter.
      exposure: { weather: 0.4 },
      stock: "warmth",
      branch: "warmth",
      perHead: 0.1,
      consumedOnUse: 1,
      deathRate: { atZero: 0.02, atFull: 0 },
    },
    {
      // Clothing does not kill, it costs *work ability* (E16). The honest
      // effect is not "you die without a coat" but "you can work fewer days
      // outdoors" — arithmetically the same multiplication, but kept apart so
      // the view can later say how much was worked and how productive it was.
      //
      // Also exposed on the demand side: a cold year asks for more of it.
      id: "clothing_cover",
      rank: 300,
      exposure: { weather: 0.3 },
      stock: "clothing",
      branch: "clothing",
      perHead: 0.3,
      // Worn, not used up. What eats clothing is decay, and that is on the
      // stock, where the needle can reach it.
      consumedOnUse: 0,
      workAbility: { atZero: 0.6, atFull: 1.0 },
    },
    {
      // Arrives with sedentism, so it is numbered into the gap (E29).
      id: "shelter_roof",
      rank: 350,
      stock: "housing",
      branch: "housing",
      perHead: 0.3,
      consumedOnUse: 0,
      deathRate: { atZero: 0.005, atFull: 0 },
      birthRate: { atZero: 0, atFull: 0.003 },
    },
    {
      id: "food_satiety",
      rank: 400,
      stock: "food",
      branch: "food",
      perHead: 0.6,
      consumedOnUse: 1,
      birthRate: { atZero: 0, atFull: 0.011 },
      productivity: { atZero: 0, atFull: 0.2 },
    },
  ],

  // ---------------------------------------------------------------- projects
  //
  // Twelve for the epoch, on five axes, and no two of them doing the same
  // thing (E29, step 3). Almost none of them gates another: what gates them is
  // the economy. At the first tick all the wood goes into warmth, which ranks
  // above every project, so no wood project can be paid for — and fibre exists
  // only if someone gathers bast. Three are actually startable on tick one:
  // mortar, earth oven, taking land.
  //
  // Every project is named the way a layman names the thing; the archaeological
  // term stays in the comment.
  projects: [
    // ---- startable at once ----
    {
      // Natufian mortars, Wadi Hammeh. Grinding makes small hard seeds edible,
      // so more of what already grows there counts as food: the same ground
      // yields more. Not a smaller appetite — the need is physiology (E29).
      id: "mortar",
      visibleWhen: [{ kind: "experience", activities: ["gathering"], min: 200 }],
      availableWhen: [{ kind: "experience", activities: ["gathering"], min: 400 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 40,
      stockCost: {},
      minTicks: 8,
      limit: 1,
      effects: [{ type: "process", id: "gathering_mortar" }],
      sector: "households",
    },
    {
      // Cooking pits and burnt mounds are among the commonest Mesolithic finds.
      id: "earth_oven",
      visibleWhen: [{ kind: "experience", activities: ["firemaking"], min: 5 }],
      availableWhen: [{ kind: "experience", activities: ["firemaking"], min: 10 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 40,
      stockCost: {},
      minTicks: 8,
      limit: 1,
      effects: [{ type: "process", id: "earth_oven" }],
      sector: "households",
    },
    {
      // A band under pressure widens its range. Repeatable, each time worse —
      // Ricardo's differential rent. The cap is a limit on the project, not a
      // missing prerequisite: nothing is lacking once it is spent, there is
      // simply nothing left (E12).
      id: "land_taking",
      visibleWhen: [],
      availableWhen: [],
      limit: 6,
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: {},
      minTicks: 12,
      effects: [
        {
          type: "capacity",
          capacity: "wilderness",
          amount: 40,
          quality: { kind: "nextTaking" },
        },
      ],
      sector: "households",
    },

    // ---- wanting wood ----
    {
      // Natufian blades with sickle gloss.
      id: "sickle",
      visibleWhen: [{ kind: "experience", activities: ["gathering"], min: 50 }],
      availableWhen: [{ kind: "experience", activities: ["gathering"], min: 100 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { wood: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "gathering_sickle" }],
      sector: "households",
    },
    {
      // Mesolithic core axes. Stone and not simply "axe", so the name says
      // which world this is and leaves room for an iron one later.
      id: "stone_axe",
      visibleWhen: [{ kind: "experience", activities: ["woodcutting"], min: 15 }],
      availableWhen: [{ kind: "experience", activities: ["woodcutting"], min: 30 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { wood: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "felling" }],
      sector: "households",
    },
    {
      // Repeatable, because the pits fall in: keeping a capacity is building it
      // again (E19). It is also the only one that pays nothing at all today —
      // it pays in the years that would otherwise have killed people. Dhra',
      // about a thousand years before domestication (Kuijt & Finlayson 2009).
      id: "storage_pit",
      visibleWhen: [],
      availableWhen: [],
      defaultRank: PROJECTS_FIRST,
      laborCost: 60,
      stockCost: { wood: 10 },
      minTicks: 6,
      effects: [
        {
          type: "capacity",
          capacity: "storage",
          sector: "households",
          amount: 100,
          quality: { kind: "fixed", value: 1 },
        },
      ],
      sector: "households",
    },

    // ---- wanting fibre ----
    {
      // The net of Antrea, about 8300 BC — the oldest one preserved, and it is
      // made of bast. The prerequisite is therefore not a lock but a reckoning:
      // somebody has to be gathering fibre.
      id: "fishing_net",
      visibleWhen: [{ kind: "experience", activities: ["fishing"], min: 25 }],
      availableWhen: [{ kind: "experience", activities: ["fishing"], min: 50 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { fibre: 30 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "fishing_net" }],
      sector: "households",
    },
    {
      // Eyed needles since the Upper Palaeolithic. It acts on both roads to
      // clothing on purpose: were every clothing project to favour one of them,
      // the other would be strictly worse after two of them and the alternative
      // would have been a trap.
      //
      // Sewing is not *faster* than wrapping a hide round oneself — it is
      // slower. What it buys is a garment that fits and that lasts: fewer
      // pieces per head, and half the wear. Both reach every road, so neither
      // needs a process of its own.
      id: "bone_needle",
      visibleWhen: [{ kind: "experience", activities: ["clothmaking"], min: 15 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 30 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { fibre: 20 },
      minTicks: 12,
      limit: 1,
      effects: [
        { type: "rule", id: "sewn", set: true },
        { type: "tier", id: "clothing_cover", perHead: 0.21 },
      ],
      sector: "households",
    },
    {
      // Stellmoor arrow shafts, the bows of Holmegaard. Stave and string: wood
      // and fibre.
      id: "bow_and_arrow",
      visibleWhen: [{ kind: "experience", activities: ["hunting"], min: 3 }],
      availableWhen: [{ kind: "experience", activities: ["hunting"], min: 5 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { wood: 20, fibre: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "hunting_bow" }],
      sector: "households",
    },

    // ---- wanting hides ----
    {
      // The fibre road's own improvement, so that the map points both ways:
      // whoever plaits is shown tanning and invited to hides, whoever dresses
      // skins is shown twining and invited to fibre.
      id: "twining",
      visibleWhen: [{ kind: "experience", activities: ["clothmaking"], min: 8 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 15 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { fibre: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "twining" }],
      sector: "households",
    },
    {
      id: "tanning",
      visibleWhen: [{ kind: "experience", activities: ["clothmaking"], min: 8 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 15 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 120,
      stockCost: { hides: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "tanning" }],
      sector: "households",
    },

    // ---- the one real chain ----
    {
      // The dugout of Pesse, about 8000 BC. The axe stays an explicit condition
      // because it is not a question of quantity: with a mountain of wood and
      // no axe there is still no dugout.
      //
      // It opens water rather than raising the yield on it — from the shore one
      // reaches a few metres, with a boat the whole lake. Same mechanic as
      // taking land, on the other axis, and the difference is the lesson: land
      // taking is more of the same at falling quality, the boat is a different
      // resource that fails at different times.
      id: "boat",
      visibleWhen: [{ kind: "projectDone", id: "stone_axe", min: 1 }],
      availableWhen: [{ kind: "projectDone", id: "stone_axe", min: 1 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 300,
      stockCost: { wood: 60 },
      minTicks: 20,
      limit: 1,
      effects: [{ type: "capacity", capacity: "water", amount: 40 }],
      sector: "households",
    },

    // ---- the transition ----
    {
      // The institution. Its name is not "farming": it changes rules, and a
      // process is only one of the things it brings (E12, E29).
      id: "sedentism",
      visibleWhen: [{ kind: "projectDone", id: "storage_pit", min: 1 }],
      // Not a population that arrives by itself, and not a store that happens
      // to be full after a good year — but pits actually dug. What ties people
      // to a place is capital they cannot carry (Testart): a full granary after
      // a good harvest makes nobody sedentary, a pit does.
      //
      // It also has to be this and not the held stock, because a held stock
      // moves with the weather: bad luck may delay a transition, never block it.
      availableWhen: [{ kind: "capacityPerHead", capacity: "storage", min: 2 }],
      defaultRank: PROJECTS_FIRST,
      laborCost: 300,
      stockCost: { wood: 40 },
      minTicks: 20,
      limit: 1,
      effects: [
        { type: "rule", id: "settled", set: true },
        { type: "process", id: "farming" },
        { type: "process", id: "building" },
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

    // ---- epoch two: they all presuppose farmland, which arrives with
    // sedentism, so they belong where that exists (E29) ----
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
  // process (E5). Caution: how far below the mean the plan aims, so that an
  // ordinary year leaves something over (E24).
  risk: { aversion: 0.5, caution: 0.1 },

  // The player may set the order by hand from the start; a later institution
  // unsets this rule (E23) and the economy decides alone from then on.
  rulesFromStart: [],

  land: { baseQuality: 1.0, qualityDecayPerTaking: 0.05 },

  carried: { baseProductivity: 1.0, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
