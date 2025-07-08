import { dokumentasjonUrl } from '@/routes/etterlevelse/dokumentasjon/routes'
import { kravUrl } from '../routes'

export const adminUrl: string = '/admin'
export const adminKravUrl: string = `${adminUrl}${kravUrl}`
export const adminDokumentasjonUrl: string = `${adminUrl}${dokumentasjonUrl}`
