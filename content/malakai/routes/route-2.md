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
panelOrder:
  armies: []
  skills: [malakai-route-2, lord-route-2, engineer, gotrek, felix, runesmith, thane]
  research: []
  buildings: []
  mechanics: []
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Transition → route-1"
  - "Transition → route-3"
---

## Opening

**Registration draft — this route is not yet complete.** This drawer carries the route's archive-identified context and start orientation only. The full route plan (Early → Mid, Mid → Late, Victory push), territory policy, diplomacy, the reference panels, and both continuation bodies are declared gaps below and land with later packages. Do not mistake the empty panels or gap markers for absence of guidance.

The archive frames Route II as The Seven-Fortress Expedition: a Slayer-engineer expedition into hostile territory, won through a sequence of supported strikes rather than by administering every settlement along the way. The route identity in its own words: Slayer shock troops, paired axe machines and a siege-capable escort, with a viable recovery chain as the bottleneck. Seven credited sites — not all twelve listed fortresses, and not merely sacking one location — are what the archive's catalogue claims; the recovery chain and launch base are the operational spine.

::claim verify-in-campaign src=vco-guide
The archive retains “The Seven-Fortress Expedition” as the guide-created route subtitle; the official VCO title is unresearched at registration and the manifest keeps vcoTitle null. Compare the installed route panel before treating any title as installed proof.
::

::claim verify-in-campaign src=vco-guide,vco-guide-check,vco-script
The author's guide publishes the same seven-of-twelve rule over the same twelve fortresses as the archive, so the sites below are sourced; the archive's cautions stand — not every Dark Fortress is eligible, repeated sacks of one location do not farm the mission, and a battle against its lord is not proof of credit. The exact credit rule and trigger timing remain unverified: the current public VCO repository (checked 8 October 2026) contains no Malakai mission script, so verify credit on the first fortress before planning the whole expedition around one interpretation.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Malakai matchup benchmark. Follow its casualty-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the expedition's only answer to a large target, recover, reinforce, or fight manually.
::
