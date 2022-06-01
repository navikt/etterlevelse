import { Suksesskriterie } from '../../constants'
import { Block } from 'baseui/block'
import { Card } from 'baseui/card'
import { theme } from '../../util'
import { HeadingMedium, HeadingXLarge } from 'baseui/typography'
import { Markdown } from '../common/Markdown'
import { borderRadius, borderWidth, marginAll } from '../common/Style'
import { ettlevColors, pageWidth } from '../../util/theme'

export const SuksesskriterieCard = (props: { suksesskriterie: Suksesskriterie; num: number; totalt: number }) => {
  const { suksesskriterie, num, totalt } = props

  return (
    <Block marginBottom={theme.sizing.scale800}>
      <Card
        overrides={{
          Root: {
            style: {
              ...borderRadius('4px'),
              ...borderWidth('1px'),
              maxWidth: pageWidth,
            },
          },
          Contents: {
            style: {
              ...marginAll(theme.sizing.scale1200),
            },
          },
        }}
      >
        <HeadingMedium color={ettlevColors.green600}>
          SUKSESSKRITERIE {num} AV {totalt}
        </HeadingMedium>
        <HeadingXLarge>{suksesskriterie.navn}</HeadingXLarge>
        <Markdown source={suksesskriterie.beskrivelse} maxWidth="650px" />
      </Card>
    </Block>
  )
}
