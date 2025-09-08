import { Detail, Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { EPvoTilbakemeldingStatus } from '../../../constants'

type TProps = {
  status?: EPvoTilbakemeldingStatus
  etterlystReturn?: boolean
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
      return 'Trenger revurdering'
    default:
      return 'Ikke påbegynt'
  }
}

export const PvoStatusView: FunctionComponent<TProps> = ({ status, etterlystReturn }) => {
  const getStatusDisplay = (variant: any) => (
    <div className='flex gap-2'>
      {etterlystReturn && (
        <Tag variant='warning' className='h-fit'>
          <div className={'flex items-center'}>
            <Detail className='whitespace-nowrap'>Etterlyst retur</Detail>
          </div>
        </Tag>
      )}
      <Tag variant={variant} className='h-fit'>
        <div className={'flex items-center'}>
          <Detail className='whitespace-nowrap'>{pvoStatusToText(status)}</Detail>
        </div>
      </Tag>
    </div>
  )

  switch (status) {
    case EPvoTilbakemeldingStatus.IKKE_PABEGYNT:
      return getStatusDisplay('neutral')
    case EPvoTilbakemeldingStatus.UNDERARBEID:
      return getStatusDisplay('info')
    case EPvoTilbakemeldingStatus.SNART_FERDIG:
      return getStatusDisplay('info')
    case EPvoTilbakemeldingStatus.AVVENTER:
      return getStatusDisplay('warning')
    case EPvoTilbakemeldingStatus.TRENGER_REVURDERING:
      return getStatusDisplay('warning')
    case EPvoTilbakemeldingStatus.FERDIG:
      return getStatusDisplay('success')
    default:
      return getStatusDisplay('neutral')
  }
}

export default PvoStatusView
