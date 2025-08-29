'use client'

import { ETab } from '@/constants/krav/kravlist/kravlistConstants'
import { kravlisteQueryUrl } from '@/routes/krav/kravRoutes'
import { Tabs } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AllKrav } from './alle/alleKrav'
import { SistRedigertKrav } from './sisteRedigertKrav/sisteRedigertKrav'
import { TemaList } from './temaList/temaList'

type TSection = ETab.SISTE | ETab.ALLE | ETab.TEMA

export const KravTabs = () => {
  const router: AppRouterInstance = useRouter()
  const params: Readonly<
    Partial<{
      tab?: string
    }>
  > = useParams<{ tab?: string }>()
  const [tab, setTab] = useState<string>(params.tab || ETab.SISTE)

  useEffect(() => {
    setTab((params.tab as TSection) || ETab.SISTE)
  }, [params])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(tabQuery: string) => {
        setTab(tabQuery)
        router.push(kravlisteQueryUrl(tabQuery))
      }}
    >
      <Tabs.List>
        <Tabs.Tab value={ETab.SISTE} label='Sist endret av meg' />
        <Tabs.Tab value={ETab.TEMA} label='Endre rekkefølge på krav (Temaoversikt)' />
        <Tabs.Tab value={ETab.ALLE} label='Alle krav' />
      </Tabs.List>
      <Tabs.Panel value={ETab.SISTE}>
        <SistRedigertKrav />
      </Tabs.Panel>
      <Tabs.Panel value={ETab.TEMA}>
        <TemaList />
      </Tabs.Panel>
      <Tabs.Panel value={ETab.ALLE}>
        <AllKrav />
      </Tabs.Panel>
    </Tabs>
  )
}
