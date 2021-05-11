import * as React from "react";
import { Input, InputProps, InputOverrides } from "baseui/input";
import _ from 'lodash';
import { ettlevColors } from '../../util/theme';

export const CustomizedInput = (props: InputProps) => {
  const customOverrides : InputOverrides = {
    InputContainer: {
      style: {
        ':hover': {
          backgroundColor: ettlevColors.green50,
          box-shadow: '0px 1px 1px rgba(0, 0, 0, 0.12), 0px 1px 1px -1px rgba(0, 0, 0, 0.2)'
        }
      }
    }  
  }
  const overrides = _.merge(props.overrides, {})
  return (
    <Input {...props}


    />
  )
}

export default CustomizedInput