/**
 * Entry: route to generator (homepage) or valentine (link with ?code=).
 */

import { isValentinePage } from './utils.js';
import { initGenerator } from './generator.js';
import { initValentine } from './valentine.js';

function ensureFirebaseApp() {
  if (typeof firebase === "undefined" || typeof firebaseConfig === "undefined") return;
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ensureFirebaseApp();
  if (isValentinePage()) {
    initValentine();
  } else {
    initGenerator();
  }
});
