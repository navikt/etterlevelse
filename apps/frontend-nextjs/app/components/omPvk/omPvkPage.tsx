'use client'

import { BodyLong, Heading, List, ReadMore, Stepper } from '@navikt/ds-react'
import Image from 'next/image'
import { useState } from 'react'
import { PageLayout } from '../others/scaffold/scaffold'
import SkjermbildePVK from './images/SkjermbildePVK.png'
import VisHvorJegFinnerDigitalPVK from './images/VisHvorJegFinnerDigitalPVK.png'

const OmPvkPage = () => {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <PageLayout pageTitle='Om Digital PVK' currentPage='Digital PVK'>
      <div className='flex gap-7 mt-10'>
        <div className='sticky top-4 h-full'>
          <div className='max-w-[274px]'>
            <Stepper
              aria-labelledby='stepper-heading'
              activeStep={activeStep}
              onStepChange={setActiveStep}
            >
              <Stepper.Step href='#formaalet-med-pvk'>Formålet med PVK</Stepper.Step>
              <Stepper.Step href='#hvordan-bruke-digital-pvk'>
                Hvordan bruke Digital PVK paul: legge til copybutton.
              </Stepper.Step>
              <Stepper.Step href='#beslutningsstotte'>
                Beslutningsstøtte når dere vurderer behov for PVK
              </Stepper.Step>
              <Stepper.Step href='#behandlingens-livslop'>
                Dokumentasjon av Behandlingens livsløp
              </Stepper.Step>
              <Stepper.Step href='#behandlinges-art-og-omfang'>
                Dokumentasjon av behandlingens art og omfang
              </Stepper.Step>
              <Stepper.Step href='#bruk-av-den-nye-losningen'>
                Når skal vi begynne å bruke den nye løsningen?
              </Stepper.Step>
              <Stepper.Step href='#ta-kontakt'>Ta kontakt</Stepper.Step>
            </Stepper>
          </div>
        </div>
        <div className='max-w-[75ch]'>
          <Heading id='stepper-heading' spacing size='large' level='1'>
            Om Digital PVK
          </Heading>
          <BodyLong spacing>
            Fra september 2025 bruker dere den nye, digitale PVK-løsningen i stedet for den gamle
            Word-malen.
          </BodyLong>
          <Image
            className='mr-2.5 mt-6 mb-12'
            src={SkjermbildePVK}
            alt='Skjermbilde fra forsiden av vår digitale PVK-løsning.'
          />
          <Heading size='medium' level='2' spacing id='formaalet-med-pvk'>
            Hva er formålet med Personvernkonsekvensvurdering (PVK)?
          </Heading>
          <BodyLong spacing>
            PVK gjelder noen ganger der vi ser at måten vi behandler folks persondata på i Nav, kan
            risikere at vi ikke ivaretar deres rettigheter og friheter. Dette kan handle om alt fra
            hva vi ber om i en digital søknad, til bruk av videopptak på Nav-kontor, til lagring av
            data i skyen, til at uhensiktsmessig mange i Nav har tilgang til personens informasjon.
            Ny Digital PVK skal bidra til at det blir lettere å vurdere det vi gjør, og hvordan vi
            skal redusere risikonivået.
          </BodyLong>
          <Heading size='medium' level='2' spacing id='hvordan-bruke-digital-pvk'>
            Hvordan bruker man Digital PVK?
          </Heading>
          <BodyLong className='mb-3'>
            Digital PVK utgjør en del av Støtte til etterlevelse. Når det er registrert at en viss
            etterlevelse inkluderer behandling av personopplysninger, vil alle med
            redigeringstilgang til etterlevelsesdokumentet kunne:
          </BodyLong>
          <List className='mb-6'>
            <List.Item>Tegne behandlingens livsløp</List.Item>
            <List.Item>Vurdere behandlingens art og omfang</List.Item>
            <List.Item>Vurdere behov for å gjennomføre PVK.</List.Item>
          </List>
          <BodyLong spacing>
            Hvis man kommer fram til at det er behov for PVK, fyller man ut PVK der i
            etterlevelsesdokumentet.
          </BodyLong>
          <ReadMore header='Vis meg hvor jeg finner Digital PVK' className='mb-6'>
            <Image
              className='mr-2.5 mt-6 mb-12'
              src={VisHvorJegFinnerDigitalPVK}
              alt='Skjermbilde som viser hvor man finner Digital PVK'
            />
          </ReadMore>
          <BodyLong spacing>
            Resten av denne siden beskriver i nærmere detalj hvordan man bruker Digital PVK til å
            vurdere behov for PVK, og eventuelt gjennomføre den.
          </BodyLong>

          <Heading size='medium' level='2' spacing id='beslutningsstotte'>
            Beslutningsstøtte når dere vurderer behov for PVK
          </Heading>
          <BodyLong className='mt-3'>
            I ny løsning får dere dokumentere hvordan dere har kommet fram til beslutningen om
            gjennomføring av PVK. Dere må ta stilling til hvilke egenskaper som gjelder for
            behandlingen(e) deres. Noen av disse egenskapene hentes automatisk fra
            Behandlingskatalogen. Andre egenskaper som er relevant i vurderingen listes opp, og dere
            må selv ta stilling til hvilke av disse som gjelder. Basert på hvilke egenskaper dere
            har krysset av for, får dere en anbefaling om dere bør gjennomføre PVK eller ikke.
            Anbefalingen kommer med en kort begrunnelse. Dere kan velge å følge anbefalingen eller
            ikke.
            <br />
            <br />
            Dere kan til enhver tid oppdatere eller revurdere beslutningen.
          </BodyLong>
          <ReadMore
            header='Hvilke egenskaper er aktuelle når man vurderer behov for PVK? '
            className='mb-6'
          >
            <BodyLong className='mb-3'>
              Følgende behandlingsegenskaper i innebærer høyere risiko, og gjør det mer sannsynlig
              at en PVK burde gjennomføres:
            </BodyLong>

            <List>
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
            className='mb-6'
          >
            <BodyLong className='mb-3'>Det er aktuelt å vurdere behov for PVK når:</BodyLong>
            <List className='mb-6'>
              <List.Item>
                Vi skal behandle personopplysninger i en ny kontekst, for eksempel bygge en ny
                digital søknad eller ta i bruk en ny teknisk løsning.
              </List.Item>
              <List.Item>
                Vi skal gjøre endringer i en eksisterende behandling av personopplysninger.
              </List.Item>
            </List>

            <BodyLong spacing>
              Det er viktig at vi vurderer behov for PVK allerede før vi begynner å behandle
              personopplysninger eller endre hvordan vi behandler disse. Dokumentasjon av PVK,
              vurdering av Personvernombudet (PVO) og godkjenning hos risikoeieren kan til sammen ta
              flere uker å gjennomføre. Husk å tillate nok tid.
            </BodyLong>
          </ReadMore>
          <Heading level='2' size='medium' spacing id='behandlingens-livslop'>
            Dokumentasjon av Behandlingens livsløp
          </Heading>
          <ReadMore header='Hva er Behandlingens livsløp?' className='mb-6'>
            <BodyLong className='mb-3'>
              «Behandlingens livsløp» beskriver hvor og hvordan personopplysninger flyter når de
              behandles i deres kontekst. Hensikten med å tegne behandlingens livsløp er at dere
              blant annet må tenke på:
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
          <BodyLong spacing>
            I den nye løsningen kan dere laste opp en eller flere tegninger av behandlingens livsløp
            og/eller lagre en skriftlig beskrivelse.
          </BodyLong>
          <BodyLong spacing>
            Selv om dokumentasjon av behandlingens livsløp kun er påkrevd når man gjør en PVK,
            anbefaler vi at alle tegner flyten. Dette vil være til hjelp når dere svarer ut
            etterlevelseskrav innen personvern og arkiv og dokumentasjon, og i selve vurderingen av
            om det er nødvendig å gjennomføre PVK.
          </BodyLong>

          <Heading level='2' size='medium' spacing id='behandlinges-art-og-omfang'>
            Dokumentasjon av behandlingens art og omfang
          </Heading>
          <BodyLong className='mb-3'>Behandlingens art og omfang handler om:</BodyLong>
          <List className='mb-6'>
            <List.Item>Hvilke personkategorier vi behandler</List.Item>
            <List.Item>Hvor mange personer vi behandler personopplysninger om</List.Item>
            <List.Item>Hvilke roller som skal ha tilgang til personopplysningene</List.Item>
            <List.Item>Hvordan og hvor lenge personopplysningene lagres</List.Item>
          </List>
          <BodyLong spacing>
            Dokumentasjon av behandlingens art og omfang vil være til hjelp når dere svarer ut
            etterlevelseskrav innen personvern og arkiv og dokumentasjon, og i selve vurderingen av
            om det er nødvendig å gjennomføre PVK.
          </BodyLong>
          <Heading level='2' size='medium' spacing id='bruk-av-den-nye-losningen'>
            Når skal vi begynne å bruke den nye løsningen?
          </Heading>
          <Heading level='3' size='xsmall' className='mt-5'>
            Dere skal vurdere eller revurdere behov for PVK
          </Heading>
          <BodyLong className='mt-3'>
            I ny løsning får dere hjelp til å vurdere og dokumentere om dere skal gjennomføre en
            PVK. Hvis dere tidligere har vurdert at det ikke er behov for PVK, kan dere revurdere i
            ny løsning til enhver tid.
          </BodyLong>
          <Heading level='3' size='xsmall' className='mt-5'>
            Dere har en påbegynt PVK i Word som ikke ennå er sendt til PVO for vurdering
          </Heading>
          <BodyLong className='mt-3'>
            Dere bør bruke den nye løsningen og legge over innhold fra Word.
          </BodyLong>
          <Heading level='3' size='xsmall' className='mt-5'>
            Dere har en PVK i Word som allerede er godkjent og arkivert
          </Heading>
          <BodyLong className='mt-3'>
            <b>Hvis ikke risikobildet er endret </b>, skal ikke deres godkjente, arkiverte PVK inn i
            ny løsning. Men dere skal likevel registrere denne vurderingen under «Vurder behov for
            PVK». Her velger dere «Vi har en PVK i Word som ikke trenger en ny vurdering».
          </BodyLong>
          <BodyLong className='mt-3'>
            <b>Hvis risikobildet er endret siden dere fikk godkjent og arkivert deres PVK,</b> bør
            dere bruke ny løsning til å dokumentere framover. Det er dessverre ikke mulig å
            importere eksisterende PVK-er fra Word. Da må dere klippe og lime tidligere innhold i
            Word over i den nye løsningen og oppdatere med det som er nytt. Dere kan også legge inn
            lenker til tidligere PVK-er i Public360, slik at de blir lettere for Personvernombudet å
            finne ved behov.
          </BodyLong>
          <Heading level='3' size='xsmall' className='mt-5'>
            Dere skal gjøre endringer i en eksisterende digital PVK (ny løsning)
          </Heading>
          <BodyLong className='mt-3'>
            Etter at dere har fått godkjent og arkivert digital PVK, er det mulig å oppdatere PVK-en
            i ettertid. Her velger dere «Oppdater PVK» fra menyen i deres dokumentasjon. Så vurderer
            dere om det er behov for en ny innsending til Personvernombudet, eller om risikoeier
            skal godkjenne mindre endringer i PVK.
          </BodyLong>
          <Heading level='2' size='small' spacing className='mt-7' id='ta-kontakt'>
            Ta kontakt
          </Heading>
          <BodyLong spacing>
            Hvis dere har juridiske spørsmål knyttet til personvern, ta kontakt med Juridisk
            avdeling: nav.juridisk.avdeling@nav.no.
          </BodyLong>
          <BodyLong className='mb-3'>
            Hvis dere finner feil i løsningen eller har forslag til forbedringer, ta kontakt med
            Team Datajegerne:
          </BodyLong>
          <List>
            <List.Item>Bli med på #etterlevelse på Slack</List.Item>
            <List.Item>Send mail til: teamdatajegerne@nav.no</List.Item>
          </List>
        </div>
      </div>
    </PageLayout>
  )
}

export default OmPvkPage
