/**
 * Valentine page: check if already responded, then redirect to status or show Yes/No flow.
 */

import { getValentineCode } from './utils.js';
import { getLink } from './firestore-client.js';
import { initValentineInteraction } from './valentine-cursor.js';

const RESPONDED_YES = ['yes', 'responded'];
const MAX_NAME_DISPLAY = 64;

export function initValentine() {
  const code = getValentineCode();
  if (!code) return;

  document.body.classList.add('valentine-mode');

  const mainScreen = document.getElementById('main-screen');
  const successScreen = document.getElementById('success-screen');
  const noScreen = document.getElementById('no-screen');
  const nameEl = document.getElementById('valentine-name');

  getLink(code)
    .then((data) => {
      if (!data) {
        if (nameEl) nameEl.textContent = '?';
        initValentineInteraction({ code, mainScreen, successScreen, noScreen });
        return;
      }
      const status = (data.status || '').toLowerCase();
      if (RESPONDED_YES.includes(status) || status === 'no') {
        window.location.replace('status.html?code=' + encodeURIComponent(code));
        return;
      }
      if (nameEl && data.name) {
        nameEl.textContent = ', ' + (data.name + '').slice(0, MAX_NAME_DISPLAY);
      }
      initValentineInteraction({ code, mainScreen, successScreen, noScreen });
    })
    .catch(() => {
      if (nameEl) nameEl.textContent = '?';
      initValentineInteraction({ code, mainScreen, successScreen, noScreen });
    });
}
