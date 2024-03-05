import React from 'react'
import { TOr } from '../../constants'
import DataText from './DataText'
import { Markdown } from './Markdown'

const empty = (arg: any) => !arg || (Array.isArray(arg) && !arg.length)

type TLabelProps = {
  title: string
  hide?: boolean
  header?: boolean
  p1?: boolean
  labelWidth?: string
  fullWidth?: boolean
} & TOr<{ children: React.ReactNode }, { markdown: string | string[]; vertical?: boolean }>

export const LabelAboveContent = (props: TLabelProps) => {
  if (props.hide || (empty(props.children) && empty(props.markdown))) return null
  return (
    <DataText
      fullWidth={props.fullWidth}
      notFlexed
      label={props.title}
      header={props.header}
      labelWidth={props.labelWidth}
    >
      {props.markdown ? (
        <Markdown
          p1={props.p1}
          sources={Array.isArray(props.markdown) ? props.markdown : [props.markdown]}
          vertical={props.vertical}
          shortenLinks
        />
      ) : (
        props.children
      )}
    </DataText>
  )
}
