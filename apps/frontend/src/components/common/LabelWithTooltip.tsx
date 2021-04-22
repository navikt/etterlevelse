import * as React from 'react'
import CustomizedStatefulTooltip from './CustomizedStatefulTooltip'
import { questionmarkIcon, questionmarkHoverIcon } from '../Images'
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
                backgroundColor: '#CCD9D7',
                color: '#112724'
              }
            },
            Arrow: {
              style: {
                backgroundColor: '#CCD9D7',
                border: 'solid #112724 1px',
              }
            }
          }}
        >
          <Block $style={{ cursor: 'pointer' }}>
            <img src={questionmarkIcon} alt={`Hjelpetekst for ${props.label}`}
              onMouseOver={(e) => e.currentTarget.src = questionmarkHoverIcon}
              onMouseOut={(e) => e.currentTarget.src = questionmarkIcon}
            />
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