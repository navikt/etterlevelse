import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button } from '@navikt/ds-react'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'

type TPropsAvbrytKnapp = {
  isSubmitting: boolean
  setIsOpen: (open: boolean) => void
}

export const AvbrytKnapp: FunctionComponent<TPropsAvbrytKnapp> = ({ isSubmitting, setIsOpen }) => (
  <Button type='button' disabled={isSubmitting} variant='tertiary' onClick={() => setIsOpen(false)}>
    Avbryt
  </Button>
)

type TProps = {
  isSubmitting: boolean
  setSubmitClick: Dispatch<SetStateAction<boolean>>
  submit: (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => Promise<void>
  values: TEtterlevelseDokumentasjonQL
}

export const LagreTilSenereKnapp: FunctionComponent<TProps> = ({
  isSubmitting,
  setSubmitClick,
  submit,
  values,
}) => (
  <Button
    type='button'
    variant='secondary'
    disabled={isSubmitting}
    onClick={async () => {
      setSubmitClick((prev: boolean) => !prev)
      await submit(values)
    }}
  >
    Lagre og fortsett senere
  </Button>
)
