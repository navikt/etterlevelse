import {BaseInputOverrides} from 'baseui/input'
import {
  Textarea,
  TextareaProps,
  StatefulTextarea,
  StatefulTextareaProps,
} from 'baseui/textarea'
import {ettlevColors} from '../../util/theme'
import _ from 'lodash'

const customOverrides: BaseInputOverrides<HTMLTextAreaElement> = {
  InputContainer: {
    style: {
      boxShadow:
        '0 2px 2px 0 rgba(0, 0, 0, .12), 0 2px 1px -1px rgba(0, 0, 0, .2)',
      ':hover': {
        backgroundColor: ettlevColors.green50,
        boxShadow:
          '0px 1px 1px rgba(0, 0, 0, 0.12), 0px 1px 1px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
}

export const CustomizedStatefulTextarea = (props: StatefulTextareaProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <StatefulTextarea {...props} overrides={overrides} />
}

export const CustomizedTextarea = (props: TextareaProps) => {
  const overrides = _.merge(customOverrides, props.overrides)

  return <Textarea {...props} overrides={overrides} />
}
export default CustomizedTextarea
