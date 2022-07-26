import { default as React, ReactNode } from 'react'
import { Block, Responsive } from 'baseui/block'
import { theme } from '../../util'
import { HeadingXLarge, LabelLarge } from 'baseui/typography'

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
        <Block>
          <HeadingXLarge>{props.label}</HeadingXLarge>
        </Block>
      )
    } else {
      return (
        <Block minWidth={labelWidth} maxWidth={labelWidth} paddingRight={theme.sizing.scale400}>
          <LabelLarge $style={{ lineHeight: theme.sizing.scale800 }}>{props.label}</LabelLarge>
        </Block>
      )
    }
  }

  return (
    <Block display={props.display ? props.display : props.notFlexed ? 'block' : 'flex'} marginBottom={props.compact ? '.5rem' : '2rem'} width="100%">
      {props.label && getLabel()}
      <Block font="ParagraphMedium">{props.children}</Block>
    </Block>
  )
}

export default DataText
