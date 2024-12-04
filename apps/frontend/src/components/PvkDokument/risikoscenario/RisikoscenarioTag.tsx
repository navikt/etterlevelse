import { Tag } from '@navikt/ds-react'

interface IProps {
  text: string
  level: number
}

export const RisikoscenarioTag = (props: IProps) => {
  const { text, level } = props

  const getVariantFromLevel = (level: number) => {
    switch (level) {
      case 1:
        return 'success'
      case 2:
        return 'success'
      case 3:
        return 'warning'
      case 5:
        return 'warning'
      case 6:
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
      return 'Ubetydelig'
    case 2:
      return 'Lav konsekvens'
    case 3:
      return 'Moderat konsekvens'
    case 5:
      return 'Alvorlig konsekvens'
    case 6:
      return 'Nesten sikkert'
    default:
      return 'Svaert alvorlig konsekvens'
  }
}

export const getSannsynlighetsnivaaText = (sannsynlighetsnivaa: number) => {
  switch (sannsynlighetsnivaa) {
    case 1:
      return 'Meget lite sannsynlig'
    case 2:
      return 'Lite sannsyling'
    case 3:
      return 'Moderat sannsynlig'
    case 5:
      return 'Sannsynlig'
    case 6:
      return 'Nesten sikkert'
    default:
      return 'Ingen sannsynlighetsnivå satt'
  }
}

export default RisikoscenarioTag
