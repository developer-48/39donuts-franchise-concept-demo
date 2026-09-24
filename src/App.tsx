import { useCallback, useEffect, useState } from 'react'
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

function App() {
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
  }, [])

  return (
    <div className="site">
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <Header onOpenApplication={openApplication} />
      <main id="main-content">
        <HeroSection onOpenApplication={openApplication} />
        <RevenueSection />
        <StorySection />
        <NetworkSection />
        <FormatsSection />
        <ReviewsSection />
        <PartnershipSection onOpenApplication={openApplication} />
        <FaqSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <DonutScrollbar dialogOpen={applicationOpen} />
      <ApplicationWizardDialog open={applicationOpen} onClose={closeApplication} />
    </div>
  )
}

export default App
