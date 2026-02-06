/**
 * Homepage: generate link, copy URL, check status.
 */

import { sanitizeNameInput, NAME_VALIDATION_MSG } from './utils.js';
import { createLink } from './firestore-client.js';

export function initGenerator() {
  document.body.classList.add('generator-mode');

  const nameInput = document.getElementById('generator-name');
  const getLinkBtn = document.getElementById('btn-get-link');
  const resultEl = document.getElementById('generator-result');
  const codeEl = document.getElementById('generator-code');
  const urlInput = document.getElementById('generator-url');
  const copyBtn = document.getElementById('btn-copy-link');
  const statusCodeInput = document.getElementById('status-code');
  const checkStatusBtn = document.getElementById('btn-check-status');

  if (getLinkBtn && nameInput && resultEl && urlInput && copyBtn) {
    getLinkBtn.addEventListener('click', () => {
      const name = sanitizeNameInput(nameInput.value);
      if (!name) {
        alert(NAME_VALIDATION_MSG);
        return;
      }
      nameInput.value = name;
      getLinkBtn.disabled = true;
      getLinkBtn.textContent = '…';
      createLink(name)
        .then((data) => {
          if (codeEl) codeEl.textContent = data.code || '';
          urlInput.value = data.url;
          resultEl.classList.remove('hidden');
          getLinkBtn.textContent = 'Link generated';
          getLinkBtn.disabled = true;
        })
        .catch((err) => {
          getLinkBtn.textContent = 'Get link';
          getLinkBtn.disabled = false;
          const msg = err?.message || 'Could not generate link. Check Firebase config.';
          alert(msg);
        });
    });

    copyBtn.addEventListener('click', () => {
      const url = urlInput.value;
      if (!url) return;
      navigator.clipboard.writeText(url).then(
        () => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        },
        () => { copyBtn.textContent = 'Copy'; }
      );
    });
  }

  if (checkStatusBtn && statusCodeInput) {
    checkStatusBtn.addEventListener('click', () => {
      const code = statusCodeInput.value.trim().toLowerCase();
      if (!code) return;
      window.open('status.html?code=' + encodeURIComponent(code), '_blank');
    });
  }
}
