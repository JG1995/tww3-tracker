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
panelOrder:
  armies: []
  skills: [mother-route-1, druzhina, patriarch, hag, ataman, shadows]
  research: [route-route-1, opening, forest, expedition, later]
  buildings: [hub, hut, income, recovery, resource, frontier, temporary]
  mechanics: []
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Registration draft — this route is not yet complete.** This drawer carries the route's archive-identified context and start orientation only. The full route plan (Early → Mid, Mid → Late, Victory push), territory policy, diplomacy, the reference panels, and both continuation bodies are declared gaps below and land with later packages. Do not mistake the empty panels or gap markers for absence of guidance.

The archive frames Route I as The Malediction of Ruin: a ritual campaign where a safe Naggaroth base and an active coven carry the witchcraft progression — the five campaign Hexes and the Malediction ritual — while territory pays for and protects the work. The opening sequence in its own words: stay in Naggaroth by default and finish the starting war, recruit humans around your starting creatures for an affordable early muster, build income to the tier-3 forest milestone and plan the Hut in its valid location, and begin a purposeful crafting habit that advances your live Essence-spending objective.

::claim confirmed src=vco-names-check
The route's official VCO title is verified from the pinned English localisation (v5.16.0): the displayed string is "Route I - The Malediction of Ruin". The manifest's vcoTitle now holds the verified official title; the installed route panel has not been compared, and the pinned localisation does not certify the player's installed build.
::

::claim verify-in-campaign src=vco-guide-check,vco-missions-v516
The final Malediction trigger: the current guide's wording is broad ("unleash the Malediction of Ruin"), while the pinned v5.16.0 mission checks the final set-piece battle. The ledger deliberately does not silently add a required extra map cast: a map cast is tracked separately only when the actual mission requests one. Check the live final objective before preparing the finale.
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

::claim verify-in-campaign src=patch61
The shared Devotion thresholds this guide recommends around are archive- and 6.1-rework-sourced, not verified in-campaign: at least 50 Devotion permits an eligible invocation in owned territory, 75+ Devotion negates climate penalties, and −100 Devotion triggers a Chaos incursion. Known: the archive's stated values and the rework notes. Unknown: the live tooltips, costs and trip points in the installed build. Check: read the province Devotion trend and the invocation panel before heavy investment, then confirm the after-cost balance still protects a wounded army. Fallback: treat dropping below 75 while an army needs recovery as the red line until a live tooltip contradicts it.
::

::claim verify-in-campaign src=essence,tech,hex-guide
The Hex chain's spending progression is not an Essence wallet total: research may cost Essence without adding equal credit to a Hex-spending objective, a cheaper Hex need not generate extra progress, and a treasury total does not by itself prove a Hex mission complete. These are the archive's own cautions plus player observations; the live credit rule is unverified. Check: record wallet and mission counter, perform one useful action, and read how much the counter moved before mass-producing anything. Fallback: keep a reserve and treat unobserved credit as zero until the mission panel shows otherwise.
::
