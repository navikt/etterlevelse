import axios from 'axios'
import { env } from 'process'
import { EPvkDokumentStatus, IPageResponse, IPvkDokument } from '../constants'

export const getAllPvkDokument = async () => {
  const pageSize = 100
  const firstPage = await getPvkDokumentPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allPvkDokument: IPvkDokument[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allPvkDokument = [
        ...allPvkDokument,
        ...(await getPvkDokumentPage(currentPage, pageSize)).content,
      ]
    }
    return allPvkDokument
  }
}

export const getPvkDokumentPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IPvkDokument>>(
      `${env.backendBaseUrl}/pvkdokument?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getPvkDokument = async (id: string) => {
  return (await axios.get<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${id}`)).data
}

export const getPvkDokumentByEtterlevelseDokumentId = async (etterlevelseDokumentId: string) => {
  return (
    await axios.get<IPvkDokument>(
      `${env.backendBaseUrl}/pvkdokument/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data
}

export const createPvkDokument = async (pvkDokument: IPvkDokument) => {
  const dto = pvkDokumentToPvkDokumentDto(pvkDokument)
  return (await axios.post<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument`, dto)).data
}

export const updatePvkDokument = async (pvkDokument: IPvkDokument) => {
  const dto = pvkDokumentToPvkDokumentDto(pvkDokument)
  return (await axios.put<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${pvkDokument.id}`, dto))
    .data
}

export const deletePvkDokument = async (id: string) => {
  return (await axios.delete<IPvkDokument>(`${env.backendBaseUrl}/pvkdokument/${id}`)).data
}

function pvkDokumentToPvkDokumentDto(pvkDokument: IPvkDokument) {
  const dto = {
    ...pvkDokument,
    ytterligereEgenskaper: pvkDokument.ytterligereEgenskaper.map((egenskap) => egenskap.code),
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapPvkDokumentToFormValue = (pvkDokument: Partial<IPvkDokument>): IPvkDokument => {
  return {
    id: pvkDokument.id || '',
    changeStamp: pvkDokument.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    etterlevelseDokumentId: pvkDokument.etterlevelseDokumentId || '',
    status: pvkDokument.status || EPvkDokumentStatus.AKTIV,
    behandlingensLivslopBeskrivelse: pvkDokument.behandlingensLivslopBeskrivelse || '',
    ytterligereEgenskaper: pvkDokument.ytterligereEgenskaper || [],
    skalUtforePvk: pvkDokument.skalUtforePvk || false,
    pvkVurderingsBegrunnelse: pvkDokument.pvkVurderingsBegrunnelse || '',
    stemmerPersonkategorier: pvkDokument.stemmerPersonkategorier || false,
    personkategoriAntallBeskrivelse: pvkDokument.personkategoriAntallBeskrivelse || '',
    tilgangsBeskrivelsePersonopplysningene:
      pvkDokument.tilgangsBeskrivelsePersonopplysningene || '',
    lagringsBeskrivelsePersonopplysningene:
      pvkDokument.lagringsBeskrivelsePersonopplysningene || '',
    harInvolvertRepresentant: pvkDokument.harInvolvertRepresentant || false,
    representantInvolveringsBeskrivelse: pvkDokument.representantInvolveringsBeskrivelse || '',
    stemmerDatabehandlere: pvkDokument.stemmerDatabehandlere || false,
    harDatabehandlerRepresentantInvolvering:
      pvkDokument.harDatabehandlerRepresentantInvolvering || false,
    dataBehandlerRepresentantInvolveringBeskrivelse:
      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse || '',
  }
}
