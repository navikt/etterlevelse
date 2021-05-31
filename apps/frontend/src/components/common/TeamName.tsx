import {useTeam} from '../../api/TeamApi'
import React from 'react'
import {teamKatTeamLink} from '../../util/config'
import {StyledLink} from 'baseui/link'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import {theme} from '../../util'

export const TeamName = (props: {id: string, link?: boolean}) => {
  const [name] = useTeam()(props.id)
  return props.link ?
    <StyledLink target="_blank" rel="noopener noreferrer" href={teamKatTeamLink(props.id)}>{name} <FontAwesomeIcon size='xs' icon={faExternalLinkAlt}/></StyledLink> :
    <>{name}</>
}

export const Teams = (props: {teams: string[], link?: boolean, list?: boolean}) =>
  <Block display={props.list? 'block': 'flex'} flexWrap>
    {props.teams.map(t =>
      <Block key={t} marginRight={props.list? 'none':theme.sizing.scale600} marginBottom={props.list? theme.sizing.scale600: 'none'}>
        <TeamName id={t} link={props.link}/>
      </Block>
    )}
  </Block>
