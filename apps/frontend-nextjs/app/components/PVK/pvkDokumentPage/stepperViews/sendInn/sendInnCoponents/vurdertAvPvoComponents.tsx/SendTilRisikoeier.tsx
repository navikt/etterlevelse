import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { FieldProps } from 'formik'
import { FunctionComponent } from 'react'
import LagreOgFortsettSenereButton from '../lagreOgFortsettSenereButton'

type TProps = {
  fieldProps: FieldProps<any, any>
}

export const SendTilRisikoeier: FunctionComponent<TProps> = ({ fieldProps }) => {
  return (
    <div>
      <Heading size='small' level='3' className='mb-5 mt-8'>
        Send til risikoeier for godkjenning
      </Heading>

      <TextAreaField
        height='150px'
        noPlaceholder
        label='Oppsummer for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
        name='merknadTilRisikoeier'
        markdown
      />

      <Alert variant='info' inline className='my-8'>
        Når dere sender inn PVK, vil hele dokumentasjonen, inkludert etterlevelsesdokumentasjon ved
        PVK-relaterte krav, låses og ikke kunne redigeres. Dette innholdet forbli låst enn så lenge
        saken ligger hos Personvernombudet.
      </Alert>

      <div className='mt-5 flex justify-end gap-2 items-center'>
        <LagreOgFortsettSenereButton
          setFieldValue={fieldProps.form.setFieldValue}
          submitForm={fieldProps.form.submitForm}
          initialStatus={fieldProps.form.initialValues.status}
          resetForm={() => fieldProps.form.resetForm({ values: fieldProps.form.values })}
        />

        <Button
          type='button'
          onClick={async () => {
            await fieldProps.form.setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
            await fieldProps.form.submitForm()
          }}
        >
          Lagre og send til risikoeier
        </Button>
      </div>
    </div>
  )
}

export default SendTilRisikoeier
