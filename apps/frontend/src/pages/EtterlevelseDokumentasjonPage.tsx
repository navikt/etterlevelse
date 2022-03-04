import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useNavigate, useParams } from 'react-router-dom'
import { ettlevColors } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { useBehandling } from '../api/BehandlingApi'
import { Layout2 } from '../components/scaffold/Page'
import { KravId } from '../api/KravApi'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import _ from 'lodash'
import { Helmet } from 'react-helmet'
import { getMainHeader } from './BehandlingPage'
import { KravView } from '../components/behandlingsTema/KravView'
import { ampli } from '../services/Amplitude'
import { EtterlevelseSecondaryHeader } from '../components/etterlevelse/EtterlevelseSecondaryHeader'
import { Etterlevelse } from '../constants'
import { getEtterlevelserByBehandlingsIdKravNumber, mapEtterlevelseToFormValue } from '../api/EtterlevelseApi'

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id: string; tema: string, kravNummer: string, kravVersjon: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)

  const [kravId, setKravId] = useState<KravId | undefined>()

  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const [isNavigateButtonClicked, setIsNavigateButtonClicked] = useState<boolean>(false)

  const [etterlevelse, setEtterlevelse] = useState<Etterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = React.useState<Etterlevelse[]>()

  const [tab, setTab] = useState<Section>('dokumentasjon')
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      setLoadingEtterlevelseData(true)
      if (behandling && params.kravNummer && params.kravVersjon) {
        const kravNumber = Number(params.kravNummer)
        const kravVersjon = Number(params.kravVersjon)

        const etterlevelser = await getEtterlevelserByBehandlingsIdKravNumber(behandling.id, kravNumber)
        const etterlevelserList = etterlevelser.content.sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))
        setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

        if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
          setEtterlevelse(etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0])
        } else {
          setEtterlevelse(mapEtterlevelseToFormValue({
            behandlingId: behandling.id,
            kravVersjon: kravVersjon,
            kravNummer: kravNumber,
          }))
        }
      }
      setLoadingEtterlevelseData(false)
    })()
  }, [])

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
          secondaryHeader={
            <EtterlevelseSecondaryHeader
              tab={tab}
              setTab={setTab}
              setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
              setIsNavigateButtonClicked={setIsNavigateButtonClicked}
              behandling={behandling}
              temaData={temaData}
              activeEtterlevleseStatus={etterlevelse?.status}
              lovListe={lovListe}
            />}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            {kravId && behandling && etterlevelse && (
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
                etterlevelse={etterlevelse}
                tidligereEtterlevelser={tidligereEtterlevelser}
                loadingEtterlevelseData={loadingEtterlevelseData}
                close={() => {
                  navigate(`/behandling/${behandling.id}/${temaData?.code}`)
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
