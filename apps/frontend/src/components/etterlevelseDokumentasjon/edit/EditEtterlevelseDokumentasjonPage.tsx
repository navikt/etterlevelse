import { Loader } from '@navikt/ds-react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../../../api/EtterlevelseDokumentasjonApi'
import { PageLayout } from '../../scaffold/Page'
import EtterlevelseDokumentasjonForm from './EtterlevelseDokumentasjonForm'

export const EditEtterlevelseDokumentasjonPage = () => {
  const params = useParams<{ id?: string }>()

  const [etterlevelseDokumentasjon, , isLoading] = useEtterlevelseDokumentasjon(params.id)

  return (
    <>
      {isLoading && (
        <div className="flex w-full justify-center items-center mt-5">
          <Loader size="3xlarge" />
        </div>
      )}
      {!isLoading && etterlevelseDokumentasjon && (
        <PageLayout
          pageTitle="Rediger etterlevelsesdokumentet"
          currentPage="Rediger etterlevelsesdokumentet"
          breadcrumbPaths={[
            { href: '/dokumentasjoner', pathName: 'Dokumentere etterlevelse' },
            {
              href: '/dokumentasjon/' + params.id,
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          <EtterlevelseDokumentasjonForm
            title="Rediger etterlevelsesdokumentet"
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            isEditButton
          />
        </PageLayout>
      )}
    </>
  )
}
export default EditEtterlevelseDokumentasjonPage
