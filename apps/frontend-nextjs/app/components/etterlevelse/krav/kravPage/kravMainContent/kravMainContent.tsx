'use client'

import { KravHasExpired } from '@/components/etterlevelse/krav/kravPage/kravHasExpired/kravHasExpired'
import {
  ContentLayout,
  MainPanelLayout,
} from '@/components/others/layout/contentLayout/contentLayoutComponent'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { Spacer } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { KravHensikt } from '../kravHensikt/kravHensikt'

type TProps = {
  krav: TKravQL
  kravLoading: boolean
}

export const KravMainContent: FunctionComponent<TProps> = ({ krav, kravLoading }) => {
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  return (
    <ContentLayout>
      <MainPanelLayout>
        <KravHasExpired krav={krav} alleKravVersjoner={alleKravVersjoner} />
        <KravHensikt krav={krav} />
        {/* <KravMeny krav={krav} kravLoading={kravLoading} setAlleKravVersjoner={setAlleKravVersjoner}/> */}
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
}
