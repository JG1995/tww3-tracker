---
id: route-3
number: III
name: "Four provinces and three factions"
vcoTitle: "Don't Tread on Ming"
objective:
  text: "The VCO author's Immortal Empires checklist, read 2026-10-06, names Gnoblar Country, Ivory Road, Mountains of Mourn, and Bone Road, plus Caravan of Blue Roses, the Legion of Azgorh, and Poxmakers of Nurgle. The published faction list omits an action verb; the pinned v5.16.0 mission uses CONTROL_N_PROVINCES_INCLUDING (total 4) and DESTROY_FACTION with confederation_valid. Those historical predicates are not verified in the installed build."
  state: confirmed
  src: [vco, vco-script]
reward:
  text: "Published reward: maximum Caravan cargo capacity +100% and income from trade tariffs +60%. The live grant, timing, and installed-build scope have not been tested."
  state: confirmed
  src: [vco]
bottleneck: "Four named provinces and three faction-level targets; province control, faction defeat, and character wounds are distinct conditions."
panelOrder:
  armies: []
  skills: [zhao-route-3, celestial-general, alchemist, gate-master, caravan-master, astromancer, yin-shugengan]
  research: [opening, road, arsenal, realm]
  buildings: [shang-route-3, muster, frontier, occupied, resource, depot, income, raid]
  mechanics: [caravans, compass, harmony, alchemy, ogres, govern]
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

**PARTIAL — objective contract only, not a tested campaign route.** The author checklist names four provinces and three factions; the historical mission gives them control and destruction predicates, but the live control rules remain unknown. No conquest chronology or Smart Autoresolve-tested army is supplied. The declared plan gaps stay visible; your active VCO panel takes precedence.

::claim historical src=vco-script,vco-listener-general,vco-names
Pinned English localization names the official Immortal Empires route Don't Tread on Ming; “Four provinces and three factions” is the separate guide-created subtitle. In pinned public VCO v5.16.0, the mission uses `CONTROL_N_PROVINCES_INCLUDING` with total 4 for those provinces and `DESTROY_FACTION` for the three listed factions with `confederation_valid`. The same historical mission contains a scripted Black Fortress text objective using `vco_dummy`; the generic listener completes human-faction dummy objectives at FactionTurnStart. It is therefore not a separate Black Fortress battle condition in that source. This does not establish current-build behavior.
::

::claim verify-in-campaign src=vco,vco-script
The author guide lists the four provinces and three faction names, but its extracted faction list has no action verb. In your save, verify each province row and each faction row separately. The old `confederation_valid` flag is not an alliance objective: do not treat an alliance, one town, a defeated army, or a wounded faction leader as proof of province control or faction defeat. Until the live panel proves otherwise, use direct control of every region in a named province and wait for explicit credit after destroying a target faction. The older Black Fortress dummy is absent from the current author checklist; do not add it unless your active objective panel requires it.
::

::claim verify-in-campaign src=vco
The published +100% maximum caravan cargo capacity and +60% trade-tariff income are route rewards, not resources for the opening. Do not budget either bonus before victory; confirm its actual application in the installed build only after the route completes.
::
