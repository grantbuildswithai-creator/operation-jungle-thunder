# Operation Jungle Thunder

## Agreed direction
A single-player overhead browser arcade game in a fictional 1980s jungle military setting. Detailed pixel art, smooth animation, arcade music with military percussion. Develop and play on Grant's laptop first; later publish as a separate GitHub Pages project and link from grantbuildswithai.com. No multiplayer. No publication until ready.

## Mission
One continuous mission targeting approximately ten minutes to a successful helicopter escape, plus the final stand. Jungle approach → defensive line → river crossing → prison camp → extraction. The camera only scrolls forward. Most fights can be bypassed; prison defenses and extraction require combat. Four invulnerable prisoners are released after the camp defenses are destroyed and move toward extraction. The player is not told the mission is one-way.

## Controls and combat
- WASD or arrow keys: move in eight directions and aim in movement direction. Standing still keeps last aim.
- Always firing. No fire button.
- Right Shift: throw a grenade a fixed distance toward a visible landing marker.
- Controller: left stick/D-pad, A/Cross grenade, Menu/Start pause. Keyboard first.
- Escape: pause. Automatically pause on lost focus.
- Three health segments and three lives. Brief invulnerability after damage.
- Ten starting grenades, ten maximum. Crates add five, capped at ten; no recharge.
- Own grenades do not hurt the player. Jeep explosions deal one health segment at close range, with a warning flash and smoke. Enemy grenades have a visible landing warning and fuse.
- Rocks, walls, and sandbags block bullets. Grenades travel over them. Decorative vegetation does not block shots.
- Visible enemy projectiles aimed at the player's position when fired. No homing or instant hits. Machine gunners fire fixed-direction bursts with pauses.
- Riflemen, rushers, grenade throwers, machine-gun positions and jeeps. Jeeps drive in and stop; sustained rifle fire or one accurate grenade destroys them. Their explosion also kills nearby enemies.
- One automatic rifle. Fixed pickups give rapid fire or three-shot spread for fifteen seconds; one upgrade at a time, a new pickup replaces and refreshes.
- No new supplies after helicopter escape.

## Checkpoints and difficulty
Checkpoints before the defensive line, prison camp, and extraction battle. Lost life restores three health and ten grenades, clears weapon power-ups, resets the section and restores checkpoint score. Dying before helicopter escape retries extraction with a life consumed and prisoners/countdown reset. All lives lost ends the run.

Difficulty target: a new player can plausibly reach the helicopter around their third run. Major encounters and pickups are consistent for learning. This is a playtesting target, not an established measurement.

## Two endings (spoilers)
Once all four prisoners board, a visible ten-second takeoff countdown starts. The player can deliberately enter the boarding area and hold there briefly.

1. **Board:** the helicopter departs, is shot down without ground cover, and all aboard die. Immediate run-ending MISSION FAILED regardless of remaining lives, no checkpoint retry.
2. **Stay:** the helicopter lifts off at zero. The player must survive while covering its departure. Once it escapes, award 5,000 points and secure mission success. A brief MISSION COMPLETE / PRISONERS SECURED banner appears while play continues. Radio: “We're clear. You got them out.” Music becomes quieter and sparse. Enemy numbers increase until the player falls. Remaining health only, no respawns or new supplies. Final screen: MISSION ACCOMPLISHED, score and final-stand duration.

## Scoring
Rifleman 100; rusher/grenade thrower 150; machine-gun position 300; jeep 500; rescue 5,000; final stand 100 points/second plus kills. No combos, no extra lives from points. Browser-local personal best, not a shared leaderboard.

## Art and sound
Hero: olive fatigues, rolled sleeves, red bandanna, backpack, readable weapon direction. Tan helmeted riflemen, lightly equipped rushing soldiers, bulky-vest grenade throwers, heavy machine gunners, blue-gray unarmed prisoners. Silhouettes and animation distinguish roles beyond color. Deep green jungle, muddy trails, sandbags, towers, bridges, rusty outposts, clear bullet contrast. Explosions, engine sounds, recoil, dust, smoke and helicopter rotors. Fictional characters and original artwork.

## First playable scope
The initial build uses original procedural Canvas pixel artwork and synthesized arcade audio, with no required framework, paid asset, or game server. Built to run locally and under a GitHub Pages subpath. Visual polish, encounter pacing, and difficulty remain subject to hands-on testing. Controller logic is included; physical hardware testing is still required.

## Approved changes after first playtest
- Remove the repeating rifle sound; preserve grenade sounds.
- Fuller, more exciting layered music; distinct music at every checkpoint, a helicopter scene theme, and victory/defeat result music. Keep the quieter final stand.
- Add Restart Run and Quit to Title to the pause menu.
- Title-screen choice between Classic movement-based aim and independent Mouse aim; automatic firing and movement speed unchanged.
- Title-screen difficulty choices: Easy, Medium, Hard, Impossible. Medium retains initial balance. Difficulty changes enemy population, bullet speed, attack frequency, movement pressure, and reinforcement waves; player health, lives, and grenade rules remain unchanged.
- Character readability update: green-uniform riflemen; black-armored grenade throwers with bright grenade belts, no rifle, and a raised throwing arm. Hero now has muscular bare arms, an open dark vest, long dark hair, a cartridge bandolier, and a bright trailing red bandanna. Combat hitboxes remain unchanged.
