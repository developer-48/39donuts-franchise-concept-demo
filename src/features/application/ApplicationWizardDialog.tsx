import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { BrandText } from '../../components/BrandText'
import { CheckIcon, SolidArrowLeftIcon, SolidArrowRightIcon, XMarkSolidIcon } from '../../components/Icons'
import { WizardDonutScrollbar } from './WizardDonutScrollbar'

type ApplicationWizardDialogProps = {
  open: boolean
  onClose: () => void
}

type WizardData = {
  fullName: string
  age: string
  experience: string
  role: string
  format: string
  investment: string
  region: string
  marketing: string
  reason: string
  about: string
  contact: string
}

type FieldErrors = Partial<Record<keyof WizardData, string>>

const initialData: WizardData = {
  fullName: '',
  age: '',
  experience: '',
  role: '',
  format: '',
  investment: '',
  region: '',
  marketing: '',
  reason: '',
  about: '',
  contact: '',
}

const steps = [
  { title: 'О вас', copy: 'Знакомимся с будущим партнёром и его ролью.' },
  { title: 'Проект', copy: 'Выбираем формат, бюджет и город запуска.' },
  { title: 'План', copy: 'Фиксируем идеи по развитию будущей точки.' },
  { title: 'Контакт', copy: 'Добавьте контакт и проверьте все ответы перед отправкой.' },
]

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

export function ApplicationWizardDialog({ open, onClose }: ApplicationWizardDialogProps) {
  const [step, setStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const [data, setData] = useState<WizardData>(initialData)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [closing, setClosing] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const stepBodyRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const previousStepRef = useRef(0)
  const closingRef = useRef(false)
  const closeCommittedRef = useRef(false)
  const closeTimerRef = useRef<number | null>(null)

  const finishClose = useCallback(() => {
    if (closeCommittedRef.current) return
    closeCommittedRef.current = true
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setClosing(false)
    onClose()
  }, [onClose])

  const requestClose = useCallback(() => {
    if (!open || closingRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose()
      return
    }
    closingRef.current = true
    setClosing(true)
    closeTimerRef.current = window.setTimeout(finishClose, 180)
  }, [finishClose, open])

  useEffect(() => {
    if (open) {
      closingRef.current = false
      closeCommittedRef.current = false
      setClosing(false)
    }
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    setStep(0)
    setFurthestStep(0)
    setData(initialData)
    setErrors({})
    setSubmitted(false)
    previousStepRef.current = 0

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

    requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }))

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]',
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
  }, [open, requestClose])

  useEffect(() => {
    if (!open || submitted || previousStepRef.current === step) return
    previousStepRef.current = step
    requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }))
  }, [open, step, submitted])

  if (!open) return null

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const updateRadio = (name: keyof WizardData, value: string) => {
    setData((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const validateStep = (stepIndex: number) => {
    const nextErrors: FieldErrors = {}
    if (stepIndex === 0) {
      if (data.fullName.trim().length < 3) nextErrors.fullName = 'Введите имя — не меньше 3 символов.'
      if (data.age && (!Number.isInteger(Number(data.age)) || Number(data.age) < 1 || Number(data.age) > 120)) {
        nextErrors.age = 'Укажите целый возраст от 1 до 120.'
      }
      if (!data.role) nextErrors.role = 'Выберите планируемую роль.'
    }
    if (stepIndex === 1) {
      if (!data.format) nextErrors.format = 'Выберите формат.'
      if (!data.investment) nextErrors.investment = 'Выберите вариант финансирования.'
      if (data.region.trim().length < 2) nextErrors.region = 'Укажите город или регион.'
    }
    if (stepIndex === 3) {
      if (data.contact.trim().length < 4) nextErrors.contact = 'Укажите удобный контакт.'
    }
    return nextErrors
  }

  const focusFirstError = () => {
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }

  const goToStep = (targetStep: number) => {
    if (targetStep === step || targetStep < 0 || targetStep > furthestStep) return

    if (targetStep > step) {
      for (let stepIndex = step; stepIndex < targetStep; stepIndex += 1) {
        const nextErrors = validateStep(stepIndex)
        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors)
          if (stepIndex !== step) setStep(stepIndex)
          focusFirstError()
          return
        }
      }
    }

    setErrors({})
    setStep(targetStep)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateStep(step)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError()
      return
    }
    if (step < steps.length - 1) {
      const nextStep = step + 1
      setFurthestStep((current) => Math.max(current, nextStep))
      setStep(nextStep)
      return
    }
    setSubmitted(true)
  }

  const currentStep = steps[step]
  const reviewGroups = [
    {
      title: 'О вас',
      step: 0,
      items: [
        { label: 'ФИО', value: data.fullName, wide: false },
        { label: 'Возраст', value: data.age, wide: false },
        { label: 'Опыт работы', value: data.experience, wide: true },
        { label: 'Роль', value: data.role, wide: true },
      ],
    },
    {
      title: 'Проект',
      step: 1,
      items: [
        { label: 'Формат', value: data.format, wide: true },
        { label: 'Финансирование', value: data.investment, wide: true },
        { label: 'Регион / город / место', value: data.region, wide: true },
      ],
    },
    {
      title: 'План',
      step: 2,
      items: [
        { label: 'Маркетинговая стратегия', value: data.marketing, wide: true },
        { label: 'Почему 39 donuts', value: data.reason, wide: true },
        { label: 'О себе', value: data.about, wide: true },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.value.trim().length > 0),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div className={`dialog-layer application-wizard-layer application-wizard-layer-current${closing ? ' is-closing' : ''}`} data-dialog-state={closing ? 'closing' : 'open'}>
      <button className="dialog-backdrop" type="button" aria-label="Закрыть анкету" onClick={requestClose} />
      <div
        className="application-dialog application-wizard application-wizard-current"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-wizard-title"
        aria-describedby="application-wizard-description"
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) finishClose()
        }}
      >
        <div className="wizard-topbar">
          <div>
            <span className="dialog-kicker">Заявка на партнёрство</span>
            <h2 id="application-wizard-title">
              Анкета партнёра <BrandText>39 donuts</BrandText>
            </h2>
            <p id="application-wizard-description">
              Четыре коротких шага: расскажите о себе, проекте и планах запуска.
            </p>
          </div>
          <button ref={closeButtonRef} className="dialog-close" type="button" onClick={requestClose} aria-label="Закрыть анкету">
            <XMarkSolidIcon />
          </button>
        </div>

        {submitted ? (
          <div className="demo-success wizard-success" role="status" aria-live="polite">
            <span><CheckIcon /></span>
            <h3>Анкета готова</h3>
            <p>Ответы собраны. Можно вернуться к анкете, изменить любой раздел и отправить её снова.</p>
            <div className="wizard-success-actions">
              <button className="button" type="button" onClick={() => { setStep(3); setSubmitted(false) }}>
                Вернуться к ответам
              </button>
              <button
                className="wizard-back"
                type="button"
                onClick={() => {
                  setData(initialData)
                  setStep(0)
                  setFurthestStep(0)
                  setSubmitted(false)
                }}
              >
                Заполнить заново
              </button>
            </div>
          </div>
        ) : (
          <div className="wizard-layout">
            <aside className="wizard-progress" aria-label="Этапы анкеты">
              <span aria-live="polite">Шаг {step + 1} из {steps.length}</span>
              <ol>
                {steps.map((item, index) => {
                  const isActive = index === step
                  const isAvailable = index <= furthestStep
                  const className = isActive ? 'is-active' : isAvailable ? 'is-complete' : ''
                  const stateLabel = isActive
                    ? 'Текущий шаг.'
                    : isAvailable
                      ? 'Нажмите, чтобы перейти к этому шагу.'
                      : 'Сначала заполните предыдущие шаги.'

                  return (
                    <li className={className} key={item.title}>
                      <button
                        className="wizard-progress-step"
                        type="button"
                        disabled={!isAvailable}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Шаг ${index + 1}: ${item.title}. ${stateLabel}`}
                        onClick={() => goToStep(index)}
                      >
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>{item.copy}</small>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </aside>

            <form className="wizard-form" noValidate onSubmit={onSubmit}>
              <div className="wizard-step-heading">
                <span>{String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
                <h3 ref={stepHeadingRef} tabIndex={-1}>{currentStep.title}</h3>
                <p>{currentStep.copy}</p>
              </div>

              <div className="wizard-step-scroll" key={step}>
                <div className="wizard-step-body" id="wizard-step-body" ref={stepBodyRef}>
                  {step === 0 && (
                    <>
                      <div className="form-grid two-columns">
                        <WizardField label="ФИО" name="fullName" value={data.fullName} placeholder="Иванов Иван Иванович" required error={errors.fullName} onChange={updateField} />
                        <WizardField label="Возраст" name="age" value={data.age} placeholder="30" inputMode="numeric" error={errors.age} onChange={updateField} />
                      </div>
                      <WizardField label="Опыт работы" name="experience" value={data.experience} placeholder="Например, 3 года в общепите" onChange={updateField} />
                      <WizardRadioGroup label="Какую роль планируете занять?" name="role" value={data.role} options={roleOptions} error={errors.role} onChange={updateRadio} />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="form-grid two-columns form-group-grid">
                        <WizardRadioGroup label="Какой формат хотите открыть?" name="format" value={data.format} options={formatOptions} error={errors.format} onChange={updateRadio} />
                        <WizardRadioGroup label="Как планируете инвестировать?" name="investment" value={data.investment} options={investmentOptions} error={errors.investment} onChange={updateRadio} />
                      </div>
                      <WizardField label="Регион / город / место" name="region" value={data.region} placeholder="Город, район или торговый центр" required error={errors.region} onChange={updateField} />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="form-grid two-columns">
                        <WizardTextArea label="Маркетинговая стратегия" name="marketing" value={data.marketing} placeholder="Как планируете привлекать гостей?" onChange={updateField} />
                        <WizardTextArea label={<>Почему <BrandText>39 donuts</BrandText></>} name="reason" value={data.reason} placeholder="Что привлекло вас в бренде?" onChange={updateField} />
                      </div>
                      <WizardTextArea label="О себе" name="about" value={data.about} placeholder="Коротко расскажите о себе" onChange={updateField} />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <WizardField label="Контакт" name="contact" value={data.contact} placeholder="Телефон / Telegram / Email" required error={errors.contact} onChange={updateField} />
                      <div className="wizard-review" aria-label="Все ответы анкеты">
                        <div className="wizard-review-heading">
                          <div>
                            <span>Ваши ответы</span>
                            <p>Проверьте заполненные данные перед отправкой. Каждый раздел можно открыть и изменить.</p>
                          </div>
                        </div>
                        <div className="wizard-review-groups">
                          {reviewGroups.map((group) => (
                            <section className="wizard-review-group" key={group.title} aria-labelledby={`wizard-review-${group.step}`}>
                              <header>
                                <div>
                                  <span>{String(group.step + 1).padStart(2, '0')}</span>
                                  <h4 id={`wizard-review-${group.step}`}>{group.title}</h4>
                                </div>
                                {group.step !== step && (
                                  <button type="button" onClick={() => goToStep(group.step)}>Изменить</button>
                                )}
                              </header>
                              <dl>
                                {group.items.map((item) => (
                                  <div className={item.wide || group.items.length === 1 ? 'is-wide' : undefined} key={item.label}>
                                    <dt>{item.label}</dt>
                                    <dd>{item.value.trim()}</dd>
                                  </div>
                                ))}
                              </dl>
                            </section>
                          ))}
                        </div>
                      </div>
                      <p className="wizard-privacy-note">
                        Нажимая «Отправить заявку», вы соглашаетесь с{' '}
                        <a href="https://39donuts.ru/privacy-policy/" target="_blank" rel="noreferrer">политикой обработки персональных данных</a>.
                      </p>
                    </>
                  )}
                </div>
                <WizardDonutScrollbar scrollRef={stepBodyRef} />
              </div>

              <div className="wizard-actions">
                <p>К предыдущим шагам можно вернуться без потери ответов.</p>
                <div>
                  {step > 0 && (
                    <button className="wizard-back" type="button" onClick={() => goToStep(step - 1)}>
                      <SolidArrowLeftIcon className="wizard-action-icon" />
                      <span>Назад</span>
                    </button>
                  )}
                  <button className="button" type="submit">
                    {step === steps.length - 1 ? 'Отправить заявку' : 'Продолжить'} <SolidArrowRightIcon className="wizard-action-icon" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

type WizardFieldProps = {
  label: ReactNode
  name: keyof WizardData
  value: string
  placeholder?: string
  required?: boolean
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  error?: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

function WizardField({ label, name, value, placeholder, required, inputMode = 'text', error, onChange }: WizardFieldProps) {
  return (
    <label className={`form-field ${error ? 'has-error' : ''}`}>
      <span>{label} {required && <b aria-hidden="true">*</b>}</span>
      <input
        name={name}
        type="text"
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `wizard-error-${name}` : undefined}
        onChange={onChange}
      />
      {error && <span className="field-error" id={`wizard-error-${name}`}>{error}</span>}
    </label>
  )
}

function WizardTextArea({ label, name, value, placeholder, onChange }: Omit<WizardFieldProps, 'required' | 'inputMode' | 'error'>) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea name={name} value={value} placeholder={placeholder} rows={4} onChange={onChange} />
    </label>
  )
}

type WizardRadioGroupProps = {
  label: string
  name: 'role' | 'format' | 'investment'
  value: string
  options: string[]
  error?: string
  onChange: (name: keyof WizardData, value: string) => void
}

function WizardRadioGroup({ label, name, value, options, error, onChange }: WizardRadioGroupProps) {
  return (
    <fieldset className={`radio-group ${error ? 'has-error' : ''}`} aria-describedby={error ? `wizard-error-${name}` : undefined}>
      <legend>{label} *</legend>
      {options.map((option) => (
        <label className={value === option ? 'is-selected' : undefined} key={option}>
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            required
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(name, event.currentTarget.value)}
          />
          <span>{option}</span>
        </label>
      ))}
      {error && <span className="field-error" id={`wizard-error-${name}`}>{error}</span>}
    </fieldset>
  )
}
