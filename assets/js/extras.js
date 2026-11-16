/* =========================================================
   DNA FORTE — Quiz de modalidades, Calculadora de IMC e Depoimentos
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const DNA = window.DNA || { WHATSAPP: '5511964202707', FEATURES: { trialClass: true } };
  const waLink = (text) => `https://wa.me/${DNA.WHATSAPP}?text=${encodeURIComponent(text)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

  /* =========================================================
     1. DEPOIMENTOS
     Cole aqui APENAS avaliações reais (por exemplo, do Google),
     de preferência com autorização do aluno.
     ========================================================= */
  const GOOGLE_RATING = {
    score: null,   // ex.: 4.9  (deixe null para não exibir)
    count: null,   // ex.: 120
  };
  const REVIEWS = [
    // { name: 'Nome do aluno', stars: 5, text: 'Texto da avaliação…', when: 'há 2 semanas' },
  ];

  function initReviews() {
    const scoreEl = $('[data-rating-score]');
    const textEl = $('[data-rating-text]');
    if (GOOGLE_RATING.score && scoreEl) {
      const score = Number(GOOGLE_RATING.score).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      scoreEl.textContent = `${score} no Google`;
      scoreEl.hidden = false;
      if (GOOGLE_RATING.count && textEl) textEl.textContent = `Média de ${GOOGLE_RATING.count} avaliações de alunos.`;
    }

    const wrap = $('[data-reviews]');
    const track = $('[data-reviews-track]');
    if (!wrap || !track || !REVIEWS.length) return;

    track.innerHTML = REVIEWS.map((r) => {
      const n = Math.max(1, Math.min(5, Number(r.stars) || 5));
      const stars = Array.from({ length: 5 }, (_, i) => icon('i-star', i < n ? 'on' : '')).join('');
      const initial = esc((r.name || '?').trim().charAt(0).toUpperCase());
      return `<li class="review">
        <div class="review__stars" role="img" aria-label="${n} de 5 estrelas">${stars}</div>
        <p class="review__text">“${esc(r.text)}”</p>
        <div class="review__author"><span class="review__avatar" aria-hidden="true">${initial}</span>
          <span><strong>${esc(r.name)}</strong><small>${r.when ? esc(r.when) + ' · ' : ''}Google</small></span></div>
      </li>`;
    }).join('');
    wrap.hidden = false;

    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 18 : 320);
    $('[data-reviews-prev]').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('[data-reviews-next]').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  /* =========================================================
     2. QUIZ — Qual modalidade combina com você?
     ========================================================= */
  const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=420&q=70`;
  const MODALITIES = {
    'Musculação': {
      desc: 'Força e hipertrofia no seu ritmo, com área completa de pesos livres e máquinas.',
      times: ['Seg a sex: 06h – 23h', 'Sábado: 08h – 14h'],
      periods: ['manha', 'tarde', 'noite'],
      img: 'assets/img/academia/musculacao.jpg',
    },
    'Cross Training': {
      desc: 'Treinos intensos e variados que unem força, explosão e condicionamento.',
      times: ['Seg a sex: 06h30 – 09h30', 'Seg a sex: 16h30 – 22h'],
      periods: ['manha', 'tarde', 'noite'],
      img: 'assets/img/academia/cross-training.jpg',
    },
    'Pilates': {
      desc: 'Fortalece o core, melhora a postura e a flexibilidade com controle e precisão.',
      times: ['Seg e qua: 07h30 e 19h30', 'Sexta: 19h30'],
      periods: ['manha', 'noite'],
      img: IMG('1599447421416-3414500d18a5'),
    },
    'Funcional': {
      desc: 'Movimentos do dia a dia para ganhar força, equilíbrio e resistência.',
      times: ['Ter e qui: 08h30 e 19h30', 'Sábado: 08h30'],
      periods: ['manha', 'noite'],
      img: 'assets/img/academia/area-funcional.jpg',
    },
    'Fit Dance': {
      desc: 'Aula animada de dança que queima calorias sem você nem perceber.',
      times: ['Seg, qua e sex: 08h30 e 20h30', 'Quinta: 20h30'],
      periods: ['manha', 'noite'],
      img: IMG('1518310383802-640c2de311b2'),
    },
    'Jump': {
      desc: 'Aula aeróbica no mini trampolim, divertida e com alto gasto calórico.',
      times: ['Seg e qua: 18h50', 'Ter e qui: 07h30'],
      periods: ['manha', 'noite'],
      img: IMG('1588286840104-8957b019727f'),
    },
    'Muay Thai': {
      desc: 'Arte marcial completa: condicionamento, técnica e muito alívio do estresse.',
      times: ['Terça: 20h30'],
      periods: ['noite'],
      img: IMG('1517438322307-e67111335449'),
    },
  };

  const QUESTIONS = [
    {
      q: 'Qual é o seu principal objetivo?',
      options: [
        { label: 'Ganhar massa e força', hint: 'Hipertrofia e performance', icon: 'i-dumbbell', score: { 'Musculação': 3, 'Cross Training': 2, 'Funcional': 1 } },
        { label: 'Emagrecer', hint: 'Queimar calorias e ganhar fôlego', icon: 'i-flame', score: { 'Jump': 3, 'Cross Training': 2, 'Fit Dance': 2, 'Funcional': 2, 'Muay Thai': 1 } },
        { label: 'Postura e bem-estar', hint: 'Flexibilidade e menos dores', icon: 'i-leaf', score: { 'Pilates': 3, 'Funcional': 1 } },
        { label: 'Aprender a lutar', hint: 'Técnica e alívio do estresse', icon: 'i-glove', score: { 'Muay Thai': 3, 'Cross Training': 1 } },
      ],
    },
    {
      q: 'Como você prefere treinar?',
      options: [
        { label: 'No meu ritmo', hint: 'Com autonomia e orientação', icon: 'i-user', score: { 'Musculação': 2, 'Pilates': 1 } },
        { label: 'Em turma', hint: 'Aula com professor e energia', icon: 'i-users', score: { 'Fit Dance': 2, 'Jump': 2, 'Funcional': 1, 'Cross Training': 1, 'Muay Thai': 1, 'Pilates': 1 } },
        { label: 'Tanto faz', hint: 'Quero o que der mais resultado', icon: 'i-shuffle', score: {} },
      ],
    },
    {
      q: 'Qual intensidade você curte?',
      options: [
        { label: 'Leve', hint: 'Começar com calma', level: 1, score: { 'Pilates': 2, 'Fit Dance': 1, 'Musculação': 1 } },
        { label: 'Moderada', hint: 'Desafio na medida', level: 2, score: { 'Funcional': 2, 'Musculação': 1, 'Fit Dance': 1, 'Jump': 1 } },
        { label: 'Alta', hint: 'Quero suar muito!', level: 3, score: { 'Cross Training': 2, 'Jump': 2, 'Muay Thai': 2 } },
      ],
    },
    {
      q: 'Qual o melhor período para você?',
      period: true,
      options: [
        { label: 'Manhã', hint: 'Antes das 12h', icon: 'i-sun', value: 'manha' },
        { label: 'Tarde', hint: 'Das 12h às 18h', icon: 'i-sunset', value: 'tarde' },
        { label: 'Noite', hint: 'Depois das 18h', icon: 'i-moon', value: 'noite' },
      ],
    },
  ];

  const levelIcon = (n) => `<span class="lvl" aria-hidden="true">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;

  function initQuiz() {
    const root = $('[data-quiz]');
    if (!root) return;
    const body = $('[data-q-body]', root);
    const bar = $('[data-q-bar]', root);
    const steps = $$('[data-q-steps] li', root);
    let step = 0;
    let answers = [];

    const setProgress = () => {
      const done = Math.min(step, QUESTIONS.length);
      bar.style.width = `${(done / QUESTIONS.length) * 100}%`;
      steps.forEach((li, i) => {
        li.classList.toggle('is-done', i < step);
        li.classList.toggle('is-current', i === step);
      });
    };

    const renderQuestion = () => {
      const item = QUESTIONS[step];
      const cols = item.options.length === 4 ? 'is-2col' : 'is-3col';
      body.innerHTML = `
        <fieldset class="quiz__q is-enter">
          <legend class="quiz__question" tabindex="-1"><small>Pergunta ${step + 1} de ${QUESTIONS.length}</small>${esc(item.q)}</legend>
          <div class="quiz__options ${cols}">
            ${item.options.map((o, i) => `
              <button type="button" class="quiz__opt" data-i="${i}">
                <span class="quiz__opt-icon">${o.level ? levelIcon(o.level) : icon(o.icon)}</span>
                <span class="quiz__opt-text"><strong>${esc(o.label)}</strong><small>${esc(o.hint)}</small></span>
              </button>`).join('')}
          </div>
          ${step > 0 ? '<button type="button" class="quiz__back" data-back>← Voltar</button>' : ''}
        </fieldset>`;
      setProgress();
      $$('.quiz__opt', body).forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.i), b)));
      const back = $('[data-back]', body);
      if (back) back.addEventListener('click', () => { step -= 1; answers.pop(); renderQuestion(); focusQuestion(); });
    };

    const focusQuestion = () => { const l = $('.quiz__question', body); if (l) l.focus({ preventScroll: true }); };

    const choose = (i, btn) => {
      answers[step] = i;
      btn.classList.add('is-picked');
      // pequena pausa para mostrar a escolha
      setTimeout(() => {
        step += 1;
        if (step < QUESTIONS.length) { renderQuestion(); focusQuestion(); } else { renderResult(); }
      }, 220);
    };

    const computeScores = () => {
      const scores = Object.fromEntries(Object.keys(MODALITIES).map((m) => [m, 0]));
      answers.forEach((ans, qi) => {
        const q = QUESTIONS[qi];
        const opt = q.options[ans];
        if (q.period) {
          Object.entries(MODALITIES).forEach(([m, d]) => { scores[m] += d.periods.includes(opt.value) ? 2 : -3; });
        } else {
          Object.entries(opt.score).forEach(([m, v]) => { scores[m] += v; });
        }
      });
      return Object.entries(scores).sort((a, b) => b[1] - a[1]);
    };

    const renderResult = () => {
      const ranked = computeScores();
      const [best, bestScore] = ranked[0];
      const second = ranked[1][0];
      const pct = Math.max(62, Math.min(98, Math.round(55 + (bestScore / 9) * 45)));
      const m = MODALITIES[best];
      const trial = DNA.FEATURES && DNA.FEATURES.trialClass;
      const msg = trial
        ? `Olá! Fiz o quiz no site e a modalidade indicada foi ${best}. Quero agendar uma aula experimental grátis.`
        : `Olá! Fiz o quiz no site e a modalidade indicada foi ${best}. Quero saber mais.`;

      body.innerHTML = `
        <div class="quiz__result is-enter">
          <div class="quiz__photo">
            <img src="${m.img}" alt="" loading="lazy"${m.img.startsWith('assets/') ? ' class="photo-real"' : ''}>
            <span class="quiz__badge"><b>${pct}%</b> compatível</span>
          </div>
          <div class="quiz__result-body">
            <p class="quiz__kicker">Sua modalidade ideal é</p>
            <h4 class="quiz__name" tabindex="-1">${esc(best)}</h4>
            <p class="quiz__desc">${esc(m.desc)}</p>
            <ul class="quiz__times">${m.times.map((t) => `<li>${icon('i-clock')}${esc(t)}</li>`).join('')}</ul>
            <p class="quiz__also">Também combina com você: <strong>${esc(second)}</strong></p>
            <div class="quiz__ctas">
              <a class="btn btn--primary" href="${waLink(msg)}" target="_blank" rel="noopener">${icon('i-whatsapp', 'btn__icon')}${trial ? 'Agendar aula grátis' : 'Quero fazer ' + esc(best)}</a>
              <button type="button" class="btn btn--outline" data-restart>Refazer</button>
            </div>
          </div>
        </div>`;
      setProgress();
      $('[data-restart]', body).addEventListener('click', () => { step = 0; answers = []; renderQuestion(); focusQuestion(); });
      const name = $('.quiz__name', body);
      if (name) name.focus({ preventScroll: true });
    };

    renderQuestion();
  }

  /* =========================================================
     3. CALCULADORA DE IMC + GORDURA CORPORAL ESTIMADA
     - IMC: faixas da OMS para adultos (iguais para homens e mulheres).
     - Gordura: fórmula de Deurenberg (1991)
         %G = 1,2 × IMC + 0,23 × idade − 10,8 × sexo − 5,4   (sexo: 1 = homem, 0 = mulher)
       com faixas de referência diferentes para cada sexo (ACE).
     ========================================================= */
  const BMI_MIN = 15, BMI_MAX = 40;
  const BMI_RANGES = [
    { max: 18.5, label: 'Abaixo do peso', cls: 1, tip: 'Um treino de força aliado a uma boa alimentação ajuda a ganhar massa com saúde.' },
    { max: 25, label: 'Peso normal', cls: 2, tip: 'Ótimo ponto de partida! Que tal focar em força e condicionamento?' },
    { max: 30, label: 'Sobrepeso', cls: 3, tip: 'Combinar musculação com aulas aeróbicas ajuda muito. Nossos professores montam o plano ideal para você.' },
    { max: 35, label: 'Obesidade grau I', cls: 4, tip: 'Comece no seu ritmo e com acompanhamento — esse é o passo mais importante. Converse também com um médico.' },
    { max: 40, label: 'Obesidade grau II', cls: 4, tip: 'Comece no seu ritmo e com acompanhamento — esse é o passo mais importante. Converse também com um médico.' },
    { max: Infinity, label: 'Obesidade grau III', cls: 4, tip: 'Comece no seu ritmo e com acompanhamento — esse é o passo mais importante. Converse também com um médico.' },
  ];
  // Faixas de % de gordura (American Council on Exercise)
  const FAT_RANGES = {
    f: [[10, 14, 'Essencial'], [14, 21, 'Atleta'], [21, 25, 'Em forma'], [25, 32, 'Média'], [32, 45, 'Acima da média']],
    m: [[2, 6, 'Essencial'], [6, 14, 'Atleta'], [14, 18, 'Em forma'], [18, 25, 'Média'], [25, 40, 'Acima da média']],
  };
  const GAUGE_COLORS = ['#7fb3ff', '#3ddc84', '#E7B34C', '#ff7a6b'];
  const GAUGE_STOPS = [15, 18.5, 25, 30, 40];

  // Desenha os arcos do medidor (semicírculo)
  function drawGauge(group) {
    const cx = 110, cy = 112, r = 86;
    const ang = (b) => Math.PI - ((b - BMI_MIN) / (BMI_MAX - BMI_MIN)) * Math.PI; // 180° → 0°
    const pt = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    let html = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" class="gauge__track"/>`;
    for (let i = 0; i < 4; i++) {
      const gap = 0.012;
      const a1 = ang(GAUGE_STOPS[i]) - (i ? gap : 0);
      const a2 = ang(GAUGE_STOPS[i + 1]) + (i < 3 ? gap : 0);
      const [x1, y1] = pt(a1); const [x2, y2] = pt(a2);
      html += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${GAUGE_COLORS[i]}" class="gauge__arc"/>`;
    }
    // marcações
    [18.5, 25, 30].forEach((b) => {
      const a = ang(b);
      const [x1, y1] = [cx + (r - 16) * Math.cos(a), cy - (r - 16) * Math.sin(a)];
      html += `<text x="${x1.toFixed(1)}" y="${(y1 + 4).toFixed(1)}" class="gauge__tick">${String(b).replace('.', ',')}</text>`;
    });
    group.innerHTML = html;
  }

  function initBmi() {
    const form = $('[data-bmi]');
    if (!form) return;
    const result = $('[data-bmi-result]');
    const value = $('[data-bmi-value]');
    const label = $('[data-bmi-label]');
    const tip = $('[data-bmi-tip]');
    const range = $('[data-bmi-range]');
    const needle = $('[data-gauge-needle]');
    const fatCard = $('[data-fat-card]');
    const fatValue = $('[data-fat-value]');
    const fatLabel = $('[data-fat-label]');
    const fatMarker = $('[data-fat-marker]');
    const fatScale = $('[data-fat-scale]');
    const defaultTip = tip.textContent;
    const f1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const f0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
    drawGauge($('[data-gauge-arcs]'));

    const num = (name) => parseFloat(String(form.elements[name].value).replace(',', '.'));
    const setNeedle = (bmi) => {
      const t = bmi == null ? 0 : (Math.max(BMI_MIN, Math.min(BMI_MAX, bmi)) - BMI_MIN) / (BMI_MAX - BMI_MIN);
      needle.style.transform = `rotate(${(-90 + t * 180).toFixed(1)}deg)`;
    };

    const update = () => {
      const sex = form.elements.sex.value;
      const age = num('age');
      const h = num('height');
      const w = num('weight');
      fatScale.textContent = sex === 'm' ? 'Referência masculina' : 'Referência feminina';

      const validHW = h >= 100 && h <= 230 && w >= 30 && w <= 300;
      result.classList.toggle('is-filled', validHW);
      result.dataset.cls = '';

      // faixa de peso saudável (só depende da altura)
      if (h >= 100 && h <= 230) {
        const m2 = Math.pow(h / 100, 2);
        range.textContent = `${f1.format(18.5 * m2)} – ${f1.format(24.9 * m2)} kg`;
      } else range.textContent = '—';

      if (!validHW) {
        value.textContent = '—';
        label.textContent = (form.elements.height.value || form.elements.weight.value) ? 'Confira altura (cm) e peso (kg)' : 'Preencha os campos';
        tip.textContent = defaultTip;
        setNeedle(null);
        fatCard.classList.remove('is-on');
        fatValue.textContent = '—'; fatLabel.textContent = '';
        return;
      }

      const bmi = w / Math.pow(h / 100, 2);
      const r = BMI_RANGES.find((x) => bmi < x.max);
      value.textContent = f1.format(bmi);
      label.textContent = r.label;
      result.dataset.cls = r.cls;
      setNeedle(bmi);

      const minor = age > 0 && age < 18;
      if (minor) {
        tip.textContent = 'Para menores de 18 anos, o IMC é avaliado por curvas de crescimento por idade e sexo (OMS). Use este resultado só como referência e procure um profissional.';
      } else {
        tip.textContent = r.tip;
      }

      // gordura corporal estimada (adultos)
      if (age >= 18 && age <= 100) {
        const fat = 1.2 * bmi + 0.23 * age - 10.8 * (sex === 'm' ? 1 : 0) - 5.4;
        const ranges = FAT_RANGES[sex];
        const clamped = Math.max(ranges[0][0], Math.min(ranges[ranges.length - 1][1], fat));
        let idx = ranges.findIndex(([lo, hi]) => clamped >= lo && clamped < hi);
        if (idx < 0) idx = clamped < ranges[0][0] ? 0 : ranges.length - 1;
        const [lo, hi, name] = ranges[idx];
        const pos = ((idx + (clamped - lo) / (hi - lo)) / ranges.length) * 100;
        fatValue.textContent = `${f0.format(Math.max(3, fat))}%`;
        fatLabel.textContent = name;
        fatMarker.style.left = `${Math.max(1, Math.min(99, pos))}%`;
        fatCard.classList.add('is-on');
        fatCard.dataset.idx = idx;
      } else {
        fatCard.classList.remove('is-on');
        fatValue.textContent = '—';
        fatLabel.textContent = minor ? 'Disponível a partir de 18 anos' : 'Informe a idade';
      }
    };

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', (e) => e.preventDefault());
    update();
  }

  document.addEventListener('DOMContentLoaded', () => {
    [initReviews, initQuiz, initBmi].forEach((fn) => {
      try { fn(); } catch (err) { console.error(`[DNA FORTE] ${fn.name}`, err); }
    });
  });
})();
