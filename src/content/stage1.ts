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
 * went to the pit instead of the food and nobody was warned.
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
      // one cannot gather berries that have not grown yet. Set deep like the
      // others, it became a **larder**: a community of twenty-five found a hundred and
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
      // out of it. At 8.0 the two food ranks together take three eighths of it
      // and the room to grow reaches to about forty-five.
      //
      // **It stands at 4.8, and the room to grow is what the figure is for.**
      // At 8.0 a community that decides nothing grows to about forty-five and
      // sits there — and over twenty seeds and three hundred ticks the rank
      // that kills was **never once short**, the sharpest fall in a single tick
      // being two per cent. A range that cannot produce a hunger leaves the
      // store nothing to do, and with the store the whole road out of the
      // epoch: one digs a pit against a bad tick one has lived through, not
      // against one the range can no longer deliver.
      //
      // At 4.8 the same measurement gives about twenty-seven, staying near the
      // band it starts in, and the rank that kills goes short in four ticks in
      // a hundred. That is the group as it is taken up: it has lived on this
      // range for generations and is at its resting point, not on its way to
      // one — E14's sentence that the group sits *at* the carrying capacity of
      // its land and not far below it. It also keeps the community near the
      // size a band actually has.
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
        ratePerTick: 0.5,
        capacity: "wilderness",
        densityPerArea: 38.4,
        refuge: 24,
        maxEffort: 30,
      },
    },
    {
      // Cut with the greens and for the same reason: the range has to be able
      // to run short, or nothing in the epoch has anything to answer.
      id: "game",
      decayPerTick: 0,
      regrowth: {
        // The community arrives on game it has not yet thinned (E14, E29).
        freshAtStart: 0.5,
        ratePerTick: 0.3,
        capacity: "wilderness",
        densityPerArea: 14.4,
        refuge: 16,
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
        densityPerArea: 80.0,
        refuge: 16,
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
        densityPerArea: 160.0,
        refuge: 40,
        maxEffort: 30,
      },
    },
    {
      // Cut with the rest of what the country carries — the water is the
      // steadier road, not a richer one.
      id: "fish",
      decayPerTick: 0,
      regrowth: {
        // As with the game: fresh on arrival, thinned by staying (E14, E29).
        freshAtStart: 0.5,
        ratePerTick: 0.4,
        capacity: "water",
        densityPerArea: 19.2,
        refuge: 16,
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
        densityPerArea: 48.0,
        refuge: 24,
        maxEffort: 30,
      },
    },
    { id: "hides", decayPerTick: 0.05 },
    { id: "fibre", decayPerTick: 0.04 },
    {
      // Clothing is not eaten and not burnt — it wears out. Sewing with an eyed
      // needle is what turns wrapped skins into garments that last,
      // so the needle acts here and not on any process (E19).
      id: "clothing",
      decayPerTick: 0.1,
      decayWhenRule: [{ rule: "sewn", decayPerTick: 0.04 }],
    },
    // **Care cannot be laid by.** Whoever does not tend a child today has not
    // made it up tomorrow, so it decays entirely — there is no such thing as a
    // store of it, and no rank above it can eat one.
    { id: "care", decayPerTick: 1 },
  ],

  // -------------------------------------------------------------- capacities
  capacities: [
    // Wilderness and water are carriers, not pots: no process of this epoch
    // pays for ground on either. What they do is set the ceilings of what lives
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
    { id: "care", produces: "care", unlockedFromStart: true },
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
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },

    // ---- food: three ways, two axes of land ----
    //
    // Gathering is good per hand and poor per area; hunting is worse on both
    // counts until the bow, but it is what puts hides on the ground; fishing is
    // poor per hand and almost untouched by the draw. The last is the whole
    // point of the water: it does not fail when the gathering fails.
    {
      id: "gathering",
      branch: "food",
      activity: "gathering",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.308, plants: 1.0 },
      exposure: { weather: 0.88 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.2, plants: 0.7 },
      exposure: { weather: 0.88 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.308, plants: 0.75 },
      exposure: { weather: 0.88 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: false,
    },
    {
      // Hunting used to pay ground *and* a deer for the same meal — the same
      // nature counted twice, and it was the ground that bound.
      id: "hunting",
      branch: "food",
      activity: "hunting",
      priority: 90,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.495, game: 1.0 },
      exposure: { weather: 0.92 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },
    {
      id: "hunting_bow",
      branch: "food",
      activity: "hunting",
      priority: 95,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.297, game: 1.0 },
      exposure: { weather: 0.92 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.385, fish: 1.0 },
      // Safer than the land, not immune to it: the drought that costs the
      // gathering lowers the river too. At 0.15 the water carried a quarter of
      // the food and felt nothing, so the worst draw of a run never reached
      // hunger at all and a store had no work to do. The shore keeps its low
      // figure — mussels lie there whether it rains or not, and that is what
      // made it the last reliable thing to fall back on.
      exposure: { weather: 0.4 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 3.3, shellfish: 1.0 },
      exposure: { weather: 0.1 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },
    {
      // A set net fishes while you sleep. Still worse per hand than gathering —
      // but it does not touch the wilderness and it does not fail in a poor
      // draw, and once the land is full that is what decides.
      id: "fishing_net",
      branch: "food",
      activity: "fishing",
      priority: 85,
      capacityPerOutput: {},
      // More fibre to the fish than a line, not less: a net is a great deal of
      // cord and it is forever being mended, while a line is a thread. What it
      // buys for that is hands — a fifth of the labour. Two kinds of gear with
      // different profiles rather than one that simply replaces the other.
      intermediatesPerOutput: { labor: 0.165, fish: 1.0, fibre: 0.08 },
      exposure: { weather: 0.4 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.33, fish: 1.0, fibre: 0.05 },
      exposure: { weather: 0.4 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.458 },
      exposure: { weather: 0.9 },
      qualityWeight: 0.9,
      // **Sowing is committed** (E24): the seed goes into the ground before the
      // draw is known and nothing can answer for it afterwards. This is the one
      // kind the epoch before it does not have, and it is why the property sits
      // on the process rather than on the model.
      yield: "committed",
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
      intermediatesPerOutput: { labor: 0.543 },
      exposure: { weather: 0.8 },
      qualityWeight: 0.9,
      // Sown like the plain field above, and committed in the same way (E24).
      yield: "committed",
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
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: false,
    },

    // ---- warmth: made out of wood, spent at once ----
    {
      id: "open_fire",
      branch: "warmth",
      activity: "firemaking",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 0.6, wood: 2.2 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.6, wood: 1.32 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 0.5, game: 1.0 },
      // The same hunt as the one that brings meat, on the same range and out of
      // the same herd, so it hangs on the draw exactly as hard. Left behind at a
      // lower figure it would turn *relatively* cheaper in a poor tick, and
      // clothing would move towards hides just as the herd thinned — the
      // opposite of what the two roads above are built to say.
      exposure: { weather: 0.92 },
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },
    {
      id: "hide_dressing",
      branch: "clothing",
      activity: "clothmaking",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 3.5, hides: 1.0 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },
    {
      // Bark and brain tanning: the skin stops being a stiff board.
      id: "tanning",
      branch: "clothing",
      activity: "clothmaking",
      priority: 110,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 2.45, hides: 1.0 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
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
      intermediatesPerOutput: { labor: 4.5, fibre: 1.0 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      activity: "clothmaking",
      unlockedFromStart: false,
    },
    {
      id: "plaiting",
      branch: "clothing",
      activity: "clothmaking",
      priority: 90,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 5.4, fibre: 1.0 },
      exposure: {},
      qualityWeight: 0,
      // Nobody sows in this epoch: the return shows itself while one looks (E24).
      yield: "found",
      unlockedFromStart: true,
    },

    {
      // **Nothing but hands.** No ground, no material, and no weather: children
      // want tending whatever the draw, which is the whole point of the rank —
      // a claim that no technique of the epoch can make cheaper and no good
      // year can excuse.
      id: "childcare",
      branch: "care",
      activity: "caring",
      priority: 100,
      capacityPerOutput: {},
      intermediatesPerOutput: { labor: 1 },
      exposure: {},
      qualityWeight: 0,
      yield: "found",
      unlockedFromStart: true,
    },
  ],

  // ------------------------------------------------------------------- needs
  //
  // Determined by physiology, not by technique (E29): what a person needs in
  // order not to die, to have children and to be able to work. Ranks run in
  // hundreds because project ranks live in the same number space (E18), which
  // leaves ninety-nine places between them for projects and for needs inserted
  // later.
  //
  // **Every rank acts on exactly one axis** (E20). Satiety and comfort used to
  // move births *and* productivity both and differed only in the size of the
  // figures, which is not a choice but the same effect written twice. Satiety
  // now carries the strength to work and comfort carries the children.
  //
  // **Every rank also says whose heads it is counted over.** A growing person
  // eats less than a grown one and wears less cloth, needs almost as much
  // warmth, and care is asked for the growing alone.
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
      // Two thirds of what a head asks of food; the third above it is the
      // satiety, and it can be gone without anyone dying (E27). The split is
      // the moat: a poor draw eats the dispensable third first, and only what
      // cuts deeper than that reaches this rank. Nothing softens it on the
      // way: no process of this epoch settles its inputs in advance — one sets
      // out and finds what one finds — so the caution the plan carries never
      // reaches food here, and what is short is short. What the split has to
      // deliver stands in E29: hunger as the crisis, not the daily rule.
      perHead: 1.2,
      // A small child eats little and one nearly grown almost a full share;
      // over the group, seven tenths.
      perHeadWeight: { growing: 0.7, grown: 1 },
      consumedOnUse: 1,
      // **How hard a shortfall lands, not how often one happens.** With the draw
      // reaching far enough down to produce a hunger several times over an epoch
      // (see `shocks`), what this figure decides is whether such a tick is a
      // setback or the end of the community. At 0.1 it was the end: one deep
      // draw took most of the people at once, and a crisis nobody survives
      // teaches nothing, because there is no afterwards in which the pit one
      // failed to dig would have helped.
      //
      // At 0.65 a tick with nothing to eat costs a third. Measured over twenty
      // seeds and three hundred ticks, the sharpest fall in a single tick is
      // twenty-seven per cent and all twenty communities are still there at the
      // end. That is the shape the epoch wants: a crisis with a before, a during
      // and an after — the group is smaller afterwards, and it goes on.
      // Children die twice as readily of it as the grown. `per` scales the
      // loss, so at no coverage the grown lose a third and the growing lose
      // two thirds. That is the low end of what famine demography finds, and
      // it leaves room to the arithmetic ceiling of 2.86, above which the
      // growing would lose more than all of themselves.
      survival: { atZero: 0.65, atFull: 1, per: { growing: 2, grown: 1 } },
    },
    {
      // Fire, in the amount it takes not to freeze. Small, and high in the
      // ranking, so it is met almost whatever else happens.
      //
      // Warmth is split as food is, and for the same reason (E8): cold is a
      // *threshold*, not a slope. Half rations of food are starvation; half the
      // firewood is being cold, not fatally so. A single tier interpolating
      // linearly said the opposite — at 0.44 coverage it charged more than half
      // the mortality of having no fire at all, and cold then regulated the
      // population long before hunger ever could. Two ranks say it without
      // bending a coefficient: the non-linearity sits in the ranking, which is
      // exactly where E8 puts it.
      id: "warmth_fire",
      rank: 200,
      // A cold draw takes the gathering and calls for more firewood at the same
      // time (E24). Less exposed than the gathering itself: one heats against the
      // cold one has, and a poor draw for the gathering is not a cold one.
      exposure: { weather: 0.4 },
      stock: "warmth",
      branch: "warmth",
      perHead: 0.03,
      // A small body loses its warmth faster than a large one, so it needs
      // nearly as much of the fire.
      perHeadWeight: { growing: 0.9, grown: 1 },
      consumedOnUse: 1,
      // No fire at all in a Mesolithic winter kills — less than starving,
      // because clothing and huddling take part of it, and now much less again.
      // The fire fails in the same tick as the food, both hanging on the one
      // draw and hunger claiming every hand first; charged heavily it therefore
      // did not add to the crisis, it *was* the crisis, and the community died
      // of cold while it was still feeding itself. At 0.94 the fire going out
      // costs six per cent, and the deaths of a bad tick are the hunger's, which
      // is where the epoch means them to be.
            // Twice as hard on the growing, as hunger is.
      survival: { atZero: 0.94, atFull: 1, per: { growing: 2, grown: 1 } },
    },
    {
      // Clothing does not kill, it costs *work ability* (E16). The honest
      // effect is not "you die without a coat" but "you can work less
      // outdoors" — arithmetically the same multiplication, but kept apart so
      // the view can later say how much was worked and how productive it was.
      //
      // Also exposed on the demand side: a cold draw asks for more of it.
      id: "clothing_cover",
      rank: 400,
      exposure: { weather: 0.3 },
      stock: "clothing",
      branch: "clothing",
      perHead: 0.3,
      // Less cloth for a smaller body.
      perHeadWeight: { growing: 0.6, grown: 1 },
      // Worn, not used up. What eats clothing is decay, and that is on the
      // stock, where the needle can reach it.
      consumedOnUse: 0,
      workAbility: { atZero: 0.6, atFull: 1.0 },
    },
    {
      // **The claim on work that no progress makes cheaper** (E29). Sickle,
      // mortar and axe make food, warmth and wood cheaper; nothing goes round
      // the tending of those who cannot tend themselves. It grows with the
      // number of the growing, so it is the floor a community stays small
      // against — and it is what settling finally pays off.
      //
      // Ranked above the fire and below the clothing: a community feeds itself
      // and keeps itself warm, then looks after those who cannot, and clothes
      // itself after that.
      id: "childcare",
      rank: 300,
      stock: "care",
      branch: "care",
      // Half a share for each of the growing and nothing for the grown, so ten
      // children cost five of work. Reckoned against the whole: five of thirty
      // is a sixth of everything the community does, which is where the time
      // studies put direct care averaged over all adults.
      perHead: 0.5,
      perHeadWeight: { growing: 1, grown: 0 },
      consumedOnUse: 1,
      // Whoever cannot look after his children has fewer. Four fifths at no
      // coverage against a half for comfort — 0.8 × 0.5 = 0.4, the scale the
      // base birth rate was reckoned on. Care carries the smaller part of the
      // band because it stands low in the ranking and is nearly always covered:
      // when it does fail, things are already grave.
      birthRate: { atZero: 0.8, atFull: 1 },
    },
    {
      // Warmth beyond the minimum: cooked food, shorter nights at the fire,
      // people who have rested. It costs **productivity** — clothing already
      // carries the ability to work, and the two ought to stay distinguishable
      // (E16).
      id: "warmth_comfort",
      rank: 600,
      exposure: { weather: 0.4 },
      stock: "warmth",
      branch: "warmth",
      perHead: 0.07,
      // A small body has a great deal of surface for its size and cannot hold
      // its warmth, so it needs nearly as much as a large one.
      perHeadWeight: { growing: 0.9, grown: 1 },
      consumedOnUse: 1,
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
      // **Comfort is the top rank, so it is the first thing to go**, which
      // makes it the regulator of an ordinary tick — and that is why it carries
      // the larger half of the band: at no coverage the births run at a half.
      // Together with care, 0.5 × 0.8 = 0.4, and a community fed and warm and
      // nothing more loses one in a hundred a tick.
      //
      // It used to read 0.99 to 1.01, and that looked like a hundredth of a
      // band only because it multiplied a *growth* factor rather than the
      // births themselves. A hundredth off the growth of a community is a third
      // of all its births. Nothing was widened here; it was put on the right
      // quantity.
      birthRate: { atZero: 0.5, atFull: 1 },
    },
    {
      // The dispensable third of the food, and the community's whole buffer
      // against a poor draw: a bad tick eats this before it reaches the rank
      // that kills. Moving weight between the two ranks feeds nobody more —
      // it moves where the harm of a poor draw lands.
      id: "food_satiety",
      rank: 500,
      stock: "food",
      branch: "food",
      perHead: 0.6,
      perHeadWeight: { growing: 0.7, grown: 1 },
      consumedOnUse: 1,
      // **Satiety carries the strength to work and nothing else** (E20). It
      // used to move the births as well, which made it comfort's twin at a
      // different size; now the two say different things. What it says is the
      // plain one: a fed community gets more done.
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
      // **Whoever can walk can always walk.** Moving is not a technique that has
      // to be come by, and nothing about it has to be met first: a community
      // that carries its whole life with it is free to go at any time. So there
      // is no mark on it.
      //
      // A mark on the cost of searching would fire against the weather rather
      // than against the country: a process that finds its return runs at
      // `target ÷ draw`, so a poor draw makes the community take more out of the
      // same stand — and no move mends weather, because the weather goes along.
      //
      // The brake is instead the falling quality: each further range yields less
      // than the one before, so whoever spends the good country early is left
      // with the poor country later. That is a cost the player pays himself, and
      // it needs no gate to enforce it.
      //
      // What the thinning of the range decides is therefore not *whether* the
      // offer stands but *where it stands among the others*, and that belongs to
      // the ordering and not here. An offer that came and went with a stock
      // dipping could not carry a progress bar either: what a project still
      // wants is meant to be read off it, and a mark that flickers reads as
      // nothing.
      visibleWhen: [{ kind: "rule", id: "settled", set: false }],
      availableWhen: [{ kind: "rule", id: "settled", set: false }],
      defaultRank: PROJECTS_LAST,
      // Packing up and walking, not half a season: about a third of what the
      // community performs in a tick. Against what it frees — the ranks below
      // comfort cost some five points less of the work for a handful of ticks —
      // anything much dearer and moving costs more than it ever gives back.
      laborCost: 8,
      stockCost: {},
      minTicks: 1,
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
        // Found: fresh country, but not untouched. What a move closes is a
        // fifth of the gap between what stands and what the ground could carry
        // — so the worn stocks gain most and none is ever lowered, and moving
        // relieves the searching without setting it back to nothing. After the
        // quality, so the gap is measured against the *new* country.
        { type: "stock", id: "plants", to: { kind: "ceiling", closes: 0.5 } },
        { type: "stock", id: "game", to: { kind: "ceiling", closes: 0.5 } },
        { type: "stock", id: "deadwood", to: { kind: "ceiling", closes: 0.5 } },
        { type: "stock", id: "trees", to: { kind: "ceiling", closes: 0.5 } },
        { type: "stock", id: "fish", to: { kind: "ceiling", closes: 0.5 } },
        { type: "stock", id: "shellfish", to: { kind: "ceiling", closes: 0.5 } },
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
      // **It answers no want; it comes of long practice at wood.** The mark was
      // on the cost of finding deadwood before, at a seventh above fresh
      // country, and that was the wrong axis twice over.
      //
      // It could not be relied on: measured over eight seeds the highest that
      // cost ever reaches in a whole run is 1.13 to 1.31, so the mark sat inside
      // the noise, and whether it fell decided the epoch — three seeds in eight
      // crossed it, and whether they did turned on whether a woodpile was being
      // kept. Everything else hangs behind this one: no axe, no pit, and without
      // a pit no settling. Whether a run can be finished at all must not turn on
      // that.
      //
      // And firewood is the wrong thing to hang it on anyway. What the axe opens
      // is **standing timber** — the lining and posts of a pit, the hull of a
      // boat — not fuel; a community that is short of fuel picks up more of what
      // has fallen. That is also why nothing wants timber before the axe exists,
      // so a mark on a want would have nothing to read.
      //
      // Practice at wood grows by some two and a half a tick and never falls, so
      // it is reached in every run. Reckoned against where the others land:
      // sickle at 41 to 58, mortar at 73 to 99, earth oven at 103 to 134. At 120
      // the axe comes into view just as the earth oven is finished — after the
      // early three, and not so late that there is nothing to do but wait for
      // it. The thirty between seeing and having are about twelve ticks, the
      // same distance the other techniques keep.
      visibleWhen: [{ kind: "experience", activities: ["woodcutting"], min: 120 }],
      availableWhen: [{ kind: "experience", activities: ["woodcutting"], min: 150 }],
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
      // it pays in the ticks that would otherwise have killed people. Dhra',
      // about a thousand years before domestication (Kuijt & Finlayson 2009).
      id: "storage_pit",
      // The road to the end of the epoch, so it must not open early (E29). It
      // waits on the food getting *ample* — practice at winning it, which grows
      // with the yield and so comes sooner to a community that built the sickle, the
      // mortar and the net. By then several poor draws have been through, so the
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
      // people clothed eats more and more of everybody's work.
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
      // What a boat answers is not a full shore but a thin one: the water no
      // longer gives what it did from the bank. Utilisation cannot say it — no
      // process of this epoch pays for area at all, the wilderness and the water
      // are carriers and nothing else (E19), so their utilisation is nought in
      // every tick of every run and a mark on it can never be met.
      visibleWhen: [{ kind: "strain", measure: { searchCost: "fish" }, factor: 1.5 }],

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
      // to be full after a good draw — but pits actually dug. What ties people
      // to a place is capital they cannot carry (Testart): a store filled by a
      // good draw makes nobody sedentary, a pit does.
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
  population: {
    // **Two cohorts, and the head count is a vector over them** (E20). Which
    // groups there are is content and nothing else, so sickness or wealth would
    // be further entries in this list and not a second machine.
    cohorts: [{ id: "growing" }, { id: "grown" }],

    // Forty in a hundred still growing. Foragers run between thirty-five and
    // forty-five: under fifteen is about thirty-five with the !Kung and the
    // Aché, and reckoned up to the age at which somebody produces more than he
    // eats — around twenty with the Aché — it is nearer half.
    shareAtStart: { growing: 0.4, grown: 0.6 },

    // Aché children produce next to nothing until their late teens, Hadza
    // children get about half their own food. Averaged over a group running
    // from infants to the nearly grown, a quarter of a grown pair of hands.
    labourWeight: { growing: 0.25, grown: 1 },

    birthWeight: { growing: 0, grown: 1 },
    birthsInto: "growing",

    // **A number of people, not a factor on everyone**, and what it sets is the
    // **pace** — how fast a community can grow back after a loss.
    //
    // Where it comes to rest is the carrying brake's business (`backload`): the
    // searching grows dear as the range thins, dear searching with children on
    // the back holds the births down, and the community stops where that brake
    // meets this rate. After a crisis the brake is light — few to carry, short
    // ways — so the recovery runs at nearly this full rate.
    //
    // Kept below the line where births outrun deaths with comfort and care
    // wholly unserved: beyond it starvation becomes the brake, which is the
    // opposite of what the epoch wants. The test beside this one draws that
    // line.
    baseBirthRate: 0.17,

    // The carrying brake (E20, E29): the growing are carried, the grown carry,
    // and the searching of the tick prices the distance. Lifted for good by
    // settling — whoever stays no longer carries, and the births move closer
    // together.
    backload: {
      loadWeight: { growing: 1, grown: 0 },
      strength: 0.8,
      liftedByRule: "settled",
    },

    // **Children die twice as readily as the grown, crisis or no.** Over the
    // thirteen ticks of growing up that comes to 0.94^13 = 0.45: about half do
    // not reach the grown cohort, which is the forager figure.
    //
    // It leaves the ratio of children to grown untouched — that hangs on the
    // ageing rate and the mortality of the grown alone — and raises instead how
    // many births are needed to hold it. The birth flow grows by two fifths, so
    // the same relative fall in births costs half again as many people: the
    // population answers comfort instead of shrugging at it.
    baseSurvival: { growing: 0.94, grown: 0.97 },

    // **Growing up.** The rate follows from the standstill and is not a taste:
    // in balance the growing must give up as many as they take in, so
    // `births = (ageing + dying) × growing`, that is `0.03 = (r + 0.03) × 0.40`
    // and r = 0.045. The grown check out too — they take in 0.045 × 0.40 = 0.018
    // and lose 0.03 × 0.60 = 0.018. On average that is some thirteen ticks
    // growing up.
    transitions: [{ from: "growing", to: "grown", perTick: 0.045 }],

    // Counted over the grown (E20). Twelve people of whom ten are growing are
    // finished — the two left must feed everybody and find the care besides,
    // and the children are many ticks from being any use. Twelve grown come out
    // of it. By heads the two look the same.
    viableWeight: { growing: 0, grown: 1 },

    // Below about a dozen a community stops working: too few hunters, nobody spare
    // to carry children or the sick, and no cover at all for a single death. It
    // does not die out — it joins a neighbour, and as *this* community it is over.
    // All three of those are statements about the working, so seven of fifteen
    // grown is the same share the old twelve of twenty-five heads stood at.
    //
    // Twenty-five is the community itself (Birdsell's magic numbers), so it cannot
    // also be the floor. His other number, five hundred, is the circle within
    // which people marry — a network of communities, not a settlement, and nothing
    // this model has: we play one community, which is understood to sit inside such
    // a network.
    minimumViableSize: 7,
  },

  // **How often the draw goes deep enough to matter.** The shape is fixed by
  // E24 — mean one, an upper bound, a long left tail — and the exponent says how
  // long that tail is: `P(draw < x) = (x / scale)^exponent` with
  // `scale = (exponent + 1) / exponent`.
  //
  // At 4 a draw below a half comes up in one tick in thirty-eight. Over an epoch
  // a community leaves in something under two hundred ticks that is a handful of
  // deep draws at best, and measured it was none at all: the rank that kills was
  // never short in three hundred. A store is dug against a bad tick one has
  // lived through — if the epoch can be crossed without ever living through one,
  // nothing asks for it.
  //
  // At 2 it is one tick in nine, so a community meets several before it can
  // settle, and each is survivable rather than final (see the survival of rank
  // 100). The price is that the good side widens too: the draw now reaches 1.5
  // instead of 1.25.
  shocks: { weather: { shape: "powerLeftSkewed", exponent: 2 } },

  // Risk aversion: how strongly a thin store pushes towards the reliable
  // process (E5). Caution: how far below the mean the plan aims, so that an
  // ordinary draw leaves something over (E24).
  risk: { aversion: 0.5, caution: 0.1 },

  // The player may set the order by hand from the start; a later institution
  // unsets this rule (E23) and the economy decides alone from then on.
  rulesFromStart: [],

  // A community of about twenty-five on the range that carries it (E14, Birdsell's
  // magic numbers). The figures per head are what gets tuned; the totals follow.
  //
  // **The range has to carry fewer than the group that arrives on it** (E29):
  // standing still is meant to end at a lower level than it began at, and at
  // 0.6 and 0.24 it ended at a higher one — twenty-five grew to thirty-two and
  // stayed. Where the resting level lands runs cleanly with the figure, at
  // about 31.8 times it, so a decline wants six tenths of what stood here, and
  // that is what these are.
  //
  // Measured over eight seeds doing nothing at all: twenty-five is carried for
  // the first ten ticks, falls away to between 18.9 and 21.8 by tick thirty and
  // lies there for the rest of three hundred. Every seed goes back, which two
  // thirds did not.
  land: {
    perHeadAtStart: { wilderness: 0.144, water: 0.0576 },
    baseQuality: 1.0,
    qualityDecayPerTaking: 0.05,
    // What a report on the next range strays from that mean, either way. At a
    // seventh a lucky one is worth waiting a tick or two for and a poor one is
    // worth sitting out, without the move turning into a game of chance.
    qualitySpread: 0.15,
    // How long a move keeps the searching cheaper before the country is worn
    // as it was — the stretch a move buys, against a technique that pays for
    // the rest of the epoch.
    freshRangeLasts: 28,
  },

  // **Productivity carries the offset for both things the cohorts made
  // visible** (E20). It stood at 1.0 while every head was a full pair of hands
  // and no work went into children.
  //
  // Now the starting group performs 15 + 10 × 0.25 = 17.5 rather than 25, and
  // five of what it performs goes into care. At 1.71 that left the same 25 the
  // community had before, so the rest of the economy ran on exactly what it ran
  // on and all that changed was that more children bind hands.
  //
  // **And it carries the offset for the smaller range as well.** The two say
  // different things — the range says how many people the country feeds, the
  // productivity says how much work those people do — and only the first is
  // what the story is about. Cutting the range alone took the epoch with it:
  // at six tenths not one seed in eight ever settled, because what a project
  // costs and how much practice a technique wants are absolute figures while
  // both labour and practice run with the head count, so a third fewer people
  // is a third slower to every threshold. Measured, productivity barely lifts
  // the resting level — the stocks bind there, not the hands — but it lifts the
  // work: at 2.05 the resting community performs 33 rather than 27, and eight
  // seeds in eight settle again. The figure is fitted and not derived: the
  // smallest round step up from 1.71 at which they all still arrive.
  //
  // The offset belongs here and not in the coefficients of the processes,
  // because care is no new work: the famously short days of the "original
  // affluent society" counted the search for food alone, and the coefficients
  // are balanced against that same reality, so the time spent on children was
  // silently inside them. Pulling it out is measuring the day correctly.
  carried: { baseProductivity: 2.05, baseWorkAbility: 1.0, adjustmentPerTick: 0.25 },
};
