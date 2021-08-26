import {Suksesskriterie} from '../../constants'
import {Block} from 'baseui/block'
import {Card} from 'baseui/card'
import {theme} from '../../util'
import {H4, HeadingXLarge} from 'baseui/typography'
import {Markdown} from '../common/Markdown'
import {borderRadius, borderWidth, marginAll} from '../common/Style'
import {ettlevColors} from "../../util/theme";

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
            },
          },
          Contents: {
            style: {
              ...marginAll(theme.sizing.scale1200),
            },
          },
        }}
      >
        <H4 color={ettlevColors.green600}>
          SUKSESSKRITERIE {num} AV {totalt}
        </H4>
        <HeadingXLarge>{suksesskriterie.navn}</HeadingXLarge>
        <Markdown source={suksesskriterie.beskrivelse} maxWidth='650px'/>
      </Card>
    </Block>
  )
}
