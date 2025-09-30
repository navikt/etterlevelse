'use client'

import { Tabs } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

enum ETab {
  MINE = 'mine',
  SISTE = 'siste',
  ALLE = 'alle',
  BEHANDLINGSOK = 'behandlingsok',
}

export const DokumentasjonTabs = () => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const [selectedTab, setSelectedTab] = useState<ETab>(ETab.MINE)

  useEffect(() => {
    const tabQuery = queryParams.get('tab')

    if (tabQuery) {
      setSelectedTab(tabQuery as ETab)
    }
  }, [])
  return (
    <Tabs
      defaultValue={ETab.MINE}
      value={selectedTab}
      onChange={(tabQuery: string) => {
        setSelectedTab(tabQuery as ETab)
        router.push(`/dokumentasjoner?tab=${tabQuery}`)
      }}
    >
      <Tabs.List>
        <Tabs.Tab value={ETab.MINE} label='Mine dokumentasjoner' />
        <Tabs.Tab value={ETab.SISTE} label='Siste dokumentasjoner' />
        <Tabs.Tab value={ETab.ALLE} label='Alle' />
        <Tabs.Tab value={ETab.BEHANDLINGSOK} label='Søk med behandling' />
      </Tabs.List>

      <Tabs.Panel value={ETab.MINE}>Mine</Tabs.Panel>
      <Tabs.Panel value={ETab.SISTE}>Siste</Tabs.Panel>
      <Tabs.Panel value={ETab.ALLE}>Alle</Tabs.Panel>
      <Tabs.Panel value={ETab.BEHANDLINGSOK}>Behandlingsøk</Tabs.Panel>
    </Tabs>
  )
}

export default DokumentasjonTabs
