import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'

interface IProps {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  submitForm?: (() => Promise<void>) & (() => Promise<any>)
}

export const FormButtons = (props: IProps) => {
  const { etterlevelseDokumentasjonId, activeStep, setActiveStep, setSelectedStep } = props
  const navigate = useNavigate()

  return (
    <div className="z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-bg-default">
      <div className="w-full max-w-7xl py-4 px-4 border-t-2 z-2">
        <div className="flex w-full gap-2">
          <Button
            icon={<ChevronLeftIcon aria-hidden />}
            type="button"
            variant="tertiary"
            onClick={() => {
              if (activeStep === 1) {
                navigate('/dokumentasjon/' + etterlevelseDokumentasjonId)
              } else {
                setActiveStep(activeStep - 1)
                setSelectedStep(activeStep - 1)
              }
            }}
          >
            {activeStep === 1
              ? 'Tilbake til Temaoversikt'
              : activeStep === 2
                ? 'Tilbake til Oversikt'
                : activeStep === 3
                  ? 'Tilbake til Art og omfang'
                  : activeStep === 4
                    ? 'Tilbake til Involvering av eksterne'
                    : activeStep === 5
                      ? 'Tilbake til Identifisering av risikoscenarioer'
                      : 'Tilbake til Risikobildet etter tiltak'}
          </Button>
          {activeStep !== 6 && (
            <Button
              icon={activeStep !== 6 && <ChevronRightIcon aria-hidden />}
              iconPosition="right"
              type="button"
              variant={'tertiary'}
              onClick={() => {
                if (activeStep !== 6) {
                  setActiveStep(activeStep + 1)
                  setSelectedStep(activeStep + 1)
                }
              }}
            >
              {activeStep === 1
                ? 'Fortsett til Art og omfang'
                : activeStep === 2
                  ? 'Fortsett til Involvering av eksterne'
                  : activeStep === 3
                    ? 'Fortsett til Identifisering av risikoscenarioer'
                    : activeStep === 4
                      ? 'Fortsett til Oppsummering av alle risikoscenarioer og tiltak'
                      : activeStep === 5
                        ? 'Fortsett til Les og send inn'
                        : 'Send til PVO'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormButtons
