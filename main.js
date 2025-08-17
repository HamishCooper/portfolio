// main.js — static controller with desktop column config
const grid = document.getElementById('grid');
const infoPanel = document.getElementById('info-panel');
const infoMedia = document.getElementById('info-media');
const infoTitle = document.getElementById('info-title');
const infoSubtitle = document.getElementById('info-subtitle');
const infoMeta = document.getElementById('info-meta');
const infoBody = document.getElementById('info-body');
const infoBlocks = document.getElementById('info-blocks');
const backArrow = document.getElementById('back-arrow');
const credentials = document.getElementById('credentials');
const credentialsBR = document.getElementById('credentials-br');
const backgroundOverlay = document.getElementById('background-overlay');

// mobile scroll restore
let savedScrollY = 0;

// ======= EDIT THIS: Desktop column assignment by name or title (case-insensitive) =======
const columnsConfig = {
  col1: ["knock", "batterytool"],
  col2: ["hubana"],
  col3: ["paintings"],
  col4: ["tommytooth", "comic"],
  col5: ["ao", "monsterpinball", "multiballpinball"],
  col6: ["timeline","proposal"],
  col7: ["spongebabies"]
  // Add more columns as needed; entries may be cfg.name or cfg.title.
};
// ===============================================================================

function mediaThumb(cfg){
  if (cfg.image){
    const img = document.createElement('img'); img.src = cfg.image; return img;
  }
  if (cfg.videoSrc){
    const v = document.createElement('video'); v.src = cfg.videoSrc; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true; return v;
  }
  const d=document.createElement('div'); d.style.background='rgba(255,255,255,.06)'; return d;
}

function createCard(cfg){
  const card=document.createElement('div');
  card.className='card';
  card.style.width=(cfg.width||240)+'px';
  card.style.height=(cfg.height||320)+'px';
  card.style.borderRadius=(cfg.cornerRadiusDefault??24)+'px';
  const m=document.createElement('div'); m.className='media'; m.appendChild(mediaThumb(cfg)); card.appendChild(m);
  card.addEventListener('click',()=>openDetail(cfg));
  return card;
}


function renderCredits(cfg){
  if (!cfg) return '';
  const SEP = '&nbsp;&nbsp;.&nbsp;&nbsp;';
  const teamLabel  = (cfg.teamLabel || (cfg.credits && cfg.credits.teamLabel) || 'TEAM').toUpperCase();
  const toolsLabel = (cfg.toolsLabel || (cfg.credits && cfg.credits.toolsLabel) || 'TOOLS').toUpperCase();

  function esc(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  let teamItems = [];
  if (cfg.credits && Array.isArray(cfg.credits.team)){
    teamItems = cfg.credits.team.map(p => ({ name: p && (p.name || p.Name) || '', role: p && (p.role || p.roll || p.Role || p.Roll) || ''})).filter(p => p.name || p.role);
  } else if (Array.isArray(cfg.creditsTeam)){
    teamItems = cfg.creditsTeam.map(p => ({ name: p && (p.name || p.Name) || '', role: p && (p.role || p.roll || p.Role || p.Roll) || ''})).filter(p => p.name || p.role);
  } else if (typeof cfg.team === 'string'){
    const parts = cfg.team.split(/\s*\|\s*/);
    parts.forEach(part => {
      const nameMatch = part.match(/name\s*;\s*([^,|]+)/i);
      const roleMatch = part.match(/ro?le\s*;\s*([^,|]+)/i);
      if (nameMatch || roleMatch){
        teamItems.push({ name: (nameMatch && nameMatch[1].trim()) || '', role: (roleMatch && roleMatch[1].trim()) || '' });
      }
    });
  }

  let toolsArr = [];
  if (cfg.credits && Array.isArray(cfg.credits.tools)){
    toolsArr = cfg.credits.tools.map(String);
  } else if (Array.isArray(cfg.creditsTools)){
    toolsArr = cfg.creditsTools.map(String);
  } else if (typeof cfg.tools === 'string'){
    toolsArr = cfg.tools.split(/\s*,\s*/);
  }

  let out = '';
  if (teamItems.length){
    out += esc(teamLabel) + ':<br>' +
           teamItems.map(p => `<strong>${esc(p.name)}</strong>${p.role ? '<br>' + esc(p.role) : ''}`).join('<br><br>') +
           '<br><br>';
  }
  if (toolsArr.length){
    out += esc(toolsLabel) + ':<br>' + toolsArr.map(esc).join(SEP);
  }
  return out;
}

function fillInfo(cfg){
  infoMedia.innerHTML='';
  let creditsDiv = document.getElementById('credits');
  if (!creditsDiv){ creditsDiv = document.createElement('div'); creditsDiv.id = 'credits'; }
  // (moved) don't append here; we'll append after hero so order stays hero -> credits


  const hero = cfg.image || cfg.videoSrc;
  if (hero){
    let el;
    if (cfg.image){
      el = document.createElement('img');
      el.src = hero;
    }else{
      el = document.createElement('video');
      el.src = hero;
      // --- Autoplay reliably on mobile/tablet ---
      el.muted = true;
      el.autoplay = true;
      el.playsInline = true;
      el.loop = true;
      el.setAttribute('muted','');
      el.setAttribute('autoplay','');
      el.setAttribute('playsinline','');
      el.setAttribute('loop','');
      el.controls = true;
      const p = el.play(); if (p && p.catch) p.catch(()=>{});
      el.addEventListener('canplay', () => el.play(), { once:true });
    }
    const frame = document.createElement('div');
frame.className = 'hero-frame';
frame.style.width = '201px';
frame.style.overflow = 'hidden';
frame.appendChild(el);
infoMedia.appendChild(frame);

// Size the frame so tall media is capped to 50% of viewport height,
// and crop from the bottom (top-justified).
function sizeHero(){
  const cap = Math.round(window.innerHeight * 0.6);
  let mediaW = 201;
  let mediaH = 0;
  if (el.tagName === 'IMG'){
    if (el.naturalWidth) mediaH = Math.round(el.naturalHeight * (mediaW / el.naturalWidth));
  } else if (el.tagName === 'VIDEO'){
    if (el.videoWidth) mediaH = Math.round(el.videoHeight * (mediaW / el.videoWidth));
  }
  if (!mediaH){ mediaH = cap; }
  const targetH = Math.min(mediaH, cap);
  frame.style.height = targetH + 'px';
  if (mediaH > cap){
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.objectFit = 'cover';
    el.style.objectPosition = 'top';
  } else {
    el.style.width = '100%';
    el.style.height = 'auto';
    el.style.objectFit = 'contain';
    el.style.objectPosition = 'top';
  }
}
if (el.tagName === 'IMG'){
  if (el.complete) sizeHero(); else el.addEventListener('load', sizeHero, { once:true });
} else {
  el.addEventListener('loadedmetadata', sizeHero, { once:true });
}
window.addEventListener('resize', sizeHero, { passive:true });
    // Append credits AFTER hero so it appears below (desktop) / to the right (mobile)
    if (creditsDiv){ infoMedia.appendChild(creditsDiv); }
    if (creditsDiv) creditsDiv.innerHTML = renderCredits(cfg);
  }

  infoTitle.textContent = cfg.title || '';
  infoSubtitle.textContent = cfg.subtitle || '';
  infoMeta.textContent = cfg.meta || '';
  infoBody.textContent = cfg.body || '';

  infoBlocks.innerHTML = '';
  (cfg.blocks || []).forEach(b => {
    if (b.type === 'image'){
      const i = document.createElement('img'); i.src = b.src; infoBlocks.appendChild(i);
    } else if (b.type === 'videoSrc'){
      const v = document.createElement('video');
      v.src = b.src;
      // Block videos: user-controlled (no autoplay, not muted)
      v.playsInline = true;
      v.controls = true;
      v.preload = 'metadata';
      infoBlocks.appendChild(v);
    } else if (b.type === 'text'){
      const p = document.createElement('p'); p.textContent = b.content || ''; infoBlocks.appendChild(p);
    }
  });
}

function updateOverlayHeight(){
  backgroundOverlay.style.height = Math.max(document.body.scrollHeight, window.innerHeight) + 'px';
}

function openDetail(cfg){
  // Lock scroll on mobile BEFORE any class changes to avoid jumps
  const isMobile = window.matchMedia('(max-width: 820px)').matches;
  if (isMobile){document.body.classList.add('scroll-lock');
  }

  backArrow.classList.add('visible');
  document.body.classList.add('detail-open');
  document.body.classList.remove('base');

  fillInfo(cfg);
  void infoPanel.offsetWidth;
  infoPanel.classList.add('visible');
  infoPanel.scrollTop = 0;
  requestAnimationFrame(()=>{ infoPanel.scrollTop = 0; });

  requestAnimationFrame(updateOverlayHeight);
  window.addEventListener('resize', updateOverlayHeight);
  window.addEventListener('scroll', updateOverlayHeight);
  if (window.matchMedia('(min-width: 821px)').matches){ window.scrollTo(0,0); }
}requestAnimationFrame(updateOverlayHeight);
  window.addEventListener('resize', updateOverlayHeight);
  window.addEventListener('scroll', updateOverlayHeight);
  


function closeDetail(){


  backArrow.classList.remove('visible');
  infoPanel.classList.remove('visible');
  // Stop block videos
  infoBlocks.querySelectorAll('video').forEach(v => { try{ v.pause(); v.currentTime = 0; }catch(e){} });

  backgroundOverlay.style.height='';
  window.removeEventListener('resize', updateOverlayHeight);
  window.removeEventListener('scroll', updateOverlayHeight);
  const isMobile = window.matchMedia('(max-width: 820px)').matches;
  if (isMobile){
    document.body.classList.remove('scroll-lock');}
  document.body.classList.remove('detail-open');
  document.body.classList.add('base');

}

backArrow.addEventListener('click', closeDetail);

// ===== Grid building (responsive) =====
function normalizeKey(s){ return (s||'').toLowerCase().trim(); }

function buildGridDesktopColumns(data){
  grid.innerHTML = '';

  // Lookup maps
  const byName = new Map();
  const byTitle = new Map();
  data.forEach(cfg => {
    if (cfg && cfg.name)  byName.set(normalizeKey(cfg.name), cfg);
    if (cfg && cfg.title) byTitle.set(normalizeKey(cfg.title), cfg);
  });

  const assigned = new Set();

  // Build configured columns
  Object.entries(columnsConfig).forEach(([colName, ids]) => {
    const col = document.createElement('div');
    col.className = 'col';
    col.dataset.col = colName;

    (ids || []).forEach(id => {
      const key = normalizeKey(id);
      const cfg = byName.get(key) || byTitle.get(key);
      if (cfg && !assigned.has(cfg)) {
        assigned.add(cfg);
        col.appendChild(createCard(cfg));
      }
    });

    // Append only non-empty columns to avoid gaps
    if (col.children.length) grid.appendChild(col);
  });

  // Append leftovers in a trailing column (optional)
  const leftovers = data.filter(cfg => !assigned.has(cfg));
  if (leftovers.length) {
    const col = document.createElement('div');
    col.className = 'col';
    col.dataset.col = 'misc';
    leftovers.forEach(cfg => col.appendChild(createCard(cfg)));
    grid.appendChild(col);
  }
}

function buildGridMobile(data){
  grid.innerHTML='';
  data.forEach(cfg => grid.appendChild(createCard(cfg)));
}

function isDesktop(){ return window.matchMedia('(min-width: 821px)').matches; }

function buildGrid(){
  const data = (typeof shapeConfigs !== 'undefined' ? shapeConfigs : (window.shapeConfigs || []));
  if(isDesktop()){
    buildGridDesktopColumns(data);
  }else{
    buildGridMobile(data);
  }
}

window.addEventListener('resize', () => {
  // Rebuild only when crossing desktop/mobile boundary
  const nowDesktop = isDesktop();
  if(buildGrid._lastDesktop !== nowDesktop){
    buildGrid();
    buildGrid._lastDesktop = nowDesktop;
  }
});

// init
document.body.classList.add('base');
buildGrid._lastDesktop = isDesktop();
buildGrid();

/* Ticker engine: endless, two-speed, resize-safe */
(() => {
  const host = document.getElementById('brand-ticker');
  const track = host && host.querySelector('.track');
  if (!host || !track) return;

  // Copy whatever background-image the old CSS applied
  const bgStr = getComputedStyle(track).backgroundImage;
  if (!bgStr || bgStr === 'none') return;

  // Build two strips and then remove the original bg to avoid double-draw
  const A = document.createElement('div');
  const B = document.createElement('div');
  A.className = 'ticker-strip'; B.className = 'ticker-strip';
  A.style.backgroundImage = bgStr; B.style.backgroundImage = bgStr;
  track.appendChild(A); track.appendChild(B);
  track.style.backgroundImage = 'none';

  // Extract sprite URL to measure intrinsic width
  const urlMatch = bgStr.match(/url\((?:\"|')?([^\)"']+)(?:\"|')?\)/i);
  if (!urlMatch) return;
  const spriteURL = urlMatch[1];
  const img = new Image(); img.decoding = 'async'; img.src = spriteURL;

  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;
  const getPPS = () => {
    const styles = getComputedStyle(host);
    const m = parseFloat(styles.getPropertyValue('--mobile-pps')) || 40;
    const d = parseFloat(styles.getPropertyValue('--desktop-pps')) || 80;
    return isMobile() ? m : d;
  };

  let pps = getPPS();
  let tileW = 0, viewW = 0, offset = 0, last = undefined, raf = null;

  function measure(){
    // Height is 60% of ticker height per CSS
    const h = A.clientHeight || (host.clientHeight * 0.60);
    if (!img.naturalWidth || !img.naturalHeight) return false;
    const scale = h / img.naturalHeight;
    tileW = Math.max(1, Math.round(img.naturalWidth * scale));
    viewW = track.clientWidth;
    const stripW = viewW + tileW;
    [A,B].forEach(s => { s.style.width = stripW + 'px'; s.style.left = '0px'; });
    B.style.transform = `translate3d(${stripW}px, -50%, 0)`;
    return true;
  }

  function place(x){
    const stripW = viewW + tileW;
    let local = x % tileW; if (local > 0) local -= tileW;
    A.style.transform = `translate3d(${local}px, -50%, 0)`;
    B.style.transform = `translate3d(${local + stripW}px, -50%, 0)`;
  }

  function loop(t){
    if (last == null) last = t;
    const dt = Math.min(64, t - last) / 1000; last = t;
    offset -= pps * dt;
    if (offset < -1e7) offset += 1e7;
    place(offset);
    raf = requestAnimationFrame(loop);
  }

  function start(){
    if (!measure()) return;
    pps = getPPS();
    if (raf) cancelAnimationFrame(raf);
    last = undefined;
    raf = requestAnimationFrame(loop);
  }

  function onResize(){
    const prevTile = tileW, prevOffset = offset;
    measure();
    if (tileW > 0 && prevTile > 0){
      const ratio = tileW / prevTile;
      offset = prevOffset * ratio;
      place(offset);
    }
    pps = getPPS();
  }

  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotionPref(){
    if (mqReduce.matches){
      if (raf) cancelAnimationFrame(raf);
      A.style.transform = 'translate3d(0, -50%, 0)';
      B.style.transform = 'translate3d(0, -50%, 0)';
    }else{
      start();
    }
  }
  mqReduce.addEventListener('change', applyMotionPref);

  let pending = null;
  window.addEventListener('resize', () => {
    if (pending) cancelAnimationFrame(pending);
    pending = requestAnimationFrame(onResize);
  });
  window.matchMedia('(max-width: 820px)').addEventListener('change', () => { pps = getPPS(); });

  img.addEventListener('load', applyMotionPref, { once: true });
  if (img.complete) applyMotionPref();
})();

// === Desktop: per-column compressor (idempotent, test-accurate) ===
(() => {
  if (window.__colCompressTestAccurate) return;
  window.__colCompressTestAccurate = true;

  const DESKTOP_Q = '(min-width: 821px)';
  const MIN = 130;

  const isDesktop = () => window.matchMedia(DESKTOP_Q).matches;

  function getBaseHeight(card){
    if (card.dataset && card.dataset.cfgH) return parseFloat(card.dataset.cfgH);
    const cs = getComputedStyle(card);
    const viaVar = parseFloat(cs.getPropertyValue('--cfg-h')) || 0;
    const viaAttr = parseFloat(card.getAttribute('data-height')) || 0;
    const viaInline = parseFloat(card.style.height) || 0;
    const viaRect = Math.max(1, Math.floor(card.getBoundingClientRect().height)) || 320;
    const base = viaVar || viaAttr || viaInline || viaRect;
    card.dataset.cfgH = String(base);
    return base;
  }

  function columnNodes(grid){
    const realCols = grid.querySelectorAll('.col, .column, [data-col], [data-column]');
    if (realCols && realCols.length) return Array.from(realCols);
    const cards = Array.from(grid.querySelectorAll('.card'));
    if (!cards.length) return [];
    const grect = grid.getBoundingClientRect();
    const EPS = 2;
    const keys = [];
    const groups = [];
    for (const card of cards){
      const left = Math.round(card.getBoundingClientRect().left - grect.left);
      let idx = keys.findIndex(k => Math.abs(k - left) <= EPS);
      if (idx < 0) { keys.push(left); groups.push([]); idx = groups.length - 1; }
      groups[idx].push(card);
    }
    return groups.map(arr => ({ __virtual: true, __cards: arr }));
  }

  function columnGapPx(colNode){
    if (colNode.__virtual) return 0;
    const cs = getComputedStyle(colNode);
    const rg = parseFloat(cs.rowGap || cs.gap) || 0;
    return rg;
  }

  function apply(){
    const grid = document.getElementById('grid');
    if (!grid) return;

    if (!isDesktop() || document.body.classList.contains('detail-open')){
      grid.querySelectorAll('.card').forEach(c => {
        const h = getBaseHeight(c);
        c.style.height = h + 'px';
        c.style.minHeight = MIN + 'px';
      });
      return;
    }

    const cols = columnNodes(grid);

    for (const colNode of cols){
      const cards = colNode.__virtual ? colNode.__cards : Array.from(colNode.querySelectorAll('.card'));
      if (!cards.length) continue;

      const baseHeights = cards.map(getBaseHeight);
      const n = baseHeights.length;

      let availableColHeight;
      if (!colNode.__virtual){
        const r = colNode.getBoundingClientRect();
        availableColHeight = Math.max(0, Math.floor(r.height));
      } else {
        const r = grid.getBoundingClientRect();
        availableColHeight = Math.max(0, Math.floor(r.height));
      }

      const gap = columnGapPx(colNode);
      const spacingTotal = Math.max(0, n - 1) * gap;

      const sumBase = baseHeights.reduce((a,b)=>a+b,0);

      if (sumBase + spacingTotal <= availableColHeight){
        cards.forEach((el,i) => {
          el.style.height = baseHeights[i] + 'px';
          el.style.minHeight = MIN + 'px';
        });
        continue;
      }

      const usableForHeights = Math.max(0, availableColHeight - spacingTotal);
      const scale = sumBase > 0 ? Math.min(1, usableForHeights / sumBase) : 1;
      let heights = baseHeights.map(h => Math.max(MIN, Math.floor(h * scale)));

      let totalWithSpacing = heights.reduce((a,b)=>a+b,0) + spacingTotal;
      if (totalWithSpacing > availableColHeight){
        let excess = totalWithSpacing - availableColHeight;
        const above = heights.map(h => Math.max(0, h - MIN));
        let adjustable = above.reduce((a,b)=>a+b,0);

        if (adjustable > 0){
          for (let i=0; i<n; i++){
            if (above[i] <= 0) continue;
            const share = excess * (above[i] / adjustable);
            heights[i] = Math.max(MIN, Math.floor(heights[i] - share));
          }
        }
      }

      cards.forEach((el,i) => {
        el.style.height = heights[i] + 'px';
        el.style.minHeight = MIN + 'px';
      });
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else { apply(); }
  window.addEventListener('resize', apply, { passive: true });
  new MutationObserver(apply).observe(document.getElementById('content') || document.body, { childList: true, subtree: true });
  new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})()


;
;


/* vert2horiz-auto-scroller */
(()=>{
  const DESKTOP_Q = '(min-width: 821px)';
  let scroller = null;

  function isDesktop(){ return window.matchMedia(DESKTOP_Q).matches; }
  function inDetail(){ return document.body.classList.contains('detail-open'); }

  function pickScroller(){
    const list = [
      document.getElementById('grid'),
      document.querySelector('#grid > .columns, .columns'),
      document.getElementById('content'),
      document.getElementById('gallery'),
      document.getElementById('rail'),
      document.getElementById('scroller'),
      document.querySelector('#content > *'),
      document.scrollingElement
    ];
    for (const el of list){
      if (!el) continue;
      try {
        const cs = getComputedStyle(el);
        const horiz = el.scrollWidth - el.clientWidth;
        if (horiz > 8 && cs.overflowX !== 'visible') return el;
      } catch(e){}
    }
    // last resort: scan shallow children of body
    for (const el of document.body.querySelectorAll(':scope > *')){
      try {
        if (el.scrollWidth - el.clientWidth > 8) return el;
      } catch(e){}
    }
    return document.scrollingElement || document.documentElement || document.body;
  }

  function onWheel(e){
    if (!isDesktop() || inDetail()) return;

    if (!scroller) scroller = pickScroller();
    if (!scroller) return;

    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    // only map when vertical intent dominates
    if (absY <= 0 || absY < absX * 0.75) return;

    const scale = (e.deltaMode === 1) ? 16 : (e.deltaMode === 2 ? window.innerHeight : 1);
    const dy = e.deltaY * scale;

    const before = scroller.scrollLeft;
    scroller.scrollLeft += dy;
    if (scroller.scrollLeft !== before){
      e.preventDefault();
    }
  }

  function init(){
    scroller = null; // recalc
    document.addEventListener('wheel', onWheel, { passive:false });
    window.addEventListener('resize', () => { scroller = null; }, { passive:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

