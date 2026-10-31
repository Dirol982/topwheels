# Top Wheels — сайт шиномонтажа

Статический сайт шиномонтажа Top Wheels (Минск, пр-т Победителей, 23/4). Собран без сборщиков и фреймворков: HTML, CSS и немного JS.

## Структура

```
index.html            страница
assets/css/style.css  стили (цвета и шрифты — переменные в :root)
assets/js/main.js     калькулятор стоимости, копирование координат
assets/img/           фото, логотип, favicon, картинка для соцсетей (og.jpg)
.nojekyll             отключает Jekyll на GitHub Pages
```

## Публикация на GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, папка `/ (root)` → Save.
Через минуту сайт откроется по адресу `https://<аккаунт>.github.io/topwheels/`.

Свой домен (например, topwheels.by): в том же разделе укажите Custom domain, а у регистратора домена
добавьте записи A на адреса GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).

## Что где менять

- **Цены шиномонтажа** — массивы `PRICES` в `assets/js/main.js` (за одно колесо, BYN) и таблицы в `index.html`.
- **Онлайн-запись** — все кнопки ведут на YClients `https://n1313611.yclients.com`. Виджет YClients подключён внизу
  `index.html` и открывает запись поверх сайта на всех элементах с классом `ms_booking`.
- **Телефон, адрес, часы** — в `index.html` (разделы «Контакты», шапка, мобильная панель) и в блоке JSON-LD в `<head>`.
- **Отзывы** — блок `#reviews` в `index.html`.
