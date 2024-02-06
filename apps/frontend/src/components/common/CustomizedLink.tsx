import { LinkProps, StyledLink } from 'baseui/link'
import _ from 'lodash'

const CustomizedLink = (props: LinkProps) => {
  const { style, ...restProps } = props
  const customStyle = {
    fontWeight: 'normal',
  }

  const mergedStyle = _.merge(customStyle, style)
  /* TODO USIKKER */

  return (
    <StyledLink {...restProps} style={mergedStyle}>
      {props.children}
    </StyledLink>
  )
}

export default CustomizedLink
