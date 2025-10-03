import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getBehandlingensLivslopByEtterlevelseDokumentId = async (
  etterlevelseDokumentId: string
) => {
  return (
    await axios.get<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data
}
