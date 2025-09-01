import { ContentLayout } from '@/components/others/layout/content/content'
import { IKrav, TKravEtterlevelseData } from '@/constants/krav/kravConstants'
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
    <ContentLayout>
      <div className='flex justify-center items-center'>
        <span>{title}</span>
      </div>
      <div className='flex justify-end flex-1 mr-6'>
        <div>
          <div className='flex justify-end align-baseline flex-1'>
            <span className='mr-1'>{kravData.length}</span>
            <span>krav</span>
          </div>
          <div className='flex justify-end flex-1'>
            <span>{antallSuksesskriterier} suksesskriterier</span>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
