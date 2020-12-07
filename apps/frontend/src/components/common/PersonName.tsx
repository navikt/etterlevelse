import {usePersonName} from '../../api/TeamApi'
import React from 'react'

export const PersonName = (props: {ident: string}) => <>{usePersonName()(props.ident)}</>
