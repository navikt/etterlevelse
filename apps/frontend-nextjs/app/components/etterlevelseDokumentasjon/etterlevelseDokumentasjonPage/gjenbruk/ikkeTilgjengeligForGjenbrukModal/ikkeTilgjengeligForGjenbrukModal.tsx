import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button, Modal } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { BeskrivelseAvGjenbruk } from '../beskrivelseAvGjenbruk/beskrivelseAvGjenbruk'
import { AvbrytKnapp, LagreTilSenereKnapp } from '../common/knapper'
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
          setSubmitClick((prev) => !prev)
          await setFieldValue('tilgjengeligForGjenbruk', true)
          await submitForm()
        }}
      >
        Slå på gjenbruk
      </Button>

      <LagreTilSenereKnapp
        isSubmitting={isSubmitting}
        setSubmitClick={setSubmitClick}
        submit={submit}
        values={values}
      />

      <AvbrytKnapp isSubmitting={isSubmitting} setIsOpen={setIsOpen} />
    </Modal.Footer>
  </>
)
