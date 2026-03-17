'use client'

import { PageLayout } from '@/components/others/scaffold/scaffold'
import { BodyLong, Heading, Link, List, ReadMore, Stepper } from '@navikt/ds-react'
import Image from 'next/image'
import { useState } from 'react'
import OmBehandlingskatalogenImage from './images/OmBehandlingskatalogenImage.png'

const HvordanBrukeBK = '/videos/HvordanBrukeBK.mov'

export const OmBehandlingskatalogen = () => {
  const [activeStep, setActiveStep] = useState(0)
  return (
    <PageLayout pageTitle='Om behandlingskatalogen' currentPage='Behandlingskatalogen'>
      <div className='flex gap-7 mt-10'>
        <div className='sticky top-4 h-full'>
          <div className='max-w-68.5'>
            <Stepper
              aria-labelledby='stepper-heading'
              activeStep={activeStep}
              onStepChange={setActiveStep}
            >
              <Stepper.Step href='#formaalet-med-behandlingskatalogen'>
                Formålet med Behandlingskatalogen
              </Stepper.Step>
              <Stepper.Step href='#hvordan-bruke-behandlingskatalogen'>
                Hvordan bruke Behandlingskatalogen
              </Stepper.Step>
              <Stepper.Step href='#ta-kontakt'>Ta kontakt</Stepper.Step>
            </Stepper>
          </div>
        </div>
        <div className='max-w-[75ch]'>
          <Heading size='large' level='2'>
            Om Behandlingskatalogen
          </Heading>
          <Image
            className='mr-2.5 mt-6 mb-12'
            src={OmBehandlingskatalogenImage}
            alt='Skjermbilde fra Behandlingskatalogens forside.'
            aria-hidden
            aria-label=''
          />
          <Heading size='medium' level='2' spacing id='formaalet-med-behandlingskatalogen'>
            Hva er formålet med Behandlingskatalogen
          </Heading>
          <BodyLong className='my-6'>
            Behandlingskatalogen er en oversikt over alle behandlinger av personopplysninger som
            skjer i Nav. Behandlingskatalogen er et godt hjelpemiddel når vi skal etterleve pliktene
            vi har etter personvernregelverket. Katalogen gir oss kontroll over behandlingene, og
            hjelper oss med å beskytte rettighetene til alle vi har opplysninger om.
          </BodyLong>
          <BodyLong>I Behandlingskatalogen har vi oversikt over blant annet:</BodyLong>
          <br />
          <List as='ul' className='mb-6'>
            <List.Item>alle behandlingsaktiviteter som vi gjør</List.Item>
            <List.Item>hvilket behandlingsgrunnlag som brukes</List.Item>
            <List.Item>formålet med behandlingen</List.Item>
            <List.Item>hvilke systemer personopplysningene behandles i</List.Item>
            <List.Item>om det benyttes databehandler</List.Item>
          </List>
          <BodyLong className='mb-6'>
            Avdelingene har ansvaret for at innholdet i katalogen er korrekt og oppdatert innenfor
            sine områder.
          </BodyLong>

          <Heading
            className='mt-6'
            size='medium'
            level='2'
            spacing
            id='hvordan-bruke-behandlingskatalogen'
          >
            Hvordan bruke Behandlingskatalogen
          </Heading>
          <BodyLong className='mt-6'>
            Seksjon for personvern og forvaltningsrett i Juridisk avdeling har laget en{' '}
            <Link href='https://navikt.github.io/naka/behandlingskatalog'>veilder</Link> til
            Behandlingskatalogen. Her finner dere blant annet{' '}
            <Link
              inlineText
              href='https://navikt.github.io/naka/behandlingskatalog#3utfylling-av-feltene-i-behandlingskatalogen'
            >
              hjelp til utfylling av de ulike feltene i Behandlingskatalogen.
            </Link>
          </BodyLong>

          <ReadMore
            header='Vis meg hvor i Behandlingskatalogen jeg finner lenken til veiledereren'
            className='mt-3 mb-6'
          >
            <video controls>
              <source src={HvordanBrukeBK} />
            </video>
          </ReadMore>

          <Heading size='medium' level='2' spacing id='ta-kontakt'>
            Ta kontakt
          </Heading>
          <BodyLong>
            Hvis dere har behov for juridisk rådgivning ved utfylling av Behandlingskatalogen, ta
            kontakt med Juridisk avdeling: nav.juridisk.avdeling@nav.no.
          </BodyLong>
          <BodyLong className='my-6'>
            Hvis dere finner feil i løsningen eller har forslag til forbedringer, ta kontakt med
            Team Datajegerne:
          </BodyLong>
          <List as='ul'>
            <List.Item>Bli med på #behandlingskatalogen på Slack </List.Item>
            <List.Item>Send mail til: teamdatajegerne@nav.no </List.Item>
          </List>
        </div>
      </div>
    </PageLayout>
  )
}
