import axios from 'axios'
import {PageResponse, Tilbakemelding} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'

export const getTilbakemeldingForKrav = async (kravNummer: number, kravVersjon: number) => {
  return (await axios.get<PageResponse<Tilbakemelding>>(`${env.backendBaseUrl}/krav/tilbakemelding/${kravNummer}/${kravVersjon}`)).data
}

export const useTilbakemeldinger = (kravNummer: number, kravVersjon: number) => {
  const [data, setData] = useState<Tilbakemelding[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (kravNummer && kravVersjon) {
      setLoading(true)
      getTilbakemeldingForKrav(kravNummer, kravVersjon)
      .then(r => {
        setData(r.content)
        setLoading(false)
      }).catch(e => {
        setData([])
        setLoading(false)
        console.error('couldn\'t find krav', e)
      })
    }
  }, [kravNummer, kravVersjon])

  return [data, loading] as [Tilbakemelding[], boolean]
}
