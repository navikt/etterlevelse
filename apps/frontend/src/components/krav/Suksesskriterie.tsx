import { Box, Heading, Label } from '@navikt/ds-react'
import { ISuksesskriterie } from '../../constants'
import { Markdown } from '../common/Markdown'

export const SuksesskriterieCard = (props: {
  suksesskriterie: ISuksesskriterie
  num: number
  totalt: number
  fullWidth?: boolean
}) => {
  const { suksesskriterie, num, totalt } = props

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
