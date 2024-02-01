import { ExclamationmarkIcon } from '@navikt/aksel-icons'
import { Label, Tooltip } from '@navikt/ds-react'
import { ErrorMessage } from 'formik'

export const Error = (props: { fieldName: string }) => (
  <ErrorMessage name={props.fieldName}>{(msg: string) => msg}</ErrorMessage>
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
