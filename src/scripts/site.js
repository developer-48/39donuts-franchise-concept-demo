import { initNavigation } from './navigation.js'
import { initMotion } from './motion.js'
import { initDonutScrollbar } from './donut-scrollbar.js'
import { initFormats, initFaq } from './tabs.js'
import { initApplication } from '../features/application/controller.js'

document.documentElement.style.scrollBehavior = 'smooth'
const navigation = initNavigation()
const application = initApplication()
initFormats()
initFaq()
initMotion()
initDonutScrollbar()

document.querySelectorAll('[data-open-application]').forEach((button) => {
  button.addEventListener('click', () => {
    if (navigation.isOpen()) {
      navigation.close()
      requestAnimationFrame(() => requestAnimationFrame(() => application.open()))
    } else application.open()
  })
})
