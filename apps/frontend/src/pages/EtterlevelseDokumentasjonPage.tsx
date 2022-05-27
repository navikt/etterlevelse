import React, { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useNavigate, useParams } from 'react-router-dom'
import { ettlevColors } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { useBehandling } from '../api/BehandlingApi'
import { Layout2 } from '../components/scaffold/Page'
import { KravId } from '../api/KravApi'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { getMainHeader } from './BehandlingPage'
import { KravView } from '../components/behandlingsTema/KravView'
import { ampli } from '../services/Amplitude'
import { EtterlevelseSecondaryHeader } from '../components/etterlevelse/EtterlevelseSecondaryHeader'
import { KRAV_FILTER_TYPE } from '../constants'

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const getFilterType = (id: string | number | undefined): KRAV_FILTER_TYPE => {
  if (id === KRAV_FILTER_TYPE.RELEVANTE_KRAV) {
    return KRAV_FILTER_TYPE.RELEVANTE_KRAV
  } else if (id === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV) {
    return KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV
  } else {
    return KRAV_FILTER_TYPE.UTGAATE_KRAV
  }
}

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id: string; tema: string; kravNummer: string; kravVersjon: string; filter: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)

  const [kravId, setKravId] = useState<KravId | undefined>()

  const [navigatePath, setNavigatePath] = useState<string>('')

  const [tab, setTab] = useState<Section>('dokumentasjon')
  const navigate = useNavigate()

  useEffect(() => {
    if (params.kravNummer && params.kravVersjon) {
      setKravId({ kravNummer: Number(params.kravNummer), kravVersjon: Number(params.kravVersjon) })
    }
  }, [params])

  useEffect(() => {
    if (behandling && temaData && kravId) {
      ampli.logEvent('sidevisning', {
        side: 'Dokumentasjon side for etterlevelse',
        sidetittel: `B${behandling.nummer.toString()} ${behandling.navn.toString()}`,
        section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
        temaKey: temaData.shortName.toString(),
      })
    }
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
                K{kravId?.kravNummer?.toString()}.{kravId?.kravVersjon?.toString()} {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={
            <EtterlevelseSecondaryHeader
              tab={tab}
              setTab={setTab}
              setNavigatePath={setNavigatePath}
              behandling={behandling}
              temaData={temaData}
              lovListe={lovListe}
              kravId={kravId}
            />
          }
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            {kravId && behandling && (
              <KravView
                behandlingNavn={behandling.navn}
                behandlingId={behandling.id}
                behandlingformaal={behandling.overordnetFormaal.shortName || ''}
                behandlingNummer={behandling.nummer || 0}
                kravId={kravId}
                navigatePath={navigatePath}
                setNavigatePath={setNavigatePath}
                close={() => {
                  navigate(`/behandling/${behandling.id}/${temaData?.code}/${getFilterType(params.filter)}`)
                }}
                tab={tab}
                setTab={setTab}
                kravFilter={getFilterType(params.filter)}
              />
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}
