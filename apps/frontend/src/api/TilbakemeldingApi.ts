import axios from 'axios'
import {PageResponse, Tilbakemelding, TilbakemeldingRolle, TilbakemeldingType, Varslingsadresse} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'
import moment from 'moment'

export const getTilbakemeldingForKrav = async (kravNummer: number, kravVersjon: number) => {
  return (await axios.get<PageResponse<Tilbakemelding>>(`${env.backendBaseUrl}/krav/tilbakemelding/${kravNummer}/${kravVersjon}`)).data
}

export const createNewTilbakemelding = async (request: CreateTilbakemeldingRequest) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/krav/tilbakemelding`, request)).data
}

export const tilbakemeldingNewMelding = async (request: TilbakemeldingNewMeldingRequest) => {
  return (await axios.post<Tilbakemelding>(`${env.backendBaseUrl}/krav/tilbakemelding/melding`, request)).data
}

export const useTilbakemeldinger = (kravNummer: number, kravVersjon: number) => {
  const [data, setData] = useState<Tilbakemelding[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (kravNummer && kravVersjon) {
      setLoading(true)
      getTilbakemeldingForKrav(kravNummer, kravVersjon)
      .then(r => {
        setData(r.content.sort((a, b) => moment(b.meldinger[b.meldinger.length - 1].tid).valueOf() - moment(a.meldinger[a.meldinger.length - 1].tid).valueOf()))
        setLoading(false)
      }).catch(e => {
        setData([])
        setLoading(false)
        console.error('couldn\'t find krav', e)
      })
    }
  }, [kravNummer, kravVersjon])

  const add = (r: Tilbakemelding) => {
    setData([r, ...data])
  }
  const replace = (r: Tilbakemelding) => {
    setData(data.map(t => t.id === r.id ? r : t))
  }

  return [data, loading, add, replace] as [Tilbakemelding[], boolean, (t: Tilbakemelding) => void, (t: Tilbakemelding) => void]
}

export interface CreateTilbakemeldingRequest {
  kravNummer: number
  kravVersjon: number
  tittel: string
  type: TilbakemeldingType
  varslingsadresse: Varslingsadresse
  foersteMelding: string
}

export interface TilbakemeldingNewMeldingRequest {
  tilbakemeldingId: string
  melding: string
  rolle: TilbakemeldingRolle
}
