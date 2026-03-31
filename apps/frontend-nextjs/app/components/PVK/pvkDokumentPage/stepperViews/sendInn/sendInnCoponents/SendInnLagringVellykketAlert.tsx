import { LocalAlert } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  setSavedSuccessful: (state: boolean) => void
  customText?: string
}

export const SendInnLagringVellykketAlert: FunctionComponent<TProps> = ({
  setSavedSuccessful,
  customText,
}) => (
  <LocalAlert status='success'>
    <LocalAlert.Header>
      <LocalAlert.Title> {customText ? customText : 'Lagring vellykket'}</LocalAlert.Title>
      <LocalAlert.CloseButton onClick={() => setSavedSuccessful(false)} />
    </LocalAlert.Header>
  </LocalAlert>
)
