---
id: route-3
number: III
name: "The Empire-Relief Expedition"
vcoTitle: null
objective:
  text: "Checked 8 October 2026: the VCO author's guide publishes this route as destroying the nine named factions — Clan Moulder, Wintertooth, The Ecstatic Legions, Bonerattlaz, Wargrove of Woe, The Fecundites, Sylvania, The Deceivers and Warherd of the One-Eye — and controlling Altdorf and Nuln directly or via diplomacy, matching the archive's catalogue. Publication does not establish which diplomacy the live mission recognises for the two cities, and the public VCO repository at this date contains no Malakai mission script."
  state: verify-in-campaign
  src: [vco-guide-check, vco-script]
reward:
  text: "The current author's guide publishes this route's reward as +50% research rate, +100% allegiance points gained for alliances with the Empire, armies replenishing in foreign territory and +10% income from trade for every ally (checked 8 October 2026). Published reward effects do not establish the grant: exact scope, timing and installed-build application remain unverified, so foreign replenishment is a reward, not a pre-victory logistics assumption."
  state: verify-in-campaign
  src: [vco-guide-check]
interpretation: "A travelling workshop answers a coalition's crises: diplomacy secures the two cities while connected campaigns finish the named threats, keeping useful conquests rather than all conquests."
bottleneck: "Surviving target factions + recognised city control"
phases:
  - { title: "Stabilise the northern entrance to the coalition", note: "The first local campaign should make the later Empire expedition easier, not create an unrelated conquest obligation." }
  - { title: "Retire the nearby named threats", note: "Moulder, Wintertooth and The Ecstatic Legions are the natural early audit group; actual armies decide the order." }
  - { title: "Work through connected threat clusters", note: "Choose the next operation from the targets still alive and the allies in danger, not a fixed map-painting direction." }
  - { title: "Match Adventures to the existing wars", note: "A Hewer chapter fits the Greenskin fighting; Anger of the Forest or Vampireslayer follow naturally when their units and tasks fit Drycha or Sylvania." }
  - { title: "Close the checklist, then take the finale", note: "The last surviving faction or unrecognised city-control flag is the task, not another speculative province." }
panelOrder:
  armies: [early, mid, late, airwing, home]
  skills: [malakai-route-3, lord-route-3, engineer, gotrek, felix, runesmith, thane]
  research: [route-route-3, opening, gunline, air, economy, slayers]
  buildings: [hub-route-3, income-route-3, depot, frontier, resource-route-3, outpost-route-3, deep-route-3]
  mechanics: [ship-route-3, shiplate-route-3, adventures-route-3, deeps-route-3, grudges-route-3, forge]
gaps:
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**Stabilise the northern entrance to the coalition**

The first local campaign should make the later Empire expedition easier, not create an unrelated conquest obligation.

This is The Empire-Relief Expedition: a travelling workshop answering a coalition's crises, using diplomacy to secure the two required cities and fighting connected campaigns against the named threats, keeping useful conquests rather than all conquests. The route identity in its own words: the famous companions, Slayer crew, mixed artillery and escort airships as a self-sufficient relief column with a reliable reserve, and the mechanics priority is the engine and support radius where armies cooperate. The two required cities anchor the Empire's southern and central front — Altdorf and Nuln — where the archive's own wording distinguishes direct control from qualifying diplomacy. Start in Kraka Drak with the opening nucleus: keep the company together, build income alongside the ship, and let the first local campaign make the road south easier rather than create an unrelated conquest obligation.

::claim verify-in-campaign src=vco-guide
The archive retains “The Empire-Relief Expedition” as the guide-created route subtitle; the official VCO title is unresearched at registration and the manifest keeps vcoTitle null. Compare the installed route panel before treating any title as installed proof.
::

::claim verify-in-campaign src=vco-guide,vco-guide-check,vco-script
The author's guide publishes the same nine-faction and Altdorf/Nuln set as the archive, so the condition rows are sourced; the archive's cautions stand — a wounded enemy lord does not mean its faction is gone, and friendly city owners are not attacked simply for their objective markers. Which diplomacy the live mission recognises for the two cities remains unverified: the guide says \"directly or via diplomacy\" and the archive prefers a military alliance, but no opened source defines the qualifying treaty and the current public VCO repository (checked 8 October 2026) contains no Malakai mission script. Inspect the live mission after the first proposed alliance before committing the route to a diplomatic plan.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Malakai matchup benchmark. Follow its casualty-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the relief column's only answer to a major threat, recover, reinforce, or fight manually.
::

- **Secure Kraka Drak and the immediate war.** Keep the starting company together, fill affordable gaps and build income alongside the ship. Do not postpone a favourable opening battle until every slot matches the guide; the ship complements the home base, and the home base still matters for a second army and rebuilding after a serious loss (Armies panel: The engineer's company; Buildings panel: Kraka Drak · coalition supply base).
- **Scout Clan Moulder early.** A clean opportunity to eliminate Moulder improves security and advances this route. Do not attack blindly while an active northern army can take the home base (ledger row eliminate-clan-moulder).
- **Start the southern relationships.** Seek trade and non-aggression, and eventually access, with useful Kislev and Empire factions. Plan for recognised control of the two named cities without assuming a trade agreement is enough (VCO ledger: secure-altdorf, secure-nuln).
- **Develop the cannon company.** Use Dragonsbane and the basic ship economy, recovery and engine path. A few Slayers, Pirates and aircraft establish the theme without making every battle a separate micro exercise (Workshop panel: Ship: early; Workshop panel: Adventure order · Empire relief).

Leave the opening with a functioning army, a home base with reliable income and a defence plan, and the next named northern threat identified rather than every neighbour declared an enemy.

## Early → Mid

**Retire the nearby named threats**

Moulder, Wintertooth and The Ecstatic Legions are the natural early audit group; actual armies decide the order.

- **Eliminate, do not just raid.** After defeating a target's main army, check its remaining settlements and forces. Do not count a lord's temporary wound as faction destruction: the Moulder, Wintertooth and Ecstatic Legions rows credit only when the mission records the faction destroyed (VCO ledger: `eliminate-clan-moulder`, `eliminate-wintertooth`, `eliminate-the-ecstatic-legions`).
- **Keep useful conquered territory.** A profitable, defendable former enemy province can fund the next column. Take it when it serves the war; transfer a scattered liability when the game's settlement-trade conditions permit. There is no size cap and no four- or five-province ceiling, but a marginal forward holding can cost more to defend than it earns (Buildings panel: Safe income town, Owned relief depot).
- **Formalise the coalition where it matters.** Approach the current Altdorf and Nuln owners for the qualifying diplomatic arrangement, and check existing wars before signing. If a city is held by an enemy, plan to liberate, keep or transfer it into a qualifying arrangement rather than assuming a trade agreement is enough (VCO ledger: secure-altdorf, secure-nuln).
- **Build a second operational role.** Use a local reserve or a second field column depending on pressure: Malakai should not have to interrupt every Empire operation to chase a minor raid back home. The hold guard is a twelve-slot reinforcement force, not a guaranteed standalone answer to an elite stack, and the supporting column uses ordinary Dwarf characters (Armies panel: Kraka Drak's hold guard, The supporting field column).

Once the nearest threats are removed or contained, the route into the Empire and your next recovery point are usable.

## Mid → Late

**Work through connected threat clusters**

Choose the next operation from the targets still alive and the allies in danger, not a fixed map-painting direction.

- **Eastern relief.** Bonerattlaz (Azhag) and Wargrove of Woe (Drycha) are an eastern operation when still present. Deal with the active threat first, then avoid leaving a dangerous surviving army behind your column (ledger rows `eliminate-bonerattlaz`, `eliminate-wargrove-of-woe`).
- **Central forest and Chaos threats.** The Fecundites (Festus) and Warherd of the One-Eye (Khazrak the One-Eye) can form another operation around the central Empire. Beastmen do not need ordinary settlement ownership to remain alive: inspect the faction, not just its last visible town (ledger rows `eliminate-the-fecundites`, `eliminate-warherd-of-the-one-eye`).
- **Sylvania and the hidden threat.** Remove Sylvania as a faction, not only Vlad's army: check its remaining settlements and forces after the main battle, because a lost or wounded lord does not destroy the faction (ledger row `eliminate-sylvania`). The Deceivers (The Changeling) require a separate live-status check: investigate visible armies and their cult presence where the game exposes it, and do not invent a shortcut based on one vanished character (ledger row `eliminate-the-deceivers`).
- **Keep the column self-sufficient.** The relief identity is a self-sufficient column plus a reliable reserve. The late template is The Empire-relief expedition — veteran escort, Slayers, signature machinery and two recruited escort airships — and the mechanic priority is the engine and support radius where armies cooperate: Larger Propellers extends the Spirit's eligible support to armies in the ship's circle of influence, Signals and access investment pays only when a second force actually operates nearby, and the summoned Spirit is support, not a recruited slot in the twenty (Armies panel: The Empire-relief expedition; Workshop panel: Ship: late, Ship: early).
- **Recover forward, not only at home.** A useful former-enemy town supplies the southern operation without requiring an unbroken empire: repair useful buildings immediately, add Barley Field and stability, and decide keep or hand over deliberately after the operation. The foreign-replenishment route reward is not assumed yet, so plan using the recovery conditions the current army preview shows (Buildings panel: Owned relief depot, Liberation & settlement handover; reward claim above).

**Match Adventures to the existing wars**

A Hewer chapter fits the Greenskin fighting; Anger of the Forest or Vampireslayer can follow naturally when their units and tasks fit Drycha or Sylvania. They are opportunities, not reasons to attack neutral allies.

- **Dragonsbane: core Cannon development.** Start with attainable preparations and secure the wanted upgrades before ending the chapter (Workshop panel: Adventure order · Empire relief).
- **Dreadquake Destruction: the crew's aircraft.** Use the paired flight without breaking up the army into many isolated jobs.
- **Goblin's Monstrosity: Hewer chapter.** A fitting overlap with the Greenskin fighting when the tasks actually align.
- **Forest or Vampireslayer if the wars align.** Drycha or Sylvania can offer convenient task overlap; recruit the appropriate unit because it serves the army, not just to fill a checkbox.
- **Bloodletting and The Skaven Scheme later.** Choose Organ Gun or barge support for the force you field; the late Skaven chapter requires three earlier finales, and the joint VCO epilogue is a different battle (Victory push below).

Each operation should remove a named threat, restore a needed city, or protect the ability to do those jobs.

## Victory push

**Close the checklist, then take the finale**

The last surviving faction or unrecognised city-control flag is the task, not another speculative province.

- **Audit the nine faction entries.** Check whether allies have already removed a target and whether the mission has credited it. Use the remaining live entries to choose the final operation: a lost settlement or wounded legendary lord is not the same thing as faction destruction, and tick destruction only when the mission credits it (VCO ledger: the nine `eliminate-*` rows).
- **Recheck both cities.** Maintain the qualifying control arrangement for Altdorf and Nuln through completion: yesterday's alliance does not help if a city has since fallen to an enemy. Direct or qualifying diplomatic control is what the rows record; keep checking which diplomacy the live mission recognises (VCO ledger: secure-altdorf, secure-nuln).
- **Confirm route completion first.** The author lists Malakai & Elspeth versus Tamurkhan as a follow-up battle triggered by completing this route. Track its unlock and win separately, and do not turn it into a made-up prerequisite for the other routes.

::claim verify-in-campaign src=vco-guide,vco-guide-check,vco-script
The author's guide lists Malakai & Elspeth versus Tamurkhan as a follow-up battle unlocked by completing this route. Publication is not proof of the live trigger, its autoresolve handling or its reward: save manually before the battle, track the unlock and win separately from this route's award, and do not treat the epilogue as a prerequisite for either other route.
::

- **Finish the story on purpose.** Confirm the actual victory and the reward before deciding whether this is your campaign ending. The published reward supports research, Empire alliances, trade and replenishment abroad — and foreign replenishment is a reward, not a pre-victory logistics assumption, so keep planning with owned recovery territory until the award actually arrives (objective and reward claims above).

Finish line: all named faction and city conditions are credited and the game grants the route; the joint battle is a fitting optional epilogue once unlocked.

## Territory policy

Own enough income, recruitment and recovery territory for the coalition war. Keep valuable former enemy provinces when useful; hand over inconvenient conquests when diplomacy permits, and remember there is no size cap — keep a holding when it funds the campaign, improves a recovery route, protects a needed border or belongs to a required condition, and transfer a scattered liability rather than defending it out of inertia. A relief depot is a useful foothold near the next named threat, not an annexation programme through friendly Empire land: you can only construct your own buildings in a settlement you own, so when operating from allied territory use the access, reinforcement and replenishment options actually available (Buildings panel: Owned relief depot, Liberation & settlement handover, Safe income town). Do not attack friendly city owners simply for their objective markers, and do not annex every ally by default; do not assume a wounded enemy lord means its faction is gone, and keep the qualifying city relationships and named-target plan intact.

## Diplomacy

Cultivate the factions actually holding Altdorf and Nuln — normally start by approaching Reikland and Wissenland & Nuln. A military alliance is the preferred diplomatic tool when feasible; verify that the mission recognises the control before committing the route to a diplomatic plan.

- **Approach the city owners.** Trade and non-aggression open the relationship; the archive prefers a military alliance when feasible for the two cities (VCO ledger: secure-altdorf, secure-nuln).
- **Check wars before signing.** Read existing wars before accepting an alliance: a qualifying ally should not be at war with a faction you must eliminate or with a city owner you depend on.
- **Do not attack friendly owners for markers.** Altdorf and Nuln accept direct or qualifying diplomatic control; attacking an allied owner merely because the ledger marks the city costs you the diplomatic credit path.
- **Your credit, not your friends'.** Allied victories do not automatically tick your elimination rows. Check whether the mission has credited a target before assuming an ally's war finished it.
- **Transfer deliberately.** When a city or captured settlement sits with an enemy or an inconvenient owner, plan to liberate, keep or transfer it into a qualifying arrangement using the game's available settlement-trade options; this guide does not require Trade Any Settlement to be installed, and always recheck live city control after a transfer.

## Transition → route-1

Your allies and useful southern income can fund the northern conquest. Shift settlement policy from temporary relief to permanent ownership in the eight target provinces, push Kraka Drak to tier IV and build The Silver Hall, and turn the reserve into a holding or conquest army. The coalition wars may already have removed some northern threats, but Route I's ledger tracks control of the named provinces: check the live objective rows and the qualifying-control rule after switching plans — a defeated lord is not a destroyed faction, and allied ownership is not assumed to satisfy this route's required provinces.

## Transition → route-2

Once received, the foreign-replenishment reward can make expedition logistics easier; still confirm terrain, stance and the replenishment preview before relying on it. Refit a few slots toward Giant Slayers and Hewers, keep allies guarding the rear, and choose seven qualifying fortress targets rather than beginning a new conquest of every northern province — and confirm what the live mission credits on the first fortress before planning the whole expedition around one interpretation.
