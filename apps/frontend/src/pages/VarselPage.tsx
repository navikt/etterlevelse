import {Helmet} from 'react-helmet'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import EditMelding from '../components/varslinger/EditMelding'
import {Melding, MeldingType} from '../constants'
import {getMeldingByType, mapMeldingToFormValue} from '../api/MeldingApi'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {AuditRecentTable} from '../components/admin/audit/AuditRecentTable'
import {ampli} from '../services/Amplitude'
import EditOmEtterlevelse from '../components/varslinger/EditOmEtterlevelse'
import VarselAdminPage from './VarselAdminPage'
import {Heading, Tabs} from "@navikt/ds-react";

type Section = 'utsendtMelding' | MeldingType.SYSTEM | MeldingType.FORSIDE | MeldingType.OM_ETTERLEVELSE

export const VarselPage = () => {
  return (
    <div className="w-full pb-52" id="content" role="main">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Varslinger</title>
      </Helmet>
      <div className="w-full flex justify-center">
        <div className="max-w-7xl w-full">
          <div className="px-24 pt-6">
            <CustomizedBreadcrumbs currentPage="Varslinger" />
            <Heading size="large" >Varslinger</Heading>
          </div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="max-w-7xl w-full">
          <div className="px-24 pt-6">
            <VarselTabs />
          </div>
        </div>
      </div>
    </div>
  )
}

const getMeldingType = (tabName: string) => {
  switch (tabName) {
    case 'FORSIDE':
      return MeldingType.FORSIDE
    case 'OM_ETTERLEVELSE':
      return MeldingType.OM_ETTERLEVELSE
    default:
      return MeldingType.SYSTEM
  }
}

const VarselTabs = () => {
  const params = useParams<{ tab?: Section }>()

  const [tab, setTab] = useState<Section>(params.tab || 'utsendtMelding')
  const [isLoading, setLoading] = useState<boolean>(false)
  const [melding, setMelding] = useState<Melding>()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      if (tab !== 'utsendtMelding') {
        ampli.logEvent('sidevisning', { side: 'Varsel side for admin', sidetittel: 'Opprett varsel melding for ' + tab })
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
      <Tabs defaultValue="utsendtMelding">
        <Tabs.List>
          <Tabs.Tab value="utsendtMelding" label="Utsendte meldinger"/>
          <Tabs.Tab value={MeldingType.SYSTEM} label="Systemmelding"onClick={()=> {setTab(MeldingType.SYSTEM)}}/>
          <Tabs.Tab value={MeldingType.FORSIDE} label="Informasjon på forsiden"onClick={()=> {setTab(MeldingType.FORSIDE)}}/>
          <Tabs.Tab value={MeldingType.OM_ETTERLEVELSE} label="Om etterlevelse"onClick={()=> {setTab(MeldingType.OM_ETTERLEVELSE)}}/>
          <Tabs.Tab value="Administrer meldinger" label="Administrer meldinger"/>
        </Tabs.List>
        <Tabs.Panel value="utsendtMelding">
          <AuditRecentTable show={true} tableType={ObjectType.Melding} />
        </Tabs.Panel>
        <Tabs.Panel value={MeldingType.SYSTEM}>
          <EditMelding melding={melding} setMelding={setMelding} isLoading={isLoading} />
        </Tabs.Panel>
        <Tabs.Panel value={MeldingType.FORSIDE}>
          <EditMelding melding={melding} setMelding={setMelding} isLoading={isLoading} maxChar={500} />
        </Tabs.Panel>
        <Tabs.Panel value={MeldingType.OM_ETTERLEVELSE}>
          <EditOmEtterlevelse melding={melding} setMelding={setMelding} isLoading={isLoading} maxChar={500} />
        </Tabs.Panel>
        <Tabs.Panel value="Administrer meldinger">
          <VarselAdminPage />
        </Tabs.Panel>
    </Tabs>
  )
}
