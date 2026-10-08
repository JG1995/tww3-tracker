---
id: route-1
number: I
name: "The Northern Reconquest"
vcoTitle: null
objective:
  text: "Checked 8 October 2026: the VCO author's guide publishes this route as controlling eight named provinces — Helspire Mountains, Vanaheim Mountains, Ice Tooth Mountains, Mountains of Naglfari, Trollheim Mountains, Mountains of Hel, Gianthome Mountains and Goromadny Mountains — and building The Silver Hall, the same set as the archive's catalogue; the archive's checked building data adds that the landmark sits at tier-IV Kraka Drak. That is publication evidence, not a live check: the mission's qualifying-control rule (direct versus allied or diplomatic ownership) and trigger sequence are not established by any opened source."
  state: verify-in-campaign
  src: [vco-guide-check, vco-script]
reward:
  text: "The current author's guide publishes this route's reward as +100% experience when fighting Forces of Chaos, +10% range, +10% missile resistance and +25% speed for Gyrocopters, Gyrobombers and Thunderbarge units (checked 8 October 2026). Published reward effects do not establish the grant: exact scope, timing and installed-build application remain unverified, so treat it as a post-victory benefit, not part of your pre-victory army statistics."
  state: verify-in-campaign
  src: [vco-guide-check]
interpretation: "A territorial campaign across the northern mountains, with Kraka Drak as the industrial capital and an aviation-led flagship covering a growing realm."
bottleneck: "Secure province ownership + Kraka Drak tier IV"
phases:
  - { title: "Make Kraka Drak worth keeping", note: "Finish the immediate war and start the landmark's growth project while Malakai develops his field battery." }
  - { title: "Build an eastern base, then roll the frontier", note: "Use the starting end of the kingdom as a recruitment and recovery base, rather than opening both ends of Norsca at once." }
  - { title: "Make conquest sustainable", note: "The final western provinces and the capital landmark are separate jobs that should progress in parallel." }
  - { title: "Finish The Silver Hall", note: "Complete the tier-IV landmark and bring the aviation identity online; use Deeps only where the growing settlement count still justifies them." }
  - { title: "Audit province completeness", note: "Stop taking unrelated territory and finish the missing pieces." }
panelOrder:
  armies: [early, mid, late, airwing, home]
  skills: [malakai-route-1, lord-route-1, engineer, gotrek, felix, runesmith, thane]
  research: [route-route-1, opening, gunline, air, economy, slayers]
  buildings: [hub-route-1, reclaim, income-route-1, frontier, recruit, resource-route-1, deep-route-1]
  mechanics: [ship-route-1, shiplate-route-1, adventures-route-1, deeps-route-1, grudges-route-1, forge]
gaps:
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Make Kraka Drak worth keeping**

Finish the immediate war and start the landmark's growth project while Malakai develops his field battery.

This is The Northern Reconquest: a territorial campaign across the northern mountains, with Kraka Drak as the industrial capital and an aviation-led flagship covering a growing realm. The company is an engineer's test fleet backed by permanent hold garrisons — the surface kingdom supplies and defends itself while Malakai's flight fights the front. Start in Kraka Drak with the opening nucleus, secure the starting province towards full Gianthome control, and let the capital's growth and income run from turn one: The Silver Hall is a real tier-IV victory milestone, not a late-game luxury, and the route's eight named provinces are its territorial contract.

::claim verify-in-campaign src=vco-guide
The archive retains “The Northern Reconquest” as the guide-created route subtitle; the official VCO title is unresearched at registration and the manifest keeps vcoTitle null. Compare the installed route panel before treating any title as installed proof.
::

::claim verify-in-campaign src=vco-guide,vco
The archive records a September 2026 research pass but carries no VCO version string; the manifest keeps patch and VCO unverified and records the archive's research date only as scoped provenance, never a fresh whole-guide check. Keep the current VCO Workshop page and installed build separate from the archive's publication dates.
::

::claim verify-in-campaign src=vco-guide-check,vco-script
Checked 8 October 2026: the author's guide publishes the same eight-province and Silver Hall set as the archive, so the route's condition rows are sourced. The qualifying-control rule is still open — the archive does not assume allied ownership satisfies a required province, and no opened source defines the accepted ownership. After the first province is secured, inspect the live mission's objective rows before relying on allied or gifted territory for the rest of the set.
::

::claim verify-in-campaign src=smart
The archive assumes Smart Autoresolve on Normal / Normal but records no specific installed mod build, formula, or Malakai matchup benchmark. Follow its casualty-forecast advice as a recommendation, not a measured result: if a predicted outcome risks a veteran or the army's only answer to a major threat, reinforce, recover, or fight manually.
::

::claim verify-in-campaign src=smart,vco-script
The archive warns not to trust the battle-result screen for scripted credit: after a battle used for Cannon kills, an Adventure task or a VCO action, open the actual mission and confirm the counter advanced. The Smart Autoresolve source record limits the available evidence to the supplied mod name and description, and the public VCO mission-script source contains no Malakai mission file at the 8 October 2026 check — mission-credit behaviour is not independently verified.
::

::claim verify-in-campaign src=roster,faction
The archive's access assumption is all WH3 DLC plus WH1/WH2 free content only; its templates use the base Dwarf roster and Malakai's WH3 content without paid older-game units. Registration has not verified the player's installed content. Check the live recruitment panel; if an expected unit is unavailable, use an accessible base-Dwarf core.
::

- **Secure the starting province.** Work towards full Gianthome control while reacting to nearby hostile armies. Scout the Hell Pit approach; remove a vulnerable Moulder threat when you can do so without losing the capital. Keep the starting nucleus useful and do not wait for a perfect twenty-stack before finishing a favourable opening war — the Early template in the Armies panel describes the intended company, not a turn-one shopping list.
- **Start the capital's surface economy.** Repair useful buildings, establish Barley Field support and ordinary/resource income, and reserve a capital slot for The Silver Hall (Buildings panel: Kraka Drak · capital & landmark). Surface income pays the bills while the ship provides mobility; do not duplicate a full land recruitment chain the moment the ship offers a pool option.
- **Keep the ship practical.** Beer Hall, the useful hull gate, Cargo Racks and Engine Room support the first war; climb the hull and survival/growth compartments rather than buying every unused recruitment building (Workshop panel: Ship: early). Start Dragonsbane and recruit its Cannons when available; the Cannon kills, a cavalry battle, two mountain battles and a Refectory are four suggested preparations, not extra VCO objectives — confirm the live counters before relying on autoresolve credit (Workshop panel: Adventure order · Northern kingdom).
- **Make southern friendships.** Trade and non-aggression with useful Kislev/Empire neighbours buy freedom to campaign north and west. Do not trade away required northern settlements to make a relationship slightly warmer.

Leave the opening with a functioning army, useful surface income, a growing Kraka Drak and no unanswered attack on the home province.

## Early → Mid

**Build an eastern base, then roll the frontier**

Use the starting end of the kingdom as a recruitment and recovery base, rather than opening both ends of Norsca at once.

- **Take a coherent first cluster.** Gianthome and nearby Goromadny are a sensible eastern base when current ownership permits. Deal with Wintertooth and Azazel as operational threats, not as a compulsory separate checklist for this route.
- **Expand one connected leg.** Work towards the central required provinces: Mountains of Hel, Trollheim and Mountains of Naglfari. Choose the order from the actual roads, wars and friendly access; this is a planning cluster, not a guaranteed turn-by-turn march.
- **Raise the first holding force.** A modest hold guard covers new captures and recovery while Malakai advances; promote it to a full field army when it must fight independently (Armies panel: Hold guard — Kraka Drak's twelve-slot hold guard). Do not expect twelve troops to hold an entire coastline, and do not raise a second premium stack that simply follows the flagship.
- **Upgrade the capitals that serve the advance.** Use a few recruitment/recovery hubs, income in the interior, and garrisons on active approaches (Buildings panel: Secondary recruitment & recovery hub, Safe income town, Frontier and recovery stop). Do not duplicate every high-tier military chain in every province.
- **Point the research at the conquest.** Open with growth — Guilds → Heavy Quernstones — because the capital landmark and the conquered realm both need development, then Khazid Subsidies → Rat Poison for development savings and replenishment before a tall-only project (Research panel: Research · Northern kingdom).
- **Build the commanders for their jobs.** Malakai takes Route Marcher first, then Inspiring Presence and Tactician for the cannon battery; the supporting Dwarf Lord takes movement, Axe Lord and Thunderer for the escort rather than copying Malakai's personal toolkit (Skill panels: Malakai · Northern kingdom; Dwarf Lord · Northern kingdom support).

Advance again when the previous cluster has stable control, replenishment access and a funded response — not only when its settlement flags have changed.

## Mid → Late

**Make conquest sustainable**

The final western provinces and the capital landmark are separate jobs that should progress in parallel.

- **Close the western cluster.** Ice Tooth, Vanaheim and Helspire are the remaining western objective cluster. Link operations to a sensible recovery point, and use the supporting army to prevent raids from undoing earlier gains.
- **Use Deeps selectively.** Consider Counting Room income in a developed safe region; the Deeps policy expects surface income and a cash reserve before the Great Gate, and productive rooms before specialist defences (Workshop panel: Deeps policy · Northern kingdom). Compare the current Guild Foundries tooltip against your growing settlement count rather than assuming a compact-realm build still wins.
- **Keep the interior earning.** The route's economy sequence is a few upgraded capitals on the advance, income in the interior, and resources where the mines/trade settlements sit — the eight required provinces are a wide realm, so broad growth beats one tall capital (Buildings panel: Safe income town, Mine or trade-resource settlement; Research panel: Research · Northern kingdom).

Aim for two operational field forces if the fronts justify them, plus local garrisons. The needed number follows the geography and actual budget, not a fixed army quota.

**Finish The Silver Hall**

Complete the tier-IV landmark and bring the aviation identity online; use Deeps only where the growing settlement count still justifies them.

- **Finish The Silver Hall.** Build it at tier-IV Kraka Drak; the archive's checked base cost/time are 8,000 gold and four turns before modifiers (Buildings panel: Kraka Drak · capital & landmark; ledger row construct-silver-hall). Reaching tier IV is your own deliberate development choice — the mission checks the constructed landmark, not a queued build, and ship/hull progress does not satisfy it. Keep a local defensive plan so a lost capital does not erase your progress.
- **Bring the aviation identity online.** Dreadquake Destruction supports the gyro group (Workshop panel: Adventure order · Northern kingdom); after three completed finales, The Skaven Scheme is a useful barge continuation. Two recruited barges can be enough character for the flagship — they are not required by VCO, and the recruited units take army slots that the summoned Spirit does not (Workshop panels: Adventure order · Northern kingdom; Ship: late).
- **Finish the aviation queue when the flight is real.** Heavy Armour Plating → Interchangeable Parts, then the gyro-engine path, suit the larger recruited flight; keep the supporting escorts paid for as the army grows, and let the air wing stay one job near supporting ground fire rather than chasing every flank alone (Research panel: Research · Northern kingdom; Armies panel: The northern air wing).

The Silver Hall is constructed and the aviation identity is real at the pace the budget and the fronts allow; the western conquest does not stall waiting for it.

## Victory push

**Audit province completeness**

Stop taking unrelated territory and finish the missing pieces.

- **Check all eight provinces.** Use the ledger and the game's Objectives panel, and check every constituent settlement, not just each provincial capital: Helspire Mountains, Vanaheim Mountains, Ice Tooth Mountains, Mountains of Naglfari, Trollheim Mountains, Mountains of Hel, Gianthome Mountains and Goromadny Mountains. Allied ownership is not assumed to satisfy this route — confirm what the live mission accepts before relying on a friendly controller.
- **Secure any fragile last capture.** A newly taken exposed town may be the last weak link. Replenish, position a response, and allow the mission to re-evaluate under the conditions stated in the save.
- **Confirm the landmark and award.** The Silver Hall must be constructed, not merely queued. Record victory only when the game grants it, and record the reward separately; the published aviation and Chaos-experience bonuses are a post-victory benefit, not part of the pre-victory budget (objective and reward claims above).
- **Choose a continuation deliberately.** Once the kingdom is secured, it can fund a northern fortress expedition or an Empire-relief column. You do not need to finish all Adventures to claim this route.

Finish line: the eight-province check and the constructed Silver Hall are credited, then the actual victory award appears.

## Territory policy

Keep and stabilise the eight required provinces. Take additional recovery, income or defensive sites when they make the conquest easier; do not expand simply because a border exists. Do not raze required province towns and then pay to colonise them, and do not build a tall-only economy that punishes the territorial objective: growth, income and recovery spread across the provinces the route actually requires, while the capital climbs to tier IV for The Silver Hall (Buildings panel: Newly reclaimed objective province, Safe income town, Frontier and recovery stop, Mine or trade-resource settlement).

## Diplomacy

Keep the southern Kislev/Empire flank cooperative. Trade and non-aggression with useful neighbours buy freedom to campaign north and west. Required territory is different: do not hand its settlements to allies unless your live mission explicitly accepts that form of control — check the route's qualifying-control claim before relying on a diplomatic province.

## Transition → route-2

Keep the kingdom as your supply base, but stop buying unrelated northern towns. Refit Malakai towards a supported Slayer/Hewer expedition, retain a holding army, and choose seven qualifying fortresses under the published seven-of-twelve rule — never treat all twelve listed sites as mandatory conquests, and confirm what the live mission credits on the first fortress before planning the whole expedition around one interpretation. The aviation reward helps the existing aircraft; do not replace them all merely to change the theme.

## Transition → route-3

Leave the required kingdom defended and send the flagship south through friendly territory. The earlier northern wars may already have removed several targets. Establish qualifying Altdorf/Nuln control — direct control or the diplomacy your live mission actually recognises, per the route's established contract — then audit the surviving named factions before choosing the next war; a defeated lord is not a destroyed faction.
