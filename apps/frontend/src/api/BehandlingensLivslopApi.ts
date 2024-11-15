import axios from 'axios'
import { useEffect, useState } from 'react'
import { IBehandlingensLivslop, IPageResponse } from '../constants'
import { env } from '../util/env'

export const getAllBehandlingensLivslop = async () => {
  const pageSize = 100
  const firstPage = await getBehandlingensLivslopPage(0, pageSize)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allBehandlingensLivslop: IBehandlingensLivslop[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allBehandlingensLivslop = [
        ...allBehandlingensLivslop,
        ...(await getBehandlingensLivslopPage(currentPage, pageSize)).content,
      ]
    }
    return allBehandlingensLivslop
  }
}

export const getBehandlingensLivslopPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IBehandlingensLivslop>>(
      `${env.backendBaseUrl}/behandlingenslivslop?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getBehandlingensLivslop = async (id: string) => {
  return (
    await axios.get<IBehandlingensLivslop>(`${env.backendBaseUrl}/behandlingenslivslop/${id}`)
  ).data
}

export const getBehandlingensLivslopByEtterlevelseDokumentId = async (
  etterlevelseDokumentId: string
) => {
  return (
    await axios.get<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data
}

export const createBehandlingensLivslop = async (behandlingensLivslop: IBehandlingensLivslop) => {
  const dto = behandlingensLivslopToBehandlingensLivslopDto(behandlingensLivslop)
  return (
    await axios.post<IBehandlingensLivslop>(`${env.backendBaseUrl}/behandlingenslivslop`, dto)
  ).data
}

export const updateBehandlingensLivslop = async (behandlingensLivslop: IBehandlingensLivslop) => {
  const dto = behandlingensLivslopToBehandlingensLivslopDto(behandlingensLivslop)
  return (
    await axios.put<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop/${behandlingensLivslop.id}`,
      dto
    )
  ).data
}

export const deleteBehandlingensLivslop = async (id: string) => {
  return (
    await axios.delete<IBehandlingensLivslop>(`${env.backendBaseUrl}/behandlingenslivslop/${id}`)
  ).data
}

export const useBehandlingensLivslop = (behandlingensLivslopId?: string) => {
  const isCreateNew = behandlingensLivslopId === 'ny'
  const [data, setData] = useState<IBehandlingensLivslop | undefined>(
    isCreateNew ? mapBehandlingensLivslopToFormValue({}) : undefined
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)
    if (behandlingensLivslopId && !isCreateNew) {
      ;(async () => {
        await getBehandlingensLivslop(behandlingensLivslopId).then(async (behandlingensLivslop) => {
          setData(behandlingensLivslop)
          setIsLoading(false)
        })
      })()
    }
  }, [behandlingensLivslopId])

  return [data, setData, isLoading] as [
    IBehandlingensLivslop | undefined,
    (e: IBehandlingensLivslop) => void,
    boolean,
  ]
}

const behandlingensLivslopToBehandlingensLivslopDto = (
  behandlingensLivslop: IBehandlingensLivslop
) => {
  const dto = {
    ...behandlingensLivslop,
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const mapBehandlingensLivslopToFormValue = (
  behandlingensLivslop: Partial<IBehandlingensLivslop>
): IBehandlingensLivslop => {
  return {
    id: behandlingensLivslop.id || '',
    changeStamp: behandlingensLivslop.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    etterlevelseDokumentasjonId: behandlingensLivslop.etterlevelseDokumentasjonId || '',
    beskrivelse: behandlingensLivslop.beskrivelse || '',
    filer: behandlingensLivslop.filer || [],
  }
}
