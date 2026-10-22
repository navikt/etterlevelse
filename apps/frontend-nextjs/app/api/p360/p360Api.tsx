import axios from 'axios'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IP360UserPageResponse } from '@/constants/p360/p360Constants'
import { env } from '@/util/env/env'

export const arkiver = async (
  etterlevelseDokumentasjonId: string,
  onlyActiveKrav: boolean,
  forPvoNaarDeSenderTilbakemeldingTilPvo: boolean,
  forGodkjenningAvPvkDokument: boolean,
  forGodkjenningAvEtterlevelsesDokument: boolean,
  responsiblePerson?: string
) => {
  return (
    await axios.post<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/p360/arkiver?etterlevelseDokumentasjonId=${etterlevelseDokumentasjonId}&onlyActiveKrav=${onlyActiveKrav}&pvoTilbakemelding=${forPvoNaarDeSenderTilbakemeldingTilPvo}&risikoeier=${forGodkjenningAvPvkDokument}&godkjenning=${forGodkjenningAvEtterlevelsesDokument}${responsiblePerson ? '&responsiblePerson=' + responsiblePerson : ''}`
    )
  ).data
}

export const getMyP360User = async () => {
  return (await axios.get<IP360UserPageResponse>(`${env.backendBaseUrl}/p360/user`)).data
}
