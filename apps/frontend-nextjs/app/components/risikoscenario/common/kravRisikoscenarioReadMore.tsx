import { BodyLong, List, ReadMore } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  defaultOpen?: boolean
}

export const KravRisikoscenarioReadMore: FunctionComponent<TProps> = ({ defaultOpen }) => (
  <ReadMore
    defaultOpen={defaultOpen !== null ? defaultOpen : false}
    header='Slik dokumenterer dere risikoscenarioer og tiltak'
  >
    <BodyLong>
      Her dokumenter dere risikoscenarioer og tiltak som gjelder for dette kravet. Her kan dere:
    </BodyLong>
    <List>
      <List.Item>Opprette nye risikoscenarioer.</List.Item>
      <List.Item>
        Koble på eksisterende risikoscenarioer som dere har beskrevet andre steder i løsninga.
      </List.Item>
      <List.Item>Opprette nye tiltak.</List.Item>
      <List.Item>
        Koble på eksisterende tiltak som dere har beskrevet andre steder i løsninga.
      </List.Item>
    </List>
  </ReadMore>
)
