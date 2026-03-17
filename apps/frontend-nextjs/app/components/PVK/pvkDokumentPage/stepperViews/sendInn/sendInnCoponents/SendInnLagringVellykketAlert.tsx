import { Alert } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  setSavedSuccessful: (state: boolean) => void
  customText?: string
}

export const SendInnLagringVellykketAlert: FunctionComponent<TProps> = ({
  setSavedSuccessful,
  customText,
}) => (
  <Alert
    variant='success'
    closeButton
    onClose={() => {
      setSavedSuccessful(false)
    }}
  >
    {customText ? customText : 'Lagring vellykket'}
  </Alert>
)
