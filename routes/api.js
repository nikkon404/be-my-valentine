const { Router } = require('express');
const config = require('../config');
const { readRows, writeRows } = require('../lib/csv');
const { randomCode, isValidCode } = require('../lib/code');

const router = Router();
const { STATUS, MAX_NAME_LENGTH } = config;

/** Allow only letters, numbers, and spaces; collapse spaces; enforce max length. */
function sanitizeName(name) {
  const s = (name || '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH);
  return s;
}

const NAME_VALIDATION_MSG = 'Name can only contain letters, numbers, and spaces (max ' + MAX_NAME_LENGTH + ' characters).';

function normalizeCode(code) {
  return (code || '').trim().toLowerCase();
}

router.post('/generate', (req, res) => {
  const name = sanitizeName(req.body.name);
  if (!name) {
    return res.status(400).json({ error: NAME_VALIDATION_MSG });
  }

  const rows = readRows();
  const existing = new Set(rows.map((r) => r.code));
  let code;
  do {
    code = randomCode();
  } while (existing.has(code));

  rows.push({ code, name, status: STATUS.NOT_RESPONDED });
  writeRows(rows);

  const url = `${req.protocol}://${req.get('host')}/?code=${code}`;
  res.json({ code, url });
});

router.get('/status', (req, res) => {
  const code = normalizeCode(req.query.code);
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }

  const rows = readRows();
  const row = rows.find((r) => r.code.toLowerCase() === code);
  if (!row) {
    return res.json({ found: false, message: 'Invalid code' });
  }

  const message =
    row.status === STATUS.YES || row.status === 'responded'
      ? 'They said yes.'
      : row.status === STATUS.NO
        ? 'They said no.'
        : 'They haven\'t responded.';
  res.json({
    found: true,
    name: row.name,
    status: row.status,
    message,
  });
});

router.get('/lookup', (req, res) => {
  const code = normalizeCode(req.query.code);
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }

  const rows = readRows();
  const row = rows.find((r) => r.code.toLowerCase() === code);
  if (!row) {
    return res.status(404).json({ error: 'Invalid code' });
  }

  res.json({ name: row.name, status: row.status });
});

router.post('/respond', (req, res) => {
  const code = normalizeCode(req.body.code);
  const response = (req.body.response || '').trim().toLowerCase();
  if (!isValidCode(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }
  if (response !== STATUS.YES && response !== STATUS.NO) {
    return res.status(400).json({ error: 'Response must be yes or no' });
  }

  const rows = readRows();
  const idx = rows.findIndex((r) => r.code.toLowerCase() === code);
  if (idx === -1) {
    return res.status(404).json({ error: 'Invalid code' });
  }

  rows[idx].status = response;
  writeRows(rows);
  res.json({ ok: true });
});

module.exports = router;
