import { Accordion } from '@navikt/ds-react'
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
            <Accordion.Header>{tiltak.navn}</Accordion.Header>
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
