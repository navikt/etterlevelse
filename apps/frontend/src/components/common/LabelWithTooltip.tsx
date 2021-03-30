import CustomizedStatefulTooltip from './CustomizedStatefulTooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import { React } from '@ungap/global-this'

const LabelWithToolTip = (props: {label: string, tooltip?: React.ReactNode}) => {
  if (props.tooltip) {
    return (
      <Block display="flex">
        <Block marginRight="scale200">
          {props.label}
        </Block>
        <CustomizedStatefulTooltip content={() => (<Block>{props.tooltip}</Block>)}>
          <Block $style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon title={`Hjelpetekst for ${props.label}`} icon={faQuestionCircle} color="#112D60" />
          </Block>
        </CustomizedStatefulTooltip>
      </Block>
    )
  }

  return (
    <Block>
      {props.label}
    </Block>
  )
}
export default LabelWithToolTip