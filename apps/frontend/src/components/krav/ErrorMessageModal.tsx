import { ModalLabel } from '../common/ModalSchema'
import { Alert } from '@navikt/ds-react'

export const ErrorMessageModal = (props: { msg: any; fullWidth?: boolean }) => (
  <div className="flex w-full mt-1">
    {!props.fullWidth && <ModalLabel />}
    <div className="w-full">
      <Alert variant="error">{props.msg}</Alert>
    </div>
  </div>
)
