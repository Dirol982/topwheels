// Калькулятор шиномонтажа Top Wheels. Цены — BYN за одно колесо, прайс topwheels.by.
(function () {
  'use strict';

  var D = ['13-15', '16', '17', '18', '19', '20', '21', '22', '23-26'];
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

  function fmt(n) { return String(Math.round(n * 100) / 100).replace('.', ','); }
  function $(id) { return document.getElementById(id); }

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
      $('perWheel').textContent = fmt(p.k1[i] + add) + ' BYN за одно колесо, R' + D[i];
      $('b-snat').textContent = fmt(p.snat[i]);
      $('b-dem').textContent = fmt(p.dem[i]);
      $('b-mon').textContent = fmt(p.mon[i]);
      $('b-bal').textContent = fmt(p.bal[i]);
      $('b-rft-row').hidden = !rft;
      if (animate) {
        var el = total.parentNode;
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    };
    calc.addEventListener('change', function () { update(true); });
    update(false);
  }

  // Виджет YClients открывает запись поверх сайта, но работает только на домене,
  // разрешённом в кабинете YClients (topwheels.by). На других адресах, например
  // github.io, кнопки .ms_booking просто открывают запись в новой вкладке.
  if (/(^|\.)topwheels\.by$/.test(location.hostname)) {
    var yc = document.createElement('script');
    yc.src = 'https://w1313611.yclients.com/widgetJS';
    yc.charset = 'UTF-8';
    yc.async = true;
    document.body.appendChild(yc);
  }

  // Шапка: линия после прокрутки
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Копирование координат
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () { btn.textContent = 'Скопировано'; setTimeout(function () { btn.textContent = 'Скопировать'; }, 1800); };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents($('coords'));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (e) { fallback(); }
    });
  });
})();
