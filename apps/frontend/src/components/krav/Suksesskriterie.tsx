import { Suksesskriterie } from '../../constants'
import { Markdown } from '../common/Markdown'
import { Box, Heading, Label } from '@navikt/ds-react'

export const SuksesskriterieCard = (props: { suksesskriterie: Suksesskriterie; num: number; totalt: number; fullWidth?: boolean }) => {
  const { suksesskriterie, num, totalt, fullWidth } = props

  return (
    <div className="border-b-2 border-gray-200 py-5">
      <Box>
        <Label>
          Suksesskriterium {num} av {totalt}
        </Label>
        <Heading size="small" level="2">
          {suksesskriterie.navn}
        </Heading>
        <Markdown source={suksesskriterie.beskrivelse} />
      </Box>
    </div>
  )
}
