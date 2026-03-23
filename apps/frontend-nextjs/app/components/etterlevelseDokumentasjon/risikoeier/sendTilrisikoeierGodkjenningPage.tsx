'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { useParams } from 'next/navigation'
import SendTilRisikoeierGodkjenning from './sendTilRisikoeierGodkjenning/sendTilRisikoeierGodkjenning'

export const SendTilRisikoeierGodkjenningPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const [
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    isEtterlevelseDokumentasjonLoading,
  ] = useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()}.${etterlevelseDokumentasjon?.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon?.title}`,
    },
  ]

  return (
    <PageLayout
      pageTitle='Få etterlevelsen godkjent av risikoeier'
      currentPage='Få etterlevelsen godkjent av risikoeier'
      breadcrumbPaths={breadcrumbPaths}
    >
      {isEtterlevelseDokumentasjonLoading && <CenteredLoader />}

      {!isEtterlevelseDokumentasjonLoading && etterlevelseDokumentasjon && (
        <SendTilRisikoeierGodkjenning
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          params={params}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )}
    </PageLayout>
  )
}

export default SendTilRisikoeierGodkjenningPage
