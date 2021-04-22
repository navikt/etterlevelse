import { default as React, ReactNode } from 'react'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { Label2, H2, H3 } from 'baseui/typography'

type DataTextProps = {
  label?: string
  text?: false | string | string[]
  children?: ReactNode
  hideComponent?: boolean
  compact?: boolean
  notFlexed?: boolean,
  header?: boolean
}

const DataText = (props: DataTextProps) => {
  if (props.hideComponent) return null
  const labelWidth = '12rem'

  const getLabel = () => {
    if (props.header) {
      return (
        <Block>
          <H2>
            {props.label}
          </H2>
        </Block>
      )
    } else {
      return (
        <Block minWidth={labelWidth} maxWidth={labelWidth} paddingRight={theme.sizing.scale400}>
          <Label2 $style={{ lineHeight: theme.sizing.scale800 }}>{props.label}</Label2>
        </Block>
      )
    }
  }

  return (
    <Block display={props.notFlexed ? 'block' : 'flex'} marginBottom={props.compact ? '.5rem' : '2rem'} width='100%'>
      {props.label && getLabel()}
      <Block font='ParagraphMedium'>
        {props.children}
      </Block>
    </Block>
  )
}

export default DataText
