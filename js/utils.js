/**
 * Shared utilities: URL params, API client, name sanitization.
 */

export function getValentineCode() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  return (code && code.trim()) ? code.trim() : null;
}

export function isValentinePage() {
  return getValentineCode() !== null;
}

export function api(path, options = {}) {
  const opts = { ...options };
  if (opts.body && typeof opts.body === 'string') {
    opts.headers = { ...opts.headers, 'Content-Type': 'application/json' };
  }
  return fetch(path, opts).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
}

const NAME_MAX_LENGTH = 64;

export function sanitizeNameInput(val) {
  return (val || '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX_LENGTH);
}

export const NAME_VALIDATION_MSG =
  'Name can only contain letters, numbers, and spaces (max ' + NAME_MAX_LENGTH + ' characters).';
