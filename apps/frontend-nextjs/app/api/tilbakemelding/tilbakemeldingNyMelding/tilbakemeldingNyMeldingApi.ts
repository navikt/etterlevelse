import { ITilbakemelding } from '@/constants/tilbakemelding/tilbakemeldingConstants'
import { ITilbakemeldingNewMeldingRequest } from '@/constants/tilbakemelding/tilbakemeldingNyMelding/tilbakemeldingNyMelding'
import { env } from '@/util/env/env'
import axios from 'axios'

export const tilbakemeldingNewMelding = async (request: ITilbakemeldingNewMeldingRequest) => {
  return (
    await axios.post<ITilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/melding`, request)
  ).data
}
