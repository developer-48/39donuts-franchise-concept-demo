// The single browser entry point wires the independently owned UI modules.
import { initNavigation } from '../components/layout/header/client.js'
import { initMotion } from './motion.js'
import { initDonutScrollbar } from '../components/layout/scrollbar/client.js'
import { initFormats } from '../components/sections/formats/client.js'
import { initFaq } from '../components/sections/faq/client.js'
import { initApplication } from '../components/application/controller.js'

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
