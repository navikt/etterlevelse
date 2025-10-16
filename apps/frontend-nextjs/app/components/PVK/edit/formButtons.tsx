'use client'

import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  customButtons?: ReactNode
  submitForm?: (() => Promise<void>) & (() => Promise<any>)
}

export const FormButtons: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
  activeStep,
  setActiveStep,
  setSelectedStep,
  customButtons,
}) => {
  const router = useRouter()

  return (
    <div className='z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-white'>
      <div className='w-full max-w-7xl py-4 px-4 border-t-2 z-2'>
        <div className='flex w-full flex-row-reverse justify-evenly gap-2 items-end'>
          {customButtons}

          {activeStep !== 8 && (
            <Button
              icon={activeStep !== 8 && <ChevronRightIcon aria-hidden />}
              iconPosition='right'
              type='button'
              variant={'tertiary'}
              onClick={() => {
                if (activeStep !== 8) {
                  window.scrollTo(0, 0)
                  setActiveStep(activeStep + 1)
                  setSelectedStep(activeStep + 1)
                }
              }}
            >
              {activeStep === 1 && 'Fortsett til Behandlingens Livsløp'}
              {activeStep === 2 && 'Fortsett til Behandlingens art og omfang'}
              {activeStep === 3 && 'Fortsett til Tilhørende dokumentasjon'}
              {activeStep === 4 && 'Fortsett til Involvering av eksterne'}
              {activeStep === 5 && 'Fortsett til Identifisering av risikoscenarioer og tiltak'}
              {activeStep === 6 && 'Fortsett til Risikobildet etter tiltak'}
              {activeStep === 7 && 'Fortsett til Les og send inn'}
              {activeStep === 8 && 'Send til PVO'}
            </Button>
          )}

          <Button
            icon={<ChevronLeftIcon aria-hidden />}
            type='button'
            variant='tertiary'
            onClick={() => {
              if (activeStep === 1) {
                router.push(etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjonId))
              } else {
                window.scrollTo(0, 0)
                setActiveStep(activeStep - 1)
                setSelectedStep(activeStep - 1)
              }
            }}
          >
            {activeStep === 1 && 'Tilbake til Temaoversikt'}
            {activeStep === 2 && 'Tilbake til Oversikt og status'}
            {activeStep === 3 && 'Tilbake til Behandlingens livsløp'}
            {activeStep === 4 && 'Tilbake til Behandlingens art og omfang'}
            {activeStep === 5 && 'Tilbake til Tilhørende dokumentasjon'}
            {activeStep === 6 && 'Tilbake til Involvering av eksterne'}
            {activeStep === 7 && 'Tilbake til Identifisering av risikoscenarioer og tiltak'}
            {activeStep === 8 && 'Tilbake til Risikobildet etter tiltak'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormButtons
