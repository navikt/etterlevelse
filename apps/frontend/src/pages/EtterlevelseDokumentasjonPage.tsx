import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { KravId, KravMedPrioriteringOgEtterlevelseQuery } from '../api/KravApi'
import { IBreadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'
import { KravView } from '../components/etterlevelseDokumentasjonTema/KravView'
import { PageLayout } from '../components/scaffold/Page'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  IPageResponse,
  TKravQL,
} from '../constants'
import { ampli, userRoleEventProp } from '../services/Amplitude'
import { ListName, TTemaCode, codelist } from '../services/Codelist'
import { sortKraverByPriority } from '../util/sort'

export type TSection = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'

export const getFilterType = (id: string | number | undefined): EKravFilterType => {
  if (id === 'RELEVANTE_KRAV') {
    return EKravFilterType.RELEVANTE_KRAV
  } else if (id === 'BORTFILTTERTE_KRAV') {
    return EKravFilterType.BORTFILTTERTE_KRAV
  } else {
    return EKravFilterType.UTGAATE_KRAV
  }
}

export const EtterlevelseDokumentasjonPage = () => {
  const params = useParams<{
    id: string
    tema: string
    kravNummer: string
    kravVersjon: string
    filter: string
  }>()
  const temaData: TTemaCode | undefined = codelist.getCode(
    ListName.TEMA,
    params.tema?.replace('i', '')
  )
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const lover = codelist.getCodesForTema(params.tema)

  const { data, loading } = useQuery<{ krav: IPageResponse<TKravQL> }>(
    KravMedPrioriteringOgEtterlevelseQuery,
    {
      variables: {
        etterlevelseDokumentasjonId: params.id,
        lover: lover.map((l) => l.code),
        status: EKravStatus.AKTIV,
      },
      skip: !params.tema || !params.id,
      fetchPolicy: 'no-cache',
    }
  )

  const [nextKravToDocument, setNextKravToDocument] = useState<string>('')
  const [kravId, setKravId] = useState<KravId | undefined>()

  useEffect(() => {
    if (data && !loading) {
      const kravPriorityList = sortKraverByPriority<TKravQL>(
        data?.krav.content,
        temaData?.shortName || ''
      )
      const currentKravIndex = kravPriorityList.findIndex(
        (k) => k.kravNummer === kravId?.kravNummer
      )
      if (currentKravIndex !== null && kravPriorityList.length - 1 !== currentKravIndex) {
        const nextKravIndex = kravPriorityList.findIndex(
          (k, i) =>
            i > currentKravIndex &&
            (k.etterlevelser.length === 0 ||
              (k.etterlevelser.length > 0 &&
                k.etterlevelser[0].status !== EEtterlevelseStatus.FERDIG_DOKUMENTERT &&
                k.etterlevelser[0].status !== EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT))
        )
        const nextKrav = kravPriorityList[nextKravIndex]
        if (nextKrav) {
          setNextKravToDocument('/' + nextKrav.kravNummer + '/' + nextKrav.kravVersjon)
        }
      }
    }
  }, [data, loading, temaData, kravId])

  const [navigatePath, setNavigatePath] = useState<string>('')

  const [tab, setTab] = useState<TSection>('dokumentasjon')

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
        ...userRoleEventProp,
      })
    }
  }, [etterlevelseDokumentasjon])

  const breadcrumbPaths: IBreadcrumbPaths[] = [
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
    <PageLayout
      pageTitle={`K${kravId?.kravNummer?.toString()}.${kravId?.kravVersjon?.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title.toString()}`}
      currentPage={'K' + kravId?.kravNummer + '.' + kravId?.kravVersjon}
      breadcrumbPaths={breadcrumbPaths}
    >
      {etterlevelseDokumentasjon && (
        <div>
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
    </PageLayout>
  )
}
