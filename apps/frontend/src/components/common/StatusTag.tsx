import {KravStatus} from '../../constants'
import {kravStatus} from '../../pages/KravPage'
import {BodyShort, Tag} from '@navikt/ds-react'

interface StatusViewProps{
  status: KravStatus | string
  variant?: any
  icon?: React.ReactNode
}

export const StatusView = ({
  status,
  variant,
  icon,
}:StatusViewProps) => {
  const getStatusDisplay = (variant: any) => {
    return (
        <Tag variant={variant}>
          <div className={"flex items-center"}>
            {icon}
            <BodyShort>
              {kravStatus(status)}
            </BodyShort>
          </div>
        </Tag>
    )
  }

  if(variant){
    return getStatusDisplay(variant)
  } else if (status === KravStatus.UTKAST) {
    return getStatusDisplay("neutral")
  } else if (status === KravStatus.AKTIV) {
    return getStatusDisplay("success")
  } else if (status === KravStatus.UTGAATT) {
    return getStatusDisplay("error")
  } else {
    return getStatusDisplay("neutral")
  }
}
export default StatusView
