# Valentines

A small Valentine link generator: create a shareable link, send it, and see if they said yes or no.

## Screenshots

**Homepage** — generate a link, check status

![Homepage](screenshots/1.png)

**Valentine page** — Yes / No (with the cat)

![Valentine page](screenshots/2.png)

**Status page** — see if they responded

![Status](screenshots/3.png)

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploy (Hugging Face Spaces)

This app is deployed on Hugging Face Spaces:

**Live demo:** [https://huggingface.co/spaces/YOUR_USERNAME/valentines](https://huggingface.co/spaces/YOUR_USERNAME/valentines) *(replace `YOUR_USERNAME` with your Space)*

To deploy your own:

1. Create a new **Space** → **Docker**.
2. Push this repo and set the Space **Port** to **7860**.
3. The app uses `process.env.PORT` automatically.

## Credits

- **Cats from [Nuko](https://nukochannel.neocities.org)** — Nuko Channel button/link in the corner.
