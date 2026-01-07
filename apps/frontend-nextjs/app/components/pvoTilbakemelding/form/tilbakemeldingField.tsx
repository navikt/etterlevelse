import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { ITilhorendeDokumentasjonTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent } from 'react'
import { EBidragVerdier } from './pvoTilbakemeldingForm'

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
  internDiskosjonFieldName:
    | 'behandlingsInternDiskusjon'
    | 'kravInternDiskusjon'
    | 'risikovurderingInternDiskusjon'
}

export const TilbakemeldingField: FunctionComponent<TProps> = ({
  heading,
  setFieldValue,
  radioFieldName,
  radioFieldLabel,
  textAreaFieldName,
  internDiskosjonFieldName,
}) => {
  return (
    <div>
      <Heading level='2' size='small' className='my-5'>
        {heading}
      </Heading>

      <div className='my-5'>
        <TextAreaField
          noPlaceholder
          markdown
          height='15.625rem'
          name={internDiskosjonFieldName}
          label='Skriv eventuelt interne PVO-notater her'
          caption='Denne teksten er privat for PVO og skal ikke deles med etterleveren'
          withHighlight={true}
          withUnderline={true}
        />
      </div>

      <Heading level='2' size='small' className='my-5'>
        Gi tilbakemelding
      </Heading>

      <Field name={radioFieldName}>
        {(fieldProps: FieldProps) => (
          <RadioGroup
            legend={radioFieldLabel}
            description='Denne vurderingen blir ikke tilgjengelig
          for etterleveren før dere har ferdigstilt selve vurderingen.'
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
          withUnderline={true}
        />
      </div>
    </div>
  )
}
export default TilbakemeldingField
