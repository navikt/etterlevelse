'use client'

import { KravEtterlevelser } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravTabMeny/kravEtterlevelse/kravEtterlevelse'
import { KravTilbakemeldinger } from '@/components/etterlevelse/krav/kravPage/kravMainContent/kravTabMeny/kravTilbakemelding/kravTilbakemelding'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { useQueryParam } from '@/util/hooks/customHooks/customHooks'
import { Tabs } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { KravView } from './kravView/kravView'

type TSection = 'krav' | 'etterlevelser' | 'tilbakemeldinger'

type TProps = {
  krav: TKravQL
  kravLoading: boolean
  alleKravVersjoner: IKravVersjon[]
}

export const KravTabMeny: FunctionComponent<TProps> = ({
  krav,
  kravLoading,
  alleKravVersjoner,
}) => {
  return (
    <KravTabMenyContent
      krav={krav}
      kravLoading={kravLoading}
      alleKravVersjoner={alleKravVersjoner}
    />
  )
}

const KravTabMenyContent: FunctionComponent<TProps> = ({
  krav,
  kravLoading,
  alleKravVersjoner,
}) => {
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')
  const etterlevelserLoading: boolean = kravLoading
  const [tab, setTab] = useState<TSection>(
    tilbakemeldingId !== undefined && tilbakemeldingId !== '' ? 'tilbakemeldinger' : 'krav'
  )

  return (
    <div className='w-full'>
      <Tabs defaultValue={tab} onChange={(section: string) => setTab(section as TSection)}>
        <Tabs.List>
          <Tabs.Tab value='krav' label='Hvordan etterleve?' />
          <Tabs.Tab value='etterlevelser' label='Hvordan har andre gjort det?' />
          <Tabs.Tab value='tilbakemeldinger' label='Spørsmål og svar' />
        </Tabs.List>
        <Tabs.Panel value='krav'>
          <KravView krav={krav} />
        </Tabs.Panel>
        <Tabs.Panel value='etterlevelser'>
          <KravEtterlevelser loading={etterlevelserLoading} krav={krav} />
        </Tabs.Panel>
        <Tabs.Panel value='tilbakemeldinger'>
          <KravTilbakemeldinger krav={krav} alleKravVersjoner={alleKravVersjoner} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
