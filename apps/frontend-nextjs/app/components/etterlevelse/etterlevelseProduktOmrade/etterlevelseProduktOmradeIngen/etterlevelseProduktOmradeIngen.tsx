import { TEtterlevelseQL } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ITeam } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  etterlevelseFilter,
  etterlevelserSorted,
  produktOmradeSorted,
} from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
  filter: string
}

export const EtterlevelseProduktOmradeIngen: FunctionComponent<TProps> = ({ krav, filter }) => {
  const etterlevelser: TEtterlevelseQL[] = etterlevelserSorted(krav)
  const produktOmrade: ITeam[] = produktOmradeSorted(krav, filter)

  const label = etterlevelseFilter.filter(
    (etterlevelse: { label: string; id: string }) => etterlevelse.id === filter
  )[0].label

  return (
    <>
      {produktOmrade.length === 0 && (
        <div className='flex item-center'>
          {etterlevelser.length >= 1 && <Label>Ingen etterlevelser med {label} status</Label>}
        </div>
      )}
    </>
  )
}
