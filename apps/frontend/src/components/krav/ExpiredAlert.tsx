import { Block } from 'baseui/block'
import { Paragraph2 } from 'baseui/typography'
import { KravVersjon } from '../../constants'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import CustomizedLink from '../common/CustomizedLink'
import { padding, borderColor, borderWidth, borderStyle, borderRadius } from '../common/Style'
import { warningAlert } from '../Images'

const ExpiredAlert = ({ alleKravVersjoner }: { alleKravVersjoner: KravVersjon[] }) => (
  <Block
    width="fit-content"
    display="flex"
    backgroundColor={ettlevColors.warning50}
    $style={{
      ...padding('12px', '16px'),
      ...borderColor('#D47B00'),
      ...borderWidth('1px'),
      ...borderStyle('solid'),
      ...borderRadius('4px'),
    }}
  >
    <img src={warningAlert} alt="" />
    <Paragraph2 marginLeft={theme.sizing.scale500} marginTop="0px" marginBottom="0px">
      Dette er en utgått versjon. Gjeldende versjon:{' '}
      <CustomizedLink href={`/krav/${alleKravVersjoner[0].kravNummer}/${alleKravVersjoner[0].kravVersjon}`}>
        K{alleKravVersjoner[0].kravNummer}.{alleKravVersjoner[0].kravVersjon}
      </CustomizedLink>
    </Paragraph2>
  </Block>
)

export default ExpiredAlert
