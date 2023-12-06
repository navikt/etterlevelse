import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { KravId, KravMedPrioriteringOgEtterlevelseQuery } from '../api/KravApi'
import CustomizedBreadcrumbs, { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { Helmet } from 'react-helmet'
import { ampli } from '../services/Amplitude'
import { EtterlevelseStatus, KRAV_FILTER_TYPE, KravQL, KravStatus, PageResponse } from '../constants'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { KravView } from '../components/etterlevelseDokumentasjonTema/KravView'
import { useQuery } from '@apollo/client'
import { sortKraverByPriority } from '../util/sort'
import { user } from '../services/User'

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const getFilterType = (id: string | number | undefined): KRAV_FILTER_TYPE => {
  if (id === 'RELEVANTE_KRAV') {
    return KRAV_FILTER_TYPE.RELEVANTE_KRAV
  } else if (id === 'BORTFILTTERTE_KRAV') {
    return KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV
  } else {
    return KRAV_FILTER_TYPE.UTGAATE_KRAV
  }
}

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id: string; tema: string; kravNummer: string; kravVersjon: string; filter: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const lover = codelist.getCodesForTema(params.tema)

  const { data, loading } = useQuery<{ krav: PageResponse<KravQL> }>(KravMedPrioriteringOgEtterlevelseQuery, {
    variables: {
      etterlevelseDokumentasjonId: params.id,
      lover: lover.map((l) => l.code),
      status: KravStatus.AKTIV,
    },
    skip: !params.tema || !params.id,
    fetchPolicy: 'no-cache',
  })

  const [nextKravToDocument, setNextKravToDocument] = useState<string>('')
  const [kravId, setKravId] = useState<KravId | undefined>()

  useEffect(() => {
    if (data && !loading) {
      const kravPriorityList = sortKraverByPriority<KravQL>(data?.krav.content, temaData?.shortName || '')
      const currentKravIndex = kravPriorityList.findIndex((k) => k.kravNummer === kravId?.kravNummer)
      if (currentKravIndex !== null && kravPriorityList.length - 1 !== currentKravIndex) {
        const nextKravIndex = kravPriorityList.findIndex(
          (k, i) =>
            i > currentKravIndex &&
            (k.etterlevelser.length === 0 ||
              (k.etterlevelser.length > 0 &&
                k.etterlevelser[0].status !== EtterlevelseStatus.FERDIG_DOKUMENTERT &&
                k.etterlevelser[0].status !== EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT)),
        )
        const nextKrav = kravPriorityList[nextKravIndex]
        // setNextKravToDocument('/' + nextKrav.kravNummer + '/' + nextKrav.kravVersjon)
      }
    }
  }, [data, loading, temaData, kravId])

  const [navigatePath, setNavigatePath] = useState<string>('')

  const [tab, setTab] = useState<Section>('dokumentasjon')

  useEffect(() => {
    if (params.kravNummer && params.kravVersjon) {
      setKravId({ kravNummer: Number(params.kravNummer), kravVersjon: Number(params.kravVersjon) })
    }
  }, [params])

  useEffect(() => {
    if (etterlevelseDokumentasjon && temaData && kravId) {
      ampli.logEvent('sidevisning', {
        side: 'Dokumentasjon side for etterlevelse',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`,
        section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
        temaKey: temaData.shortName.toString(),
        role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER',
      })
    }
  }, [etterlevelseDokumentasjon])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
    {
      pathName: 'Temaoversikt',
      href: '/dokumentasjon/' + etterlevelseDokumentasjon?.id,
    },
  ]

  return (
    <div role="main" id="content">
      {etterlevelseDokumentasjon && (
        <div>
          <Helmet>
            <meta charSet="utf-8" />
            <title>
              {`K${kravId?.kravNummer?.toString()}.${kravId?.kravVersjon?.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`}
            </title>
          </Helmet>
          <CustomizedBreadcrumbs currentPage={'K' + kravId?.kravNummer + '.' + kravId?.kravVersjon} paths={breadcrumbPaths} />
          {kravId && etterlevelseDokumentasjon && (
            <KravView
              nextKravToDocument={nextKravToDocument}
              temaName={temaData?.shortName}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
              etterlevelseDokumentasjonTitle={etterlevelseDokumentasjon.title}
              etterlevelseNummer={etterlevelseDokumentasjon.etterlevelseNummer}
              behandlinger={etterlevelseDokumentasjon.behandlinger}
              teams={etterlevelseDokumentasjon.teamsData}
              kravId={kravId}
              navigatePath={navigatePath}
              setNavigatePath={setNavigatePath}
              tab={tab}
              setTab={setTab}
              kravFilter={getFilterType(params.filter)}
            />
          )}
        </div>
      )}
    </div>
  )
}
