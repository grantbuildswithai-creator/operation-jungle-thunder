# Operation Jungle Thunder — handoff to Claude

## Owner and purpose

Grant designed this game with Codex and is happy with the current version after a complete Medium-difficulty playthrough. The next task is publication and integration with Grant's existing website, www.grantbuildswithai.com, which Claude already manages. Preserve the current gameplay, appearance, and soundtrack unless Grant requests changes.

This file provides project context. Grant will separately instruct Claude to publish; the note itself is not authorization to change an external service.

## Agreed publishing plan

- Publish the game as a separate GitHub Pages project, independently of the existing website.
- Add a game card or Play Operation Jungle Thunder link on the existing website that opens the published game.
- A dedicated full-page game is preferred to a small embedded frame.
- Determine the correct GitHub account, repository, public game URL, and website integration location from Grant's Claude project. These have not been created or selected here.
- Do not replace the existing website, change its domain/DNS configuration, or point it at the game repository.
- There is no multiplayer, login, backend, database, or shared leaderboard.

## Files required for the public game

Keep these six files together at the game site's root:

1. index.html
2. style.css
3. game.js
4. engine.js
5. audio.js
6. sprites.js

The game uses relative file references and browser JavaScript modules. It needs no compilation or dependency installation for publication. It is suitable for static hosting under a GitHub Pages project subpath. Deploying only index.html will not work.

The source repository can retain the complete copied folder, including documentation and tests. Only the six files above are required in the published site. Documentation contains ending spoilers and does not need to be published. character-preview.html is an optional developer reference sheet.

style.css requests optional Google Fonts; fallback fonts are provided. All gameplay art and sound are produced by the local JavaScript code. No keys or paid asset services are required.

## Local development

Node.js is needed only for the local development server and automated checks. From this folder:

- npm start — serve the game at http://localhost:4173
- npm test — run the automated checks

The Windows launcher, Play Operation Jungle Thunder.cmd, starts the server and opens a browser. Closing its server window stops that instance. The server address is local to the computer; never use a localhost URL in the public website link.

server.mjs and the Windows launcher are development conveniences. They are not a backend to deploy to GitHub Pages. No npm dependencies are declared.

## Current features to preserve

- Classic movement-based or independent Mouse aiming, selected on the title screen; automatic firing.
- Easy, Medium, Hard, and Impossible difficulty. Medium is the owner's accepted baseline.
- WASD/arrows move; Right Shift throws grenades; Esc pauses; Q while paused quits to title; F toggles fullscreen.
- Pause menu: Resume, Restart Run, Quit to Title.
- Controller support is implemented but has not been verified on physical hardware.
- Three health segments, three lives, ten maximum grenades, crates adding five, checkpoints, temporary weapon upgrades.
- Green riflemen, black grenade throwers with a distinct throwing pose, red-bandanna action hero.
- Silent rifle fire, audible grenades, checkpoint music, helicopter music, quiet final stand, and victory/defeat music.
- Personal best and aiming/difficulty preferences saved in browser localStorage. No mid-run persistence. The published origin will have separate stored scores from localhost.

## Ending spoilers — do not reveal in website promotional copy

The mission is to rescue four prisoners. Once all board the helicopter, a ten-second countdown begins. Boarding the helicopter causes a fatal shoot-down and immediate mission failure regardless of lives remaining. Staying behind and surviving until the helicopter escapes secures mission success. The player then fights an escalating final stand with remaining health and no respawns until death, followed by MISSION ACCOMPLISHED.

Grant played through the boarding ending successfully and later enjoyed a complete Medium run. Preserve these outcomes.

## Verification before sharing the public link

- Run npm test. The last complete automated run passed 20 checks; later changes added the Q shortcut and character artwork, checked in the browser/syntax checks.
- Confirm all six required files load from the actual public project URL with no missing-file or JavaScript-module errors.
- Check Deploy, aiming/difficulty selectors, pause, restart, Q-to-title, fullscreen on/off, and sound after a user click.
- Confirm gameplay sprites and music load; do not omit audio.js or sprites.js.
- Ensure the website card links to the public game address, not localhost or a computer folder.
- Test the public page in a desktop browser and confirm it works without a GitHub login.
- Report the game URL and the existing website page containing the Play link to Grant.

## Supporting documentation

README.md is the plain-English owner's guide. DESIGN.md contains the detailed agreed design and later revisions. PLAYTEST.md records initial playtest guidance and limitations; its original verification count is historical.

No GitHub repository or public deployment was created by Codex for this game. Do not assume the local development server is needed after publication.
