import { Detail, Tag } from '@navikt/ds-react'
import { EPvkDokumentStatus } from '../../../constants'

interface IProps {
  status: EPvkDokumentStatus
}

export const pvoStatusToText = (status: EPvkDokumentStatus) => {
  if (!status) return ''
  switch (status) {
    case EPvkDokumentStatus.AKTIV:
      return 'Under arbeid'
    case EPvkDokumentStatus.UNDERARBEID:
      return 'Under arbeid'
    case EPvkDokumentStatus.SENDT_TIL_PVO:
      return 'Trenger tilbakemelding'
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return 'Fått tilbakemelding'
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return 'Godkjent av risikoeier'
    default:
      return status
  }
}

export const PvoStatusView = (props: IProps) => {
  const { status } = props
  const getStatusDisplay = (variant: any) => {
    return (
      <Tag variant={variant} className="h-fit">
        <div className={'flex items-center'}>
          <Detail className="whitespace-nowrap">{pvoStatusToText(status)}</Detail>
        </div>
      </Tag>
    )
  }

  switch (status) {
    case EPvkDokumentStatus.AKTIV:
      return getStatusDisplay('neutral')
    case EPvkDokumentStatus.UNDERARBEID:
      return getStatusDisplay('neutral')
    case EPvkDokumentStatus.SENDT_TIL_PVO:
      return getStatusDisplay('warning')
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return getStatusDisplay('success')
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return getStatusDisplay('success')
    default:
      return getStatusDisplay('neutral')
  }
}
export default PvoStatusView
