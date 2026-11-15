# Beach Coach

A lightweight beach volleyball planner for a coach running one or more courts. No build step, server account, or backend is required.

- **Library:** 102 exercises, text search, phase filters, favourites, and editable instructions. Eight new coaching adaptations include level, progression, and source links.
- **Plan:** create, duplicate and reorder sessions; adjust durations and court distribution; print a session with its instructions. Includes 90/120-minute templates, two notes-based sessions, and a 90-minute setting/play session.
- **Run:** a countdown with automatic block transitions, sound toggle, previous/next controls, and restart. Elapsed time catches up after backgrounding. Supported browsers request a screen wake lock while running.
- **Diagrams:** 17 labelled SVG presets drawn on a 16 × 8 m court. Servers start outside the end line unless a drill intentionally uses short serving. Ball paths cross the net where appropriate. Drills without a matching diagram show instructions rather than an unrelated picture.

## Use locally or on GitHub Pages

Open `index.html` directly, or run `python3 -m http.server 8765` and visit `http://localhost:8765`.

For GitHub Pages, choose **Settings → Pages → Deploy from a branch → main / (root)**. The app will be at `https://steso.github.io/beach-coach/` once Pages is enabled. A home-screen shortcut can be added from a phone browser.

The full exercise library is embedded in the HTML so a downloaded copy works without network access. Hosted offline reload is **not** guaranteed: there is no service worker. Google Fonts are optional; system fonts work offline. Phones may suspend background audio, and wake lock support depends on the browser; keep the Run view visible when audible transitions matter.

## Saved sessions and backups

Data is stored in this browser's `localStorage`; it does not sync between devices. Export JSON regularly and before clearing browser data. Import validates exercises, durations, IDs and session references before changing data. Existing exercise and session IDs merge; replacing a library that would orphan sessions is rejected. Exercises referenced by a session cannot be deleted until removed from that session.

The first content upgrade updates built-in fields only when they still match the previous version. It preserves personal edits and favourites, adds the new drills and valid templates once, and does not restore deleted original drills. Existing session durations remain unchanged. If storage is unavailable, edits last for this page only and a backup reminder appears.

## Develop and verify

Edit exercise content in `library.json`, then run:

```sh
python3 scripts/sync-library.py
node --test tests/app.test.cjs
```

The synchronizer refreshes the embedded exercises and extra plans. Content migrations are explicit in `CONTENT_PATCHES`; future content releases need a new versioned migration so existing users receive intentional changes. Tests use Node's built-in runner and a small DOM harness: no dependencies are needed. They check data consistency, imports, migrations, timer catch-up, pause/restart, snapshot isolation and court distribution. They are logic tests, not browser layout or device-audio tests.

## Coaching sources

New exercises are original coaching adaptations, not verbatim reproductions or endorsements:

- [FIVB Beach Volleyball Drill Book](https://www.fivb.com/wp-content/uploads/2024/03/FIVB_Beachvolley_Drill-Book_EN.pdf), section 4.7: setting from varied passes.
- [USA Volleyball lesson plans](https://usavolleyball.org/resources-for-coaches/lesson-plans/): game-based, connected-contact practice and player-tracked scoring.
- [FIVB official rules](https://www.fivb.com/beach-volleyball/the-game/official-rules-of-the-games/): court dimensions and overhand attack wording.

The existing Better at Beach/FIVB/notes exercise collections retain their IDs and existing attribution. Some games deliberately modify standard match scoring or contacts; their instructions specify the training constraint.
