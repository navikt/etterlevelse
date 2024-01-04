import { Block } from 'baseui/block'
import { Option } from 'baseui/select'
import { Responsive } from 'baseui/theme'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { useNavigate } from 'react-router-dom'
import { Krav, KravEtterlevelseData } from '../../constants'
import { kravRelevansOptions, sortingOptions } from '../../pages/EtterlevelseDokumentasjonTemaPage'
import { ettlevColors } from '../../util/theme'
import CustomizedSelect from '../common/CustomizedSelect'

export const KravPanelHeader = (props: { title: string; kravData: KravEtterlevelseData[] | Krav[] }) => {
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

export const KravPanelHeaderWithSorting = (props: {
  kravRelevans: readonly Option[]
  setKravRelevans: React.Dispatch<React.SetStateAction<readonly Option[]>>
  kravData: KravEtterlevelseData[] | Krav[]
  sorting: readonly Option[]
  setSorting: React.Dispatch<React.SetStateAction<readonly Option[]>>
  temaPageUrl: string
}) => {
  const navigate = useNavigate()
  let antallSuksesskriterier = 0
  props.kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  const responsiveAlignment: Responsive<any> = ['flex-start', 'flex-start', 'flex-start', 'flex-end', 'flex-end', 'flex-end']

  return (
    <Block display="flex" width="100%">
      <Block display="flex" justifyContent="center" alignItems="center">
        <LabelSmall $style={{ fontSize: '16px', lineHeight: '18px' }}>Vis:</LabelSmall>
        <Block paddingLeft="20px" paddingRight="16px" width="290px">
          <CustomizedSelect
            size="default"
            clearable={false}
            searchable={false}
            options={kravRelevansOptions}
            value={props.kravRelevans}
            onChange={(params) => {
              props.setKravRelevans(params.value)

              const newTemaPageUrl = props.temaPageUrl.split('/')
              newTemaPageUrl.pop()

              navigate(`${newTemaPageUrl.join('/')}/${params.value[0].id}`)
            }}
          />
        </Block>
        <Block paddingRight="20px" width="290px">
          <CustomizedSelect
            size="default"
            searchable={false}
            clearable={false}
            options={sortingOptions}
            value={props.sorting}
            onChange={(params) => props.setSorting(params.value)}
          />
        </Block>
      </Block>
      <Block display="flex" justifyContent="flex-end" flex="1" marginRight="26px">
        <Block>
          <Block display="flex" justifyContent="flex-end" alignItems="baseline" flex="1">
            <LabelSmall marginRight="4px" $style={{ color: ettlevColors.navOransje, fontSize: '32px', lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>
              {props.kravData.length}
            </LabelSmall>
            <ParagraphXSmall $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>krav</ParagraphXSmall>
          </Block>
          <Block display="flex" justifyContent="flex-end" flex="1">
            <ParagraphXSmall $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>{antallSuksesskriterier} suksesskriterier</ParagraphXSmall>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

export default KravPanelHeader
