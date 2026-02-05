/**
 * Entry: route to generator (homepage) or valentine (link with ?code=).
 */

import { isValentinePage } from './utils.js';
import { initGenerator } from './generator.js';
import { initValentine } from './valentine.js';

function ensureFirebaseApp() {
  const firebase = window.firebase;
  const firebaseConfig = window.firebaseConfig;
  if (!firebase || !firebaseConfig) return;
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
