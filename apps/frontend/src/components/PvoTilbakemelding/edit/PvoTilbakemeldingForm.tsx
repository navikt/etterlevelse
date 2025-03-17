import { BodyShort, Button, Radio, RadioGroup } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Field, FieldProps, Form, Formik } from 'formik'
import moment from 'moment'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../../api/PvoApi'
import { IPvoTilbakemelding, ITilbakemeldingsinnhold } from '../../../constants'
import { user } from '../../../services/User'
import { TextAreaField } from '../../common/Inputs'

enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

interface IProps {
  pvkDokumentId: string
  fieldName: 'behandlingensArtOgOmfang' | 'innvolveringAvEksterne' | 'risikoscenarioEtterTiltakk'
  initialValue: ITilbakemeldingsinnhold
}

export const PvoTilbakemeldingForm = (props: IProps) => {
  const { fieldName, pvkDokumentId, initialValue } = props

  const submit = async (tilbakemeldingsInnhold: ITilbakemeldingsinnhold) => {
    const mutatedTilbakemeldingsInnhold: ITilbakemeldingsinnhold = {
      ...tilbakemeldingsInnhold,
      sistRedigertAv: user.getIdent() + ' - ' + user.getName(),
      sistRedigertDato: new Date().toISOString(),
    }

    await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
      .then(async (response) => {
        if (response) {
          const updatedValues: IPvoTilbakemelding = {
            ...response,
            behandlingensArtOgOmfang:
              fieldName === 'behandlingensArtOgOmfang'
                ? mutatedTilbakemeldingsInnhold
                : response.behandlingensArtOgOmfang,
            innvolveringAvEksterne:
              fieldName === 'innvolveringAvEksterne'
                ? mutatedTilbakemeldingsInnhold
                : response.innvolveringAvEksterne,
            risikoscenarioEtterTiltakk:
              fieldName === 'risikoscenarioEtterTiltakk'
                ? mutatedTilbakemeldingsInnhold
                : response.risikoscenarioEtterTiltakk,
          }
          await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
        }
      })
      .catch(async (error: AxiosError) => {
        if (error.status === 404) {
          const createValue = mapPvoTilbakemeldingToFormValue({
            pvkDokumentId: pvkDokumentId,
            behandlingensArtOgOmfang:
              fieldName === 'behandlingensArtOgOmfang' ? mutatedTilbakemeldingsInnhold : undefined,
            innvolveringAvEksterne:
              fieldName === 'innvolveringAvEksterne' ? mutatedTilbakemeldingsInnhold : undefined,
            risikoscenarioEtterTiltakk:
              fieldName === 'risikoscenarioEtterTiltakk'
                ? mutatedTilbakemeldingsInnhold
                : undefined,
          })
          await createPvoTilbakemelding(createValue).then(() => window.location.reload())
        } else {
          console.debug(error)
        }
      })
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values) => {
        submit(values)
      }}
      initialValues={initialValue}
    >
      {({ submitForm }) => (
        <Form>
          <div>
            {initialValue.sistRedigertAv && initialValue.sistRedigertDato && (
              <BodyShort size="small">
                Sist endret: {moment(initialValue.sistRedigertDato).format('ll')} av{' '}
                {initialValue.sistRedigertAv.split('-')[1]}
              </BodyShort>
            )}

            <Field name="bidragsVurdering">
              {(fieldProps: FieldProps) => (
                <RadioGroup
                  legend="Vurdér om etterleverens bidrag er tilstrekkelig"
                  value={fieldProps.field.value}
                  onChange={(value) => {
                    fieldProps.form.setFieldValue('bidragsVurdering', value)
                  }}
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
                  window.location.reload()
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
