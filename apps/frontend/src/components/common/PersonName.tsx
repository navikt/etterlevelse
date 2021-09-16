import { usePersonName } from '../../api/TeamApi'
import React from 'react'
import { teamKatPersonLink } from '../../util/config'
import { StyledLink } from 'baseui/link'

export const PersonName = (props: { ident: string; link?: boolean }) => {
  const name = usePersonName()(props.ident)
  return props.link ? (
    <StyledLink target="_blank" rel="noopener noreferrer" href={teamKatPersonLink(props.ident)}>
      {name}
    </StyledLink>
  ) : (
    <>{name}</>
  )
}
