import { BodyLong, Label } from '@navikt/ds-react'
import { ITiltak } from '../../constants'

interface IProps {
  tiltak: ITiltak
}

export const TiltakView = (props: IProps) => {
  const { tiltak } = props

  return (
    <div>
      <div className="my-3">
        <BodyLong>{tiltak.beskrivelse}</BodyLong>
      </div>
      <div className="flex gap-2">
        <Label>Tiltaksansvarlig</Label>
        <BodyLong>{tiltak.ansvarlig.fullName}</BodyLong>
      </div>
      <div className="mt-3 flex gap-2">
        <Label>Tiltaksfrist</Label>
        <BodyLong>{tiltak.frist}</BodyLong>
      </div>

      <div className="mt-3">
        <Label>Tiltaket er gjenbrukt ved følgende scenarioer: </Label>
        {tiltak.risikoscenarioIds.length === 0 && (
          <BodyLong>Tiltaket er ikke gjenbrukt ved andre risikoscenarioer</BodyLong>
        )}

        {tiltak.risikoscenarioIds.length !== 0 &&
          tiltak.risikoscenarioIds.map((id) => <BodyLong key={id}>{id}</BodyLong>)}
      </div>
    </div>
  )
}
export default TiltakView
