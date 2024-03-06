import { IKrav, TKravEtterlevelseData } from '../../constants'

export const KravPanelHeader = (props: {
  title: string
  kravData: TKravEtterlevelseData[] | IKrav[]
}) => {
  let antallSuksesskriterier = 0

  props.kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  return (
    <div className={'flex w-full'}>
      <div className={'flex justify-center items-center'}>
        <span>{props.title}</span>
      </div>
      <div className={'flex justify-end flex-1 mr-6'}>
        <div>
          <div className={'flex justify-end align-baseline flex-1'}>
            <span className={'mr-1'}>{props.kravData.length}</span>
            <span>krav</span>
          </div>
          <div className={'flex justify-end flex-1'}>
            <span>{antallSuksesskriterier} suksesskriterier</span>
          </div>
        </div>
      </div>
    </div>
  )
}
