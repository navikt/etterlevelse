import { Button } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'

interface IProps {
  etterlevelseDokumentasjonId: string
  activeStep: number
  setActiveStep: (step: number) => void
  submitForm?: (() => Promise<void>) & (() => Promise<any>)
}

export const FormButtons = (props: IProps) => {
  const { etterlevelseDokumentasjonId, activeStep, setActiveStep, submitForm } = props
  const navigate = useNavigate()

  return (
    <div className="z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-bg-default">
      <div className="w-full max-w-7xl py-4 px-4 border-t-2 z-2">
        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (activeStep === 1) {
                navigate('/dokumentasjon/' + etterlevelseDokumentasjonId)
              } else {
                if ((activeStep === 2 || activeStep === 3) && submitForm) {
                  submitForm()
                }
                setActiveStep(activeStep - 1)
              }
            }}
          >
            {activeStep === 1
              ? 'Tilbake til Temaoversikt'
              : activeStep === 2 || activeStep === 3
                ? 'Lagre og gå tilbake'
                : 'Tilbake'}
          </Button>
          {(activeStep === 2 || activeStep === 3) && (
            <Button
              type="button"
              onClick={() => {
                if (submitForm) {
                  submitForm()
                }
              }}
            >
              Lagre
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              if ((activeStep === 2 || activeStep === 3) && submitForm) {
                submitForm()
              }
              setActiveStep(activeStep + 1)
            }}
          >
            {activeStep === 6
              ? 'Send Inn'
              : activeStep === 2 || activeStep === 3
                ? 'Lagre og fortsett'
                : 'Fortsett'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormButtons
