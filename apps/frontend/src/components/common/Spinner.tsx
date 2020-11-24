import {withStyle} from 'baseui'
import {StyledSpinnerNext} from 'baseui/spinner'
import React from 'react'

export const Spinner = (props: { size?: string }) => {
  const SpinnerStyled = withStyle(StyledSpinnerNext, {width: props.size, height: props.size})
  return <SpinnerStyled/>
}
