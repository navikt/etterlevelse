import { dokumentasjonUrl } from '../etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { kravUrl } from '../krav/kravRoutes'

export const tabTiltakQuery: string = '&tab=tiltak'
const tabRisikoScenarioQuery: string = '&tab=risikoscenarioer'
const filterAlleQuery: string = 'filter=alle'
export const filterUtenAnsvarligQuery: string = '&filter=utenAnsvarlig'
export const filterUtenFristQuery: string = '&filter=utenFrist'

export const risikoscenarioIdQuery = (
  risikoscenarioId: string,
  tiltakId?: string,
  steg?: string
): string => {
  let query: string = `${window.location.pathname}?risikoscenario=${risikoscenarioId}`
  if (steg) {
    query = `${window.location.pathname}?steg=${steg}&risikoscenario=${risikoscenarioId}`
  }

  if (tiltakId) {
    return `${query}&tiltak=${tiltakId}`
  }

  return query
}

export const risikoDokumentasjonTemaKravNummerVersjonUrl = (
  etterlevelseDokumentasjonId: string | undefined,
  tema: string,
  kravNummer: number,
  kravVersjon: number
): string =>
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/${tema}${kravUrl}/${kravNummer}/${kravVersjon}`

export const risikoscenarioFilterAlleUrl = (): string =>
  `${tabRisikoScenarioQuery}&${filterAlleQuery}`

export const risikoscenarioTiltakUrl = (
  activeRisikoscenarioId: string,
  tiltakId: string,
  steg?: string
): string => {
  if (steg) {
    return `${window.location.pathname}?steg=${steg}&risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`
  } else {
    return `${window.location.pathname}?risikoscenario=${activeRisikoscenarioId}&tiltak=${tiltakId}`
  }
}
