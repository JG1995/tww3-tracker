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
phases:
  - { title: "Secure Jinshen; launch a careful first caravan", note: "Fight the local war and begin the separate trade clock without emptying the treasury." }
  - { title: "Make Shang-Yang the commercial headquarters", note: "Start the long development gate well before the final income push." }
  - { title: "Turn commercial reach into recurring revenue", note: "Add productive provinces and useful partners without losing control of the war budget." }
  - { title: "Finish the Embassy and close the two trade counters", note: "Stop spending on completed requirements while the others remain unfinished." }
  - { title: "Audit the four conditions and bank the result", note: "Finish deliberately instead of drifting into another continent's war." }
panelOrder:
  armies: [early, mid, late, specialist, home]
  skills: [zhao-route-1, celestial-general, alchemist, gate-master, caravan-master, astromancer, yin-shugengan]
  research: [opening-route-1, road, arsenal, realm]
  buildings: [shang-route-1, income, resource, muster, frontier, port, depot, occupied]
  mechanics: [caravans, compass, harmony, alchemy, ogres, govern]
gaps:
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Secure Jinshen; launch a careful first caravan**

Fight the local war and begin the separate trade clock without emptying the treasury.

Treat this as a commercial state-building campaign. Caravans fund investment and create connections; a productive homeland supplies the recurring gross income. Neither half replaces the other. The army is a defended trading power rather than a fragile gun parade: Jade-armoured regulars, a House of Secrets companion, a small western contingent and later a single aerial battery. The Early template (The Jinshen Company) is the destination when recruitment and budget arrive, not a turn-one shopping list; the Armies panel carries the full progression notes and manual doctrine.

- **Finish the immediate province war.** Begin from Qiang’s Immortal Empires position and secure Hanyu Port and the useful local settlements. Use starting troops and inexpensive recruits; do not wait for the final army table.
- **Set the first construction jobs.** Choose a basic recruitment site, income and growth. Plan the province’s building Harmony as a batch; avoid paying to duplicate military chains. Take the inexpensive troop foundations during the first wars, then move onto the caravan and province branches — do not rush six expensive military upgrades while Shang-Yang’s growth and safe dispatch capital wait (Research panel: Opening · Route I).
- **Dispatch with a reserve.** Inspect the master’s escort and a plausible safe destination. Commit a load you can lose without leaving the homeland unable to recruit or repair. The Ivory Road mechanic panel covers the funded first dispatch and destination choice; keep the treasury reserve and the delivered cargo separate numbers.
- **Keep useful treaties intact.** Check the Golden Order and Cathayan neighbours. Trade and access are useful; do not accept alliances without looking at their wars.

The local province is defensible, the army can replenish, and the first caravan is travelling without consuming the emergency reserve.

::claim historical src=vco-script,vco-listener,vco-names
Pinned English localization names the official Immortal Empires route The Silver Tongue; “Trade, caravans, and the Great Embassy” is the separate guide-created subtitle. Pinned public VCO v5.16.0 source (2024-02-29) names a 25,000 gross-income threshold and compares `faction:income()` at human FactionTurnStart. It checks separate saved counters for 9 completed caravans and 13,140 goods at FactionTurnEnd. Its mission separately requires constructing The Great Embassy in the Warpstone Desert. This is historical source behavior, not a guarantee about a current installation; the listener alone does not establish whether its goods counter filters for the guide's “with the west” wording.
::

::claim verify-in-campaign src=vco,vco-listener
On your active save, watch all four objective rows independently. Verify which income display the 25,000 line uses and when it credits; keep headroom above the threshold rather than inferring progress from net treasury change. Check the goods line after a qualifying western delivery and do not assume one completed caravan contributes a fixed goods amount. A caravan return, the goods counter, and the income counter are separate evidence; if timing differs, continue until the live panel explicitly credits each line.
::

::claim verify-in-campaign src=vco,vco-script
The Great Embassy is the Route I landmark, not House of Secrets. The historical mission names the Embassy building in Warpstone Desert; the active save's objective panel determines when construction is credited. All four targets must be completed before the route reward: do not count the published Allegiance or diplomacy bonuses in the opening budget. Check the reward's actual scope only after route victory.
::

::claim verify-in-campaign src=ca4,harmony
The archive distinguishes provincial Harmony, which follows Yin/Yang building points in each province, from battle Harmony, which its guidance associates with proximity between complementary units rather than equal counts. The cited update and secondary Harmony page were not independently rechecked here, and the installed patch’s exact indicators are unknown. Check the current province/building tooltips, then compare the Harmony indicator for one nearby complementary pair with a separated pair in a representative manual battle. Until those tooltips confirm the interaction, keep province planning and battlefield positioning separate; do not alter research, recruit heroes, or force equal unit counts to solve the other system.
::

::claim verify-in-campaign src=smart
The archive recommends inspecting predicted casualties and protecting role-critical troops, but its Smart Autoresolve citation is a Workshop directory; no exact mod file, version, or Zhao matchup benchmark was available. Its value for your installed setup is unknown. Before repeating a costly autoresolve, inspect the forecast for one representative risky battle and compare the result with the army’s actual surviving roles. If the forecast threatens a veteran or the only answer to a major threat, reinforce or recover first, or fight manually; do not generalize that one result into a benchmark.
::

## Early → Mid

**Make Shang-Yang the commercial headquarters**

Start the long development gate well before the final income push.

The capital is the route’s long clock: growth now, House of Secrets at tier three, the Great Embassy only at tier five. The Shang-Yang · Route I settlement panel carries the full capital priorities and slot cautions; this section is the operating sequence that uses them.

- **Secure Shang-Yang on a sensible frontier.** Finish the enemies preventing a connected base rather than opening several unrelated wars. Take the city without assuming the neighbouring map will match a fixed turn script.
- **Prioritise growth toward tier five.** Keep growth in developing towns, fund main-settlement upgrades, and reserve a future landmark slot. The Great Embassy is not available at tier three.
- **Build the House of Secrets at tier three.** Use its Alchemist recruitment advantages. Recruit the main army’s companion and build a workable spell/support toolkit. It is a different landmark from the Embassy: having excellent Alchemists does not complete the Embassy checkbox, and its conflicting published income figures never enter the budget as guaranteed income.
- **Establish a second caravan rotation.** Use the actual active limit and a reserve master. Take early destination rewards where useful, but favour a deliverable trip over the largest printed payout.
- **Keep Zhao useful while the capital develops.** After Master of Metal, prioritise Strange Alchemy while developing Shang-Yang, then Iron Scale and Lord of Shang-Yang as the army and western partners require. Do not leave Zhao home permanently merely to save construction gold: queue an already-planned major project during a normal visit instead of dragging the army across the continent for the discount (Skill panel: Zhao Ming · Route I).

Shang-Yang is growing, House of Secrets supports recruitment, and trade arrivals are funding development rather than masking a permanently unaffordable army.

## Mid → Late

**Turn commercial reach into recurring revenue**

Add productive provinces and useful partners without losing control of the war budget.

- **Select the next economic expansion.** Prefer hostile territory that completes sensible borders, mines, profitable towns or needed routes. Voluntary confederation is useful only when you can manage its armies and new threats.
- **Specialise instead of cloning.** Keep a main arsenal and one regional replacement point when distance warrants it. Let most other towns earn income or develop resources.
- **Research for the current bottleneck.** Cargo needs Iron Dragon’s Mandate. More departures require the longer Widened Roads / Roads of Harmony and Honour branches — two distinct technology investments with separate prerequisites, not one slot. A slow economy needs the appropriate income and tariff improvements. The Research panel’s Caravans group carries the full approaches and the available-node rule.
- **Raise a purposeful second army.** Have a General protect the western approach or finish a nearby threat while Zhao handles the main operation. A partial relief army can be sufficient before a full second stack is justified — the affordable second regional force protects trade more usefully than excessive flagship upgrades. The Merchant Prince’s Retinue (Mid) and the twelve-slot Western provincial guard (Home) templates carry their roles and readiness notes.
- **Choose the trade counter to attack.** Delivered goods and completed runs are both victory conditions. Smuggler’s Space is the default while cargo lags; choose Wheelwright on a different master when faster run completion is the real bottleneck, and develop more than one master so a destroyed or injured convoy does not halt all route progress (Skill panel: Caravan Master).
- **Point the Compass at the real gap.** Warpstone Desert supports caravan sale value and capacity while growing payload throughput; Celestial Lake suits a mature recurring economy as the final gap. Make the change for the counters, not every time the cooldown expires, and invest in capacity only when the dispatch budget and escort pool can use it (Workshop panel: Wu Xing Compass).

You have a growing recurring economy, multiple useful caravan masters and a military footprint that does not consume every arrival before construction can happen.

## Victory push

**Finish the Embassy and close the two trade counters**

Stop spending on completed requirements while the others remain unfinished.

- **Construct The Great Embassy.** Once Shang-Yang reaches tier five, budget for the landmark and its construction time. House of Secrets, alliances and a large treasury do not substitute.
- **Count goods, not the sale receipt.** Enter the goods credited by the live mission after successful deliveries. Cargo increases which were not actually loaded or delivered should not be entered, and one completed caravan does not contribute a fixed goods amount.
- **Switch the operational emphasis.** If nine runs are done but cargo is short, use better escorted high-capacity journeys. If goods are done but runs are short, choose safe practical completions rather than needless risk.
- **Build toward 25,000 gross.** Upgrade mature income, trade resources and useful ports. Develop enough territory for the target and measure gross income directly: lowering upkeep changes net income, not the gross-income objective, and hoarding 25,000 gold does not mean 25,000 gross income.

The Embassy and trade goals are either complete or scheduled, and the remaining gross-income gap has an explicit construction or expansion plan.

**Audit the four conditions and bank the result**

Finish deliberately instead of drifting into another continent’s war.

- **Check the active VCO panel.** Compare gross income, runs, goods and the Embassy flag independently. The atlas’s estimates are not connected to the game.
- **Keep the condition through a turn check.** The older listener checked income and caravans at different turn events. Let the installed version process the completed requirements before changing the setup.
- **Do not mistake rewards for prerequisites.** The improved western relations and allegiance are awarded after the route. Your army and diplomacy should work before receiving them; do not count the Allegiance or diplomacy bonuses in any pre-victory budget.
- **Choose a continuation.** A wealthy trade state can fund the western territorial route or the longer alchemical expedition. Keep the experienced escort and replace only what the next operation needs.

The game has awarded the route victory. Record that confirmation separately from your own checklist and from reward receipt.

## Territory policy

Keep useful productive provinces, resource towns and defensible routes. Expand or confederate sensibly until the recurring economy can reach the threshold; there is no four-province ceiling. Spread income and resource development through safe provinces while one main arsenal and one regional replacement point cover recruitment. Do not clear the entire Great Bastion by habit, and do not march to Skavenblight for a trade victory: territory serves the four live counters, not a sweeping western conquest.

## Diplomacy

Keep Cathayan partners and the Golden Order useful where the starting treaties permit it. Develop western Ogre, Dwarf and Empire relationships when they protect trade or unlock an actual contingent — the Ogre pact is a genuine optional force only when your pool, capacity and diplomacy provide it (Armies panel: The Western Fellowship). A quiet neighbour is often better than an unnecessary conquest.

## Transition → route-2

Use the commercial realm to pay for a long expedition. Keep the established home armies and trade rotations, refit one company for sieges and armour, scout the five fixed sites, and create western recovery stops before leaving. The Embassy remains useful but does not reduce the distance to Hell Pit or Skavenblight.

## Transition → route-3

Convert the existing western trading corridor into a deliberate territorial campaign. Audit who owns all four required provinces, especially Bhashiva in the Bone Road. Keep useful partners where the objective allows them, but verify control credit before relying on diplomacy. Fund a second field army and regional defence from the mature economy.
