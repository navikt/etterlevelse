import { IPageResponse } from '@/constants/commonConstants'
import {
  ETilbakemeldingMeldingStatus,
  ICreateTilbakemeldingRequest,
  ITilbakemelding,
  ITilbakemeldingNewMeldingRequest,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import { env } from '@/util/env/env'
import axios from 'axios'
import moment from 'moment'
import { useEffect, useState } from 'react'

export const getTilbakemeldingForKrav = async (kravNummer: number, kravVersjon: number) => {
  return (
    await axios.get<IPageResponse<ITilbakemelding>>(
      `${env.backendBaseUrl}/tilbakemelding/${kravNummer}/${kravVersjon}`
    )
  ).data
}

export const getTilbakemeldingForKravByKravNummer = async (
  kravNummer: number
): Promise<IPageResponse<ITilbakemelding>> => {
  return (
    await axios.get<IPageResponse<ITilbakemelding>>(
      `${env.backendBaseUrl}/tilbakemelding/${kravNummer}`
    )
  ).data
}

export const tilbakemeldingSlettMelding = async (request: {
  tilbakemeldingId: string
  meldingNr: number
}) => {
  return (
    await axios.delete<ITilbakemelding>(
      `${env.backendBaseUrl}/tilbakemelding/${request.tilbakemeldingId}/${request.meldingNr}`
    )
  ).data
}

export const tilbakemeldingEditMelding = async (request: {
  tilbakemeldingId: string
  meldingNr: number
  text: string
}) => {
  return (
    await axios.post<ITilbakemelding>(
      `${env.backendBaseUrl}/tilbakemelding/${request.tilbakemeldingId}/${request.meldingNr}`,
      { innhold: request.text }
    )
  ).data
}

export const updateTilbakemeldingStatusOgEndretKrav = async (request: {
  tilbakemeldingId: string
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}) => {
  return (
    await axios.post<ITilbakemelding>(
      `${env.backendBaseUrl}/tilbakemelding/status/${request.tilbakemeldingId}/${request.status}/${request.endretKrav}`
    )
  ).data
}

export const createNewTilbakemelding = async (request: ICreateTilbakemeldingRequest) => {
  return (await axios.post<ITilbakemelding>(`${env.backendBaseUrl}/tilbakemelding`, request)).data
}

export const tilbakemeldingNewMelding = async (request: ITilbakemeldingNewMeldingRequest) => {
  return (
    await axios.post<ITilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/melding`, request)
  ).data
}

export const tilbakemeldingslettMelding = async (request: {
  tilbakemeldingId: string
  meldingNr: number
}) => {
  return (
    await axios.delete<ITilbakemelding>(
      `${env.backendBaseUrl}/tilbakemelding/${request.tilbakemeldingId}/${request.meldingNr}`
    )
  ).data
}

export const useTilbakemeldinger = (
  kravNummer: number,
  kravVersjon: number
): [
  ITilbakemelding[],
  boolean,
  (tilbakemelding: ITilbakemelding) => void,
  (tilbakemelding: ITilbakemelding) => void,
  (tilbakemelding: ITilbakemelding) => void,
] => {
  const [data, setData] = useState<ITilbakemelding[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (kravNummer && kravVersjon) {
      setLoading(true)
      getTilbakemeldingForKravByKravNummer(kravNummer)
        .then((response: IPageResponse<ITilbakemelding>) => {
          setData(
            response.content.sort(
              (a: ITilbakemelding, b: ITilbakemelding) =>
                moment(b.meldinger[b.meldinger.length - 1].tid).valueOf() -
                moment(a.meldinger[a.meldinger.length - 1].tid).valueOf()
            )
          )
          setLoading(false)
        })
        .catch((error: any) => {
          setData([])
          setLoading(false)
          console.error("couldn't find krav", error)
        })
    }
  }, [kravNummer, kravVersjon])

  const add = (tilbakemelding: ITilbakemelding) => {
    setData([tilbakemelding, ...data])
  }
  const replace = (newTilbakemelding: ITilbakemelding) => {
    setData(
      data.map((tilbakemelding: ITilbakemelding) =>
        tilbakemelding.id === newTilbakemelding.id ? newTilbakemelding : tilbakemelding
      )
    )
  }
  const remove = (fjernTilbakemelding: ITilbakemelding) => {
    if (fjernTilbakemelding.meldinger.length) {
      setData(
        data.map((tilbakemelding: ITilbakemelding) => {
          if (tilbakemelding.id === fjernTilbakemelding.id) {
            return fjernTilbakemelding
          } else {
            return tilbakemelding
          }
        })
      )
    } else {
      setData(
        data.filter(
          (tilbakemelding: ITilbakemelding) => tilbakemelding.id !== fjernTilbakemelding.id
        )
      )
    }
  }

  return [data, loading, add, replace, remove] as [
    ITilbakemelding[],
    boolean,
    (tilbakemelding: ITilbakemelding) => void,
    (tilbakemelding: ITilbakemelding) => void,
    (tilbakemelding: ITilbakemelding) => void,
  ]
}
