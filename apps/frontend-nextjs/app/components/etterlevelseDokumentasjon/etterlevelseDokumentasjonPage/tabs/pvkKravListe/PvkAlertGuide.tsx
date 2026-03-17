import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { ExclamationmarkTriangleIcon, InformationSquareIcon } from '@navikt/aksel-icons'
import { BodyLong, InfoCard, Link, List } from '@navikt/ds-react'
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
        <InfoCard data-color='info' className='max-w-[75ch]'>
          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
            <InfoCard.Title>Personvernkonsekvensvurdering: slik gjør dere nå</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            <BodyLong className='mb-5'>
              Beskriv risikoscenarioer og tiltak som gjelder for deres kontekst. Disse kan
              dokumenteres:
            </BodyLong>
            <List as='ul' className='mb-5'>
              <List.Item>på kravsider hvor risikoscenarioene gjelder</List.Item>
              <List.Item>
                <span>
                  under&nbsp;
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='redigere etterlevelsesdokumentasjon'
                    href={pvkDokumentasjonStepUrl(etterlevelseDokumentasjon.id, pvkDokument.id, 6)}
                  >
                    Øvrige risikoscenarioer (åpner i en ny fane)
                  </Link>
                  &nbsp;dersom risikoscenarioet ikke er kravspesifikt
                </span>
              </List.Item>
            </List>
            <BodyLong>
              Dere kan gjenbruke deres egne risikoscenarioer og tiltak der det er aktuelt. Dette
              gjør dere ved å velge “Legg til et eksisterende risikoscenario” eller “Legg til et
              eksisterende tiltak”.
            </BodyLong>
          </InfoCard.Content>
        </InfoCard>
      )}

      {pvkDokument &&
        [
          EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
          EPvkDokumentStatus.SENDT_TIL_PVO,
          EPvkDokumentStatus.PVO_UNDERARBEID,
        ].includes(pvkDokument.status) && (
          <InfoCard data-color='warning' className='max-w-[75ch]'>
            <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
              <InfoCard.Title>PVK ligger til vurdering hos Personvernombudet</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <BodyLong className='mb-5'>
                Dokumentasjon tilknyttet PVK-en er låst og kan ikke redigeres mens den ligger til
                vurdering hos Personvernombudet. Innholdet som er låst er:
              </BodyLong>
              <List as='ul' className='mb-5'>
                <List.Item>etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav</List.Item>
                <List.Item>risikoscenarioer og tiltak, både kravspesifikke og øvrige</List.Item>
                <List.Item>
                  PVK-dokumentasjon ellers: Behandlings livsløp, Art og omfang, Involvering av
                  eksterne, kommentar til personvernombudet
                </List.Item>
              </List>
              <BodyLong>
                Etterlevelsesdokumentasjon som ikke er tilknyttet PVK kan fortsatt redigeres som
                normalt.
              </BodyLong>
            </InfoCard.Content>
          </InfoCard>
        )}

      {pvkDokument &&
        [
          EPvkDokumentStatus.VURDERT_AV_PVO,
          EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID,
        ].includes(pvkDokument.status) && (
          <InfoCard data-color='info' className='max-w-[75ch]'>
            <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
              <InfoCard.Title>
                Personvernombudet har sendt sin tilbakemelding, og PVK er nå låst opp
              </InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <BodyLong className='mb-5'>
                Følgende dokumentasjon er låst opp og kan redigeres:
              </BodyLong>
              <List as='ul' className='mb-5'>
                <List.Item>etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav</List.Item>
                <List.Item>risikoscenarioer og tiltak, både kravspesifikke og øvrige</List.Item>
                <List.Item>
                  PVK-dokumentasjon ellers: Behandlings livsløp, Art og omfang, Involvering av
                  eksterne, kommentar til personvernombudet eller risikoeier
                </List.Item>
              </List>
              <BodyLong>
                Nå skal dere ta stilling til Personvernombudets tilbakemeldinger og gjøre eventuelle
                endringer. Så sender dere PVK-en videre til godkjenning hos risikoeieren, eller
                tilbake til Personvernombudet hvis de har bedt om det.
              </BodyLong>
            </InfoCard.Content>
          </InfoCard>
        )}

      {pvkDokument && pvkDokument.status === EPvkDokumentStatus.TRENGER_GODKJENNING && (
        <InfoCard data-color='warning' className='max-w-[75ch]'>
          <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
            <InfoCard.Title>PVK ligger til godkjenning hos risikoeier</InfoCard.Title>
          </InfoCard.Header>
          <InfoCard.Content>
            <BodyLong className='mb-5'>
              Dokumentasjon tilknyttet PVK-en er låst og kan ikke redigeres mens den ligger til
              godkjenning hos risikoeier. Innholdet som er låst er:
            </BodyLong>
            <List as='ul' className='mb-5'>
              <List.Item>etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav</List.Item>
              <List.Item>risikoscenarioer og tiltak, både kravspesifikke og øvrige</List.Item>
              <List.Item>
                PVK-dokumentasjon ellers: Behandlings livsløp, Art og omfang, Involvering av
                eksterne, kommentar til personvernombudet
              </List.Item>
            </List>
            <BodyLong>
              Etterlevelsesdokumentasjon som ikke er tilknyttet PVK kan fortsatt redigeres som
              normalt.
            </BodyLong>
          </InfoCard.Content>
        </InfoCard>
      )}
    </Fragment>
  )
}
export default PvkAlertGuide
