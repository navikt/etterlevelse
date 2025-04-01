import { Accordion, Tag } from '@navikt/ds-react'
import { IRisikoscenario, ITiltak } from '../../constants'
import TiltakView from './TiltakView'

interface IProps {
  tiltakList: ITiltak[]
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakAccordionList = (props: IProps) => {
  const { tiltakList, risikoscenarioList } = props

  return (
    <Accordion>
      {tiltakList.map((tiltak) => {
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header>
              {tiltak.navn}{' '}
              <div className='flex gap-2'>
                {!tiltak.ansvarlig.navIdent && <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>}
                {!tiltak.frist && <Tag variant='alt2'>Tiltaksfrist savnes</Tag>}
              </div>
            </Accordion.Header>
            <Accordion.Content>
              <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default TiltakAccordionList
