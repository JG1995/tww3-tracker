---
id: route-2
number: II
name: In The Pale Moonlight
vcoTitle: null
objective:
  text: "The author checklist says to search for the Amulet of Sunfire by securing listed candidates through conquest or diplomacy; it names eight and publishes no quota. Historical public 5.16.0 code separately has a seven-of-eight regional-control proxy; that historical counter is not proof of the installed relic-search or credit rule. Compare the live objective before and after the first eligible capture or treaty, then repeat only an action shown to credit. Follow differing live wording; do not treat every candidate as a mandatory conquest."
  state: verify-in-campaign
  src: [vco, vco-script]
reward:
  text: "The author checklist lists a custom item, +25% magic-item drop chance, +10% post-battle loot, +10% Ward Save for the faction leader, and Strider for the faction leader. Historical public 5.16.0 data declares an ancillary and matching faction/leader effect rows, but the installed reward, exact scope, and timing are unverified. Inspect the victory/reward panel and item/effect tooltips after completion; a generic item drop is not proof of the route reward."
  state: verify-in-campaign
  src: [vco, vco-script, vco-effects]
panelOrder:
  armies: []
  skills: [alith, princess, field-noble, agent-noble, shadow-caster, mist-mage, life-mage, light-mage]
  research: [opening, hunt-route-2, industry, agents]
  buildings: [hub, income, port, resource, frontier, temporary]
  mechanics: [shadow, marks, hand, influence, patrons, rites]
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Territory policy"
  - "Diplomacy"
  - "Transition → route-1"
  - "Transition → route-3"
---

## Opening

**PARTIAL — not a usable campaign plan.** Route phases, territory policy, diplomacy, and transitions remain unmigrated; this package records only the VCO contract and its limits.

::claim verify-in-campaign src=vco,vco-names
The archive retains “In The Pale Moonlight” as a thematic subtitle. Historical public localization at commit 0319bd67e58503b0ff6ca00ff4fee7e9e208020d contains that Route II title, but the author checklist retrieved on 2026-10-06 labels the section only Route II and gives no applicable VCO build. Keep the official-title marker unresearched until you compare the installed route panel. This atlas does not read a save: a planning tick is not mission credit, so record game progress only after observing the live objective change.
::
