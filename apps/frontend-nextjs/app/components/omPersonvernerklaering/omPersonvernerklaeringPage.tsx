'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { PageLayout } from '../others/scaffold/scaffold'
import HovedinnholdPersonerklaering from './hovedinnhold/hovedinnholdPersonvernerklaering'
import OmStepperPersonvernerklaering from './omStepper/omStepperPersonvernerklaering'

const OmPersonvernerklaeringPage = () => {
  const router: AppRouterInstance = useRouter()

  return (
    <PageLayout
      pageTitle='Personvernerklæring for Støtte til etterlevelse'
      currentPage='Personvernerklæring for Støtte til etterlevelse'
    >
      <div className='flex gap-7 mt-10'>
        <OmStepperPersonvernerklaering />
        <div className='max-w-[75ch]'>
          {/* <OmHiddenFormProgress /> */}
          <HovedinnholdPersonerklaering />
        </div>
      </div>
      {/* <OmNavigering
        router={router}
        forrigeLenke={omPVKUrl}
        forrigeLenkeTekst={}
        nesteLenke={oversiktOverLosningeneUrl}
        nesteLenkeTekst={}
      /> */}
    </PageLayout>
  )
}

export default OmPersonvernerklaeringPage
