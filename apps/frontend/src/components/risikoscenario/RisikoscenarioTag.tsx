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
        return 'success'
      case 3:
        return 'warning'
      case 4:
        return 'warning'
      case 5:
        return 'error'
      default:
        return 'neutral'
    }
  }

  return <Tag variant={getVariantFromLevel(level)}>{text}</Tag>
}

export const getKonsekvenssnivaaText = (konsekvensnivaa: number) => {
  switch (konsekvensnivaa) {
    case 1:
      return 'Ubetydelig konsekvens'
    case 2:
      return 'Lav konsekvens'
    case 3:
      return 'Moderat konsekvens'
    case 4:
      return 'Alvorlig konsekvens'
    case 5:
      return 'Svært alvorlig konsekvens'
    default:
      return 'Ingen konsekvensnivå satt'
  }
}

export const getSannsynlighetsnivaaText = (sannsynlighetsnivaa: number) => {
  switch (sannsynlighetsnivaa) {
    case 1:
      return 'Meget lite sannsynlig'
    case 2:
      return 'Lite sannsynlig'
    case 3:
      return 'Moderat sannsynlig'
    case 4:
      return 'Sannsynlig'
    case 5:
      return 'Nesten sikkert'
    default:
      return 'Ingen sannsynlighetsnivå satt'
  }
}

export default RisikoscenarioTag
