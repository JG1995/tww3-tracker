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
panelOrder:
  armies: []
  skills: [malakai-route-1, lord-route-1, engineer, gotrek, felix, runesmith, thane]
  research: [route-route-1, opening, gunline, air, economy, slayers]
  buildings: [hub-route-1, reclaim, income-route-1, frontier, recruit, resource-route-1, deep-route-1]
  mechanics: []
gaps:
  - "Early → Mid"
  - "Mid → Late"
  - "Victory push"
  - "Transition → route-2"
  - "Transition → route-3"
---

## Opening

**Registration draft — this route is not yet complete.** This drawer carries the route's archive-identified context and start orientation only. The full route plan (Early → Mid, Mid → Late, Victory push), territory policy, diplomacy, the reference panels, and both continuation bodies are declared gaps below and land with later packages. Do not mistake the empty panels or gap markers for absence of guidance.

The archive frames Route I as The Northern Reconquest: a territorial campaign across the northern mountains, with Kraka Drak as the industrial capital and an aviation-led flagship covering a growing realm. The opening sequence in its own words: secure the starting province towards full Gianthome control while scouting the Hell Pit approach, start the capital's surface economy with The Silver Hall as a real tier-IV victory milestone rather than a late-game luxury, keep the ship practical (Beer Hall, the useful hull gate, Cargo Racks and Engine Room) and begin the Dragonsbane adventure for its Cannons, and make southern friendships with useful Kislev/Empire neighbours rather than trading away required northern settlements.

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
