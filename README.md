# Beach Trainer

A single-file beach volleyball session tool for a solo coach running two courts.
Three tabs: **Library** (your exercises), **Plan** (build a session), **Run** (hands-free timer with beeps + court diagrams).

Everything is stored in your browser (`localStorage`) — no server, no account. Use **Export JSON** to back up or move a set of exercises/plans between devices, and **Import JSON** to load them.

## Put it online with GitHub Pages (free, ~3 min)

1. Create a GitHub account, then a new **public** repository — e.g. `beach-trainer`.
2. Upload `index.html` to the repo root (drag-and-drop in the GitHub web UI is fine).
3. Repo → **Settings** → **Pages**.
4. Under *Build and deployment*, Source = **Deploy from a branch**, Branch = **main**, folder = **/ (root)**. Save.
5. Wait ~1 minute. Your app is live at:
   `https://<your-username>.github.io/beach-trainer/`
6. Open that URL on your phone → browser menu → **Add to Home Screen**. It now opens like an app and works offline (except the first font load).

### Updating later
Edit `index.html` in the repo (or re-upload) → Pages redeploys automatically in a minute.

## Notes
- Data lives per-device in the browser. Clearing site data wipes it — export first.
- To share one canonical exercise set across your devices, export the JSON and import it on each, or commit a `data.json` and load it (ask and I'll wire that in).
