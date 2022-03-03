import React, { useEffect, useState } from 'react'
import { Block, Display } from 'baseui/block'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ettlevColors } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { useBehandling } from '../api/BehandlingApi'
import { Layout2 } from '../components/scaffold/Page'
import { Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, KravStatus, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { behandlingKravQuery, KravId } from '../api/KravApi'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { Responsive } from 'baseui/theme'
import { sortKraverByPriority } from '../util/sort'
import _ from 'lodash'
import { getAllKravPriority } from '../api/KravPriorityApi'
import { Helmet } from 'react-helmet'
import { Option } from 'baseui/select'
import { getMainHeader } from './BehandlingPage'
import { KravView } from "../components/behandlingsTema/KravView";
import { SecondaryHeader } from "../components/behandlingsTema/SecondaryHeader";
import { ampli } from '../services/Amplitude'

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id: string; tema: string, kravNummer: string, kravVersjon: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)

  const [kravId, setKravId] = useState<KravId | undefined>()

  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const [isNavigateButtonClicked, setIsNavigateButtonClicked] = useState<boolean>(false)
  const [tab, setTab] = useState<Section>('dokumentasjon')
  const navigate = useNavigate()

  // useEffect(() => {
  //   if(!user.isLoggedIn()) {
  //     navigate(loginUrl(location, location.pathname))
  //   }
  // },[])

  useEffect(() => {
    if (params.kravNummer && params.kravVersjon)
      setKravId({ kravNummer: Number(params.kravNummer), kravVersjon: Number(params.kravVersjon) })
  }, [params])

  useEffect(() => {
    // if(behandling && temaData) {
    //   ampli.logEvent('sidevisning', { side: 'Tema side for behandlingen', sidetittel: `B${behandling.nummer.toString()} ${behandling.navn.toString()}`, section: `${temaData.shortName}` })
    // }
  }, [behandling])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  return (
    <>
      {behandling && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            behandling,
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={<SecondaryHeader
            behandling={behandling}
            lovListe={lovListe}
            temaData={temaData}
          />}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            {kravId && behandling && params.kravNummer && params.kravVersjon && (
              <KravView
                behandlingNavn={behandling.navn}
                behandlingId={behandling.id}
                behandlingformaal={behandling.overordnetFormaal.shortName || ''}
                behandlingNummer={behandling.nummer || 0}
                kravId={kravId}
                setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                setIsNavigateButtonClicked={setIsNavigateButtonClicked}
                isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                isNavigateButtonClicked={isNavigateButtonClicked}
                close={() => {
                  navigate(`/behandling/${behandling.id}/${temaData?.shortName}`)
                }}
                tab={tab}
                setTab={setTab}
              />
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}
