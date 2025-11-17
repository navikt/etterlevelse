import { FilesIcon } from '@navikt/aksel-icons'
import { CopyButton } from '@navikt/ds-react'

export const CopyLinkPvoButton = () => (
  <CopyButton
    variant='action'
    copyText={window.location.href}
    text='Kopier lenken til denne siden'
    activeText='Lenken er kopiert'
    icon={<FilesIcon aria-hidden />}
  />
)
