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
  skills: [alith, princess, field-noble, agent-noble, shadow-caster, mist-mage, life-mage, light-mage]
  research: [opening, hunt, industry, agents]
  buildings: [hub, income, resource, frontier, occupation]
  mechanics: [shadow, marks, hand, influence, patrons, rites]
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

**PARTIAL — not a usable campaign plan.** Shared fundamentals and the VCO contract are available, but route phases, territory policy, diplomacy, reference selections, and transitions remain incomplete. Do not use this partial Opening as a full campaign plan.

::claim verify-in-campaign src=vco,vco-names
The archive retains “Shadows Over Naggaroth” as a thematic subtitle. Historical public localization at commit 0319bd67e58503b0ff6ca00ff4fee7e9e208020d contains that Route I title, but the author checklist retrieved on 2026-10-06 labels the section only Route I and gives no applicable VCO build. Keep the official-title marker unresearched until you compare the installed route panel. This atlas does not read a save: a planning tick is not mission credit, so record game progress only after observing the live objective change.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve but supplies no specific installed mod build, formula, or Alith matchup benchmark. It is unknown whether a displayed result leaves a particular force able to survive retaliation. Check the installed mod details and casualty preview against the post-battle roster in a representative fight; if the predicted losses leave the army unsafe, fight manually, recover, or reinforce instead of treating the verdict as proof of a favourable result.
::

::claim verify-in-campaign src=flc,tides
The archive's access notes assume all WH3 DLC and WH1/WH2 free content, identify Shadow-walkers as Alith's free unit, and treat WH3 naval units as optional; the cited archive annotations were not independently rechecked here. Current unit access and recruitment gates are unknown for the player's installation. Check the live unit roster and recruitment panel before planning a force or its cost. If a unit is unavailable, use an accessible base High Elf screen and ranged core; do not assume paid older-game units or Aislinn's exclusive campaign systems.
::

::claim verify-in-campaign src=build-info,industry,order,camp,workshop,archive,court2,anlec
The archive's budget and tier guidance relies on annotated data including a Patch 9.0 lead, not a verified installed patch. Current building tiers, prices, upkeep modifiers, and the cost of an additional army are unknown. Check the treasury, net income after existing upkeep, actual added upkeep, current building panel, and recruitment/construction costs before committing; retain a recovery reserve and do not count future loot or post-victory rewards as recurring income. If the live budget cannot cover the force without consuming that reserve, delay the upgrade or recruit in smaller batches.
::

::claim verify-in-campaign src=rite-ui,hand
The archive's cited 9.0 UI note says the one-use Hand is summoned near Alith, not at the starting capital. Its location and travel limits have not been checked in the player's current game or mod. Inspect the summon preview before relying on it for a distant target; if the displayed location or route is unsafe, move Alith into reach first or use another available agent or army.
::
