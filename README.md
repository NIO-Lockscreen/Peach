# Peach Afterglow

Four animated peach screensavers, ready to run in a browser, with the clock
from the car lockscreen on top.

## Open the demo

Open index.html in your browser. Keep the included files together. There is no
build step, installation, login, or internet connection required.

## Deploy to Vercel

The site is plain static files, so Vercel serves it as is.

1. In Vercel, choose Add New > Project and import this repository.
2. Leave Framework Preset on Other, Root Directory on ./, and the build and
   output settings empty.
3. Deploy. Every push to main deploys again.

From a terminal, `npx vercel` in this folder does the same. vercel.json adds
clean URLs, long caching for the font, and a few security headers.

## Screensavers

- Peach Rain: gently falling, rotating peaches.
- Slow Spin: a slowly rotating hero peach.
- Peach Orbit: peaches circling a central peach.
- Floating Peaches: softly drifting peaches in zero gravity.

## Controls

- Choose a screensaver by clicking its card.
- Choose Midnight, Cream, Blush, or Peach using the labeled backdrop buttons.
- Adjust Speed and Density, or pause and resume the animation.
- Turn the clock on or off with the Clock switch, or the clock button in the
  fullscreen controls.
- Resize the clock with the slider next to the switch, by scrolling over it,
  or with a two-finger pinch. Drag it to move it. Size, place, and on/off are
  remembered.
- Go fullscreen for an unobstructed view. Move the pointer or tap to reveal
  the fullscreen controls, including the background selector.
- Leaving fullscreen opens a confirmation: Keep watching or Exit fullscreen.
- Settings are saved when your browser allows local storage.

## Keyboard shortcuts

- 1, 2, 3, 4: choose a screensaver.
- Left / Right arrow: previous / next screensaver.
- Space: pause or resume, when the screen itself has focus.
- C: show or hide the clock.
- F: enter fullscreen or ask to exit.
- Esc: ask to exit fullscreen; in the confirmation, Esc keeps watching.

Browsers may show their own controls after Esc. Keep watching restores browser
fullscreen where it is supported; otherwise the demo uses a full-window view.

## Files

- index.html: complete demo page.
- styles.css: responsive layout and visual styles.
- app.js: all animation and interaction source code.
- peach.svg: the self-contained peach illustration.
- fonts/oswald-700.woff2: the clock font (Oswald Bold, SIL Open Font License,
  see fonts/OFL.txt).
- vercel.json: Vercel settings.
- README.md: these instructions.

The HTML, CSS, JavaScript, and SVG are editable source files. The demo has no
third-party packages, external font or image requests, or trackers.
