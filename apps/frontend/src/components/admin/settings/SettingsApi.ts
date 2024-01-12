import axios from 'axios'
import { env } from '../../../util/env'

export const getSettings = async () => {
  return (await axios.get<ISettings>(`${env.backendBaseUrl}/settings`)).data
}

export const writeSettings = async (settings: ISettings) => {
  return (await axios.post<ISettings>(`${env.backendBaseUrl}/settings`, settings)).data
}

export interface ISettings {
  frontpageMessage: string
}
