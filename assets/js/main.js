/* =========================================================
   DNA FORTE — Interações
   Sem dependências. Cada recurso é uma função independente.
   ========================================================= */
(() => {
  'use strict';

  /* ===== DADOS DA ACADEMIA — edite aqui ===== */
  const WHATSAPP = '5511964202707'; // 55 + DDD + número, só dígitos

  // Liga/desliga recursos do site
  const FEATURES = {
    promo: true,       // faixa de promoção no topo (texto fica no index.html, dentro de .promo)
    trialClass: true,  // botões e pergunta de "Aula experimental grátis"
  };

  // Grade de aulas coletivas. 0 = domingo, 1 = segunda ... 6 = sábado
  const SCHEDULE = {
    1: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Pilates'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['18h50', 'Jump'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    2: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Jump'], ['08h30', 'Funcional'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Funcional'], ['20h30', 'Muay Thai']],
    3: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Pilates'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['18h50', 'Jump'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    4: [['06h30 – 09h30', 'Cross Training'], ['07h30', 'Jump'], ['08h30', 'Funcional'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Funcional'], ['20h30', 'Fit Dance']],
    5: [['06h30 – 09h30', 'Cross Training'], ['08h30', 'Fit Dance'], ['16h30 – 22h', 'Cross Training'], ['19h30', 'Pilates'], ['20h30', 'Fit Dance']],
    6: [['08h30', 'Funcional']],
    0: [],
  };
  const NO_CLASSES = 'Sem aulas coletivas. Academia aberta das 08h às 12h.';

  // Horário de funcionamento [abre, fecha] — usado no selo "Aberto agora"
  const HOURS = {
    0: ['08:00', '12:00'],
    1: ['06:00', '23:00'], 2: ['06:00', '23:00'], 3: ['06:00', '23:00'], 4: ['06:00', '23:00'], 5: ['06:00', '23:00'],
    6: ['08:00', '14:00'],
  };
  const TIMEZONE = 'America/Sao_Paulo';

  // Compartilha os dados com os outros scripts (quiz, etc.)
  window.DNA = { WHATSAPP, SCHEDULE, HOURS, FEATURES };
  /* ========================================== */

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: fundo sólido ao rolar ---------- */
  function initHeader() {
    const header = $('#header');
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    const burger = $('.burger');
    const menu = $('#mobile-menu');

    const setOpen = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.hidden = !open;
      document.body.classList.toggle('is-locked', open);
      document.documentElement.classList.toggle('menu-open', open);
    };

    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1101px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  /* ---------- Link ativo no menu ---------- */
  function initActiveNav() {
    const links = $$('.nav__link');
    const map = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        const link = map.get(e.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Entrada suave das seções ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Números contando quando aparecem ---------- */
  function initStats() {
    const fmt = new Intl.NumberFormat('pt-BR');
    const render = (el, v) => {
      const pad = Number(el.dataset.pad) || 0;
      el.textContent = pad ? String(v).padStart(pad, '0') : fmt.format(v);
    };
    const nums = $$('[data-count]');
    if (reduceMotion || !('IntersectionObserver' in window)) { nums.forEach((el) => render(el, Number(el.dataset.count))); return; }

    const run = (el) => {
      const target = Number(el.dataset.count) || 0;
      const t0 = performance.now();
      const dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        render(el, Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    nums.forEach((el) => render(el, 0));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach((el) => io.observe(el));
  }

  /* ---------- Barra de progresso de leitura ---------- */
  function initProgress() {
    const bar = $('.header__progress');
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Hero: parallax da foto + brilho que segue o mouse ---------- */
  function initHeroFx() {
    if (reduceMotion) return;
    const hero = $('.hero');
    const img = $('.hero__media img');
    if (!hero || !img) return;

    let ticking = false;
    const onScroll = () => {
      const max = hero.offsetHeight * 0.14;
      const y = Math.min(window.scrollY * 0.25, max);
      img.style.setProperty('--py', `${y.toFixed(1)}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking && window.scrollY < hero.offsetHeight) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

    if (!window.matchMedia('(pointer: fine)').matches) return;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--hx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--hy', `${e.clientY - r.top}px`);
    });
  }

  /* ---------- Cards 3D + reflexo seguindo o mouse ---------- */
  function initTilt() {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const MAX = 7; // graus

    const track = (el, tilt) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        if (tilt) {
          el.classList.add('is-tilting');
          el.style.setProperty('--ry', `${((x - 0.5) * MAX * 2).toFixed(2)}deg`);
          el.style.setProperty('--rx', `${((0.5 - y) * MAX * 2).toFixed(2)}deg`);
        }
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    };

    $$('.card, .coach, .plan--featured').forEach((el) => { el.classList.add('tilt'); track(el, true); });
    $$('.features li, .channel, .info-block, .steps, .schedule, .stats, .quick, .amenities').forEach((el) => { el.classList.add('glow'); track(el, false); });
  }

  /* ---------- Ondinha ao clicar nos botões ---------- */
  function initRipple() {
    if (reduceMotion) return;
    document.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      btn.appendChild(s);
      s.addEventListener('animationend', () => s.remove());
    });
  }

  /* ---------- Entrada em cascata (atraso por posição no grupo) ---------- */
  function initStagger() {
    const groups = ['.cards__track', '.team', '.gallery', '.features', '.channels', '.visit__info', '.offer'];
    groups.forEach((sel) => {
      $$(sel).forEach((group) => {
        $$(':scope > .reveal, :scope > li.reveal', group).forEach((el, i) => {
          el.style.setProperty('--d', i % 4);
          // depois da entrada, zera o atraso para as interações ficarem instantâneas
          el.addEventListener('transitionend', function clear(ev) {
            if (ev.propertyName === 'opacity' && el.classList.contains('is-in')) {
              el.style.setProperty('--d', 0);
              el.removeEventListener('transitionend', clear);
            }
          });
        });
      });
    });
  }

  /* ---------- Barra de ações do celular ---------- */
  function initMobileBar() {
    const bar = $('[data-mbar]');
    if (!bar) return;
    const root = document.documentElement;
    const hero = $('.hero');

    // aparece depois que o visitante passa do hero (lá já existem os botões principais)
    let ticking = false;
    const update = () => {
      const limit = hero ? hero.offsetHeight * 0.6 : 400;
      root.classList.toggle('show-mbar', window.scrollY > limit);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();

    // some enquanto o teclado está aberto (digitando no formulário/IMC)
    const isField = (el) => el && el.matches && el.matches('input:not([type="radio"]):not([type="checkbox"]), textarea, select');
    document.addEventListener('focusin', (e) => { if (isField(e.target)) root.classList.add('typing'); });
    document.addEventListener('focusout', (e) => { if (isField(e.target)) root.classList.remove('typing'); });
  }

  /* ---------- Recursos liga/desliga (promoção e aula experimental) ---------- */
  function initFeatures() {
    // Aula experimental
    $$('[data-trial]').forEach((el) => { el.hidden = !FEATURES.trialClass; });
    $$('[data-no-trial]').forEach((el) => { el.hidden = FEATURES.trialClass; });

    // Faixa de promoção (pode ser fechada; fica fechada durante a visita)
    const promo = $('[data-promo]');
    if (!promo) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('dna-promo-closed') === '1'; } catch (e) { /* sem storage */ }
    const show = FEATURES.promo && !dismissed;
    promo.hidden = !show;
    document.documentElement.classList.toggle('has-promo', show);
    const close = $('[data-promo-close]', promo);
    if (close) close.addEventListener('click', () => {
      promo.hidden = true;
      document.documentElement.classList.remove('has-promo');
      try { sessionStorage.setItem('dna-promo-closed', '1'); } catch (e) { /* sem storage */ }
    });
  }

  /* ---------- Data/hora em São Paulo ---------- */
  function nowInSaoPaulo() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }
  const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const fmtHour = (hhmm) => { const [h, m] = hhmm.split(':'); return m === '00' ? `${h}h` : `${h}h${m}`; };
  const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  /* ---------- Selo "Aberto agora / Fechado" ---------- */
  function initStatus() {
    const badges = $$('[data-status]');
    if (!badges.length) return;

    const update = () => {
      const { day, minutes } = nowInSaoPaulo();
      const today = HOURS[day];
      let open = false;
      let text;
      if (today && minutes >= toMin(today[0]) && minutes < toMin(today[1])) {
        open = true;
        text = `Aberto agora · até ${fmtHour(today[1])}`;
      } else if (today && minutes < toMin(today[0])) {
        text = `Fechado · abre às ${fmtHour(today[0])}`;
      } else {
        // próximo dia com horário
        for (let i = 1; i <= 7; i++) {
          const d = (day + i) % 7;
          if (HOURS[d]) {
            text = `Fechado · abre ${i === 1 ? 'amanhã' : DAY_NAMES[d]} às ${fmtHour(HOURS[d][0])}`;
            break;
          }
        }
      }
      badges.forEach((b) => {
        b.hidden = false;
        b.classList.toggle('is-open', open);
        b.classList.toggle('is-closed', !open);
        $('[data-status-text]', b).textContent = text;
      });
    };
    update();
    setInterval(update, 60 * 1000);
  }

  /* ---------- Destaca o horário de hoje ---------- */
  function initTodayHours() {
    const today = nowInSaoPaulo().day; // 0 = domingo
    const row = $$('.hours tr[data-days]').find((tr) => tr.dataset.days.split(',').map(Number).includes(today));
    if (!row) return;
    row.classList.add('is-today');
    const target = $('[data-today-hours]');
    if (target) target.textContent = $('td', row).textContent;
  }

  /* ---------- Grade de aulas por dia ---------- */
  function initSchedule() {
    const list = $('.schedule__list');
    const buttons = $$('.schedule__days button');
    if (!list || !buttons.length) return;

    const show = (day) => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.day) === day)));
      const classes = SCHEDULE[day] || [];
      list.innerHTML = '';
      if (!classes.length) {
        const li = document.createElement('li');
        li.className = 'is-empty';
        li.textContent = NO_CLASSES;
        list.appendChild(li);
        return;
      }
      classes.forEach(([time, name], i) => {
        const li = document.createElement('li');
        li.style.setProperty('--n', i);
        const n = document.createElement('span');
        const t = document.createElement('strong');
        n.textContent = name;
        t.textContent = time;
        li.append(n, t);
        list.appendChild(li);
      });
    };

    buttons.forEach((b) => b.addEventListener('click', () => show(Number(b.dataset.day))));
    show(nowInSaoPaulo().day);
  }

  /* ---------- Planos: mensal / anual ---------- */
  function initBilling() {
    const opts = $$('.billing__opt');
    if (!opts.length) return;
    const set = (mode) => {
      opts.forEach((o) => {
        const on = o.dataset.billing === mode;
        o.classList.toggle('is-active', on);
        o.setAttribute('aria-checked', String(on));
        o.tabIndex = on ? 0 : -1;
      });
      $$('.price').forEach((p) => {
        const val = $('.price__val', p);
        val.classList.add('is-swap');
        setTimeout(() => {
          val.textContent = p.dataset[mode];
          $('.price__per', p).textContent = mode === 'annual' ? '/ano' : '/mês';
          val.classList.remove('is-swap');
        }, 150);
      });
    };
    opts.forEach((o, i) => {
      o.addEventListener('click', () => set(o.dataset.billing));
      o.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
          const next = opts[(i + 1) % opts.length];
          set(next.dataset.billing);
          next.focus();
        }
      });
    });
  }

  /* ---------- Botões de matrícula: preenchem o plano no formulário ---------- */
  function initJoinLinks() {
    const select = $('#f-plan');
    $$('[data-join]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.join;
        if (plan && select) select.value = plan;
        // foca o primeiro campo depois da rolagem suave
        setTimeout(() => { const n = $('#f-name'); if (n) n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
      });
    });
  }

  /* ---------- Formulário de contato / matrícula ---------- */
  function initForm() {
    const form = $('#join-form');
    if (!form) return;
    const formView = $('[data-view="form"]');
    const successView = $('[data-view="success"]');

    const messages = {
      name: 'Informe seu nome completo.',
      phone: 'Informe um telefone válido com DDD.',
    };

    const validate = (input) => {
      const field = input.closest('.field');
      let ok = input.checkValidity();
      if (input.name === 'name') ok = ok && input.value.trim().length >= 3;
      if (input.name === 'phone') ok = ok && input.value.replace(/\D/g, '').length >= 10;
      field.classList.toggle('is-invalid', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      $('.field__err', field).textContent = ok ? '' : messages[input.name];
      return ok;
    };

    const inputs = $$('input[required]', form);
    inputs.forEach((i) => {
      i.addEventListener('blur', () => { if (i.value) validate(i); });
      i.addEventListener('input', () => { if (i.closest('.field').classList.contains('is-invalid')) validate(i); });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = inputs.map(validate);
      const firstBad = inputs[results.indexOf(false)];
      if (firstBad) { firstBad.focus(); return; }
      handleJoinSubmit(Object.fromEntries(new FormData(form)));
      formView.hidden = true;
      successView.hidden = false;
      successView.focus();
    });

    $('[data-reset]').addEventListener('click', () => {
      form.reset();
      successView.hidden = true;
      formView.hidden = false;
      $('#f-name').focus();
    });
  }

  /**
   * Abre o WhatsApp da academia com a mensagem já preenchida.
   * (Para enviar também a um e-mail/CRM, adicione aqui um fetch para o seu serviço.)
   */
  function handleJoinSubmit(data) {
    const lines = [
      'Olá! Tenho interesse em me matricular na DNA FORTE.',
      `Nome: ${data.name}`,
      `Telefone: ${data.phone}`,
      `Modalidade: ${data.activity}`,
      `Melhor período: ${data.period}`,
    ];
    if (data.message && data.message.trim()) lines.push(`Mensagem: ${data.message.trim()}`);
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
    const fallback = $('[data-wa-fallback]');
    if (fallback) fallback.href = url;
    window.open(url, '_blank', 'noopener');
  }

  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    [initFeatures, initMobileBar, initHeader, initMenu, initActiveNav, initStagger, initReveal, initStats, initProgress, initHeroFx,
      initTilt, initRipple, initStatus, initTodayHours,
      initSchedule, initBilling, initJoinLinks, initForm, initYear]
      .forEach((fn) => { try { fn(); } catch (err) { console.error(`[DNA FORTE] ${fn.name}`, err); } });
  });
})();
