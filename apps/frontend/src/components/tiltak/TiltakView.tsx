import { List } from '@navikt/ds-react'
import moment from 'moment'
import { IRisikoscenario, ITiltak } from '../../constants'
import ReadOnlyField, {
  ReadOnlyFieldBool,
  ReadOnlyFieldDescriptionOptional,
} from '../common/ReadOnlyField'

interface IProps {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakView = (props: IProps) => {
  const { tiltak, risikoscenarioList } = props

  return (
    <div>
      <ReadOnlyField
        label='Tiltaksbeskrivelse:'
        description={tiltak.beskrivelse}
        className='my-3 flex gap-2'
      />

      <ReadOnlyFieldBool
        label='Tiltaksansvarlig:'
        description={tiltak.ansvarlig.fullName}
        className='flex gap-2'
        isFalse={!tiltak.ansvarlig || (tiltak.ansvarlig && tiltak.ansvarlig.navIdent === '')}
        descriptionFalse='Det er ikke satt en ansvarlig for tiltaket'
      />

      <ReadOnlyFieldBool
        label='Tiltaksfrist:'
        description={moment(tiltak.frist).format('LL')}
        className='mt-3 flex gap-2'
        isFalse={!tiltak.frist}
        descriptionFalse='Det er ikke satt en frist for tiltaket'
      />

      <div className='mt-3'>
        <ReadOnlyFieldDescriptionOptional
          label='Tiltaket er gjenbrukt ved følgende scenarioer:'
          description='Tiltaket er ikke gjenbrukt ved andre risikoscenarioer'
          isVisible={tiltak.risikoscenarioIds.length === 0}
        />

        {tiltak.risikoscenarioIds.length !== 0 && risikoscenarioList && (
          <List as='ul'>
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
