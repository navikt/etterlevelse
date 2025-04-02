import { Detail, Tag } from '@navikt/ds-react'
import { EPvoTilbakemeldingStatus } from '../../../constants'

interface IProps {
  status?: EPvoTilbakemeldingStatus
}

export const pvoStatusToText = (status?: EPvoTilbakemeldingStatus) => {
  if (!status) return 'Ikke påbegynt'
  switch (status) {
    case EPvoTilbakemeldingStatus.UNDERARBEID:
      return 'Påbegynt'
    case EPvoTilbakemeldingStatus.FERDIG:
      return 'Sendt tilbake'
    default:
      return status
  }
}

export const PvoStatusView = (props: IProps) => {
  const { status } = props
  const getStatusDisplay = (variant: any) => {
    return (
      <Tag variant={variant} className='h-fit'>
        <div className={'flex items-center'}>
          <Detail className='whitespace-nowrap'>{pvoStatusToText(status)}</Detail>
        </div>
      </Tag>
    )
  }

  switch (status) {
    case EPvoTilbakemeldingStatus.UNDERARBEID:
      return getStatusDisplay('warning')
    case EPvoTilbakemeldingStatus.FERDIG:
      return getStatusDisplay('success')
    default:
      return getStatusDisplay('neutral')
  }
}
export default PvoStatusView
