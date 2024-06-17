import axios from 'axios'
import { ERelationType, IDocumentRelation, IPageResponse } from '../constants'
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

export const getAllDocumentRelation = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getDocumentRelationPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allDocumentRelation: IDocumentRelation[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allDocumentRelation = [
        ...allDocumentRelation,
        ...(await getDocumentRelationPage(currentPage, PAGE_SIZE)).content,
      ]
    }
    return allDocumentRelation
  }
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

export const documentRelationMapToFormVal = (
  documentRelation: Partial<IDocumentRelation>
): IDocumentRelation => ({
  id: documentRelation.id || '',
  changeStamp: documentRelation.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: documentRelation.version || -1,
  fromDocument: documentRelation.fromDocument || '',
  toDocument: documentRelation.toDocument || '',
  RelationType: documentRelation.RelationType || ERelationType.ARVER,
})

export const dokumentRelationTypeToString = (relasjonsType: ERelationType): string => {
  switch (relasjonsType) {
    case ERelationType.ARVER:
      return 'Arver fra'
    case ERelationType.BYGGER:
      return 'Bygger fra'
  }
}
