/**
 * Valentine page: custom cursor, push-cat animation, pointer lock, Yes/No response.
 */

import { api } from './utils.js';

const CONFIG = {
  WIND_ZONE_PADDING: 50,
  PUSH_DURATION_MS: 1700,
  CAT_EMERGE_MS: 180,
  DANCE_DURATION_MS: 2800,
  PUSH_OFFSET_PX: 38,
  CAT_RUN_GIF: 'gifs/run2.gif',
  CAT_HEART_GIF: 'gifs/heart.gif',
};

export function initValentineInteraction(elements) {
  const { code, mainScreen, successScreen, noScreen } = elements;
  const cursor = document.getElementById('custom-cursor');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const cursorWind = document.getElementById('cursor-wind');
  const pushCat = document.getElementById('push-cat');
  const pushCatImg = document.getElementById('push-cat-img');

  let displayX = window.innerWidth / 2;
  let displayY = window.innerHeight / 2;
  let windAnimating = false;
  let pointerLockActive = false;

  if (mainScreen) mainScreen.setAttribute('aria-hidden', 'false');

  function getNoZone() {
    if (!btnNo) return null;
    const rect = btnNo.getBoundingClientRect();
    return {
      left: rect.left - CONFIG.WIND_ZONE_PADDING,
      right: rect.right + CONFIG.WIND_ZONE_PADDING,
      top: rect.top - CONFIG.WIND_ZONE_PADDING,
      bottom: rect.bottom + CONFIG.WIND_ZONE_PADDING,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  }

  function isInNoZone(x, y, zone) {
    return zone && x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
  }

  function getYesCenter() {
    if (!btnYes) return null;
    const rect = btnYes.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function updateCursor(showPush, catX, catY) {
    cursor.style.transform = `translate(${displayX}px,${displayY}px)`;
    cursor.classList.toggle('wind-active', showPush);
    if (cursorWind && showPush) {
      const yes = getYesCenter();
      if (yes) {
        const angle = (Math.atan2(yes.y - displayY, yes.x - displayX) * 180) / Math.PI;
        cursorWind.style.transform = 'rotate(' + angle + 'deg)';
      }
    }
    cursor.style.setProperty('--cursor-tilt', showPush ? 14 : 0);
    if (pushCat) {
      if (showPush && catX != null && catY != null) pushCat.classList.add('visible');
      else pushCat.classList.remove('visible');
    }
  }

  function startPushAnimation() {
    if (windAnimating) return;
    const yesCenter = getYesCenter();
    const noZone = getNoZone();
    if (!yesCenter) return;

    windAnimating = true;
    const startX = displayX;
    const startY = displayY;
    const startTime = performance.now();
    const catStartX = noZone ? noZone.right - 12 : startX + 60;
    const catStartY = noZone ? noZone.centerY : startY;

    if (pushCat && pushCatImg) {
      pushCatImg.src = CONFIG.CAT_RUN_GIF;
      pushCat.style.transform = `translate(${catStartX}px,${catStartY}px) scale(0.55)`;
      pushCat.classList.add('visible');
    }

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / CONFIG.PUSH_DURATION_MS, 1);
      const easeT = 1 - Math.pow(1 - t, 1.6);
      displayX = startX + (yesCenter.x - startX) * easeT;
      displayY = startY + (yesCenter.y - startY) * easeT;
      const catBehindX = displayX + CONFIG.PUSH_OFFSET_PX;
      const emergeT = Math.min(elapsed / CONFIG.CAT_EMERGE_MS, 1);
      const emergeEase = 1 - Math.pow(1 - emergeT, 1.4);
      const catX = catStartX + (catBehindX - catStartX) * emergeEase;
      const catY = catStartY + (displayY - catStartY) * emergeEase;
      const catScale = 0.55 + 0.45 * emergeEase;
      if (pushCat) pushCat.style.transform = `translate(${catX}px,${catY}px) scale(${catScale})`;
      updateCursor(true, catX, catY);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        windAnimating = false;
        displayX = yesCenter.x;
        displayY = yesCenter.y;
        updateCursor(false);
        if (pushCat && pushCatImg) {
          pushCatImg.src = CONFIG.CAT_HEART_GIF;
          pushCat.style.transform = `translate(${yesCenter.x - 20}px,${yesCenter.y}px) scale(1)`;
          pushCat.classList.add('visible');
          setTimeout(() => {
            pushCat.classList.remove('visible');
            pushCatImg.src = CONFIG.CAT_RUN_GIF;
          }, CONFIG.DANCE_DURATION_MS);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  function clampCursorToViewport() {
    displayX = Math.max(0, Math.min(window.innerWidth, displayX));
    displayY = Math.max(0, Math.min(window.innerHeight, displayY));
  }

  function onMouseMove(e) {
    if (windAnimating) return;
    if (pointerLockActive) {
      displayX += e.movementX || 0;
      displayY += e.movementY || 0;
      clampCursorToViewport();
    } else {
      displayX = e.clientX;
      displayY = e.clientY;
    }
    const zone = getNoZone();
    if (isInNoZone(displayX, displayY, zone)) {
      startPushAnimation();
      return;
    }
    updateCursor(false);
  }

  function onPointerLockChange() {
    pointerLockActive = document.pointerLockElement === document.body;
    const hint = document.getElementById('click-hint');
    if (hint) hint.classList.toggle('hidden', pointerLockActive);
    if (!pointerLockActive) {
      document.body.addEventListener('click', onLockClick, { once: true });
    }
  }

  function onLockClick(e) {
    if (document.pointerLockElement) return;
    displayX = e.clientX;
    displayY = e.clientY;
    document.body.requestPointerLock();
  }

  function onClickWhenLocked(e) {
    if (!pointerLockActive || windAnimating) return;
    const el = document.elementFromPoint(displayX, displayY);
    if (el && (el === btnYes || btnYes.contains(el))) {
      e.preventDefault();
      showResponse('yes');
    } else if (el && (el === btnNo || btnNo.contains(el))) {
      e.preventDefault();
      showResponse('no');
    }
  }

  function showResponse(response) {
    if (document.pointerLockElement) document.exitPointerLock();
    mainScreen.classList.add('hidden');
    if (response === 'yes') {
      successScreen.classList.add('visible');
      successScreen.setAttribute('aria-hidden', 'false');
    } else if (noScreen) {
      noScreen.classList.add('visible');
      noScreen.setAttribute('aria-hidden', 'false');
    }
    api('/api/respond', {
      method: 'POST',
      body: JSON.stringify({ code, response }),
    }).catch(() => { });
  }

  btnYes.addEventListener('click', () => showResponse('yes'));
  if (btnNo) btnNo.addEventListener('click', () => showResponse('no'));

  document.documentElement.style.cursor = 'none';
  document.body.style.cursor = 'none';
  document.addEventListener('mousemove', (e) => onMouseMove(e), { passive: true });
  document.addEventListener('click', onClickWhenLocked, true);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  updateCursor(false);
  document.body.addEventListener('click', onLockClick, { once: true });
}
