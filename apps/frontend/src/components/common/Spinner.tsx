import React from 'react'
import { Loader } from '@navikt/ds-react'

interface LoaderProps {
  size?: 'large' | 'medium' | 'small' | '3xlarge' | '2xlarge' | 'xlarge' | 'xsmall' | undefined
}

export const Spinner = (props: LoaderProps) => {
  return <Loader size={props.size} />
}
