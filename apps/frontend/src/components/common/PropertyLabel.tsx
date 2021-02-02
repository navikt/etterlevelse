import React from 'react'
import DataText from './DataText'
import {Markdown} from './Markdown'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

export const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[], hide?: boolean, compact?: boolean}) => {
  if (props.hide || (empty(props.children) && empty(props.markdown))) return null
  return (
    <DataText label={props.title} compact={props.compact}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
