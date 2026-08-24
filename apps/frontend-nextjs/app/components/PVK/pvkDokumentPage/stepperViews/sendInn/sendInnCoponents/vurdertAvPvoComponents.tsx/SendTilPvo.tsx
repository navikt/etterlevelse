import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Alert, Button, ErrorSummary, Heading } from '@navikt/ds-react'
import { FieldProps } from 'formik'
import { FunctionComponent, ReactNode } from 'react'
import LagreOgFortsettSenereButton from '../lagreOgFortsettSenereButton'

type TProps = {
  relevantIndex: number
  pvkDokument: IPvkDokument
  fieldProps: FieldProps<any, any>
  errorComponent: ReactNode
}

export const SendTilPvo: FunctionComponent<TProps> = ({
  relevantIndex,
  pvkDokument,
  fieldProps,
  errorComponent,
}) => {
  const merknadTilPvoError = fieldProps.form.getFieldMeta(
    `meldingerTilPvo[${relevantIndex}].merknadTilPvo`
  ).error
  const endringsNotatError = fieldProps.form.getFieldMeta(
    `meldingerTilPvo[${relevantIndex}].endringsNotat`
  ).error

  return (
    <div>
      <Heading size='small' level='3' className='mb-5 mt-8'>
        Send til PVO for ny vurdering
      </Heading>

      <div className='mt-8 mb-3'>
        <TextAreaField
          height='150px'
          noPlaceholder
          label='Forklar hvorfor dere ønsker å sende inn til ny vurdering'
          name={`meldingerTilPvo[${relevantIndex}].merknadTilPvo`}
          markdown
        />
      </div>
      <div className='mt-8 mb-3'>
        <TextAreaField
          height='150px'
          noPlaceholder
          label='Oppsummer hvilke endringer som er gjort siden siste tilbakemelding fra PVO.'
          caption='PVO vil kunne se hvilket innhold som er endret siden sist, inkludert nye risikoscenarioer og tiltak.'
          name={`meldingerTilPvo[${relevantIndex}].endringsNotat`}
          markdown
        />

        <Alert variant='info' inline className='my-8'>
          Når dere sender inn PVK, vil hele dokumentasjonen, inkludert etterlevelsesdokumentasjon
          ved PVK-relaterte krav, låses og ikke kunne redigeres. Dette innholdet forbli låst enn så
          lenge saken ligger hos Personvernombudet.
        </Alert>

        {(merknadTilPvoError || endringsNotatError) && (
          <ErrorSummary heading='Du må rette disse feilene før du kan fortsette' className='my-8'>
            {merknadTilPvoError && (
              <ErrorSummary.Item href={`#meldingerTilPvo[${relevantIndex}].merknadTilPvo`}>
                Forklar hvorfor dere ønsker å sende inn til ny vurdering må fylles ut.
              </ErrorSummary.Item>
            )}
            {endringsNotatError && (
              <ErrorSummary.Item href={`#meldingerTilPvo[${relevantIndex}].endringsNotat`}>
                Beskriv hvilke endringer som er gjort.
              </ErrorSummary.Item>
            )}
          </ErrorSummary>
        )}

        {errorComponent}

        <div className='mt-5 flex justify-end gap-2 items-center'>
          <LagreOgFortsettSenereButton
            setFieldValue={fieldProps.form.setFieldValue}
            submitForm={fieldProps.form.submitForm}
            initialStatus={fieldProps.form.initialValues.status}
            resetForm={() => fieldProps.form.resetForm({ values: fieldProps.form.values })}
          />
          <Button
            type='button'
            variant='primary'
            onClick={async () => {
              if (fieldProps.form.values.meldingerTilPvo[relevantIndex].merknadTilPvo === '') {
                fieldProps.form.setFieldError(
                  `meldingerTilPvo[${relevantIndex}].merknadTilPvo`,
                  'Forklar hvorfor dere ønsker å sende inn til ny vurdering må fylles ut.'
                )
              }

              if (fieldProps.form.values.meldingerTilPvo[relevantIndex].endringsNotat === '') {
                fieldProps.form.setFieldError(
                  `meldingerTilPvo[${relevantIndex}].endringsNotat`,
                  'Beskriv hvilke endringer som er gjort.'
                )
              } else if (
                fieldProps.form.values.meldingerTilPvo[relevantIndex].merknadTilPvo !== '' &&
                fieldProps.form.values.meldingerTilPvo[relevantIndex].endringsNotat !== ''
              ) {
                await fieldProps.form.setFieldValue(
                  'status',
                  EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING
                )
                await fieldProps.form.setFieldValue(
                  'antallInnsendingTilPvo',
                  pvkDokument.antallInnsendingTilPvo + 1
                )
                await fieldProps.form.submitForm()
              }
            }}
          >
            Lagre og send til PVO
          </Button>
        </div>
      </div>
    </div>
  )
}
export default SendTilPvo
