import axios from 'axios'
import { EListName, IAllCodelists, ICode, ICodeUsage } from '../services/Codelist'
import { env } from '../util/env'

// refresh will force backend to re-read codelists from db, due to caching and multibackend
export const getAllCodelists = async (refresh?: boolean) =>
  await axios.get<IAllCodelists>(
    `${env.backendBaseUrl}/codelist?refresh=${refresh ? 'true' : 'false'}`
  )

export const getCodelistUsage = async (listname: EListName, code: string) => {
  return (
    await axios.get<ICodeUsage>(`${env.backendBaseUrl}/codelist/usage/find/${listname}/${code}`)
  ).data
}

export const replaceCodelistUsage = async (
  listname: EListName,
  oldCode: string,
  newCode: string
) => {
  return (
    await axios.post<ICodeUsage>(`${env.backendBaseUrl}/codelist/usage/replace`, {
      list: listname,
      oldCode,
      newCode,
    })
  ).data
}

export const createCodelist = async (code: ICode) => {
  return axios.post<ICode[]>(`${env.backendBaseUrl}/codelist`, [code])
}

export const updateCodelist = async (code: ICode) => {
  return axios.put<ICode[]>(`${env.backendBaseUrl}/codelist`, [code])
}

export const deleteCodelist = async (list: string, code: string) => {
  return axios.delete(`${env.backendBaseUrl}/codelist/${list}/${code}`)
}
