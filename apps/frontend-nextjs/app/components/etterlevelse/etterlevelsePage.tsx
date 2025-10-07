'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { EListName, TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { useParams } from 'next/navigation'
import { useContext } from 'react'
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

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: 'Temaoversikt',
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
    },
  ]

  return (
    <PageLayout
      pageTitle={`K${params.kravNummer.toString()}.${params.kravVersjon.toString()} ${temaData?.shortName} E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title.toString()}`}
      currentPage={'K' + params.kravNummer + '.' + params.kravVersjon}
      breadcrumbPaths={breadcrumbPaths}
    >
      test
    </PageLayout>
  )
}
export default EtterlevelsePage
