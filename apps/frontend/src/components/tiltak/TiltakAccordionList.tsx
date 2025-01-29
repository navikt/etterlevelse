import { Accordion, Tag } from '@navikt/ds-react'
import { ITiltak } from '../../constants'
import TiltakView from './TiltakView'

interface IProps {
  tiltakList: ITiltak[]
}

export const TiltakAccordionList = (props: IProps) => {
  const { tiltakList } = props

  return (
    <Accordion>
      {tiltakList.map((tiltak) => {
        return (
          <Accordion.Item key={tiltak.id}>
            <Accordion.Header>
              {tiltak.navn}{' '}
              <div className="flex gap-2">
                {!tiltak.ansvarlig.navIdent && <Tag variant="alt2">Tiltaksansvarlig savnes</Tag>}
                {!tiltak.frist && <Tag variant="alt2">Tiltaksfrist savnes</Tag>}
              </div>
            </Accordion.Header>
            <Accordion.Content>
              <TiltakView tiltak={tiltak} />
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default TiltakAccordionList
