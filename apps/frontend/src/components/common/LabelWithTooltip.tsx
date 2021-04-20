import * as React from 'react'
import CustomizedStatefulTooltip from './CustomizedStatefulTooltip'
import { questionmarkIcon } from '../Images'
import { Block } from 'baseui/block'
import { LabelMedium } from 'baseui/typography'

const LabelWithToolTip = (props: { label?: string, tooltip?: React.ReactNode, fontColor?: string }) => {
  if (props.tooltip) {
    return (
      <Block display="flex" alignItems="center">
        <Block marginRight="scale200">
          <LabelMedium $style={{ color: props.fontColor ? props.fontColor : 'black' }}>
            {props.label}
          </LabelMedium>
        </Block>
        <CustomizedStatefulTooltip content={() => (<Block>{props.tooltip}</Block>)}>
          <Block $style={{ cursor: 'pointer' }}>
            <img src={questionmarkIcon} alt={`Hjelpetekst for ${props.label}`} />
          </Block>
        </CustomizedStatefulTooltip>
      </Block>
    )
  }

  return (
    <Block>
      <LabelMedium>
        {props.label}
      </LabelMedium>
    </Block>
  )
}
export default LabelWithToolTip