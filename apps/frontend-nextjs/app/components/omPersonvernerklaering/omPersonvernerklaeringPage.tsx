'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { PageLayout } from '../others/scaffold/scaffold'
import HovedinnholdPersonerklaering from './hovedinnhold/hovedinnholdPersonvernerklaering'

const OmPersonvernerklaeringPage = () => {
  const router: AppRouterInstance = useRouter()

  return (
    <PageLayout
      pageTitle='Personvernerklæring for Støtte til etterlevelse'
      currentPage='Personvernerklæring for Støtte til etterlevelse'
    >
      <div className='flex gap-7 mt-10'>
        {/* <OmStepper /> */}
        <div className='max-w-[75ch]'>
          {/* <OmHiddenFormProgress /> */}
          <HovedinnholdPersonerklaering />
        </div>
      </div>
      {/* <OmNavigering
        router={router}
        forrigeLenke={omPVKUrl}
        nesteLenke={oversiktOverLosningeneUrl}
      /> */}
    </PageLayout>
  )
}

export default OmPersonvernerklaeringPage
