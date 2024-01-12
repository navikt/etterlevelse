import { Detail, Tag } from '@navikt/ds-react'
import { EKravStatus } from '../../constants'
import { kravStatus } from '../../pages/KravPage'

interface IStatusViewProps {
  status: EKravStatus | string
  variant?: any
  icon?: React.ReactNode
}

export const StatusView = ({ status, variant, icon }: IStatusViewProps) => {
  const getStatusDisplay = (variant: any) => {
    return (
      <Tag variant={variant} className="h-fit">
        <div className={'flex items-center'}>
          {icon}
          <Detail className="whitespace-nowrap">{kravStatus(status)}</Detail>
        </div>
      </Tag>
    )
  }

  if (variant) {
    return getStatusDisplay(variant)
  } else if (status === EKravStatus.UTKAST) {
    return getStatusDisplay('neutral')
  } else if (status === EKravStatus.AKTIV) {
    return getStatusDisplay('success')
  } else if (status === EKravStatus.UTGAATT) {
    return getStatusDisplay('error')
  } else {
    return getStatusDisplay('neutral')
  }
}
export default StatusView
