import { Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent } from 'react'
import { ITilhorendeDokumentasjonTilbakemelding } from '../../../../constants'
import { TextAreaField } from '../../../common/Inputs'
import { EBidragVerdier } from '../PvoTilbakemeldingForm'

type TProps = {
  heading: string
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void | FormikErrors<ITilhorendeDokumentasjonTilbakemelding>>
  radioFieldLabel: string
  radioFieldName:
    | 'behandlingskatalogDokumentasjonTilstrekkelig'
    | 'kravDokumentasjonTilstrekkelig'
    | 'risikovurderingTilstrekkelig'
  textAreaFieldName:
    | 'behandlingskatalogDokumentasjonTilbakemelding'
    | 'kravDokumentasjonTilbakemelding'
    | 'risikovurderingTilbakemelding'
}

export const TilbakemeldingField: FunctionComponent<TProps> = ({
  heading,
  setFieldValue,
  radioFieldName,
  radioFieldLabel,
  textAreaFieldName,
}) => {
  return (
    <div>
      <Heading level='3' size='xsmall' className='my-5'>
        {heading}
      </Heading>

      <Field name={radioFieldName}>
        {(fieldProps: FieldProps) => (
          <RadioGroup
            legend={radioFieldLabel}
            value={fieldProps.field.value}
            onChange={(value) => {
              fieldProps.form.setFieldValue(radioFieldName, value)
            }}
          >
            <Radio value={EBidragVerdier.TILSTREKKELIG}>Ja, tilstrekkelig </Radio>
            <Radio value={EBidragVerdier.TILSTREKKELIG_FORBEHOLDT}>
              Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som beskrives
              i fritekst under
            </Radio>
            <Radio value={EBidragVerdier.UTILSTREKKELIG}>
              Utilstrekkelig, beskrives nærmere under
            </Radio>
          </RadioGroup>
        )}
      </Field>
      <div className='my-2'>
        <Button
          size='small'
          type='button'
          variant='secondary'
          onClick={async () => {
            await setFieldValue(radioFieldName, '')
          }}
        >
          Nullstill valg
        </Button>
      </div>

      <div className='my-5'>
        <TextAreaField
          noPlaceholder
          markdown
          height='15.625rem'
          name={textAreaFieldName}
          label='Skriv tilbakemelding til etterleveren'
        />
      </div>
    </div>
  )
}
export default TilbakemeldingField
