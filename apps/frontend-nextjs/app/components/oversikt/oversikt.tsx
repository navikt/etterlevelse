'use client'

import VisHvorJegFinnerDigitalPVK from '@/components/omPvk/images/VisHvorJegFinnerDigitalPVK.png'
import { PageLayout } from '@/components/others/scaffold/scaffold'
import { BodyLong, Heading, Link, ReadMore, Stepper } from '@navikt/ds-react'
import Image from 'next/image'
import { useState } from 'react'

export const Oversikt = () => {
  const [activeStep, setActiveStep] = useState(0)
  return (
    <PageLayout
      pageTitle='Oversikt over Behandlingskatalogen, Støtte til etterlevelse og Digital PVK'
      currentPage='Behandlinger, etterlevelse og PVK'
    >
      <div className='flex gap-7 mt-10'>
        <div className='sticky top-4 h-full'>
          <div className='max-w-68.5'>
            <Stepper
              aria-labelledby='stepper-heading'
              activeStep={activeStep}
              onStepChange={setActiveStep}
            >
              <Stepper.Step href='#kort-om-løsningene'>Kort om løsningene</Stepper.Step>
              <Stepper.Step href='#sammenhengen-mellom-verktøyene'>
                Sammenhengen mellom verktøyene
              </Stepper.Step>
              <Stepper.Step href='#måter-å-jobbe-på'>Måter å jobbe på</Stepper.Step>
            </Stepper>
          </div>
        </div>
        <div className='max-w-[75ch]'>
          <Heading size='medium' level='2' id='kort-om-løsningene'>
            Kort om løsningene
          </Heading>
          <BodyLong className='mt-6'>
            I Nav har vi to digitale verktøy som heter Behandlingskatalogen og Støtte til
            etterlevelse. I tillegg har vi Digital PVK, som er en forlengelse av Støtte til
            etterlevelse der det gjennomføres risikovurderinger for personvern.
          </BodyLong>
          <div className='flex my-6'>
            <Image
              className='mr-2.5 max-w-1/2'
              src={VisHvorJegFinnerDigitalPVK}
              alt={`"Skjermbilde fra Støtte til etterlevelse som viser inngangen til Digital PVK. Lenkene står øverst i etterlevelsesdokumentet deres, like etter 'Rediger dokumentegenskaper'. Her står det to lenker: Tegn behandlingens livsløp, og Vurder behov for PVK."`}
              aria-hidden
              aria-label=''
            />
            <div className='ml-6'>
              <Heading size='small' level='3' spacing>
                Behandlingskatalogen
              </Heading>
              <BodyLong spacing>
                Oversikt over alle behandlingsaktiviteter, behandlingsgrunnlag som brukes, systemer
                personopplysningene behandles i, om det benyttes databehandler mv.
              </BodyLong>
              <Link>Les mer om behandlingskatalogen</Link>
            </div>
          </div>
          <div className='flex my-6'>
            <Image
              className='mr-2.5 max-w-1/2'
              src={VisHvorJegFinnerDigitalPVK}
              alt={`"Skjermbilde fra Støtte til etterlevelse som viser inngangen til Digital PVK. Lenkene står øverst i etterlevelsesdokumentet deres, like etter 'Rediger dokumentegenskaper'. Her står det to lenker: Tegn behandlingens livsløp, og Vurder behov for PVK."`}
              aria-hidden
              aria-label=''
            />
            <div className='ml-6'>
              <Heading size='small' level='3' spacing>
                Støtte til etterlevelse
              </Heading>
              <BodyLong spacing>
                Dokumentere hvordan vi etterlever generelt regelverk, og vurdere behov for PVK.
              </BodyLong>
              <Link>Les mer om Støtte til etterlevelse</Link>
            </div>
          </div>
          <div className='flex my-6'>
            <Image
              className='mr-2.5 max-w-1/2'
              src={VisHvorJegFinnerDigitalPVK}
              alt={`"Skjermbilde fra Støtte til etterlevelse som viser inngangen til Digital PVK. Lenkene står øverst i etterlevelsesdokumentet deres, like etter 'Rediger dokumentegenskaper'. Her står det to lenker: Tegn behandlingens livsløp, og Vurder behov for PVK."`}
              aria-hidden
              aria-label=''
            />
            <div className='ml-6'>
              <Heading size='small' level='3' spacing>
                Digital Personvernkonsekvens-vurdering (PVK)
              </Heading>
              <BodyLong spacing>
                Ved risiko for at den registrertes personvernrettigheter kan krenkes, dokumentere
                risikoene og komme med tiltak.
              </BodyLong>
              <Link>Les mer om Digital PVK</Link>
            </div>
          </div>

          <Heading size='medium' level='2' spacing id='sammenhengen-mellom-verktøyene'>
            Sammenhengen mellom verktøyene
          </Heading>
          <BodyLong className='mt-6'>
            Behandlingskatalogen, Støtte til etterlevelse og Digital PVK er integrert med hverandre.
            Dette gir god sammenheng mellom verktøyene, en bedre og enklere dokumentasjonsprosess og
            et bedre grunnlag for internkontroll.
          </BodyLong>
          <Image
            className='mr-2.5 mt-6'
            src={VisHvorJegFinnerDigitalPVK}
            alt={`"Skjermbilde fra Støtte til etterlevelse som viser inngangen til Digital PVK. Lenkene står øverst i etterlevelsesdokumentet deres, like etter 'Rediger dokumentegenskaper'. Her står det to lenker: Tegn behandlingens livsløp, og Vurder behov for PVK."`}
            aria-hidden
            aria-label=''
          />
          <ReadMore
            header='Forholdet mellom Støtte til etterlevelse og Behandlingskatalogen'
            className='mt-3'
          >
            <BodyLong>
              Det er ikke et 1:1 forhold mellom behandlinger i Behandlingskatalogen og
              etterlevelsesdokumenter i Støtte til etterlevelse. Derfor er det mulig å knytte mer
              enn én behandling til ett etterlevelsesdokument. Dersom dere behandler
              personopplysninger er det også et krav om at dere legger til minst én behandling til
              etterlevelsesdokumentet.
            </BodyLong>
          </ReadMore>
          <ReadMore
            header='Forholdet mellom Støtte til etterlevelse og Digital PVK'
            className='mt-3'
          >
            <BodyLong>
              Det er et 1:1 forhold mellom et etterlevelsesdokument og PVK i Støtte til
              etterlevelse. PVK er en utvidelse av etterlevelsesdokumentet i tilfeller der dere
              behandler personopplysinger og har vurdert at det er behov for PVK.
            </BodyLong>
          </ReadMore>
          <ReadMore header='Forholdet mellom Behandlingskatalogen og Digital PVK' className='mt-3'>
            <BodyLong>
              Det er ikke et 1:1 forhold mellom behandlinger i Behandlingskatalogen og PVK. Det er
              mulig å knytte mer enn én behandling til et etterlevelsesdokument, og derfor også PVK.
              Det er et krav at dere legger til minst en behandling.
            </BodyLong>
          </ReadMore>
          <Heading size='medium' level='2' spacing id='måter-å-jobbe-på'>
            Måter å jobbe på
          </Heading>
          <ReadMore
            header='Hvis dere har en behandling men ikke et etterlevelsesdokument'
            className='mt-3'
          >
            <BodyLong>
              Da gjør dere dette: Opprette et etterlevelsesdokument. Legge til behandlingen fra
              Dokumentegenskaper i etterlevelsesdokumentet.
            </BodyLong>
          </ReadMore>
          <ReadMore
            header='Hvis dere har et etterlevelsesdokument men ikke en behandling'
            className='mt-3'
          >
            <BodyLong>
              Da gjør dere dette: Dersom dere behandler personopplysninger, må dere opprette en ny
              behandling. Legg så til behandlingen under Rediger dokumentegenskaper i
              etterlevelsesdokumentet. Dersom dere ikke behandler personopplysninger, er det ikke
              behov for å koble deres etterlevelsesdokument til Behandlingskatalogen.
            </BodyLong>
          </ReadMore>
          <ReadMore
            header='Hvis dere verken har en behandling eller et etterlevelsesdokument'
            className='mt-3'
          >
            <BodyLong>
              Da gjør dere dette: Opprette et etterlevelsesdokument. Dersom dere behandler
              personopplysninger, må dere opprette en ny behandling. Legg så til behandlingen under
              Rediger dokumentegenskaper i etterlevelsesdokumentet. Dersom dere ikke behandler
              personopplysninger, er det ikke behov for å koble deres etterlevelsesdokument til
              Behandlingskatalogen.
            </BodyLong>
          </ReadMore>
          <ReadMore header='Hvis dere skal gjennomføre en PVK' className='mt-3'>
            <BodyLong>
              Da må dere ha både et etterlevelsesdokument og en behandling. Det er mulig å
              dokumentere etterlevelse av personvernkravene først og så dokumentere PVK, men det er
              også mulig å gjøre begge deler i parallell i løsningen.
            </BodyLong>
          </ReadMore>
          <BodyLong className='mt-6'>
            På følgende sider kan du lese mer om hva som er formålet med hver løsning, og hvordan de
            kan brukes.
          </BodyLong>
        </div>
      </div>
    </PageLayout>
  )
}
