---
id: route-1
number: I
name: "Trade, caravans, and the Great Embassy"
vcoTitle: "The Silver Tongue"
objective:
  text: "The VCO author's Immortal Empires checklist, read 2026-10-06, lists four separate targets: gross income of 25,000; 9 completed caravan runs; at least 13,140 goods traded with the west; and construction of the Great Embassy. This is published wording, not a verified live trigger."
  state: confirmed
  src: [vco, vco-listener, vco-script]
reward:
  text: "Published reward: Allegiance points gained +40%, and diplomatic relations +40 with High Elves, Bretonnia, Dwarfs, and the Empire. The live grant, timing, and installed-build application have not been tested."
  state: confirmed
  src: [vco]
bottleneck: "Three independent economic counters plus a landmark; caravan completions and goods moved are not interchangeable."
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

**PARTIAL — objective contract only, not a tested campaign route.** The sources establish the published targets and some historical implementation details, not an opening sequence, economy plan, or Smart Autoresolve-tested army. The declared gaps remain unwritten; use the VCO objective panel in your active save as the authority for live progress.

::claim historical src=vco-script,vco-listener,vco-names
Pinned English localization names the official Immortal Empires route The Silver Tongue; “Trade, caravans, and the Great Embassy” is the separate guide-created subtitle. Pinned public VCO v5.16.0 source (2024-02-29) names a 25,000 gross-income threshold and compares `faction:income()` at human FactionTurnStart. It checks separate saved counters for 9 completed caravans and 13,140 goods at FactionTurnEnd. Its mission separately requires constructing The Great Embassy in the Warpstone Desert. This is historical source behavior, not a guarantee about a current installation; the listener alone does not establish whether its goods counter filters for the guide's “with the west” wording.
::

::claim verify-in-campaign src=vco,vco-listener
On your active save, watch all four objective rows independently. Verify which income display the 25,000 line uses and when it credits; keep headroom above the threshold rather than inferring progress from net treasury change. Check the goods line after a qualifying western delivery and do not assume one completed caravan contributes a fixed goods amount. A caravan return, the goods counter, and the income counter are separate evidence; if timing differs, continue until the live panel explicitly credits each line.
::

::claim verify-in-campaign src=vco,vco-script
The Great Embassy is the Route I landmark, not House of Secrets. The historical mission names the Embassy building in Warpstone Desert; the active save's objective panel determines when construction is credited. All four targets must be completed before the route reward: do not count the published Allegiance or diplomacy bonuses in the opening budget. Check the reward's actual scope only after route victory.
::
