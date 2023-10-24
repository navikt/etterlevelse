import {Suksesskriterie} from '../../constants'
import {Markdown} from '../common/Markdown'
import {Box, Heading, Label} from "@navikt/ds-react";

export const SuksesskriterieCard = (props: { suksesskriterie: Suksesskriterie; num: number; totalt: number; fullWidth?: boolean }) => {
  const {suksesskriterie, num, totalt, fullWidth} = props

  return (
    <div className={"mb-6 px-8 bg-white"}>
      <Box padding="6">
        <Label>Suksesskriterium {num} av {totalt}</Label>
        <Heading size={"large"}>{suksesskriterie.navn}</Heading>
        <Markdown source={suksesskriterie.beskrivelse}/>
      </Box>
    </div>
  )
}
