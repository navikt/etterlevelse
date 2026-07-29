import { ErrorMessage as AkselErrorMessage } from '@navikt/ds-react'
import { ErrorMessage } from 'formik'
import { FunctionComponent } from 'react'

type TProps = {
  fieldName: string
  akselStyling?: boolean
}

export const FormError: FunctionComponent<TProps> = ({ fieldName, akselStyling }) => (
  <>
    {!akselStyling && <ErrorMessage name={fieldName}>{(message: string) => message}</ErrorMessage>}

    {akselStyling && (
      <div
        className='aksel-form-field__error pt-2'
        id='textField-error-rm'
        aria-relevant='additions removals'
        aria-live='polite'
      >
        <ErrorMessage name={fieldName}>
          {(message: string) => <AkselErrorMessage showIcon>{message}</AkselErrorMessage>}
        </ErrorMessage>
      </div>
    )}
  </>
)

export const Error = ({ message, noBulletPoint }: { message: string; noBulletPoint?: boolean }) => (
  <div
    className='navds-form-field__error pt-2'
    id='textField-error-rm'
    aria-relevant='additions removals'
    aria-live='polite'
  >
    <p className='navds-error-message navds-label flex gap-2'>
      {!noBulletPoint && <span>•</span>}
      {message}
    </p>
  </div>
)
