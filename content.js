// ==============================================================================
// BGA Carcassonne Real-time Tile Counter (Visual Image Grid Layout)
// ==============================================================================

const BGA_TILE_INDEX_TO_CODE = {
  0: "CCCR",   1: "CCCRS",  2: "CCFF",   3: "CCFFS",  4: "CCRR",
  5: "CCRRS",  6: "CFCF",   7: "CFCFS",  8: "CCFF2",  9: "CFCF2",
  10: "CFFF",  11: "CFFF",  12: "CFRR",  13: "CRRF",  14: "CRRR",
  15: "CRFR",  16: "RFRF",  17: "RFRF",  18: "RRFF",  19: "RRFF",
  20: "RRFF",  21: "RRRF",  22: "RRRF",  23: "RRRR",  24: "FFFF",
  25: "RFFF",  26: "CCCCS", 27: "CCCF",  28: "CCCFS"
};

const ORIGINAL_SET_COMPOSITION = {
  "CCCCS": 1, "RRRR": 1, "CCCF": 3, "CCCFS": 1,  "CCCR": 1, "CCCRS": 2,
  "RRRF": 4, "CFCF": 1, "CFCFS": 2, "RFRF": 8, "CCFF": 3, "CCFFS": 2,
  "CCRR": 3, "CCRRS": 2, "RRFF": 9, "CCFF2": 2, "CFCF2": 3, "RFFF": 2,
  "FFFF": 4, "CFFF": 5, "CRRF": 3, "CFRR": 3, "CRRR": 3, "CRFR": 4
};

let activeObserver = null;
let calculationTimer = null;

function getGameContext() {
  let docs = [document];
  document.querySelectorAll("iframe").forEach(f => {
    try { if (f.contentDocument) docs.push(f.contentDocument); } catch(e) {}
  });

  for (const doc of docs) {
    const container = doc.getElementById("game_play_area") || doc.getElementById("map_scrollable");
    if (container) {
      return { doc, container };
    }
  }

  return { doc: document, container: null };
}

function createFloatingPanel(targetDoc) {
  if (targetDoc.getElementById("bga-carcassonne-counter-panel")) return;

  const panel = targetDoc.createElement("div");
  panel.id = "bga-carcassonne-counter-panel";
  panel.innerHTML = `
    <div id="bga-counter-header">
      <span>🏰 Carcassonne Tracker</span>
      <span id="bga-counter-toggle" style="font-size:11px;">▼</span>
    </div>
    <div id="bga-counter-content">
      <div id="bga-counter-table-wrapper">Számolás...</div>
    </div>
  `;

  targetDoc.body.appendChild(panel);

  const header = targetDoc.getElementById("bga-counter-header");
  const content = targetDoc.getElementById("bga-counter-content");
  const toggle = targetDoc.getElementById("bga-counter-toggle");

  header.addEventListener("click", () => {
    if (content.style.display === "none") {
      content.style.display = "block";
      toggle.innerText = "▼";
    } else {
      content.style.display = "none";
      toggle.innerText = "▲";
    }
  });
}

function parseSpriteIndex(bgPosStr, el) {
  if (!bgPosStr) return 0;

  const pctMatch = bgPosStr.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  if (pctMatch) {
    const pctX = Math.abs(parseFloat(pctMatch[1]));
    const pctY = Math.abs(parseFloat(pctMatch[2]));

    const col = Math.round((pctX / 100) * 22);
    const row = pctY > 10 ? 1 : 0;

    return row * 23 + col;
  }

  const pxMatch = bgPosStr.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/);
  if (pxMatch) {
    const x = Math.abs(parseFloat(pxMatch[1]));
    const y = Math.abs(parseFloat(pxMatch[2]));
    const tileSize = (el && el.offsetWidth > 0) ? el.offsetWidth : 88;

    const col = Math.round(x / tileSize);
    const row = Math.round(y / tileSize);

    return row * 23 + col;
  }

  return 0;
}

function scheduleCalculation() {
  clearTimeout(calculationTimer);
  calculationTimer = setTimeout(extractAndCalculateTiles, 200);
}

function extractAndCalculateTiles() {
  const { doc, container } = getGameContext();
  if (!container) return;

  const rawElements = Array.from(container.querySelectorAll(".tile_art, [id^='tile_art_']"));
  
  const uniqueTilesMap = new Map();
  rawElements.forEach(el => {
    if (el.id && el.id !== "tile_art_current" && el.id.startsWith("tile_art_")) {
      uniqueTilesMap.set(el.id, el);
    }
  });

  const playedCounts = {};
  let totalPlayedCount = 0;

  uniqueTilesMap.forEach((el) => {
    const computedStyle = doc.defaultView.getComputedStyle(el);
    const bgPos = el.style.backgroundPosition || computedStyle.backgroundPosition;

    const tileIndex = parseSpriteIndex(bgPos, el);

    if (tileIndex !== null && BGA_TILE_INDEX_TO_CODE.hasOwnProperty(tileIndex)) {
      const code = BGA_TILE_INDEX_TO_CODE[tileIndex];
      playedCounts[code] = (playedCounts[code] || 0) + 1;
      totalPlayedCount++;
    }
  });

  renderVisualGrid(doc, playedCounts, totalPlayedCount);
}

function renderVisualGrid(doc, playedCounts, totalPlayed) {
  const wrapper = doc.getElementById("bga-counter-table-wrapper");
  if (!wrapper) return;

  let totalSet = 0;
  let totalRemaining = 0;
  let gridHtml = `<div class="bga-tiles-grid">`;

  for (const [code, originalCount] of Object.entries(ORIGINAL_SET_COMPOSITION)) {
    const played = playedCounts[code] || 0;
    const remaining = originalCount - played;

    totalSet += originalCount;
    totalRemaining += remaining;

    const imageUrl = chrome.runtime.getURL(`tiles/${code}.png`);
    const isOutOfStock = remaining <= 0;

    gridHtml += `
      <div class="bga-tile-card ${isOutOfStock ? 'out-of-stock' : ''}" title="${code} (Kint: ${played} / Össz: ${originalCount})">
        <img src="${imageUrl}" alt="${code}" />
        <div class="bga-tile-badge">${remaining}</div>
      </div>
    `;
  }

  gridHtml += `</div>`;

  // Alsó összesítő sáv
  gridHtml += `
    <div class="bga-summary-bar">
      <span>Kint: <span class="bga-summary-out">${totalPlayed}</span></span>
      <span>Maradt: <span class="bga-summary-rem">${totalRemaining}</span> / ${totalSet}</span>
    </div>
  `;

  wrapper.innerHTML = gridHtml;
}

function checkAndInitInFrame() {
  const { doc, container } = getGameContext();
  const isCarcassonneMatch = container !== null;

  if (isCarcassonneMatch) {
    createFloatingPanel(doc);
    extractAndCalculateTiles();

    if (!activeObserver) {
      activeObserver = new doc.defaultView.MutationObserver(() => scheduleCalculation());
      activeObserver.observe(container, { childList: true, subtree: true, attributes: true });
    }
  } else {
    const panel = doc.getElementById("bga-carcassonne-counter-panel");
    if (panel) panel.remove();
    if (activeObserver) {
      activeObserver.disconnect();
      activeObserver = null;
    }
  }
}

setInterval(checkAndInitInFrame, 1000);