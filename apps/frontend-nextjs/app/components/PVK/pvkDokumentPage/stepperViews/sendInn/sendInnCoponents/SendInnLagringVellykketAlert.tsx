import { Alert } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  setSavedSuccessful: (state: boolean) => void
}

export const SendInnLagringVellykketAlert: FunctionComponent<TProps> = ({ setSavedSuccessful }) => (
  <Alert
    variant='success'
    closeButton
    onClose={() => {
      setSavedSuccessful(false)
    }}
  >
    Lagring vellykket
  </Alert>
)
