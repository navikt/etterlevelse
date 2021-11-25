import {Block} from 'baseui/block'
import {Card} from 'baseui/card'
import {Paragraph4} from 'baseui/typography'
import {KravStatus} from '../../constants'
import {kravStatus} from '../../pages/KravPage'
import {ettlevColors} from '../../util/theme'
import {borderColor, borderRadius, borderStyle, borderWidth, marginAll} from '../common/Style'

export const KravStatusView = ({ status }: { status: KravStatus }) => {
  const getStatusDisplay = (background: string, border: string) => (
    <Block width="fit-content">
      <Card
        overrides={{
          Contents: {
            style: {
              ...marginAll('4px'),
            },
          },
          Body: {
            style: {
              ...marginAll('4px'),
            },
          },
          Root: {
            style: {
              // Did not use border, margin and border radius to remove warnings.
              backgroundColor: background,
              ...borderColor(border),
              ...borderWidth('1px'),
              ...borderStyle('solid'),
              ...borderRadius('4px'),
            },
          },
        }}
      >
        <Paragraph4 $style={{ color: ettlevColors.navMorkGra, ...marginAll('0px') }}>{kravStatus(status)}</Paragraph4>
      </Card>
    </Block>
  )

  if (status === KravStatus.UTKAST) {
    return getStatusDisplay('#FFECCC', '#D47B00')
  } else if (status === KravStatus.AKTIV) {
    return getStatusDisplay(ettlevColors.green50, ettlevColors.green400)
  } else if (status === KravStatus.UTGAATT) {
    return getStatusDisplay(ettlevColors.grey50, ettlevColors.grey200)
  } else {
    return getStatusDisplay('#E0D8E9', '#8269A2')
  }
}
export default KravStatusView
