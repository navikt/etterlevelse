import {default as React, ReactNode} from 'react'
import {BodyShort, Heading, Label} from "@navikt/ds-react";

type DataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  notFlexed?: boolean
  header?: boolean
  labelWidth?: string
}

const DataText = (props: DataTextProps) => {
  if (props.hideComponent) return null

  const getLabel = () => {
    if (props.header) {
      return (
        <div>
          <Heading size="small" level="2">{props.label}</Heading>
        </div>
      )
    } else {
      return (
        <div className={`${props.labelWidth?"w-["+props.labelWidth+"]":"w-48"} pr-2.5`}>
          <Label size={"medium"} >{props.label}</Label>
        </div>
      )
    }
  }

  return (
      <div className={`${props.notFlexed ? 'block' : 'flex'} w-full`}>
      {props.label && getLabel()}
      <BodyShort>{props.children}</BodyShort>
      </div>
  )
}

export default DataText
