'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Alert, BodyLong, Heading, List, Textarea } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { CenteredLoader } from '../common/centeredLoader/centeredLoader'
import { PageLayout } from '../others/scaffold/scaffold'

export const SendTilRisikoeierGodkjenningPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title}`,
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
        <div>
          <Heading level='1' size='large' className='mb-10'>
            Få etterlevelsen godkjent av risikoeier
          </Heading>

          <Heading level='2' size='medium' className='mb-5'>
            Godkjenningshistorikk
          </Heading>

          <Heading level='2' size='medium' className='mb-5'>
            Send til ny godkjenning
          </Heading>

          <BodyLong>
            Dere kan til enhver tid be risikoeier om å godkjenne etterlevelsesdokumentasjonen.
            Risikoeieren vil da godkjenne:
          </BodyLong>

          <List as='ul'>
            <List.Item>
              Dokumentasjon av alle etterlevelseskrav som er en del av etterlevelsesdokumentet på
              godkjenningstidspunktet. Dette gjelder også etterlevelseskrav som ikke er ferdigstilt.
            </List.Item>
            <List.Item>
              Svar på om det er nødvendig å gjennomføre PVK. Dette gjelder kun hvis dere har huket
              av for at personopplysninger behandles under Dokumentegenskaper.
            </List.Item>
          </List>

          <BodyLong className='mt-5'>
            Risikoeier vil kun godkjenne etterlevelsesdokumentet. Dersom det finnes et PVK-dokument,
            vil dette ikke være en del av denne godkjenningen.
            <br />
            <br />
            Når risikoeier godkjenner, arkiveres etterlevelsen og godkjenningen i Public 360.
          </BodyLong>

          <div className='mt-3'>
            <Textarea
              rows={3}
              label='Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning'
              name='Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning'
            />
          </div>

          <div className='mt-10'>
            <Alert variant='info' inline>
              Når dere sender etterlevelsen til godkjenning, vil hele dokumentasjonen låses og ikke
              kunne redigeres. Etter at risikoeier har godkjent, vil dere kunne redigere på nytt.
            </Alert>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default SendTilRisikoeierGodkjenningPage
