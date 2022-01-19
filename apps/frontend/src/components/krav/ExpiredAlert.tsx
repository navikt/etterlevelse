import { Block } from 'baseui/block'
import { Paragraph2 } from 'baseui/typography'
import { KravStatus, KravVersjon } from '../../constants'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import CustomizedLink from '../common/CustomizedLink'
import { borderColor, borderRadius, borderStyle, borderWidth, padding } from '../common/Style'
import { warningAlert } from '../Images'
import { kravStatus } from '../../pages/KravPage'

const ExpiredAlert = ({ alleKravVersjoner, statusName }: { alleKravVersjoner: KravVersjon[]; statusName?: KravStatus }) => (
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
      Denne versjonen er {statusName ? `${kravStatus(statusName).toLocaleLowerCase()}` : 'utgått'}.
      {alleKravVersjoner.length > 1 ?
        <>
          Gjeldende versjon:{' '}
          <CustomizedLink href={`/krav/${alleKravVersjoner[0].kravNummer}/${alleKravVersjoner[0].kravVersjon}`}>
            K{alleKravVersjoner[0].kravNummer}.{alleKravVersjoner[0].kravVersjon}
          </CustomizedLink>
        </> : ''}
    </Paragraph2>
  </Block>
)

export default ExpiredAlert
