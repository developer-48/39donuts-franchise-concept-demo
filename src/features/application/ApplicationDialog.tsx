import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { BrandText } from '../../components/BrandText'
import { ArrowIcon, CheckIcon, CloseIcon } from '../../components/Icons'

type ApplicationDialogProps = {
  open: boolean
  onClose: () => void
}

type FieldErrors = Record<string, string>

const roleOptions = [
  'Самостоятельно погружусь в операционные процессы, затем найму управляющего',
  'Сразу назначу управляющего, который будет выстраивать процессы',
  'Только инвестирую, без активного участия в управлении',
]

const formatOptions = ['Кофейня вместе с цехом', 'Кофейня и цех отдельно', 'Цех и точка на вынос']

const investmentOptions = [
  'Бюджет достаточен для открытия кофейни',
  'Планирую привлечь инвестиции',
  'Имею дополнительный ресурс в запасе',
]

export function ApplicationDialog({ open, onClose }: ApplicationDialogProps) {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    if (document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement
    }
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const bodyPaddingRight = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'
    const backgroundElements = [
      document.querySelector<HTMLElement>('.site-header'),
      document.querySelector<HTMLElement>('#main-content'),
      document.querySelector<HTMLElement>('.site-footer'),
    ].filter((element): element is HTMLElement => Boolean(element))
    const previousAriaHidden = backgroundElements.map((element) => element.getAttribute('aria-hidden'))
    backgroundElements.forEach((element) => {
      element.inert = true
      element.setAttribute('aria-hidden', 'true')
    })
    closeButtonRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      document.removeEventListener('keydown', onKeyDown)
      backgroundElements.forEach((element, index) => {
        element.inert = false
        const previousValue = previousAriaHidden[index]
        if (previousValue === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', previousValue)
      })
      const returnTarget = returnFocusRef.current
      returnFocusRef.current = null
      requestAnimationFrame(() => {
        if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true })
      })
    }
  }, [open, onClose])

  if (!open) return null

  const validate = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const nextErrors: FieldErrors = {}
    const fullName = String(data.get('fullName') ?? '').trim()
    const age = String(data.get('age') ?? '').trim()
    const region = String(data.get('region') ?? '').trim()
    const contact = String(data.get('contact') ?? '').trim()

    if (fullName.length < 3) nextErrors.fullName = 'Введите имя — не меньше 3 символов.'
    if (age && (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120)) {
      nextErrors.age = 'Укажите целый возраст от 1 до 120.'
    }
    if (!data.get('role')) nextErrors.role = 'Выберите планируемую роль.'
    if (!data.get('format')) nextErrors.format = 'Выберите формат.'
    if (!data.get('investment')) nextErrors.investment = 'Выберите вариант финансирования.'
    if (region.length < 2) nextErrors.region = 'Укажите город или регион.'
    if (contact.length < 4) nextErrors.contact = 'Укажите удобный контакт.'
    if (!data.get('consent')) nextErrors.consent = 'Подтвердите демо-проверку формы.'

    return nextErrors
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(event.currentTarget)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      event.currentTarget.reset()
      setSubmitted(true)
    } else {
      setSubmitted(false)
      const form = event.currentTarget
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    }
  }

  return (
    <div className="dialog-layer">
      <button className="dialog-backdrop" type="button" aria-label="Закрыть анкету" onClick={onClose} />
      <div
        className="application-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-dialog-title"
        aria-describedby="application-dialog-description"
      >
        <div className="dialog-header">
          <div>
            <span className="dialog-kicker">Демонстрационный режим</span>
            <h2 id="application-dialog-title">Анкета будущего партнёра</h2>
            <p id="application-dialog-description">
              Поля проверяются только в браузере. Данные не отправляются, не сохраняются и не передаются <BrandText>39 donuts</BrandText>.
            </p>
          </div>
          <button ref={closeButtonRef} className="dialog-close" type="button" onClick={onClose} aria-label="Закрыть анкету">
            <CloseIcon />
          </button>
        </div>

        {submitted ? (
          <div className="demo-success" role="status" aria-live="polite">
            <span>
              <CheckIcon />
            </span>
            <h3>Локальная проверка пройдена</h3>
            <p>Это только демонстрация интерфейса: данные не отправлены и не сохранены.</p>
            <button className="button" type="button" onClick={() => setSubmitted(false)}>
              Посмотреть анкету снова
              <ArrowIcon />
            </button>
          </div>
        ) : (
          <form className="application-form" noValidate onSubmit={onSubmit}>
            <div className="form-grid two-columns">
              <Field label="ФИО" name="fullName" placeholder="Иванов Иван Иванович" required error={errors.fullName} />
              <Field label="Возраст" name="age" placeholder="30" inputMode="numeric" error={errors.age} />
            </div>
            <Field label="Опыт работы" name="experience" placeholder="Например, 3 года в общепите" />

            <RadioGroup label="Какую роль планируете занять?" name="role" options={roleOptions} error={errors.role} />
            <div className="form-grid two-columns form-group-grid">
              <RadioGroup label="Какой формат хотите открыть?" name="format" options={formatOptions} error={errors.format} />
              <RadioGroup label="Как планируете инвестировать?" name="investment" options={investmentOptions} error={errors.investment} />
            </div>

            <Field label="Регион / город / место" name="region" placeholder="Город, район или торговый центр" required error={errors.region} />
            <div className="form-grid two-columns">
              <TextArea label="Маркетинговая стратегия" name="marketing" placeholder="Как планируете привлекать гостей?" />
              <TextArea
                label={
                  <>
                    Почему <BrandText>39 donuts</BrandText>
                  </>
                }
                name="reason"
                placeholder="Что привлекло вас в бренде?"
              />
            </div>
            <TextArea label="О себе" name="about" placeholder="Коротко расскажите о себе" />
            <Field label="Контакт" name="contact" placeholder="Телефон / Telegram / Email" required error={errors.contact} />

            <label className={`consent-field ${errors.consent ? 'has-error' : ''}`}>
              <input
                type="checkbox"
                name="consent"
                required
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? 'error-consent' : undefined}
              />
              <span>
                Я понимаю, что это демо: введённые данные не отправляются и будут удалены при закрытии страницы.
                <b aria-hidden="true"> *</b>
              </span>
            </label>
            {errors.consent && (
              <span className="field-error" id="error-consent">
                {errors.consent}
              </span>
            )}

            <div className="form-submit-row">
              <p>Нажатие запускает только локальную проверку полей.</p>
              <button className="button" type="submit">
                Проверить анкету
                <ArrowIcon />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

type FieldProps = {
  label: ReactNode
  name: string
  placeholder?: string
  required?: boolean
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  error?: string
}

function Field({ label, name, placeholder, required, inputMode = 'text', error }: FieldProps) {
  return (
    <label className={`form-field ${error ? 'has-error' : ''}`}>
      <span>
        {label} {required && <b aria-hidden="true">*</b>}
      </span>
      <input
        name={name}
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `error-${name}` : undefined}
      />
      {error && (
        <span className="field-error" id={`error-${name}`}>
          {error}
        </span>
      )}
    </label>
  )
}

function TextArea({ label, name, placeholder }: Omit<FieldProps, 'required' | 'inputMode' | 'error'>) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea name={name} placeholder={placeholder} rows={3} />
    </label>
  )
}

type RadioGroupProps = {
  label: string
  name: string
  options: string[]
  error?: string
}

function RadioGroup({ label, name, options, error }: RadioGroupProps) {
  return (
    <fieldset className={`radio-group ${error ? 'has-error' : ''}`} aria-describedby={error ? `error-${name}` : undefined}>
      <legend>{label} *</legend>
      {options.map((option) => (
        <label key={option}>
          <input type="radio" name={name} value={option} required aria-invalid={Boolean(error)} />
          <span>{option}</span>
        </label>
      ))}
      {error && (
        <span className="field-error" id={`error-${name}`}>
          {error}
        </span>
      )}
    </fieldset>
  )
}
