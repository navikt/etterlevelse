'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { EKravTab } from '@/constants/krav/kravConstants'
import { Accordion, BodyLong, List, ReadMore } from '@navikt/ds-react'
import Image from 'next/image'
import JobbeITemaoversikten from './images/JobbeITemaoversikten.png'

const OmStotteTilEtterlevelseAccordion = () => {
  return (
    <Accordion className='my-6'>
      <Accordion.Item>
        <Accordion.Header>Opprette eller oppdatere et etterlevelsesdokument</Accordion.Header>
        <Accordion.Content>
          <BodyLong spacing>
            Dersom dere ikke allerede har et etterlevelsesdokument dere skal oppdatere, må dere
            opprette et nytt dokument. Dere bestemmer selv på hvilket nivå og hvor mange
            etterlevelsesdokumenter dere vil opprette. Når dere oppretter et helt nytt dokument må
            dere fylle ut noen dokumentegenskaper. Se mer om dette under Redigere dokumentegenskaper
            og filtrere krav.
          </BodyLong>
          <ReadMore header='Vis meg hvor jeg oppretter et etterlevelsesdokument' className='mb-6'>
            <div className='my-6'>
              <video
                controls
                src='videos/VisMegHvordanJegOppretterEtterlevelsesdokument.mov'
              ></video>
            </div>
          </ReadMore>
          <BodyLong spacing>
            Oppdatering av et eksisterende etterlevelsesdokument kan dere gjøre under Dokumentere
            etterlevelse. Her finner dere etterlevelsesdokumenter som tilhører eventuelle team dere
            er medlemmer i. Dere finner også deres sist redigerte og kan søke på alle
            etterlevelsesdokumentasjoner og behandlinger.
          </BodyLong>
          <ReadMore
            header='Vis meg hvor jeg finner og oppdaterer mine etterlevelsesdokumenter'
            className='mb-6'
          >
            <div className='my-6'>
              <video
                controls
                src='videos/VisMegHvorJegFinnerOgOppdatererEtterlevelsesdokument.mov'
              ></video>
            </div>
          </ReadMore>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>Redigere dokumentegenskaper og filtrere krav</Accordion.Header>
        <Accordion.Content>
          <BodyLong spacing>
            Når dere skal opprette eller oppdatere et etterlevelsesdokument, må dere fylle
            ut/oppdatere noen egenskaper om dokumentet.
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item title='Navn og beskrivelse'>
              Her gir dere etterlevelsesdokumentet et passende navn og en nærmere beskrivelse om hva
              konteksten er.
            </List.Item>
            <List.Item title='Egenskaper'>
              Her velger dere hvilke egenskaper som passer for deres etterlevelse. Basert på hvilke
              valg dere gjør, vil listen over hvilke krav dere må dokumentere på, tilpasses. Det er
              mulig å endre disse valgene på et senere tidspunkt, men merk at krav dere allerede har
              dokumentert på, ikke vil forsvinne fra dokumentasjonen selv om dere fjerner tidligere
              valgte egenskaper.
            </List.Item>
            <List.Item title='Behandlinger'>
              Her legger dere inn hvilke(n) behandling(er) i Behandlingskatalogen som skal knyttes
              til etterlevelsesdokumentet. Dersom dere behandler personopplysninger er det et krav
              om at dere legger inn minst en behandling.
            </List.Item>
            <List.Item title='Annen relevant dokumentasjon'>
              Her legger dere inn lenke(r) til annen dokumentasjon som er relevant for
              etterlevelsesdokumentasjonen, for eksempel ROS.
            </List.Item>
            <List.Item title='Team og/eller person'>
              Her legger dere inn hvilke(t) team og/eller personer som skal ha skrivetilgang til
              etterlevelsesdokumentet. Dersom dere vil ha skrivetilgang til et
              etterlevelsesdokument, må dere ta kontakt med en som allerede er lagt til her.
              Eventuelt kan dere ta kontakt med Team datajegerne.
            </List.Item>
            <List.Item title='Varslingsadresse'>
              Her legger dere inn varslingsadresse slik at dere får varsler når det skjer viktige
              endringer i løsningen som dere må følge opp. Et eksempel er når kraveier oppretter nye
              etterlevelseskrav.
            </List.Item>
            <List.Item title='Avdeling og seksjon'>
              Her legger dere inn hvilken avdeling og seksjon som er ansvarlig for etterlevelsen.
              Dette vil bidra til å aggregere oversikter for ledere slik at de kan brukes i
              internkontroll.
            </List.Item>
            <List.Item title='Risikoeier'>
              Her legger dere inn hvem som er risikoeier for etterlevelsen. Vedkommende vil få
              skrivetilgang og kunne godkjenne etterlevelsesdokumentet og eventuelt tilhørende
              PVK-dokument.
            </List.Item>
            <List.Item title='Saksnummer i Public 360'>
              Dette feltet blir automatisk oppdatert med saksnummer i Public 360 så snart første
              arkivering av etterlevelsesdokument og/eller PVK-dokument er gjort.
            </List.Item>
          </List>
          <ReadMore
            header='Vis meg hvor jeg redigerer dokumentegenskaper etter at jeg har opprettet et nytt etterlevelsesdokument'
            className='mb-6'
          >
            <div className='my-6'>
              <video controls src='videos/VisMegHvordanJegRedigererDokumentegenskaper.mov'></video>
            </div>
          </ReadMore>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>Jobbe i temaoversikten</Accordion.Header>
        <Accordion.Content>
          <Image
            className='mr-2.5 mt-6 mb-12'
            src={JobbeITemaoversikten}
            alt='Skjermbilde som viser temaoversikten'
          />
          <BodyLong spacing>
            Basert på hvilke egenskaper dere valgte som relevante for deres dokumentasjon, får dere
            en liste med etterlevelseskrav. Kravene presenteres i en arbeidsliste fordelt på tema.
            Innad i et tema har kraveier lagt kravene i en anbefalt rekkefølge, men dere bestemmer
            selv i hvilken rekkefølge dere dokumenterer kravene i. Etter hvert som dere arbeider
            dere gjennom kravene, vil status oppdateres for kravene i temaoversikten.
          </BodyLong>
          <BodyLong spacing>
            På hovedsiden for etterlevelsesdokumentet får dere ulike valg (i meny) for hva dere kan
            gjøre, eksempelvis redigere dokumentegenskaper, vurdere behov for PVK mv.
          </BodyLong>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>Besvare etterlevelseskrav</Accordion.Header>
        <Accordion.Content>
          {/*          <div className='my-6'>
            <video controls src='videos/video-mangler'></video>
          </div>*/}
          <BodyLong spacing>
            Hvert krav inneholder et sett med suksesskriterier som viser hva dere konkret må gjøre
            for å etterleve kravet. Hvert kriterium inneholder også en nærmere beskrivelse som
            hjelper dere med å forstå kriteriet. Dere skal ta stilling til, og bekrefte om,
            kriteriet er oppfylt, ikke oppfylt eller ikke relevant. Som regel vil det i tillegg bes
            om besvarelse i fritekstfelt. Det er kraveier som avgjør om en fritekstbesvarelse er
            nødvendig eller ikke. Hvis dere ikke ser et fritekstfelt for et kriterium, holder det å
            huke av et av valgene nevnt over. Når dere har svart på alle suksesskriteriene, kan dere
            ferdigstille kravet. Det er fortsatt mulig å redigere besvarelsen selv om status er satt
            til ferdigstilt.
          </BodyLong>
          <BodyLong spacing>
            Det er mulig å innhente inspirasjon fra andre. I fanen “{EKravTab.ETTERLEVER}” kan dere
            enkelt se hvordan andre har dokumentert etterlevelse for samme krav.
          </BodyLong>
          <BodyLong spacing>
            Hvis kravet er uklart og dere har spørsmål til hvordan kravet skal forstås, kan dere
            bruke fanen “Spørsmål og svar” og komme direkte i kontakt med kraveier. Dere legger inn
            spørsmålet eller innspillet dere har, og hvordan dere vil varsles når kraveier svarer.
            Basert på slike tilbakemeldinger kan kraveier forbedre kravet sitt, og vi unngår at
            andre lurer på det samme.
          </BodyLong>
          <BodyLong spacing>
            Hvert krav har et eget notatfelt for dere som eventuelt ønsker å notere ting underveis
            som ikke gjelder besvarelse av et sukesskriterium. Innholdet I notatfeltet anses ikke
            som en del av etterlevelsesdokumentasjonen og vil ikke arkiveres i Public 360.
          </BodyLong>
          <BodyLong spacing>
            Hvis dere ønsker å jobbe med et visst sett med krav i en periode, kan dere bruke
            “Prioritert kravliste”. På hver kravside kan dere velge “Legg til dette kravet i
            Prioritert kravliste”. Prioritert kravliste står på dokumentets hovedside ved siden av
            “Alle krav”. Her er det også mulig å redigere listen direkte ved å legge til eller
            fjerne enkelte krav.
          </BodyLong>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>Få etterlevelsen godkjent av risikoeier</Accordion.Header>
        <Accordion.Content>
          <div className='my-6'>
            <video controls src='videos/FaaEtterlevelsenGodkjentAvRisikoeier.mov'></video>
          </div>
          <BodyLong spacing>
            Etterlevelsesdokumenter kan godkjennes av risikoeieren til enhver tid, også uavhengig av
            godkjenning av PVK.
          </BodyLong>
          <BodyLong spacing>
            Før dere ber om godkjenning av etterlevelsesdokumentet, skal dere også vurdere (eller
            revurdere) om det er behov for PVK, og lagre denne beslutningen.{' '}
            <ExternalLink href='/om-pvk#beslutningsstotte'>
              Beslutningsstøtte når man vurderer behov for PVK.
            </ExternalLink>
          </BodyLong>
          <BodyLong spacing>
            Dere kan be risikoeier godkjenne etterlevelsen “som den er”, selv om ikke alle krav er
            ferdig vurdert eller oppfylt, eller "Vurder behov for PVK" besvart. I så fall innebærer
            godkjenning at risikoeieren aksepterer eventuell risiko ved å ikke ha dokumentert
            etterlevelse.
          </BodyLong>
          <BodyLong className='mb-3'>
            Når dere er klare, velger dere “Få etterlevelsen godkjent” fra menyen. På siden “Få
            etterlevelsen godkjent av risikoeier” kan dere gjøre følgende:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>skrive kommentar til risikoeier som skal godkjenne. </List.Item>
            <List.Item>sende etterlevelsesdokumentet til risikoeier.</List.Item>
          </List>
          <BodyLong spacing>
            Etter at dere har sendt det til godkjenning, låses etterlevelsesdokumentet for
            redigering fram til at risikoeier har godkjent.
          </BodyLong>
          <BodyLong className='mb-3'>
            Etter at risikoeieren har godkjent etterlevelsesdokumentet, arkiveres dokumentet i
            Public360.
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>
              Lenker til arkiverte versjoner av etterlevelsesdokumentet finner dere på dokumentets
              temaside under Les mer om dette dokumentet.
            </List.Item>
            <List.Item>
              Etterlevelsens godkjenningshistorikk finner dere på “Få etterlevelsen godkjent av
              risikoeier” etter første godkjenning i ny løsning. Både deres og risikoeierens
              kommentarer ved godkjenning blir tatt med i historikken.
            </List.Item>
          </List>
          <BodyLong spacing>
            Når dere senere vil oppdatere et godkjent etterlevelsesdokument, velger dere Oppdater
            etterlevelsen fra menyen på dokumentets temaside.
          </BodyLong>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>For risikoeiere: slik godkjenner du etterlevelsen</Accordion.Header>
        <Accordion.Content>
          {/*          <div className='my-6'>
            <video controls src='videos/mangler'></video>
          </div>*/}
          <BodyLong className='mb-3'>
            Når du vil godkjenne et etterlevelsesdokument, velger du “Godkjenn etterlevelsen” fra
            menyen på dokumentets temaside. På siden “Godkjenn etterlevelsen” kan du gjøre følgende:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>lese etterleverens kommentar til deg.</List.Item>
            <List.Item>skrive din egen kommentar.</List.Item>
            <List.Item>godkjenne etterlevelsen.</List.Item>
          </List>
          <BodyLong spacing>
            Du kan godkjenne etterlevelsesdokumentasjon helt uavhengig av PVK. Når etterleveren skal
            sende etterlevelsesdokument til deg for godkjenning, skal de også ha{' '}
            <ExternalLink href='/om-pvk#beslutningsstotte'>
              vurdert behov for PVK, og dokumentert den beslutningen.
            </ExternalLink>{' '}
            Den vurderingen er også noe du godkjenner sammen med etterlevelsesdokumentet.
          </BodyLong>
          <BodyLong spacing>
            Du kan vurdere om du vil godkjenne etterlevelsen “som den er”, selv om ikke alle krav er
            ferdig vurdert eller oppfylt, eller "Vurder behov for PVK" besvart. I så fall innebærer
            godkjenning at du aksepterer eventuell risiko ved at etterlevelsen ikke er ferdig
            dokumentert.
          </BodyLong>
          <BodyLong className='mb-3'>
            Idet du godkjenner etterlevelsen, vil hele etterlevelsesdokumentasjonen du godkjenner,
            automatisk arkiveres i Public360.
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>
              Lenker til arkiverte versjoner av etterlevelsesdokumentet finner dere på dokumentets
              temaside under Les mer om dette dokumentet.
            </List.Item>
            <List.Item>
              Etterlevelsens godkjenningshistorikk finner dere på “Få etterlevelsen godkjent av
              risikoeier” etter første godkjenning i ny løsning. Dine kommentarer ved godkjenning,
              og etterleverens kommentarer til deg, blir tatt med i historikken.
            </List.Item>
          </List>
        </Accordion.Content>
      </Accordion.Item>
      {/*      <Accordion.Item>
        <Accordion.Header>
          Under arbeid::::Oppdatere etterlevelsesdokumentasjon etter godkjenning
        </Accordion.Header>
        <Accordion.Content>innhold mangler</Accordion.Content>
      </Accordion.Item>*/}
      {/*<Accordion.Item>
        <Accordion.Header>Gjenbruk av etterlevelsesdokumentasjon </Accordion.Header>
        <Accordion.Content>
          <Heading size='small' level='3' spacing>
            Generelt om gjenbruk
          </Heading>
          <BodyLong spacing>
            Gjenbruk innebærer en “mor-datter”-relasjon, hvor det opprinnelige
            etterlevelsesdokumentet er “moren”, og gjenbruk betyr oppretting av en “datter”. Det er
            mulig å opprette flere døtre til ett mordokument.
          </BodyLong>
          <BodyLong spacing>
            Når man oppretter et datterdokument, arver man alt innholdet fra mordokumentet i sin
            daværende tilstand, inkludert koblinger til behandlinger i Behandlingskatalogen. Arvet
            innhold kan redigeres fritt i datterdokumentet, og det er etterleverens ansvar å holde
            dokumentet oppdatert for sin egen etterlevelse.
          </BodyLong>
          <InfoCard size='small' data-color='success' className='mb-6'>
            <InfoCard.Header>
              <InfoCard.Title>Gjenbruk kan være aktuelt hvis</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <List as='ul'>
                <List.Item>etterlevelsen bruker samme behandling i Behandlingskatalogen.</List.Item>
                <List.Item>etterlevelsen har samme formål.</List.Item>
                <List.Item>
                  samme etterlevelse gjelder i flere sammenhenger i Nav, og det vil være
                  uhensiktsmessig tidkrevende om alle måtte skrive hele dokumentasjonen sin fra
                  bunnen av.
                </List.Item>
                <List.Item>
                  etterlevelsen ligner en tidligere etterlevelse, vil kreve dokumentasjon av samme
                  etterlevelseskrav, og man ønsker å ta utgangspunkt i tidligere svar.
                </List.Item>
              </List>
            </InfoCard.Content>
          </InfoCard>
          <InfoCard size='small' data-color='danger' className='mb-6'>
            <InfoCard.Header>
              <InfoCard.Title>Gjenbruk er uegnet til</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <List as='ul'>
                <List.Item>
                  etterlevelsesdokumentasjon der etterlevelsens egenskaper og krav er ulikt.
                </List.Item>
                <List.Item>
                  gjenbruk av Personvernkonsekvensvurdering. PVK arves ikke ved gjenbruk.
                </List.Item>
              </List>
            </InfoCard.Content>
          </InfoCard>
          <Heading size='small' level='3' spacing>
            Eksempler på når gjenbruk kan være relevant
          </Heading>
          <ReadMore header='Eksempel: kameraovervåkning på landets Nav-kontor. ' className='mb-6'>
            Her er det samme formål med behandlingen, tross at kameraovervåkning kan gjøres ulikt
            avhengig av lokale og utstyr. Enkelte Nav-kontor kan gjenbruke et etterlevelsesdokument
            der flere sentrale vurderinger allerede er tatt og dokumentert. Kontorene kan også velge
            å arve framtidige endringer i sentralt besluttet praksis og dokumentasjon. Slike
            oppdateringer kan så kreve at Nav-kontor revurderer deler av etterlevelsesdokumentasjon
            sin.
          </ReadMore>
          <ReadMore header='Eksempel: bruk av Fyrstikkalléens testlab' className='mb-6'>
            Når de ansatte skal teste digitale løsninger med brukere, er det flere etterlevelseskrav
            som Testlabbens oppsett og rutiner tar seg av, for eksempel hvordan personopplysninger
            tas opp og lagres. Når det gjøres likt, skal det også dokumenteres likt. Testlab-brukere
            kan opprette en datter av Testlabbens egen etterlevelsesdokument og bruke det som
            utgangspunkt for sin egen dokumentasjon. Testlabbens mordokument inneholder veiledning
            skrevet av ResearchOps (som driver Testlabben) om hvordan noen suksesskriterier skal
            fylles ut.
          </ReadMore>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>
          Slik tilrettelegger dere for gjenbruk av deres eget etterlevelsesdokument
        </Accordion.Header>
        <Accordion.Content>
          <ReadMore header='Se hvordan dere tilrettelegger for gjenbruk' className='mb-6'>
            skjermbilde mangler
          </ReadMore>
          <Heading size='small' level='4' spacing>
            1. Velg “tilrettelegg for gjenbruk” fra menyen
          </Heading>
          <BodyLong spacing>
            Etterlevelsesdokumentet er ikke ennå synlig for gjenbruk, men nå har dere låst opp for
            tilpasning av dokumentet før dere gjør det tilgjengelig for andre.
          </BodyLong>
          <Heading size='small' level='4' spacing>
            2. Tilpass eventuelt dokumentet
          </Heading>
          <List as='ul' className='mb-6'>
            <List.Item title='Vurdere dokumentegenskaper'>
              Sjekk at egenskapenene som er valgt, og dermed etterlevelseskrav som vises, er i
              samsvar med hvordan etterlevelsesdokumentet er tenkt gjenbrukt.
            </List.Item>
            <List.Item title='Skrive veiledning'>
              På kravsider kan dere velge å skrive veiledning til de som skal gjenbruke. Ved
              aktuelle suksesskriterier velger dere avkrysningsboksen “Skriv veiledning til hvordan
              kravet oppfylles i denne konteksten”. Veiledning kan beskrive sentrale vurderinger,
              eller gi praktisk råd til hvordan suksesskriteriet kan etterleves eller dokumenteres.
              Den kan også brukes til å forklare hvorfor dere har endret status på suksesskriterier
              eller kladdet svar sånn som dere har gjort.
            </List.Item>
            <List.Item title='Endre status på suksesskriterier'>
              Vurderingsstatusen til alle suksesskriterier arves som de er idet noen oppretter en
              gjenbrukskopi. Hvis etterlevelsesdokumentet er til for å gjenbrukes, kan dere vurdere
              om dere vil forskuttere noen vurderinger. Dere kunne for eksempel forhåndsbestemme at
              et visst suksesskriterium ikke er relevant, eller indikere at et bestemt
              suksesskriterium blir oppfylt enn så lenge den som gjenbruker, følger veiledningen som
              dere har skrevet. Likevel er de som gjenbruker dokumentet ansvarlig for å vurdere egen
              etterlevelse og endre status i sitt dokument ved behov.
            </List.Item>
            <List.Item title='Kladde svar'>
              Dere kan velge å skrive et utkast til fritekstbesvarelser slik at de som gjenbruker
              har noe å ta utgangspunkt i. Tekst som dere skriver i besvarelsesfelt vil arves ved
              gjenbruk, og de som gjenbruker vil kunne redigere og jobbe videre med teksten i sin
              egen dokumentasjon. Dersom de som gjenbruker har valgt å arve framtidige oppdateringer
              fra mordokumentet, vil slike oppdateringer aldri overskrive fritekstsvar som står i
              datterdokumentet.
            </List.Item>
            <List.Item title='Samle krav i Prioritert kravliste'>
              Det kan være nyttig for både dere og de som skal gjenbruke, å samle alle
              etterlevelseskrav med veiledning, endret status, og/eller kladdet svar, ett sted. Til
              dette bruker dere Prioritert kravliste, som dere finner i en egen fane på kravsiden.
              På aktuelle kravsider, velg “Legg til dette kravet i Prioritert kravliste”. Hvilke
              krav som skal stå i Prioritert kravliste, kan også redigeres under sin egen fane på
              dokumentets temaside. Prioritert kravliste arves som den er idet noen tar en
              gjenbrukskopi av dokumentet. Husk at alle krav, inkludert veiledning, status, og
              innhold i besvarelsesfeltet, arves ved gjenbruk, uansett om kravet står i Prioritert
              kravliste.
            </List.Item>
          </List>

          <Heading size='small' level='4' spacing>
            3. Slå på gjenbruk
          </Heading>
          <BodyLong spacing>
            Når dere er klare, velger dere “Slå på gjenbruk” fra menyen. Her må dere skrive en
            overordnet veiledning til de som vurderer å gjenbruke etterlevelsesdokumentet, slik at
            de forstår om gjenbruk vil være aktuelt. Her kunne dere for eksempel skrive hvem som
            burde gjenbruke dokumentet, eller i hvilke situasjoner gjenbruk vil være aktuelt. Så
            bekrefter dere at dere vil slå på gjenbruk.
          </BodyLong>
          <BodyLong spacing>
            Etter at dere har slått på gjenbruk, vil seksjon “Du kan gjenbruke dette etterlevelsesdokumentet” dukke
            opp på dokumentets temaside. Her finner dere den overordnede veiledningsteksten dere har
            skrevet, samt mulighet for å gjenbruke dokument. Informasjonen er synlig for alle.
          </BodyLong>
          <Heading size='small' level='4' spacing>
            4. Endre gjenbruk
          </Heading>
          <BodyLong className='mb-3'>
            Etter at dere har slått på gjenbruk, har dere følgende muligheter i menyen på Temaside:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item title='Redigere veiledning'>
              Her kan dere redigere deres overordnede veiledningstekst. Individuelle
              veiledningstekster som dere har skrevet på kravsider, blir fortsatt redigerbare der.
            </List.Item>
            <List.Item title='Skjule gjenbruk'>
              Dere kan også velge å skjule gjenbruksmuligheter for andre, varig eller i en periode.
              Det blir alltid mulig å slå på gjenbruk igjen senere.
            </List.Item>
          </List>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item>
        <Accordion.Header>Slik gjenbruker du et etterlevelsesdokument</Accordion.Header>
        <Accordion.Content>
          <ReadMore
            header='Vis meg hvordan jeg gjenbruker et etterlevelsesdokument'
            className='mb-6'
          >
            skjermbilde mangler
          </ReadMore>
          <BodyLong spacing>
            Etterlevelsesdokumenter hvor det er tillatt gjenbruk, har en egen seksjon på temaside
            som heter “Du kan gjenbruke dette etterlevelsesdokumentet”. Her finner dere veiledning om hvilke tilfeller
            som kan gjøre gjenbruk aktuell, samt mulighet for å opprette gjenbrukskopi.
          </BodyLong>
          <InfoCard size='small' data-color='success' className='mb-6'>
            <InfoCard.Header>
              <InfoCard.Title>Gjenbruk kan være aktuelt hvis</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <List as='ul'>
                <List.Item>etterlevelsen bruker samme behandling i Behandlingskatalogen.</List.Item>
                <List.Item>etterlevelsen har samme formål.</List.Item>
                <List.Item>
                  samme etterlevelse gjelder i flere sammenhenger i Nav, og det vil være
                  uhensiktsmessig tidkrevende om alle måtte skreve hele dokumentasjonen sin fra
                  bunnen av.
                </List.Item>
                <List.Item>
                  etterlevelsen ligner en tidligere etterlevelse, vil kreve dokumentasjon av samme
                  etterlevelseskrav, og man ønsker å ta utgangspunkt i tidligere svar.
                </List.Item>
              </List>
            </InfoCard.Content>
          </InfoCard>
          <InfoCard size='small' data-color='danger' className='mb-6'>
            <InfoCard.Header>
              <InfoCard.Title>Gjenbruk er uegnet til</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <List as='ul'>
                <List.Item>
                  etterlevelsesdokumentasjon der etterlevelsens egenskaper og krav er ulikt.
                </List.Item>
                <List.Item>
                  gjenbruk av Personvernkonsekvensvurdering. PVK arves ikke ved gjenbruk.
                </List.Item>
              </List>
            </InfoCard.Content>
          </InfoCard>
          <BodyLong spacing>
            Hvis dere er usikre på om det blir riktig å gjenbruke etterlevelsesdokumentet, hør med
            de som eier dokumentet. Navnet til dokumenteieren finner dere under Les mer om dette
            dokumentet.
          </BodyLong>
          <Heading size='small' level='4' spacing>
            1. Opprett datterdokument
          </Heading>
          <BodyLong spacing>Under Du kan gjenbruke dette etterlevelsesdokumentet, velg “Gjenbruk dokument”.</BodyLong>
          <BodyLong className='mb-3'>
            Fyll ut skjemaet i tråd med{' '}
            <ExternalLink href='/'>Redigere dokumentegenskaper og filtrere krav </ExternalLink>{' '}
            Fordi dere gjenbruker, vil det være noen forskjeller fra oppretting av et vanlig
            etterlevelsesdokument:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item title='Navn og beskrivelse'>
              Det skal være lett for alle å skille deres nye dokument, fra dokumentet som dere
              gjenbruker. Vær tydelig i både navngiving og beskrivelse på hva det er at deres
              etterlevelse gjelder, og hva som er deres kontekst. Dere behøver ikke å beskrive
              hvilket dokument dere gjenbruker – dette vil løsningen vise automatisk.
            </List.Item>
            <List.Item title='Beholde relasjonen til mordokumentet, eller ta engangskopi'>
              Det å beholde relasjonen innebærer at dere vil arve eventuelle, framtidige endringer i
              veiledning som mordokumentets eier har skrevet til dere på kravsider. Hvis dere velger
              engangskopi, blir veiledningen i deres etterlevelsesdokument stående som den var da
              dere først opprettet dokumentet. “Behold relasjon” er nok et godt default-valg, men
              hør med mordokumentets eiere hvis dere er usikre. Merk at selv om dere velger å arve
              endringer i veiledning, vil slike oppdateringer aldri overskrive deres egen
              kravdokumentasjon.
            </List.Item>
            <List.Item title='Egenskaper som gjelder for etterlevelsen, arver dere fra mordokumentet'>
              Når dere lager gjenbrukskopi, vil dere ikke kunne redigere hvilke egenskaper som
              gjelder for etterlevelsen, og dermed hvilke etterlevelseskrav som vises på temaside.
              Disse arver dere fra mordokumentet. Hvis dere innser behov for andre egenskaper og
              krav enn de som arves, er gjenbruk av dette dokumentet ikke aktuelt for dere.
            </List.Item>
          </List>
          <BodyLong spacing>
            Etter at dere har fylt ut resten av skjemaet og lagret, blir deres nye dokument
            opprettet. Dere kan til enhver tid redigere eller oppdatere denne informasjonen, unntatt
            hvilke egenskaper som gjelder for behandlingen.
          </BodyLong>
          <Heading size='small' level='4' spacing>
            2. Ta stilling til alle etterlevelseskrav i dokumentet
          </Heading>
          <BodyLong spacing>
            Dere bruker deres nye etterlevelsesdokument på samme måte som vanlig
            etterlevelsesdokumentasjon:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>
              paul: åpne riktig accordion title
              <Link href='#hvordan-dokumentere-etterlevelse'>Jobbe i temaoversikt</Link>
            </List.Item>
            <List.Item>
              <Link href='#hvordan-dokumentere-etterlevelse'>Besvare etterlevelseskrav</Link>
            </List.Item>
          </List>
          <Heading size='xsmall' level='5' spacing>
            Arving av veiledning og andre tilpasninger
          </Heading>
          <BodyLong className='mb-3'>
            Dokumenteiere som tillater gjenbruk, kan velge om de vil tilpasse
            etterlevelsesdokumentet som arves. Dette innebærer at de kan:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>Skrive veiledning på kravsider, ved enkelte suksesskriterier.</List.Item>
            <List.Item>
              Forhåndsvurdere enkelte suksesskriterier for dere, for eksempel ved å sette noen til
              “ikke relevant”.
            </List.Item>
            <List.Item>Kladde svar som dere skal skrive ferdig.</List.Item>
          </List>
          <BodyLong spacing>
            Dokumenteierne velger også om de vil samle slike tilpassede krav på dokumentets forside,
            under Prioriterte krav. I så fall vil dere arve denne listen når dere har opprettet
            gjenbrukskopi.
          </BodyLong>
          <InfoCard size='small' data-color='warning' className='mb-6'>
            <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
              <InfoCard.Title>
                Dere er ansvarlige for at deres etterlevelsesdokumentasjon stemmer
              </InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <BodyLong>
                Selv om dere kan ha arvet noen forhåndsvurderinger, må dere ta stilling til alle
                krav og suksesskriterier, og dokumentere det som gjelder for deres etterlevelse.
                Likeledes må dere vurdere og dokumentere alle etterlevelseskrav, ikke bare de som
                står i Prioritert kravliste. Hvis dere senere arver endringer i veiledning, er dere
                ansvarlige for å ta stilling til endringene og holde etterlevelsesdokumentasjonen
                oppdatert.
              </BodyLong>
            </InfoCard.Content>
          </InfoCard>
        </Accordion.Content>
      </Accordion.Item>*/}
    </Accordion>
  )
}

export default OmStotteTilEtterlevelseAccordion
