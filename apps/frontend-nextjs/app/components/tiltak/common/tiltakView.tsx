'use client'

import ReadOnlyField, {
  ReadOnlyFieldBool,
  ReadOnlyFieldDescriptionOptional,
} from '@/components/common/readOnlyFields'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { Alert, List } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'

interface IProps {
  tiltak: ITiltak
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakView = (props: IProps) => {
  const { tiltak, risikoscenarioList } = props
  const [ansvarligView, setAnsvarligView] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      let ansvarlige = ''
      if (tiltak.ansvarligTeam && tiltak.ansvarligTeam.name) {
        ansvarlige += tiltak.ansvarligTeam.name
      }
      if (
        tiltak.ansvarlig &&
        tiltak.ansvarlig.fullName &&
        tiltak.ansvarligTeam &&
        tiltak.ansvarligTeam.name
      ) {
        ansvarlige += ', '
      }
      if (tiltak.ansvarlig && tiltak.ansvarlig.fullName) {
        ansvarlige += tiltak.ansvarlig.fullName
      }
      setAnsvarligView(ansvarlige)
    })()
  }, [tiltak])

  return (
    <div className='mb-5'>
      <ReadOnlyField
        label='Tiltaksbeskrivelse:'
        description={tiltak.beskrivelse}
        className='my-3 flex gap-2'
      />

      <ReadOnlyFieldBool
        label='Tiltaksansvarlig:'
        description={ansvarligView}
        className='flex gap-2'
        isFalse={
          (!tiltak.ansvarligTeam ||
            (tiltak.ansvarligTeam && ['', null].includes(tiltak.ansvarligTeam.id))) &&
          (!tiltak.ansvarlig || (tiltak.ansvarlig && tiltak.ansvarlig.navIdent === ''))
        }
        descriptionFalse='Det er ikke satt en ansvarlig for tiltaket'
      />

      {!tiltak.iverksatt && (
        <ReadOnlyFieldBool
          label='Tiltaksfrist:'
          description={moment(tiltak.frist).format('LL')}
          className='mt-3 flex gap-2'
          isFalse={!tiltak.frist}
          descriptionFalse='Det er ikke satt en frist for tiltaket'
        />
      )}

      {tiltak.risikoscenarioIds.length > 1 && (
        <div className='mt-3'>
          <ReadOnlyFieldDescriptionOptional
            label='Tiltaket er gjenbrukt ved følgende scenarioer:'
            description='Tiltaket er ikke gjenbrukt ved andre risikoscenarioer'
            isVisible={tiltak.risikoscenarioIds.length === 1}
          />

          {tiltak.risikoscenarioIds.length > 1 && risikoscenarioList && (
            <List as='ul'>
              {risikoscenarioList
                .filter((risikoscenario) => tiltak.risikoscenarioIds.includes(risikoscenario.id))
                .map((risikoscenario) => (
                  <List.Item key={risikoscenario.id}>{risikoscenario.navn}</List.Item>
                ))}
            </List>
          )}
        </div>
      )}
      <div className='mt-3 mb-5'>
        {tiltak.iverksatt && (
          <Alert variant='success' inline>
            Tiltaket ble markert som iverksatt {moment(tiltak.iverksattDato).format('LL')}
          </Alert>
        )}
      </div>
    </div>
  )
}
export default TiltakView
