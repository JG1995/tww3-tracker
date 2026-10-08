---
id: route-3
number: III
name: "The New Frontier"
vcoTitle: "The New Frontier"
objective:
  text: "The VCO author's Immortal Empires guide, re-read 2026-10-07, publishes two conditions: occupy, loot, raze or sack 32 different settlements — a counter of qualifying actions at different locations, not 32 settlements held at once — and eliminate six named New World factions (Cult of Pleasure, Exiles of Nehek, Slaughterhorn Tribe, The Drowned, Naggarond, Legion of the Gorequeen). The pinned v5.16.0 mission matches both (OCCUPY_LOOT_RAZE_OR_SACK_X_SETTLEMENTS total 32; DESTROY_FACTION with confederation_valid). Live counter and destruction credit remain unverified."
  state: confirmed
  src: [vco-guide-check, vco-missions-v516]
reward:
  text: "Published reward, re-read 2026-10-07: Devotion +2 in all provinces, recruit rank +1 for Kislev units, global recruitment duration −1 turn, and income from all buildings +15% factionwide; a benefit for continued campaigning after victory, not the opening budget. The live grant, timing, and installed-build application have not been tested; the pinned v5.16.0 payload shows different effects in places (see the sources notes)."
  state: confirmed
  src: [vco-guide-check, vco-payloads-v516]
interpretation: "A New World frontier campaign: secure the southern and coastal dangers, build a self-supporting frontier, then campaign north against the surviving major powers, retaining valuable provinces and keeping unnecessary fronts quiet."
bottleneck: "Sustained multi-army operations + the last surviving required faction"
phases:
  - { title: "Secure a frontier before promising a kingdom", note: "Resolve the opening and pick the first necessary war; do not open all six at once." }
  - { title: "Turn local victories into a regional power", note: "Eliminate connected targets while developing the territory you need." }
  - { title: "Prepare the northern campaign", note: "Bring a sustainable campaign to Naggarond and the Gorequeen." }
  - { title: "Break armies and recruitment, not only borders", note: "Force useful engagements and cut the northern powers' ability to respond." }
  - { title: "Finish the remaining factions and distinct settlements", note: "Audit the mission rather than assuming a large map colour means victory." }
panelOrder:
  armies: [early, mid, late, special, home]
  skills: [mother-route-3, druzhina, patriarch, hag, ataman, shadows]
  research: [route-route-3, opening, forest, expedition, later]
  buildings: [hub, reclaim, frontier, income, recovery, resource, hut, temporary]
  mechanics: [route-route-3, hut, hexes, devotion, court, access]
gaps:
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**Secure a frontier before promising a kingdom**

Resolve the opening and pick the first necessary war; do not open all six at once.

This is a New World frontier campaign. The archive frames Route III as The New Frontier: a pact between the frontier communities and the forest — a stronger human escort, Akshina hunters and a select group of monstrous allies — that secures the southern and coastal dangers, builds a self-supporting frontier, then campaigns north against the surviving major powers. Two requirements run together: the six named factions and **32 distinct settlement actions**. The counter is not “own 32 settlements”, and the same town does not become a new unique target each time it is sacked. The route identity in its own words: count qualifying actions at different locations, do not open all six wars immediately, and do not chase an exact settlement count while a surviving target rebuilds behind you. The Early muster (The frontier watch) is the route's identity, not a turn-one roster (Armies: Early).

- **Stay in Naggaroth and finish the starting enemy.** This is the actual theatre of the six target factions. Do not relocate to Kislev and expect the objectives to change.
- **Use a practical human-and-creature army.** The Early watch is inexpensive enough to fight and develop settlements together. Add Akshina and forest recruitment without discarding useful starting veterans (Armies: Early, Home guard).
- **Secure the southern danger when the opportunity is sound.** Morathi is a required target and a common strategic concern, but scout the actual strength before attacking. Win the army engagement, then remove the recruiting base instead of repeatedly defending against its recovery.
- **Fund the next province's stability.** Repair income, reach the forest recruiting milestone and retain a response at home. A second premium 20-stack is not the first construction project (Settlements & economy: A newly secured northern province, A forest recruitment capital).

The starting position is secure, the first major target is chosen for a favourable reason, and home can finance continued fighting.

::claim confirmed src=vco-names-check
The route's official VCO title is verified from the pinned English localisation (v5.16.0): the displayed string is "Route III - The New Frontier". The manifest's vcoTitle now holds the verified official title; the installed route panel has not been compared, and the pinned localisation does not certify the player's installed build.
::

::claim verify-in-campaign src=vco-guide-check,vco-missions-v516
The route's stated conditions are the 32-settlement qualifying-action counter and the six named faction eliminations; the pinned v5.16.0 mission uses OCCUPY_LOOT_RAZE_OR_SACK_X_SETTLEMENTS total 32 and DESTROY_FACTION with confederation_valid. Candidate lists and a wounded-enemy state do not become extra requirements: a defeated lord is not evidence a faction is gone. Check the live counter and each faction's destruction credit before closing an operation.
::

::claim verify-in-campaign src=patch61
The start-context distinction matters here too: this route stays in Naggaroth because its required enemies are in the New World; relocating to Plesk adds travel and a second strategic problem without replacing the six named enemies. Keep useful neighbours peaceful and do not open all six required wars in the opening turns.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Ostankya matchup benchmark. Follow its preview-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the frontier host's only answer to a major threat, recover, reinforce, or fight manually.
::

## Early → Mid

**Turn local victories into a regional power**

Eliminate connected targets while developing the territory you need.

- **Handle the nearby required enemies in a sensible order.** Audit Morathi, Khatep, Taurox and Cylostra against their actual positions. Khatep is mandatory here even when peaceful relations might otherwise suit you. Avoid a treaty you intend to break immediately.
- **Scout mobile and coastal remnants.** Taurox or a pirate army can survive the loss of one settlement. Confirm the faction is actually gone before reallocating the entire frontier defence.
- **Raise a useful second army.** A Druzhina, a Hag and an affordable core can defend the approach or complete a minor operation. Expand it into a field army when recurring income can support the extra job (Armies: Mid, Home guard).
- **Develop reclaimed provinces.** Use markets, resources, Devotion support and regional recovery. Reserve one forward capital for recruitment instead of copying the full military capital into every town (Settlements & economy: A newly secured northern province, A safe town that funds the coven, A regional recovery station).

**The six named targets, one by one.** These are elimination-credit records, not a simultaneous war plan; each is credited by the live VCO panel only when the faction is actually destroyed.

- **Cult of Pleasure (Morathi) — secure the southern approach.** An early strategic danger and a required target only on Route III. Defeat the main army and remove the remaining holdings rather than letting the faction recover behind you.
- **Exiles of Nehek (Khatep) — resolve the inland objective.** A mandatory Route III target even when diplomacy seems possible. Do not sign a long-term pact you already intend to break. Outside this route, the atlas does not automatically require his destruction.
- **Slaughterhorn Tribe (Taurox) — find the mobile raider.** Scout the moving army and any remaining base. A ruined settlement alone does not prove that a Beastmen faction is gone. Use pinning and interception when it is in reach.
- **The Drowned (Cylostra) — remove the coastal threat.** Watch coastal approaches and surviving armies. Preserve your main theatre; do not lose the developed homeland to a second enemy while chasing a ship.

Local target factions are being removed, the old homeland is no longer the only recruiting centre, and a second army has a clear funded assignment.

## Mid → Late

**Prepare the northern campaign**

Bring a sustainable campaign to Naggarond and the Gorequeen.

- **Move the support network before the army outruns it.** A defended forward region, replacement access and a secure return corridor reduce the cost of each difficult win. Keep an eye on coastal threats behind the advancing line (Settlements & economy: A regional recovery station, A border or coast worth holding).
- **Build the army branch that actually exists.** The forest Late host (The woodland host) can finish the route. The Pact is an optional thematic alternative only after normal Kislev access, Patriarch infrastructure and advanced recruitment are ready (Armies: Late, The Pact).
- **Use administration to support expansion.** Develop connected income provinces, keep Court/Orthodoxy imbalance under control and consider economy boons that now have enough settlements to justify them (Workshop: Court, Devotion).
- **Use Cursemark and Purification as the campaign tools.** Cursemark to catch armies and force engagements; Purification to secure and stabilise reclaimed provinces; Incantations for hard matchups. Corruption clearing and provincial Devotion are separate jobs (Workshop: Five campaign tools, Devotion, Incantations).

**Break armies and recruitment, not only borders**

Choose operations that reduce Malekith's and Valkia's ability to respond, and use the developed realm to sustain the northern war.

- **Naggarond (Malekith) — break the northern power.** Prepare regional replacements, a second field army and stable forward provinces before the deep northern campaign. Prioritise dangerous armies and recruiting centres; use Cursemark and scouting to force useful engagements instead of repeatedly chasing a retreating force (Armies: Late, The hunters of the new frontier).
- **Legion of the Gorequeen (Valkia) — finish the northern war.** Use the developed northern bases to sustain this operation. Avoid banishing a surviving required force far away with Jinxed Land simply to remove it from your immediate view; selling the last target overseas can delay the actual finish.
- **Let the frontier economy carry both.** Income and Devotion in reclaimed provinces, forward recovery and regional recruiting hubs keep the army replaced while the war moves north. Keep the realm able to survive a few turns without loot (Settlements & economy: A newly secured northern province, A safe town that funds the coven).

The northern campaign has a replenished lead army, a supporting force, regional replacement capacity and an economy that survives a few turns without loot.

## Victory push

**Finish the remaining factions and distinct settlements**

Audit the mission rather than assuming a large map colour means victory.

- **Check the six faction entries individually.** Find the last living army or remaining settlement of each uncompleted target. Diplomacy, confederations and AI defeats can alter the situation; the live VCO panel decides the credit. A defeated lord is not evidence a faction is gone.
- **Check the distinct-settlement counter.** Use the number displayed by the objective. Repeated sacks of the same town do not satisfy a requirement for different settlements; ownership count is a different number. Qualifying actions at different locations feed the counter; 32 simultaneous settlements are not required.
- **Avoid creating a last-army chase.** Prefer pinning or eliminating the final required force. Emergency Jinxed Land can save your army, but sending that force overseas may delay the actual finish.
- **Make the final action, then confirm the award.** Complete the missing qualifying settlement action or faction elimination. Inspect the victory and its rewards; reward receipt is confirmed separately. The published reward — Devotion +2 in all provinces, recruit rank +1 for Kislev units, global recruitment −1 turn and +15% income from buildings factionwide — strengthens continued campaigning after victory; it is not part of the opening budget (Workshop: Devotion).

All six target factions and the live 32-different-settlements objective are credited, and VCO confirms Route III victory. Continue into a ritual or Lustrian expedition only because it is the story you want next.

## Territory policy

Develop the land needed for a wide New World war. Hold recruiting capitals, good income and protected approaches. The 32-settlement goal counts qualifying actions at different locations, not a requirement to own 32 settlements simultaneously.

- **The frontier economic heartland funds the fight.** A recruiting capital (Silent Grove and, later, the Haunted Forest), ordinary income provinces and the Hut's passive Essence carry the early war; reclaimed provinces add Devotion and income as the campaign moves north (Settlements & economy: A forest recruitment capital, The landmark's home, A newly secured northern province).
- **Forward territory exists to sustain operations.** A defended staging province, a regional recovery station and a gain with an exit plan reduce the cost of each northern win. Keep a border or coast worth holding protected rather than assuming distance is defence (Settlements & economy: A regional recovery station, A border or coast worth holding, A gain with an exit plan).
- **Devotion is part of the frontier economy.** Build and preserve provincial Devotion in reclaimed holdings so unsuitable-climate provinces become workable and eligible invocations stay affordable. Purify and stabilise a province before it compromises an operation; corruption, plague, climate and Devotion are separate checks (Workshop: Devotion).

::claim verify-in-campaign src=patch61
The shared Devotion thresholds are archive- and 6.1-rework-sourced, not verified in-campaign: at least 50 Devotion permits an eligible invocation in owned territory, 75+ Devotion negates climate penalties, and −100 Devotion triggers a Chaos incursion. Check the live province trend and invocation panel before heavy investment, and confirm the after-cost balance still protects a wounded army.
::

## Diplomacy

Preserve non-target neighbours and consider contacts with Kislev for optional roster access. Avoid lasting treaties with a target you plan to eliminate soon. Defensive partners and a shared enemy can be useful, but they are not a substitute for checking objective completion.

- **Keep the war list short.** One nearby required enemy at a time, in a sensible order. The six-target list is the route's elimination set, not an opening declaration of six wars (the archive's own caution).
- **Do not sign a treaty you intend to break.** Khatep is mandatory on this route regardless of diplomacy; a short-term pact is useful only while it genuinely serves a legitimate credit.
- **A defensive partner is not an objective.** Alliances or a shared enemy can help security, but ownership or elimination credit comes from the live VCO panel, not from a partner's actions.

## Transition → route-1

Keep the developed realm as the ritual budget. Put secondary armies on homeland defence, move Ostankya's experienced host toward any remaining Hex missions, and invest in the craft/quest progression rather than starting another unnecessary war. Keep the royal Pact only where it helps; the coven does not need a full rebuild to perform the ritual.

## Transition → route-2

Keep the northern realm producing income and assign its defence to the supporting armies. Scout Lustria, verify the three ingredient quotas and send a specialist hunting expedition south from a secure staging point. Your stronger economy can support retained collecting stations; do not apply the settlement-action logic of Route III to a direct-control ingredient objective.
