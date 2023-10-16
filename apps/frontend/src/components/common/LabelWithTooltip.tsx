import * as React from 'react'
import CustomizedStatefulTooltip from './CustomizedStatefulTooltip'
import { questionmarkHoverIcon, questionmarkIcon } from '../Images'
import { Block } from 'baseui/block'
import { LabelLarge } from 'baseui/typography'
import { ettlevColors, theme } from '../../util/theme'

const LabelWithToolTip = (props: { label?: string; tooltip?: React.ReactNode; fontColor?: string; noMarginBottom?: boolean }) => {
  if (props.tooltip) {
    return (
      <Block display="flex" alignItems="center" marginBottom={props.noMarginBottom ? '0px' : theme.sizing.scale200}>
        <Block marginRight="scale200">
          <LabelLarge $style={{ color: props.fontColor ? props.fontColor : 'black' }}>{props.label}</LabelLarge>
        </Block>
        <CustomizedStatefulTooltip
          content={() => <Block>{props.tooltip}</Block>}
          showArrow
          overrides={{
            Body: {
              style: {
                border: `solid ${ettlevColors.green800} 1px`,
              },
            },
            Inner: {
              style: {
                backgroundColor: ettlevColors.green100,
                color: ettlevColors.green800,
              },
            },
            Arrow: {
              style: {
                backgroundColor: ettlevColors.green100,
                border: `solid ${ettlevColors.green800} 1px`,
              },
            },
          }}
        >
          <button type="button" style={{ border: 'none', background: 'none' }}>
            <img
              src={questionmarkIcon}
              alt={`Hjelpetekst for ${props.label}`}
              onMouseOver={(e) => (e.currentTarget.src = questionmarkHoverIcon)}
              onMouseOut={(e) => (e.currentTarget.src = questionmarkIcon)}
            />
          </button>
        </CustomizedStatefulTooltip>
      </Block>
    )
  }

  return (
    <Block>
      <LabelLarge>{props.label}</LabelLarge>
    </Block>
  )
}
export default LabelWithToolTip
