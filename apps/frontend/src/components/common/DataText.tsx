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
  return (
    <Block display='flex' marginBottom='1rem' width='100%'>
      <Block minWidth='150px' paddingRight={theme.sizing.scale400}>
        <Label2>{props.label}</Label2>
      </Block>
      <Block font='ParagraphMedium'>
        {props.children}
      </Block>
    </Block>
  )
}

export default DataText
