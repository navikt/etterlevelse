import ExportPvkModal from '@/components/PVK/export/exportPvkModal'
import { FilesIcon } from '@navikt/aksel-icons'
import { CopyButton } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjonId: string
}

export const CopyAndExportButtons: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjonId,
}) => {
  return (
    <div className='mt-5 flex gap-2 items-center'>
      <CopyButton
        variant='action'
        copyText={window.location.href}
        text='Kopier lenken til denne siden'
        activeText='Lenken er kopiert'
        icon={<FilesIcon aria-hidden />}
      />
      <ExportPvkModal etterlevelseDokumentasjonId={etterlevelseDokumentasjonId} />
    </div>
  )
}
export default CopyAndExportButtons
