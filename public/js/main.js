/**
 * Entry: route to generator (homepage) or valentine (link with ?code=).
 */

import { isValentinePage } from './utils.js';
import { initGenerator } from './generator.js';
import { initValentine } from './valentine.js';

document.addEventListener('DOMContentLoaded', () => {
  if (isValentinePage()) {
    initValentine();
  } else {
    initGenerator();
  }
});
