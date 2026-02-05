const fs = require('fs');
const { CSV_PATH } = require('../config');

const HEADERS = 'code,name,status\n';

function ensureCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, HEADERS, 'utf8');
  }
}

function readRows() {
  ensureCsv();
  const text = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 3) {
      rows.push({
        code: parts[0].trim(),
        name: parts[1].trim(),
        status: parts[2].trim(),
      });
    }
  }
  return rows;
}

function writeRows(rows) {
  const lines = [HEADERS.trim()].concat(
    rows.map((r) => `${r.code},${r.name},${r.status}`)
  );
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8');
}

module.exports = { ensureCsv, readRows, writeRows };
