'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { useParams } from 'next/navigation'
import { LoadingSkeleton } from '../common/loadingSkeleton/loadingSkeletonComponent'
import { PageLayout } from '../others/scaffold/scaffold'

export const EtterlevelseDokumentasjonPage = () => {
  const params: Readonly<{
    id?: string
  }> = useParams<{ id?: string }>()

  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)

  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  return (
    <>
      {!etterlevelseDokumentasjon && <LoadingSkeleton header='Dokumentasjon' />}
      {etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle={
            'E' +
            etterlevelseDokumentasjon.etterlevelseNummer.toString() +
            ' ' +
            etterlevelseDokumentasjon.title
          }
          currentPage={
            'E' +
            etterlevelseDokumentasjon.etterlevelseNummer.toString() +
            ' ' +
            etterlevelseDokumentasjon.title
          }
          breadcrumbPaths={breadcrumbPaths}
        >
          <div>EtterlevelseDokumentasjon Page</div>
        </PageLayout>
      )}
    </>
  )
}
