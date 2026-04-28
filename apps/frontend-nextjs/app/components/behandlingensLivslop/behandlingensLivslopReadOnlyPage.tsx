'use client'

import {
  mapBehandlingensLivslopRequestToFormValue,
  useBehandlingensLivslop,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Heading, Loader } from '@navikt/ds-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ContentLayout, MainPanelLayout, SidePanelLayout } from '../others/layout/content/content'
import { PageLayout } from '../others/scaffold/scaffold'
import BehandlingensLivslopReadOnlyContent from './content/behandlingensLivslopReadOnlyContent'
import BehandlingensLivsLopSidePanel from './sidePanel/BehandlingensLivsLopSidePanel'

export const BehandlingensLivslopReadOnlyPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      behandlingensLivslopId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string; behandlingensLivslopId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [behandlingsLivslop] = useBehandlingensLivslop(
    params.behandlingensLivslopId,
    params.etterlevelseDokumentasjonId
  )

  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        '.' +
        etterlevelseDokumentasjon?.etterlevelseDokumentVersjon +
        ' ' +
        etterlevelseDokumentasjon?.title,
    },
  ]

  useEffect(() => {
    if (etterlevelseDokumentasjon) {
      getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
        .then((response) => {
          if (response) {
            setPvkDokument(response)
          }
        })
        .catch(() => undefined)
    }
  }, [etterlevelseDokumentasjon])

  return (
    <PageLayout
      pageTitle='Behandlingens livsløp'
      currentPage='Behandlingens livsløp'
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level='1' size='medium' className='mb-5'>
        Behandlingens livsløp
      </Heading>

      {isEtterlevelseDokumentasjonLoading && (
        <div className='flex w-full justify-center'>
          <Loader size='large' />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading && etterlevelseDokumentasjon && behandlingsLivslop && (
        <ContentLayout>
          <MainPanelLayout hasSidePanel>
            {pvkDokument && (
              <BehandlingensLivslopReadOnlyContent
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                behandlingensLivslop={mapBehandlingensLivslopRequestToFormValue(behandlingsLivslop)}
                noSidePanelContent
                noHeader
              />
            )}
          </MainPanelLayout>

          {/* right side */}
          {etterlevelseDokumentasjon && (
            <SidePanelLayout>
              <BehandlingensLivsLopSidePanel
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </SidePanelLayout>
          )}
        </ContentLayout>
      )}
    </PageLayout>
  )
}

export default BehandlingensLivslopReadOnlyPage
