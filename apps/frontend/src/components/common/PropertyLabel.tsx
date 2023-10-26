import React from 'react'
import DataText from './DataText'
import {Markdown} from './Markdown'
import {Or} from '../../constants'
import {Block, Responsive} from 'baseui/block'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

type LabelProps = {
  title: string
  hide?: boolean
  compact?: boolean
  header?: boolean
  p1?: boolean
  labelWidth?: string
  display?: Responsive<any>
  maxWidth?: string
} & Or<{ children: React.ReactNode }, { markdown: string | string[]; vertical?: boolean }>

export const CustomLabel = (props: LabelProps) => {
  if (props.hide || (empty(props.children) && empty(props.markdown))) return null
  return (
    <DataText label={props.title} compact={props.compact} header={props.header} display={props.display}>
      {props.markdown ? (
        <div className={"-my-4"}>
          <Markdown p1={props.p1} sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} vertical={props.vertical} shortenLinks />
        </div>
      ) : (
        props.children
      )}
    </DataText>
  )
}

export const LabelAboveContent = (props: LabelProps) => {
  if (props.hide || (empty(props.children) && empty(props.markdown))) return null
  return (
    <DataText notFlexed label={props.title} compact={props.compact} header={props.header} display={props.display} labelWidth={props.labelWidth}>
      {props.markdown ? (
        <Block marginTop={'-1rem'} marginBottom={'-1rem'}>
          <Markdown p1={props.p1} sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} vertical={props.vertical} shortenLinks />
        </Block>
      ) : (
        props.children
      )}
    </DataText>
  )
}
