import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const arkiver = async (
  etterlevelseDokumentasjonId: string,
  onlyActiveKrav: boolean,
  pvoTilbakemelding: boolean,
  risikoeier: boolean
) => {
  return (
    await axios.post<IEtterlevelseDokumentasjon>(
      `${env.backendBaseUrl}/p360/arkiver?etterlevelseDokumentasjonId=${etterlevelseDokumentasjonId}&onlyActiveKrav=${onlyActiveKrav}&pvoTilbakemelding=${pvoTilbakemelding}&risikoeier=${risikoeier}`
    )
  ).data
}
