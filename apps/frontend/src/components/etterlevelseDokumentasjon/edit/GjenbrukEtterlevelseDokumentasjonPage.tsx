import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../../../api/EtterlevelseDokumentasjonApi'
import { PageLayout } from '../../scaffold/Page'
import GjenbrukEtterlevelseDokumentasjonForm from './GjenbrukEtterlevelseDokumentasjonForm'

export const GjenbrukEtterlevelseDokumentasjonPage = () => {
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
          pageTitle="Gjenbruk etterlevelsesdokumentet"
          currentPage="Gjenbruk etterlevelsesdokumentet"
          breadcrumbPaths={[
            { href: '/dokumentasjoner', pathName: 'Dokumentere etterlevelse' },
            {
              href: '/dokumentasjon/' + params.id,
              pathName: `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`,
            },
          ]}
        >
          <Heading size="medium" level="1" spacing>
            Gjenbruk E{etterlevelseDokumentasjon.etterlevelseNummer}{' '}
            {etterlevelseDokumentasjon.title}
          </Heading>

          {etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
            <div>
              <Heading size="small" level="2" spacing className="mt-5">
                Forutsetninger for gjenbruk av dette dokumentet
              </Heading>

              <BodyLong className="mb-8">{etterlevelseDokumentasjon.gjenbrukBeskrivelse}</BodyLong>

              <GjenbrukEtterlevelseDokumentasjonForm
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
            </div>
          )}

          {!etterlevelseDokumentasjon.tilgjengeligForGjenbruk && (
            <div className="flex w-full justify-center">
              <Alert variant="warning">
                Denne etterlevelsesdokumentasjon er ikke tilgjengelig for gjenbruk
              </Alert>
            </div>
          )}
        </PageLayout>
      )}
    </>
  )
}

export default GjenbrukEtterlevelseDokumentasjonPage
