/* DNA FORT — Prévia 2: recursos interativos */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '5511964202707';
  const wa = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;

  const HOURS = { 0: ['08:00', '12:00'], 1: ['06:00', '23:00'], 2: ['06:00', '23:00'], 3: ['06:00', '23:00'], 4: ['06:00', '23:00'], 5: ['06:00', '23:00'], 6: ['08:00', '14:00'] };
  const SCHEDULE = {
    1: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Pilates'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['18h50', 'Jump'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    2: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Jump'], ['08h30', 'Funcional'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Funcional'], ['20h30', 'Muay Thai']],
    3: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Pilates'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['18h50', 'Jump'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    4: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Jump'], ['08h30', 'Funcional'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Funcional'], ['20h30', 'Fit Dance']],
    5: [['06h30 – 09h30', 'Cross Training'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    6: [['08h30', 'Funcional']],
    0: [],
  };
  const TIMES = {
    'Musculação': 'Seg a sex 06h–23h · Sáb 08h–14h',
    'Cross Training': 'Seg a sex 06h30–09h30 e 16h30–22h',
    'Pilates': 'Seg e qua 07h30 e 19h30 · Sex 19h30',
    'Funcional': 'Ter e qui 08h30 e 19h30 · Sáb 08h30',
    'Fit Dance': 'Seg, qua e sex 08h30 e 20h30 · Qui 20h30',
    'Jump': 'Seg e qua 18h50 · Ter e qui 07h30',
    'Muay Thai': 'Terça 20h30',
  };
  const GOALS = {
    forca: { label: 'ganhar massa e força', mods: ['Musculação', 'Cross Training', 'Funcional'] },
    emagrecer: { label: 'emagrecer', mods: ['Jump', 'Cross Training', 'Fit Dance', 'Funcional'] },
    bemestar: { label: 'postura e bem-estar', mods: ['Pilates', 'Funcional', 'Musculação'] },
    luta: { label: 'aprender a lutar', mods: ['Muay Thai', 'Cross Training'] },
  };
  const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  const now = () => {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = (t) => p.find((x) => x.type === t).value;
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: +g('hour') * 60 + +g('minute') };
    } catch (e) { const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  };
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmtH = (s) => { const [h, m] = s.split(':'); return m === '00' ? `${h}h` : `${h}h${m}`; };

  /* Aberto agora + horário de hoje */
  function status() {
    const t = now(); const today = HOURS[t.day];
    const td = $('[data-today]'); if (td) td.textContent = `${today[0]} – ${today[1]}`;
    $$('.hours tr[data-days]').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').map(Number).includes(t.day)));
    const el = $('[data-status]'); if (!el) return;
    let open = false, text;
    if (t.min >= toMin(today[0]) && t.min < toMin(today[1])) { open = true; text = `Aberto agora · até ${fmtH(today[1])}`; }
    else if (t.min < toMin(today[0])) text = `Abre hoje às ${fmtH(today[0])}`;
    else { const d = (t.day + 1) % 7; text = `Abre ${DAYS[d]} às ${fmtH(HOURS[d][0])}`; }
    $('[data-status-text]', el).textContent = text;
    el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); el.hidden = false;
  }

  /* Números contando */
  function counters() {
    const els = $$('[data-count]');
    const run = (el) => {
      const target = +el.dataset.count; if (reduce) { el.textContent = target; return; }
      const t0 = performance.now(), dur = 1200;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .5 });
    els.forEach((e) => io.observe(e));
  }

  /* Qual é o seu objetivo? */
  function goals() {
    const btns = $$('[data-goal]'); const out = $('[data-goal-result]'); if (!out) return;
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const g = GOALS[b.dataset.goal];
      out.innerHTML = `<ul class="goal__list">${g.mods.map((m, i) => `<li style="--n:${i}"><strong>${m}</strong><span>${TIMES[m]}</span></li>`).join('')}</ul>
        <a class="btn btn--y btn--block" href="${wa(`Olá! Meu objetivo é ${g.label}. Quero agendar uma aula experimental grátis na DNA FORT.`)}" target="_blank" rel="noopener">Agendar aula grátis</a>`;
    }));
  }

  /* Filtro de modalidades */
  function filters() {
    const btns = $$('[data-filter]'); const mods = $$('[data-mods] .mod');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const f = b.dataset.filter;
      mods.forEach((m) => m.classList.toggle('is-hidden', f !== 'all' && !m.dataset.cat.split(' ').includes(f)));
    }));
  }

  /* Aulas por dia */
  function classes() {
    const list = $('[data-classes]'); const btns = $$('[data-days] button'); const label = $('[data-day-label]');
    if (!list) return;
    const today = now().day;
    const show = (d) => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.day === d)));
      if (label) label.textContent = d === today ? 'hoje' : (d === 0 || d === 6 ? `no ${DAYS[d]}` : `na ${DAYS[d]}`);
      const items = SCHEDULE[d] || [];
      list.innerHTML = items.length
        ? items.map(([h, n], i) => `<li style="--n:${i}"><span>${n}</span><strong>${h}</strong></li>`).join('')
        : '<li class="is-empty">Sem aulas coletivas. Musculação liberada das 08h às 12h.</li>';
    };
    btns.forEach((b) => b.addEventListener('click', () => show(+b.dataset.day)));
    show(today);
  }

  /* IMC */
  function bmi() {
    const f = $('[data-bmi]'); if (!f) return;
    const val = $('[data-bmi-val]'), lab = $('[data-bmi-label]'), mk = $('[data-bmi-marker]');
    const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const upd = () => {
      const h = parseFloat(String(f.h.value).replace(',', '.')), w = parseFloat(String(f.w.value).replace(',', '.'));
      if (!(h >= 100 && h <= 230 && w >= 30 && w <= 300)) { val.textContent = '—'; lab.textContent = (f.h.value || f.w.value) ? 'Confira altura (cm) e peso (kg)' : 'Preencha altura e peso'; mk.classList.remove('is-on'); return; }
      const b = w / Math.pow(h / 100, 2);
      val.textContent = fmt.format(b);
      lab.textContent = b < 18.5 ? 'Abaixo do peso' : b < 25 ? 'Peso normal' : b < 30 ? 'Sobrepeso' : 'Obesidade';
      mk.style.left = `${Math.max(1, Math.min(99, ((b - 15) / 25) * 100))}%`; mk.classList.add('is-on');
    };
    f.addEventListener('input', upd); f.addEventListener('submit', (e) => e.preventDefault());
  }

  /* Barra do celular aparece depois do hero */
  function mbar() {
    const bar = $('[data-mbar]'); const hero = $('.hero'); if (!bar || !hero) return;
    const upd = () => bar.classList.toggle('is-on', scrollY > hero.offsetHeight * .6);
    addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* Entrada suave */
  function reveal() {
    const els = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach((e) => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => {
    [status, counters, goals, filters, classes, bmi, mbar, reveal].forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
  });
})();
