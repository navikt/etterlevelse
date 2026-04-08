'use client'

import PvoSistRedigertView from '@/components/pvoTilbakemelding/pvoOversiktPage/pvoTabs/pvoSistRedigertView'
import { PvoTilbakemeldingsList } from '@/components/pvoTilbakemelding/pvoOversiktPage/pvoTabs/pvoTilbakemeldingsList'
import { pvoTabQueryUrl } from '@/routes/personvernombud/personvernombudetsRoutes'
import { Tabs } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'

type TSection = 'siste' | 'alle'

const PvoTabs = () => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const queryTab = queryParams.get('tab')
  const tab: TSection = queryTab === 'alle' || queryTab === 'siste' ? queryTab : 'siste'

  return (
    <Tabs
      value={tab}
      onChange={(tabQuery: string) => {
        router.push(pvoTabQueryUrl(tabQuery), { scroll: false })
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='siste' label='Mine sist redigerte' />
        <Tabs.Tab value='alle' label='Alle PVKer' />
      </Tabs.List>
      <Tabs.Panel value='siste'>
        <PvoSistRedigertView />
      </Tabs.Panel>
      <Tabs.Panel value='alle'>
        <PvoTilbakemeldingsList />
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
