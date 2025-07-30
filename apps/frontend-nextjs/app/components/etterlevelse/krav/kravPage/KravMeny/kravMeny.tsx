import { Etterlevelser } from '@/components/etterlevelse/etterlevelse'
import { ViewKrav } from '@/components/etterlevelse/viewKrav/viewKravComponent'
import { TKravQL } from '@/constants/krav/kravConstants'
import { useLocationState, useQueryParam } from '@/util/hooks/customHooks/customHooks'
import { Tabs } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'

type TSection = 'krav' | 'etterlevelser' | 'tilbakemeldinger'
type TLocationState = { tab: TSection; avdelingOpen?: string }

type TProps = {
  krav: TKravQL
  kravLoading: boolean
}

export const KravMeny: FunctionComponent<TProps> = ({ krav, kravLoading }) => {
  const { state, navigate, changeState } = useLocationState<TLocationState>()
  const tilbakemeldingId = useQueryParam('tilbakemeldingId')

  // todo split loading krav and subelements?
  const etterlevelserLoading: boolean = kravLoading

  const [tab, setTab] = useState<TSection>(
    tilbakemeldingId !== undefined && tilbakemeldingId !== ''
      ? 'tilbakemeldinger'
      : state?.tab || 'krav'
  )

  return (
    <div className='w-full'>
      <Tabs defaultValue={tab} onChange={(section) => setTab(section as TSection)}>
        <Tabs.List>
          <Tabs.Tab value='krav' label='Hvordan etterleve?' />
          <Tabs.Tab value='etterlevelser' label='Hvordan har andre gjort det?' />
          <Tabs.Tab value='tilbakemeldinger' label='Spørsmål og svar' />
        </Tabs.List>
        <Tabs.Panel value='krav'>
          <ViewKrav krav={krav} />
        </Tabs.Panel>
        <Tabs.Panel value='etterlevelser'>
          <Etterlevelser loading={etterlevelserLoading} krav={krav} />
        </Tabs.Panel>
        <Tabs.Panel value='tilbakemeldinger'>
          <Tilbakemeldinger krav={krav} hasKravExpired={hasKravExpired()} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
