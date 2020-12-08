import {useTeam} from '../../api/TeamApi'
import React from 'react'
import {teamKatTeamLink} from '../../util/config'
import {StyledLink} from 'baseui/link'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'

export const TeamName = (props: {id: string, link?: boolean}) => {
  const [name, team] = useTeam()(props.id)
  return props.link ?
    <StyledLink target="_blank" rel="noopener noreferrer" href={teamKatTeamLink(props.id)}>{name} <FontAwesomeIcon size='xs' icon={faExternalLinkAlt}/></StyledLink> :
    <>{name}</>
}
