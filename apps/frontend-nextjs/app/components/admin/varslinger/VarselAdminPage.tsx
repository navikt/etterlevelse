'use client'

import { getMeldingByType, mapMeldingToFormValue } from '@/api/melding/meldingApi'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { EObjectType } from '@/constants/admin/audit/auditConstants'
import { EMeldingType, IMelding } from '@/constants/admin/message/messageConstants'
import { ampli } from '@/services/amplitude/amplitudeService'
import { Heading, Tabs } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { AuditRecentTable } from '../versjonering/AuditRecentTable'
import EditMelding from './EditMelding'
import EditOmEtterlevelse from './EditOmEtterlevelse'

type TSection =
  | 'utsendtMelding'
  | EMeldingType.SYSTEM
  | EMeldingType.FORSIDE
  | EMeldingType.OM_ETTERLEVELSE

export const VarselAdminPageContent = () => {
  return (
    <PageLayout pageTitle='Varslinger' currentPage='Varslinger'>
      <Heading className='mt-2' size='medium' level='1'>
        Varslinger
      </Heading>

      <div className='pt-6'>
        <VarselTabs />
      </div>
    </PageLayout>
  )
}

const getMeldingType = (tabName: string) => {
  switch (tabName) {
    case 'FORSIDE':
      return EMeldingType.FORSIDE
    case 'OM_ETTERLEVELSE':
      return EMeldingType.OM_ETTERLEVELSE
    default:
      return EMeldingType.SYSTEM
  }
}

const VarselTabs = () => {
  const params = useParams<{ tab?: TSection }>()

  const [tab, setTab] = useState<TSection>(params.tab || 'utsendtMelding')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [melding, setMelding] = useState<IMelding>()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (tab !== 'utsendtMelding') {
        const ampliInstance = ampli()
        if (ampliInstance) {
          ampliInstance.logEvent('sidevisning', {
            side: 'Varsel side for admin',
            sidetittel: 'Opprett varsel melding for ' + tab,
          })
        }
        const response = await getMeldingByType(getMeldingType(tab))
        if (response.numberOfElements > 0) {
          setMelding(response.content[0])
        } else {
          setMelding(mapMeldingToFormValue({ meldingType: getMeldingType(tab) }))
        }
      }
      setLoading(false)
    })()
  }, [tab])

  return (
    <Tabs defaultValue='utsendtMelding'>
      <Tabs.List>
        <Tabs.Tab value='utsendtMelding' label='Utsendte meldinger' />
        <Tabs.Tab
          value={EMeldingType.SYSTEM}
          label='Systemmelding'
          onClick={() => {
            setTab(EMeldingType.SYSTEM)
          }}
        />
        <Tabs.Tab
          value={EMeldingType.FORSIDE}
          label='Informasjon på forsiden'
          onClick={() => {
            setTab(EMeldingType.FORSIDE)
          }}
        />
        <Tabs.Tab
          value={EMeldingType.OM_ETTERLEVELSE}
          label='Om etterlevelse'
          onClick={() => {
            setTab(EMeldingType.OM_ETTERLEVELSE)
          }}
        />
      </Tabs.List>
      <Tabs.Panel value='utsendtMelding'>
        <AuditRecentTable show={true} tableType={EObjectType.Melding} />
      </Tabs.Panel>
      <Tabs.Panel value={EMeldingType.SYSTEM}>
        <EditMelding melding={melding} setMelding={setMelding} isLoading={isLoading} />
      </Tabs.Panel>
      <Tabs.Panel value={EMeldingType.FORSIDE}>
        <EditMelding
          melding={melding}
          setMelding={setMelding}
          isLoading={isLoading}
          maxChar={500}
        />
      </Tabs.Panel>
      <Tabs.Panel value={EMeldingType.OM_ETTERLEVELSE}>
        <EditOmEtterlevelse
          melding={melding}
          setMelding={setMelding}
          isLoading={isLoading}
          maxChar={500}
        />
      </Tabs.Panel>
    </Tabs>
  )
}

const VarselAdminPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VarselAdminPageContent />
  </Suspense>
)

export default VarselAdminPage
