import { EListName, IAllCodelists, ICode, ICodeUsage } from '@/constants/kodeverk/kodeverkConstants'
import { codelistUrl } from '@/routes/admin/adminRoutes'
import { env } from '@/util/env/env'
import axios from 'axios'

// refresh will force backend to re-read codelists from db, due to caching and multibackend
export const getAllCodelists = async (refresh?: boolean) =>
  await axios.get<IAllCodelists>(
    `${env.backendBaseUrl}${codelistUrl}?refresh=${refresh ? 'true' : 'false'}`
  )

export const getCodelistUsage = async (listname: EListName, code: string) => {
  return (
    await axios.get<ICodeUsage>(
      `${env.backendBaseUrl}${codelistUrl}/usage/find/${listname}/${code}`
    )
  ).data
}

export const replaceCodelistUsage = async (
  listname: EListName,
  oldCode: string,
  newCode: string
) => {
  return (
    await axios.post<ICodeUsage>(`${env.backendBaseUrl}${codelistUrl}/usage/replace`, {
      list: listname,
      oldCode,
      newCode,
    })
  ).data
}

export const createCodelist = async (code: ICode) => {
  return axios.post<ICode[]>(`${env.backendBaseUrl}${codelistUrl}`, [code])
}

export const updateCodelist = async (code: ICode) => {
  return axios.put<ICode[]>(`${env.backendBaseUrl}${codelistUrl}`, [code])
}

export const deleteCodelist = async (list: string, code: string) => {
  return axios.delete(`${env.backendBaseUrl}${codelistUrl}/${list}/${code}`)
}
