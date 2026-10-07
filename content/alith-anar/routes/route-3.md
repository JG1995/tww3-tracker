---
id: route-3
number: III
name: The Eternal War
vcoTitle: null
objective:
  text: "The author checklist has three separate requirements: build the Black Citadel of Anlec; make at least 25 successful assassination attempts; and wound Malekith, Morathi, Crone Hellebron, Malus Darkblade, Rakarth, and Lokhir Fellheart. Historical public 5.16.0 code separately encodes a Nagarythe landmark, an ASSASSINATE_X_CHARACTERS total of 25, and six wounded-character conditions. Current action credit, target mapping, and whether wounds latch or must overlap are unverified. Check one ordinary successful Assassinate against the live counter and one named lord's wound flag; track all three objective tracks separately and keep every still-required wound open until live persistence is clear."
  state: verify-in-campaign
  src: [vco, vco-script]
reward:
  text: "The author checklist lists -50% Intrigue-at-Court cost, +50% research rate, and +50 Growth. Historical public 5.16.0 effect data places Intrigue and research at faction scope and Growth at province scope; the current grant, scope, and timing are unverified. Inspect the victory panel and each effect tooltip after award; do not assume Growth is faction-wide or rely on the bonuses before they appear."
  state: verify-in-campaign
  src: [vco, vco-script, vco-effects]
panelOrder:
  armies: []
  skills: [alith, princess, field-noble, agent-noble, shadow-caster, mist-mage, life-mage, light-mage]
  research: []
  buildings: []
  mechanics: []
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Territory policy"
  - "Diplomacy"
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**PARTIAL — not a usable campaign plan.** Route phases, territory policy, diplomacy, and transitions remain unmigrated; this package records only the VCO contract and its limits.

::claim verify-in-campaign src=vco,vco-names
The archive retains “The Eternal War” as a thematic subtitle. Historical public localization at commit 0319bd67e58503b0ff6ca00ff4fee7e9e208020d contains that Route III title, but the author checklist retrieved on 2026-10-06 labels the section only Route III and gives no applicable VCO build. Keep the official-title marker unresearched until you compare the installed route panel. This atlas does not read a save: a planning tick is not mission credit, so record game progress only after observing the live objective change.
::
