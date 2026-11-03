import { FilesIcon } from '@navikt/aksel-icons'
import { CopyButton } from '@navikt/ds-react'

interface IProps {
  url: string
  className?: string
}

export const DashboardCopyLinkButton = ({ url, className }: IProps) => (
  <CopyButton
    className={className}
    variant='action'
    size='small'
    copyText={url}
    text='Kopier lenke med utvalget'
    activeText='Lenken er kopiert'
    icon={<FilesIcon aria-hidden />}
  />
)
