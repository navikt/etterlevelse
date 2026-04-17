import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Button, InlineMessage, Modal } from '@navikt/ds-react'
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
  setSubmitClick: Dispatch<SetStateAction<boolean>>
  submitForm: (() => Promise<void>) & (() => Promise<any>)
  initialValues: TEtterlevelseDokumentasjonQL
}

export const TilgjengeligForGjenbrukModal: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  values,
  setIsOpen,
  setFieldValue,
  isSubmitting,
  setSubmitClick,
  submitForm,
  initialValues,
}) => (
  <>
    <GjenbrukFeilmelding etterlevelseDokumentasjon={etterlevelseDokumentasjon} values={values} />

    <Modal.Body>
      <BeskrivelseAvGjenbruk />

      <InlineMessage status='info' className='mt-5'>
        Det er alltid mulig å slå av gjenbruk slik at muligheten ikke vises lenger. Veiledning som
        dere har skrevet, vil fortsatt synes for dere og de som allerede gjenbruker dokumentet.
        Etter hvert kan dere velge om dere vil slá pả gjenbruk pả nytt.
      </InlineMessage>
    </Modal.Body>
    <Modal.Footer>
      <Button
        type='submit'
        variant='primary'
        disabled={isSubmitting}
        onClick={async () => {
          setSubmitClick((prev) => !prev)
          await setFieldValue('tilgjengeligForGjenbruk', true)
          await submitForm()
        }}
      >
        Lagre endringene
      </Button>

      {initialValues.tilgjengeligForGjenbruk && initialValues.gjenbrukBeskrivelse.length > 0 && (
        <Button
          type='button'
          variant='secondary'
          disabled={isSubmitting}
          onClick={async () => {
            setSubmitClick((prev) => !prev)
            await setFieldValue('tilgjengeligForGjenbruk', false)
            await submitForm()
          }}
        >
          Slå av gjenbruk
        </Button>
      )}

      <AvbrytKnapp isSubmitting={isSubmitting} setIsOpen={setIsOpen} />
    </Modal.Footer>
  </>
)
