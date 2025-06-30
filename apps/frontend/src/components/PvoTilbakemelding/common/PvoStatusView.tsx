import { Detail, Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EPvoTilbakemeldingStatus } from '../../../constants'

type TProps = {
  status?: EPvoTilbakemeldingStatus
}

export const pvoStatusToText = (status?: EPvoTilbakemeldingStatus) => {
  if (!status) return 'Ikke påbegynt'

  switch (status) {
    case EPvoTilbakemeldingStatus.AVVENTER:
      return 'Avventer'
    case EPvoTilbakemeldingStatus.IKKE_PABEGYNT:
      return 'Ikke påbegynt'
    case EPvoTilbakemeldingStatus.UNDERARBEID:
      return 'Påbegynt'
    case EPvoTilbakemeldingStatus.SNART_FERDIG:
      return 'Straks ferdig'
    case EPvoTilbakemeldingStatus.TIL_KONTROL:
      return '(POV) Trenger kontrol'
    case EPvoTilbakemeldingStatus.FERDIG:
      return 'Sendt tilbake'
    case EPvoTilbakemeldingStatus.UTGAAR:
      return 'Utgår'
    case EPvoTilbakemeldingStatus.TRENGER_REVURDERING:
      return 'Trenger revudering'
    default:
      return 'Ikke påbegynt'
  }
}

export const PvoStatusView: FunctionComponent<TProps> = ({ status }) => {
  const getStatusDisplay = (variant: any) => (
    <Tag variant={variant} className='h-fit'>
      <div className={'flex items-center'}>
        <Detail className='whitespace-nowrap'>{pvoStatusToText(status)}</Detail>
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
