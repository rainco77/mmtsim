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
 * Where a project's claim stands unless the player moves it: **behind every
 * need**, so that it is built out of what is left over and never out of
 * somebody's dinner.
 *
 * It used to stand in front of everything, and that was a trap rather than a
 * decision. Played twice by hand, starting two projects at the default killed
 * the community within a single tick: the claim outranks hunger, so the hands
 * went to the pit instead of the harvest and nobody was warned.
 *
 * The best place is almost certainly neither end — above the ranks that only
 * cost comfort and children, below the ones that cost lives. That is exactly
 * why it must not be the default: the player is meant to find it. Each project
 * carries its own number (E18), so a granary and a monument need not be equally
 * urgent, and the danger of committing stays chosen rather than inflicted.
 */
const PROJECTS_LAST = 1000;

export const STAGE1: Config = {
  // The whole tick as one ranked program, solved (E21). Under trial against the
  // older way, which is still here and still a line away.
  planner: "program",

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
        // Only the **default**, and it stands at the very back where nothing
        // can die of it (E18). Where it belongs is a thing to be found: put
        // ahead of eating one's fill, laying something by costs what it really
        // costs — eating less well now and fewer children for it — and that is
        // the bargain storing actually is. But it is the player who strikes it,
        // not the content that imposes it. Ahead of the fire it would cost
        // lives, which is exactly the mistake a player is meant to be able to
        // make and to learn from.
        rank: PROJECTS_LAST,
        // A pit dug by people who move on. It has to keep distinctly worse
        // than a store in a place someone lives in and guards (0.12), and
        // distinctly better than nothing (0.9) — but at 0.4 it kept so badly
        // that no store was physically possible: two fifths of it spoiled every
        // tick, so a stock could never reach more than about two and a half
        // times what came in, and the lesson the epoch is built around could
        // not happen before the epoch was over.
        decayPerTick: 0.2,
        decayWhenRule: [{ rule: "settled", decayPerTick: 0.12 }],
      },
    },
    // Labour: made every tick out of the people, gone by the next one.
    { id: "labor", decayPerTick: 1 },
    {
      // Wood keeps almost by itself, so a pile of it is a reserve that needs no
      // building — and the one buffer this epoch can have against a hard draw
      // before the pit exists. Measured, what killed a community at seed 42,
      // tick 81 was not hunger but the fire going out at 0.04 while hunger
      // itself held at 0.86: a few ticks of firewood stacked would have carried
      // it through.
      //
      // Just behind putting food by, which is where it belongs: one lays in
      // food before firewood, and both before eating one's fill.
      //
      // Measured with a target of twelve: the pile forms at once — 9.8 by the
      // first tick — and then rides between five and seven, because the fire
      // burns some 2.7 a tick and refilling hangs on hands and standing wood.
      // It costs, too: the run peaks at 26 against 36 without it. That is the
      // bargain the setting is meant to be, and at twelve the community of this
      // size is paying more for it than it gets.
      id: "wood",
      decayPerTick: 0.02,
      keeping: { rank: PROJECTS_LAST },
    },
    // A fire is out by morning. Warmth is the one stock that cannot be held at
    // all, and that is the point of making it a good of its own rather than a
    // need pointed at wood: it is produced from wood and spent at once.
    { id: "warmth", decayPerTick: 1 },
    // ---- what the country carries ----
    //
    // Nobody in this epoch occupies ground (E29). The community walks over its
    // range and takes what lives on it, and three different takings happen on
    // the very same ground: berries are picked where the deer walk and the
    // deadwood lies. So the wilderness is not a pot that is emptied, it is the
    // **carrier** that says how much of each of these there can be — and the
    // water carries two more.
    //
    // The rates say something on their own, and they are the whole reason for
    // keeping these apart: greens come back within the tick, molluscs and fish
    // take their time, deer take longer, and a forest hardly comes back at all.
    // Overtaxing therefore means something different in each case, and the way
    // out of it is a different length.
    {
      // What there is to gather: seeds, berries, roots, nuts. It carries the
      // bulk of the food and hunting cannot (Lee: plant food is the greater
      // part of what foragers eat).
      //
      // Fast and shallow, and that is the whole point of it. A herd and a
      // forest are capital: what stands is many times what comes in over a
      // tick, because it grew over many ticks. The growth of a range is not —
      // one cannot gather next season's berries now. Set deep like the others,
      // it became a **larder**: a community of twenty-five found a hundred and
      // twenty standing against thirty of growth, feasted for four ticks and
      // grew all the while, and then the larder was empty. Gathering turned
      // four times dearer, food ate every hand there was, rank 200 got nothing,
      // and people froze in a good tick with the forest untouched — satt und
      // frierend, exactly what E29 says must not come out.
      //
      // Shallow, the draw goes straight through to the table: a poor one is
      // felt, which is what makes a store worth digging later.
      //
      // The stand used to stand at its ceiling in every one of eighty-two
      // played ticks, and the density looked like the reason. It was not: the
      // price of searching was read off the stand before anything was taken,
      // so taking four fifths of the range cost no more per unit than taking a
      // twentieth. Cutting the density to 3.5 against that broken price only
      // starved the community at tick 0.
      //
      // With the price charged as the stand runs down, the figure that decides
      // everything is what the range yields per head: `need ÷ (ground per head
      // × density)` is the share taken at the start, and the head count cancels
      // out of it. At 6.0 that share was a half, so twenty-five people already
      // paid 1.38 for their food on wholly untouched country and the room to
      // grow ran out at about thirty-three — seventy-seven per cent of what the
      // range carried, with almost no space in which the epoch's story could
      // happen at all. At 8.0 they start at three eighths and 1.25, and the
      // room reaches to about forty-four.
      //
      // It is also nearer what is claimed of foragers: they sat at a fifth to
      // two fifths of what their land could have carried (Kelly), not at three
      // quarters of it.
      //
      // The upper end is not set here and cannot be: it is wherever food comes
      // to need every hand. Every labour-saving technique lifts it — with the
      // sickle the same reckoning gives about 2.5 instead of 1.61 — so the span
      // widens of itself as the player builds, which is the reward for
      // building. And the mortar, which needs less country per meal rather than
      // fewer hands, lowers the price outright.
      id: "plants",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 4.0,
        capacity: "wilderness",
        densityPerArea: 8.0,
        refuge: 3,
        maxEffort: 30,
      },
    },
    {
      id: "game",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 0.3,
        capacity: "wilderness",
        densityPerArea: 3.0,
        refuge: 2,
        maxEffort: 30,
      },
    },
    {
      // What has fallen. Not a store but a leftover: it comes down of itself,
      // and whoever only picks up can never have more than came down. That
      // ceiling is the wall a community without an axe runs into, and taking it
      // away is what the axe is for — the difference between a leftover and a
      // store, which the model has to hold if the project is to open anything.
      //
      // A named simplification: its ceiling hangs on the ground, not on the
      // wood standing on it, so felling does not thin the fall. Bearable
      // because the standing wood barely moves in this epoch (rate 0.1, E13).
      id: "deadwood",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 0.2,
        capacity: "wilderness",
        // Provisional, and known to be so. Reckoned, three would leave the
        // comfort at about half at twenty-five heads — the pinch the epoch was
        // to open on. Played, it kills: every seed was given up between tick 28
        // and 88, because a stock whose steady yield lies under what a life-and-
        // death rank demands is not rationed but stripped, and the fire goes out
        // with it. Ten is the lowest value at which no seed died over eight
        // seeds and two hundred ticks. The figure belongs to the balancing.
        densityPerArea: 10.0,
        refuge: 2,
        maxEffort: 30,
      },
    },
    {
      // What stands, and the bast that is stripped off it — taking either uses
      // the tree up, whether it is felled first or ring-barked where it grows.
      // That a felled tree gives bast *and* wood is joint production, which is
      // deferred until there are prices; until then two processes on the one
      // stock, as the national accounts themselves do it.
      //
      // Slowest of them all — which is why the epoch cannot deforest its
      // country whatever it does, and why clearing and afforesting belong to
      // the settlers who come after (E13).
      id: "trees",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 0.1,
        capacity: "wilderness",
        densityPerArea: 20.0,
        refuge: 5,
        maxEffort: 30,
      },
    },
    {
      id: "fish",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 0.4,
        capacity: "water",
        densityPerArea: 4.0,
        refuge: 2,
        maxEffort: 30,
      },
    },
    {
      // Mussel and cockle beds. They are picked over slowly and they show it:
      // the Køkkenmøddinger of Ertebølle hold shells that grow smaller through
      // the layers, and lower-ranked species that appear as the better ones
      // thin. That is the archaeological proof that a shore has a memory — so
      // making it inexhaustible would contradict the very find the process is
      // built on. What keeps the shore the last reliable thing is not that it
      // cannot be emptied but that the weather does not reach it.
      id: "shellfish",
      decayPerTick: 0,
      regrowth: {
        ratePerTick: 0.35,
        capacity: "water",
        densityPerArea: 10.0,
        refuge: 3,
        maxEffort: 30,
      },
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
    // Wilderness and water are carriers, not pots: no process of this epoch
    // pays a hectare of either. What they do is set the ceilings of what lives
    // on them, and their quality says how much that is. Occupying ground begins
    // with the field and the hut — which is exactly the break the epoch is
    // about, now in the mechanism and not only in the telling.
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
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.28, plants: 1.0 },
      exposure: { weather: 0.7 },
      qualityWeight: 0,
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
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.182, plants: 1.0 },
      exposure: { weather: 0.7 },
      qualityWeight: 0,
      unlockedFromStart: false,
    },
    {
      // The mortar's road: the same growth feeds more, because small hard seeds
      // become edible and more of what stands there counts as food. Not a
      // smaller appetite — the need is physiology (E29). It is the one process
      // of the epoch that takes *less nature* per meal instead of less work,
      // which is why it is intensification in Boserup's sense and the sickle is
      // not.
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
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.28, plants: 0.75 },
      exposure: { weather: 0.7 },
      qualityWeight: 0,
      unlockedFromStart: false,
    },
    {
      // Hunting used to pay a hectare *and* a deer for the same meal — the same
      // nature counted twice, and it was the hectare that bound.
      id: "hunting",
      branch: "food",
      activity: "hunting",
      priority: 90,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.45, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      id: "hunting_bow",
      branch: "food",
      activity: "hunting",
      priority: 95,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.27, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0,
      unlockedFromStart: false,
    },
    {
      // From the shore, with hands and a spear. Available from the first tick
      // and meagre: technology does not create a resource, it opens one (E29).
      id: "fishing",
      branch: "food",
      activity: "fishing",
      priority: 80,
      capacityPerOutput: {},
      // Level with gathering, on purpose. Whether a community fishes was a
      // matter of what country it had — the coast makes fishers of people, the
      // inland forest does not — and both roads are therefore meant to stand
      // open here rather than one being priced out.
      //
      // At 1.2, and then at 0.6, the water simply never paid: gathering costs
      // 0.28 times the price of searching, so fishing needed that price to pass
      // 4.3, then 2.1, and the run never got there — every technique on the land
      // pushes the price back down. Nobody ever fished, so nobody ever learned
      // to, so the net and the hook that ask for that learning never appeared,
      // so nobody ever fished. Measured over eight seeds: 0 of experience at
      // fishing after eighty ticks, 4253 at gathering, and the water carrying a
      // thousandth of the food.
      //
      // At 0.35 both cost about the same on fresh country, and what tells them
      // apart is what they really are. The greens grow back ten times as fast
      // as the fish, so the water can carry only the smaller share whatever it
      // costs — which is also the finding: coastal people fished a great deal
      // and plant food still fed most of them. And the water is the safer of
      // the two in a poor tick, 0.4 of exposure against 0.7, which is exactly
      // why those who had it used it.
      intermediatesPerOutput: { labor: 0.35, fish: 1.0 },
      // Safer than the land, not immune to it: the drought that costs the
      // harvest lowers the river too. At 0.15 the water carried a quarter of
      // the food and felt nothing, so the worst year of a run never reached
      // hunger at all and a store had no work to do. The shore keeps its low
      // figure — mussels lie there whether it rains or not, and that is what
      // made it the last reliable thing to fall back on.
      exposure: { weather: 0.4 },
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      // The mortar of the water (E29): far more out of the same stretch of
      // shore, at a great deal more work — gather, carry, shuck. So it does not
      // pay while the fish are plentiful and does pay once they thin, which is
      // Boserup on the second axis.
      //
      // Nobody has to invent picking up shellfish, so it stands open from the
      // first tick and the allocation reaches for it when the water gets tight.
      id: "shellfish_gathering",
      branch: "food",
      activity: "fishing",
      priority: 75,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 3.0, shellfish: 1.0 },
      exposure: { weather: 0.1 },
      qualityWeight: 0,
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
      capacityPerOutput: {},
      // More fibre to the fish than a line, not less: a net is a great deal of
      // cord and it is forever being mended, while a line is a thread. What it
      // buys for that is hands — a fifth of the labour. Two kinds of gear with
      // different profiles rather than one that simply replaces the other.
      intermediatesPerOutput: { labor: 0.15, fish: 1.0, fibre: 0.08 },
      exposure: { weather: 0.4 },
      qualityWeight: 0,
      unlockedFromStart: false,
    },

    {
      // A bone hook on a twisted line reaches what a spear from the shore never
      // does: deeper water and larger fish. The line is the point of it here —
      // it wears out and is made again, so the fibre road gets a customer that
      // does not stop after one purchase, which is what it has always lacked.
      id: "fishing_line",
      branch: "food",
      activity: "fishing",
      priority: 82,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.3, fish: 1.0, fibre: 0.05 },
      exposure: { weather: 0.4 },
      qualityWeight: 0,
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
      exposure: { weather: 0.9 },
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
      exposure: { weather: 0.8 },
      qualityWeight: 0.9,
      unlockedFromStart: false,
    },

    // ---- wood: the one change of technique in the epoch ----
    {
      // Picking up what has fallen: much walking for little wood, and dry
      // already. This is what every fuelwood study finds people do first — the
      // principle of least effort — and it is why felling must cost more, not
      // less, per unit.
      id: "wood_gathering",
      branch: "wood",
      activity: "woodcutting",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.6, deadwood: 1.0 },
      exposure: { weather: 0.2 },
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      // Taking what stands instead of what lies. The biggest single jump of the
      // epoch, and the same sentence as the boat: technology does not create
      // the resource, it opens it.
      //
      // And it costs *more* per unit, not less — half again. A flint axe fells
      // quickly (the Draved experiments), but then the wood must be bucked,
      // split, hauled and seasoned, none of which a dry fallen branch needs.
      // More out of the same country for more hands to the unit: Boserup with
      // both halves, which no other project of the epoch has.
      id: "felling",
      branch: "wood",
      activity: "woodcutting",
      priority: 110,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.9, trees: 1.0 },
      exposure: { weather: 0.2 },
      qualityWeight: 0,
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
    // Hides want the scarcest thing the range holds and little labour; fibre
    // wants the most plentiful and a great deal of labour. That is the first
    // real alternative of the epoch (E31): it shifts the risk profile, not the
    // outcome. When the herd is thin fibre wins, when hands are short hides win
    // — and it says something true, because it was exactly as game grew scarce
    // that people went from animal to plant materials.
    //
    // The difference does not sit in these two processes but one step above
    // them, in hunting and bast gathering. The player feels it all the same,
    // because the allocation reckons in chain coefficients (E21).
    {
      id: "hunting_hides",
      branch: "hides",
      activity: "hunting",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.3, game: 1.0 },
      exposure: { weather: 0.8 },
      qualityWeight: 0,
      unlockedFromStart: true,
    },
    {
      // Bast is the inner bark of a lime, and taking it takes the tree — so it
      // draws on the same standing wood the firewood does. But **one lime gives
      // a great deal of bast**: retted and stripped, a single stem yields cord
      // and cloth for several people. Two and a half trees to the unit was
      // carried over from an older relation between areas and was wrong by more
      // than an order of magnitude — and it made the fibre road **dominated**
      // rather than dear: twice the labour of hides *and* more country for it,
      // so there was no state in which it paid and no bast was ever gathered in
      // any tick of any run.
      //
      // At 0.8 the two roads are the trade E29 describes. Per unit of clothing:
      // hides want 0.8 labour and yield 0.225 an area for ever; fibre wants 1.6
      // and yields 0.625. Twice the hands, a third of the country — so a thin
      // herd turns people to plants, which is exactly what happened.
      //
      // The labour is 0.6 and not 1.0, and where it sits matters. **Stripping
      // bast is quick** — one rings the stem and pulls it off. What takes the
      // time is retting, scraping and spinning, and in this model that sits in
      // the plaiting (0.6), not in the gathering. At 1.0 for the mere stripping
      // against 0.3 for bringing down a deer, the fibre road only paid once the
      // herd had grown 3.7 times dearer to hunt — which happened in spikes and
      // never long enough for anybody to learn the craft. At 0.6 the roads meet
      // at 2.3, which a growing community reaches and stays at.
      //
      // The labour side keeps its gap all the same, at three to two, and it is
      // well attested: textile work is the great time sink of pre-industrial
      // life (Barber, *Women's Work*). Tanning is hard work too, but shorter.
      id: "bast_gathering",
      branch: "fibre",
      activity: "bastgathering",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.6, trees: 0.8 },
      exposure: { weather: 0.4 },
      qualityWeight: 0,
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
      // Most of what a subsistence society eats is not discretionary — but not
      // all of it either, and the split between this rank and satiety is what
      // decides how hard a poor draw lands. Together they come to 1.8: what is
      // asked for here is the part whose failure kills, the rest only costs
      // births and the strength to work.
      //
      // The plan aims at a draw of 0.9, so a poorer one reaches this rank as
      // soon as the harvest falls below 1.2 of the 1.8. That puts the first
      // deaths at a draw of 0.6 instead of 0.7 — one tick in nineteen rather
      // than one in ten. At 1.4 against 0.4 only a fifth was dispensable, and
      // played, two draws (0.44 and 0.24) took 28 % and 52 % of the people and
      // ended the run at tick 82.
      //
      // A society with half its food to spare would not be a subsistence
      // society, so this cannot go much further: measured at 1.0 against 0.8,
      // famine became impossible — the worst draw of a whole run still left
      // this rank fully covered.
      perHead: 1.2,
      consumedOnUse: 1,
      // Without any food at all, nine in ten are gone. Twenty per cent short of
      // the bare ration costs eighteen per cent — the order of magnitude of a
      // historical famine.
      survival: { atZero: 0.1, atFull: 1 },
    },
    {
      // Fire, in the amount it takes not to freeze. Small, and high in the
      // ranking, so it is met almost whatever else happens.
      //
      // Warmth is split as food is, and for the same reason (E8): cold is a
      // *threshold*, not a slope. Half rations of food are starvation; half the
      // firewood is a cold winter, not a fatal one. A single tier interpolating
      // linearly said the opposite — at 0.44 coverage it charged more than half
      // the mortality of having no fire at all, and cold then regulated the
      // population long before hunger ever could. Two ranks say it without
      // bending a coefficient: the non-linearity sits in the ranking, which is
      // exactly where E8 puts it.
      id: "warmth_fire",
      rank: 200,
      // A cold year takes the harvest and calls for more firewood at the same
      // time (E24). Less exposed than the harvest itself: one heats against the
      // winter one has, and a poor summer is not a hard winter.
      exposure: { weather: 0.4 },
      stock: "warmth",
      branch: "warmth",
      perHead: 0.03,
      consumedOnUse: 1,
      // No fire at all in a Mesolithic winter kills a great many — less than
      // starving, because clothing and huddling take part of it.
      survival: { atZero: 0.4, atFull: 1 },
    },
    {
      // Clothing does not kill, it costs *work ability* (E16). The honest
      // effect is not "you die without a coat" but "you can work fewer days
      // outdoors" — arithmetically the same multiplication, but kept apart so
      // the view can later say how much was worked and how productive it was.
      //
      // Also exposed on the demand side: a cold year asks for more of it.
      id: "clothing_cover",
      rank: 400,
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
      // Arrives with sedentism, and ranked by what its failure costs: no roof
      // takes a tenth of the people, no clothing takes nobody but costs the
      // strength to work. The deadly rank goes first — so this is 300 and
      // clothing 400, swapped once the two were read side by side.
      id: "shelter_roof",
      rank: 300,
      stock: "housing",
      branch: "housing",
      perHead: 0.3,
      consumedOnUse: 0,
      // A community that moves has no roof at all and lives; only those who stay
      // come to depend on one.
      survival: { atZero: 0.9, atFull: 1 },
      birthRate: { atZero: 1, atFull: 1.003 },
    },
    {
      // Warmth beyond the minimum: cooked food, shorter nights at the fire,
      // people who have rested. It costs **productivity** — clothing already
      // carries the ability to work, and the two ought to stay distinguishable
      // (E16).
      id: "warmth_comfort",
      rank: 700,
      exposure: { weather: 0.4 },
      stock: "warmth",
      branch: "warmth",
      perHead: 0.07,
      consumedOnUse: 1,
      productivity: { atZero: 1, atFull: 1.1 },
      // And it carries the children. A small body has a great deal of surface
      // for its size and cannot hold its warmth, so being cold costs infants
      // first — and an infant that does not live is, to a model without ages,
      // very near a birth that did not happen. Folding it in here is therefore
      // the honest simplification rather than inventing a mortality of its own.
      //
      // It is also what regulated these populations. Forager numbers were held
      // by fertility, not by famine (Wood, Pennington): birth intervals of four
      // years and more came out of what mothers could carry and spare, and
      // hunger was the crisis and not the daily rule (E29). Ours did it the
      // other way about — births stood at their maximum almost always and the
      // regulator was catastrophe.
      //
      // Reckoned against the rest: base births 1.01 against base survival
      // 1/1.01, so a community with everything covered stands still. With
      // comfort gone and bellies full, 1.01 × 1.01 × 0.99 against 0.990 stands
      // still as well — growth simply stops. With both gone it comes to 0.99,
      // and the community shrinks slowly because too few are born, with nobody
      // dying of it.
      birthRate: { atZero: 0.99, atFull: 1.01 },
    },
    {
      // The dispensable third of the food, and the community's whole buffer
      // against a poor draw: a bad tick eats this before it reaches the rank
      // that kills. Raising it from 0.4 to 0.6 does not feed anyone more — the
      // two ranks still come to 1.8 together — it moves where the harm lands.
      id: "food_satiety",
      rank: 600,
      stock: "food",
      branch: "food",
      perHead: 0.6,
      consumedOnUse: 1,
      birthRate: { atZero: 1, atFull: 1.01 },
      productivity: { atZero: 1, atFull: 1.2 },
    },
  ],

  // ---------------------------------------------------------------- projects
  //
  // **What a project may cost is reckoned, not guessed.** A community of
  // twenty-five performs about twenty-five of labour and spends some twenty of
  // it on being fed, warm and clothed, so what it has to spare is four or five
  // a tick. A project's claim is `laborCost ÷ minTicks`, and that is what it
  // takes every tick it runs — so the ordinary techniques are set at **four** a
  // tick and the two great commitments, the boat and settling itself, at six.
  //
  // They used to ask ten, which is nearly half of everything a community of
  // twenty-five can do, held for twelve ticks. Played with a bot doing
  // everything else right — one site at a time, claiming behind every need —
  // the community still fell from twenty-five to sixteen while it built a
  // single bow. The costs were reckoned for a far larger community than the one
  // the epoch begins with.
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
      // It answers the ground growing thin, so that is what calls for it.
      visibleWhen: [{ kind: "strain", measure: { searchCost: "plants" }, factor: 1.15 }],
      availableWhen: [{ kind: "experience", activities: ["gathering"], min: 400 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 32,
      stockCost: {},
      minTicks: 8,
      limit: 1,
      effects: [{ type: "process", id: "gathering_mortar" }],
      sector: "households",
    },
    {
      // Cooking pits and burnt mounds are among the commonest Mesolithic finds.
      id: "earth_oven",
      // It answers the fuel running short, and earlier than the axe does: it
      // needs no timber, only the wit to cover the fire over.
      visibleWhen: [{ kind: "strain", measure: { searchCost: "deadwood" }, factor: 1.08 }],
      availableWhen: [{ kind: "experience", activities: ["firemaking"], min: 10 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 32,
      stockCost: {},
      minTicks: 8,
      limit: 1,
      effects: [{ type: "process", id: "earth_oven" }],
      sector: "households",
    },
    {
      // The spatial answer of a community that can still move (E29). Overuse is
      // met by going somewhere else, not by a catch limit — a group of fifty
      // needs no fishing ordinance, it walks.
      //
      // What it costs is stated here and not in the engine, because *what one
      // can carry* is a claim about the world that will want changing: what is
      // in the ground and stacked stays behind, what is worn and held comes
      // along. And the price rises of itself — a community that has dug nothing
      // moves for nothing, a community with many pits is settled in fact long
      // before it settles by decision (Testart).
      id: "range_change",
      // It appears when the country begins to fail, and that appearance is
      // itself the warning. What "failing" means is the **price of searching**,
      // and the two figures sit inside the span that was measured: fresh
      // country costs 1.25, and the room to grow runs out around 1.61. A third
      // more walking for the same meal is the notice, half as much again is the
      // point at which moving is the answer. Before that, moving
      // would be a cheap reset rather than a decision.
      //
      // It used to read a fill level — a stock below a half, then below a third
      // of what the range carries — and that could never fire. A fill level is
      // read after the growing back, so a range that fills overnight shows
      // untouched however much comes off it: over eight seeds the thinnest any
      // stock ever reached was 0.861 while two thirds of the range was taken
      // every tick, and the one answer a moving people really had was never so
      // much as visible.
      //
      // The price also tells efficiency from intensification without being
      // told. The sickle only makes hands quicker and leaves it exactly where
      // it was; the mortar means less country per meal, so it really does push
      // the move further off — which is what intensification is supposed to do.
      visibleWhen: [
        { kind: "rule", id: "settled", set: false },
        { kind: "stockDear", factor: 1.35 },
      ],
      availableWhen: [
        { kind: "rule", id: "settled", set: false },
        { kind: "stockDear", factor: 1.5 },
      ],
      defaultRank: PROJECTS_LAST,
      laborCost: 24,
      stockCost: {},
      minTicks: 6,
      effects: [
        // Left behind: what is in the ground and what is stacked.
        {
          type: "setCapacity",
          capacity: "storage",
          sector: "households",
          to: { kind: "fixed", value: 0 },
        },
        { type: "stock", id: "food", to: { kind: "fixed", value: 0 } },
        { type: "stock", id: "wood", to: { kind: "fixed", value: 0 } },
        // Same size, a little poorer — and the good ranges of the world are
        // there but once (E13). Both kinds of ground go down together: one
        // moves with the whole range, shore and all. The water inherits what
        // the wilderness has just become rather than drawing again, because
        // drawing again would count the move as two takings and make the new
        // country twice as poor.
        { type: "setCapacity", capacity: "wilderness", quality: { kind: "nextTaking" } },
        {
          type: "setCapacity",
          capacity: "water",
          quality: { kind: "from", capacity: "wilderness" },
        },
        // Found: a country nobody has been over — every one of the six, or the
        // community would move into a range it had already gathered bare. After the
        // quality, so that what it finds is the full measure of the *new*
        // country and not of the one it left.
        { type: "stock", id: "plants", to: { kind: "ceiling" } },
        { type: "stock", id: "game", to: { kind: "ceiling" } },
        { type: "stock", id: "deadwood", to: { kind: "ceiling" } },
        { type: "stock", id: "trees", to: { kind: "ceiling" } },
        { type: "stock", id: "fish", to: { kind: "ceiling" } },
        { type: "stock", id: "shellfish", to: { kind: "ceiling" } },
      ],
      sector: "households",
    },

    // ---- wanting wood ----
    {
      // Natufian blades with sickle gloss.
      id: "sickle",
      visibleWhen: [
        { kind: "strain", measure: { labourPerHead: "gathering" }, factor: 1.15 },
      ],

      availableWhen: [{ kind: "experience", activities: ["gathering"], min: 100 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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
      visibleWhen: [
        { kind: "strain", measure: { searchCost: "deadwood" }, factor: 1.15 },
      ],

      availableWhen: [{ kind: "experience", activities: ["woodcutting"], min: 30 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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
      // The road to the end of the epoch, so it must not open early (E29). It
      // waits on the food getting *ample* — practice at winning it, which grows
      // with the yield and so comes sooner to a community that built the sickle, the
      // mortar and the net. By then several bad years have been through, so the
      // player knows what a store is for without anything having to count them.
      //
      // It is also what makes a range change cheap at first and dear later,
      // without a word being said about it: there is nothing to leave behind.
      visibleWhen: [
        // Reckoned from what a community actually gathers rather than guessed.
        // Measured, its tally of food won runs at about sixty a tick early and
        // seventy-five later: 574 by tick 12, 1251 by 24, 1959 by 36, 2821 by
        // 48. At 1500 and 3000 the pit came into view at tick 36 and could be
        // had at 57 — and the community was given up at 58. The one answer the
        // epoch has to a hard draw arrived a tick after it had killed everyone,
        // and the figures had plainly been reckoned for a far longer run than
        // the economy carries.
        //
        // At 900 and 1800 it shows itself around tick 18 and can be had around
        // 33, which leaves it time to be dug, filled and still be there. The
        // gap between seeing and having stays about fifteen ticks, as with the
        // other techniques: long enough to be a promise, short enough not to be
        // a tease.
        { kind: "experience", activities: ["gathering", "hunting", "fishing"], min: 900 },
        // Lining and posts come off a standing stem: short brittle deadwood
        // will not do it, and the earth oven — which spares fuel — opens no
        // timber. So the axe stands materially before the pit, and thereby
        // before sedentism, without sedentism needing a second condition.
        { kind: "projectDone", id: "stone_axe", min: 1 },
      ],
      availableWhen: [
        {
          kind: "experience",
          activities: ["gathering", "hunting", "fishing"],
          min: 1800,
        },
        { kind: "projectDone", id: "stone_axe", min: 1 },
      ],
      defaultRank: PROJECTS_LAST,
      laborCost: 24,
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
      // The larger of the two answers on the water, so it is called for later
      // than the hook: the strain has to have grown before a whole net is worth
      // the fibre it costs.
      visibleWhen: [{ kind: "strain", measure: { labourPerHead: "fishing" }, factor: 1.3 }],
      // Twisting cord comes first: a net is nothing but a great deal of it.
      availableWhen: [
        { kind: "projectDone", id: "twining", min: 1 },
        { kind: "experience", activities: ["fishing"], min: 50 },
      ],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
      stockCost: { fibre: 30 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "fishing_net" }],
      sector: "households",
    },
    {
      // **The first, cheap step onto the water.** A bone hook on a twisted line
      // costs a fifth of what a net does in fibre and reaches deeper water than
      // a spear from the shore; the net is the great leap after it. Without the
      // hook the water is one step instead of a stair — the process was in the
      // content already and no project opened it, so it could never run.
      //
      // Both gears want fibre *every tick they work*, which is what the fibre
      // road has always lacked: a customer that does not stop after one
      // purchase. The demand pulls the bast out of the wood; nobody has to hold
      // a store of it.
      //
      // Anchor: barbed points and hooks of bone and antler are a Mesolithic
      // mass find, and the line is twisted bast — the same craft as the net of
      // Antrea.
      id: "fish_hook",
      visibleWhen: [{ kind: "strain", measure: { labourPerHead: "fishing" }, factor: 1.15 }],
      availableWhen: [
        { kind: "projectDone", id: "twining", min: 1 },
        { kind: "experience", activities: ["fishing"], min: 20 },
      ],
      defaultRank: PROJECTS_LAST,
      laborCost: 12,
      stockCost: { fibre: 8 },
      minTicks: 4,
      limit: 1,
      effects: [{ type: "process", id: "fishing_line" }],
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
      // What all three clothing projects answer is the same strain: keeping
      // people clothed eats more and more of everybody's day.
      visibleWhen: [{ kind: "strain", measure: { labourPerHead: "clothmaking" }, factor: 1.3 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 30 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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
      visibleWhen: [
        { kind: "strain", measure: { labourPerHead: "hunting" }, factor: 1.3 },
      ],

      availableWhen: [{ kind: "experience", activities: ["hunting"], min: 5 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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
      visibleWhen: [{ kind: "strain", measure: { labourPerHead: "clothmaking" }, factor: 1.1 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 15 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
      stockCost: { fibre: 20 },
      minTicks: 12,
      limit: 1,
      effects: [{ type: "process", id: "twining" }],
      sector: "households",
    },
    {
      id: "tanning",
      visibleWhen: [{ kind: "strain", measure: { labourPerHead: "clothmaking" }, factor: 1.1 }],
      availableWhen: [{ kind: "experience", activities: ["clothmaking"], min: 15 }],
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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
      // Two things are needed and neither will do alone: the axe to hollow the
      // log, and the net to fish from it. Spearing over the side of a dugout is
      // barely possible — open water is fished with gear that works away from
      // the shore, and the net of Antrea was found with its floats and sinkers.
      // It also makes bast, twisting, net and boat one road instead of four
      // loose branches.
      id: "boat",
      visibleWhen: [{ kind: "strain", measure: { utilisation: "water" }, factor: 0.9 }],

      availableWhen: [
        { kind: "projectDone", id: "stone_axe", min: 1 },
        { kind: "projectDone", id: "fishing_net", min: 1 },
      ],
      defaultRank: PROJECTS_LAST,
      laborCost: 120,
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
      defaultRank: PROJECTS_LAST,
      laborCost: 120,
      stockCost: { wood: 40 },
      minTicks: 20,
      limit: 1,
      effects: [
        { type: "rule", id: "settled", set: true },
        // One settles at a chosen place, and whoever wandered widely has seen
        // a great deal of land — so the wandering is not carried as a tax into
        // every later epoch (E29).
        { type: "takings", set: 0 },
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
      // Epoch two's spatial answer: keep the old ground and take more beside
      // it — which means pressing into somebody else's country and holding it,
      // and that presupposes having something to defend. For a community that can
      // simply move on it would be almost the same act as a range change, so
      // the two only come apart once staying is a choice (E29).
      id: "land_taking",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [{ kind: "rule", id: "settled", set: true }],
      limit: 6,
      defaultRank: PROJECTS_LAST,
      laborCost: 48,
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

    {
      id: "clearing",
      visibleWhen: [{ kind: "rule", id: "settled", set: true }],
      availableWhen: [
        { kind: "rule", id: "settled", set: true },
        { kind: "unownedCapacity", capacity: "wilderness", min: 10 },
      ],
      defaultRank: PROJECTS_LAST,
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
      defaultRank: PROJECTS_LAST,
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
      defaultRank: PROJECTS_LAST,
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
    // Reciprocal: a community whose needs are all met neither grows nor shrinks. It
    // grows when it is better off than it needs to be.
    baseBirthFactor: 1.01,
    baseSurvival: 1 / 1.01,
    // Below about a dozen a community stops working: too few hunters, nobody spare
    // to carry children or the sick, and no cover at all for a single death. It
    // does not die out — it joins a neighbour, and as *this* community it is over.
    //
    // Twenty-five is the community itself (Birdsell's magic numbers), so it cannot
    // also be the floor. His other number, five hundred, is the circle within
    // which people marry — a network of communities, not a settlement, and nothing
    // this model has: we play one community, which is understood to sit inside such
    // a network.
    minimumViableSize: 12,
  },

  shocks: { weather: { shape: "powerLeftSkewed", exponent: 4 } },

  // Risk aversion: how strongly a thin store pushes towards the reliable
  // process (E5). Caution: how far below the mean the plan aims, so that an
  // ordinary year leaves something over (E24).
  risk: { aversion: 0.5, caution: 0.1 },

  // The player may set the order by hand from the start; a later institution
  // unsets this rule (E23) and the economy decides alone from then on.
  rulesFromStart: [],

  // A community of about twenty-five on the range that carries it (E14, Birdsell's
  // magic numbers). The figures per head are what gets tuned; the totals follow.
  land: {
    perHeadAtStart: { wilderness: 0.6, water: 0.24 },
    baseQuality: 1.0,
    qualityDecayPerTaking: 0.05,
  },

  carried: { baseProductivity: 1.0, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
