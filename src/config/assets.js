// Asset URLs relative to public/assets. Files are grouped by their visible section.
export const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

export const assets = {
  logo: asset('brand/logo.svg'),
  hero: asset('images/hero/photo.png'),
  crowd: asset('images/story/guests-at-counter.png'),
  kioskNight: asset('images/story/night-kiosk.png'),
  donut: asset('images/shared/donut.png'),
  founders: asset('images/story/team.png'),
  ibrahim: asset('images/story/founder.png'),
  founderDetail: asset('images/story/founder-meeting.png'),
  founderDetailTwo: asset('images/story/team-meeting.png'),
  donutRibbon: asset('images/story/donut-ribbon.png'),
  shopCounter: asset('images/network/counter.png'),
  shopInterior: asset('images/network/interior.png'),
  shopCase: asset('images/network/cafe.png'),
  application: asset('images/partnership/application.png'),
}
