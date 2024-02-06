import { Input, InputOverrides, InputProps } from 'baseui/input'
import _ from 'lodash'
import { ettlevColors } from '../../util/theme'

export const CustomizedInput = (props: InputProps) => {
  /* TODO USIKKER */

  const customOverrides: InputOverrides = {
    InputContainer: {
      style: {
        boxShadow: '0 2px 2px 0 rgba(0, 0, 0, .12), 0 2px 1px -1px rgba(0, 0, 0, .2)',
        ':hover': {
          backgroundColor: ettlevColors.green50,
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.12), 0px 1px 1px -1px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  }

  const overrides = _.merge(customOverrides, props.overrides)

  return <Input {...props} overrides={overrides} />
}

export default CustomizedInput
