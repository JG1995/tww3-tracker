---
id: route-1
number: I
name: Shadows Over Naggaroth
vcoTitle: null
motto: From hidden raids to a war of reconquest.
objective:
  text: "The author checklist requires destruction of the Naggarond faction and control of all six named settlements: Naggarond, Hag Graef, Clar Karond, Ghrond, Har Ganeth, and Karond Kar. Historical public 5.16.0 code separately encoded faction destruction and a six-of-six regional-control condition. Current credit timing, qualifying ownership, and whether control must persist are unverified; compare both live indicators and retain direct control of all six through the victory check if the panel does not clarify."
  state: verify-in-campaign
  src: [vco, vco-script]
reward:
  text: "The author checklist lists a custom item, +15% missile strength for Shadow Warriors and Shadow Walkers, +20% hero action success chance, +15% ambush success chance, and +5 melee attack during ambushes. Historical public 5.16.0 effect data has matching faction/force and agent-effect rows, but the installed grant, applicability, scope, and timing are unverified. After victory, inspect the reward panel and item/effect tooltips; do not plan on receiving or applying these bonuses before they appear."
  state: verify-in-campaign
  src: [vco, vco-script, vco-effects]
interpretation: A territorial campaign against the Witch King: the shadow company wins field engagements while a growing network of held cities supplies the occupation. Alith turns his punitive host from hidden raids into a war of reconquest.
bottleneck: "Taking the cities is only half the work: they must remain qualifying, and Naggarond can survive outside its namesake capital."
phases:
  - { title: "Establish the black-fletched company", note: "Win the local war from The Monoliths without spending every coin on elite replacements." }
  - { title: "Turn the first city into a launch point", note: "Take the reachable city objective that improves access rather than blindly marching towards the most famous name." }
  - { title: "Break the Witch King’s northern network", note: "Maintain pressure while the economy catches up with the front." }
  - { title: "Secure the six cities as one operation", note: "A strong army is useful only if the required territory remains in your hands." }
  - { title: "Audit the control and destruction conditions", note: "Finish the actual route, not a self-imposed map-painting target." }
panelOrder:
  armies: [early, mid, late, specialist, home]
  skills: [alith, princess, field-noble, agent-noble, shadow-caster, mist-mage, life-mage, light-mage]
  research: [opening, hunt, industry, agents]
  buildings: [hub, income, resource, frontier, occupation]
  mechanics: [shadow, marks, hand, influence, patrons, rites]
gaps:
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Establish the black-fletched company**

Win the local war from The Monoliths without spending every coin on elite replacements.

This is the punitive host: the clearest choice for a broad military campaign without making a rigid schedule for every siege. A black-fletched core of Shadow-walkers supported by shielded troops, White Lions or Swordmasters, Eagle Claws and a restrained elite reserve wins field engagements while a growing network of held cities supplies the occupation.

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

- **Finish the starting enemy, then reassess.** Scout the displayed initial opponent's armies and secure the nearby settlements of Granite Hills when the campaign permits. Keep your useful starting troops. Do not assume an old Arnheim or Vortex turn-by-turn script describes this start.
- **Spend in a useful sequence.** Keep basic Militia access; put growth into the province; reach tier two for Aesanar Camp. The Opening research queue builds this first army's foundation — you do not need to complete every later branch before pursuing the route. Add walkers in small batches and retain cheap archers and spears until the economy supports replacements. An Elven Workshop provides the first Eagle Claw before an expensive high-tier siege programme.
- **Build an intelligence picture.** Locate the owners of Karond Kar and Clar Karond and the closest approach towards the northern city objectives. Speak to encountered friendly factions. A border pact or useful trade agreement can remove an entire direction of uncertainty.
- **Begin using the faction, not only its units.** Check Stalking attacks and terrain-path exits before each commitment. Use a mark that advances the current operation; a faraway mark is not a reason to abandon the first province.

Move on when the main army can fight again after replenishing, your home province has an income/growth plan, and the next war is chosen from the actual map.

## Early → Mid

**Turn the first city into a launch point**

Take the reachable city objective that improves access rather than blindly marching towards the most famous name.

- **Choose the nearest useful city objective.** Karond Kar or Clar Karond can be useful first ports/hubs when your borders and current enemies make them accessible. If another named city is the clearly safer opportunity, take it instead. The checklist matters more than a prescribed order.
- **Separate the attack from the occupation.** Alith destroys or bypasses dangerous field armies where an ambush is possible. A small conventional force follows to replenish, protect fresh captures and dissuade opportunistic raids. Do not create a second premium twenty-stack merely to stand behind him.
- **Keep an armour-piercing answer.** When fighting armoured Dark Elves, add reliable support rather than assuming poison bows replace armour penetration. One or two Eagle Claws and a controlled melee reserve make the mixed force less brittle.
- **Make the new city usable.** Occupy, repair, stabilise Control and give it income and replenishment. Do not burn down an objective or spend all its conquest proceeds on buildings you will not recruit from.

Move on when one named city is safely qualifying, your rear can respond to a raid, and you can afford the next push without abandoning construction entirely.

**Break the Witch King’s northern network**

Maintain pressure while the economy catches up with the front.

- **Plan the Hag Graef–Naggarond campaign.** Scout both city garrisons, supporting armies and intervening movement before committing. Win a favourable field engagement, recover, then capture the recruitment/economic centres rather than chase Malekith endlessly around them.
- **Promote one forward production site.** Use the capital with the best existing tier and position. Keep an Aesanar Camp for walkers, a Workshop for bolts and the caster/infantry recruitment actually required. Do not duplicate every branch in all cities.
- **Support the hunter with a holding army.** A Princess-led spear/Sea Guard and bow army can keep Alith moving. Expand it into a full field army only when two active fronts require it and recurring income can support the expense.
- **Invest politically for sustained pressure.** Tiranoc upkeep support and a relevant replenishment patronage are useful when available. Time Isha around recovery and Asuryan around a genuine building programme. Save enough Influence for characters and a useful agreement.

Move on when the northern offensive has a secure replacement base and the loss of one minor settlement will not force Alith to march all the way home.

Point the support the same way: keep six or so walkers as the identity but add a credible siege and holding element, and let a second conventional army secure cities while Alith hunts field forces. The agent build is optional intelligence and opportunistic actions — do not let the agent budget replace the main military objective. Funded recovery is the rule while the economy catches up with the front: first war hub → productive recovery provinces → one forward production capital, with replacements paid from recurring income and a reserve rather than from the proceeds of the next siege.

## Mid → Late

**Secure the six cities as one operation**

A strong army is useful only if the required territory remains in your hands.

- **Complete Ghrond and Har Ganeth deliberately.** Check whether their current owners are your existing enemy, a separate major power or a friendly controller. Fight or negotiate the specific requirement rather than opening every conceivable northern war at once.
- **Hunt the remaining Naggarond faction.** After taking its capital, use diplomacy and scouting to identify remaining settlements and armies. A surviving port, remote province or confederated holding can keep the destruction objective incomplete.
- **Upgrade for repeated campaigns, not novelty.** The late roster adds a modest heavy escort and one valuable flying reserve around the walkers. Improve tired units in batches. Keep income for replacement heroes and emergency defence.
- **Protect the occupation spine.** Secure exposed ports and keep a response army in the area with the next likely incursion. A high-tier city can still fall when the main army departs and its garrison has not recovered.

Occupied-city and Frontier settlement roles become more important as the six objectives are taken; pick one regional recruitment capital and keep the connected productive core earning. Keep the selected mechanics pointed the same way: stalking and forward camps first, Tiranoc/recovery patronage and well-timed rites keep the army active, and marks are useful side work — not a reason to leave the cities undefended.

Move on when all six cities are presently qualifying or have one clearly planned final action, and you know what is keeping Naggarond alive.

## Victory push

**Audit the control and destruction conditions**

Finish the actual route, not a self-imposed map-painting target.

- **Check the six live city indicators.** Confirm Naggarond, Hag Graef, Clar Karond, Ghrond, Har Ganeth and Karond Kar individually. Diplomatic control is only accepted when your mission says so; the atlas defaults to direct retention.
- **Confirm faction destruction.** Malekith’s wound state and Naggarond’s destruction are different things. Check the faction objective after the last relevant operation.
- **Let the mission process the result.** Keep a manual save before the final action. Check the reward/victory panel after battle or the relevant turn transition. Do not sell the objective city before it registers.
- **Choose the epilogue, not more chores.** Stop with the victory or transition into the relic hunt or the Eternal War. Existing holdings and experienced walkers are assets, not mistakes that have to be undone.

Victory is proven when the game has explicitly awarded the route; objective observations and actual reward receipt are recorded separately. Do not plan on the published shadow-troop, ambush, hero-action or custom-item bonuses before they appear in the reward panel.

## Territory policy

Keep a connected productive core and the required cities. Add regional recovery and a second recruitment hub as the front moves; hold a wider realm when it supplies and protects the objectives, not as an end in itself. Occupy, repair, stabilise Control and retain every required city — a required city razed or handed away does not qualify. Ownership changes on the actual map: Clar Karond, Karond Kar, Ghrond and Har Ganeth can have different owners by the time you arrive, and the city checklist, not the initial ruler, decides which war or agreement is relevant. Treat Naggarond elimination separately from the six retained qualifying cities: a surviving port, remote province or confederated holding can keep the destruction objective incomplete, while a destroyed faction is not proof that every city still qualifies. Improve, recover and defend what the front actually uses, and convert redundant military buildings into income or Influence only when the next line is genuinely secure.

## Diplomacy

Keep useful High Elf and other Order partners out of your rear. Work with the Sisters of Twilight when relations and objectives allow. A city’s current owner matters more than its starting faction: peace, trade or alliance with the controller of a required city can finish that objective cheaper than another northern war. Confirm which treaty type your live VCO panel accepts before relying on diplomatic control — the atlas defaults to direct retention. Track confederation and respawn state, because a newly confederated holder or vassal can keep the Naggarond faction alive after its namesake capital falls.

## Transition → route-2

Your established northern cities and veteran company make the first search groups cheaper. Inspect the eight candidate credits, retain a northern guard, and redirect Alith through the missing middle and southern sites. Add a coastal support element only during normal replacements; no need to scrap the punitive host. Keep the connected core, research progress and Influence base you built for the conquest — the relic hunt needs the standing army and its economy as much as the new expedition.

## Transition → route-3

Your control of Naggaroth helps locate the nearby named lords, but it does not replace Anlec or the 25 successful agent actions. Start the Ulthuan growth project and detached Nobles immediately, then use existing ports to support the distant hunts. Check whether already-destroyed or recovered targets have credited the live mission; a settled or wounded check is not proof of current credit.
