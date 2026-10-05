# Campaign design requirements

Read when designing a new guide, a route, or a substantial strategic revision.
For a targeted correction, use the relevant section and preserve the rest of the plan.
These requirements govern strategic content, not a new page layout.
Serialize the results through the existing Markdown/JSON contract.

## 1. Make each route a campaign

Start with **what the route requires**, not the strongest late-game roster.
For each route, establish:

- **Campaign identity:** one sentence describing the fantasy—defensive island kingdom, punitive invasion, travelling expedition, diplomatic restoration, monster hunt, fortress network, economic empire, assassination campaign, or another genuinely specific identity.
- **Choice:** why a player would prefer this story to the other routes for the same lord.
- **Practical objective:** what the player actually has to do beyond repeating the VCO checklist.
- **Territorial policy:** which places to conquer, defend, temporarily occupy, trade, ally, use as staging bases, or abandon.
- **Bottleneck:** the requirement most likely to slow victory—travel, simultaneous control, a surviving faction, hero actions, repeated recovery, a building tier, or an uncertain script interaction.
- **Expansion stopping rule:** when another conquest stops helping the chosen victory.

Do not impose tall, wide, or expeditionary play on every route.
A defensive plan needs enough territory and armies to defend; an expedition needs a departure base, a sustainable force, and a return/recovery policy.
An economic plan needs its actual income infrastructure rather than an army shopping list with an economy paragraph added later.

### Geography and diplomacy

Use coastlines, mountains, map edges, gates, passes, forests, sea lanes, hostile corridors, allied buffers, and replenishment access to assign army and settlement jobs.
Ground opening directions in the current start position and distinguish later AI movement/ownership from fixed geography.

Explain:

- Natural allies and useful buffers.
- Which diplomatic relationships actually satisfy objective control, if any.
- When a friendly target owner is more useful as a partner than as an enemy.
- Expected treaty breakpoints and the cost of committing to another faction's wars.
- Confederation opportunities and their eligibility/cost where they matter.
- Settlement trading or returning land when legal and strategically useful.
- A fallback if the assumed ally has been destroyed, moved, or refuses the needed treaty.

Do not treat a trade agreement as military access, replenishment access, or objective credit without evidence.
Do not route armies through hostile territory in forced march as though an alliance makes travel safe.

### Phases and readiness gates

Give concrete opening actions, then progress through the existing Opening, Early → Mid, Mid → Late, and Victory push sections.
Use the phases for meaningful decisions, not fixed-length filler.
If a short campaign compresses the middle, explain what is skipped and why while retaining the registered section structure.

Each phase should make clear:

1. The next objective and destination.
2. The active army and supporting role.
3. The immediate economy/build/research priorities.
4. The readiness condition for moving on.
5. The failure/recovery option if the assumption does not hold.

Prefer **“move north once the southern province can survive without the main army”** to **“move north on turn 23”**.
Turn ranges can illustrate an opening pace, but are not promises of AI behavior or recruitment availability.
Do not confuse progress toward a target with the game's actual completion condition.

## 2. Give every army a job

Possible roles include:

- Legendary Lord offensive host or unique company.
- Conquest army or siege column.
- Expedition or monster-hunting force.
- Permanent city, fortress, or gate guard.
- Frontier patrol, home guard, or relief army.
- Coastal response force.
- Ambush army.
- Cheap occupation force.
- Agent-support force.

Do not default to Early/Mid/Late/Generic Second Army if those categories conceal the actual work.
Use progression variants when a force exists throughout the campaign and changes with recruitment access.
A specialist raised once at the end does not need artificial early/mid/late copies.

For each template, explain:

- Where and why it operates.
- Whether it contains the Legendary Lord or is repeatable under a generic lord.
- Its intended slot count, including commander and embedded heroes.
- The role of every unit group.
- Its mandatory functional core, thematic preferences, and practical substitutions.
- Recruitment tier/building, capacity/unlock, and other material availability gates.
- Its treasury/upkeep/readiness condition and expected replacement burden.
- What it cannot do comfortably and which battle should be fought manually or reinforced.

If several copies are expected, optimize for affordability, recruitment access, recovery, and repeatability—not merely the main lord's strongest synergy.
Give a workable fallback before the desired hero or elite unit becomes available.
A template is a destination; do not discard useful starting units just to match it immediately.

### Slot and character checks

Count each unit's `n`, not merely the number of rows.
Count the lord and embedded heroes; a mount changes a character's unit, not its slot count.
Temporary summons and reinforcements are not permanent slots in the base template.
Never place a unique hero in several simultaneous armies.
Progression alternatives may reuse a unique character because they replace the same host, but make that distinction explicit.

Check the serialized **full displayed variants** separately using the repository reference; do not sum shared troops plus both alternative columns as one force.
Smaller patrols are valid when their job, size, and limitations are clear.

## 3. Preserve theme without surrendering effectiveness

**Thematic first, sensible second, effective always.**
Examples of identity checks, not unverified prescribed rosters:

- Alith Anar should feel like Nagarythe, not an interchangeable royal host.
- Gelt should retain the Colleges of Magic and Imperial engineering identity.
- Taurox should retain a Minotaur-led rampage identity.
- Tyrion should remain recognisable as a High Elf royal commander.

Use faction-defining units where they perform real jobs.
Do not turn every army into the same efficient stack or exclude all cavalry because it needs some attention.
A single coordinated mounted reserve can preserve theme without demanding tournament-level micro.

A DLC unit earns its place when it reinforces theme, solves a tactical weakness, improves the army's job, or has evidenced practical autoresolve value.
“Stronger” alone is not a reason to replace every distinctive unit.

### Legendary versus generic forces

Separate:

- Factionwide effects.
- Lord/hero personal effects.
- Effects applying to the character's own army.
- Local battle auras.
- Unique skills and conditional unit buffs.

Generic armies do not inherit the Legendary Lord's unique buffs, spells, mount, followers, or exclusive units.
A generic commander may need a different unit balance and a separate embedded caster.
Do not assume same-name auras stack without checking.
If the generic version materially changes the core, show a distinct full roster rather than changing only the commander label.

### Ownership and access

The repository's default is all **WH3** DLC and WH1/WH2 **free** content, not universal trilogy DLC ownership.
Verify paid-pack requirements for every recommended unit/lord/hero that could be inaccessible.
Give in-line, one-for-one role substitutions where possible.
Also verify selected-faction access: owning a pack does not grant every faction its exclusive units, mechanics, legendary heroes, or confederation options.

When the user changes ownership, reassess the entire affected strategy: units, recruitment buildings, red-line categories, technologies, capacity, and cost—not just the army name.
Do not copy an old “no DLC” limitation after a supported roster unlock, or silently introduce inaccessible older paid-DLC units.

## 4. Smart Autoresolve and recovery

The user's mod may change vanilla valuation, including ranged bias.
Confirm the actual mod and available documentation before explaining its formula.
Treat army design as a recommendation unless it has been tested under that mod/version and matchup.

For repeatable/defensive forces, favor a sustainable mix of holding power, damage, large-target answers, and recovery.
Durable infantry, useful shields/armour, supported ranged units, artillery, and resilient entities can be practical components when the roster and enemies support them.
They are **not verified universal autoresolve weights**.

Be cautious about armies relying primarily on:

- Fragile skirmishers.
- Stalk, kiting, ambush positioning, or summons.
- Spell/ability micro.
- Glass-cannon cavalry and constant cycle charging.
- One gimmick that works manually but has no demonstrated autoresolve representation.

Explain the battle and campaign consequences of projected losses.
An autoresolve “victory” that wipes a rare elite or leaves the army unable to survive the next fight can be a poor operational result.
Keep recovery and replacement routes, a healthy frontline, and a reserve before repeated fights.
Avoid forced-marching a depleted force into the next hostile army.

Use bounded wording:

> Retain a durable line and a large-target answer for repeatable fights. Stalk, kiting, summons, and spell control are valuable manually, but their representation in this mod/version has not been verified.

Do not claim exact win rates, score multipliers, loss immunity, or spell/ability mission credit without evidence.
Recommend a representative before/after counter check for event-based faction objectives; some may need a manual battle.
The final guide must remain usable manually when autoresolve is a bad trade.

## 5. Lord and hero skill priorities

Research current trees.
Do not copy an old build or invent a precise level-by-level order from memory.
For each important character, provide:

- First useful priorities.
- Required prerequisite points and rank gates.
- Unique lines and factionwide effects worth interrupting the normal queue for.
- Army buffs matching the actual units.
- Movement, upkeep, replenishment, and other campaign support relevant to the army's job.
- Spell/passive choices and useful late personal survivability/combat investments.
- Mutually exclusive choices and automatic unlocks that do not cost a point.

State whether the list is a **priority queue**, a multi-point block order, or a verified exact point-by-point build.
Do not present adjacent priority rows as prerequisite links unless they really are.
Rank-gated priorities should interrupt the normal queue when available, not require leaving every point unspent until that rank.

For Legendary Lords:

1. Identify unusually strong unique skills.
2. Separate factionwide, own-army, and personal effects.
3. Preserve movement/recovery needed by the route.
4. Fit red-line categories to the final roster and sensible intermediate units.
5. Avoid heavy investment in a unit group that disappears shortly afterwards.
6. Do not delay an almost-complete victory just to finish a perfect maximum-rank tree.

For generic lords, distinguish mobile expedition commanders from static fortress/home defenders when their priorities materially differ.
A light commander or different caster may be more cost-effective than a clone of the main lord's entourage.

### Embedded heroes versus agents

Assign each hero a role:

- Embedded hero supporting one army, its battles, or campaign recovery.
- Campaign agent scouting, assassinating, blocking, damaging walls, or performing route actions.

Do not ask the same hero to do both jobs at once.
Create separate selected skill items when builds differ.
Account for capacity, recruitment access/rank, action cost and success, travel, and the time needed for a new agent to perform the job.
Do not confuse campaign casualty replenishment with a healing spell, model resurrection, or a local combat aura.

## 6. Technology priorities

Tie research to the next operation and the portion of the strategy it affects.
Do not reduce every route to “economy → military → magic → everything”.

Evaluate:

- Actual current and intended army composition.
- Number of repeatable armies affected.
- Construction programme and growth needs.
- Replenishment, movement, upkeep, and recruitment needs.
- Factionwide bonuses and diplomatic objectives.
- Route-specific mechanic/resource gates.
- Hero infrastructure.
- Prerequisites, branch locks, research rate, and faction availability.

A modest factionwide improvement affecting six defensive armies or many settlements may outrank a strong buff for one main host.
Bring recruitment/construction discounts forward before the spending batch they support.
Reassess the queue when army structure changes.

Use flat route-specific research entries where priorities differ; reuse common items where they do not.
State the reason for moving a technology forward and a gate for postponing it.
Do not invent completion dates or imply the site tracks researched technology unless that feature exists.

## 7. Economy and settlement roles

Use a small set of reusable settlement jobs, with additional categories only when the route needs them.
For factions without ordinary settlements, translate the same questions into their verified camp, horde, herdstone, outpost, or other infrastructure system; do not impose an Empire building recipe.

### Hub

Usually a province capital or other legal advanced centre.
Typical priorities:

1. Growth/tier required for the next usable recruitment unlock.
2. Practical defence appropriate to exposure and faction mechanics.
3. A deliberate share of specialist recruitment.
4. Hero capacity/recruitment rank where needed.
5. Economy after the operational requirements.

Do not duplicate every recruitment chain in every hub.
Distribute military production according to geography, tier access, capacity, and replacement demand.

### Frontier

An exposed border or approach.
Typical priorities:

1. Practical garrison/defence where actually available.
2. Recovery/replenishment and access for a response army.
3. Cheap local replacement recruitment if worthwhile.
4. Economy after survival is credible.

Pair it with a real frontier force or allied buffer where needed; a building label is not a complete defence plan.

### Income

A safe settlement behind the active front.
Typical priorities:

1. Local income.
2. Useful resource or port.
3. Growth while another tier is needed and affordable.
4. Control/corruption/utility where required.

Prioritize by actual slots and local returns; do not prescribe every item if the settlement has too few slots.
Avoid unnecessary recruitment infrastructure where armies will neither recruit nor fight.

### Additional jobs

Recovery base, expedition foothold, survey site, ritual/route target, resource hub, or temporary occupation can justify separate roles.
State when a foothold should be promoted, returned, traded, or left undeveloped.
A distant operation needs replacement access, not necessarily a duplicate endgame capital.

### Build feasibility and funding

Verify settlement-tier and capital/minor restrictions, port/resource/landmark occupancy, garrison availability, recruitment/capacity distinctions, control, corruption, and climate when they matter.
Give an upgrade order and a condition for retiring growth or temporary recruitment.
Do not assume every faction has walls or identical minor-settlement defence.

Use ordinary recurring income as the upkeep floor.
Subtract the proposed army's actual upkeep before promising another army; loot can accelerate investment but should not be the sole funding model unless the faction's verified economy requires it and the risk is explained.
Keep a replacement/travel reserve, fund the next usable military milestone, and avoid paying for several half-finished elite projects at once.
Use relative affordability gates rather than universal treasury numbers detached from current costs.

## 8. Faction mechanics

Select the mechanics that change route decisions—Influence, courts, Marks, Colleges of Magic, Herdstones, Rampage, Books, caravans, Gardens, convoys, Geomantic systems, Devotion, rites, or other verified systems.
Do not borrow another lord's mechanic just because they share a race.

For each material mechanic explain:

- The resource and how it is generated.
- Eligibility, unlock, capacity, cooldown, and relevant spending gate.
- What to prioritize for this route and why.
- What can wait or be ignored.
- How the benefit's scope affects the main host, generic armies, or the faction.
- The practical observation needed if objective credit or an interaction is uncertain.

Turn these into decision queues in `mechanics.json`, not an exhaustive catalogue.
Link mechanic-specific units/recruitment to the army and building plans.
A promised fast-travel system, special army, or powerful upgrade is not a substitute for checking its actual access, cost, and cooldown.

## 9. Manual battle doctrine

For each materially different army job, provide a forgiving battle plan matching its actual composition:

- Deployment and holding-line shape.
- Clear firing lanes and line-of-sight constraints.
- Artillery position and useful target classes.
- A reserve and flank protection.
- Lord, hero, caster, and aura duties.
- Priority targets and the large-threat answer.
- When to advance, hold, concentrate fire, retreat a threatened section, or stop pursuit.
- A relevant adjustment for a difficult matchup, siege, or terrain condition.

Assume pause or slow speed is available.
Prefer a few coordinated groups and clear decisions over dozens of simultaneous actions.
Explain micro-heavy exceptions rather than pretending a stalk/skirmish or cavalry army plays like a stationary gunline.
Do not require tournament-level execution unless the user explicitly wants it.
Store doctrine in army `plan` rows; route prose can explain when to use it without duplicating every row.

## 10. Victory, transitions, and consistency

Stop at the route's real completion condition.
Explain how the player checks mission completion, victory registration, and reward receipt, and distinguish optional epilogues.
VCO may permit a victory after one route; completing all three is a continuation choice, not automatically a prerequisite.

Each transition should explain:

- Which existing armies and experienced characters remain useful.
- Which forces become homeland defence or are replaced.
- Which research/infrastructure carries over and what genuinely new capability is needed.
- How territory and treaties are retained, traded, or abandoned.
- The next theatre and departure/recovery gate.
- Which destination conditions are already satisfied versus merely easier now.

Do not write “now do Route II” or demand rebuilding everything from zero.
Do not treat a transition as the destination's turn-one opening; show the changed starting position.

Before delivery, trace the campaign chronologically and cross-check prose, selected datasets, objective rows, and evidence states.
Check that the final roster's skills, recruitment buildings, tech support, mechanics, and economy all point in the same direction.
A complete plan should answer what happens if a named enemy is already eliminated or a desired ally is unavailable, without inventing progress the live game has not credited.
