import { Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  text: string
  level: number
}

export const RisikoscenarioTag: FunctionComponent<TProps> = ({ text, level }) => {
  const getVariantFromLevel = (level: number) => {
    switch (level) {
      case 1:
        return 'success'
      case 2:
        return 'alt2'
      case 3:
        return 'neutral'
      case 4:
        return 'warning'
      case 5:
        return 'error'
      default:
        return 'neutral'
    }
  }

  return (
    <Tag
      variant={getVariantFromLevel(level)}
      className={`${level === 3 ? 'bg-[#FFF9C2]' : level === 2 ? 'bg-[#EBF4A9]' : ''}`}
    >
      {text}
    </Tag>
  )
}

export default RisikoscenarioTag
