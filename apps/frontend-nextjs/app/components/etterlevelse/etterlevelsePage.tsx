'use client'

import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '@/api/etterlevelse/etterlevelseApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getKravByKravNumberAndVersion } from '@/api/krav/kravApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { EtterlevelseKravView } from '@/components/etterlevelse/etterlevelseKravView'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { EListName, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { useParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { PageLayout } from '../others/scaffold/scaffold'

export const EtterlevelsePage = () => {
  const params = useParams<{
    id: string
    tema: string
    kravNummer: string
    kravVersjon: string
  }>()

  const codelist = useContext(CodelistContext)
  const temaData: TTemaCode | undefined = codelist.utils.getCode(
    EListName.TEMA,
    params.tema?.replace('i', '')
  ) as TTemaCode | undefined

  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [varsleMelding, setVarsleMelding] = useState('')

  const [etterlevelse, setEtterlevelse] = useState<IEtterlevelse>()
  const [loadingEtterlevelseData, setLoadingEtterlevelseData] = useState<boolean>(false)
  const [tidligereEtterlevelser, setTidligereEtterlevelser] = useState<IEtterlevelse[]>()
  const [nextKravToDocument, setNextKravToDocument] = useState<string>('')
  const [kravId, setKravId] = useState<TKravId | undefined>()

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: 'Temaoversikt',
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
    },
  ]

  useEffect(() => {
    ;(async () => {
      setLoadingEtterlevelseData(true)
      if (params.kravNummer && params.kravVersjon) {
        const krav = await getKravByKravNumberAndVersion(params.kravNummer, params.kravVersjon)
        if (krav) {
          setVarsleMelding(krav.varselMelding || '')
        }

        if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.id) {
          const kravVersjon = parseInt(params.kravVersjon)
          const etterlevelser = await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
            etterlevelseDokumentasjon.id,
            parseInt(params.kravNummer)
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
                kravNummer: parseInt(params.kravNummer),
              })
            )
          }
        }
      }
      setLoadingEtterlevelseData(false)
    })()
  }, [])

  return (
    <PageLayout
      pageTitle={`K${params.kravNummer.toString()}.${params.kravVersjon.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title.toString()}`}
      currentPage={'K' + params.kravNummer + '.' + params.kravVersjon}
      breadcrumbPaths={breadcrumbPaths}
    >
      {etterlevelseDokumentasjon && (
        <div className='w-full'>
          {loadingEtterlevelseData && <CenteredLoader />}
          {!loadingEtterlevelseData && etterlevelse && (
            <EtterlevelseKravView
              nextKravToDocument={nextKravToDocument}
              temaName={temaName}
              tidligereEtterlevelser={tidligereEtterlevelser}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              kravId={toKravId(etterlevelse)}
              etterlevelse={etterlevelse}
              setEtterlevelse={setEtterlevelse}
              varsleMelding={varsleMelding}
              navigatePath={navigatePath}
            />
          )}
        </div>
      )}
    </PageLayout>
  )
}
export default EtterlevelsePage
