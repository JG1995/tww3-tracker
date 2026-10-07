---
id: route-3
number: III
name: The Eternal War
vcoTitle: null
motto: Rebuild Anlec. Put the oath into action.
objective:
  text: "The author checklist has three separate requirements: build the Black Citadel of Anlec; make at least 25 successful assassination attempts; and wound Malekith, Morathi, Crone Hellebron, Malus Darkblade, Rakarth, and Lokhir Fellheart. Historical public 5.16.0 code separately encodes a Nagarythe landmark, an ASSASSINATE_X_CHARACTERS total of 25, and six wounded-character conditions. Current action credit, target mapping, and whether wounds latch or must overlap are unverified. Check one ordinary successful Assassinate against the live counter and one named lord's wound flag; track all three objective tracks separately and keep every still-required wound open until live persistence is clear."
  state: verify-in-campaign
  src: [vco, vco-script]
reward:
  text: "The author checklist lists -50% Intrigue-at-Court cost, +50% research rate, and +50 Growth. Historical public 5.16.0 effect data places Intrigue and research at faction scope and Growth at province scope; the current grant, scope, and timing are unverified. Inspect the victory panel and each effect tooltip after award; do not assume Growth is faction-wide or rely on the bonuses before they appear."
  state: verify-in-campaign
  src: [vco, vco-script, vco-effects]
interpretation: "A coordinated oath on three tracks: rebuild the Ulthuan homeland around Anlec, train and finance the 25-action assassination network, and wound the six surviving named enemies. Alith's strike force keeps campaigning while detached Nobles and a growing court do the repeated agent work."
bottleneck: "Tier-five Anlec development and far-flung named targets take time. Whether wound flags remain checked or require a common window is not explained in the current public guide."
phases:
  - { title: "Start all three clocks early", note: "This campaign is slower if the army, the citadel and the assassins are developed strictly one after the other." }
  - { title: "Return a household to Anlec", note: "Bring enough strength to hold the settlement, then let development run while the hunt continues." }
  - { title: "Build the intelligence and expedition network", note: "Find the six characters as they are now, not as they appeared in a start-position article." }
  - { title: "Prepare the last blows together", note: "Let the final operation be limited by actual missing objectives, not uncertainty about where the targets are." }
  - { title: "Close the oath with evidence", note: "Verify each part of a multi-theatre route before dismantling its support." }
panelOrder:
  armies: [early, mid, late, specialist, home]
  skills: [alith, princess, field-noble, agent-noble, shadow-caster, mist-mage, life-mage, light-mage]
  research: [opening, agents, hunt, industry]
  buildings: [hub, anlec, agents, port, income, frontier]
  mechanics: [shadow, hand, marks, influence, patrons, rites]
gaps:
  - "Transition → route-1"
  - "Transition → route-2"
---

## Opening

**Start all three clocks early**

This campaign is slower if the army, the citadel and the assassins are developed strictly one after the other.

Three projects run in parallel: restore an Ulthuan homeland around Tor Anlec, train and finance a 25-action assassination network, and dispatch forces against the six surviving named enemies. This is the most involved route and the best fit for a longer thematic campaign that enjoys diplomacy, rebuilding and coordinated operations — do not wait until late game to start Anlec's growth or the agent work. Alith retains the mobile black-fletched strike force; supporting Princes or Princesses lead the shielded garrisons and heavier overseas task forces, while detached Nobles form the intelligence and assassination network.

::claim verify-in-campaign src=vco,vco-names
The archive retains “The Eternal War” as a thematic subtitle. Historical public localization at commit 0319bd67e58503b0ff6ca00ff4fee7e9e208020d contains that Route III title, but the author checklist retrieved on 2026-10-06 labels the section only Route III and gives no applicable VCO build. Keep the official-title marker unresearched until you compare the installed route panel. This atlas does not read a save: a planning tick is not mission credit, so record game progress only after observing the live objective change.
::

- **Stabilise the Monoliths opening.** Finish the local threat and secure the recruiting base before an overseas move. Keep the initial army functional with walkers, ordinary spears and bows, and a modest support element. The Opening research queue builds this first army's foundation — you do not need to complete every later branch before pursuing the route.
- **Inspect Tor Anlec and the route panel.** Locate the actual Ulthuan settlement, current owner and acquisition options. Record the 25-action counter and the six named-lord indicators. The landmark is not in Naggaroth.
- **Build Elven Gardens for a detached Noble.** The first dedicated agent can work nearby enemy heroes while Alith continues campaigning. Make this an early investment — the agent build grows the 25-action counter while the citadel develops. Keep any replenishment Noble with the army; do not ask the same character to perform both jobs.
- **Test a successful assassination credit.** Read the counter, perform a successful ordinary Assassinate action and see what changes. Do not substitute a Mage Wound, a failed attempt or a lord beaten in battle without observed proof.

Move on when the first agent is gaining relevant experience, the local army can operate safely, and there is a realistic plan to acquire Tor Anlec.

## Early → Mid

**Return a household to Anlec**

Bring enough strength to hold the settlement, then let development run while the hunt continues.

- **Acquire Tor Anlec by a viable method.** Use an eligible diplomatic transfer or confederation when possible; otherwise plan a specific military operation against its actual owner. Do not manufacture wars with every High Elf or assume military access grants construction rights.
- **Start province-wide growth immediately.** Use Homesteads and protect the province. Upgrade the main settlement when population and treasury allow; keep a reserved landmark slot and do not fill the capital with unnecessary military duplicates.
- **Assign separate armies clear jobs.** A modest Ulthuan guard holds home. Alith can return to nearby target theatres or remain for the next meaningful operation; a supporting Princess can continue a different front when affordable.
- **Keep the agent working.** Use appropriate ordinary enemy heroes for the repeated-action objective. Improve Assassinate and Specialist through their gates. Secure Influence only when no worthwhile action is available.

Point the development the same way: give the captured province the Anlec growth and landmark role, keep construction and agent fees funded together, and remember that Influence income is not a substitute for the gold Anlec needs — the selected settlements and workshop entries carry the queues and funding limits, and the agents entry keeps the embedded field Noble separate from detached assassins.

Move on when Tor Anlec is growing under your control, its defence is credible, and the action counter is progressing without stopping Alith's campaign.

**Build the intelligence and expedition network**

Find the six characters as they are now, not as they appeared in a start-position article.

- **Add an agent court and a second cell.** A tier-four Elven Court provides additional Noble capacity and recruitment support. Two or three detached agents in productive theatres are a sensible plan if action fees and upkeep remain affordable.
- **Map the near targets.** Find Malekith, Morathi and Hellebron through current faction information and scouting. Characters may be confederated into another faction; destroying their original faction name is not a reliable substitute for checking the lord.
- **Reconnoitre the distant targets before sailing.** Rakarth's original theatre is Lustria; Lokhir's is Cathay; Malus begins in the far northern theatre. These are search leads, not coordinates. Lokhir's Black Ark movement especially makes stale location assumptions unreliable.
- **Observe whether wounded flags persist.** Defeat or assassinate one feasible named lord and watch its objective after recovery. Record whether it remains checked. Until that is clear, prepare for a coordinated finishing window rather than assuming six unrelated historical defeats are enough.
- **The six named enemies.** Malekith — Naggarond and its current armies; track confederation and respawn status. Morathi — the Ancient City of Quintex and the Cult of Pleasure's current front. Crone Hellebron — Har Ganeth and any faction that has since confederated her. Malus Darkblade — the far-northern theatre as an initial search lead; current owner and army location take precedence. Rakarth — Lustria as an initial search lead; scout before committing a trans-oceanic army. Lokhir Fellheart — Cathay as an initial search lead; his newer Black Ark movement can move the target far from that start.

Advance the agents research earlier than in the other routes, especially before recruiting more specialist agents — it is support for their work, not 25 automatic credits. Keep the selected mechanics pointed the same way: agents and Influence become early investments, save Morai-Heg for a difficult reachable lord while normal Nobles build the repeated-action counter, and use a mark only when it advances the current operation — track its outcome separately from the 25-action counter.

Move on when you know the current status and likely location of each missing lord, the agents can finish the counter, and Anlec is approaching its final tier.

## Mid → Late

**Prepare the last blows together**

The final operation should be limited by actual missing objectives, not uncertainty about where the targets are.

- **Complete the Black Citadel.** Reach tier five, construct the Black Citadel of Anlec and verify its objective. The unmodified database lists 10,000 gold and five build turns; use the actual current price and duration in your game.
- **Finish the 25 credited actions.** Keep successful events distinct from attempts and ordinary battle victories. Stop assigning unnecessary risky actions once the live objective is complete; preserve the experienced scouts.
- **Schedule the named-lord strikes.** If the flags latch, finish missing targets one at a time. If they require current wound states, position armies and the Hand for overlapping windows. Read actual recovery information, especially with 9.0 wound settings.
- **Position Alith before Morai-Heg.** The Hand appears near Alith and still has to travel. Use it for the difficult reachable target, not automatically for the closest hero when an army can already do the job.

Keep the settlement and mechanic panels pointed the same way: regional ports and recovery sites support the distant hunts while the income town keeps funding construction, and the Hand entry holds the summon-window and single-use guidance this schedule relies on — the public sources do not settle wound-flag persistence, so preserve the overlapping-strike plan until you observe the live rule.

Move on when the citadel and 25 actions are confirmed, and every remaining named target has a feasible and timed method of being wounded.

## Victory push

**Close the oath with evidence**

Verify each part of a multi-theatre route before dismantling its support.

- **Check all six names in the game.** Malekith, Morathi, Hellebron, Malus Darkblade, Rakarth and Lokhir Fellheart each have a separate objective. Do not infer missing credit from a faction being weak, destroyed or absent from the visible map.
- **Keep Anlec and the final operation intact.** Do not abandon the homeland or sell the landmark before the route is awarded. Keep a manual save before the last strike.
- **Let the objective system process the event.** Recheck after the battle or action and any necessary turn transition. When the public documentation is ambiguous, the live mission is the evidence — not the atlas's forecast.
- **Finish or turn the network towards another route.** Use the agents for later intelligence, keep a coherent realm, and continue the northern conquest or relic route only because you want that next campaign story.

The six VCO wound rows below, the assassination row and the workshop's Hand and Patrons entries keep the credit and persistence limits — treat a cleared flag as still required until you observe the live state. Victory is proven when the game explicitly awards the route; objective observations, the awarded victory and actual reward receipt are recorded separately, and the listed benefits are not planned on before they appear.

Move on when the game explicitly confirms the route victory; the atlas records the oath without pretending to trigger it.

## Territory policy

Build a defensible Ulthuan base around Tor Anlec and keep its province protected — the landmark needs the settlement under your construction control and enough time to reach tier five. Retain useful Naggaroth access so the opening's recruiting base is not lost, and establish overseas bases only where a real target lives: a single staging settlement near a remaining named lord is enough. Broad operations do not require owning every intervening settlement. Acquisition is not construction right — how the court and settlement entries put it: alliance access, a patronage seat or a province seat does not permit building the citadel yourself, and the selected panels keep the exact ownership, tier and cost rules. Keep the homeland and the final operation intact until the route is awarded; a sold, razed or abandoned capital cannot credit the victory.

## Diplomacy

Use High Elf partnerships to reach or peacefully acquire Anlec where possible: an eligible diplomatic transfer or confederation is cheaper than war with the current owner, but check the live wording rather than assuming any treaty grants construction. Use local partners for access and intelligence in distant theatres — sea lanes, military access or a useful border agreement can shorten the hunts for Rakarth, Lokhir or Malus. Track each named lord's current faction and confederation state, because a newly confederated holder can move a target far from its starting theatre. A confederation is useful only when it is affordable and actually available to your DLC collection; do not spend as if a paid character or alliance were guaranteed.

## Transition → route-1

Leave the restored Anlec realm defended and redeploy a task force to the six Naggaroth cities. The assassination network provides useful scouting, while one occupation army keeps conquests stable. Shift spending from repeated agent actions into regional recruitment once the counter is complete.

## Transition → route-2

Your agents can identify candidate owners and the current status of the Witchwood before Alith moves. Retain one home guard, check the live search conditions and work through the missing sites. A successful Eternal War does not mean the Amulet has already been found.
