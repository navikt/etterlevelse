import { Block } from 'baseui/block'
import { Card, CardOverrides } from 'baseui/card'
import { Paragraph4 } from 'baseui/typography'
import _ from 'lodash'
import { KravStatus } from '../../constants'
import { kravStatus } from '../../pages/KravPage'
import { ettlevColors } from '../../util/theme'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll } from './Style'

export const StatusView = ({
  status,
  statusDisplay,
  overrides,
  background,
  icon
}: {
  status: KravStatus | string
  statusDisplay?: { background: string; border?: string }
  background?: string
  overrides?: CardOverrides
  icon?: React.ReactNode
}) => {
  const getStatusDisplay = (background: string, border?: string) => {
    const cardOverrides: CardOverrides = {
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
    }

    const customOverrides = _.merge(cardOverrides, overrides)

    return (
      <Block width="fit-content">
        <Card overrides={customOverrides}>
          <Block display="flex" justifyContent="center">
            {icon}
            <Paragraph4 $style={{ color: ettlevColors.navMorkGra, ...marginAll('0px'), whiteSpace: 'nowrap', marginLeft: icon ? '10px' : undefined }}>{kravStatus(status)}</Paragraph4>
          </Block>
        </Card>
      </Block>
    )
  }

  if (statusDisplay) {
    return getStatusDisplay(background ? background : statusDisplay.background, statusDisplay.border)
  } else if (status === KravStatus.UTKAST) {
    return getStatusDisplay(background ? background : '#FFECCC', '#D47B00')
  } else if (status === KravStatus.AKTIV) {
    return getStatusDisplay(background ? background : ettlevColors.green50, ettlevColors.green400)
  } else if (status === KravStatus.UTGAATT) {
    return getStatusDisplay(background ? background : ettlevColors.grey50, ettlevColors.grey200)
  } else {
    return getStatusDisplay('#E0D8E9', '#8269A2')
  }
}
export default StatusView
