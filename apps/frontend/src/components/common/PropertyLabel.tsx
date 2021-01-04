import React from 'react'
import DataText from './DataText'
import {Markdown} from './Markdown'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

export const Label = (props: {title: string, children?: React.ReactNode, markdown?: string | string[]}) => {
  if (empty(props.children) && empty(props.markdown)) return null
  return (
    <DataText label={props.title}>
      {props.markdown ?
        <Markdown sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]} noMargin shortenLinks/>
        : props.children}
    </DataText>
  )
}
