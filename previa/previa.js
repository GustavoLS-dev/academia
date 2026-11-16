/* DNA FORT — Landing page (prévia) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const TRIAL_CLASS = true; // false = esconde "aula grátis"
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
  const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  const now = () => {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      const g = (t) => p.find((x) => x.type === t).value;
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), min: +g('hour') * 60 + +g('minute') };
    } catch (e) { const d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  };
  const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmtH = (s) => { const [h, m] = s.split(':'); return m === '00' ? `${h}h` : `${h}h${m}`; };

  function trial() { if (!TRIAL_CLASS) $$('[data-trial]').forEach((el) => { el.hidden = true; }); }

  function status() {
    const el = $('[data-status]'); const t = now();
    const today = HOURS[t.day];
    $('[data-today]') && ($('[data-today]').textContent = today ? `${today[0]} – ${today[1]}` : 'Fechado');
    $$('.hours tr[data-days]').forEach((tr) => tr.classList.toggle('is-today', tr.dataset.days.split(',').map(Number).includes(t.day)));
    if (!el) return;
    let open = false, text;
    if (today && t.min >= toMin(today[0]) && t.min < toMin(today[1])) { open = true; text = `Aberto agora · até ${fmtH(today[1])}`; }
    else if (today && t.min < toMin(today[0])) text = `Abre hoje às ${fmtH(today[0])}`;
    else { const d = (t.day + 1) % 7; text = `Abre ${DAY_NAMES[d]} às ${fmtH(HOURS[d][0])}`; }
    $('[data-status-text]', el).textContent = text;
    el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); el.hidden = false;
  }

  function classes() {
    const list = $('[data-classes]'); const btns = $$('[data-days] button'); const label = $('[data-day-label]');
    if (!list) return;
    const today = now().day;
    const show = (d) => {
      btns.forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.day === d)));
      if (label) label.textContent = d === today ? 'hoje' : (d === 6 ? 'no sábado' : d === 0 ? 'no domingo' : `na ${DAY_NAMES[d]}`);
      const items = SCHEDULE[d] || [];
      list.innerHTML = items.length
        ? items.map(([h, n], i) => `<li style="--n:${i}"><span>${n}</span><strong>${h}</strong></li>`).join('')
        : '<li class="is-empty">Sem aulas coletivas neste dia. Musculação liberada das 08h às 12h.</li>';
    };
    btns.forEach((b) => b.addEventListener('click', () => show(+b.dataset.day)));
    show(today);
  }

  function sticky() {
    const bar = $('[data-sticky]'); const hero = $('.hero');
    if (!bar || !hero) return;
    const upd = () => bar.classList.toggle('is-on', window.scrollY > hero.offsetHeight * 0.7);
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  function reveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((en) => en.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => {
    [trial, status, classes, sticky, reveal].forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    $$('[data-year]').forEach((e) => { e.textContent = new Date().getFullYear(); });
  });
})();
