// Shared contact and legal details used by the footer, contacts and SEO.
export const postalAddress = {
  streetAddress: 'Висаитовский район, ул. Дружбы, д. 57',
  addressLocality: 'Грозный',
  addressRegion: 'Чеченская Республика',
  postalCode: '364006',
  addressCountry: 'RU',
}

export const contact = {
  legalName: 'ИП Бисултанов Адам Хаз-Хажиевич',
  inn: '201600377172',
  ogrnip: '326200000004234',
  address: `${postalAddress.postalCode}, Россия, ${postalAddress.addressRegion}, г. ${postalAddress.addressLocality}, ${postalAddress.streetAddress}`,
  postalAddress,
  hours: 'Ежедневно с 10:00 до 20:00',
  email: 'info@39donuts.ru',
  phone: '+7 (929) 893-39-39',
  phoneHref: '+79298933939',
  instagram: 'https://www.instagram.com/39donuts/',
  telegram: 'https://t.me/grz39donuts',
  whatsapp: 'https://wa.me/79298933939',
  privacy: `${import.meta.env.BASE_URL}privacy-policy/`,
}
