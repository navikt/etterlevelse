import { Button } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent } from 'react'
import { EPvkDokumentStatus, IPvkDokument } from '../../../constants'

type TProps = {
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
}

export const LagreOgFortsettSenereButton: FunctionComponent<TProps> = ({
  setFieldValue,
  submitForm,
  initialStatus,
}) => {
  return (
    <Button
      type='button'
      variant='secondary'
      onClick={async () => {
        await setFieldValue('status', initialStatus)
        await submitForm()
      }}
    >
      Lagre og fortsett senere
    </Button>
  )
}
export default LagreOgFortsettSenereButton
