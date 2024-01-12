import { ExclamationmarkIcon } from '@navikt/aksel-icons'
import { Alert, Label, Tooltip } from '@navikt/ds-react'
import { ErrorMessage } from 'formik'

export const Error = (props: { fieldName: string; fullWidth?: boolean }) => (
  <ErrorMessage name={props.fieldName}>
    {(msg) => (
      <div className="flex w-full mt-1">
        {!props.fullWidth && <ModalLabel />}
        <div className="w-full">
          <Alert className="w-auto" variant="error">
            {msg}
          </Alert>
        </div>
      </div>
    )}
  </ErrorMessage>
)

export const ModalLabel = (props: { label?: any; tooltip?: string; fullwidth?: boolean }) => {
  return (
    <div className={`self-center pr-4 ${props.fullwidth ? 'w-full' : 'w-1/4'}`}>
      {props.tooltip ? (
        <Tooltip content={props.tooltip}>
          <Label className="flex w-full justify-center">
            <div className="flex">
              <div>{props.label}</div>
              <div>
                <ExclamationmarkIcon area-label="" aria-hidden className="ml-2 self-center" />
              </div>
            </div>
          </Label>
        </Tooltip>
      ) : (
        <Label>{props.label}</Label>
      )}
    </div>
  )
}
