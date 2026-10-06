---
id: route-1
number: I
name: Shadows Over Naggaroth
vcoTitle: null
objective:
  text: "The author checklist requires destruction of the Naggarond faction and control of all six named settlements: Naggarond, Hag Graef, Clar Karond, Ghrond, Har Ganeth, and Karond Kar. Historical public 5.16.0 code separately encoded faction destruction and a six-of-six regional-control condition. Current credit timing, qualifying ownership, and whether control must persist are unverified; compare both live indicators and retain direct control of all six through the victory check if the panel does not clarify."
  state: verify-in-campaign
  src: [vco, vco-script]
reward:
  text: "The author checklist lists a custom item, +15% missile strength for Shadow Warriors and Shadow Walkers, +20% hero action success chance, +15% ambush success chance, and +5 melee attack during ambushes. Historical public 5.16.0 effect data has matching faction/force and agent-effect rows, but the installed grant, applicability, scope, and timing are unverified. After victory, inspect the reward panel and item/effect tooltips; do not plan on receiving or applying these bonuses before they appear."
  state: verify-in-campaign
  src: [vco, vco-script, vco-effects]
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
  - "Territory policy"
  - "Diplomacy"
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**PARTIAL — not a usable campaign plan.** Route phases, territory policy, diplomacy, and transitions remain unmigrated; this package records only the VCO contract and its limits.

::claim verify-in-campaign src=vco,vco-names
The archive retains “Shadows Over Naggaroth” as a thematic subtitle. Historical public localization at commit 0319bd67e58503b0ff6ca00ff4fee7e9e208020d contains that Route I title, but the author checklist retrieved on 2026-10-06 labels the section only Route I and gives no applicable VCO build. Keep the official-title marker unresearched until you compare the installed route panel. This atlas does not read a save: a planning tick is not mission credit, so record game progress only after observing the live objective change.
::
