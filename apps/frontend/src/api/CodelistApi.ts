import axios from 'axios'
import {env} from '../util/env'
import {AllCodelists, CategoryUsage, Code, CodeUsage, ListName} from '../services/Codelist'

// refresh will force backend to re-read codelists from db, due to caching and multibackend
export const getAllCodelists = async (refresh?: boolean) => await axios.get<AllCodelists>(`${env.backendBaseUrl}/codelist?refresh=${refresh ? 'true' : 'false'}`)

export const getCodelistUsageByListName = async (listname: string) => {
  return (await axios.get<CategoryUsage>(`${env.backendBaseUrl}/codelist/usage/find/${listname}`)).data
}

export const getCodelistUsage = async (listname: ListName, code: string) => {
  return (await axios.get<CodeUsage>(`${env.backendBaseUrl}/codelist/usage/find/${listname}/${code}`)).data
}

export const replaceCodelistUsage = async (listname: ListName, oldCode: string, newCode: string) => {
  return (await axios.post<CodeUsage>(`${env.backendBaseUrl}/codelist/usage/replace`, { list: listname, oldCode, newCode })).data
}

export const createCodelist = async (code: Code) => {
  return axios.post<Code[]>(`${env.backendBaseUrl}/codelist`, [code])
}

export const updateCodelist = async (code: Code) => {
  return axios.put<Code[]>(`${env.backendBaseUrl}/codelist`, [code])
}

export const deleteCodelist = async (list: string, code: string) => {
  return axios.delete(`${env.backendBaseUrl}/codelist/${list}/${code}`)
}
