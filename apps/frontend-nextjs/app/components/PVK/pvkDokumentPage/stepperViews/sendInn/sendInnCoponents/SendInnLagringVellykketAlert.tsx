import { LocalAlert } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  setSavedSuccessful: (state: boolean) => void
}

export const SendInnLagringVellykketAlert: FunctionComponent<TProps> = ({ setSavedSuccessful }) => (
  <LocalAlert status='success'>
    <LocalAlert.Header>
      <LocalAlert.Title>Lagring vellykket</LocalAlert.Title>
      <LocalAlert.CloseButton onClick={() => setSavedSuccessful(false)} />
    </LocalAlert.Header>
  </LocalAlert>
)
