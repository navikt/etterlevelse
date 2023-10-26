import {default as React, ReactNode} from 'react'
import {Block, Responsive} from 'baseui/block'
import {Heading, Label} from "@navikt/ds-react";

type DataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  compact?: boolean
  notFlexed?: boolean
  header?: boolean
  labelWidth?: string
  display?: Responsive<any>
}

const DataText = (props: DataTextProps) => {
  if (props.hideComponent) return null
  const labelWidth = props.labelWidth ? props.labelWidth : '12rem'

  const getLabel = () => {
    if (props.header) {
      return (
        <div>
          <Heading size={"medium"}>{props.label}</Heading>
        </div>
      )
    } else {
      return (
        <div className={"pr-2.5"}>
          <Label size={"medium"}>{props.label}</Label>
        </div>
      )
    }
  }

  return (
    <Block display={props.display ? props.display : props.notFlexed ? 'block' : 'flex'} marginBottom={props.compact ? '.5rem' : '2rem'} width="100%">
      {/*<div className={`${props.display ? props.display : props.notFlexed ? 'block' : 'flex'} ${props.compact ? 'mb-2' : 'mb-8'} w-full`}>*/}
      {props.label && getLabel()}
      <Block font="ParagraphMedium">{props.children}</Block>
    </Block>
  )
}

export default DataText
