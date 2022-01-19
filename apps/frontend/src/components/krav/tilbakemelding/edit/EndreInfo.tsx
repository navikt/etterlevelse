import { Block } from 'baseui/block'
import { ParagraphSmall } from 'baseui/typography'
import moment from 'moment'
import { TilbakemeldingMelding } from '../../../../constants'
import { PersonName } from '../../../common/PersonName'

export const EndretInfo = (props: { melding: TilbakemeldingMelding }) => {
  if (!props.melding.endretAvIdent) return null
  return (
    <Block justifyContent="flex-end" display="flex" width="100%">
      <ParagraphSmall marginBottom="0px" marginTop="0px" $style={{ fontSize: '14px' }}>
        Sist endret av <PersonName ident={props.melding.endretAvIdent} /> - {moment(props.melding.endretTid).format('lll')}
      </ParagraphSmall>
    </Block>
  )
}
export default EndretInfo
