import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button, FormProgress, Stepper } from '@navikt/ds-react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { FunctionComponent } from 'react'

type TOmNavigeringProps = {
  router: AppRouterInstance
  forrigeLenke: string
  nesteLenke: string
}

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
        <Stepper.Step href='#formaalet-med-stotte-til-etterlevelse'>
          Hva er formålet med Støtte til etterlevelse?
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
)

export const OmHiddenFormProgress = () => (
  <div className='md:hidden mb-6'>
    <FormProgress
      activeStep={activeStep + 1}
      totalSteps={6}
      onStepChange={(step) => setActiveStep(step - 1)}
    >
      <FormProgress.Step href='#formaalet-med-stotte-til-etterlevelse'>
        Hva er formålet med Støtte til etterlevelse?
      </FormProgress.Step>
      <FormProgress.Step href='#forstesiden-i-stotte-til-etterlevelse'>
        Førstesiden i Støtte til etterlevelse
      </FormProgress.Step>
      <FormProgress.Step href='#temainndeling-og-temaoversikt'>
        Temainndeling og temaoversikt
      </FormProgress.Step>
      <FormProgress.Step href='#dette-inneholder-et-etterlevelseskrav'>
        Dette inneholder et etterlevelseskrav
      </FormProgress.Step>
      <FormProgress.Step href='#hvordan-dokumentere-etterlevelse'>
        Hvordan dokumentere etterlevelse
      </FormProgress.Step>
      <FormProgress.Step href='#ta-kontakt'>Ta kontakt</FormProgress.Step>
    </FormProgress>
  </div>
)
