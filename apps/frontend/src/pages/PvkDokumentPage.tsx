import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { usePvkDokument } from '../api/PvkDokumentApi'
import { PageLayout } from '../components/scaffold/Page'
import { IBreadCrumbPath } from '../constants'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkDokumentPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      pvkdokumentId?: string
    }>
  > = useParams<{ id?: string }>()
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]
  const [currentPage] = useState<string>('Oversikt')
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [pvkDokument] = usePvkDokument(params.pvkdokumentId)

  return (
    <PageLayout
      pageTitle="Pvk Dokument"
      currentPage={currentPage}
      breadcrumbPaths={breadcrumbPaths}
      fullWidth
    >
      {etterlevelseDokumentasjon && pvkDokument && <div>WIP</div>}
    </PageLayout>
  )
}

export default PvkDokumentPage
