# CivicAI

CivicAI lets citizens report civic problems (potholes, streetlights, water leaks…) with a photo, voice-dictated description and a map location, then track them as government departments act. Admins review, assign, prioritise and resolve complaints from a governance dashboard.

## Stack

- **Frontend:** a single-page vanilla JS app in `public/index.html` (original CivicAI design, unchanged styles).
- **Maps:** Leaflet + OpenStreetMap tiles. Nominatim does the location search and reverse geocoding.
- **Voice:** browser Web Speech API. The recognition language follows the preferred language (en-IN, kn-IN, hi-IN, te-IN, ta-IN, mr-IN).
- **i18n:** central dictionaries in `public/i18n/<locale>.js` (en, kn, hi, te, ta, mr) with fallback to English.
- **Backend:** Netlify Functions (`netlify/functions`). Complaints and feedback are stored in Netlify Database (Postgres, Drizzle ORM), and photos in Netlify Blobs.

## Run locally

```bash
npm install
netlify dev
```

Database migrations live in `netlify/database/migrations` and are applied automatically on deploy. After a schema change in `db/schema.ts`, run `npx drizzle-kit generate --name <change>`.
