import { Tag, TagProps, VARIANT } from 'baseui/tag'
import { ettlevColors } from '../../util/theme'
import { marginZero } from './Style'

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
