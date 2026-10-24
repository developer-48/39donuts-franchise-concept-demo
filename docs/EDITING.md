# Как редактировать сайт

Краткая инструкция и текущая карта основного лендинга — [PROJECT_GUIDE.md](PROJECT_GUIDE.md). Порядок секций задаёт `src/components/landing/LandingPage.astro`.

Правки делаются в `src/` и `public/`. Папки `dist/` и `dist-preview/` — результат сборки: следующая сборка перезапишет ручные изменения в них.

## Карта блоков

Все пути в первых девяти строках таблицы начинаются с `src/components/sections/`.

| Блок на странице                          | Папка                           | Главный файл                    | Данные                                                      |
| ----------------------------------------- | ------------------------------- | ------------------------------- | ----------------------------------------------------------- |
| Первый экран                              | `hero/`                         | `HeroSection.astro`             | `content.js`: ключевые показатели                           |
| Выручка по годам                          | `revenue/`                      | `RevenueSection.astro`          | `content.js`: годы и суммы                                  |
| История                                   | `story/`                        | `StorySection.astro`            | `content.js`: история и число пончиков                      |
| Сеть и «Почему пончики?»                  | `network/`                      | `NetworkSection.astro`          | `content.js`: страны; `advantages/content.js`: преимущества |
| Три формата кофейни                       | `formats/`                      | `FormatsSection.astro`          | `content.js`: форматы и все показатели                      |
| Отзывы                                    | `reviews/`                      | `ReviewsSection.astro`          | `content.js`: партнёры и отзывы                             |
| Пять шагов и приглашение заполнить анкету | `partnership/`                  | `PartnershipSection.astro`      | `content.js`: список шагов                                  |
| Вопросы и ответы                          | `faq/`                          | `FaqSection.astro`              | `content.js`: категории, вопросы и ответы                   |
| Контакты                                  | `contacts/`                     | `ContactSection.astro`          | Общие контакты в `src/config/site.js`                       |
| Шапка и мобильное меню                    | `src/components/layout/header/` | `Header.astro`                  | `content.js`: пункты меню                                   |
| Подвал                                    | `src/components/layout/footer/` | `SiteFooter.astro`              | Общие реквизиты в `src/config/site.js`                      |
| Окно анкеты                               | `src/components/application/`   | `ApplicationWizardDialog.astro` | `content.js`: шаги и варианты ответов                       |

В каждой папке есть CSS с названием блока: например `formats/formats.css`. Разметка и короткие подписи находятся в `.astro`, повторяемые тексты и значения — в `content.js`. Для поведения вкладок и FAQ открывайте `client.js` рядом.

Если не знаете, в каком блоке находится текст, используйте поиск редактора по папке `src/`. В терминале:

```sh
rg -n 'Стать партнёром' src
```

## 1. Поменять цвет

Откройте `src/styles/tokens.css`. Здесь находятся общие цвета:

```css
:root {
  --purple: #7a44ca;
  --purple-hover: #6334ad;
  --orange: #fe7f16;
  --green: #7db234;
}
```

Например, для другого фиолетового замените значение `--purple`. Проверьте также `--purple-hover` и `--purple-soft`: это отдельные оттенки для наведения и светлых подложек. Прозрачные производные цвета используют эту же палитру.

Здесь же находятся `--font-body`, `--font-heading`, `--font-brand`, `--container`, `--radius` и `--section-space`. Подключение самих шрифтов — в `src/styles/fonts.css`. Если выбираете новый шрифт, одной замены имени переменной недостаточно: его нужно подключить.

У главной есть тема `.site`; самостоятельные страницы политики и 404 используют корневую тему. Логотип — статический SVG, а фотографии и иллюстрации — изображения. Их цвета не изменятся от правки CSS-переменной. Логотип находится в `public/assets/brand/logo.svg`.

## 2. Подкорректировать кнопку

Общая разметка — `src/components/ui/button/Button.astro`, основные стили — `button.css` рядом. Компонент выводит `<button>` либо `<a>`, если передан `href`, и сохраняет переданные атрибуты.

Например, кнопка открытия анкеты в шапке задана в `src/components/layout/header/Header.astro`:

```astro
<Button class="button-small header-cta" type="button" data-open-application>
  <span>Стать партнёром</span>
  <Icon name="CtaArrow" class="cta-arrow-icon" />
</Button>
```

Для изменения подписи поправьте текст здесь. `data-open-application` связывает кнопку с анкетой; его нужно сохранить, если кнопка продолжает открывать окно. Иконки находятся в `src/components/ui/icon/Icon.astro`.

Для общих размеров в `button.css`:

```css
.button {
  min-height: 56px;
  padding: 14px 22px;
  border-radius: 14px;
}
```

Если нужно увеличить горизонтальные отступы всех обычных кнопок, замените `22px` на нужное значение. Компактная `.button-small` имеет собственные размеры. Расположение и специальные размеры кнопки шапки задаёт `header/header.css`, первого экрана — `hero/hero.css`, приглашения заполнить анкету — `partnership/partnership.css`.

Кнопки «Назад», действия в итоговом просмотре и результат анкеты имеют свои правила в `application/actions/`, `application/review/` и `application/success/`. Правка общего `.button` не должна использоваться для изменения одного такого элемента.

## 3. Изменить вопрос FAQ

Откройте `src/components/sections/faq/content.js`. Экспорт `faqGroups` содержит категории и их вопросы. Ниже сокращённый пример; в рабочем файле сохраните остальные категории и вопросы:

```js
export const faqGroups = [
  {
    id: 'finance',
    label: 'Финансы',
    items: [
      {
        question: 'Входит ли оборудование в стартовые инвестиции?',
        answer: 'Оборудование входит в стартовые инвестиции.',
      },
    ],
  },
]
```

Замените `question` или `answer`. Эти же данные используются в SEO-разметке FAQ: вручную дублировать ответ в `BaseLayout.astro` не нужно. Новый вопрос добавляется в `items` подходящей категории; новый раздел — отдельным объектом в `faqGroups` с уникальным `id`.

## Поменять изображение

Фотографии сгруппированы по секциям в `public/assets/images/`: `hero/`, `story/`, `network/`, `formats/`, `reviews/`, `partnership/`, `shared/`. Бегунок основного скролла — в `scrollbar/`. Иконки лежат в `public/assets/icons/`, логотипы — в `public/assets/brand/`.

Пути к общим изображениям заданы в `src/config/assets.js`. Изображения форматов и партнёров указаны в `content.js` соответствующих секций. Функция `asset()` формирует путь относительно `public/assets/`.

Если заменяете картинку новым файлом:

1. Положите её в папку своей секции и обновите путь в конфигурации или данных.
2. Проверьте `alt` в `.astro`: описание должно соответствовать изображению, у декоративного изображения оставьте пустое значение.
3. Обновите ширину и высоту в `src/components/ui/image/imageMetadata.json`, если путь или размеры изменились. Компонент `SiteImage.astro` использует эти значения, чтобы заранее выделить место под картинку.
4. Проверьте кадрирование на телефоне и компьютере: `object-fit`, высота и позиция находятся в CSS секции.

При замене файла по прежнему пути с прежними размерами метаданные менять не нужно. Изображение для ссылок в мессенджерах находится отдельно: `public/og/39donuts-franchise.png`, 1200 × 630.

## Изменить анкету

| Правка                             | Файл или папка                                                   |
| ---------------------------------- | ---------------------------------------------------------------- |
| Поля шага «О вас»                  | `src/components/application/steps/AboutStep.astro`               |
| Поля шага «Проект»                 | `src/components/application/steps/ProjectStep.astro`             |
| Поля шага «План»                   | `src/components/application/steps/PlanStep.astro`                |
| Контакт и просмотр ответов         | `src/components/application/steps/ContactStep.astro` и `review/` |
| Внешний вид полей                  | `src/components/application/fields/fields.css`                   |
| Плашки шагов                       | `src/components/application/progress/`                           |
| Кнопки переходов                   | `src/components/application/actions/`                            |
| Результат заполнения               | `src/components/application/success/`                            |
| Названия шагов и варианты ответов  | `src/components/application/content.js`                          |
| Обязательность и проверка значений | `src/components/application/model.js`                            |
| Переходы и управление окном        | `src/components/application/controller.js`                       |
| Размер окна и основная сетка       | `src/components/application/application.css`                     |

При добавлении нового поля недостаточно добавить только разметку: проверьте его `name`, правила в `model.js` и `reviewDefinitions` в `content.js`, если ответ должен присутствовать в итоговом просмотре. Анкета пока не подключена к серверной отправке.

## Общие контакты и реквизиты

Откройте `src/config/site.js`: почта, телефон, социальные ссылки и часы работы находятся в `contact`. Адрес задаётся в `postalAddress`; из него формируется строка подвала и адрес в SEO-разметке компании. При изменении юридических данных отдельно проверьте текст политики в `src/content/privacy.js`.

## Проверить и выпустить изменения

Для разработки:

```sh
npm run dev -- --port 4324
```

Перед выпуском:

```sh
npm run format
npm run check
npm run check:preview
```

`format` приводит исходники к одному стилю, `check` проверяет форматирование, JavaScript, тесты и готовую production-сборку. Для архива запускайте `npm run release` — он повторяет проверки и создаёт выпуск с контрольной суммой.

После изменения размеров, текста или изображений проверьте блок на узком экране и на десктопе. Форматирование не проверяет визуал; автоматические проверки не заменяют сверку оформления.

Настройки SEO описаны в [SEO.md](SEO.md), загрузка сборки и сохранение серверной части — в [DEPLOYMENT.md](DEPLOYMENT.md).
