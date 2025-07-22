import { env } from '@/components/others/utils/env/env'
import { IPageResponse } from '@/constants/constant'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelse/constants'
import axios from 'axios'

export const searchEtterlevelsedokumentasjon = async (
  searchParam: string
): Promise<IEtterlevelseDokumentasjon[]> => {
  return (
    await axios.get<IPageResponse<IEtterlevelseDokumentasjon>>(
      `${env.backendBaseUrl}/etterlevelsedokumentasjon/search/${searchParam}`
    )
  ).data.content
}
