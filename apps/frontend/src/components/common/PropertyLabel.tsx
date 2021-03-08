import React from 'react'
import DataText from './DataText'
import {Markdown} from './Markdown'
import {Or} from '../../constants'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

type LabelProps = {
  title: string,
  hide?: boolean,
  compact?: boolean
} & Or<{children: React.ReactNode}, {markdown: string | string[]}>

export const Label = (props: LabelProps) => {
  if (props.hide || (empty(props.children) && empty(props.markdown))) return null
  return (
    <DataText label={props.title} compact={props.compact}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} shortenLinks/>
        : props.children}
    </DataText>
  )
}
