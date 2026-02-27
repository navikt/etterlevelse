import { IKrav, TKravEtterlevelseData } from '@/constants/krav/kravConstants'
import { BodyShort } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  title: string
  kravData: TKravEtterlevelseData[] | IKrav[]
}

export const KravPanelHeader: FunctionComponent<TProps> = ({ title, kravData }) => {
  let antallSuksesskriterier = 0

  kravData.forEach((krav: TKravEtterlevelseData | IKrav) => {
    antallSuksesskriterier += krav.suksesskriterier.length
  })

  return (
    <div className='flex flex-col w-full'>
      <span>{title}</span>
      <BodyShort size='small' className='mt-1 flex flex-col'>
        <span>{kravData.length} krav</span>
        <span>{antallSuksesskriterier} suksesskriterier</span>
      </BodyShort>
    </div>
  )
}
