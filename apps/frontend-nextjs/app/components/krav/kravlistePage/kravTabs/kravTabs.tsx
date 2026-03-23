'use client'

import { ETab } from '@/constants/krav/kravlist/kravlistConstants'
import { kravlisteUrl } from '@/routes/krav/kravRoutes'
import { Tabs } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter, useSearchParams } from 'next/navigation'
import { AllKrav } from './alle/alleKrav'
import { SistRedigertKrav } from './sisteRedigertKrav/sisteRedigertKrav'
import { TemaList } from './temaList/temaList'

export const KravTabs = () => {
  const router: AppRouterInstance = useRouter()
  const queryParams = useSearchParams()
  const tabQuery = queryParams.get('tab') as ETab | null
  const selectedTab: ETab =
    tabQuery && Object.values(ETab).includes(tabQuery) ? tabQuery : ETab.SISTE

  return (
    <Tabs
      defaultValue={ETab.SISTE}
      value={selectedTab}
      onChange={(tab: string) => {
        router.push(`${kravlisteUrl}?tab=${tab}`)
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
