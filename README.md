# Be My Valentines

A small Valentine link generator: create a shareable link, send it, and see if they said yes or no.

## Screenshots

**Homepage** — generate a link, check status

![Homepage](screenshots/1.png)

**Valentine page** — Yes / No (with the cat)

![Valentine page](screenshots/2.png)

**Status page** — see if they responded

![Status](screenshots/3.png)

## Firebase config (required)

The app uses Firestore from the browser (no Cloud Functions), so it runs on the **free Spark plan**.

**Option A – env vars (recommended)**  
1. Copy `.env.example` to `.env`.  
2. In [Firebase Console](https://console.firebase.google.com) → your project → **Project settings** → **Your apps** → copy the web app config.  
3. Fill in `.env` with `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, etc.  
4. Run `npm run build:config` to generate `public/js/firebase-config.js` from env.  
5. `npm run deploy` runs `build:config` first.

**Option B – edit the file**  
Edit `public/js/firebase-config.js` and replace the placeholders. (The web `apiKey` is safe in client code; security is Firestore rules.)

## Run locally

```bash
npm run serve
```

Or with Hosting + Functions emulators:

```bash
firebase emulators:start --only hosting,functions
```

Open the URL shown (e.g. http://localhost:5000).

## Deploy (Firebase)

```bash
npm run deploy
```

Or `firebase deploy`. Requires Firebase CLI and a project linked via `.firebaserc`.

## Credits

- **Cats from [Nuko](https://nukochannel.neocities.org)** — Nuko Channel button/link in the corner.
