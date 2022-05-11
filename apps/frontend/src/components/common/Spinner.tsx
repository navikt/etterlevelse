import { withStyle } from 'baseui'
import { Spinner as BaseSpinner } from 'baseui/spinner'
import React from 'react'
import { ettlevColors } from '../../util/theme'

export const Spinner = (props: { size?: string }) => {
  const SpinnerStyled = withStyle(BaseSpinner, { width: props.size, height: props.size })
  return <SpinnerStyled $color={ettlevColors.green400} />
}
