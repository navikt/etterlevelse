import React from 'react'
import { Tag } from 'baseui/tag'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { borderColor, borderWidth, padding } from './Style'
import { Block } from 'baseui/block'
import { checkmarkIcon } from '../Images'

const noop = () => {}

export const SimpleTag = (props: { onClick?: () => void; active?: boolean; activeIcon?: boolean; children: React.ReactNode }) => {
  const backgroundColor = props.active ? ettlevColors.green50 : ettlevColors.white
  return (
    <Tag
      onClick={props.onClick || noop}
      closeable={false}
      size={'small'}
      overrides={{
        Text: {
          style: {
            maxWidth: 'fit-content',
            ...theme.typography.font200,
            display: 'flex',
          },
        },
        Root: {
          style: {
            backgroundColor,
            height: 'initial',
            ...borderWidth('1px'),
            ...borderColor(ettlevColors.grey200),
            ...padding(theme.sizing.scale200, theme.sizing.scale500),
            width: 'fit-content',
            ':hover': props.onClick ? {} : { boxShadow: 'none' },
          },
        },
      }}
    >
      {props.active && props.activeIcon && (
        <Block marginRight={theme.sizing.scale200}>
          <img src={checkmarkIcon} aria-hidden alt="Checkmark" width={'15px'} height={'15px'} />
        </Block>
      )}
      {props.children}
    </Tag>
  )
}
