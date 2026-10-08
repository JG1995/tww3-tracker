---
id: route-1
number: I
name: "The Malediction of Ruin"
vcoTitle: "The Malediction of Ruin"
objective:
  text: "The VCO author's Immortal Empires guide, re-read 2026-10-07, publishes two conditions for this route: obtain the 5 campaign Hexes and unleash the Malediction of Ruin. The pinned v5.16.0 mission pairs the display wording with a final set-piece battle (wh3_dlc24_ksl_mother_ostankya_hex_malediction_of_ruin). This is published wording and a historical definition, not a verified live trigger: the Hex-credit rule and the final-battle trigger remain unobserved."
  state: confirmed
  src: [vco-guide-check, vco-missions-v516]
reward:
  text: "Published reward, re-read 2026-10-07: the Malediction of Ruin, corruption −5 for the faction leader, ward save +5% against Chaos and weapon strength +5% against Chaos for all armies; treated as a post-victory benefit, not part of the opening statistics. The live grant, timing, and installed-build application have not been tested, and the pinned v5.16.0 payload definitions show different values and scope in places (see the sources notes)."
  state: confirmed
  src: [vco-guide-check, vco-payloads-v516]
interpretation: "A ritual campaign: secure a safe base and an active coven, then let battles, Incantations and Hexes carry the witchcraft progression toward the great ritual; territory is a means to finance and protect that work, not a finish line."
bottleneck: "Correct witchcraft progression + a prepared final battle"
phases:
  - { title: "Give the coven a safe home", note: "Get the immediate campaign working before trying to accelerate the ritual." }
  - { title: "Turn successful operations into witchcraft", note: "Progress the army and the Hex chain together." }
  - { title: "Prepare the spirit host without losing the economy", note: "Buy the units and support that make the final operation reliable." }
  - { title: "Use the Hexes to solve real obstacles", note: "Cleanse, pin, fund or reposition for the campaign's real needs while the base stays protected." }
  - { title: "Complete the Malediction and confirm the award", note: "Do the actual ritual objective, not an assumed extra checklist." }
panelOrder:
  armies: [early, mid, late, special, home]
  skills: [mother-route-1, druzhina, patriarch, hag, ataman, shadows]
  research: [route-route-1, opening, forest, expedition, later]
  buildings: [hub, hut, income, recovery, resource, frontier, temporary]
  mechanics: [route-route-1, hut, hexes, devotion, court, access]
gaps:
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Give the coven a safe home**

Get the immediate campaign working before trying to accelerate the ritual.

This is a ritual campaign: stay in Naggaroth by default, finish the starting war and secure the capital's approaches, then let battles, Incantations and Hexes carry the witchcraft progression toward the great ritual. Territory pays for and protects that work; it is not the finish line. The witches and their forest retinue lead — hunters, spiders, Things in the Woods and eventually Incarnate spirits — with a modest human escort keeping the early expedition functional. The Early template (The waking coven) is the muster to work toward, not a turn-one shopping list; an unavailable beast can remain a Warrior or Kossar until its recruitment exists. The Armies panel carries the full progression notes and manual doctrine.

- **Recruit humans around your starting creatures.** Keep the starting Hag and any useful beasts, then add an affordable human screen and missile core. Fight favourable engagements, replenish, and avoid paying for a second full stack before the first can be supported.
- **Build income and the tier-3 forest milestone.** Develop farm/market income and reach Silent Grove at tier 3. Plan the Hut in its valid location, but do not bankrupt the army by buying the landmark the first moment it appears (Settlements & economy: A forest recruitment capital, The landmark's home).
- **Begin a purposeful crafting habit.** Make a few useful Incantations and apply them before battles. Note which actions actually advance your live Hex-spending objective. Do not save every resource for an unspecified later need (Workshop: Incantations, Essence ledger).
- **Do not wait for a full royal Kislev roster.** The forest campaign works before you gain conventional Kislev troops; check the live recruitment panel if an expected unit is missing (Workshop: Recruitment).

A defendable recruiting base, an affordable active army, a functioning crafting habit and a clear next Hex requirement.

::claim confirmed src=vco-names-check
The route's official VCO title is verified from the pinned English localisation (v5.16.0): the displayed string is "Route I - The Malediction of Ruin". The manifest's vcoTitle now holds the verified official title; the installed route panel has not been compared, and the pinned localisation does not certify the player's installed build.
::

::claim verify-in-campaign src=vco-guide,vco
The archive records a 30 September 2026 research date but carries no VCO version string; the manifest keeps patch and VCO unverified and records the archive's date only as scoped provenance, never a fresh whole-guide check. Keep the current VCO Workshop page and installed build separate from the archive's publication dates.
::

::claim verify-in-campaign src=patch61,hut
The start-context distinction matters: the default plans remain in Naggaroth at Bleak Hold Fortress, the reworked Hut can stand at Bleak Hold Fortress or Volksgrad (one active location at a time), and Route I's optional Plesk homecoming exists for the Motherland setting — the archive notes Creative Assembly describes Plesk as the harder start. Neither the homecoming nor the Volksgrad option is a VCO requirement.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Ostankya matchup benchmark. Follow its preview-forecast advice as a recommendation, not a measured result: magic and Incantations are not guaranteed hidden strength, and a predicted outcome that risks a veteran or the coven's only answer to a major threat should be reinforced, recovered, or fought manually.
::

::claim verify-in-campaign src=roster,mother
The archive's access assumption is all WH3 DLC plus WH1/WH2 free content only, with normal Kislev recruitment gated by city ownership or alliance and the special forest roster from the grove chain. Registration has not verified the player's installed content. Check the live recruitment panel; if an expected unit is unavailable, use an accessible warrior, Kossar or forest-recruit core.
::

## Early → Mid

**Turn successful operations into witchcraft**

Progress the army and the Hex chain together.

- **Keep a nearby war productive.** Eliminate an immediate regional threat or run a safe expedition instead of opening unrelated wars. Battles should produce security, resources or the specific mission requirement.
- **Obtain the next Hex through its real mission.** Read the spending requirement, complete the associated quest when prepared, then confirm the new tool is available. A full Essence wallet is not evidence of completed spending — the wallet and the mission counter are two separate ledgers (Workshop: Five Hexes).
- **Make the unique research branch useful.** Prioritise the opening unique technologies (Charms Above the Door → Sympathetic Undergrowth → Fighting Shadows) and Double, Double when their conditions allow. The extra secondary trinket slot is a genuine crafting improvement, separate from a campaign Hex unlock (Research: Research emphasis for Route I).
- **Bring in the second Hag with a job.** Move toward the Mid coven (The veiled procession) once you can fund another caster. Let one provide the complement to Ostankya's Hags toolkit; their shared Winds mean more casters do not mean unlimited casting. Develop the Shadows package for a repeatable spell opener and its lore gate before the deeper spells (Skills: Mother Ostankya · The Malediction of Ruin, Hag Witch · Shadows).

The first useful Hexes are unlocked, the Hut is secure, and the next quest can be attempted without leaving the homeland helpless.

::claim verify-in-campaign src=essence,tech,hex-guide
The Hex chain's spending progression is not an Essence wallet total: research may cost Essence without adding equal credit to a Hex-spending objective, a cheaper Hex need not generate extra progress, and a treasury total does not by itself prove a Hex mission complete. These are the archive's own cautions plus player observations; the live credit rule is unverified. Check: record wallet and mission counter, perform one useful action, and read how much the counter moved before mass-producing anything. Fallback: keep a reserve and treat unobserved credit as zero until the mission panel shows otherwise.
::

## Mid → Late

**Prepare the spirit host without losing the economy**

Buy the units and support that make the final operation reliable.

- **Reach the tier-5 forest continuation deliberately.** Reserve money for both Haunted Forest and the Incarnates it unlocks. Replace a few slots at a time; do not rebuild an experienced army from scratch.
- **Protect the base while the coven travels.** Leave a home response force or develop a defensible neighbouring province when necessary. Active campaigning and a secure ritual economy are compatible.
- **Prepare rather than over-upgrade.** The Late host (The ancient covenant) is the default. The optional Spirit host (The great ritual host) is a more demanding monster-heavy expression, not a mandatory optimisation: full health, familiar spells and prepared Incantations matter more than squeezing another exotic unit into it. The 12-slot Home guard (The village wardens) stays a local reaction force, not an independent field army (Armies: Late, Spirit host, Home guard).

**Use the Hexes to solve real obstacles**

Clean plague or corruption, pin a threat, fund a journey or reposition through an appropriate forest. Keep the observed credit for the current gate separate from the cost you paid. The five campaign Hexes stay exactly the five named:

- **Purification Chant.** Cleanse and cure: clear the corrupt staging region or cure a plague before it compromises the next operation. Use it where the consequence matters, not merely on the nearest patch of corruption; Devotion and corruption remain separate.
- **Coven's Cursemark.** Pin and pursue: cripple a threatening army's ability to escape or exploit its stances, then make the planned interception. Check the live duration and affected army; it is not a battle spell.
- **Jinxed Land.** Forest transit: use the magical-forest destinations as campaign transport; scout the arrival area, access permissions and the distance still left to your target. It is not arbitrary city-to-city teleportation.
- **Bewitching Lure.** Temporary expedition income: choose a worthwhile developed settlement and use the return to fund the next operation or defensive response. Inspect live income, duration and eligibility; do not treat the estimate as permanent tax income.
- **Recreant Spirit.** Regional disruption: create pressure on the enemy's region at a time your own army can exploit it. Do not budget the effect as a permanent controllable army or assume its independent actions satisfy your VCO requirements.

Empowerment order follows use: for a travelling expedition, inspect Jinxed Land's upgrade early; for a plague or corruption problem, prefer improved Purification; for a pursuit-heavy war, improve the pinning tool. Read each live research effect rather than treating every empowerment as mandatory (Workshop: Five Hexes).

All five Hexes are obtained, the final mission is understood, and the chosen host can fight it without depending on unverified autoresolve treatment of magic.

## Victory push

**Complete the Malediction and confirm the award**

Do the actual ritual objective, not an assumed extra checklist.

- **Read the active VCO objective beside the final mission.** The current author guide says obtain five Hexes and unleash the Malediction; the public archived script specifically checks the named final set-piece battle. Keep that distinction visible.
- **Make a separate pre-finale save.** Replenish, equip important characters, prepare Incantations and ensure the army is the one you intend to send. Quest autoresolve is optional and its script credit is not guaranteed by its button.
- **Win the required battle and inspect the campaign.** Mark the battle complete only after the game does. Check whether VCO awards victory immediately or requests another visible step in your installed version.
- **Cast on the map only where the live objective requires it.** Do not manufacture a second mandatory trigger. The Malediction is the culmination of the campaign Hex chain, not a sixth ordinary Hex to assume is already unlocked, and a map cast is tracked separately only when the actual mission requests one. Keep an eligible target available until the award as a precaution. Confirm reward receipt separately.

::claim verify-in-campaign src=vco-guide-check,vco-missions-v516
The final Malediction trigger: the current guide's wording is broad ("unleash the Malediction of Ruin"), while the pinned v5.16.0 mission checks the final set-piece battle. The ledger deliberately does not silently add a required extra map cast: a map cast is tracked separately only when the actual mission requests one. Check the live final objective before preparing the finale.
::

The VCO Route I victory has been awarded in-game. Continue only because another route or a new story interests you.

## Territory policy

Keep an economic heartland and whatever staging territory supports your next operation. Expand beyond it when threats or income justify it; there is no fixed province ceiling and no reward for idle isolation.

- **The economic heartland is the funded base.** Farm/market income, the tier-3 Silent Grove forest recruitment and the Hut's passive Essence anchor it; the tier-5 Haunted Forest and spirit recruitment follow once the army is funded. Most settlements pay the bills; only a few carry dedicated roles (Settlements & economy).
- **Staging territory serves the next operation.** A defensible province, a forward recruiting point or a recovered base is a means to reach the next Hex quest or the finale, not a quota of provinces to hold. Territory is a means to finance and protect the ritual work, not a finish line — do not convert this policy into a fixed province count.
- **Make Devotion a deliberate part of the economy.** Building and preserving provincial Devotion can make an unsuitable holding workable and funds eligible invocations; the thresholds in the flagged note below are archive- and rework-sourced, not verified in-campaign. Weigh the before-and-after balance before spending from a high-Devotion province.

::claim verify-in-campaign src=patch61
The shared Devotion thresholds this guide recommends around are archive- and 6.1-rework-sourced, not verified in-campaign: at least 50 Devotion permits an eligible invocation in owned territory, 75+ Devotion negates climate penalties, and −100 Devotion triggers a Chaos incursion. Known: the archive's stated values and the rework notes. Unknown: the live tooltips, costs and trip points in the installed build. Check: read the province Devotion trend and the invocation panel before heavy investment, then confirm the after-cost balance still protects a wounded army. Fallback: treat dropping below 75 while an army needs recovery as the red line until a live tooltip contradicts it.
::

## Diplomacy

Keep useful neighbours peaceful. Seek contacts or alliances that help security, trade or trinket access. Khatep is not a mandatory target on this route; do not turn the six-target Route III list into an opening war plan.

- **Keep the default Naggaroth posture around Bleak Hold Fortress / Volksgrad.** The Hut can stand at either location, one active location at a time, and neither is a VCO requirement. Do not march an army back to Naggaroth solely because an old vanilla guide mentions the landmark.
- **Treat the Plesk homecoming as a setting choice, not an advantage.** If you take the early relocation, establish the Eastern Oblast position and negotiate with nearby Kislev factions — and protect the opening army, because Creative Assembly describes Plesk as the harder start.
- **Make diplomacy serve the ritual, not the atlas's other checklists.** Contacts and alliances that improve trinket access, trade or security are useful; unrelated wars and the Route III target list are not part of this route's conditions.

## Transition → route-2

Keep the Hut, veteran casters and forest recruitment. Leave a home response force, scout the current Lustrian candidate owners and verify the ingredient quotas. Jinxed Land may shorten travel to a valid magical forest, but it does not directly deliver every collecting station. Begin with a defensible northern cluster rather than declaring three regional wars at once.

## Transition → route-3

Keep the ritual host as the specialist main army. Add a more conventional Druzhina frontier army and regional recruitment, then inspect which of the six required factions still survive. Earlier valid settlement actions may already be credited; use the live 32-settlement counter instead of assuming it resets. Build the realm needed to sustain the northern war.
