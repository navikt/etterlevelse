'use client'

import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '@/api/etterlevelse/etterlevelseApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { EtterlevelseKravView } from '@/components/etterlevelse/etterlevelsePage/etterlevelseKravView/etterlevelseKravView'
import { IBreadCrumbPath, IPageResponse } from '@/constants/commonConstants'
import {
  EEtterlevelseStatus,
  IEtterlevelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { EListName, TLovCode, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { getKravMedPrioriteringOgEtterlevelseQuery } from '@/query/krav/kravQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { sortKravListeByPriority, toKravId } from '@/util/krav/kravUtil'
import { useQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import { PageLayout } from '../../others/scaffold/scaffold'

export const EtterlevelsePage = () => {
  const params = useParams<{
    etterlevelseDokumentasjonId: string
    tema: string
    kravNummer: string
    kravVersjon: string
  }>()

  const codelist = useContext(CodelistContext)
  const temaData: TTemaCode | undefined = codelist.utils.getCode(
    EListName.TEMA,
    params.tema?.replace('i', '')
  ) as TTemaCode | undefined
  const lover: TLovCode[] = codelist.utils.getLovCodesForTema(params.tema)
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.etterlevelseDokumentasjonId
  )
  const [etterlevelse, setEtterlevelse] = useState<IEtterlevelse>()
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = useState<IEtterlevelse[]>()

  const currentKravNummer = Number(params.kravNummer)
  const currentKravVersjon = Number(params.kravVersjon)

  const { data, loading } = useQuery<{ krav: IPageResponse<TKravQL> }>(
    getKravMedPrioriteringOgEtterlevelseQuery,
    {
      variables: {
        etterlevelseDokumentasjonId: params.etterlevelseDokumentasjonId,
        lover: lover.map((lov: TLovCode) => lov.code),
        tema: params.tema,
        status: EKravStatus.AKTIV,
      },
      skip: !params.tema || !params.etterlevelseDokumentasjonId,
      fetchPolicy: 'no-cache',
    }
  )

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: 'Temaoversikt',
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
    },
  ]

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.id) {
        const kravVersjon = currentKravVersjon
        const etterlevelser = await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
          etterlevelseDokumentasjon.id,
          currentKravNummer
        )
        const etterlevelserList = etterlevelser.content.sort((a, b) =>
          a.kravVersjon > b.kravVersjon ? -1 : 1
        )
        setTidligereEtterlevelser(etterlevelserList.filter((e) => e.kravVersjon < kravVersjon))

        if (etterlevelserList.filter((e) => e.kravVersjon === kravVersjon).length > 0) {
          setEtterlevelse(
            mapEtterlevelseToFormValue(
              etterlevelserList.filter((e) => e.kravVersjon === kravVersjon)[0]
            )
          )
        } else {
          setEtterlevelse(
            mapEtterlevelseToFormValue({
              etterlevelseDokumentasjonId: etterlevelseDokumentasjon.id,
              kravVersjon: kravVersjon,
              kravNummer: currentKravNummer,
            })
          )
        }
      }
    })()
  }, [etterlevelseDokumentasjon, currentKravNummer, currentKravVersjon])

  const nextKravToDocument = useMemo(() => {
    if (!data || loading) {
      return ''
    }

    const kravPriorityList: TKravQL[] = sortKravListeByPriority<TKravQL>(data.krav.content)
    const currentKravIndex: number = kravPriorityList.findIndex(
      (krav: TKravQL) => krav.kravNummer === currentKravNummer
    )

    if (currentKravIndex === -1 || kravPriorityList.length - 1 === currentKravIndex) {
      return ''
    }

    const nextKravIndex = kravPriorityList.findIndex(
      (krav: TKravQL, index: number) =>
        index > currentKravIndex &&
        (krav.etterlevelser.length === 0 ||
          (krav.etterlevelser.length > 0 &&
            ![
              EEtterlevelseStatus.FERDIG_DOKUMENTERT,
              EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT,
            ].includes(krav.etterlevelser[0].status)))
    )

    const nextKrav: TKravQL = kravPriorityList[nextKravIndex]
    return nextKrav ? `/${nextKrav.kravNummer}/${nextKrav.kravVersjon}` : ''
  }, [data, loading, currentKravNummer])

  return (
    <PageLayout
      pageTitle={`K${params.kravNummer.toString()}.${params.kravVersjon.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()}.${etterlevelseDokumentasjon?.etterlevelseDokumentVersjon.toString()} ${etterlevelseDokumentasjon?.title.toString()}`}
      currentPage={'K' + params.kravNummer + '.' + params.kravVersjon}
      breadcrumbPaths={breadcrumbPaths}
    >
      {etterlevelseDokumentasjon && (
        <div className='w-full'>
          {!etterlevelse && <CenteredLoader />}
          {etterlevelse && (
            <EtterlevelseKravView
              nextKravToDocument={nextKravToDocument}
              temaName={temaData?.shortName}
              tidligereEtterlevelser={tidligereEtterlevelser}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              kravId={toKravId(etterlevelse)}
              etterlevelse={etterlevelse}
              setEtterlevelse={setEtterlevelse}
            />
          )}
        </div>
      )}
    </PageLayout>
  )
}
export default EtterlevelsePage
