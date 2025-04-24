import { dokumentasjonUrl } from './RouteLinkEtterlevelsesdokumentasjon'
import { kravUrl } from './RouteLinkKrav'

export const tabTiltakQuery: string = '?tab=tiltak'
const tabRisikoScenarioQuery: string = '?tab=risikoscenarioer'
const filterAlleQuery: string = 'filter=alle'

export const risikoscenarioIdQuery = (risikoscenarioId: string, tiltakId?: string): string => {
  const query: string = `${window.location.pathname}?risikoscenario=${risikoscenarioId}`

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
  `${dokumentasjonUrl}/${etterlevelseDokumentasjonId}/${tema}/RELEVANTE_KRAV${kravUrl}/${kravNummer}/${kravVersjon}`

export const risikoscenarioFilterAlleUrl = (): string =>
  `${tabRisikoScenarioQuery}&${filterAlleQuery}`
