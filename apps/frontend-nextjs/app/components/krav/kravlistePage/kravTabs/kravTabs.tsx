'use client'

import { ETab } from '@/constants/krav/kravlist/kravlistConstants'
import { kravlisteUrl } from '@/routes/krav/kravRoutes'
import { Tabs } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { AllKrav } from './alle/alleKrav'
import { SistRedigertKrav } from './sisteRedigertKrav/sisteRedigertKrav'
import { TemaList } from './temaList/temaList'

export const KravTabs = () => {
  const router: AppRouterInstance = useRouter()

  return (
    <Tabs
      defaultValue={ETab.SISTE}
      onChange={(tabQuery: string) => {
        router.push(`${kravlisteUrl}?tab=${tabQuery}`)
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
