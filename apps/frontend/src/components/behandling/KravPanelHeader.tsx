import { JustifyContent, Block, Display } from 'baseui/block'
import { Responsive } from 'baseui/theme'
import { HeadingLarge, Label3, Paragraph4 } from 'baseui/typography'
import { Krav, KravEtterlevelseData } from '../../constants'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import CustomizedSelect from '../common/CustomizedSelect'
import { Option } from 'baseui/select'
import { kravRelevansOptions, sortingOptions } from '../../pages/BehandlingerTemaPageV2'

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']

export const KravPanelHeader = (props: { title: string; kravData: KravEtterlevelseData[] | Krav[] }) => {
  let antallSuksesskriterier = 0

  props.kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  const responsiveAlignment: Responsive<JustifyContent> = ['flex-start', 'flex-start', 'flex-start', 'flex-end', 'flex-end', 'flex-end']

  return (
    <Block display={responsiveBreakPoints} width="100%">
      <Block display="flex" justifyContent="center">
        <HeadingLarge $style={{ lineHeight: '35px' }} marginTop={theme.sizing.scale100} marginBottom={theme.sizing.scale100} color={ettlevColors.green600}>
          {props.title}
        </HeadingLarge>
      </Block>
      <Block display="flex" justifyContent={responsiveAlignment} flex="1" marginRight="26px">
        <Block>
          <Block display="flex" justifyContent={responsiveAlignment} alignItems="baseline" flex="1">
            <Label3 marginRight="4px" $style={{ color: ettlevColors.navOransje, fontSize: '20px', lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>
              {props.kravData.length}
            </Label3>
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>krav</Paragraph4>
          </Block>
          <Block display="flex" justifyContent={responsiveAlignment} flex="1">
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>{antallSuksesskriterier} suksesskriterier</Paragraph4>
          </Block>
        </Block>
      </Block>
    </Block>
  )
}


export const KravPanelHeaderWithSorting = (props: { kravRelevans: readonly Option[], setKravRelevans: React.Dispatch<React.SetStateAction<readonly Option[]>>, kravData: KravEtterlevelseData[] | Krav[], sorting: readonly Option[], setSorting: React.Dispatch<React.SetStateAction<readonly Option[]>> }) => {
  let antallSuksesskriterier = 0

  props.kravData.forEach((k) => {
    antallSuksesskriterier += k.suksesskriterier.length
  })

  const responsiveAlignment: Responsive<JustifyContent> = ['flex-start', 'flex-start', 'flex-start', 'flex-end', 'flex-end', 'flex-end']

  return (
    <Block display={responsiveBreakPoints} width="100%">
      <Block display="flex" justifyContent="center" alignItems="center">
        <Label3 $style={{ fontSize: '16px', lineHeight: '18px' }}>
          Vis:
        </Label3>
        <Block paddingLeft="20px" paddingRight="16px" width="290px">
          <CustomizedSelect
            size="default"
            clearable={false}
            searchable={false}
            options={kravRelevansOptions}
            value={props.kravRelevans}
            onChange={(params) => props.setKravRelevans(params.value)}
          />
        </Block>
        <Block paddingRight="20px" width="290px">
          <CustomizedSelect size="default" searchable={false} clearable={false} options={sortingOptions} value={props.sorting} onChange={(params) => props.setSorting(params.value)} />
        </Block>
      </Block>
      <Block display="flex" justifyContent={responsiveAlignment} flex="1" marginRight="26px">
        <Block>
          <Block display="flex" justifyContent={responsiveAlignment} alignItems="baseline" flex="1">
            <Label3 marginRight="4px" $style={{ color: ettlevColors.navOransje, fontSize: '32px', lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>
              {props.kravData.length}
            </Label3>
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>krav</Paragraph4>
          </Block>
          <Block display="flex" justifyContent={responsiveAlignment} flex="1">
            <Paragraph4 $style={{ lineHeight: '21px', marginTop: '0px', marginBottom: '0px' }}>{antallSuksesskriterier} suksesskriterier</Paragraph4>
          </Block>
        </Block>
      </Block>
    </Block>
  )

}

export default KravPanelHeader
