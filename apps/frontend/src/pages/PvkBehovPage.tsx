import { Alert, BodyLong, BodyShort, Heading, Label, Link, List } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { behandlingName } from '../api/BehandlingApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import { IBehandling, IBreadCrumbPath, IExternalCode, IPolicy } from '../constants'
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
  const [profilering, setProfilering] = useState<boolean>(false)
  const [automatiskBehandling, setAutomatiskBehandling] = useState<boolean>(false)
  const [saerligKategorier, setSaerligKategorier] = useState<boolean>(false)

  useEffect(() => {
    if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.behandlinger) {
      const alleOpplysningstyper: IPolicy[] = []
      etterlevelseDokumentasjon.behandlinger.forEach((behandling) => {
        alleOpplysningstyper.push(...behandling.policies)

        if (behandling.profilering) {
          setProfilering(true)
        }
        if (behandling.automatiskBehandling) {
          setAutomatiskBehandling(true)
        }
      })

      const saerligKategorierOppsumert: IExternalCode[] = uniqBy(
        alleOpplysningstyper.flatMap((opplysningstyper) => opplysningstyper.sensitivity),
        'code'
      ).filter((kategori) => kategori.code === 'SAERLIGE')

      if (saerligKategorierOppsumert.length > 0) {
        setSaerligKategorier(true)
      }
    }
  }, [etterlevelseDokumentasjon])

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
          <Alert inline variant="info">
            Informasjon om behandlingene deres er basert på det vi har hentet fra
            Behandlingskatalogen. Dere er selv ansvarlige for at informasjonen her er korrekt og
            komplett, spesielt opplysningstyper og informasjon om profilering og automatisering.
          </Alert>

          <div className="mt-3" id="behandlings-egenskaper">
            <Label>
              I Behandlingskatalogen står det at behandlingene deres inneholder følgende egenskaper:
            </Label>
            <List>
              {!profilering && !automatiskBehandling && !saerligKategorier && (
                <List.Item>Ingen</List.Item>
              )}
              {profilering && <List.Item>Profilering</List.Item>}
              {automatiskBehandling && <List.Item>automatisert behandling</List.Item>}
              {saerligKategorier && <List.Item>særlige kategorier av personopplysninger</List.Item>}
            </List>
            {(profilering || automatiskBehandling || saerligKategorier) && (
              <BodyShort>
                Disse egenskapene gir høy sannsynlighet for at dere må gjennomføre en PVK.
              </BodyShort>
            )}
          </div>

          <div className="mt-3" id="ytterlige-egenskaper">
            <Label>
              Les igjennom og velg ytterligere egenskaper som gjelder for behandlingene deres.
            </Label>
          </div>
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

            <BodyShort className="inline-block">
              Dere kan{' '}
              <Link
                href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="redigere etterlevelsesdokumentasjon"
              >
                redigere hvilke behandinger som gjelder under Dokumentegenskaper (åpnes i nytt
                vindu).
              </Link>
            </BodyShort>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default PvkBehovPage
