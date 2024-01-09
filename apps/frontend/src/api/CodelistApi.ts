import axios from 'axios'
import { env } from '../util/env'
import { IAllCodelists, ICategoryUsage, ICode, ICodeUsage, ListName } from '../services/Codelist'

// refresh will force backend to re-read codelists from db, due to caching and multibackend
export const getAllCodelists = async (refresh?: boolean) => await axios.get<IAllCodelists>(`${env.backendBaseUrl}/codelist?refresh=${refresh ? 'true' : 'false'}`)

export const getCodelistUsageByListName = async (listname: string) => {
  return (await axios.get<ICategoryUsage>(`${env.backendBaseUrl}/codelist/usage/find/${listname}`)).data
}

export const getCodelistUsage = async (listname: ListName, code: string) => {
  return (await axios.get<ICodeUsage>(`${env.backendBaseUrl}/codelist/usage/find/${listname}/${code}`)).data
}

export const replaceCodelistUsage = async (listname: ListName, oldCode: string, newCode: string) => {
  return (await axios.post<ICodeUsage>(`${env.backendBaseUrl}/codelist/usage/replace`, { list: listname, oldCode, newCode })).data
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
