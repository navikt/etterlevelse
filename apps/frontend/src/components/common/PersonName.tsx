import { usePersonName } from '../../api/TeamApi'
import React from 'react'
import { teamKatPersonLink } from '../../util/config'
import { Link } from '@navikt/ds-react'

export const PersonName = (props: { ident: string; link?: boolean; kraveier?: boolean}) => {
  const name = usePersonName()(props.ident)

  return props.link ? (
    <Link target="_blank" rel="noopener noreferrer" href={teamKatPersonLink(props.ident)}>
      {name}
      {props.kraveier ? ' (Kraveier)' : ''}
    </Link>
  ) : (
    <div>
      {name}
      {props.kraveier ? ' (Kraveier)' : ''}
    </div>
  )
}

export const StringPersonName = (ident: string, kraveier?: boolean) => {
  const name = usePersonName()(ident)

  return name + kraveier ? ' (Kraveier)' : ''
}
