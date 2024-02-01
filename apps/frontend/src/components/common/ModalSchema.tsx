import { ExclamationmarkIcon } from '@navikt/aksel-icons'
import { Label, Tooltip } from '@navikt/ds-react'
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

interface IPropsModalLabel {
  label?: any
  tooltip?: string
  fullwidth?: boolean
}

export const ModalLabel = ({ label, tooltip, fullwidth }: IPropsModalLabel) => (
  <div className={`self-center pr-4 ${fullwidth ? 'w-full' : 'w-1/4'}`}>
    {tooltip ? (
      <Tooltip content={tooltip}>
        <Label className="flex w-full justify-center">
          <div className="flex">
            <div>{label}</div>
            <div>
              <ExclamationmarkIcon area-label="" aria-hidden className="ml-2 self-center" />
            </div>
          </div>
        </Label>
      </Tooltip>
    ) : (
      <Label>{label}</Label>
    )}
  </div>
)
