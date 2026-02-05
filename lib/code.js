const { CODE_LENGTH } = require('../config');

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomCode() {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

function isValidCode(code) {
  if (!code || typeof code !== 'string') return false;
  const trimmed = code.trim().toLowerCase();
  if (trimmed.length !== CODE_LENGTH) return false;
  for (let i = 0; i < trimmed.length; i++) {
    if (!CHARS.includes(trimmed[i])) return false;
  }
  return true;
}

module.exports = { randomCode, isValidCode };
