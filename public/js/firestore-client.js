/**
 * Firestore client for Spark plan: no Cloud Functions, direct read/write from browser.
 * Collection: links. Doc id = code. Fields: name, status.
 */

const CODE_LENGTH = 7;
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const STATUS_NOT_RESPONDED = "not responded";

function getDb() {
  if (typeof firebase === "undefined" || !firebase.firestore) {
    throw new Error("Firebase not loaded");
  }
  return firebase.firestore();
}

function randomCode() {
  let s = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

/**
 * Create a new link. Tries until we get a unique code (collision retry).
 * @param {string} name - Sanitized name
 * @returns {Promise<{code: string, url: string}>}
 */
export function createLink(name) {
  const db = getDb();
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, "") || window.location.origin;

  function tryCreate() {
    const code = randomCode();
    const ref = db.collection("links").doc(code);
    return ref.get().then((snap) => {
      if (snap.exists) return tryCreate();
      return ref.set({ name, status: STATUS_NOT_RESPONDED }).then(() => ({ code, url: `${baseUrl}/?code=${code}` }));
    });
  }
  return tryCreate();
}

/**
 * @param {string} code - 7-char code
 * @returns {Promise<{name: string, status: string}|null>}
 */
export function getLink(code) {
  if (!code || code.length !== CODE_LENGTH) return Promise.resolve(null);
  const normalized = code.trim().toLowerCase();
  return getDb()
    .collection("links")
    .doc(normalized)
    .get()
    .then((snap) => (snap.exists ? snap.data() : null));
}

/**
 * @param {string} code
 * @param {string} response - 'yes' or 'no'
 */
export function updateResponse(code, response) {
  const normalized = (code || "").trim().toLowerCase();
  if (normalized.length !== CODE_LENGTH || !["yes", "no"].includes(response)) return Promise.reject(new Error("Invalid"));
  return getDb().collection("links").doc(normalized).update({ status: response });
}
