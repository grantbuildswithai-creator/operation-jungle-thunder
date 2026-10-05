# First playtest

Open http://localhost:4173 while the local server is running, or double-click **Play Operation Jungle Thunder.cmd** in this folder.

For the largest view, open that address in Edge or Chrome and press **F**. F also exits fullscreen; the button under the battlefield toggles it too. Escape pauses (and your browser may use Escape to leave fullscreen first).

## Controls
- WASD / arrow keys: move and aim; firing is automatic.
- Right Shift: grenade. Look for the small landing marker ahead of you.
- Escape: pause/resume. Switching away from the game also pauses.
- F: fullscreen on/off.
- Controller: left stick / D-pad, A/Cross grenade, Menu/Start pause.

The first playtest is about the feel, not finishing the entire mission. Useful feedback:
1. Does the soldier move fast enough, and is facing-direction shooting comfortable?
2. Are enemy bullets easy to spot and dodge?
3. Does Right Shift feel comfortable for grenades?
4. Is the music enjoyable at this intensity?
5. Where do you first lose a life or get stuck?

## Verification completed
- Twelve automated checks pass: resources, checkpoint restoration, extraction reset, ten-second countdown, intentional boarding, both endings, explosion damage, jeep destruction, power-up expiry, forward-only scrolling, prison gate, life limit, and a full-map traversal to successful extraction.
- Browser title/deploy, Right Shift grenade consumption, pause/resume, fullscreen controls, and game rendering checked.
- No browser warnings or errors observed during the smoke test.

## Still needs playtesting
- The ten-minute target and reaching extraction around the third attempt are design goals, not yet measured with a human player.
- Controller support is implemented but has not been tested with a physical controller.
- This version uses original procedural pixel art and synthesized audio; visual and sound polish can be refined after trying the controls.
- Nothing has been published or linked from the existing website.
