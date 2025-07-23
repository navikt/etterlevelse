import { ETilbakemeldingMeldingStatus, ETilbakemeldingRolle } from '../tilbakemeldingConstants'

export interface ITilbakemeldingNewMeldingRequest {
  tilbakemeldingId: string
  melding: string
  rolle: ETilbakemeldingRolle
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}
