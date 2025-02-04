import { BodyLong, Label, List } from '@navikt/ds-react'
import { IRisikoscenario, ITiltak } from '../../constants'

interface IProps {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakView = (props: IProps) => {
  const { tiltak, risikoscenarioList } = props

  return (
    <div>
      <div className="my-3 flex gap-2">
        <Label>Tiltaksbeskrivelse:</Label>
        <BodyLong>{tiltak.beskrivelse}</BodyLong>
      </div>
      <div className="flex gap-2">
        <Label>Tiltaksansvarlig:</Label>
        <BodyLong>
          {tiltak.ansvarlig.fullName
            ? tiltak.ansvarlig.fullName
            : 'Det er ikke satt en ansvarlig for tiltaket'}
        </BodyLong>
      </div>
      <div className="mt-3 flex gap-2">
        <Label>Tiltaksfrist:</Label>
        <BodyLong>{tiltak.frist}</BodyLong>
      </div>

      <div className="mt-3">
        <Label>Tiltaket er gjenbrukt ved følgende scenarioer: </Label>

        {tiltak.risikoscenarioIds.length === 0 && (
          <BodyLong>Tiltaket er ikke gjenbrukt ved andre risikoscenarioer</BodyLong>
        )}

        {tiltak.risikoscenarioIds.length !== 0 && risikoscenarioList && (
          <List as="ul">
            {risikoscenarioList
              .filter((risikoscenario) => tiltak.risikoscenarioIds.includes(risikoscenario.id))
              .map((risikoscenario) => (
                <List.Item key={risikoscenario.id}>{risikoscenario.navn}</List.Item>
              ))}
          </List>
        )}
      </div>
    </div>
  )
}
export default TiltakView
