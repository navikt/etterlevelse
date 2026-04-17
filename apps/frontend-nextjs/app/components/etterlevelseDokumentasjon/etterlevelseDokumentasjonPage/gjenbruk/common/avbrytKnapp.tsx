import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  isSubmitting: boolean
  setIsOpen: (open: boolean) => void
}

export const AvbrytKnapp: FunctionComponent<TProps> = ({ isSubmitting, setIsOpen }) => (
  <Button type='button' disabled={isSubmitting} variant='tertiary' onClick={() => setIsOpen(false)}>
    Avbryt
  </Button>
)
