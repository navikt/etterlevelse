import { Accordion } from '@navikt/ds-react'
import { ITiltak } from '../../constants'

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
            <Accordion.Content>test</Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion>
  )
}

export default TiltakAccordionList
