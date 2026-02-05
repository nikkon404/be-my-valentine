/**
 * Reads Firebase config from env and writes public/js/firebase-config.js.
 * Run before deploy: npm run build:config (or it runs automatically before deploy).
 *
 * Required env vars (or in .env):
 *   FIREBASE_API_KEY
 *   FIREBASE_AUTH_DOMAIN
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_STORAGE_BUCKET
 *   FIREBASE_MESSAGING_SENDER_ID
 *   FIREBASE_APP_ID
 */

const fs = require("fs");
const path = require("path");

// Load .env if present (optional)
try {
  require("dotenv").config();
} catch (_) { }

const env = (key) => process.env[key] || "";

const config = {
  apiKey: env("FIREBASE_API_KEY"),
  authDomain: env("FIREBASE_AUTH_DOMAIN"),
  projectId: env("FIREBASE_PROJECT_ID"),
  storageBucket: env("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("FIREBASE_APP_ID"),
};

const outPath = path.join(__dirname, "..", "public", "js", "firebase-config.js");
const content = `/**
 * Firebase config (generated from env). Do not commit if it contains real keys.
 * See .env.example and scripts/generate-firebase-config.js.
 */
// eslint-disable-next-line no-unused-vars
var firebaseConfig = ${JSON.stringify(config, null, 2)};

if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}
`;

fs.writeFileSync(outPath, content, "utf8");
console.log("Wrote " + outPath);

if (!config.apiKey || config.apiKey === "YOUR_API_KEY") {
  console.warn("Warning: FIREBASE_API_KEY not set. Set env vars or add a .env file (see .env.example).");
}
