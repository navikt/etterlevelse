import { Markdown } from '@/components/common/markdown/markdown'
import { ISuksesskriterie } from '@/constants/krav/kravConstants'
import { Box, Heading, Label } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  suksesskriterie: ISuksesskriterie
  number: number
  totalt: number
}

export const SuksesskriterieCard: FunctionComponent<TProps> = ({
  suksesskriterie,
  number,
  totalt,
}) => (
  <div className='border-b-2 border-gray-200 py-5'>
    <Box>
      <Label>
        Suksesskriterium {number} av {totalt}
      </Label>
      <Heading size='small' level='2'>
        {suksesskriterie.navn}
      </Heading>
      <Markdown source={suksesskriterie.beskrivelse} />
    </Box>
  </div>
)
