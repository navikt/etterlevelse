import * as React from 'react'
import {Tag, TagProps, VARIANT} from 'baseui/tag'
import {marginZero} from './Style'

const CustomizedTag = (props: TagProps) => {
  return (
    <Tag
      {...props}
      variant={VARIANT.solid}
      closeable={false}
      overrides={{
        Root: {
          style: {
            backgroundColor: '#F8F8F8',
            ...marginZero
          }
        },
        Text: {
          style: {
            color: '#112724'
          }
        }
      }}
    >
      {props.children}
    </Tag>
  )
}
export default CustomizedTag
