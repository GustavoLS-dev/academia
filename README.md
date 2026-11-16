# DNA FORTE Academia — Site

Site institucional da academia. Estático e sem dependências: abra o `index.html` no navegador
ou publique a pasta em qualquer hospedagem de site estático (Netlify, Vercel, GitHub Pages, Hostinger etc.).

```
index.html            Conteúdo do site
assets/css/style.css  Visual (cores, layout, responsivo)
assets/js/main.js     Menu, grade de aulas, horário de hoje, formulário → WhatsApp
assets/img/           Logo e favicon
```

## Dados já preenchidos

- Endereço: Av. da Moenda Velha, 31 — Parque Independência, São Paulo/SP, 05880-330 (com mapa e "Como chegar")
- Telefone / WhatsApp: (11) 96420-2707 · E-mail: dnafortacademia@gmail.com
- Horários: seg a sex 06:00–23:00 · sáb 08:00–14:00 · dom 08:00–12:00
- Modalidades e horários: Musculação, Cross Training, Pilates, Funcional, Fit Dance, Jump e Muay Thai
- Planos a partir de R$ 99,00/mês

## Ainda falta preencher

| O quê | Onde |
|---|---|
| Instagram | Seção Contato e ícone no rodapé (`https://instagram.com/` e `[@instagram]`) |
| Profissionais | Seção Equipe: nome, modalidade e CREF |
| Itens de estrutura | Lista `.amenities`: mantenha só o que a academia oferece |
| Fotos que ainda são de exemplo | Hero (fundo), cards de Pilates, Fit Dance, Jump e Muay Thai, fotos da Equipe |

## Fotos reais

Ficam em `assets/img/academia/` e aparecem **coloridas** (classe `photo-real`); as de exemplo (Unsplash)
aparecem em preto e branco. Para trocar uma foto de exemplo por uma real:

1. Salve a foto em `assets/img/academia/` (de preferência JPG com 1200 px de largura ou mais).
2. No `index.html`, troque o `src` da imagem e adicione `class="photo-real"`.

Em uso hoje: `musculacao.jpg` (Estrutura, card de Musculação e quiz), `cardio.jpg`,
`cross-training.jpg` (Estrutura, card e quiz), `espaco-funcional.jpg` (Estrutura e Sobre) e
`area-funcional.jpg` (Estrutura, card de Funcional e quiz).

## Como alterar horários de aulas

As aulas aparecem em dois lugares:
1. **Cards de atividades** (`index.html`, seção `#atividades`): texto de cada card.
2. **Grade "Aulas por dia"**: constante `SCHEDULE` no topo de `assets/js/main.js`.

Ao mudar um horário, atualize os dois.

Os horários de funcionamento ficam na tabela `.hours` (seção `#localizacao`), no rodapé e nos dados
estruturados (`application/ld+json`) no `<head>`, que ajudam o Google a mostrar os horários na busca.
O destaque "Hoje" e o "Horário de hoje" do topo são calculados automaticamente a partir da tabela.

## Liga/desliga: promoção e aula experimental

No topo de `assets/js/main.js`:

```js
const FEATURES = {
  promo: true,       // faixa de promoção no topo do site
  trialClass: true,  // botões e pergunta "Aula experimental grátis"
};
```

- **Texto da promoção:** no `index.html`, dentro de `<div class="promo">`. O visitante pode fechar a faixa
  (ela fica fechada até ele fechar o navegador).
- **Aula experimental:** com `trialClass: false`, os botões "Aula experimental grátis" viram "WhatsApp",
  a pergunta some do FAQ e o quiz passa a dizer "Quero fazer [modalidade]".

## Depoimentos

Em `assets/js/extras.js`, preencha `REVIEWS` **apenas com avaliações reais** (ex.: copiadas do Google):

```js
const GOOGLE_RATING = { score: 4.9, count: 120 };
const REVIEWS = [
  { name: 'Nome do aluno', stars: 5, text: 'Texto da avaliação', when: 'há 2 semanas' },
];
```

Enquanto a lista estiver vazia, a seção mostra só os botões "Ver avaliações no Google" e "Avaliar a academia".

## Perguntas frequentes

Seção `#duvidas` no `index.html`. As respostas entre `[Confirmar: …]` precisam ser preenchidas:
taxa de matrícula, idade mínima, atestado médico e estacionamento.

## Quiz e calculadora de IMC

- Quiz: perguntas em `QUESTIONS` e modalidades/horários em `MODALITIES` (`assets/js/extras.js`).
  Se mudar algum horário de aula, atualize também ali.
- IMC: calculado no navegador; nenhum dado é enviado.
  - O IMC usa as faixas da OMS para adultos (iguais para homens e mulheres).
  - O sexo e a idade entram na **gordura corporal estimada** (fórmula de Deurenberg), com faixas de
    referência diferentes para homens e mulheres (`FAT_RANGES` em `extras.js`).
  - Para menores de 18 anos, a calculadora mostra um aviso, porque nessa idade o IMC é avaliado por
    curvas de idade e sexo.

## Minijogo "Desafio DNA FORTE"

Seção `#desafio`: o visitante treina um personagem; a cada nível um benefício da academia é liberado.
- Código: `assets/js/game.js` e `assets/css/game.css`.
- Níveis e pontuação: constantes `LEVELS` e `MAX_POINTS` no topo do `game.js`
  (os valores de `data-perk` nos benefícios do HTML devem bater com os níveis).
- Textos dos benefícios: lista `.perks__list` no `index.html`.

## Formulário

O formulário abre o WhatsApp da academia com uma mensagem pronta (nome, telefone, modalidade e período).
O número fica na constante `WHATSAPP` em `assets/js/main.js`.

## Logo

- `assets/img/logo-original.png`: a logo como foi enviada (fundo preto). Usada como favicon.
- `assets/img/logo.png`: versão com o fundo preto removido, usada no header e no rodapé.

A logo original tem só 96×79 px, então pode ficar um pouco borrada em telas de alta resolução.
Se tiver a logo em tamanho maior (ideal: PNG com fundo transparente, 400 px de largura ou mais, ou SVG),
basta substituir `assets/img/logo.png` pelo arquivo novo, com o mesmo nome.

## Cores e visual

No topo do `style.css`: preto, grafite, cinza e branco, com o dourado da logo em `--accent` (`#E7B34C`).
Os componentes usam efeito "liquid glass" (vidro translúcido com desfoque); a receita fica na seção
"3. Liquid glass" do CSS e nas variáveis `--glass-*`.

O selo "Aberto agora / Fechado" do header usa a constante `HOURS` em `assets/js/main.js`
(horário de São Paulo). Se mudar o horário de funcionamento, atualize ali também.
