import { Alert, BodyShort, Heading, Label, Link, List, ReadMore } from '@navikt/ds-react'
import { useParams } from 'react-router-dom'
import { behandlingName } from '../api/BehandlingApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { ExternalLink } from '../components/common/RouteLink'
import { PageLayout } from '../components/scaffold/Page'
import { IBehandling, IBreadCrumbPath } from '../constants'
import behandlingensLivslop from '../resources/behandlingensLivslop.svg'
import { env } from '../util/env'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const BehandlingensLivslopPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
    }>
  > = useParams<{ id?: string }>()
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const breadcrumbPaths: IBreadCrumbPath[] = [dokumentasjonerBreadCrumbPath]

  return (
    <PageLayout
      pageTitle="Behandlingens livsløp"
      currentPage="Behandlingens livsløp"
      breadcrumbPaths={breadcrumbPaths}
    >
      <Heading level="1" size="medium" className="mb-5">
        Behandlingens livsløp
      </Heading>

      <div className="flex w-full">
        <div className="pr-4 flex flex-1 flex-col gap-4 col-span-8">
          <BodyShort>
            “Behandlingens livsløp” beskriver hvor og hvordan personopplysninger flyter når de
            behandles i deres kontekst. Hensikten med å tegne behandlingens livsløp er at dere blant
            annet må tenke på:
            <List>
              <List.Item>Hvor opplysningene innhentes fra.</List.Item>
              <List.Item>Hvor opplysningene flyter underveis i behandling.</List.Item>
              <List.Item>
                Om og hvor opplysningene sendes videre i NAV eller til eksterne.
              </List.Item>
            </List>
            <Alert inline variant="info" className="mt-3">
              Det er kun påkrevd å tegne behandlingens livsløp hvis dere gjennomfører en PVK, men vi
              anbefaler at alle tegner flyten. Dette vil være til hjelp når dere svarer ut
              etterlevelseskrav innen Personvern og Arkiv og dokumentasjon.
            </Alert>
          </BodyShort>

          <Heading level="2" size="small" className="mt-3">
            Slik lager dere en god tegning av behandlingens livsløp
          </Heading>

          <BodyShort className="mt-3">
            Illustrasjonen under viser hvordan dere kunne tegne behandlingens livsløp. Detaljnivået
            vil variere, men intensjonen er at dere viser [PVO må gjerne supplere her]
          </BodyShort>

          <img
            className="mr-2.5"
            src={behandlingensLivslop}
            alt="Behandligens livsløp tegning"
            aria-hidden
            aria-label=""
          />

          <ReadMore header="Slik lager du en god tegning av behandlingens livsløp" className="mt-3">
            Du kan bruke verktøy som PowerPoint, Mural, eller Figma til å lage tegningen din som
            flytdiagram. Vi anbefaler ikke at du bruker Word.
            <br />
            <br />
            Noen tips til hvordan lage gode tegninger:
            <List>
              <List.Item>Sørg for at tegningen dekker X, Y, Z</List.Item>
              <List.Item>
                Husk god kontrast mellom tekst og bakgrunn. Les mer om kontrast (åpnes i en ny
                fane).
              </List.Item>
              <List.Item>Du må ikke forklare alt i selve tegninga.</List.Item>
              <List.Item>
                Pass på at tegningens tekst blir lesbar også etter at du lagret fila og før den
                laster den opp.
              </List.Item>
            </List>
          </ReadMore>

          <BodyShort className="mt-3">
            Dere kan velge å lage og laste opp flere tegninger hvis det gir bedre oversikt.
          </BodyShort>
        </div>

        {/* right side */}
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
              Dere kan redigere hvilke behandinger som gjelder i{' '}
              <Link
                href={'/dokumentasjon/edit/' + etterlevelseDokumentasjon.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="redigere etterlevelsesdokumentasjon"
              >
                Dokumentegenskaper (åpnes i nytt vindu).
              </Link>
            </BodyShort>

            <Heading level="2" size="small" className="mt-3">
              Deres beskrivelse av etterlevelsen
            </Heading>

            {etterlevelseDokumentasjon.beskrivelse && (
              <div className="mt-3">{etterlevelseDokumentasjon.beskrivelse}</div>
            )}
            {!etterlevelseDokumentasjon.beskrivelse && (
              <div className="mt-3">Det er ikke skrevet en beskrivelse på etterlevelsen</div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default BehandlingensLivslopPage
