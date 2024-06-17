import axios from 'axios'
import { IDocumentRelation, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getByDocumentRelation = async (id: string) => {
  return (await axios.get<IDocumentRelation>(`${env.backendBaseUrl}/documentrelation/${id}`)).data
}

export const getDocumentRelationPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IDocumentRelation>>(
      `${env.backendBaseUrl}/documentrelation?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const deleteDocumentRelation = async (id: string) => {
  return (await axios.delete<IDocumentRelation>(`${env.backendBaseUrl}/documentrelation/${id}`))
    .data
}

export const createDocumentRelation = async (documentRelation: IDocumentRelation) => {
  const dto = documentRelationToDocumentRelationDomainObject(documentRelation)
  return (await axios.post<IDocumentRelation>(`${env.backendBaseUrl}/documentrelation`, dto)).data
}

export const updateDocumentRelation = async (documentRelation: IDocumentRelation) => {
  const dto = documentRelationToDocumentRelationDomainObject(documentRelation)
  return (
    await axios.put<IDocumentRelation>(
      `${env.backendBaseUrl}/documentrelation/${documentRelation.id}`,
      dto
    )
  ).data
}

function documentRelationToDocumentRelationDomainObject(
  documentRelation: IDocumentRelation
): IDocumentRelation {
  const domainToObject = {
    ...documentRelation,
  } as any
  delete domainToObject.changeStamp
  delete domainToObject.version
  return domainToObject
}
