import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface IProps {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  customButtons?: ReactNode
  submitForm?: (() => Promise<void>) & (() => Promise<any>)
}

export const FormButtons = (props: IProps) => {
  const { etterlevelseDokumentasjonId, activeStep, setActiveStep, setSelectedStep, customButtons } =
    props
  const navigate = useNavigate()

  return (
    <div className='z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-white'>
      <div className='w-full max-w-7xl py-4 px-4 border-t-2 z-2'>
        <div className='flex w-full gap-2 items-end'>
          <Button
            icon={<ChevronLeftIcon aria-hidden />}
            type='button'
            variant='tertiary'
            onClick={() => {
              if (activeStep === 1) {
                navigate('/dokumentasjon/' + etterlevelseDokumentasjonId)
              } else {
                window.scrollTo(0, 0)
                setActiveStep(activeStep - 1)
                setSelectedStep(activeStep - 1)
              }
            }}
          >
            {activeStep === 1 && 'Tilbake til Temaoversikt'}
            {activeStep === 2 && 'Tilbake til Oversikt'}
            {activeStep === 3 && 'Tilbake til Livsløp'}
            {activeStep === 4 && 'Tilbake til Art og omfang'}
            {activeStep === 5 && 'Tilbake til Involvering av eksterne'}
            {activeStep === 6 && 'Tilbake til Identifisering av risikoscenarioer'}
            {activeStep === 7 && 'Tilbake til Risikobildet etter tiltak'}
          </Button>
          {activeStep !== 7 && (
            <Button
              icon={activeStep !== 7 && <ChevronRightIcon aria-hidden />}
              iconPosition='right'
              type='button'
              variant={'tertiary'}
              onClick={() => {
                if (activeStep !== 7) {
                  window.scrollTo(0, 0)
                  setActiveStep(activeStep + 1)
                  setSelectedStep(activeStep + 1)
                }
              }}
            >
              {activeStep === 1 && 'Fortsett til Behandlingens Livsløp'}
              {activeStep === 2 && 'Fortsett til Art og omfang'}
              {activeStep === 3 && 'Fortsett til Involvering av eksterne'}
              {activeStep === 4 && 'Fortsett til Identifisering av risikoscenarioer'}
              {activeStep === 5 && 'Fortsett til Oppsummering av alle risikoscenarioer og tiltak'}
              {activeStep === 6 && 'Fortsett til Les og send inn'}
              {activeStep === 7 && 'Send til PVO'}
            </Button>
          )}

          {customButtons}
        </div>
      </div>
    </div>
  )
}

export default FormButtons
