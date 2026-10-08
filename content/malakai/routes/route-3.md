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
panelOrder:
  armies: []
  skills: [malakai-route-3, lord-route-3, engineer, gotrek, felix, runesmith, thane]
  research: [route-route-3, opening, gunline, air, economy, slayers]
  buildings: []
  mechanics: []
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**Registration draft — this route is not yet complete.** This drawer carries the route's archive-identified context and start orientation only. The full route plan (Early → Mid, Mid → Late, Victory push), territory policy, diplomacy, the reference panels, and both continuation bodies are declared gaps below and land with later packages. Do not mistake the empty panels or gap markers for absence of guidance.

The archive frames Route III as The Empire-Relief Expedition: a travelling workshop answering a coalition's crises, using diplomacy to secure the two required cities and fighting connected campaigns against the named threats, keeping useful conquests rather than all conquests. The route identity in its own words: the famous companions, Slayer crew, mixed artillery and escort airships as a self-sufficient relief column with a reliable reserve. The repository is the Empire's southern and central front — Altdorf and Nuln — where the archive's own wording distinguishes direct control from qualifying diplomacy.

::claim verify-in-campaign src=vco-guide
The archive retains “The Empire-Relief Expedition” as the guide-created route subtitle; the official VCO title is unresearched at registration and the manifest keeps vcoTitle null. Compare the installed route panel before treating any title as installed proof.
::

::claim verify-in-campaign src=vco-guide,vco-guide-check,vco-script
The author's guide publishes the same nine-faction and Altdorf/Nuln set as the archive, so the condition rows are sourced; the archive's cautions stand — a wounded enemy lord does not mean its faction is gone, and friendly city owners are not attacked simply for their objective markers. Which diplomacy the live mission recognises for the two cities remains unverified: the guide says \"directly or via diplomacy\" and the archive prefers a military alliance, but no opened source defines the qualifying treaty and the current public VCO repository (checked 8 October 2026) contains no Malakai mission script. Inspect the live mission after the first proposed alliance before committing the route to a diplomatic plan.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Malakai matchup benchmark. Follow its casualty-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the relief column's only answer to a major threat, recover, reinforce, or fight manually.
::
