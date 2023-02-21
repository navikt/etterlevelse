import axios from 'axios'
import { PageResponse, Tilbakemelding, TilbakemeldingMeldingStatus, TilbakemeldingRolle, TilbakemeldingType, Varslingsadresse } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import moment from 'moment'
import _ from 'lodash'

export const getTilbakemeldingForKrav = async (kravNummer: number, kravVersjon: number) => {
  return (await axios.get<PageResponse<Tilbakemelding>>(`${env.backendBaseUrl}/tilbakemelding/${kravNummer}/${kravVersjon}`)).data
}

export const createNewTilbakemelding = async (request: CreateTilbakemeldingRequest) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/tilbakemelding`, request)).data
}

export const tilbakemeldingNewMelding = async (request: TilbakemeldingNewMeldingRequest) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/melding`, request)).data
}

export const tilbakemeldingEditMelding = async (request: { tilbakemeldingId: string; meldingNr: number; text: string }) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/${request.tilbakemeldingId}/${request.meldingNr}`, { innhold: request.text })).data
}

export const tilbakemeldingslettMelding = async (request: { tilbakemeldingId: string; meldingNr: number }) => {
  return (await axios.delete<Tilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/${request.tilbakemeldingId}/${request.meldingNr}`)).data
}

export const updateTilbakemeldingStatusOgEndretKrav = async (request: { tilbakemeldingId: string; status: TilbakemeldingMeldingStatus; endretKrav: boolean }) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/tilbakemelding/status/${request.tilbakemeldingId}/${request.status}/${request.endretKrav}`)).data
}

export const useTilbakemeldinger = (kravNummer: number, kravVersjon: number) => {
  const [data, setData] = useState<Tilbakemelding[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (kravNummer && kravVersjon) {
      setLoading(true)
      getTilbakemeldingForKrav(kravNummer, kravVersjon)
        .then((r) => {
          setData(r.content.sort((a, b) => moment(b.meldinger[b.meldinger.length - 1].tid).valueOf() - moment(a.meldinger[a.meldinger.length - 1].tid).valueOf()))
          setLoading(false)
        })
        .catch((e) => {
          setData([])
          setLoading(false)
          console.error("couldn't find krav", e)
        })
    }
  }, [kravNummer, kravVersjon])

  const add = (r: Tilbakemelding) => {
    setData([r, ...data])
  }
  const replace = (r: Tilbakemelding) => {
    setData(data.map((t) => (t.id === r.id ? r : t)))
  }
  const remove = (r: Tilbakemelding) => {
    if (r.meldinger.length) {
      setData(
        data.map((t) => {
          if (t.id === r.id) {
            return r
          } else {
            return t
          }
        }),
      )
    } else {
      setData(data.filter((t) => t.id !== r.id))
    }
  }

  return [data, loading, add, replace, remove] as [Tilbakemelding[], boolean, (t: Tilbakemelding) => void, (t: Tilbakemelding) => void, (t: Tilbakemelding) => void]
}

export interface CreateTilbakemeldingRequest {
  kravNummer: number
  kravVersjon: number
  type: TilbakemeldingType
  varslingsadresse: Varslingsadresse
  foersteMelding: string
  status: TilbakemeldingMeldingStatus
  endretKrav: boolean
}

export interface TilbakemeldingNewMeldingRequest {
  tilbakemeldingId: string
  melding: string
  rolle: TilbakemeldingRolle
  status: TilbakemeldingMeldingStatus
  endretKrav: boolean
}
