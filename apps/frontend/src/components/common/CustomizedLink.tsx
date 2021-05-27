import {LinkProps, StyledLink} from "baseui/link";
import _ from 'lodash'

const CustomizedLink = (props:LinkProps)=>{
  const customStyle = {
    fontWeight: 'normal',
  }

  const style = _.merge(customStyle,props.style)

  return(
    <StyledLink {...props} style={style}>
      {props.children}
    </StyledLink>
  )
}

export default CustomizedLink
