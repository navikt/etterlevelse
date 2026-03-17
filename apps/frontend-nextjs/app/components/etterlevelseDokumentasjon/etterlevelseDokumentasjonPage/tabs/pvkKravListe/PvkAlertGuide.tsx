import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Alert, BodyLong, Heading, List } from '@navikt/ds-react'
import Link from 'next/link'
import { Fragment, FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
}

export const PvkAlertGuide: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
}) => {
  return (
    <Fragment>
      {pvkDokument && pvkDokument.status === EPvkDokumentStatus.UNDERARBEID && (
        <Alert variant='info' fullWidth>
          <Heading spacing size='small' level='3'>
            Personvernkonsekvensvurdering: slik gjør dere nå
          </Heading>

          <BodyLong>
            Beskriv risikoscenarioer og tiltak som gjelder for deres kontekst. Disse kan beskrives:
          </BodyLong>
          <List as='ul'>
            <List.Item>ved aktuelle etterlevelseskrav</List.Item>
            <List.Item>
              <Link
                target='_blank'
                rel='noopener noreferrer'
                aria-label='redigere etterlevelsesdokumentasjon'
                href={pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 6)}
              >
                under “øvrige risikoscenarioer” (åpnes i ny fane)
              </Link>
            </List.Item>
          </List>
          <BodyLong>
            Dere kan gjenbruke deres egne risikoscenarioer eller tiltak der det er aktuelt ved å
            velge “Legg til et eksisterende risikoscenario” eller “Legg til et eksisterende tiltak”.
          </BodyLong>
        </Alert>
      )}

      {pvkDokument &&
        [
          EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
          EPvkDokumentStatus.SENDT_TIL_PVO,
          EPvkDokumentStatus.PVO_UNDERARBEID,
        ].includes(pvkDokument.status) && (
          <Alert className='max-w-[75ch]' variant='warning'>
            <Heading spacing size='small' level='3'>
              PVK ligger til vurdering hos Personvernombudet.
            </Heading>
            Dokumentasjon tilknyttet deres PVK er låst og kan ikke redigeres.
            <br />
            Dette gjelder for:
            <List as='ul'>
              <List.Item>
                Dokumentasjon av risikoscenarioer og tiltak i forbindelse med PVK
              </List.Item>
              <List.Item>Etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav.</List.Item>
              Etterlevelseskrav som ikke er tilknyttet PVK kan forsatt redigeres som normalt.
              <br />
              <br />
              Hvis dere oppdager betydelig behov for å endre på dokumentasjonen i forbindelse med
              vurdering av PVK, ta kontakt med PVO på personvernombudet@nav.no.
            </List>
          </Alert>
        )}

      {pvkDokument &&
        [
          EPvkDokumentStatus.VURDERT_AV_PVO,
          EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
        ].includes(pvkDokument.status) && (
          <Alert className='max-w-[75ch]' variant='info'>
            <Heading spacing size='small' level='3'>
              Nå som Personvernombudet har sendt sin tilbakemelding, kan dere redigere
              PVK-dokumentasjonen på nytt.
            </Heading>
            Dette gjelder for:
            <List as='ul'>
              <List.Item>Risikoscenario- og tiltaksbeskrivelser</List.Item>
              <List.Item>Etterlevelsesdokumentasjon tilknyttet PVK-relaterte krav.</List.Item>
            </List>
            <br />
            <br />
            Resten av deres etterlevelsesdokumentasjon er alltid redigerbar.
          </Alert>
        )}

      {pvkDokument && pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
        <Alert className='max-w-[75ch]' variant='warning'>
          <Heading spacing size='small' level='3'>
            PVK ligger til godkjenning hos risikoeier.
          </Heading>
          Dokumentasjon tilknyttet deres PVK er låst og kan ikke redigeres.
          <br />
          Dette gjelder for:
          <List as='ul'>
            <List.Item>Dokumentasjon av risikoscenarioer og tiltak i forbindelse med PVK</List.Item>
            <List.Item>Etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav.</List.Item>
          </List>
          <br />
          <BodyLong>
            Etterlevelseskrav som ikke er tilknyttet PVK kan forsatt redigeres som normalt.
          </BodyLong>
        </Alert>
      )}
    </Fragment>
  )
}
export default PvkAlertGuide
