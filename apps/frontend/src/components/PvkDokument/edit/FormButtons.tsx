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
    <div className="flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-bg-default">
      <div className="w-full max-w-7xl py-4 px-4 border-t-2 z-2">
        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (activeStep === 1) {
                navigate('/dokumentasjon/' + etterlevelseDokumentasjonId)
              } else {
                if (submitForm) {
                  submitForm()
                }
                setActiveStep(activeStep - 1)
              }
            }}
          >
            {activeStep === 1 ? 'Tilbake til Temaoversikt' : 'Lagre og gå tilbake'}
          </Button>
          {activeStep !== 6 && (
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
              if (submitForm) {
                submitForm()
              }
              setActiveStep(activeStep + 1)
            }}
          >
            {activeStep === 6 ? 'Lagre' : 'Lagre og fortsett'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FormButtons
