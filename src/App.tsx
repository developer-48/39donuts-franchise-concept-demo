import { useCallback, useEffect, useState } from 'react'
import { ApplicationDialog } from './features/application/ApplicationDialog'
import { ApplicationWizardDialog } from './features/application/ApplicationWizardDialog'
import { FaqSection } from './features/faq/FaqSection'
import { FormatsSection } from './features/formats/FormatsSection'
import { DonutScrollbar } from './features/navigation/DonutScrollbar'
import { Header } from './features/navigation/Header'
import { useRevealSections } from './hooks/useRevealSections'
import { ContactSection } from './sections/ContactSection'
import { HeroSection } from './sections/HeroSection'
import { NetworkSection } from './sections/NetworkSection'
import { PartnershipSection } from './sections/PartnershipSection'
import { RevenueSection } from './sections/RevenueSection'
import { ReviewsSection } from './sections/ReviewsSection'
import { SiteFooter } from './sections/SiteFooter'
import { StorySection } from './sections/StorySection'
import type { Variant } from './types/Variant'

function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/+$/, '')
  const pathname = basePath && window.location.pathname.startsWith(basePath)
    ? window.location.pathname.slice(basePath.length)
    : window.location.pathname
  const route = pathname.replace(/\/+$/, '') || '/'
  if (route === '/e') return <VariantPage variant="e" />
  if (route === '/f') return <VariantPage variant="f" />
  if (route === '/g') return <VariantPage variant="g" />
  return <VariantPage variant="g" />
}

function VariantPage({ variant }: { variant: Variant }) {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const closeApplication = useCallback(() => setApplicationOpen(false), [])
  const openApplication = useCallback(() => setApplicationOpen(true), [])
  useRevealSections()

  useEffect(() => {
    document.title = '39 donuts — франшиза кофеен с пончиками'
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [variant])

  const isNextIteration = variant !== 'e'

  return (
    <div className={`site site-e${isNextIteration ? ` site-next site-${variant}` : ''}`}>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <Header variant={variant} onOpenApplication={openApplication} />
      <main id="main-content">
        <HeroSection variant={variant} onOpenApplication={openApplication} />
        <RevenueSection variant={variant} />
        <StorySection variant={variant} />
        <NetworkSection variant={variant} />
        <FormatsSection variant={variant} />
        <ReviewsSection variant={variant} />
        <PartnershipSection variant={variant} onOpenApplication={openApplication} />
        <FaqSection variant={variant} />
        <ContactSection variant={variant} />
      </main>
      <SiteFooter variant={variant} />
      {variant === 'g' && <DonutScrollbar dialogOpen={applicationOpen} />}
      {variant === 'e' ? (
        <ApplicationDialog open={applicationOpen} onClose={closeApplication} />
      ) : (
        <ApplicationWizardDialog open={applicationOpen} onClose={closeApplication} variant={variant} />
      )}
    </div>
  )
}

export default App
