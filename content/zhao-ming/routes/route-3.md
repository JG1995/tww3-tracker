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
phases:
  - { title: "Secure the Cathayan launch base", note: "Win the local war and make the rear safe enough for a western campaign." }
  - { title: "Break the nearest threat and build a foothold", note: "Fight far enough to secure a viable frontier, then consolidate it." }
  - { title: "Turn the pass network into complete provinces", note: "Move from an advancing spearhead to a functioning western realm." }
  - { title: "Eliminate the three factions, not just their capitals", note: "Use parallel but supported operations to close the remaining threats." }
  - { title: "Secure the road and let the realm pay", note: "Finish the objective audit before beginning an unrelated war." }
panelOrder:
  armies: [early, mid, late, specialist, home]
  skills: [zhao-route-3, celestial-general, alchemist, gate-master, caravan-master, astromancer, yin-shugengan]
  research: [opening, road, arsenal, realm]
  buildings: [shang-route-3, muster, frontier, occupied, resource, depot, income, raid]
  mechanics: [caravans, compass, harmony, alchemy, ogres, govern]
gaps:
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**Secure the Cathayan launch base**

Win the local war and make the rear safe enough for a western campaign.

This is a regional territorial campaign, not a long economic counter race: a strong launch base, then multiple armies, replacement hubs and stable provinces secure the western routes and destroy the three required faction-level threats. The frontier host is a hard-wearing combined-arms force — Jade veterans become Celestial spear anchors, cannons and crossbows answer large armoured enemies, and Tigers or one Longma group provide the counterattack. The Early template (The Jinshen Company) is the destination when recruitment and budget arrive, not a turn-one shopping list; the Armies panel carries the full progression notes and manual doctrine.

- **Complete the Jinshen opening.** Secure Hanyu Port and the useful local settlements from the start at Qiang. Recruit a functional mixed army and develop income; you do not need every specialist before clearing the province.
- **Make Shang-Yang the next strategic centre.** Clear the real threat to a connected western base. Do not march through multiple hostile provinces with an undeveloped rear.
- **Start a prudent caravan programme.** The road helps pay for the war, but it does not replace the field army or automatically clear raiders from required provinces (Workshop panel: Ivory Road).
- **Scout the western political map.** Locate Ghorst and the actual owners of the four target provinces. Note Bhashiva rather than relying on a pre-expansion map.

The home corridor is stable and the first western target is a chosen operation rather than an accidental new front.

::claim historical src=vco-script,vco-listener-general,vco-names
Pinned English localization names the official Immortal Empires route Don't Tread on Ming; “Four provinces and three factions” is the separate guide-created subtitle. In pinned public VCO v5.16.0, the mission uses `CONTROL_N_PROVINCES_INCLUDING` with total 4 for those provinces and `DESTROY_FACTION` for the three listed factions with `confederation_valid`. The same historical mission contains a scripted Black Fortress text objective using `vco_dummy`; the generic listener completes human-faction dummy objectives at FactionTurnStart. It is therefore not a separate Black Fortress battle condition in that source. This does not establish current-build behavior.
::

::claim verify-in-campaign src=vco,vco-script
The author guide lists the four provinces and three faction names, but its extracted faction list has no action verb. In your save, verify each province row and each faction row separately. The old `confederation_valid` flag is not an alliance objective: do not treat an alliance, one town, a defeated army, or a wounded faction leader as proof of province control or faction defeat. Until the live panel proves otherwise, use direct control of every region in a named province and wait for explicit credit after destroying a target faction. The older Black Fortress dummy is absent from the current author checklist; do not add it unless your active objective panel requires it.
::

::claim verify-in-campaign src=vco
The published +100% maximum caravan cargo capacity and +60% trade-tariff income are route rewards, not resources for the opening. Do not budget either bonus before victory; confirm its actual application in the installed build only after the route completes.
::

## Early → Mid

**Break the nearest threat and build a foothold**

Fight far enough to secure a viable frontier, then consolidate it.

- **Address Caravan of Blue Roses when it threatens the approach.** Helman Ghorst’s faction is a named objective and often a practical first major western problem. Track the faction as well as the legendary lord: a wounded Ghorst is not proof that every army and settlement has been removed.
- **Fight with tools for mass and large threats.** Keep halberds and crossbows supported; use Zhao’s damage and armour debuffs deliberately. Do not let one monster chase strand the backline. Early Desert Armour and the army-supporting top line fit the melee frontier; Iron Scale helps Zhao intervene after Master of Metal (Skill panel: Zhao Ming · Route III).
- **Create a regional recovery stop.** Repair and stabilise a defensible foothold. Add income and basic replacements before another expensive specialist chain (Settlement panel: Muster hub, Recovery depot, Frontier).
- **Assess a second army.** Raise the actual force needed to cover home or finish scattered survivors. Upgrade it as the new provinces begin paying for it (Armies panel: Western provincial guard).

The first foothold can support a damaged army, and a counterattack will not force Zhao all the way back to the starting province.

## Mid → Late

**Turn the pass network into complete provinces**

Move from an advancing spearhead to a functioning western realm.

- **Audit every settlement in the four provinces.** Gnoblar Country, Ivory Road, Mountains of Mourn and Bone Road each need their full live mission requirement. Colouring a capital does not prove the province is done; verify every required settlement and the allowed control method in the live objective.
- **Resolve the Bone Road relationship.** Bhashiva or another useful neighbour may own necessary land. Check whether the objective accepts qualifying diplomatic control; otherwise pursue a legal ownership arrangement or make a deliberate strategic choice.
- **Build one western muster hub.** Give supporting armies local access to infantry, missiles and artillery. Separate its role from income towns and true border defences (Settlement panel: Muster hub).
- **Raise a Celestial-led second field army.** The General is the preferred stabilising commander (Bulwark of Wei-Jin) and holds and finishes western threats without the flagship’s personal bonuses while Zhao advances. The grounded Mountain Column is a valid lower-micro alternative to the Longma version (Armies panel: The Iron Frontier Host, Ground column).
- **Research for a western realm.** Recruitment speed, recurring income and casualty replacement support the corridor. Do not over-invest in a port-only branch while fighting inland unless it unlocks a useful caravan slot (Research panel: Realm).
- **Keep the front coherent.** Finish one connected threat before pushing both deep north and far south. Replenish, repair and remove corruption where it obstructs the next operation; use provincial Harmony and commandments to stabilise newly held land (Workshop panel: Harmony).

At least part of the target region is completely held and economically functional, with a second army able to operate independently.

## Victory push

**Eliminate the three factions, not just their capitals**

Use parallel but supported operations to close the remaining threats.

- **Finish Poxmakers of Nurgle.** Prepare the southern operation and watch for plague or replenishment disruption. A win with severe casualties is dangerous when the next step is a long recovery march; confirm the faction, not just one battle against Ku’gath Plaguefather.
- **Prepare for The Legion of Azgorh.** Use armour-piercing fire, protected anti-large troops and a reserve against the faction’s varied threats. Black Fortress is important, but the full faction-destruction flag is the requirement: taking Black Fortress alone does not prove Drazhoath’s faction is gone.
- **Track surviving settlements and armies.** Use diplomacy information and scouts to find leftovers from all three named factions. Do not assume a wounded legendary lord means faction destruction.
- **Lock down the province checklist.** Hold the required region while the strike armies finish factions. Support garrisons against raids instead of recapturing the same towns repeatedly.

The four provinces meet the live control condition and all three faction objectives show completed or have a known final target.

**Secure the road and let the realm pay**

Finish the objective audit before beginning an unrelated war.

- **Check the exact province and faction flags.** Separate the four territorial requirements from the three destruction requirements. The route does not substitute an aggregate settlement count for either condition.
- **Keep control through the award.** Do not hand off a province’s last town while the game is still processing the condition.
- **Use the commercial reward after it arrives.** The +100% cargo ceiling and +60% trade-tariff income arrive only after victory and still require money, escorts and completed journeys; a higher maximum does not instantly deliver goods.
- **Continue from strength.** A developed western realm is an excellent base for the economic route or the farther alchemical targets. Keep its holding armies and supply hubs functioning.

The game has awarded Route III and the new economic benefits are confirmed in your own campaign.

## Territory policy

Hold the four named provinces with functional income, Control and defence. Develop regional support as you expand: one developed Cathayan arsenal, then a western muster hub and genuinely defended frontier settlements. Recovered towns become income and resource contributors instead of permanent unfinished garrisons (Settlement panel: Shang-Yang · Route III, Muster hub, Frontier, New province). Keep valuable additional border or resource territory when it improves that realm; do not use an artificial province ceiling. Direct ownership is the planning baseline: military access, friendship or a non-aggression pact does not equal province control. Use another method only when your installed objective explicitly accepts it. Do not substitute the RoC Wyrm Pass / Ice Pass / Black Fortress list for the Immortal Empires objective.

## Diplomacy

Preserve a useful Cathayan rear and check the current western owners. Bhashiva’s Bone Road start makes negotiation or a later ownership arrangement strategically relevant; direct control is the safe baseline until the installed VCO panel explicitly permits another form. Do not assume every Ogre must be an enemy, or that a friend’s territory already counts: Ogre diplomacy is conditional on the province-control objective, not a blanket commitment (Workshop panel: Ogres & allies).

## Transition → route-1

The conquered region supplies the recurring-income base, and the route reward increases cargo capacity. Shift expenditure into profitable towns, resources and Shang-Yang’s tier-five Embassy; keep caravans rotating. Continue using the separate goods, runs and gross-income counters rather than assuming the territorial victory completed them (Research panel: Opening · Route I).

## Transition → route-2

The western realm is a strong launch platform for Crookback Mountain and Nagashizzar. Refit one army toward the Living Forge Expedition and the Siege train, leave the frontier defenders in place, and arrange the longer journey to Hell Pit, Mordheim and Skavenblight. Territory already held is support, not proof of credit for the five fixed sites (Armies panel: The Living Forge Expedition, The Warpstone Reclamation Train).
