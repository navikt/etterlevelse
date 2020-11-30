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
    <Block display='flex' alignContent='flex-start' marginBottom='1rem' width='100%'>
      <Block width='15%' paddingRight={theme.sizing.scale400} maxWidth='300px'>
        <Label2>{props.label}</Label2>
      </Block>
      <Block width='80%'>
        <Block font='ParagraphMedium'>
          {props.children}
        </Block>
      </Block>
    </Block>
  )
}

export default DataText
