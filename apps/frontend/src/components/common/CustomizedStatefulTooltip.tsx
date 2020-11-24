import React from "react";
import {PLACEMENT, StatefulTooltip, StatefulTooltipProps} from "baseui/tooltip";

const CustomizedStatefulTooltip = (props: StatefulTooltipProps) => {
  return (
    <StatefulTooltip
      {...props}
      placement={PLACEMENT.top}
      focusLock={false}
      ignoreBoundary={props.ignoreBoundary === false ? props.ignoreBoundary : true}
      overrides={{
        Body: {
          style: {
            maxWidth: '25%',
            wordBreak: 'break-word'
          }
        }
      }}
    >
      {props.children}
    </StatefulTooltip>
  )
}

export default CustomizedStatefulTooltip
