# AGENTS.md — CivicAI

## Architecture
- `public/index.html` is the whole UI: a compact vanilla-JS SPA. `S` holds UI state, `R()` re-renders `#app` from view functions (`homeV`, `repV`, `detV`, `nearV`, `adash`, …), and `go(v)` navigates. **The visual design is owner-approved. Do not change CSS, layout or markup structure unless asked.**
- Complaints come from **one source of truth**, `/api/complaints` (`netlify/functions/complaints.ts`, Postgres via Drizzle). The client caches them in `C`, reloads on every navigation, and polls every 15s. `refresh()` skips re-rendering while a form is being edited. The API maps DB columns to the short client field names (`cat,d,loc,pri,st,dept,n,up,fb…`).
- Feedback: `POST /api/complaints/:id/feedback`. There is one row per device per complaint (unique constraint). Duplicate submissions get a 409 response.
- Photos: `POST /api/photos` (raw image body, stored in the Blobs store `complaint-photos`) and `GET /api/photos/:key`. A complaint stores only the blob key.
- "Mine" = `owner` (random device id in localStorage, sent as the `x-civic-device` header) or a matching citizen name (auth is still a mock login).
- Maps: `initMap()` runs after every render when `#lmap` exists. It builds the map for the report step 2 picker, Nearby Issues and the admin map/heatmap. `S.here` is the user's location (GPS or a spot chosen on the map). `S.mv` keeps the map view across re-renders.
- i18n: `t(key, params)` together with the helpers `tc/ts/tp/td` for category, status, priority and department. DB values stay in English and are translated only for display. Add each new string to `public/i18n/en.js` and to all other locales. Language is stored in localStorage under `civicai.lang`.

## Conventions
- Escape user-provided text with `esc()` before interpolating it into HTML.
- Schema changes: edit `db/schema.ts`, then run `npx drizzle-kit generate --name <verb_change>`. Never edit applied migrations. The seed data is in the custom migration `*_seed_complaints`.
