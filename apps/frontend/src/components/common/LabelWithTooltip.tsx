import * as React from 'react'
import CustomizedStatefulTooltip from './CustomizedStatefulTooltip'
import {questionmarkHoverIcon, questionmarkIcon} from '../Images'
import {Block} from 'baseui/block'
import {LabelMedium} from 'baseui/typography'
import {ettlevColors} from '../../util/theme'

const LabelWithToolTip = (props: { label?: string, tooltip?: React.ReactNode, fontColor?: string }) => {
  if (props.tooltip) {

    return (
      <Block display="flex" alignItems="center">
        <Block marginRight="scale200">
          <LabelMedium $style={{ color: props.fontColor ? props.fontColor : 'black' }}>
            {props.label}
          </LabelMedium>
        </Block>
        <CustomizedStatefulTooltip
          content={() => (<Block>{props.tooltip}</Block>)}
          showArrow
          overrides={{
            Body: {
              style: {
                border: 'solid #112724 1px',
              }
            },
            Inner: {
              style: {
                backgroundColor: ettlevColors.green100,
                color: '#112724'
              }
            },
            Arrow: {
              style: {
                backgroundColor: ettlevColors.green100,
                border: 'solid #112724 1px',
              }
            }
          }}
        >
          <button type='button' style={{border: 'none', background: 'none'}}>
            <img src={questionmarkIcon} alt={`Hjelpetekst for ${props.label}`}
              onMouseOver={(e) => e.currentTarget.src = questionmarkHoverIcon}
              onMouseOut={(e) => e.currentTarget.src = questionmarkIcon}
            />
          </button>
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
