# Be My Valentines

A small Valentine link generator: create a shareable link, send it, and see if they said yes or no.

**Demo:** [https://be-my-valentine-f6434.web.app/](https://be-my-valentine-f6434.web.app/)

## Screenshots

**Homepage** — generate a link, check status

![Homepage](screenshots/1.png)

**Valentine page** — Yes / No (with the cat)

![Valentine page](screenshots/2.png)

**Status page** — see if they responded

![Status](screenshots/3.png)

## Firebase Hosting

- **Stack:** Hosting + Firestore (client-side), free Spark plan.
- **Config:** Copy `.env.example` → `.env`, add your [Firebase web config](https://console.firebase.google.com) values. `npm run deploy` generates `firebase-config.js` from env and deploys.
- **Local:** `npm run serve`
- **CI:** Add repo secrets `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, etc. and `FIREBASE_SERVICE_ACCOUNT_BE_MY_VALENTINE_F6434` (service account JSON). Workflow runs `build:config` then deploys on push to `main`.

## Credits

Cats from [Nuko](https://nukochannel.neocities.org).
