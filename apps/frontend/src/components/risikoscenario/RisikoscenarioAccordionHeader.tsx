import { Accordion, Tag } from '@navikt/ds-react'
import { IRisikoscenario } from '../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
}

export const RisikoscenarioAccordianHeader = (props: IProps) => {
  const { risikoscenario } = props
  const ikkeFerdigBeskrevet =
    risikoscenario.konsekvensNivaa === 0 ||
    risikoscenario.sannsynlighetsNivaa === 0 ||
    risikoscenario.konsekvensNivaaBegrunnelse === '' ||
    risikoscenario.sannsynlighetsNivaaBegrunnelse === ''

  return (
    <Accordion.Header>
      {risikoscenario.navn}
      <div className="flex gap-2">
        {ikkeFerdigBeskrevet && <Tag variant="alt2">Det er felter som ikke er ferdig utfylt</Tag>}
        {!ikkeFerdigBeskrevet && 'ferdig'}
      </div>
    </Accordion.Header>
  )
}
export default RisikoscenarioAccordianHeader
