import { ACCESSIBILITY_TYPE, PLACEMENT, StatefulTooltip, StatefulTooltipProps, TRIGGER_TYPE } from 'baseui/tooltip'

const CustomizedStatefulTooltip = (props: Partial<StatefulTooltipProps>) => {
  return (
    <StatefulTooltip
      {...props}
      placement={PLACEMENT.top}
      triggerType={TRIGGER_TYPE.click}
      accessibilityType={ACCESSIBILITY_TYPE.tooltip}
      ignoreBoundary={props.ignoreBoundary === false ? props.ignoreBoundary : true}
      dismissOnEsc
      overrides={{
        Body: {
          style: {
            maxWidth: '25%',
            wordBreak: 'break-word',
          },
        },
        ...props.overrides,
      }}
    >
      {props.children}
    </StatefulTooltip>
  )
}

export default CustomizedStatefulTooltip
