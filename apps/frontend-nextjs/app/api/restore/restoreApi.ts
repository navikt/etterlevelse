import {
  IDeletedEtterlevelseDokumentasjon,
  IRestoreResult,
} from '@/constants/admin/restore/restoreConstants'
import { env } from '@/util/env/env'
import axios from 'axios'

export const getDeletedEtterlevelseDokumentasjoner = async (): Promise<
  IDeletedEtterlevelseDokumentasjon[]
> => {
  return (
    await axios.get<IDeletedEtterlevelseDokumentasjon[]>(
      `${env.backendBaseUrl}/restore/etterlevelsedokumentasjon`
    )
  ).data
}

export const restoreEtterlevelseDokumentasjon = async (
  etterlevelseDokumentasjonId: string
): Promise<IRestoreResult> => {
  return (
    await axios.post<IRestoreResult>(
      `${env.backendBaseUrl}/restore/etterlevelsedokumentasjon/${etterlevelseDokumentasjonId}`
    )
  ).data
}
