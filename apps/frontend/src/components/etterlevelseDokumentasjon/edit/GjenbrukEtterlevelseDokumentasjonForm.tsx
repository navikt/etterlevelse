import { Button, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import {
  etterlevelseDokumentasjonSchema,
  etterlevelseDokumentasjonWithRelationMapToFormVal,
} from '../../../api/EtterlevelseDokumentasjonApi'
import {
  ERelationType,
  IEtterlevelseDokumentasjonWithRelation,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { FieldWrapper } from '../../common/Inputs'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const GjenbrukEtterlevelseDokumentasjonForm = (props: IProps) => {
  const { etterlevelseDokumentasjon } = props

  const submit = async (
    etterlevelseDokumentasjonWithRelation: IEtterlevelseDokumentasjonWithRelation
  ) => {
    console.debug(etterlevelseDokumentasjonWithRelation)
  }

  return (
    <Formik
      initialValues={etterlevelseDokumentasjonWithRelationMapToFormVal({
        irrelevansFor: etterlevelseDokumentasjon.irrelevansFor,
        prioritertKravNummer: etterlevelseDokumentasjon.prioritertKravNummer,
        behandlinger: etterlevelseDokumentasjon.behandlinger,
        behandlingIds: etterlevelseDokumentasjon.behandlingIds,
        behandlerPersonopplysninger: etterlevelseDokumentasjon.behandlerPersonopplysninger,
      })}
      onSubmit={submit}
      validationSchema={etterlevelseDokumentasjonSchema()}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ submitForm }) => (
        <Form>
          <FieldWrapper>
            <Field name="relationType">
              {(fp: FieldProps) => (
                <RadioGroup
                  legend="Hvordan ønsker du å gjenbruke dette dokumentet?"
                  onChange={(value) => fp.form.setFieldValue('relationType', value)}
                >
                  <Radio value={ERelationType.ARVER}>
                    Beholde relasjonen, og arve endringer på svar etter hvert som de kommer
                  </Radio>
                  <Radio value={ERelationType.BYGGER}>
                    Lage en engangskopi som uavhengig dokument
                  </Radio>
                </RadioGroup>
              )}
            </Field>
          </FieldWrapper>

          <Button type="button" onClick={submitForm}>
            submit
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default GjenbrukEtterlevelseDokumentasjonForm
