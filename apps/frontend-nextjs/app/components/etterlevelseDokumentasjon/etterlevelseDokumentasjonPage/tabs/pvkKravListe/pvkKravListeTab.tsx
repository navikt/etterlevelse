import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Alert, BodyLong, Heading, Link, List } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import PvkRelatertKravListe from './pvkRelatertKravListe'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  allTiltak: ITiltak[]
  isRisikoscenarioLoading: boolean
  previousVurdering?: IVurdering
}

export const PvkKravListeTab: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  temaListe,
  relevanteStats,
  allKravPriority,
  loading,
  risikoscenarioList,
  allTiltak,
  isRisikoscenarioLoading,
  previousVurdering,
}) => {
  return (
    <div className='pt-4 flex flex-col gap-4'>
      {pvkDokument &&
        pvkDokument.status !== EPvkDokumentStatus.SENDT_TIL_PVO &&
        pvkDokument.status !== EPvkDokumentStatus.VURDERT_AV_PVO &&
        pvkDokument.status !== EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID &&
        pvkDokument.status !== EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING &&
        pvkDokument.status !== EPvkDokumentStatus.PVO_UNDERARBEID && (
          <Alert variant='info' fullWidth>
            <Heading spacing size='small' level='3'>
              Personvernkonsekvensvurdering: slik gjør dere nå
            </Heading>

            <BodyLong>
              Beskriv risikoscenarioer og tiltak som gjelder for deres kontekst. Disse kan
              beskrives:
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
              velge “Legg til et eksisterende risikoscenario” eller “Legg til et eksisterende
              tiltak”.
            </BodyLong>
          </Alert>
        )}

      {pvkDokument &&
        (pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO ||
          pvkDokument.status === EPvkDokumentStatus.PVO_UNDERARBEID) && (
          <Alert className='max-w-[75ch]' variant='warning'>
            <Heading spacing size='small' level='3'>
              PVK ligger til vurdering hos Personvernombudet om dagen.
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

      {pvkDokument && pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && (
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
          Resten av deres etterlevelsesdokumentasjon er alltid redigerbar.
        </Alert>
      )}

      <PvkRelatertKravListe
        temaListe={temaListe}
        relevanteStats={relevanteStats}
        allKravPriority={allKravPriority}
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        loading={loading}
        risikoscenarioList={risikoscenarioList}
        isRisikoscenarioLoading={isRisikoscenarioLoading}
        previousVurdering={previousVurdering}
        allTiltak={allTiltak}
      />
    </div>
  )
}

export default PvkKravListeTab
