import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { Accordion, Tag } from '@navikt/ds-react'
import TiltakView from './tiltakView'

interface IProps {
  tiltakList: ITiltak[]
  risikoscenarioList: IRisikoscenario[]
}

export const TiltakAccordionListReadOnly = (props: IProps) => {
  const { tiltakList, risikoscenarioList } = props

  return (
    <Accordion>
      {tiltakList.map((tiltak) => {
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header>
              {tiltak.navn}{' '}
              <div className='flex gap-2'>
                {!tiltak.ansvarlig.navIdent && !tiltak.ansvarligTeam.name && (
                  <Tag variant='alt2'>Tiltaksansvarlig savnes</Tag>
                )}
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

export default TiltakAccordionListReadOnly
