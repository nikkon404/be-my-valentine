/**
 * Cloud Functions for Valentines: generate, status, lookup, respond.
 * Uses Firestore collection "links" (doc id = code, fields: name, status).
 */
/* eslint-disable require-jsdoc */

const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const CODE_LENGTH = 7;
const MAX_NAME_LENGTH = 64;
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const STATUS = {
  NOT_RESPONDED: "not responded",
  YES: "yes",
  NO: "no",
};

function randomCode() {
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

function isValidCode(code) {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim().toLowerCase();
  if (trimmed.length !== CODE_LENGTH) return false;
  for (let i = 0; i < trimmed.length; i++) {
    if (!CHARS.includes(trimmed[i])) return false;
  }
  return true;
}

function sanitizeName(name) {
  return (name || "")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_NAME_LENGTH);
}

function normalizeCode(code) {
  return (code || "").trim().toLowerCase();
}

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, data) {
  res.status(status).type("application/json").send(JSON.stringify(data));
}

/** Single HTTP handler: route by path to generate, status, lookup, respond. */
exports.api = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const path = (req.path || "").replace(/\/$/, "");
  const linksRef = db.collection("links");

  try {
    if (path === "/api/generate" && req.method === "POST") {
      const name = sanitizeName((req.body && req.body.name));
      if (!name) {
        json(res, 400, {
          error:
            "Name can only contain letters, numbers, and spaces (max " +
            MAX_NAME_LENGTH +
            " characters).",
        });
        return;
      }
      let code;
      let exists = true;
      let attempts = 0;
      while (exists && attempts < 20) {
        code = randomCode();
        const snap = await linksRef.doc(code).get();
        exists = snap.exists;
        attempts++;
      }
      if (exists) {
        json(res, 500, {error: "Could not generate unique code."});
        return;
      }
      await linksRef.doc(code).set({
        name,
        status: STATUS.NOT_RESPONDED,
      });
      const host =
        req.headers["x-forwarded-host"] ||
        req.headers["host"] ||
        "";
      const proto = req.headers["x-forwarded-proto"] || "https";
      const base = host ? `${proto}://${host}` : "";
      const url = base ? `${base}/?code=${code}` : `/?code=${code}`;
      json(res, 200, {code, url});
      return;
    }

    if (path === "/api/status" && req.method === "GET") {
      const code = normalizeCode((req.query && req.query.code));
      if (!isValidCode(code)) {
        json(res, 400, {error: "Invalid code format"});
        return;
      }
      const snap = await linksRef.doc(code).get();
      if (!snap.exists) {
        json(res, 200, {found: false, message: "Invalid code"});
        return;
      }
      const d = snap.data();
      const status = (d.status || "").toLowerCase();
      const message =
        status === STATUS.YES || status === "responded" ?
          "They said yes." :
          status === STATUS.NO ?
            "They said no." :
            "They haven't responded.";
      json(res, 200, {
        found: true,
        name: d.name,
        status: d.status,
        message,
      });
      return;
    }

    if (path === "/api/lookup" && req.method === "GET") {
      const code = normalizeCode((req.query && req.query.code));
      if (!isValidCode(code)) {
        json(res, 400, {error: "Invalid code format"});
        return;
      }
      const snap = await linksRef.doc(code).get();
      if (!snap.exists) {
        json(res, 404, {error: "Invalid code"});
        return;
      }
      const d = snap.data();
      json(res, 200, {name: d.name, status: d.status});
      return;
    }

    if (path === "/api/respond" && req.method === "POST") {
      const code = normalizeCode((req.body && req.body.code));
      const raw = (req.body && req.body.response) || "";
      const response = raw.trim().toLowerCase();
      if (!isValidCode(code)) {
        json(res, 400, {error: "Invalid code format"});
        return;
      }
      if (response !== STATUS.YES && response !== STATUS.NO) {
        json(res, 400, {error: "Response must be yes or no"});
        return;
      }
      const ref = linksRef.doc(code);
      const snap = await ref.get();
      if (!snap.exists) {
        json(res, 404, {error: "Invalid code"});
        return;
      }
      await ref.update({status: response});
      json(res, 200, {ok: true});
      return;
    }

    json(res, 404, {error: "Not found"});
  } catch (err) {
    console.error(err);
    json(res, 500, {error: "Server error"});
  }
});
