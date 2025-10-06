import { EKravStatus } from '@/constants/krav/kravConstants'
import { kravStatus } from '@/util/krav/kravUtil'
import { Detail, Tag } from '@navikt/ds-react'
import { ReactNode } from 'react'

interface IStatusTagProps {
  status: EKravStatus | string
  variant?: any
  icon?: ReactNode
}

export const StatusTag = ({ status, variant, icon }: IStatusTagProps) => {
  const getStatusDisplay = (variant: any) => (
    <Tag variant={variant} className='h-fit'>
      <div className='flex items-center'>
        {icon}
        <Detail className='whitespace-nowrap'>{kravStatus(status)}</Detail>
      </div>
    </Tag>
  )

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

export default StatusTag
