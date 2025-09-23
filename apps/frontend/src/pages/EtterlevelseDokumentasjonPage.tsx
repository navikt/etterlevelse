import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { TKravId } from '../api/KravApi'
import { etterlevelseDokumentasjonIdUrl } from '../components/common/RouteLinkEtterlevelsesdokumentasjon'
import { KravView } from '../components/etterlevelseDokumentasjonTema/KravView'
import { PageLayout } from '../components/scaffold/Page'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  IBreadCrumbPath,
  IPageResponse,
  TKravQL,
} from '../constants'
import { getKravMedPrioriteringOgEtterlevelseQuery } from '../query/KravQuery'
import { CodelistService, EListName, TLovCode, TTemaCode } from '../services/Codelist'
import { sortKravListeByPriority } from '../util/sort'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

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
  const params: Readonly<
    Partial<{
      id: string
      tema: string
      kravNummer: string
      kravVersjon: string
      filter: string
    }>
  > = useParams<{
    id: string
    tema: string
    kravNummer: string
    kravVersjon: string
    filter: string
  }>()
  const [codelistUtils] = CodelistService()
  const temaData: TTemaCode | undefined = codelistUtils.getCode(
    EListName.TEMA,
    params.tema?.replace('i', '')
  ) as TTemaCode | undefined
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const lover: TLovCode[] = codelistUtils.getLovCodesForTema(params.tema)

  const { data, loading } = useQuery<{ krav: IPageResponse<TKravQL> }>(
    getKravMedPrioriteringOgEtterlevelseQuery,
    {
      variables: {
        etterlevelseDokumentasjonId: params.id,
        lover: lover.map((lov: TLovCode) => lov.code),
        tema: params.tema,
        status: EKravStatus.AKTIV,
      },
      skip: !params.tema || !params.id,
      fetchPolicy: 'no-cache',
    }
  )

  const [nextKravToDocument, setNextKravToDocument] = useState<string>('')
  const [kravId, setKravId] = useState<TKravId | undefined>()

  useEffect(() => {
    if (data && !loading) {
      const kravPriorityList: TKravQL[] = sortKravListeByPriority<TKravQL>(data?.krav.content)
      const currentKravIndex: number = kravPriorityList.findIndex(
        (krav: TKravQL) => krav.kravNummer === kravId?.kravNummer
      )
      if (currentKravIndex !== null && kravPriorityList.length - 1 !== currentKravIndex) {
        const nextKravIndex = kravPriorityList.findIndex(
          (krav: TKravQL, index: number) =>
            index > currentKravIndex &&
            (krav.etterlevelser.length === 0 ||
              (krav.etterlevelser.length > 0 &&
                krav.etterlevelser[0].status !== EEtterlevelseStatus.FERDIG_DOKUMENTERT &&
                krav.etterlevelser[0].status !==
                  EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT))
        )
        const nextKrav: TKravQL = kravPriorityList[nextKravIndex]
        if (nextKrav) {
          setNextKravToDocument('/' + nextKrav.kravNummer + '/' + nextKrav.kravVersjon)
        }
      }
    }
  }, [data, loading, temaData, kravId])

  const [navigatePath] = useState<string>('')

  useEffect(() => {
    if (params.kravNummer && params.kravVersjon) {
      setKravId({ kravNummer: Number(params.kravNummer), kravVersjon: Number(params.kravVersjon) })
    }
  }, [params])

  useEffect(() => {
    if (etterlevelseDokumentasjon && temaData && kravId) {
      // ampli.logEvent('sidevisning', {
      //   side: 'Dokumentasjon side for etterlevelse',
      //   sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`,
      //   section: `K${kravId.kravNummer}.${kravId.kravVersjon}`,
      //   temaKey: temaData.shortName.toString(),
      //   ...userRoleEventProp,
      // })
    }
  }, [etterlevelseDokumentasjon])

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: 'Temaoversikt',
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
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
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              kravId={kravId}
              navigatePath={navigatePath}
              kravFilter={getFilterType(params.filter)}
            />
          )}
        </div>
      )}
    </PageLayout>
  )
}
