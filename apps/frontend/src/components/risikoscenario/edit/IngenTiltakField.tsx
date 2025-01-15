import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
}

export const IngenTiltakField = (props: IProps) => {
  const { risikoscenario } = props
  return <div> {risikoscenario.navn}</div>
}
export default IngenTiltakField
