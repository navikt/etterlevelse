import { Button, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, Form, Formik } from 'formik'
import { TextAreaField } from '../../common/Inputs'

enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

export const PvoTilbakemeldingForm = () => {
  const submit = async (values: any) => {
    console.debug(values)
  }

  const onClose = async () => {
    console.debug('close')
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values) => {
        submit(values)
        onClose()
      }}
      initialValues={{}}
      validationSchema={{}}
    >
      {({ submitForm }) => (
        <Form>
          <div>
            <Field name="bidragsVurdering">
              {() => (
                <RadioGroup
                  legend="Vurdér om etterleverens bidrag er tilstrekkelig"
                  // onChange={handleChange}
                  description="Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen."
                >
                  <Radio value={EBidragVerdier.TILSTREKKELIG}>Ja, tilstrekkelig </Radio>
                  <Radio value={EBidragVerdier.TILSTREKKELIG_FORBEHOLDT}>
                    Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som
                    beskrives i fritekst under
                  </Radio>
                  <Radio value={EBidragVerdier.UTILSTREKKELIG}>
                    Utilstrekkelig, beskrives nærmere under
                  </Radio>
                </RadioGroup>
              )}
            </Field>
          </div>

          <div className="my-5">
            <TextAreaField
              noPlaceholder
              markdown
              height="15.625rem"
              name="internDiskusjon"
              label="Skriv intern PVO diskusjon her"
              caption="Denne teksten er privat for PVO og skal ikke deles med etterleveren"
            />
          </div>

          <div className="my-5">
            <TextAreaField
              noPlaceholder
              markdown
              height="15.625rem"
              name="tilbakemeldingTilEtterlevere"
              label="Skriv tilbakemelding til etterleveren"
              caption="Tilbakemeldingen blir ikke tilgjengelig for etterleveren før du velger å publisere
              den."
            />
          </div>

          <div className="mt-10 flex flex-row gap-2">
            <div>
              <Button size="small" type="button" onClick={submitForm}>
                Lagre
              </Button>
            </div>
            <div>
              <Button
                size="small"
                type="button"
                variant="secondary"
                onClick={() => {
                  onClose()
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default PvoTilbakemeldingForm
