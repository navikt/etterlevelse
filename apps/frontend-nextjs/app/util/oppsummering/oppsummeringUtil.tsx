import { filterValues, tiltakFilterValues } from '@/constants/oppsummering/oppsummeringConstants'
import { BodyLong } from '@navikt/ds-react'

export const VisTomListeBeskrivelse = (filter: string | null) => {
  let textBody = ''
  switch (filter) {
    case filterValues.hoyRisiko:
      textBody = 'Det finnes ingen risikoscenarioer med høy risiko 🎉'
      break
    case filterValues.tiltakIkkeAktuelt:
      textBody = 'Det finnes ingen risikoscenario hvor tiltak ikke er aktuelt  🎉'
      break
    case filterValues.effektIkkeVurdert:
      textBody = 'Det finnes ingen risikoscenarioer der effekt ikke er vurdert 🎉'
      break
    default:
  }
  return <BodyLong className='my-5'>{textBody}</BodyLong>
}

export const VisTomTiltakListeBeskrivelse = (filter: string | null) => {
  let textBody = ''
  switch (filter) {
    case tiltakFilterValues.utenAnsvarlig:
      textBody = 'Det finnes tiltak uten en ansvarlig 🎉'
      break
    case tiltakFilterValues.utenFrist:
      textBody = 'Det finnes ingen tiltak uten frist 🎉'
      break
    default:
  }
  return <BodyLong className='my-5'>{textBody}</BodyLong>
}
