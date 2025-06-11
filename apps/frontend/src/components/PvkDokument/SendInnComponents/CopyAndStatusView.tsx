import { FilesIcon } from '@navikt/aksel-icons'
import { Alert, CopyButton } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EPvkDokumentStatus } from '../../../constants'
import { pvkDokumentStatusToText } from '../common/FormSummaryPanel'

type TProps = {
  pvkDokumentStatus: EPvkDokumentStatus
}
export const CopyAndStatusView: FunctionComponent<TProps> = ({ pvkDokumentStatus }) => {
  return (
    <div>
      <CopyButton
        variant='action'
        copyText={window.location.href}
        text='Kopiér lenken til denne siden'
        activeText='Lenken er kopiert'
        icon={<FilesIcon aria-hidden />}
      />
      <Alert variant='info' className='my-5'>
        Status: {pvkDokumentStatusToText(pvkDokumentStatus)}
      </Alert>
    </div>
  )
}
export default CopyAndStatusView
