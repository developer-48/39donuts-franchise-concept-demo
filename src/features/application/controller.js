import { applicationSteps } from '../../data/applicationContent.js'
import { readAnswers, validateStep } from './model.js'
import { renderReview } from './review.js'

export function initApplication() {
  const layer = document.querySelector('.application-wizard-layer-current')
  const dialog = layer.querySelector('.application-wizard-current')
  const form = dialog.querySelector('.wizard-form')
  const closeButton = dialog.querySelector('.dialog-close')
  const layout = dialog.querySelector('.wizard-layout')
  const success = dialog.querySelector('.wizard-success')
  const heading = dialog.querySelector('.wizard-step-heading')
  const bodies = [...form.querySelectorAll('[data-step-body]')]
  const progress = [...dialog.querySelectorAll('[data-wizard-step]')]
  const backButton = form.querySelector('[data-wizard-back]')
  let open = false
  let closing = false
  let closeTimer
  let step = 0
  let furthestStep = 0
  let returnFocus
  let restoreBackground = () => {}

  function clearError(name) {
    const inputs = [...form.querySelectorAll(`[name="${name}"]`)]
    const container = inputs[0]?.closest('.radio-group, .form-field')
    container?.classList.remove('has-error')
    container?.removeAttribute('aria-describedby')
    container?.querySelector('.field-error')?.remove()
    inputs.forEach((input) => {
      input.setAttribute('aria-invalid', 'false')
      input.removeAttribute('aria-describedby')
    })
  }

  function showErrors(errors) {
    for (const input of form.querySelectorAll('[name]')) clearError(input.name)
    for (const [name, message] of Object.entries(errors)) {
      const inputs = [...form.querySelectorAll(`[name="${name}"]`)]
      const container = inputs[0].closest('.radio-group, .form-field')
      const error = document.createElement('span')
      error.className = 'field-error'
      error.id = `wizard-error-${name}`
      error.textContent = message
      container.classList.add('has-error')
      container.append(error)
      if (container.matches('fieldset')) container.setAttribute('aria-describedby', error.id)
      inputs.forEach((input) => {
        input.setAttribute('aria-invalid', 'true')
        if (!container.matches('fieldset')) input.setAttribute('aria-describedby', error.id)
      })
    }
  }

  function focusError() {
    requestAnimationFrame(() => bodies[step].querySelector('[aria-invalid="true"]')?.focus())
  }

  function showStep(nextStep, focus = true) {
    step = nextStep
    success.hidden = true
    layout.hidden = false
    bodies.forEach((body, index) => { body.hidden = index !== step })
    bodies[step].scrollTop = 0
    heading.querySelector('[data-step-number]').textContent = `${String(step + 1).padStart(2, '0')} / 04`
    heading.querySelector('h3').textContent = applicationSteps[step].title
    heading.querySelector('p').textContent = applicationSteps[step].copy
    dialog.querySelector('[data-step-status]').textContent = `Шаг ${step + 1} из 4`
    progress.forEach((button, index) => {
      const active = index === step
      const available = index <= furthestStep
      button.disabled = !available
      button.parentElement.className = active ? 'is-active' : available ? 'is-complete' : ''
      if (active) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
      const state = active ? 'Текущий шаг.' : available ? 'Нажмите, чтобы перейти к этому шагу.' : 'Сначала заполните предыдущие шаги.'
      button.setAttribute('aria-label', `Шаг ${index + 1}: ${applicationSteps[index].title}. ${state}`)
    })
    backButton.hidden = step === 0
    form.querySelector('[data-submit-label]').textContent = step === 3 ? 'Отправить заявку' : 'Продолжить'
    if (step === 3) renderReview(dialog.querySelector('.wizard-review-groups'), readAnswers(form), goToStep)
    if (focus) requestAnimationFrame(() => heading.querySelector('h3').focus({ preventScroll: true }))
  }

  function goToStep(target) {
    if (target === step || target < 0 || target > furthestStep) return
    if (target > step) {
      const data = readAnswers(form)
      for (let index = step; index < target; index += 1) {
        const errors = validateStep(data, index)
        if (Object.keys(errors).length) {
          showStep(index, false)
          showErrors(errors)
          focusError()
          return
        }
      }
    }
    showErrors({})
    showStep(target)
  }

  function reset() {
    form.reset()
    for (const label of form.querySelectorAll('.radio-group label')) label.classList.remove('is-selected')
    furthestStep = 0
    showErrors({})
    showStep(0, false)
  }

  function finishClose() {
    if (!open) return
    clearTimeout(closeTimer)
    open = false
    closing = false
    layer.hidden = true
    layer.classList.remove('is-closing')
    restoreBackground()
    document.dispatchEvent(new CustomEvent('application:visibility', { detail: { open: false } }))
    requestAnimationFrame(() => {
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
      returnFocus = undefined
    })
  }

  function close() {
    if (!open || closing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finishClose()
    closing = true
    layer.classList.add('is-closing')
    layer.dataset.dialogState = 'closing'
    closeTimer = window.setTimeout(finishClose, 180)
  }

  function openDialog() {
    if (open) return
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    reset()
    open = true
    closing = false
    layer.classList.remove('is-closing')
    layer.dataset.dialogState = 'open'
    layer.hidden = false
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const padding = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${padding + scrollbarWidth}px`
    document.body.style.overflow = 'hidden'
    const background = [...document.querySelectorAll('.site-header, #main-content, .site-footer')]
    const previous = background.map((node) => ({ node, inert: node.inert, ariaHidden: node.getAttribute('aria-hidden') }))
    background.forEach((node) => { node.inert = true; node.setAttribute('aria-hidden', 'true') })
    restoreBackground = () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      previous.forEach(({ node, inert, ariaHidden }) => {
        node.inert = inert
        if (ariaHidden === null) node.removeAttribute('aria-hidden')
        else node.setAttribute('aria-hidden', ariaHidden)
      })
    }
    document.dispatchEvent(new CustomEvent('application:visibility', { detail: { open: true } }))
    requestAnimationFrame(() => closeButton.focus({ preventScroll: true }))
  }

  layer.querySelectorAll('[data-close-application]').forEach((button) => button.addEventListener('click', close))
  dialog.addEventListener('animationend', (event) => { if (closing && event.target === dialog) finishClose() })
  progress.forEach((button, index) => button.addEventListener('click', () => goToStep(index)))
  backButton.addEventListener('click', () => goToStep(step - 1))
  dialog.querySelector('[data-return-answers]').addEventListener('click', () => showStep(3))
  dialog.querySelector('[data-reset-application]').addEventListener('click', () => { reset(); heading.querySelector('h3').focus() })
  form.addEventListener('input', (event) => {
    if (event.target.matches('input, textarea')) clearError(event.target.name)
  })
  form.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="radio"]')) return
    clearError(event.target.name)
    form.querySelectorAll(`input[name="${event.target.name}"]`).forEach((input) => input.parentElement.classList.toggle('is-selected', input.checked))
  })
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const errors = validateStep(readAnswers(form), step)
    showErrors(errors)
    if (Object.keys(errors).length) return focusError()
    if (step < 3) {
      furthestStep = Math.max(furthestStep, step + 1)
      showStep(step + 1)
    } else {
      // Keep the reference's local completion until the company's endpoint is supplied.
      layout.hidden = true
      success.hidden = false
    }
  })
  document.addEventListener('keydown', (event) => {
    if (!open) return
    if (event.key === 'Escape') close()
    if (event.key !== 'Tab') return
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]')].filter((node) => node.getClientRects().length)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  })
  return { open: openDialog, close }
}
