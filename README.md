# HEAVY WEATHER — управление сайтом

Сайт работает на GitHub Pages без сборки и сервера. Основные файлы:

- `index.html` — весь текст, разделы, изображения и ссылки;
- `styles.css` — внешний вид и адаптация под экран;
- `blood-rave-01.webp`, `blood-rave-02.webp` и далее — скриншоты Blood Rave;
- `heavy-weather-lockup.png` — утверждённый логотип, его не растягивать и не заменять.

После коммита в ветку `main` GitHub Pages обновляет сайт автоматически. Обычно это занимает 1–3 минуты.

## Как изменить текст

1. Открыть `index.html` в репозитории.
2. Нажать значок карандаша **Edit this file**.
3. Найти нужную английскую фразу и заменить только текст между HTML-тегами.
4. Нажать **Commit changes** и сохранить прямо в `main`.

Пример:

```html
<h2 id="game-title">Blood Rave</h2>
```

## Как добавить скриншоты игры

1. На главной странице репозитория нажать **Add file → Upload files**.
2. Загрузить изображения с понятными именами: `blood-rave-01.webp`, `blood-rave-02.webp`, `blood-rave-03.webp`.
3. Открыть `index.html` и внутри блока `<div class="container game__inner">` добавить после `game__content`:

```html
<div class="game-gallery" aria-label="Blood Rave screenshots">
  <img src="./blood-rave-01.webp" alt="Blood Rave gameplay screenshot 1" />
  <img src="./blood-rave-02.webp" alt="Blood Rave gameplay screenshot 2" />
</div>
```

Лучший формат — WebP или JPG, одинаковое соотношение сторон 16:9 и ширина 1600–1920 px.

## Как добавить ссылки Steam и CrazyGames

В `index.html` внутри блока `.game__content`, после текста `.game__note`, добавить:

```html
<div class="store-links">
  <a class="store-link" href="ССЫЛКА_STEAM" target="_blank" rel="noreferrer">
    Steam <span aria-hidden="true">↗</span>
  </a>
  <a class="store-link" href="ССЫЛКА_CRAZYGAMES" target="_blank" rel="noreferrer">
    CrazyGames <span aria-hidden="true">↗</span>
  </a>
</div>
```

Заменить `ССЫЛКА_STEAM` и `ССЫЛКА_CRAZYGAMES` реальными адресами страниц игры.

## Как добавить новую игру

Самый безопасный способ — скопировать целиком секцию `<section class="game" ...>`, изменить её уникальный `id`, название, описание, дату, скриншоты и ссылки. У двух секций не должно быть одинаковых `id`.

Если нужно серьёзно изменить сетку, размеры текста или мобильную версию, редактируется `styles.css`. Перед публикацией обязательно проверить сайт на компьютере и телефоне.
