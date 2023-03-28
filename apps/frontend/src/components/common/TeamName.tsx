import { useTeam } from '../../api/TeamApi'
import React from 'react'
import { teamKatTeamLink } from '../../util/config'
import { StyledLink } from 'baseui/link'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { ettlevColors } from '../../util/theme'
import { StyleObject } from 'styletron-react'
import _ from 'lodash'
import { ExternalLinkWrapper } from './RouteLink'

export const TeamName = (props: { id: string; link?: boolean; fontColor?: string; style?: StyleObject }) => {
  const [name] = useTeam()(props.id)
  const customStyle = { color: props.fontColor ? props.fontColor : ettlevColors.green600 }
  const mergedStyle = _.merge(customStyle, props.style)
  return props.link ? (
    <StyledLink rel="noopener noreferrer" target={'_blank'} href={teamKatTeamLink(props.id)} $style={mergedStyle}>
      <ExternalLinkWrapper text={name} />
    </StyledLink>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: { teams: string[]; link?: boolean; list?: boolean; fontColor?: string; style?: StyleObject }) => (
  <Block display={props.list ? 'block' : 'flex'} flexWrap>
    {props.teams.map((t) => (
      <Block key={t} marginRight={props.list ? 'none' : theme.sizing.scale600} marginBottom={props.list ? theme.sizing.scale600 : 'none'}>
        <TeamName id={t} link={props.link} fontColor={props.fontColor} style={props.style} />
      </Block>
    ))}
  </Block>
)
