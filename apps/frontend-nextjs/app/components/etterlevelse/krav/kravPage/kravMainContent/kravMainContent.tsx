'use client'

import {
  ContentLayout,
  MainPanelLayout,
} from '@/components/others/layout/contentLayout/contentLayoutComponent'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { FunctionComponent, useState } from 'react'
import { KravHasExpired } from './kravHasExpired/kravHasExpired'
import { KravHensikt } from './kravHensikt/kravHensikt'
import { KravRightSidePanel } from './kravRightSidePanel/kravRightSidePanel'
import { KravTabMeny } from './kravTabMeny/kravTabMeny'

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
        <KravTabMeny
          krav={krav}
          kravLoading={kravLoading}
          setAlleKravVersjoner={setAlleKravVersjoner}
        />
      </MainPanelLayout>
      <KravRightSidePanel krav={krav} alleKravVersjoner={alleKravVersjoner} />
    </ContentLayout>
  )
}
