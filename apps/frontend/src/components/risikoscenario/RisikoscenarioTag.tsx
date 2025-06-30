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

export const getKonsekvenssnivaaText = (konsekvensnivaa: number) => {
  switch (konsekvensnivaa) {
    case 1:
      return '1 - Ubetydelig konsekvens'
    case 2:
      return '2 - Lav konsekvens'
    case 3:
      return '3 - Moderat konsekvens'
    case 4:
      return '4 - Alvorlig konsekvens'
    case 5:
      return '5 - Svært alvorlig konsekvens'
    default:
      return 'Ingen konsekvensnivå satt'
  }
}

export const getSannsynlighetsnivaaText = (sannsynlighetsnivaa: number) => {
  switch (sannsynlighetsnivaa) {
    case 1:
      return '1 - Meget lite sannsynlig'
    case 2:
      return '2 - Lite sannsynlig'
    case 3:
      return '3 - Moderat sannsynlig'
    case 4:
      return '4 - Sannsynlig'
    case 5:
      return '5 - Nesten sikkert'
    default:
      return 'Ingen sannsynlighetsnivå satt'
  }
}

export default RisikoscenarioTag
