import { IBehandlingensLivslopRequest } from '@/constants/behandlingensLivslop/behandlingensLivslop'
import { IPageResponse } from '@/constants/commonConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const getBehandlingensLivslopByEtterlevelseDokumentId = async (
  etterlevelseDokumentId: string
) => {
  return (
    await axios.get<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop/etterlevelsedokument/${etterlevelseDokumentId}`
    )
  ).data
}

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

export const createBehandlingensLivslop = async (
  behandlingensLivslop: IBehandlingensLivslopRequest
) => {
  const formData = new FormData()
  const dto = behandlingensLivslopToBehandlingensLivslopDto(behandlingensLivslop)
  formData.append(
    'request',
    new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    })
  )

  if (behandlingensLivslop.filer && behandlingensLivslop.filer.length > 0) {
    behandlingensLivslop.filer.forEach((fil) => {
      formData.append('filer', fil)
    })
  }

  return (
    await axios.post<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: 5 * 1024 * 1024,
        maxBodyLength: 5 * 1024 * 1024,
      }
    )
  ).data
}

export const updateBehandlingensLivslop = async (
  behandlingensLivslop: IBehandlingensLivslopRequest
) => {
  const formData = new FormData()
  const dto = behandlingensLivslopToBehandlingensLivslopDto(behandlingensLivslop)
  formData.append(
    'request',
    new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    })
  )

  if (behandlingensLivslop.filer && behandlingensLivslop.filer.length > 0) {
    behandlingensLivslop.filer.forEach((fil) => {
      formData.append('filer', fil)
    })
  }

  return (
    await axios.put<IBehandlingensLivslop>(
      `${env.backendBaseUrl}/behandlingenslivslop/${behandlingensLivslop.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: 5 * 1024 * 1024,
        maxBodyLength: 5 * 1024 * 1024,
      }
    )
  ).data
}

export const deleteBehandlingensLivslop = async (id: string) => {
  return (
    await axios.delete<IBehandlingensLivslop>(`${env.backendBaseUrl}/behandlingenslivslop/${id}`)
  ).data
}

export const useBehandlingensLivslop = (
  behandlingensLivslopId?: string,
  etterlevelseDokumentasjonId?: string
) => {
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
    } else if (etterlevelseDokumentasjonId && isCreateNew) {
      //double check that behandlingenslivslop doesnt not exist
      ;(async () => {
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
          .then(async (behandlingensLivslop) => {
            if (behandlingensLivslop) {
              setData(behandlingensLivslop)
            }
            setIsLoading(false)
          })
          .catch(() => undefined)
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
  behandlingensLivslop: IBehandlingensLivslopRequest
) => {
  const dto = {
    ...behandlingensLivslop,
    filer: [],
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

export const mapBehandlingensLivslopRequestToFormValue = (
  behandlingensLivslop: Partial<IBehandlingensLivslop>
): IBehandlingensLivslopRequest => {
  const filer: File[] = []
  if (
    behandlingensLivslop &&
    behandlingensLivslop.filer &&
    behandlingensLivslop.filer?.length > 0
  ) {
    behandlingensLivslop.filer.forEach((fil) => {
      const decodedBase64File = Buffer.from(fil.fil, 'base64')
      const parsedFile = Uint8Array.from(decodedBase64File)
      const blob = new Blob([parsedFile], { type: fil.filtype })
      const file = new File([blob], fil.filnavn, { type: fil.filtype })
      filer.push(file)
    })
  }

  return {
    id: behandlingensLivslop.id || '',
    changeStamp: behandlingensLivslop.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    etterlevelseDokumentasjonId: behandlingensLivslop.etterlevelseDokumentasjonId || '',
    beskrivelse: behandlingensLivslop.beskrivelse || '',
    filer: filer,
  }
}
