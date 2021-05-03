import React from 'react'
import { PLACEMENT, StatefulTooltip, StatefulTooltipProps, TRIGGER_TYPE } from 'baseui/tooltip'

const CustomizedStatefulTooltip = (props: StatefulTooltipProps) => {

  return (
    <StatefulTooltip
      {...props}
      placement={PLACEMENT.top}
      focusLock={false}
      triggerType={TRIGGER_TYPE.click}
      ignoreBoundary={props.ignoreBoundary === false ? props.ignoreBoundary : true}
      overrides={{
        Body: {
          style: {
            maxWidth: '25%',
            wordBreak: 'break-word'
          }
        },
        ...props.overrides
      }}
    >
      {props.children}
    </StatefulTooltip>
  )
}

export default CustomizedStatefulTooltip
