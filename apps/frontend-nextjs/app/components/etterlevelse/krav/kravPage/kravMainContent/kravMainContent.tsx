'use client'

import { KravHasExpiredPage } from '@/components/etterlevelse/krav/kravPage/kravHasExpiredPage/kravHasExpiredPage'
import {
  ContentLayout,
  MainPanelLayout,
} from '@/components/others/layout/contentLayout/contentLayoutComponent'
import { Heading, Spacer } from '@navikt/ds-react'

export const KravMainContent = () => (
  <ContentLayout>
    <MainPanelLayout>
      <KravHasExpiredPage />
      <div className='bg-blue-50 px-5 py-3 mb-5'>
        <Heading size='small' level='2'>
          Hensikten med kravet
        </Heading>
        <div className='w-full'>TEST</div>
      </div>
    </MainPanelLayout>
    <div className='max-w-lg w-full border-l-2 border-gray-200 pl-3'>
      <div>ALLINFO</div>
      <div className='mt-8'>
        KRAV
        <div>
          <div className='flex flex-1'>
            KNAPPER
            <Spacer />
          </div>
          <div className='mt-2.5 flex'>SLETT KRAV</div>
        </div>
      </div>
    </div>
  </ContentLayout>
)
