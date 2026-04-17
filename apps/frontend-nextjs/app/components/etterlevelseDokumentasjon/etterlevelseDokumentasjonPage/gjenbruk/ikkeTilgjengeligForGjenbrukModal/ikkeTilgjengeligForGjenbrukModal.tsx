import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button, Modal } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { BeskrivelseAvGjenbruk } from '../beskrivelseAvGjenbruk/beskrivelseAvGjenbruk'
import { AvbrytKnapp } from '../common/avbrytKnapp'
import { GjenbrukFeilmelding } from '../feilmelding/feilmelding'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  values: TEtterlevelseDokumentasjonQL
  setIsOpen: (open: boolean) => void
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<TEtterlevelseDokumentasjonQL>>
  isSubmitting: boolean
  hasMissingRequiredField: boolean
  setSubmitClick: Dispatch<SetStateAction<boolean>>
  submitForm: (() => Promise<void>) & (() => Promise<any>)
  submit: (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => Promise<void>
}

export const IkkeTilgjengeligForGjenbrukModal: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  values,
  setIsOpen,
  setFieldValue,
  isSubmitting,
  hasMissingRequiredField,
  setSubmitClick,
  submitForm,
  submit,
}) => (
  <>
    <GjenbrukFeilmelding etterlevelseDokumentasjon={etterlevelseDokumentasjon} values={values} />

    <Modal.Body>
      <BeskrivelseAvGjenbruk />
    </Modal.Body>
    <Modal.Footer>
      <Button
        type='submit'
        variant='primary'
        disabled={isSubmitting || hasMissingRequiredField}
        onClick={async () => {
          if (hasMissingRequiredField) return
          setSubmitClick((prev) => !prev)
          await setFieldValue('tilgjengeligForGjenbruk', true)
          await submitForm()
        }}
      >
        Slå på gjenbruk
      </Button>

      <Button
        type='button'
        variant='secondary'
        disabled={isSubmitting}
        onClick={async () => {
          setSubmitClick((prev) => !prev)
          await submit(values)
        }}
      >
        Lagre til senere
      </Button>

      <AvbrytKnapp isSubmitting={isSubmitting} setIsOpen={setIsOpen} />
    </Modal.Footer>
  </>
)
