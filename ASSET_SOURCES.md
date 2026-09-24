# Реестр источников изображений

Дата проверки: 22 сентября 2026 года. Все перечисленные URL на момент проверки отвечали HTTP 200. Файлы сохранены без изменения содержимого.

Публичная доступность не равна лицензии на коммерческую публикацию. Эти материалы используются только в локальном инициативном концепте. Официальный логотип не перерисован и не перекрашен.

| Локальный файл | Публичный источник | Тип и использование |
| --- | --- | --- |
| `public/favicon.ico` | https://39donuts.ru/favicon.ico?favicon.f364ab3d.ico | оригинальная иконка вкладки ICO, 6 размеров до 256×256; подключена для всех маршрутов |
| `logo.svg` | https://39donuts.ru/logo.svg | официальный SVG-логотип, без изменений |
| `blocks__hero__hero_img_1.png` | https://39donuts.ru/blocks/hero/hero_img_1.png | фотография действующей точки; hero обеих версий |
| `blocks__whoare__whoare_img_5.png` | https://39donuts.ru/blocks/whoare/whoare_img_5.png | фотография гостей у витрины; история бренда |
| `blocks__whoare__whoare_img_6.png` | https://39donuts.ru/blocks/whoare/whoare_img_6.png | фотография павильона вечером; история бренда |
| `blocks__whoare__whoare_img_7.1.png` | https://39donuts.ru/blocks/whoare/whoare_img_7.1.png | предметный packshot пончика; hero и история |
| `blocks__whoare__whoare_img_8.png` | https://39donuts.ru/blocks/whoare/whoare_img_8.png | фотография рукопожатия двух партнёров; история команды |
| `blocks__whoare__whoare_img_9.png` | https://39donuts.ru/blocks/whoare/whoare_img_9.png | публично размещённый текущим сайтом вертикальный кадр Ибрагима Токкаева; галерея основателя в E/F/G |
| `blocks__whoare__whoare_img_10.png` | https://39donuts.ru/blocks/whoare/whoare_img_10.png | публично размещённый текущим сайтом кадр Ибрагима Токкаева на встрече; галерея основателя в E/F/G |
| `blocks__whoare__whoare_img_11.png` | https://39donuts.ru/blocks/whoare/whoare_img_11.png | публично размещённый текущим сайтом кадр рабочей встречи; галерея основателя в E/F/G |
| `blocks__shops__shops_img_1.png` | https://39donuts.ru/blocks/shops/shops_img_1.png | фотография витрины в России; мозаика сети |
| `blocks__shops__shops_img_3.png` | https://39donuts.ru/blocks/shops/shops_img_3.png | фотография интерьера в России; мозаика сети и экран сравнения |
| `blocks__shops__shops_img_6.png` | https://39donuts.ru/blocks/shops/shops_img_6.png | фотография формата сети в Казахстане; мозаика сети |
| `blocks__formats__formats_img_1.png` | https://39donuts.ru/blocks/formats/formats_img_1.png | фотография формата «Кофейня + цех» |
| `blocks__formats__formats_img_3.png` | https://39donuts.ru/blocks/formats/formats_img_3.png | композиция интерьера и производственной линии; «Кофейня, цех отдельно» |
| `blocks__formats__formats_img_2.png` | https://39donuts.ru/blocks/formats/formats_img_2.png | иллюстративная визуализация островка; в интерфейсе явно не называется фотографией |
| `blocks__reviews__reviews_img_4.png` | https://39donuts.ru/blocks/reviews/reviews_img_4.png | портрет Ризвана |
| `blocks__reviews__reviews_img_2.png` | https://39donuts.ru/blocks/reviews/reviews_img_2.png | портрет Мурада |
| `blocks__reviews__reviews_img_3.png` | https://39donuts.ru/blocks/reviews/reviews_img_3.png | портрет Абу |
| `blocks__reviews__reviews_img_1.png` | https://39donuts.ru/blocks/reviews/reviews_img_1.png | портрет Алдама |
| `blocks__partners__partners_img_6.png` | https://39donuts.ru/blocks/partners/partners_img_6.png | брендовый композит телефона, стакана и пончика; CTA анкеты, обозначен как иллюстрация |
| `blocks__contacts__contacts_img_5.png` | https://39donuts.ru/blocks/contacts/contacts_img_5.png | вспомогательный исходный композит телефона и переписки; в F/G не используется, потому что телефон и обе роли переписки собраны из HTML/CSS |

В папке также сохранены вспомогательные файлы исходного сайта, которые не обязаны отображаться в каждом варианте: hero-wordmark, декоративная donut-полоса, иконки шагов и контактов. Пять файлов `blocks__partners__partners_img_1.svg` … `blocks__partners__partners_img_5.svg` сохранены как исходные материалы, но в итоговых шагах G не отображаются. Их URL строятся напрямую из имени: `https://39donuts.ru/` + исходный путь, где двойное подчёркивание в локальном имени заменяет `/`.

## Новый графический элемент

- `public/assets/concept/donut-scroll-thumb-variety.png` — уменьшенная копия специально созданной для этого концепта объёмной стопки из восьми пончиков с разной глазурью. Используется как бегунок основного скролла в варианте G.

## Шрифты

- `@fontsource/nunito` — локальный Nunito 900 для единого текстового начертания `39 donuts` и `39 м²`; лицензия SIL Open Font License 1.1 зафиксирована в `THIRD_PARTY_NOTICES.md`.
- `@fontsource/manrope` и `@fontsource/unbounded` — основная текстовая и акцидентная типографика интерфейса.

## Иконки интерфейса G

- Восемь согласованных контурных пиктограмм (`cake`, `clock`, `coffee`, `document`, `location`, `message`, `people`, `shop`) взяты из предоставленного пользователем локального пака; исходные SVG не перерисовывались. В мобильном меню G для «Форматов» используется ясная пиктограмма витрины `shop`.
- `public/assets/icons/book.svg` для пункта «История» взят из официального набора [Heroicons 24 Outline](https://github.com/tailwindlabs/heroicons/tree/master/optimized/24/outline).
- Направляющие пиктограммы `ArrowRight`, `ArrowLeft`, `ChevronRight`, `ArrowUpRight`, `Bars3` и `XMark` взяты из официального пакета [Heroicons 24 Solid](https://github.com/tailwindlabs/heroicons/tree/master/optimized/24/solid), встроены как SVG-компоненты в `src/components/Icons.tsx` и наследуют цвет интерфейса.
- Текст лицензии Heroicons (MIT, Tailwind Labs) сохранён в корневом [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## Контентные источники

- Главная страница и все показатели/разделы: https://39donuts.ru/
- Политика обработки данных и юридические реквизиты: https://39donuts.ru/privacy-policy/
- Instagram бренда: https://www.instagram.com/39donuts/ — публикации не использовались, так как публичный fetch не дал надёжного доступа.
- Instagram основателя: https://www.instagram.com/tokkaev/ — медиа напрямую из Instagram не загружались; три локальных кадра взяты с текущего публичного сайта 39 Donuts, а элементы галереи ведут на профиль `@tokkaev`.
