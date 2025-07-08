import { etterlevelseUrl } from '@/routes/etterlevelse/routes'
import { adminUrl } from '../routes'

export const adminEtterlevelseUrl: string = `${adminUrl}${etterlevelseUrl}`
export const adminMessagesLogUrl: string = `${adminUrl}/messageslog`
export const adminVarselUrl: string = `${adminUrl}/varsel`
export const adminMaillog = `${adminUrl}/maillog`
