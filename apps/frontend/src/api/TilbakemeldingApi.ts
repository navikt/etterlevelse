import axios from 'axios'
import moment from 'moment'
import { useEffect, useState } from 'react'
import {
  ETilbakemeldingMeldingStatus,
  ETilbakemeldingRolle,
  ETilbakemeldingType,
  IPageResponse,
  ITilbakemelding,
  IVarslingsadresse,
} from '../constants'
import { env } from '../util/env'

export const getTilbakemeldingForKrav = async (kravNummer: number, kravVersjon: number) => {
  return (
    await axios.get<IPageResponse<ITilbakemelding>>(
      `${env.backendBaseUrl}/tilbakemelding/${kravNummer}/${kravVersjon}`
    )
  ).data
}

export const getTilbakemeldingForKravByKravNummer = async (kravNummer: number) => {
  return (
    await axios.get<IPageResponse<ITilbakemelding>>(
      `${env.backendBaseUrl}/tilbakemelding/${kravNummer}`
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

export const useTilbakemeldinger = (kravNummer: number, kravVersjon: number) => {
  const [data, setData] = useState<ITilbakemelding[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (kravNummer && kravVersjon) {
      setLoading(true)
      getTilbakemeldingForKravByKravNummer(kravNummer)
        .then((r) => {
          setData(
            r.content.sort(
              (a, b) =>
                moment(b.meldinger[b.meldinger.length - 1].tid).valueOf() -
                moment(a.meldinger[a.meldinger.length - 1].tid).valueOf()
            )
          )
          setLoading(false)
        })
        .catch((e) => {
          setData([])
          setLoading(false)
          console.error("couldn't find krav", e)
        })
    }
  }, [kravNummer, kravVersjon])

  const add = (r: ITilbakemelding) => {
    setData([r, ...data])
  }
  const replace = (newTilbakemelding: ITilbakemelding) => {
    setData(data.map((tilbakemelding) => (tilbakemelding.id === newTilbakemelding.id ? newTilbakemelding : tilbakemelding)))
  }
  const remove = (fjernTilbakemelding: ITilbakemelding) => {
    if (fjernTilbakemelding.meldinger.length) {
      setData(
        data.map((tilbakemelding) => {
          if (tilbakemelding.id === fjernTilbakemelding.id) {
            return fjernTilbakemelding
          } else {
            return tilbakemelding
          }
        })
      )
    } else {
      setData(data.filter((tilbakemelding) => tilbakemelding.id !== fjernTilbakemelding.id))
    }
  }

  return [data, loading, add, replace, remove] as [
    ITilbakemelding[],
    boolean,
    (t: ITilbakemelding) => void,
    (t: ITilbakemelding) => void,
    (t: ITilbakemelding) => void,
  ]
}

export interface ICreateTilbakemeldingRequest {
  kravNummer: number
  kravVersjon: number
  type: ETilbakemeldingType
  varslingsadresse: IVarslingsadresse
  foersteMelding: string
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface ITilbakemeldingNewMeldingRequest {
  tilbakemeldingId: string
  melding: string
  rolle: ETilbakemeldingRolle
  status: ETilbakemeldingMeldingStatus
  endretKrav: boolean
}
