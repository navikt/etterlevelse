import { Alert, BodyLong, Heading, Label, Link, List } from '@navikt/ds-react'
import { useParams } from 'react-router-dom'
import { behandlingName } from '../api/BehandlingApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import { IBehandling, IBreadCrumbPath } from '../constants'
import { env } from '../util/env'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkBehovPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
    }>
  > = useParams<{ id?: string }>()
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  return (
    <PageLayout
      pageTitle="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      currentPage="Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium" className="mb-5">
        Bør vi gjøre en Personvernkonsekvensvurdering (PVK) ?
      </Heading>

      <div className="flex w-full">
        <div className="pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <BodyLong>
            En PVK skal gjennomføres når vi ønsker å starte eller endre en behandling av
            personopplysninger som sannsynligvis vil medføre høy risiko for den registrertes
            rettigheter og friheter.
          </BodyLong>
          <Alert variant="info">
            Informasjon om behandlingene deres er basert på det vi har hentet fra
            Behandlingskatalogen. Dere er selv ansvarlige for at informasjonen her er korrekt og
            komplett, spesielt opplysningstyper og informasjon om profilering og automatisering.
          </Alert>
          <Label>
            I Behandlingskatalogen står det at behandlingene deres inneholder følgende egenskaper:
          </Label>
        </div>
        {etterlevelseDokumentasjon && (
          <div className="pl-4 border-l border-border-divider w-full max-w-md">
            <Heading level="2" size="small" className="mb-5">
              Hentet fra deres etterlevelsesdokumentasjon
            </Heading>
            <Label>
              Dere har koblet følgende behandlinger på denne etterlevelsesdokumentasjonen:
            </Label>
            {etterlevelseDokumentasjon.behandlinger && (
              <List>
                {etterlevelseDokumentasjon.behandlinger.map((behandling: IBehandling) => (
                  <List.Item key={behandling.nummer}>
                    <ExternalLink
                      className="text-medium"
                      href={`${env.pollyBaseUrl}process/${behandling.id}`}
                    >
                      {behandlingName(behandling)} (åpnes i nytt vindu)
                    </ExternalLink>
                  </List.Item>
                ))}
              </List>
            )}
            <Link
              href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="redigere etterlevelsesdokumentasjon"
            >
              Dere kan redigere hvilke behandinger som gjelder under Dokumentegenskaper (åpnes i
              nytt vindu).
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default PvkBehovPage
