// Top Wheels: калькулятор с колесом, живой статус работы, сезонная плитка, лента отзывов.
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }

  /* ---------- Время в Минске (UTC+3, без перехода на летнее время) ---------- */
  var now = new Date(Date.now() + 3 * 3600 * 1000);
  var hour = now.getUTCHours() + now.getUTCMinutes() / 60;
  var month = now.getUTCMonth() + 1;

  /* ---------- Статус «открыто / закрыто» ---------- */
  var OPEN = 9, CLOSE = 20;
  var isOpen = hour >= OPEN && hour < CLOSE;
  var statusText = isOpen ? 'Открыто до 20:00' : (hour < OPEN ? 'Откроемся в 9:00' : 'Откроемся завтра в 9:00');
  document.querySelectorAll('[data-status]').forEach(function (el) { el.classList.toggle('is-open', isOpen); });
  document.querySelectorAll('[data-status-text]').forEach(function (el) { el.textContent = statusText; });
  var openTitle = document.querySelector('[data-open-title]');
  if (openTitle) {
    openTitle.textContent = statusText;
    openTitle.closest('.tile').classList.toggle('is-open', isOpen);
  }

  /* ---------- Плитка сезона ---------- */
  var SEASONS = [
    { months: [10, 11, 12], label: 'Сезон · октябрь–декабрь', title: 'Переобувка на зиму',
      text: 'Пик сезона: расписание заполняется быстро. Выберите время заранее.' },
    { months: [3, 4, 5], label: 'Сезон · март–май', title: 'Переобувка на лето',
      text: 'Пик сезона: расписание заполняется быстро. Выберите время заранее.' },
    { months: [1, 2], label: 'Межсезонье', title: 'Правка дисков и ремонт',
      text: 'Свободного времени больше. Удобный момент выправить диски и подготовить колёса к весне.' },
    { months: [6, 7, 8, 9], label: 'Лето', title: 'Кондиционер и диски',
      text: 'Проверим кондиционер на герметичность и заправим. Шиномонтаж и правка дисков ежедневно.' }
  ];
  var season = SEASONS.filter(function (s) { return s.months.indexOf(month) !== -1; })[0];
  if (season) {
    var set = function (sel, v) { var el = document.querySelector(sel); if (el) el.textContent = v; };
    set('[data-season-label]', season.label);
    set('[data-season-title]', season.title);
    set('[data-season-text]', season.text);
  }

  /* ---------- Калькулятор (BYN за одно колесо, прайс Top Wheels) ---------- */
  var D = ['13-15', '16', '17', '18', '19', '20', '21', '22', '23-26'];
  var DNUM = [14, 16, 17, 18, 19, 20, 21, 22, 24];   // для рисунка колеса
  var PRICES = {
    car: {
      snat: [7, 7, 7.5, 8, 8.5, 8.5, 9, 10, 10],
      dem:  [3.5, 4, 4.5, 5, 5, 5.5, 6.5, 7, 7.5],
      mon:  [3.5, 4, 4.5, 5, 5, 5.5, 6.5, 7, 7.5],
      bal:  [6, 6.5, 7, 7, 8, 8, 9, 9, 10],
      k1:   [20, 21.5, 23.5, 25, 26.5, 28, 31, 33, 35],
      k4:   [80, 86, 94, 100, 106, 110, 124, 132, 140]
    },
    suv: {
      snat: [8.5, 8.5, 9.5, 9.5, 10, 11, 11, 13, 14],
      dem:  [4.5, 4.5, 5, 5.5, 6, 7, 7.5, 8, 9],
      mon:  [4.5, 4.5, 5, 5.5, 6, 7, 7.5, 8, 9],
      bal:  [6, 6, 7, 7, 8, 8, 9, 9, 10],
      k1:   [23.5, 23.5, 26.5, 28, 30, 33, 35, 38, 42],
      k4:   [94, 94, 106, 110, 120, 132, 140, 152, 168]
    }
  };
  var RFT = 5;

  /* Колесо: шина постоянного внешнего диаметра, диск растёт с посадочным диаметром,
     поэтому боковина шины становится тоньше, как в жизни. Суппорт не вращается. */
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  var svg = $('wheel'), spinA, spinB, rimA, rimB, caliper, angle = 0;
  function buildWheel() {
    var defs = el('defs', {}, svg);
    var g1 = el('radialGradient', { id: 'metal', cx: '35%', cy: '30%', r: '80%' }, defs);
    el('stop', { offset: '0', 'stop-color': '#f4f4f2' }, g1);
    el('stop', { offset: '.55', 'stop-color': '#9b9b98' }, g1);
    el('stop', { offset: '1', 'stop-color': '#4a4a48' }, g1);
    var g2 = el('radialGradient', { id: 'tyre', cx: '50%', cy: '50%', r: '50%' }, defs);
    el('stop', { offset: '.7', 'stop-color': '#1d1d1d' }, g2);
    el('stop', { offset: '1', 'stop-color': '#0c0c0c' }, g2);

    // Слой 1 (вращается): шина, обод, тормозной диск
    spinA = el('g', { class: 'wheel__spin wheel__roll' }, svg);
    el('circle', { r: 100, fill: 'url(#tyre)', stroke: '#2e2e2e', 'stroke-width': 1 }, spinA);
    for (var i = 0; i < 72; i++) {
      var a = i * 5 * Math.PI / 180;
      el('line', { x1: 94 * Math.cos(a), y1: 94 * Math.sin(a), x2: 100 * Math.cos(a), y2: 100 * Math.sin(a), stroke: '#2a2a2a', 'stroke-width': 1.6 }, spinA);
    }
    rimA = el('g', { class: 'wheel__rim' }, spinA);   // нарисован для радиуса 100 и масштабируется
    el('circle', { r: 100, fill: 'url(#metal)' }, rimA);
    el('circle', { r: 92, fill: '#0e0e0e' }, rimA);
    el('circle', { r: 72, fill: '#2a2a2a', stroke: '#3a3a3a', 'stroke-width': 2 }, rimA);
    for (var h = 0; h < 24; h++) {
      var b = h * 15 * Math.PI / 180;
      el('circle', { cx: 58 * Math.cos(b), cy: 58 * Math.sin(b), r: 1.6, fill: '#1a1a1a' }, rimA);
    }

    // Слой 2 (неподвижный): суппорт в фирменном оранжевом
    caliper = el('path', { fill: '#ff5600' }, svg);

    // Слой 3 (вращается): спицы и ступица поверх суппорта
    spinB = el('g', { class: 'wheel__spin wheel__roll' }, svg);
    el('circle', { r: 100, fill: 'none' }, spinB);
    rimB = el('g', { class: 'wheel__rim' }, spinB);
    el('circle', { r: 100, fill: 'none' }, rimB);       // задаёт симметричную рамку для вращения
    for (var s = 0; s < 5; s++) {
      var sp = el('g', { transform: 'rotate(' + (s * 72) + ')' }, rimB);
      el('path', { d: 'M -7 -20 L -11 -90 L -3 -91 L -1 -20 Z', fill: 'url(#metal)' }, sp);
      el('path', { d: 'M 1 -20 L 3 -91 L 11 -90 L 7 -20 Z', fill: 'url(#metal)' }, sp);
    }
    el('circle', { r: 24, fill: 'url(#metal)' }, rimB);
    el('circle', { r: 9, fill: '#111' }, rimB);
    for (var n = 0; n < 5; n++) {
      var c = (n * 72 - 90) * Math.PI / 180;
      el('circle', { cx: 16 * Math.cos(c), cy: 16 * Math.sin(c), r: 3, fill: '#2b2b2b' }, rimB);
    }
  }
  function arcPath(r1, r2, a1, a2) {
    var p = function (r, a) { a = a * Math.PI / 180; return (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2); };
    return 'M ' + p(r2, a1) + ' A ' + r2 + ' ' + r2 + ' 0 0 1 ' + p(r2, a2) + ' L ' + p(r1, a2) + ' A ' + r1 + ' ' + r1 + ' 0 0 0 ' + p(r1, a1) + ' Z';
  }
  function setWheel(i, spin) {
    if (!svg) return;
    var scale = (DNUM[i] * 25.4) / 740;   // доля диска во внешнем диаметре шины ~740 мм
    var t = 'scale(' + scale.toFixed(3) + ')';
    rimA.style.transform = t; rimB.style.transform = t;
    var r = scale * 100;
    caliper.setAttribute('d', arcPath(r * .6, r * .84, -34, 34));
    if (spin) {
      angle += 288;
      spinA.style.transform = spinB.style.transform = 'rotate(' + angle + 'deg)';
    }
    $('wheelLabel').textContent = 'R' + D[i].replace('-', '–');
  }
  if (svg) buildWheel();

  var row = $('diaRow');
  if (row) {
    D.forEach(function (d, i) {
      var label = document.createElement('label');
      var parts = d.split('-');
      var inner = parts.length > 1 ? 'R' + parts[0] + '<small>–' + parts[1] + '</small>' : 'R' + d;
      label.innerHTML = '<input type="radio" name="dia" value="' + i + '"' + (i === 3 ? ' checked' : '') +
        ' aria-label="Диаметр R' + d + '"><span>' + inner + '</span>';
      row.appendChild(label);
    });

    var calc = $('calc');
    var total = $('total4');
    var update = function (animate) {
      var body = calc.querySelector('input[name="body"]:checked').value;
      var i = +calc.querySelector('input[name="dia"]:checked').value;
      var rft = $('rft').checked;
      var p = PRICES[body];
      var add = rft ? RFT : 0;
      total.textContent = fmt(p.k4[i] + add * 4);
      $('perWheel').textContent = fmt(p.k1[i] + add) + ' BYN за одно колесо, R' + D[i].replace('-', '–');
      $('b-snat').textContent = fmt(p.snat[i]);
      $('b-dem').textContent = fmt(p.dem[i]);
      $('b-mon').textContent = fmt(p.mon[i]);
      $('b-bal').textContent = fmt(p.bal[i]);
      $('b-rft-row').hidden = !rft;
      setWheel(i, animate);
      if (animate) {
        var t = total.parentNode;
        t.classList.remove('bump'); void t.offsetWidth; t.classList.add('bump');
      }
    };
    calc.addEventListener('change', function () { update(true); });
    update(false);
  }

  /* ---------- Лента отзывов ---------- */
  var track = $('reviewsTrack');
  document.querySelectorAll('[data-rv]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = track.querySelector('.rv');
      var step = card ? card.getBoundingClientRect().width + 8 : 320;
      track.scrollBy({ left: step * +btn.getAttribute('data-rv'), behavior: 'smooth' });
    });
  });

  /* ---------- Виджет YClients ----------
     Открывает запись поверх сайта, но работает только на домене, разрешённом в кабинете YClients
     (topwheels.by). На других адресах, например github.io, кнопки .ms_booking открывают запись в новой вкладке. */
  if (/(^|\.)topwheels\.by$/.test(location.hostname)) {
    var yc = document.createElement('script');
    yc.src = 'https://w1313611.yclients.com/widgetJS';
    yc.charset = 'UTF-8';
    yc.async = true;
    document.body.appendChild(yc);
  }

  /* ---------- Копирование координат ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () { btn.textContent = 'Скопировано'; setTimeout(function () { btn.textContent = 'Скопировать'; }, 1800); };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents($('coords'));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
    });
  });
})();
