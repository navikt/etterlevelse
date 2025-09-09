import { BodyLong, List, ReadMore } from '@navikt/ds-react'
import { PageLayout } from '../components/scaffold/Page'
import HvordanDokumentereRiskoscenario from '../resources/HvordanDokumentereRiskoscenario.png'
import VisHvorJegFinnerDigitalPVK from '../resources/VisHvorJegFinnerDigitalPVK.png'

const OmPvk = () => {
  return (
    <PageLayout
      pageTitle='Ny Digital PVK (løsning for Personvernkonsekvensvurdering)'
      currentPage='Om digital PVK'
    >
      <div>
        <h1 className='h1'>Ny Digital PVK (løsning for Personvernkonsekvensvurdering)</h1>
        <BodyLong className='mt-6'>
          Fra september 2025 bruker dere den nye, digitale PVK-løsningen i stedet for den gamle
          Word-malen.{' '}
        </BodyLong>
        <ReadMore header='Hva betyr PVK?' className='mt-3'>
          <BodyLong>
            PVK står for «Personvernkonsekvensvurdering». PVK gjelder noen ganger der vi ser at
            måten vi behandler folks persondata på i Nav, kan risikere at vi ikke ivaretar deres
            rettigheter og friheter. Dette kan handle om alt fra hva vi ber om i en digital søknad,
            til bruk av videopptak på Nav-kontor, til lagring av data i skyen, til at
            uhensiktsmessig mange i Nav har tilgang til personens informasjon. Ny Digital PVK skal
            bidra til at det blir lettere å vurdere det vi gjør, og hvordan vi skal redusere
            risikonivået.
          </BodyLong>
        </ReadMore>
        <h2 className='mt-3 size="medium"'>
          <b>Dette kan dere gjøre i Digital PVK</b>
        </h2>
        <List className='mt-3'>
          <List.Item>Vurdere om dere har behov for å gjennomføre PVK.</List.Item>
          <List.Item>Hvor opplysningene flyter underveis i behandling.</List.Item>
          <List.Item>
            Fylle ut PVK-skjema steg for steg – men det er også lov å gå fram og tilbake mellom steg
            underveis.
          </List.Item>
          <List.Item>
            Beskrive risikoscenarioer og tiltak side om side med deres etterlevelsesdokumentasjon.
          </List.Item>
          <List.Item>
            Lese over svarene deres. Løsningen varsler hvis det savnes viktig informasjon slik at
            deres innsending blir så komplett som mulig.
          </List.Item>
          <List.Item>
            Sende inn PVK til Personvernombudet (PVO). Se statusendring etter hvert som PVO har
            påbegynt vurderingen sin, og når PVO har gitt tilbakemeldinger.
          </List.Item>
          <List.Item>
            Lese tilbakemeldinger fra PVO og ta stilling til dem, og gjøre eventuelt endringer i
            deres dokumentasjon.{' '}
          </List.Item>
          <List.Item>Få PVK-en godkjent av risikoeier.</List.Item>
          <List.Item>
            Finne deres arkiverte PVK i Public 360. Dokumentet arkiveres automatisk når PVO sender
            sine tilbakemeldinger, og på nytt når risikoeier godkjenner.
          </List.Item>
        </List>
        <BodyLong className='mt-3'>
          Digital PVK er ikke en selvstendig løsning, men er innebygd i Støtte til etterlevelse for
          å ivareta sammenhengen med etterlevelsesdokumentasjon. Når dere først har skrivetilgang
          til et bestemt etterlevelsesdokument, finner dere inngangen til PVK-funksjonalitet øverst
          på temasiden.
        </BodyLong>
        <ReadMore header='Vis meg hvor jeg finner Digital PVK' className='mt-3'>
          <img
            className='mr-2.5'
            src={VisHvorJegFinnerDigitalPVK}
            alt='“Skjermbilde fra Støtte til etterlevelse som viser inngangen til Digital PVK. Lenkene står øverst i etterlevelsesdokumentet deres, like etter ‘Redigér dokumentegenskaper’. Her står det to lenker: Tegn behandlingens livsløp, og Vurdér behov for PVK.”'
            aria-hidden
            aria-label=''
          />
        </ReadMore>

        <ReadMore
          header='Vis meg hvordan jeg dokumenterer risikoscenarier side om side med etterlevelseskrav'
          className='mt-3'
        >
          <img
            className='mr-2.5'
            src={HvordanDokumentereRiskoscenario}
            alt='“Skjermbilde fra Støtte til etterlevelse når det er påbegynt PVK. Bildet viser en kravside som har fått en ny fane mellom Mer om kravet og Notat. Ny fane heter “PVK-dokumentasjon”, og vises side om side med etterlevelsesdokumentasjon. Her er brukeren i ferd med å legge til et nytt risikoscenario ved å gi det et navn, en beskrivelse, og vurderinger av scenarioets sannsynlighet og konsekvens.” '
            aria-hidden
            aria-label=''
          />
        </ReadMore>
        <h2 className='mt-3 size="medium"'>
          <b>Beslutningsstøtte når dere vurderer behov for PVK</b>
        </h2>
        <BodyLong className='mt-3'>
          I ny løsning får dere dokumentere hvordan dere har kommet fram til beslutningen om
          gjennomføring av PVK. Dere må ta stilling til hvilke egenskaper som gjelder for
          behandlingen(e) deres. Noen av disse egenskapene hentes automatisk fra
          Behandlingskatalogen. Andre egenskaper som er relevant i vurderingen listes opp, og dere
          må selv ta stilling til hvilke av disse som gjelder. Basert på hvilke egenskaper dere har
          krysset av for, får dere en anbefaling om dere bør gjennomføre PVK eller ikke.
          Anbefalingen kommer med en kort begrunnelse. Dere kan velge å følge anbefalingen eller
          ikke.
          <br />
          <br />
          Dere kan til enhver tid oppdatere eller revurdere beslutningen.
        </BodyLong>
        <ReadMore
          header='Hvilke egenskaper er aktuelle når man vurderer behov for PVK? '
          className='mt-3'
        >
          <BodyLong>
            Følgende behandlingsegenskaper i innebærer høyere risiko, og gjør det mer sannsynlig at
            en PVK burde gjennomføres:{' '}
          </BodyLong>

          <List className='mt-3'>
            <List.Item>profilering og/eller automatisering</List.Item>
            <List.Item>systematisk overvåkning/monitorering i stor skala.</List.Item>
            <List.Item>særlige kategorier av personopplysninger.</List.Item>
            <List.Item>personopplysninger behandles i stor skala.</List.Item>
            <List.Item>matching eller sammenstilling av datasett.</List.Item>
            <List.Item>
              personopplysninger om sårbare registrerte, for eksempel barn eller mer sårbare
              befolkningsgrupper som behøver sosial beskyttelse.
            </List.Item>
            <List.Item>
              bruk av ny teknologi, for eksempel fingeravtrykk, ansiktsgjenkjenning mv.
            </List.Item>
            <List.Item>
              behandlingen tar sikte på å tillate, endre eller nekte noen tilgang til en tjeneste
              eller en avtale.
            </List.Item>
          </List>
        </ReadMore>
        <ReadMore
          header='Når er riktig tidspunkt å vurdere eller revurdere behov for PVK?'
          className='mt-3'
        >
          <BodyLong>Det er aktuelt å vurdere behov for PVK når:</BodyLong>
          <List className='mt-3'>
            <List.Item>
              Vi skal behandle personopplysninger i en ny kontekst, for eksempel bygge en ny digital
              søknad eller ta i bruk en ny teknisk løsning.
            </List.Item>
            <List.Item>
              Vi skal gjøre endringer i en eksisterende behandling av personopplysninger.
            </List.Item>
          </List>

          <BodyLong className='mt-3'>
            Det er viktig at vi vurderer behov for PVK allerede før vi begynner å behandle
            personopplysninger eller endre hvordan vi behandler disse. Dokumentasjon av PVK,
            vurdering av Personvernombudet (PVO) og godkjenning hos risikoeieren kan til sammen ta
            flere uker å gjennomføre. Husk å tillate nok tid.
          </BodyLong>
        </ReadMore>
        <h2 className='mt-3 size="medium"'>
          <b>Dokumentasjon av Behandlingens livsløp</b>
        </h2>
        <ReadMore header='Hva er Behandlingens livsløp?' className='mt-3'>
          <BodyLong>
            «Behandlingens livsløp» beskriver hvor og hvordan personopplysninger flyter når de
            behandles i deres kontekst. Hensikten med å tegne behandlingens livsløp er at dere blant
            annet må tenke på:
          </BodyLong>

          <List className='mt-3'>
            <List.Item>Hvor opplysningene innhentes fra.</List.Item>
            <List.Item>Hvor opplysningene flyter underveis i behandling.</List.Item>
            <List.Item>
              Om og hvor opplysningene sendes videre, enten internt i Nav eller utlevering til
              eksterne organisasjoner.
            </List.Item>
          </List>
        </ReadMore>
        <BodyLong className='mt-3'>
          I den nye løsningen kan dere laste opp én eller flere tegninger av behandlingens livsløp
          og/eller lagre en skriftlig beskrivelse.
          <br />
          <br />
          Selv om dokumentasjon av behandlingens livsløp kun er påkrevd når man gjør en PVK,
          anbefaler vi at alle tegner flyten. Dette vil være til hjelp når dere svarer ut
          etterlevelseskrav innen personvern og arkiv og dokumentasjon, og i selve vurderingen av om
          det er nødvendig å gjennomføre PVK.
        </BodyLong>
        <h2 className='mt-3 size="medium"'>
          <b>Når skal vi begynne å bruke den nye løsningen?</b>
        </h2>
        <h3 className='mt-5 size="small"'>
          <b>Hvis dere har en PVK som allerede er godkjent og arkivert</b>
        </h3>
        <BodyLong className='mt-3'>
          Godkjente, arkiverte PVK-er skal ikke inn i ny løsning, med mindre risikobildet er endret
          og det er behov for en revurdering.
        </BodyLong>
        <h3 className='mt-5 size="small"'>
          <b>Hvis dere skal gjøre endringer i en PVK</b>
        </h3>
        <BodyLong className='mt-3'>
          Oppdatering av deres nåværende PVK bør gjøres i den nye løsningen. Hvis endringer i
          hvordan dere behandler personopplysninger fører til endring i risikobildet, vil PVK-en
          måtte sendes til en ny vurdering hos Personvernombudet (PVO), noe som også gjøres i ny
          løsning.
          <br />
          <br />
          Det er dessverre ikke mulig å importere eksisterende PVK-er fra Word. Da må dere klippe og
          lime tidligere innhold i Word over i den nye løsningen og oppdatere med det som er nytt.
        </BodyLong>
        <h3 className='mt-5 size="small"'>
          <b>Hvis dere skal vurdere eller revurdere behov for PVK</b>
        </h3>
        <BodyLong className='mt-3'>
          I ny løsning får dere hjelp til å vurdere om dere skal gjennomføre en PVK.
          <br />
          Bruk den nye løsningen til å vurdere og dokumentere denne beslutningen, uansett om:
        </BodyLong>
        <List className='mt-3'>
          <List.Item>Dere skal vurdere behov for PVK for første gang</List.Item>
          <List.Item>
            Dere har tidligere vurdert at PVK ikke er nødvendig, men skal vurdere behovet på nytt
          </List.Item>
        </List>
        <h3 className='mt-5 size="small"'>
          <b>Ta kontakt</b>
        </h3>
        <BodyLong className='mt-3'>
          Hvis dere har juridiske spørsmål knyttet til personvern, ta kontakt med Juridisk avdeling:
          nav.juridisk.avdeling@nav.no.
          <br />
          <br />
          Hvis dere finner feil i løsningen eller har forslag til forbedringer, ta kontakt med Team
          Datajegerne:
        </BodyLong>
        <List>
          <List.Item>Bli med på #etterlevelse på Slack</List.Item>
          <List.Item>Send mail til: teamdatajegerne@nav.no</List.Item>
        </List>
      </div>
    </PageLayout>
  )
}

export default OmPvk
