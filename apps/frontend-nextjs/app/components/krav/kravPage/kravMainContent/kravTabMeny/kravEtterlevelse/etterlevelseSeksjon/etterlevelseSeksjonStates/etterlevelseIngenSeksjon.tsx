import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { INomSeksjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  etterlevelseFilter,
  etterlevelserSorted,
  seksjonerSorted,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
  filter: string
}

export const EtterlevelseIngenSeksjon: FunctionComponent<TProps> = ({ krav, filter }) => {
  const etterlevelser: TEtterlevelseQL[] = etterlevelserSorted(krav)
  const seksjoner: INomSeksjon[] = seksjonerSorted(krav, filter)

  const label = etterlevelseFilter.filter(
    (etterlevelse: { label: string; id: string }) => etterlevelse.id === filter
  )[0].label

  return (
    <>
      {seksjoner.length === 0 && (
        <div className='flex item-center'>
          {etterlevelser.length >= 1 && <Label>Ingen etterlevelser med {label} status</Label>}
        </div>
      )}
    </>
  )
}
