'use client'

import { kravlisteUrl } from '@/routes/krav/kraveier/kraveierRoutes'
import { Tabs } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SistRedigertKrav } from './sisteRedigertKrav/sisteRedigertKrav'
import { TemaList } from './temaList/temaList'

type TSection = 'siste' | 'alle' | 'tema'

export const KravTabs = () => {
  const router: AppRouterInstance = useRouter()
  const params: Readonly<
    Partial<{
      tab?: string
    }>
  > = useParams<{ tab?: string }>()
  const [tab, setTab] = useState<string>(params.tab || 'siste')

  useEffect(() => {
    setTab((params.tab as TSection) || 'siste')
  }, [params])

  return (
    <Tabs
      defaultValue={tab}
      onChange={(tabQuery: string) => {
        setTab(tabQuery)
        router.push(kravlisteUrl(tabQuery))
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='siste' label='Sist endret av meg' />
        <Tabs.Tab value='tema' label='Endre rekkefølge på krav (Temaoversikt)' />
        <Tabs.Tab value='alle' label='Alle krav' />
      </Tabs.List>
      <Tabs.Panel value='siste'>
        <SistRedigertKrav />
      </Tabs.Panel>
      <Tabs.Panel value='tema'>
        <TemaList />
      </Tabs.Panel>
      {/* 
      <Tabs.Panel value='alle'>
        <AllKrav />
      </Tabs.Panel> */}
    </Tabs>
  )
}
