import { ErrorMessage } from 'formik'

interface IPropsError {
  fieldName: string
  akselStyling?: boolean
}

export const FormError = ({ fieldName, akselStyling }: IPropsError) => (
  <>
    {!akselStyling && <ErrorMessage name={fieldName}>{(msg: string) => msg}</ErrorMessage>}

    {akselStyling && (
      <div
        className="navds-form-field__error pt-2"
        id="textField-error-rm"
        aria-relevant="additions removals"
        aria-live="polite"
      >
        <ErrorMessage name={fieldName}>
          {(msg: string) => (
            <p className="navds-error-message navds-label flex gap-2">
              <span>•</span>
              {msg}
            </p>
          )}
        </ErrorMessage>
      </div>
    )}
  </>
)

export const Error = ({ message }: { message: string }) => (
  <div
    className="navds-form-field__error pt-2"
    id="textField-error-rm"
    aria-relevant="additions removals"
    aria-live="polite"
  >
    <p className="navds-error-message navds-label flex gap-2">
      <span>•</span>
      {message}
    </p>
  </div>
)
