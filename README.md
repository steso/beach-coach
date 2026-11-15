# Beach Coach

A lightweight beach volleyball planner for a coach running one or more courts. No build step, server account, or backend is required.

- **Library:** 108 exercises, text search, phase filters, favourites, and editable instructions. Eight new coaching adaptations include level, progression, and source links.
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

## Version 1.2.0

- **Updates on iOS:** the header shows the installed version. The single refresh-arrow button opens a fresh document URL without clearing browser storage. If a timer is running, reloading requires confirmation because timer progress resets. An older Home Screen copy needs one initial refresh or re-add before these controls appear. Changes to the app must update `APP_VERSION`, the visible badge/title and `version.json` together.
- **Language:** choose English or Deutsch in the header. The choice stays on this device. Controls, generator stages and coaching guidance are localized; exercise names and instructions remain as saved, including personal edits. German skill search includes Annahme/Baggern, Zuspiel/Pritschen, Angriff, Block, Umschalten, Abwehr and Aufschlag. Use the exercise editor for German exercise wording.
- **Session generator:** choose a topic (reception, setting, attack, block, transition or defense), or let a mixed session choose a random focus. Choose 45/60/90/120 minutes. It creates a new editable plan with easy warm-up play, isolated technique, decisions, linked drills, a topic-based game, normal-rules play and a short cool-down. Drill pools are curated by stage, not free keyword matches. It requires at least four players and limits active courts to those supporting 2v2; extra pairs rotate. Missing required drills produce a message without changing existing plans. Generated stage guidance survives JSON export/import and appears in printouts and Run.

The generator is a starting point: adjust feeds, intensity, repetitions and court organization for your group. It uses your current saved versions of drills, so personal exercise edits also affect generated sessions.

## Version 1.2.1

Compact mobile header with EN/DE and one refresh arrow. The generator is collapsed initially. New sessions and built-in template defaults use 8 players and 1 court; saved session configurations are preserved.

## Version 1.2.2

The generator is a single compact row: choose a topic and duration, then tap the dice. Existing plans with the old 14-player/2-court default migrate to 8 players/1 court once; other configurations and subsequent changes are preserved.

Six new low-intensity warm-up games enter the library and generator: 3 m manchette lanes, full-court manchette, two one-handed touches plus a partner return, catch/move/set, self-bump plus a partner return, and passing with position changes. The modified contact rules are explicit training variations. These six games display in English or German; edited fields stay as saved. Existing browsers receive them once without overwriting personal edits or restoring them after deletion.
