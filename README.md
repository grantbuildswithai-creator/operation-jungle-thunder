# Operation Jungle Thunder

## Your game, explained in plain English

This is your single-player, 1980s-style jungle rescue arcade game. It runs in a web browser, such as Edge or Chrome. Right now you play it on your laptop. Later, we will publish it so friends can reach it through a Play button on **grantbuildswithai.com**.

You do not need coding experience to play or direct changes. Describe the result you want, and Codex can update the files.

## How to start playing

Your project folder is:

**C:\Users\grant\OneDrive\Documents\Codex\Coding project 10.5**

1. Open that folder in Windows File Explorer.
2. Double-click **Play Operation Jungle Thunder.cmd**. Windows may hide the `.cmd` ending.
3. Leave the small server window open. Your browser will open the game.
4. Choose your aiming style and difficulty, then click **Deploy**.

If the server is already running, open [Play on this laptop](http://localhost:4173/).

**Localhost means “this computer.”** This address works on your laptop while the server is running. Sending it to a friend will not let them play your copy. Publishing will give us a public address.

**The local server** is a small program that hands the game files to your browser. The actual game runs in the browser. Use the launcher or link above; directly double-clicking `index.html` is not the supported way to play because browsers restrict how its separate code files load.

## Controls and run choices

| Action | Control |
| --- | --- |
| Move | WASD or arrow keys |
| Shoot | Automatic |
| Throw a grenade | **Right Shift** |
| Pause or resume | **Esc** |
| Quit to title | Pause first, then **Q** |
| Restart from the beginning | Pause, then click **Restart Run** |
| Enter or exit fullscreen | **F**, or the Fullscreen button |
| Turn music and effects on/off | The Sound button at the top of the page |

Your browser may use Esc to exit fullscreen first. Press Esc again if needed to pause. For the largest view, open the game in Edge or Chrome rather than inside a narrow preview panel.

- **Classic aiming:** movement turns your soldier and gun. Stopping keeps the last direction.
- **Mouse aiming:** move with the keyboard and point the mouse where you want to shoot. Grenades follow your aim too.
- **Easy, Medium, Hard, Impossible:** change enemy numbers, firing pressure, bullet speed, and reinforcements. Movement speed, three health segments, three lives, and ten starting grenades stay the same. Medium keeps the original balance.

Restart uses the same options. Quit to Title lets you change them. Both end your current attempt.

Controller support uses the left stick or D-pad, A/Cross for grenades, and Menu/Start to pause. In Mouse aiming mode, the right stick can aim too. Physical controller testing is still needed.

## What language is it written in?

The main language is **JavaScript**, not Python. It runs the gameplay, draws the battlefield, and creates the music in your browser.

- **HTML** defines the page structure: game area, buttons, headings, and panels.
- **CSS** controls its appearance: colors, fonts, spacing, and layout.
- **JavaScript** makes it interactive: movement, enemies, shots, scoring, menus, and sound.

The battlefield is drawn on a **Canvas**, a digital drawing surface refreshed many times per second to create movement.

**Node.js** runs JavaScript outside the browser. It is already available on this laptop and runs our small local server. Friends playing the published game will not need to install it.

## What each file does

You do not need to edit these yourself. This table helps you understand what Codex changes.

| File | Purpose |
| --- | --- |
| **index.html** | The web page containing the game and surrounding panels. |
| **style.css** | Page colors, typography, layout, and fullscreen presentation. |
| **game.js** | Controls, menus, battlefield drawing, and on-screen information. |
| **engine.js** | Game rules: enemies, bullets, health, lives, checkpoints, difficulty, rescue, and endings. |
| **sprites.js** | Draws the characters. A sprite is a small game character or object image. |
| **audio.js** | Creates music and effects and selects the theme for each stage or outcome. |
| **server.mjs** | Serves the game files on your laptop. |
| **Play Operation Jungle Thunder.cmd** | Starts the local server and opens the game. |
| **package.json** | Project information and shortcuts for starting the server and running checks. |
| **tests** folder | Automated checks of game rules, aiming, difficulty, and music behavior. |
| **DESIGN.md** | Our agreed design, including spoilers about both endings. |
| **PLAYTEST.md** | Suggestions for testing and giving feedback. |
| **character-preview.html** | A visual reference sheet of the characters. |
| **README.md** | This guide. `.md` means a text document with simple formatting. |
| **.gitignore** | Tells Git which temporary files to leave out of project history. |

While the server runs, you can open the [character reference sheet](http://localhost:4173/character-preview.html).

## How the artwork and music work

The current pixel art is drawn by our code, rather than downloaded from another game. Riflemen wear green. Grenade throwers wear black armor, carry visible grenades, and raise their throwing arm. Your soldier has a red bandanna, bare arms, long dark hair, and an open dark vest.

The soundtrack is also generated by code, rather than playing an MP3. It layers melody, bass, harmony, and percussion. Music changes at checkpoints, has a helicopter battle theme, becomes quieter during the final stand, and has different victory and defeat pieces.

Rifle firing is silent. Grenade sounds remain. Click Deploy to begin audio; browsers generally require a user action before playing sound. The Sound button controls both music and effects.

## What gets saved?

The browser remembers your aiming/difficulty choices and personal best score. The best score updates when a run reaches its results screen.

It does **not** save a mission halfway through. Closing or refreshing the page ends that attempt. Checkpoints work during the current run, after you lose a life; they are not permanent saved games.

Different browsers, computers, and the future public website can have separate scores. Clearing browser site data can erase them. There are no accounts or shared leaderboards.

## How we make changes

You play and describe what you want. Codex edits the relevant files, checks the changes, and you try them. For example, enemy appearance is mostly artwork; difficulty is game rules; helicopter music is the soundtrack.

Refresh the page after changes to load the new version. **Refreshing starts over**, so finish or quit your attempt first.

Automated checks catch problems such as exceeding the grenade limit or awarding the wrong ending. They cannot decide whether the game is fun. Your feedback is how we tune music, controls, difficulty, and the roughly ten-minute mission target.

## How friends will eventually play

We plan to publish this as a separate GitHub Pages project and add a link from **grantbuildswithai.com**. A GitHub project folder is called a **repository**; it stores files and can keep their change history.

The public game needs these files together: **index.html, style.css, game.js, engine.js, audio.js, and sprites.js**. GitHub Pages delivers them to visitors. Friends will not need the Windows launcher, local server, a GitHub account, or a game installation.

Each visitor plays their own single-player game. **Nothing has been published yet.** We are still improving the laptop version.

## Troubleshooting

| Problem | What to try |
| --- | --- |
| Cannot reach localhost | Start the launcher and leave its server window open. |
| The launcher says the port is already in use | The game may already be running. Try the local link; if a different page appears, tell Codex. |
| “node” is not recognized | Node.js may be missing on that computer. Ask Codex for setup help. |
| No sound | Click Deploy; check the Sound button, browser-tab mute, and laptop volume. |
| A change is missing | Quit the run and refresh the page. |
| The game looks small | Open it in a normal browser window and press F. |
| It paused when you switched windows | That is intentional. Return to the game and resume. |

To stop playing, pause and press Q or close the game tab. To stop the local server too, close its launcher window. If Codex started it in the background, ask Codex to stop it.
