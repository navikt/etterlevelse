import {default as React, ReactNode} from 'react'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {Label2} from 'baseui/typography'

type DataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
}

const DataText = (props: DataTextProps) => {
  if (props.hideComponent) return null
  const labelWidth = '12rem'
  return (
    <Block display='flex' marginBottom='2rem' width='100%'>
      <Block minWidth={labelWidth} maxWidth={labelWidth} paddingRight={theme.sizing.scale400}>
        <Label2 $style={{lineHeight: theme.sizing.scale800}}>{props.label}</Label2>
      </Block>
      <Block font='ParagraphMedium'>
        {props.children}
      </Block>
    </Block>
  )
}

export default DataText
