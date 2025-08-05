import {
  ITilbakemelding,
  ITilbakemeldingNewMeldingRequest,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const tilbakemeldingNewMelding = async (request: ITilbakemeldingNewMeldingRequest) => {
  return (
    await axios.post<ITilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/melding`, request)
  ).data
}
