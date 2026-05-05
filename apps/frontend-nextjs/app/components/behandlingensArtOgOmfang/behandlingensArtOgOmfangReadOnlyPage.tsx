'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IExternalCode } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Loader } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import ArtOgOmfangReadOnlyContent from '../PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import BehandlingensLivsLopSidePanel from '../behandlingensLivslop/sidePanel/BehandlingensLivsLopSidePanel'
import { ContentLayout, MainPanelLayout, SidePanelLayout } from '../others/layout/content/content'
import { PageLayout } from '../others/scaffold/scaffold'

export const BehandlingensArtOgOmfangReadOnlyPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      behandlingensArtOgOmfangId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string; behandlingensArtOgOmfangId?: string }>()
  const [etterlevelseDokumentasjon, , isEtterlevelseDokumentasjonLoading] =
    useEtterlevelseDokumentasjon(params.etterlevelseDokumentasjonId)
  const [artOgOmfang, , artOgOmfangLoading] = useBehandlingensArtOgOmfang(
    params.etterlevelseDokumentasjonId
  )

  const readOnlyData: { personkategorier: string[] } = useMemo(() => {
    if (
      etterlevelseDokumentasjon &&
      etterlevelseDokumentasjon.behandlinger &&
      etterlevelseDokumentasjon.behandlinger.length > 0
    ) {
      const allePersonKategorier: IExternalCode[] = []

      etterlevelseDokumentasjon.behandlinger.map((behandling) => {
        if (behandling.dataBehandlerList) {
          behandling.policies.map((policy) => {
            allePersonKategorier.push(...policy.personKategorier)
          })
        }
      })

      const uniqPersonkategorier: string[] = uniqBy(allePersonKategorier, 'code')
        .map((personkategori) => personkategori.shortName)
        .sort((a, b) => {
          if (a === 'Annet') {
            return 1
          }
          if (b === 'Annet') {
            return 1
          } else {
            return 0
          }
        })

      return {
        personkategorier: uniqPersonkategorier,
      }
    } else {
      return {
        databehandlere: [],
        personkategorier: [],
      }
    }
  }, [etterlevelseDokumentasjon])

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

  return (
    <PageLayout
      pageTitle='Behandlingens art og omfang'
      currentPage='Behandlingens art og omfang'
      breadcrumbPaths={breadcrumbPaths}
    >
      {isEtterlevelseDokumentasjonLoading && artOgOmfangLoading && (
        <div className='flex w-full justify-center'>
          <Loader size='large' />
        </div>
      )}

      {!isEtterlevelseDokumentasjonLoading &&
        !artOgOmfangLoading &&
        etterlevelseDokumentasjon &&
        artOgOmfang && (
          <ContentLayout>
            <MainPanelLayout hasSidePanel>
              <ArtOgOmfangReadOnlyContent
                artOgOmfang={artOgOmfang}
                personkategorier={readOnlyData.personkategorier}
              />
            </MainPanelLayout>

            {/* right side */}

            <SidePanelLayout>
              <BehandlingensLivsLopSidePanel
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </SidePanelLayout>
          </ContentLayout>
        )}
    </PageLayout>
  )
}

export default BehandlingensArtOgOmfangReadOnlyPage
