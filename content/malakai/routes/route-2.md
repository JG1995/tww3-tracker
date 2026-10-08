---
id: route-2
number: II
name: "The Seven-Fortress Expedition"
vcoTitle: null
objective:
  text: "Checked 8 October 2026: the VCO author's guide publishes this route as \"Lay waste to at least 7\" of the same twelve named Dark Fortresses as the archive's catalogue. Seven credited sites — never twelve mandatory conquests. What the mission actually credits (capture, sack, or another action) and the live trigger are not established by any opened source, and the public VCO repository at this date contains no Malakai mission script to confirm live behaviour."
  state: verify-in-campaign
  src: [vco-guide-check, vco-script]
reward:
  text: "The current author's guide publishes this route's reward as +10% weapon strength, +15% missile resistance and +2 recruit rank for Slayer units (checked 8 October 2026). Published reward effects do not establish the grant: exact scope, timing and installed-build application remain unverified, so build the army the reward improves before relying on the bonus arriving."
  state: verify-in-campaign
  src: [vco-guide-check]
interpretation: "A Slayer–engineer expedition into hostile territory, won through a sequence of supported strikes rather than by administering every settlement along the way."
bottleneck: "Seven credited sites + a viable recovery chain"
phases:
  - { title: "Build a launch base, not an empire first", note: "Secure Kraka Drak and enough dependable income to leave home without gambling everything on the next sack." }
  - { title: "Prove the first fortress credit", note: "A single successful, verified strike is more valuable than an untested seven-stop itinerary." }
  - { title: "Finish one theatre before crossing the map", note: "Reach seven distinct credits with the least unnecessary travel and wars, not the most impressive list of enemies." }
  - { title: "Bring the signature siege company", note: "More Slayers, a second Hewer and a reliable escort make the fortress war survivable; buy endurance before spectacle." }
  - { title: "Seven credited targets; no extra world conquest", note: "Switch from open-ended invasion to a short completion operation." }
panelOrder:
  armies: [early, mid, late, airwing, home]
  skills: [malakai-route-2, lord-route-2, engineer, gotrek, felix, runesmith, thane]
  research: [route-route-2, opening, gunline, air, economy, slayers]
  buildings: [hub-route-2, staging, frontier, income-route-2, resource-route-2, outpost-route-2, deep-route-2]
  mechanics: [ship-route-2, shiplate-route-2, adventures-route-2, deeps-route-2, grudges-route-2, forge]
gaps:
  - "Transition → route-1"
  - "Transition → route-3"
---

## Opening

**Build a launch base, not an empire first**

Secure Kraka Drak and enough dependable income to leave home without gambling everything on the next sack.

This is The Seven-Fortress Expedition: a Slayer-engineer expedition into hostile territory, won through a sequence of supported strikes rather than by administering every settlement along the way. The route identity in its own words: Slayer shock troops, paired axe machines and a siege-capable escort, with a viable recovery chain as the bottleneck. Seven credited sites — not all twelve listed fortresses, and not merely sacking one location — are what the archive's catalogue claims; the recovery chain and launch base are the operational spine. Start in Kraka Drak, fund a working expedition from a base that survives your absence, and treat the first verified fortress credit, not a written itinerary, as the milestone that opens the campaign.

::claim verify-in-campaign src=vco-guide
The archive retains “The Seven-Fortress Expedition” as the guide-created route subtitle; the official VCO title is unresearched at registration and the manifest keeps vcoTitle null. Compare the installed route panel before treating any title as installed proof.
::

::claim verify-in-campaign src=vco-guide,vco-guide-check,vco-script
The author's guide publishes the same seven-of-twelve rule over the same twelve fortresses as the archive, so the sites below are sourced; the archive's cautions stand — not every Dark Fortress is eligible, repeated sacks of one location do not farm the mission, and a battle against its lord is not proof of credit. The exact credit rule and trigger timing remain unverified: the current public VCO repository (checked 8 October 2026) contains no Malakai mission script, so verify credit on the first fortress before planning the whole expedition around one interpretation.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Malakai matchup benchmark. Follow its casualty-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the expedition's only answer to a large target, recover, reinforce, or fight manually.
::

- **Finish the local danger.** Complete the immediate war and scout Clan Moulder. Remove it when vulnerable or contain the approach while addressing the threat actually at your doorstep; do not march north with an undefended recruitment base.
- **Develop the first working stack.** Start from the companions, shielded troops and Cannons, and add Slayer Pirates when their hull/recruitment access opens. A thematic army still needs a screen and tools against armoured targets — the Early template in the Armies panel describes the intended company, not a turn-one shopping list (Armies panel: The engineer's company).
- **Invest in the ship's foundations.** Beer Hall, Cargo Racks and Engine Room support repeated expedition fights; hull upgrades open future units, so use available ship recruitment instead of waiting for the final Assembly Line. The ship provides the movement and specialist replacement while the launch base earns (Workshop panel: Ship: early; Buildings panel: Kraka Drak · expedition launch base).
- **Begin the cannon experiment.** Dragonsbane gives useful artillery development: secure the desired Cannon preparations before its finale, and treat the Hewer Adventure as a priority once an earlier finale opens it (Workshop panel: Adventure order · Dark Fortresses).

Launch only when the army is healthy, the base has a response plan, and the first two target opportunities plus the recovery after them are identified.

## Early → Mid

**Prove the first fortress credit**

A single successful, verified strike is more valuable than an untested seven-stop itinerary.

- **Choose a reachable eligible occupied site.** The Howling Citadel and The Crystal Spires are useful candidates to inspect from the northern approach; current ownership and movement decide which is practical. Use the exact eligible list — the twelve candidate rows in the ledger and the game's own mission text — not the map icon alone.
- **Use a conservative first action.** The public wording is “lay waste”. Razing a qualifying enemy-held fortress is the conservative plan. Inspect the counter immediately after the battle; if it does not credit, read the live objective rather than repeating the same assumption at the next six sites.
- **Keep a staging location distinct from the objective.** A razed target is not your next healing station. Plan encampment or another owned/usable friendly location and verify the replenishment preview; ship bonuses do not guarantee replenishment in every hostile terrain (Buildings panel: A staging & recovery base).
- **Make one or two strikes per leg.** Let the supporting force defend or escort according to the actual threat; avoid forced march into fog, and do not assume one surviving Slayer regiment can absorb another elite stack (Armies panel: The supporting field column).

Before extending the expedition, one eligible action has credited and the army can recover without a long emergency retreat.

## Mid → Late

**Finish one theatre before crossing the map**

Reach seven distinct credits with the least unnecessary travel and wars, not the most impressive list of enemies.

- **Select a main target cluster.** A central-to-eastern shortlist is The Howling Citadel, The Crystal Spires, The Writhing Fortress, Zanbaijin, Bloodwind Keep, Fortress of Eyes and Red Fortress. These are seven eligible candidates, not a guaranteed shortest path; use the live map to order the leg.
- **Use western alternatives only when they help.** Black Rock, The Twisted Towers, Fortress of the Damned, The Frozen City and The Palace of Ruin are the other eligible sites. If you are already fighting west, do not sail all the way east merely to follow the suggested shortlist.
- **Remember what the list is for.** All twelve listed sites are credit candidates under the seven-of-twelve rule, never twelve mandatory conquests. The ledger marks only mission-confirmed credit; “on itinerary” is your plan, not proof (VCO ledger: the twelve fortress rows).

**Bring the signature siege company**

More Slayer fighters and a second Hewer fit this campaign. Retain Cannons, shielded infantry and a ranged answer to monsters and flyers; do not turn the theme into a naked charge against towers and missile troops.

- **Refit the column for sieges, not skirmishes.** The mid and late templates keep the shielded core and the Thunderer escorts while adding the larger Slayer section and the second Hewer (Armies panel: The fortress-bound workshop → The fortress-breaker expedition; Skill panels: Malakai · Dark Fortresses; Dwarf Lord · Dark Fortresses support).
- **Buy endurance before spectacle.** Storage Hold, useful engine upgrades and cash for replacement and recovery usually matter more than another permanent town or a fourth barge. One recruited barge is enough aerial spectacle; keep its ground escort funded (Workshop panel: Ship: late; Armies panel: The northern air wing).
- **Spend the mechanic priority in order.** Recovery and engine come before luxury, and the Hewer Adventure sits at the top of this route's mechanic queue, with Dreadquake Destruction when practical and The Skaven Scheme only for genuinely useful returns (Workshop panel: Adventure order · Dark Fortresses).
- **Use the Deeps only where they pay.** The route's Deeps policy is a principal investment for one safe rich capital: secure surface income and a cash reserve first, then the Great Gate entrance and income-producing rooms, and only then specialist defences. Compare the Guild Foundries tooltip against your actual settlement count rather than assuming the compact-realm build still wins (Buildings panel: Your principal underground investment).
- **Raise a second army only when it prevents isolation.** A supporting column is warranted when the base needs coverage or the expedition requires escort or reinforcement; it need not duplicate Malakai's specialised stack and it cannot assume the ship is nearby (Armies panel: The supporting field column; Research panel: Research · Dark Fortresses).

Before the final push, know your remaining credit count, the nearest qualifying alternatives, and the replenishment point after the next fight.

## Victory push

**Seven credited targets; no extra world conquest**

Switch from open-ended invasion to a short completion operation.

- **Audit distinct sites.** The ledger marks mission-confirmed sites, not places you have merely visited or razed twice. Once seven are credited, there is no reason to attack the remaining five solely for this route.
- **Prepare the last fight on its own merits.** Approach healthy, scout reinforcements, and use a manual battle when the forecast would delete the veterans needed to survive the following turn.
- **Check the award, then extract.** Confirm the actual victory and the reward before budgeting with it. The published reward improves Slayer units, so bring the Slayer/Hewer core the bonus is meant to support — a functioning pre-reward army, not a rebuild after the award — and preserve the expedition for a continuation instead of continuing into fresh wars out of habit (objective and reward claims above).
- **Do not confuse Adventures with VCO.** The Skaven Scheme, optional maintenance tasks and ship upgrades help the army; they are not substitutes for seven fortress credits.

Finish line: at least seven distinct eligible sites are credited and the campaign awards this route.

## Territory policy

Keep a reliable income/recruitment base and selected staging points; expand that base only when it funds or protects the expedition, and do not conquer all Norsca before beginning the route. Fund the march from safe interior sites — a marginal forward holding can cost more to defend than it earns — and treat each razed target as an operation, not a new province (Buildings panel: Safe income town, Mine or trade-resource settlement). A staging point is a defensible recovery position for one or two legs, not a high-tier showcase in hostile territory, and an eligible target is not automatically a base: earn its credit, separate the recovery point from it, then decide keep, transfer or leave (Buildings panel: A staging & recovery base, An eligible target is not automatically a base).

## Diplomacy

Secure passage and quiet flanks near home. Treat potential northern allies or useful buffer factions pragmatically, but never assume an ally's destruction of a fortress earns your mission credit — the route counts your credited actions, not what your friends do. Keep a friendly or owned replenishment position on the recovery chain, and use encampment where the terrain offers no safe harbour.

## Transition → route-1

Redirect from razing to occupation before touching the required northern provinces. Your ship and Slayer veterans remain useful, but the new bottlenecks are province completeness, holding armies and tier-IV Kraka Drak: add surface growth and income, and The Silver Hall becomes the mandatory landmark. The expedition's holding column can grow into the first provincial garrisons; the fortress rows you ticked belong to this route's ledger, so check the live Route I objective rows after switching plans. The Slayer reward keeps helping the holding armies; the aviation identity still needs its own investment.

## Transition → route-3

Recover and turn south rather than carrying on around the Wastes. Check which northern target factions you have already eliminated — the fortress campaign has fought through good parts of that theatre — then establish Empire relationships early and pursue only the surviving listed factions and the two city-control objectives. Your veterans and the Slayer reward support the existing crew without forcing a full rebuild; confirm what the live mission still counts before planning the first southern leg.
