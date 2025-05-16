import { Detail, Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EPvoTilbakemeldingStatus } from '../../../constants'

type TProps = {
  status?: EPvoTilbakemeldingStatus
  isAvventer?: boolean
}

export const pvoStatusToText = (status?: EPvoTilbakemeldingStatus) => {
  if (!status) return 'Ikke påbegynt'

  switch (status) {
    case EPvoTilbakemeldingStatus.IKKE_PABEGYNT:
      return 'Ikke påbegynt'
    case EPvoTilbakemeldingStatus.UNDERARBEID:
      return 'Påbegynt'
    case EPvoTilbakemeldingStatus.SNART_FERDIG:
      return 'Straks ferdig'
    case EPvoTilbakemeldingStatus.TRENGER_KONTROL:
      return '(POV) Trenger kontrol'
    case EPvoTilbakemeldingStatus.FERDIG:
      return 'Sendt tilbake'
    default:
      return 'Ikke påbegynt'
  }
}

export const PvoStatusView: FunctionComponent<TProps> = ({ status, isAvventer }) => {
  const getStatusDisplay = (variant: any) => (
    <Tag variant={isAvventer ? 'neutral' : variant} className='h-fit'>
      <div className={'flex items-center'}>
        <Detail className='whitespace-nowrap'>
          {isAvventer && 'Avventer'}
          {!isAvventer && pvoStatusToText(status)}
        </Detail>
      </div>
    </Tag>
  )

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
