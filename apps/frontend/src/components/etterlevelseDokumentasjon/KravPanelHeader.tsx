/* TODO USIKKER */
import { Option } from 'baseui/select'
import { LabelSmall, ParagraphXSmall } from 'baseui/typography'
import { useNavigate } from 'react-router-dom'
import { IKrav, TKravEtterlevelseData } from '../../constants'
import { kravRelevansOptions, sortingOptions } from '../../pages/EtterlevelseDokumentasjonTemaPage'
import { ettlevColors } from '../../util/theme'
import CustomizedSelect from '../common/CustomizedSelect'

interface IPropsKravPanelHeader {
  title: string
  kravData: TKravEtterlevelseData[] | IKrav[]
}

export const KravPanelHeader = (props: IPropsKravPanelHeader) => {
  const { title, kravData } = props
  let antallSuksesskriterier = 0

  kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  return (
    <div className="flex w-full">
      <div className="flex justify-center items-center">
        <span>{title}</span>
      </div>
      <div className="flex justify-end flex-1 mr-6">
        <div>
          <div className="flex justify-end align-baseline flex-1">
            <span className="mr-1">{kravData.length}</span>
            <span>krav</span>
          </div>
          <div className="flex justify-end flex-1">
            <span>{antallSuksesskriterier} suksesskriterier</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface IPropsKravPanelHeaderWithSorting {
  kravRelevans: readonly Option[]
  setKravRelevans: React.Dispatch<React.SetStateAction<readonly Option[]>>
  kravData: TKravEtterlevelseData[] | IKrav[]
  sorting: readonly Option[]
  setSorting: React.Dispatch<React.SetStateAction<readonly Option[]>>
  temaPageUrl: string
}

export const KravPanelHeaderWithSorting = (props: IPropsKravPanelHeaderWithSorting) => {
  const { kravRelevans, setKravRelevans, kravData, sorting, setSorting, temaPageUrl } = props
  const navigate = useNavigate()
  let antallSuksesskriterier = 0
  kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  return (
    <div className="flex w-full">
      <div className="flex justify-center items-center">
        <LabelSmall $style={{ fontSize: '16px', lineHeight: '18px' }}>Vis:</LabelSmall>
        <div className="w-72 pl-5 pr-4">
          <CustomizedSelect
            size="default"
            clearable={false}
            searchable={false}
            options={kravRelevansOptions}
            value={kravRelevans}
            onChange={(params) => {
              setKravRelevans(params.value)

              const newTemaPageUrl = temaPageUrl.split('/')
              newTemaPageUrl.pop()

              navigate(`${newTemaPageUrl.join('/')}/${params.value[0].id}`)
            }}
          />
        </div>
        <div className="w-72 pr-5">
          <CustomizedSelect
            size="default"
            searchable={false}
            clearable={false}
            options={sortingOptions}
            value={sorting}
            onChange={(params) => setSorting(params.value)}
          />
        </div>
      </div>
      <div className="flex justify-end flex-1 mr-6">
        <div>
          <div className="flex justify-end items-baseline flex-1">
            <LabelSmall
              marginRight="4px"
              $style={{
                color: ettlevColors.navOransje,
                fontSize: '32px',
                lineHeight: '21px',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              {kravData.length}
            </LabelSmall>
            <ParagraphXSmall $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>
              krav
            </ParagraphXSmall>
          </div>
          <div className="flex justify-end flex-1">
            <ParagraphXSmall $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>
              {antallSuksesskriterier} suksesskriterier
            </ParagraphXSmall>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KravPanelHeader
