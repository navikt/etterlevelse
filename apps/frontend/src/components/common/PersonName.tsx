import {usePersonName} from '../../api/TeamApi'
import React from 'react'

export const PersonName = (props: {ident: string}) => {
  const personName = usePersonName()
  return <>{personName(props.ident)}</>
}
