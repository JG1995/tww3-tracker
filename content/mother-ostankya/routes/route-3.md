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
panelOrder:
  armies: []
  skills: []
  research: []
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

The archive frames Route III as The New Frontier: a pact between the frontier communities and the forest — a stronger human escort, Akshina hunters and a select group of monstrous allies — that secures the southern and coastal dangers, builds a self-supporting frontier, then campaigns north against the surviving major powers. The route identity in its own words: the 32-settlement goal counts qualifying actions at different locations rather than 32 settlements owned simultaneously, and the six named New World factions are the required targets — but the archive warns against opening all six wars at once and against chasing an exact settlement count while a surviving target rebuilds behind you.

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
