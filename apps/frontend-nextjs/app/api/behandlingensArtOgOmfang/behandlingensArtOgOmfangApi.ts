import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IPageResponse } from '@/constants/commonConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const getAllBehandlingensArtOgOmfang = async () => {
  const pageSize = 100
  const firstPage = await getBehandlingensArtOgOmfangPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allBehandlingensArtOgOmfang: IBehandlingensArtOgOmfang[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allBehandlingensArtOgOmfang = [
        ...allBehandlingensArtOgOmfang,
        ...(await getBehandlingensArtOgOmfangPage(currentPage, pageSize)).content,
      ]
    }
    return allBehandlingensArtOgOmfang
  }
}

export const getBehandlingensArtOgOmfangPage = async (
  pageNumber: number,
  pageSize: number
): Promise<IPageResponse<IBehandlingensArtOgOmfang>> =>
  (
    await axios.get<IPageResponse<IBehandlingensArtOgOmfang>>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data

export const getBehandlingensArtOgOmfang = async (id: string): Promise<IBehandlingensArtOgOmfang> =>
  (
    await axios.get<IBehandlingensArtOgOmfang>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang/${id}`
    )
  ).data

export const getBehandlingensArtOgOmfangByEtterlevelseDokumentId = async (
  etterlevelseDokumentId: string
) =>
  (
    await axios.get<IBehandlingensArtOgOmfang>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data

export const createBehandlingensArtOgOmfang = async (
  artOgOmfang: IBehandlingensArtOgOmfang
): Promise<IBehandlingensArtOgOmfang> => {
  const dto = behandlingensArtOgOmfangToBehandlingensArtOgOmfangDto(artOgOmfang)
  return (
    await axios.post<IBehandlingensArtOgOmfang>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang`,
      dto
    )
  ).data
}

export const updateBehandlingensArtOgOmfang = async (
  artOgOmfang: IBehandlingensArtOgOmfang
): Promise<IBehandlingensArtOgOmfang> => {
  const dto = behandlingensArtOgOmfangToBehandlingensArtOgOmfangDto(artOgOmfang)
  return (
    await axios.put<IBehandlingensArtOgOmfang>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang/${artOgOmfang.id}`,
      dto
    )
  ).data
}

export const deleteBehandlingensArtOgOmfang = async (
  id: string
): Promise<IBehandlingensArtOgOmfang> =>
  (
    await axios.delete<IBehandlingensArtOgOmfang>(
      `${env.backendBaseUrl}/behandlingens-art-og-omfang/${id}`
    )
  ).data

export const useBehandlingensArtOgOmfang = (
  artOfOmfangId?: string,
  etterlevelseDokumentasjonId?: string
) => {
  const isCreateNew = artOfOmfangId === 'ny'
  const [data, setData] = useState<IBehandlingensArtOgOmfang | undefined>(
    isCreateNew ? mapBehandlingensArtOgOmfangToFormValue({}) : undefined
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    if (artOfOmfangId && !isCreateNew) {
      ;(async () => {
        await getBehandlingensArtOgOmfang(artOfOmfangId).then(
          async (artOfOmfang: IBehandlingensArtOgOmfang) => {
            setData(artOfOmfang)
            setIsLoading(false)
          }
        )
      })()
    } else if (etterlevelseDokumentasjonId && isCreateNew) {
      //double check that behandlingens art og omfang doesnt not exist
      ;(async () => {
        await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(etterlevelseDokumentasjonId).then(
          async (artOfOmfang) => {
            if (artOfOmfang) {
              setData(artOfOmfang)
            }
            setIsLoading(false)
          }
        )
      })()
    }
  }, [artOfOmfangId])

  return [data, setData, isLoading] as [
    IBehandlingensArtOgOmfang | undefined,
    (artOfOmfang: IBehandlingensArtOgOmfang) => void,
    boolean,
  ]
}

const behandlingensArtOgOmfangToBehandlingensArtOgOmfangDto = (
  artOgOmfang: IBehandlingensArtOgOmfang
) => {
  const dto = {
    ...artOgOmfang,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapBehandlingensArtOgOmfangToFormValue = (
  artOgOmfang: Partial<IBehandlingensArtOgOmfang>
): IBehandlingensArtOgOmfang => {
  return {
    id: artOgOmfang.id || '',
    changeStamp: artOgOmfang.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    etterlevelseDokumentId: artOgOmfang.etterlevelseDokumentId || '',
    stemmerPersonkategorier:
      artOgOmfang.stemmerPersonkategorier === undefined
        ? undefined
        : artOgOmfang.stemmerPersonkategorier,
    personkategoriAntallBeskrivelse: artOgOmfang.personkategoriAntallBeskrivelse || '',
    tilgangsBeskrivelsePersonopplysningene:
      artOgOmfang.tilgangsBeskrivelsePersonopplysningene || '',
    lagringsBeskrivelsePersonopplysningene:
      artOgOmfang.lagringsBeskrivelsePersonopplysningene || '',
  }
}
