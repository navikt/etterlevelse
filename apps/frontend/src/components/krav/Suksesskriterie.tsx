import { Suksesskriterie } from '../../constants'
import { Block } from 'baseui/block'
import { Card } from 'baseui/card'
import { theme } from '../../util'
import { HeadingMedium, HeadingXLarge, LabelLarge } from 'baseui/typography'
import { Markdown } from '../common/Markdown'
import { borderRadius, borderWidth, marginAll } from '../common/Style'
import { ettlevColors, pageWidth } from '../../util/theme'

export const SuksesskriterieCard = (props: { suksesskriterie: Suksesskriterie; num: number; totalt: number;  fullWidth?: boolean}) => {
  const { suksesskriterie, num, totalt, fullWidth } = props

  return (
    <Block marginBottom={theme.sizing.scale800}>
      <Card
        overrides={{
          Root: {
            style: {
              ...borderRadius('4px'),
              ...borderWidth('1px'),
              maxWidth: fullWidth ? '100%' : pageWidth,
            },
          },
          Contents: {
            style: {
              ...marginAll(theme.sizing.scale1200),
            },
          },
        }}
      >
        <LabelLarge color={ettlevColors.green600}>
          Suksesskriterium {num} av {totalt}
        </LabelLarge>
        <HeadingXLarge>{suksesskriterie.navn}</HeadingXLarge>
        <Markdown source={suksesskriterie.beskrivelse} maxWidth={fullWidth ? '100%' : "650px"} />
      </Card>
    </Block>
  )
}
