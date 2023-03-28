import * as React from 'react'
import {Tag, TagProps, VARIANT} from 'baseui/tag'
import {marginZero} from './Style'
import {ettlevColors} from '../../util/theme'

const CustomizedTag = (props: TagProps) => {
  return (
    <Tag
      {...props}
      variant={VARIANT.solid}
      closeable={false}
      overrides={{
        Root: {
          style: {
            backgroundColor: ettlevColors.grey25,
            ...marginZero,
          },
        },
        Text: {
          style: {
            color: ettlevColors.green800,
          },
        },
      }}
    >
      {props.children}
    </Tag>
  )
}
export default CustomizedTag
