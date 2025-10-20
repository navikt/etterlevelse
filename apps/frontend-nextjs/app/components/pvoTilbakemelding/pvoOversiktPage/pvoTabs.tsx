'use client'

import { pvoTabQueryUrl } from '@/routes/personvernombud/personvernombudetsRoutes'
import { Tabs } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type TSection = 'siste' | 'alle'

const PvoTabs = () => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const [tab, setTab] = useState<TSection>((queryParams.get('tab') as TSection) || 'siste')

  useEffect(() => {
    const tabQuery = queryParams.get('tab')

    if (tabQuery) {
      setTab(tabQuery as TSection)
    }
  }, [])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(tabQuery: string) => {
        setTab(tabQuery as TSection)
        router.push(pvoTabQueryUrl(tabQuery), { scroll: false })
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='siste' label='Mine sist redigerte' />
        <Tabs.Tab value='alle' label='Alle PVKer' />
      </Tabs.List>
      <Tabs.Panel value='siste'>
        PvoSistRedigertView
        {/* <PvoSistRedigertView /> */}
      </Tabs.Panel>
      <Tabs.Panel value='alle'>
        PvoTilbakemeldingsList
        {/* <PvoTilbakemeldingsList /> */}
      </Tabs.Panel>
    </Tabs>
  )
}

export default PvoTabs
