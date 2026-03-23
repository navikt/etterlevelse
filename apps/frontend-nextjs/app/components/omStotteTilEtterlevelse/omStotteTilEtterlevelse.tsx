'use client'

import OmStotteTilEtterlevelseAccordion from '@/components/omStotteTilEtterlevelse/omStotteTilEtterlevelseAccordion'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { BodyLong, Heading, List, ReadMore, Stepper } from '@navikt/ds-react'
import Image from 'next/image'
import { useState } from 'react'
import ForstesideStotteTilEtterlevelse from './images/ForstesidStotteTilEtterlevelse.png'
import TemainndelingOgTemaoversiktReadmore from './images/TemainndelingOgTemaoversiktReadmore.png'
import VisMegHvordanEnKravsideSerUt from './images/VisMegHvordanEnKravsideSerUt.png'

const OmStotteTilEtterlevelse = () => {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <PageLayout pageTitle='Om Støtte til etterlevelse' currentPage='Støtte til etterlevelse'>
      <div className='flex gap-7 mt-10'>
        <div className='sticky top-4 h-full'>
          <div className='max-w-68.5'>
            <Stepper
              aria-labelledby='stepper-heading'
              activeStep={activeStep}
              onStepChange={setActiveStep}
            >
              <Stepper.Step href='#formaalet-med-stotte-til-etterlevelse'>
                Formålet med Støtte til etterlevelse
              </Stepper.Step>
              <Stepper.Step href='#forstesiden-i-stotte-til-etterlevelse'>
                Førstesiden i Støtte til etterlevelse
              </Stepper.Step>
              <Stepper.Step href='#temainndeling-og-temaoversikt'>
                Temainndeling og temaoversikt
              </Stepper.Step>
              <Stepper.Step href='#dette-inneholder-et-etterlevelseskrav'>
                Dette inneholder et etterlevelseskrav
              </Stepper.Step>
              <Stepper.Step href='#hvordan-dokumentere-etterlevelse'>
                Hvordan dokumentere etterlevelse
              </Stepper.Step>
              <Stepper.Step href='#ta-kontakt'>Ta kontakt</Stepper.Step>
            </Stepper>
          </div>
        </div>
        <div className='max-w-[75ch]'>
          <Heading id='stepper-heading' spacing size='large' level='1'>
            Om Støtte til etterlevelse
          </Heading>

          <Heading size='medium' level='2' spacing id='formaalet-med-stotte-til-etterlevelse'>
            Hva er formålet med Støtte til etterlevelse
          </Heading>
          <div className='my-6'>
            <video controls src='videos/EtterlevelseskravMedTeksting.mp4'></video>
          </div>
          <BodyLong spacing>
            Støtte til etterlevelse er et digital verktøy hvor vi dokumenterer hvordan vi oppfyller
            generelt regelverk for ulike aktiviteter vi gjør i Nav. Løsningen erstatter det
            tidligere excelarket med etterlevelsekrav.
          </BodyLong>
          <BodyLong spacing>
            Noen eksempler på aktiviteter hvor vi må dokumentere etterlevelse er:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>
              Når vi skal utvikle saksbehandlingsløsninger eller digitale søknader
            </List.Item>
            <List.Item>
              Der vi har videoovervåkning, for eksempel på Nav-kontor eller på Fyrstikkalléen{' '}
            </List.Item>
            <List.Item>Involvering av brukere i innsiktsarbeid</List.Item>
          </List>
          <BodyLong spacing>
            I løsningen er det generelle regelverket omdannet til såkalte etterlevelseskrav,
            gruppert etter tema. Verktøyet skal bidra til at det blir enkelt å forstå hvilke krav
            dere skal etterleve basert på type aktivitet.
          </BodyLong>
          <BodyLong spacing>Støtte til etterlevelse skal bidra til å</BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item>
              sikre den nødvendige, gjennomgående funksjonaliteten i løsningene som Nav forvalter og
              utvikler
            </List.Item>
            <List.Item>
              sikre at den generelle rettsikkerheten for brukerne våre ivaretas.
            </List.Item>
            <List.Item>
              samle dokumentasjon av etterlevelse på ett sted, noe som gir oversikt og bedre
              grunnlag for internkontroll.
            </List.Item>
          </List>
          <BodyLong spacing>
            Hvem som er tolkningsansvarlige for de ulike regelverkene (såkalte “kraveiere”), følger
            av ansvarsdokumentet i Nav. Kraveierne har ansvaret for å tolke regelverket og publisere
            etterlevelseskrav. De vil også oppdatere disse når det er behov for dette.
          </BodyLong>
          <BodyLong spacing>
            Avdelingene har ansvaret for at etterlevelsesdokumentasjon i Støtte til etterlevelse er
            korrekt og oppdatert innenfor sine områder.{' '}
          </BodyLong>

          <Heading size='medium' level='2' spacing id='forstesiden-i-stotte-til-etterlevelse'>
            Førstesiden i Støtte til etterlevelse
          </Heading>
          <Image
            className='mr-2.5 mt-6 mb-12'
            src={ForstesideStotteTilEtterlevelse}
            alt='Skjermbilde fra forsiden til Støtte til etterlevelse'
          />
          <BodyLong spacing>Løsningen har tre hovedinnganger på førstesiden:</BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item title='Mine sist dokumenterte'>
              Dette er inngangen hvis dere skal dokumentere etterlevelse. Her kan dere opprette et
              nytt etterlevelsesdokument eller dere kan oppdatere eksisterende
              etterlevelsesdokumenter.
            </List.Item>
            <List.Item title='Forstå kravene'>
              Dette er inngangen hvis dere ønsker å se alle etterlevelseskravene i løsningen, uten
              at dere skal dokumentere etterlevelse. Her får dere en oversikt over alle
              etterlevelseskravene fordelt på tema.
            </List.Item>
            <List.Item title='Status i organisasjonen'>
              Dette er inngangen hvis dere ønsker oversikt over all etterlevelse i en
              avdeling/seksjon/team. Løsningen inneholder per nå kun en veldig overordnet oversikt.
              Team datajegerne jobber for tiden med å lage dashboard som vil gi ledere et bedre
              grunnlag for internkontroll.
            </List.Item>
          </List>
          <Heading size='small' level='3' spacing>
            Andre muligheter på forsiden
          </Heading>
          <BodyLong spacing>
            Dere kan enkelt søke på krav, behandlinger eller etterlevelsesdokumentasjon i søkefeltet
            øverst på siden.
          </BodyLong>
          <BodyLong spacing>
            Nyttige lenker til mer informasjon om løsningen og bruk av denne, finner dere nederst på
            forsiden.
          </BodyLong>

          <Heading size='medium' level='2' spacing id='temainndeling-og-temaoversikt'>
            Temainndeling og temaoversikt
          </Heading>
          <ReadMore className='mt-3 mb-6' header='Vis meg hvordan kravene inndeles i temaer'>
            <Image
              className='mr-2.5 mt-6 mb-12'
              src={TemainndelingOgTemaoversiktReadmore}
              alt='Skjermbilde som viser temainndeling og temaoversikt'
            />
          </ReadMore>
          <BodyLong spacing>
            Kravene er delt inn i ulike regelverkstema. Hvert tema har en organisatorisk eier som er
            ansvarlig for å tolke regelverket og skrive etterlevelseskrav for temaet.
          </BodyLong>
          <BodyLong spacing>
            Hvilken enhet som er ansvarlig finner dere under nærmere beskrivelse om temaet. Hvis
            dere har spørsmål til et helt tema, kan dere ta direkte kontakt med den som er
            ansvarlig.
          </BodyLong>

          <Heading size='medium' level='2' spacing id='dette-inneholder-et-etterlevelseskrav'>
            Dette inneholder et etterlevelseskrav
          </Heading>
          <ReadMore className='mt-3 mb-6' header='Vis meg hvordan en kravside ser ut'>
            <Image
              className='mr-2.5 mt-6 mb-12'
              src={VisMegHvordanEnKravsideSerUt}
              alt='Skjermbilde som viser en kravside'
            />
          </ReadMore>
          <BodyLong spacing>
            Alle etterlevelseskrav inneholder de samme feltene. De viktigste dere må kjenne til er:
          </BodyLong>
          <List as='ul' className='mb-6'>
            <List.Item title='Navn på krav og kravID'>
              Hvert krav har et navn og en ID (nummer). Det er viktig å merke seg at tallet etter
              punktummet viser hvilken versjon av kravet det er. Kraveier oppretter en ny versjon
              når det er større endringer i kravets innhold, og endringen krever en ny gjennomgang
              og dokumentasjon på kravet.
            </List.Item>
            <List.Item title='Hensikten med kravet'>
              Formålet er at dere skal forstå hvorfor vi har dette kravet, og hva som er nytten med
              det for hvem.
            </List.Item>
            <List.Item title='Suksesskriterier'>
              Suksesskriterier er aktive handlinger som viser hva dere konkret må gjøre for å
              etterleve kravet. Hvert kriterium inneholder også en utfyllende beskrivelse som
              hjelper dere med å forstå kriteriet.
            </List.Item>
            <List.Item title='Kilder'>
              Her finner dere lenker til mer informasjon utenfor løsningen som er relevant for
              kravet.
            </List.Item>
            <List.Item title='Regelverk'>
              Her finner dere Lovdata-lenker til bestemmelsene i lover, forskrifter og forordninger
              som er bakgrunnen for kravet.
            </List.Item>
            <List.Item title='Begreper'>
              Her finner dere lenker til begreper i Begrepskatalogen som benyttes i
              kravbeskrivelsen.
            </List.Item>
            <List.Item title='Tidligere versjoner og Dette er nytt siden forrige versjon'>
              Her finner dere lenker til alle tidligere versjoner av kravet. Det er også et eget
              felt hvor kraveier kort oppsummerer hva som er nytt siden forrige versjon.
            </List.Item>
            <List.Item title='Relasjoner til andre krav'>
              Dersom kravet bør sees i sammenheng med andre krav, har kraveier lagt inn lenker til
              disse her.
            </List.Item>
            <List.Item title='Ansvarlig'>Her finner dere hvilken enhet som er kraveier.</List.Item>
          </List>

          <Heading size='medium' level='2' spacing id='hvordan-dokumentere-etterlevelse'>
            Hvordan dokumentere etterlevelse
          </Heading>
          <OmStotteTilEtterlevelseAccordion />

          <Heading size='medium' level='2' spacing id='ta-kontakt'>
            Ta kontakt
          </Heading>
          <BodyLong spacing>
            Hvis dere har behov for juridisk rådgivning knyttet til hvordan de ulike
            etterlevelseskravene skal forstås, ta direkte kontakt med kraveier. Hvem som er kraveier
            finner dere under ansvarlig på etterlevelseskravet.
          </BodyLong>
          <BodyLong spacing>
            Husk at det også er mulig å benytte spørsmål og svar på gjeldende etterlevelseskrav for
            å komme i kontakt med kraveier.
          </BodyLong>

          <BodyLong spacing>
            Hvis dere finner feil i løsningen eller har forslag til forbedringer, ta kontakt med
            Team Datajegerne:
          </BodyLong>
          <List as='ul'>
            <List.Item>Bli med på #etterlevelse på Slack </List.Item>
            <List.Item>Send mail til: teamdatajegerne@nav.no </List.Item>
          </List>
        </div>
      </div>
    </PageLayout>
  )
}

export default OmStotteTilEtterlevelse
