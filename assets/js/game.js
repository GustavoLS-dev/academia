/* =========================================================
   DNA FORTE — Minijogo "Desafio DNA FORTE"
   Cada repetição deixa o personagem mais forte e libera
   benefícios da academia. Sem dependências.
   ========================================================= */
(() => {
  'use strict';

  const root = document.querySelector('[data-game]');
  if (!root) return;

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- Configuração ---------- */
  const MAX_POINTS = 100;
  const LEVELS = [
    { at: 0, name: 'Iniciante' },
    { at: 10, name: 'Em evolução' },
    { at: 25, name: 'Dedicado' },
    { at: 45, name: 'Forte' },
    { at: 70, name: 'Muito forte' },
    { at: 100, name: 'DNA FORTE' },
  ];
  const COMBO_WINDOW = 480; // ms entre cliques para manter o combo

  /* ---------- Elementos ---------- */
  const el = {
    char: $('[data-g-char]', root),
    train: $('[data-g-train]', root),
    levelNum: $('[data-g-level-num]', root),
    levelName: $('[data-g-level-name]', root),
    reps: $('[data-g-reps]', root),
    meter: $('[data-g-meter]', root),
    fill: $('[data-g-fill]', root),
    combo: $('[data-g-combo]', root),
    fx: $('[data-g-fx]', root),
    aura: $('[data-g-aura]', root),
    win: $('[data-g-win]', root),
    reset: $('[data-g-reset]', root),
    skip: $('[data-g-skip]'),
    live: $('[data-g-live]'),
    perks: $$('[data-perk]'),
  };
  const c = (name) => $(`[data-c="${name}"]`, el.char);
  const part = {
    body: c('body'), torso: c('torso'), pecs: c('pecs'), abs: c('abs'), neck: c('neck'),
    legL: c('legL'), legR: c('legR'), shoeL: c('shoeL'), shoeR: c('shoeR'), shorts: c('shorts'),
    mouth: c('mouth'), eyeL: c('eyeL'), eyeR: c('eyeR'), sweat: c('sweat'),
  };

  /* ---------- Monta os braços (SVG) ---------- */
  const mk = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.appendChild(n);
    return n;
  };
  const buildArm = (g) => {
    const upper = mk('rect', { fill: 'url(#g-skin)', stroke: 'rgba(255,255,255,.1)' }, g);
    const bicep = mk('ellipse', { fill: 'url(#g-muscle)', stroke: '#E7B34C', 'stroke-width': 1.4 }, g);
    const delt = mk('circle', { cy: 4, fill: 'url(#g-muscle)', stroke: 'rgba(255,255,255,.12)' }, g);
    const elbow = mk('g', { transform: 'translate(0 54)' }, g);
    const fore = mk('g', {}, elbow);
    const forearm = mk('rect', { y: 0, height: 48, fill: 'url(#g-skin)', stroke: 'rgba(255,255,255,.1)' }, fore);
    const db = mk('g', { transform: 'translate(0 54)' }, fore);
    const bar = mk('rect', { x: -22, y: -2.5, width: 44, height: 5, rx: 2, fill: '#c9c9c9' }, db);
    const plateA = mk('rect', { rx: 2.5, fill: 'url(#g-gold)' }, db);
    const plateB = mk('rect', { rx: 2.5, fill: 'url(#g-gold)' }, db);
    const hand = mk('circle', { cy: 50, fill: 'url(#g-skin)' }, fore);
    return { g, upper, bicep, delt, fore, forearm, bar, plateA, plateB, hand };
  };
  const armL = buildArm(c('armL'));
  const armR = buildArm(c('armR'));

  const absRects = [];
  for (let i = 0; i < 6; i++) absRects.push(mk('rect', { rx: 3 }, part.abs));

  /* ---------- Estado ---------- */
  const state = {
    points: 0,
    reps: 0,
    shown: 0,          // força exibida (anima até "points")
    curl: 0,           // 0 = braço esticado, 1 = rosca completa
    curlFrom: 0, curlStart: 0, curlPhase: 'idle',
    combo: 0, lastRep: 0,
    heat: 0,           // "suor"
    level: 0,
    won: false,
    raf: 0,
  };

  /* ---------- Desenho do personagem ---------- */
  function draw() {
    const s = Math.min(1, state.shown / MAX_POINTS); // 0..1
    const k = state.curl;
    const S = 78 + 58 * s;      // ombros
    const W = 56 + 14 * s;      // cintura
    const A = 16 + 16 * s;      // braço
    const F = 13 + 9 * s;       // antebraço
    const L = 24 + 14 * s;      // perna
    const N = 18 + 10 * s;      // pescoço
    const D = 11 + 10 * s;      // deltoide
    const P = 14 + 18 * s;      // tamanho da anilha

    part.body.setAttribute('transform', `translate(0 ${(k * 2.5).toFixed(2)})`);
    part.torso.setAttribute('d',
      `M${150 - S / 2} 110 Q${150 - S / 2} 98 ${150 - S / 2 + 12} 98 L${150 + S / 2 - 12} 98 Q${150 + S / 2} 98 ${150 + S / 2} 110 L${150 + W / 2} 214 L${150 - W / 2} 214 Z`);
    part.neck.setAttribute('x', 150 - N / 2);
    part.neck.setAttribute('width', N);

    part.pecs.setAttribute('d',
      `M${150 - S * 0.36} 122 Q${150 - S * 0.18} ${140 + 8 * s} 150 128 Q${150 + S * 0.18} ${140 + 8 * s} ${150 + S * 0.36} 122`);
    part.pecs.setAttribute('opacity', (0.2 + 0.7 * s).toFixed(2));

    const absOp = s < 0.3 ? 0 : ((s - 0.3) / 0.7) * 0.85;
    absRects.forEach((r, i) => {
      const col = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      const w = 10 + 4 * s;
      r.setAttribute('x', 150 + (col < 0 ? -w - 2 : 2));
      r.setAttribute('y', 150 + row * 19);
      r.setAttribute('width', w);
      r.setAttribute('height', 15);
      r.setAttribute('opacity', absOp.toFixed(2));
    });

    part.shorts.setAttribute('d',
      `M${150 - W / 2 - 3} 206 L${150 + W / 2 + 3} 206 L${150 + W / 2 + 8} 252 L153 252 L150 238 L147 252 L${150 - W / 2 - 8} 252 Z`);

    const legLx = 150 - 5 - L, legRx = 155;
    [[part.legL, legLx], [part.legR, legRx]].forEach(([leg, x]) => { leg.setAttribute('x', x); leg.setAttribute('width', L); leg.setAttribute('rx', L / 2.4); });
    part.shoeL.setAttribute('x', legLx - 6); part.shoeL.setAttribute('width', L + 8);
    part.shoeR.setAttribute('x', legRx - 2); part.shoeR.setAttribute('width', L + 8);

    // braços
    [[armL, -1], [armR, 1]].forEach(([arm, side]) => {
      const x = 150 + side * (S / 2 + 2);
      arm.g.setAttribute('transform', `translate(${x.toFixed(1)} 108) rotate(${-side * 8})`);
      arm.upper.setAttribute('x', -A / 2); arm.upper.setAttribute('y', -2);
      arm.upper.setAttribute('width', A); arm.upper.setAttribute('height', 58); arm.upper.setAttribute('rx', A / 2);
      const flex = k * (0.4 + 0.6 * s);
      arm.bicep.setAttribute('cx', side * -1.5);
      arm.bicep.setAttribute('cy', 26 - flex * 3);
      arm.bicep.setAttribute('rx', (A / 2 + 2 + 4 * s + flex * 5).toFixed(1));
      arm.bicep.setAttribute('ry', (11 + 6 * s + flex * 4).toFixed(1));
      arm.bicep.setAttribute('stroke-opacity', (0.15 + 0.6 * s).toFixed(2));
      arm.delt.setAttribute('r', D);
      arm.fore.setAttribute('transform', `rotate(${(side * k * 150).toFixed(1)})`);
      arm.forearm.setAttribute('x', -F / 2); arm.forearm.setAttribute('width', F); arm.forearm.setAttribute('rx', F / 2);
      arm.hand.setAttribute('r', F / 2 + 2);
      arm.plateA.setAttribute('x', -24); arm.plateA.setAttribute('width', 8);
      arm.plateA.setAttribute('y', -P / 2); arm.plateA.setAttribute('height', P);
      arm.plateB.setAttribute('x', 16); arm.plateB.setAttribute('width', 8);
      arm.plateB.setAttribute('y', -P / 2); arm.plateB.setAttribute('height', P);
    });

    // rosto: esforço durante a rosca
    const effort = k > 0.45;
    part.mouth.setAttribute('d', effort ? 'M141 68 L159 68' : 'M140 66 Q150 74 160 66');
    [part.eyeL, part.eyeR].forEach((e) => e.setAttribute('ry', effort ? 0.9 : 2.6));
    part.sweat.setAttribute('opacity', Math.min(1, state.heat).toFixed(2));

    el.aura.style.setProperty('--s', s.toFixed(3));
  }

  /* ---------- Loop de animação ---------- */
  const UP = 130, DOWN = 220;
  function tick(t) {
    let busy = false;

    // rosca
    if (state.curlPhase === 'up') {
      const p = Math.min(1, (t - state.curlStart) / UP);
      state.curl = state.curlFrom + (1 - state.curlFrom) * easeOut(p);
      if (p >= 1) { state.curlPhase = 'down'; state.curlStart = t; }
      busy = true;
    } else if (state.curlPhase === 'down') {
      const p = Math.min(1, (t - state.curlStart) / DOWN);
      state.curl = 1 - easeInOut(p);
      if (p >= 1) { state.curlPhase = 'idle'; state.curl = 0; }
      busy = true;
    }

    // força exibida acompanha os pontos
    const diff = state.points - state.shown;
    if (Math.abs(diff) > 0.05) { state.shown += diff * 0.18; busy = true; } else state.shown = state.points;

    // suor esfria com o tempo
    if (state.heat > 0) { state.heat = Math.max(0, state.heat - 0.006); busy = true; }

    draw();
    state.raf = busy ? requestAnimationFrame(tick) : 0;
  }
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const loop = () => { if (!state.raf) state.raf = requestAnimationFrame(tick); };

  /* ---------- Uma repetição ---------- */
  function rep(e) {
    if (state.won) return;
    const now = performance.now();
    state.combo = now - state.lastRep < COMBO_WINDOW ? state.combo + 1 : 1;
    state.lastRep = now;
    const mult = state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;

    state.reps += 1;
    state.points = Math.min(MAX_POINTS, state.points + mult);
    state.heat = Math.min(1, state.heat + 0.12 * mult);

    if (reduceMotion) { state.curl = 0; state.shown = state.points; draw(); }
    else { state.curlFrom = state.curl; state.curlStart = now; state.curlPhase = 'up'; loop(); }

    floatText(`+${mult}`, e);
    showCombo(mult);
    updateHud();
    checkLevel();
  }

  function floatText(text, e) {
    if (reduceMotion) return;
    const span = document.createElement('span');
    span.className = 'stage__float';
    span.textContent = text;
    const r = el.char.getBoundingClientRect();
    let x = r.width / 2 + (Math.random() * 80 - 40);
    let y = r.height * 0.35;
    if (e && e.clientX && e.currentTarget === el.char) { x = e.clientX - r.left; y = e.clientY - r.top; }
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    el.fx.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }

  let comboTimer = 0;
  function showCombo(mult) {
    clearTimeout(comboTimer);
    if (mult > 1) {
      el.combo.textContent = `Combo x${mult}!`;
      el.combo.classList.remove('is-pop'); void el.combo.offsetWidth; el.combo.classList.add('is-pop');
      el.combo.classList.add('is-on');
    }
    comboTimer = setTimeout(() => el.combo.classList.remove('is-on'), COMBO_WINDOW + 200);
  }

  function updateHud() {
    el.reps.textContent = state.reps;
    const pct = Math.round((state.points / MAX_POINTS) * 100);
    el.fill.style.width = `${pct}%`;
    el.meter.setAttribute('aria-valuenow', pct);
  }

  function checkLevel() {
    let lvl = 0;
    LEVELS.forEach((l, i) => { if (state.points >= l.at) lvl = i; });
    if (lvl > state.level) {
      for (let i = state.level + 1; i <= lvl; i++) unlockPerk(i - 1, true);
      state.level = lvl;
      el.levelNum.textContent = lvl + 1;
      el.levelName.textContent = LEVELS[lvl].name;
      levelUpFx();
      el.live.textContent = `Nível ${lvl + 1}: ${LEVELS[lvl].name}. Benefício desbloqueado: ${$('strong', el.perks[lvl - 1]).textContent}.`;
      if (lvl === LEVELS.length - 1) win();
    }
  }

  function unlockPerk(i, animate) {
    const p = el.perks[i];
    if (!p || !p.classList.contains('is-locked')) return;
    p.classList.remove('is-locked');
    if (animate && !reduceMotion) { p.classList.add('is-new'); setTimeout(() => p.classList.remove('is-new'), 1400); }
  }

  function levelUpFx() {
    root.classList.remove('is-levelup'); void root.offsetWidth; root.classList.add('is-levelup');
    if (reduceMotion) return;
    // partículas douradas
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('span');
      b.className = 'stage__spark';
      const ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.3;
      const dist = 90 + Math.random() * 70;
      b.style.setProperty('--tx', `${Math.cos(ang) * dist}px`);
      b.style.setProperty('--ty', `${Math.sin(ang) * dist}px`);
      b.style.setProperty('--r', `${Math.random() * 360}deg`);
      el.fx.appendChild(b);
      b.addEventListener('animationend', () => b.remove());
    }
    const lv = document.createElement('span');
    lv.className = 'stage__lvlup';
    lv.textContent = 'Subiu de nível!';
    el.fx.appendChild(lv);
    lv.addEventListener('animationend', () => lv.remove());
  }

  function win() {
    state.won = true;
    el.train.disabled = true;
    setTimeout(() => { el.win.hidden = false; root.classList.add('is-won'); el.reset.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
  }

  function reset() {
    Object.assign(state, { points: 0, reps: 0, shown: 0, curl: 0, curlPhase: 'idle', combo: 0, heat: 0, level: 0, won: false });
    el.win.hidden = true;
    root.classList.remove('is-won');
    el.train.disabled = false;
    el.levelNum.textContent = 1;
    el.levelName.textContent = LEVELS[0].name;
    el.perks.forEach((p) => p.classList.add('is-locked'));
    updateHud();
    draw();
    el.train.focus({ preventScroll: true });
  }

  /* ---------- Eventos ---------- */
  el.train.addEventListener('click', rep);
  el.char.addEventListener('click', rep);
  el.reset.addEventListener('click', reset);
  el.skip.addEventListener('click', () => {
    el.perks.forEach((p, i) => unlockPerk(i, true));
    el.live.textContent = 'Todos os benefícios foram exibidos.';
  });
  // o link "Quero me matricular" da tela final também rola até o formulário
  $$('[data-join]', el.win).forEach((a) => a.addEventListener('click', () => {
    const n = document.getElementById('f-name');
    if (n) setTimeout(() => n.focus({ preventScroll: true }), 700);
  }));

  draw();
  updateHud();
})();
