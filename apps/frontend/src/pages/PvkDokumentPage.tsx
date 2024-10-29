import { Loader } from '@navikt/ds-react'
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
  const [currentPage] = useState<string>('Oversikt')
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [pvkDokument] = usePvkDokument(params.pvkdokumentId)
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
      href: '/dokumentasjoner/' + params.id,
    },

    {
      pathName: 'Personvernkonsekvensvurdering',
      href: '/dokumentasjoner/' + params.id + '/pvkbehov/' + params.pvkdokumentId,
    },
  ]

  return (
    <>
      {!etterlevelseDokumentasjon && <Loader size="large" />}
      {etterlevelseDokumentasjon && pvkDokument && (
        <PageLayout
          pageTitle="Pvk Dokument"
          currentPage={currentPage}
          breadcrumbPaths={breadcrumbPaths}
          fullWidth
        >
          <div>WIP</div>
        </PageLayout>
      )}
    </>
  )
}

export default PvkDokumentPage
