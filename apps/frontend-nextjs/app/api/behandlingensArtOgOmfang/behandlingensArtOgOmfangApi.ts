import axios, { AxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { env } from '@/util/env/env'

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

export const useBehandlingensArtOgOmfang = (etterlevelseDokumentasjonId?: string) => {
  const [data, setData] = useState<IBehandlingensArtOgOmfang>(
    mapBehandlingensArtOgOmfangToFormValue({})
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const abortedRef = useRef(false)

  useEffect(() => {
    abortedRef.current = false
    if (etterlevelseDokumentasjonId) {
      ;(async () => {
        setIsLoading(true)
        await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(etterlevelseDokumentasjonId)
          .then(async (artOfOmfang) => {
            if (!abortedRef.current && artOfOmfang) {
              setData(artOfOmfang)
            }
          })
          .catch(async (error: AxiosError) => {
            if (error.status === 404) {
              setData(mapBehandlingensArtOgOmfangToFormValue({}))
            }
          })
          .finally(() => {
            if (!abortedRef.current) {
              setIsLoading(false)
            }
          })
      })()
    }
    return () => {
      abortedRef.current = true
    }
  }, [etterlevelseDokumentasjonId])

  return [data, setData, isLoading] as [
    IBehandlingensArtOgOmfang,
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
    etterlevelseDokumentasjonId: artOgOmfang.etterlevelseDokumentasjonId || '',
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
