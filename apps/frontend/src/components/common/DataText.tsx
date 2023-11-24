import { default as React, ReactNode } from 'react'
import { BodyShort, Heading, Label } from '@navikt/ds-react'

type DataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  notFlexed?: boolean
  header?: boolean
  labelWidth?: string
  fullWidth?: boolean
}

const DataText = (props: DataTextProps) => {
  if (props.hideComponent) return null

  let labelWidth = 'w-48'
  if (props.labelWidth) {
    labelWidth = 'w-[' + props.labelWidth + ']'
  } else if (props.fullWidth) {
    labelWidth = 'w-full'
  }
  const getLabel = () => {
    if (props.header) {
      return (
        <div>
          <Heading size="small" level="2">
            {props.label}
          </Heading>
        </div>
      )
    } else {
      return (
        <div className={`${labelWidth} pr-2.5`}>
          <Label size={'medium'}>{props.label}</Label>
        </div>
      )
    }
  }

  return (
    <div className={`${props.notFlexed ? 'block' : 'flex'} w-full`}>
      {props.label && getLabel()}
      <div>{props.children}</div>
    </div>
  )
}

export default DataText
