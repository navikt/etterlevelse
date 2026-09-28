import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button, FormProgress, Stepper } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { FunctionComponent } from 'react'
import {
  EOverskrifterPersonvernerklaering,
  EPersonvernerklaeringId,
} from '@/components/omPersonvernerklaering/hovedinnhold/hovedinnholdPersonvernerklaering'

type TOmNavigeringProps = {
  router: AppRouterInstance
  forrigeLenke: string
  nesteLenke: string
}

const stepperPersonvernerklaering = [
  {
    id: EPersonvernerklaeringId.STEP_ONE,
    step: EOverskrifterPersonvernerklaering.STEPPER_HEADING,
  },
  {
    id: EPersonvernerklaeringId.STEP_TWO,
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVORDAN,
  },
  {
    id: 'behandling-personopplysninger-hvilke',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVILKE,
  },
  {
    id: 'behandling-personopplysninger-hvor-hentes',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_HENTES,
  },
  {
    id: 'behandling-personopplysninger-hvor-lagres',
    step: EOverskrifterPersonvernerklaering.BEHANDLING_PERSONOPPLYSNINGER_HVOR_LAGRES,
  },
  { id: 'innblikk-etterlevelse', step: EOverskrifterPersonvernerklaering.INNBLIKK_ETTERLEVELSE },
  { id: 'samtykke-maaling', step: EOverskrifterPersonvernerklaering.SAMTYKKE_MAALING },
  { id: 'samtykke-bruker', step: EOverskrifterPersonvernerklaering.SAMTYKKE_BRUKER },
  { id: 'mangler', step: EOverskrifterPersonvernerklaering.MANGLER },
]

export const OmNavigering: FunctionComponent<TOmNavigeringProps> = ({
  router,
  forrigeLenke,
  nesteLenke,
}) => (
  <div className='z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-white'>
    <div className='w-full max-w-7xl py-4 px-4 border-t-2 z-2'>
      <div className='flex w-full flex-row-reverse justify-evenly gap-2 items-end'>
        <Button
          icon={<ChevronRightIcon aria-hidden />}
          iconPosition='right'
          type='button'
          variant='tertiary'
          onClick={() => {
            router.push(forrigeLenke)
          }}
        >
          Fortsett til Om Digital PVK
        </Button>

        <Button
          icon={<ChevronLeftIcon aria-hidden />}
          type='button'
          variant='tertiary'
          onClick={() => {
            router.push(nesteLenke)
          }}
        >
          Tilbake til Oversikt over løsningene
        </Button>
      </div>
    </div>
  </div>
)

export const OmStepper = () => (
  <div className='sticky top-4 h-full hidden md:block'>
    <div className='max-w-68.5'>
      <Stepper
        aria-labelledby='stepper-heading'
        activeStep={activeStep}
        onStepChange={setActiveStep}
      >
        <Stepper.Step href='#stepper-heading'>
          Personvernerklæring for Støtte til etterlevelse
        </Stepper.Step>
        <Stepper.Step href='#behandling-personopplysninger-hvordan'>
          Hvordan behandler vi ansattes personopplysninger?
        </Stepper.Step>
        <Stepper.Step href='#behandling-personopplysninger-hvilke'>
          Temainndeling og temaoversikt
        </Stepper.Step>
        <Stepper.Step href='#behandling-personopplysninger-hvor-hentes'>
          Dette inneholder et etterlevelseskrav
        </Stepper.Step>
        <Stepper.Step href='#behandling-personopplysninger-hvor-lagres'>
          Hvordan dokumentere etterlevelse
        </Stepper.Step>
        <Stepper.Step href='#innblikk-etterlevelse'>Ta kontakt</Stepper.Step>
        <Stepper.Step href='#samtykke-om-maaling'>Ta kontakt</Stepper.Step>
        <Stepper.Step href='#samtykke-av-bruker'>Ta kontakt</Stepper.Step>
        <Stepper.Step href='#mangler'>Ta kontakt</Stepper.Step>
      </Stepper>
    </div>
  </div>
)

export const OmHiddenFormProgress = () => (
  <div className='md:hidden mb-6'>
    <FormProgress
      activeStep={activeStep + 1}
      totalSteps={6}
      onStepChange={(step) => setActiveStep(step - 1)}
    >
      <FormProgress.Step href='#stepper-heading'>
        Personvernerklæring for Støtte til etterlevelse
      </FormProgress.Step>
      <FormProgress.Step href='#behandling-personopplysninger-hvordan'>
        Hvordan behandler vi ansattes personopplysninger?
      </FormProgress.Step>
      <FormProgress.Step href='#behandling-personopplysninger-hvilke'>
        Temainndeling og temaoversikt
      </FormProgress.Step>
      <FormProgress.Step href='#behandling-personopplysninger-hvor-hentes'>
        Dette inneholder et etterlevelseskrav
      </FormProgress.Step>
      <FormProgress.Step href='#behandling-personopplysninger-hvor-lagres'>
        Hvordan dokumentere etterlevelse
      </FormProgress.Step>
      <FormProgress.Step href='#innblikk-etterlevelse'>Ta kontakt</FormProgress.Step>
      <FormProgress.Step href='#samtykke-om-maaling'>Ta kontakt</FormProgress.Step>
      <FormProgress.Step href='#samtykke-av-bruker'>Ta kontakt</FormProgress.Step>
      <FormProgress.Step href='#mangler'>Ta kontakt</FormProgress.Step>
    </FormProgress>
  </div>
)
