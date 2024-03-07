import axios from 'axios'
import { useEffect, useState } from 'react'
import { IPageResponse, IVirkemiddel, emptyPage } from '../constants'
import { env } from '../util/env'
import { useDebouncedState } from '../util/hooks/customHooks'

export const getAllVirkemiddel = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getVirkemiddelPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allVirkemiddel: IVirkemiddel[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allVirkemiddel = [
        ...allVirkemiddel,
        ...(await getVirkemiddelPage(currentPage, PAGE_SIZE)).content,
      ]
    }
    return allVirkemiddel
  }
}

export const getVirkemiddelPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IVirkemiddel>>(
      `${env.backendBaseUrl}/virkemiddel?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const getVirkemiddel = async (id: string) => {
  return (await axios.get<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const deleteVirkemiddel = async (id: string) => {
  return (await axios.delete<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${id}`)).data
}

export const getVirkemiddelByVirkemiddelType = async (code: string) => {
  return (
    await axios.get<IPageResponse<IVirkemiddel>>(
      `${env.backendBaseUrl}/virkemiddel/virkemiddeltype/${code}`
    )
  ).data.content
}

export const searchVirkemiddel = async (name: string) => {
  return (
    await axios.get<IPageResponse<IVirkemiddel>>(`${env.backendBaseUrl}/virkemiddel/search/${name}`)
  ).data.content
}

export const createVirkemiddel = async (virkemiddel: IVirkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.post<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel`, dto)).data
}

export const updateVirkemiddel = async (virkemiddel: IVirkemiddel) => {
  const dto = virkemiddelToVirkemiddelDto(virkemiddel)
  return (await axios.put<IVirkemiddel>(`${env.backendBaseUrl}/virkemiddel/${virkemiddel.id}`, dto))
    .data
}

export const useVirkemiddelPage = (pageSize: number) => {
  const [data, setData] = useState<IPageResponse<IVirkemiddel>>(emptyPage)
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getVirkemiddelPage(page, pageSize).then((r) => {
      setData(r)
      setLoading(false)
    })
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage, loading] as [
    IPageResponse<IVirkemiddel>,
    () => void,
    () => void,
    boolean,
  ]
}

export const useVirkemiddel = (id: string, onlyLoadOnce?: boolean) => {
  const isCreateNew = id === 'ny'
  const [data, setData] = useState<IVirkemiddel | undefined>(
    isCreateNew ? virkemiddelMapToFormVal({}) : undefined
  )

  const load = () => {
    if (data && onlyLoadOnce) return
    id && !isCreateNew && getVirkemiddel(id).then(setData)
  }
  useEffect(load, [id])

  return [data, setData, load] as [IVirkemiddel | undefined, (v?: IVirkemiddel) => void, () => void]
}

export const useSearchVirkemiddel = () => {
  const [search, setSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setSearchResult] = useState<IVirkemiddel[]>([])
  const [fullResult, setFullResult] = useState<IVirkemiddel[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      await getAllVirkemiddel().then((res) => {
        setFullResult(res)
        setSearchResult(res)
      })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (search && search.length > 2) {
        setLoading(true)

        setSearchResult(fullResult.filter((v) => v.navn.toLocaleLowerCase().includes(search)))

        setLoading(false)
      } else {
        setSearchResult(fullResult)
      }
    })()
  }, [search])

  return [searchResult, setSearch, loading] as [
    IVirkemiddel[],
    React.Dispatch<React.SetStateAction<string>>,
    boolean,
  ]
}

export const useVirkemiddelFilter = () => {
  const [data, setData] = useState<IVirkemiddel[]>([])
  const [totalDataLength, setTotalDataLenght] = useState<number>(0)
  const [virkemiddelTypeFilter, setVirkemiddelTypeFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [refetch, setRefetch] = useState<boolean>(false)

  const refetchData = () => {
    setRefetch(!refetch)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      let allVirkemiddel = await getAllVirkemiddel()
      setTotalDataLenght(allVirkemiddel.length)

      if (virkemiddelTypeFilter && virkemiddelTypeFilter !== 'alle') {
        allVirkemiddel = allVirkemiddel.filter(
          (v) => v.virkemiddelType?.code === virkemiddelTypeFilter
        )
      }

      setData(allVirkemiddel)
      setLoading(false)
    })()
  }, [virkemiddelTypeFilter, refetch])

  return [data, totalDataLength, setVirkemiddelTypeFilter, loading, refetchData] as [
    IVirkemiddel[],
    number,
    React.Dispatch<React.SetStateAction<string>>,
    boolean,
    () => void,
  ]
}

export const virkemiddelToVirkemiddelDto = (virkemiddel: IVirkemiddel): IVirkemiddel => {
  const dto = {
    ...virkemiddel,
    regelverk: virkemiddel.regelverk.map((regelverk) => ({ ...regelverk, lov: regelverk.lov.code })),
  } as any
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const virkemiddelMapToFormVal = (virkemiddel: Partial<IVirkemiddel>): IVirkemiddel => {
  return {
    id: virkemiddel.id || '',
    navn: virkemiddel.navn || '',
    changeStamp: virkemiddel.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
    version: -1,
    regelverk: virkemiddel.regelverk || [],
    virkemiddelType: virkemiddel.virkemiddelType?.code,
    livsSituasjon: virkemiddel.livsSituasjon || '',
  } as IVirkemiddel
}
