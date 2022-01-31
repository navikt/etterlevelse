import {useTeam} from '../../api/TeamApi'
import React from 'react'
import {teamKatTeamLink} from '../../util/config'
import {LinkProps, StyledLink} from 'baseui/link'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {ettlevColors} from '../../util/theme'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import { $StyleProp } from 'styletron-react'
import _ from 'lodash'

export const TeamName = (props: { id: string; link?: boolean, fontColor?: string, style?: $StyleProp<LinkProps> }) => {
  const [name] = useTeam()(props.id)
  const customStyle = { color: props.fontColor ? props.fontColor : ettlevColors.green600 }
  const mergedStyle = _.merge(customStyle, props.style)
  return props.link ? (
    <StyledLink
      rel="noopener noreferrer"
      target={'_blank'}
      href={teamKatTeamLink(props.id)}
      $style={mergedStyle}
    >
      {name}
      <FontAwesomeIcon icon={faExternalLinkAlt} style={{marginLeft: '5px'}}/>
    </StyledLink>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: { teams: string[]; link?: boolean; list?: boolean, fontColor?: string, style?: $StyleProp<LinkProps> }) => (
  <Block display={props.list ? 'block' : 'flex'} flexWrap>
    {props.teams.map((t) => (
      <Block
        key={t}
        marginRight={props.list ? 'none' : theme.sizing.scale600}
        marginBottom={props.list ? theme.sizing.scale600 : 'none'}>
        <TeamName id={t} link={props.link} fontColor={props.fontColor} style={props.style}/>
      </Block>
    ))}
  </Block>
)
