import { useTeam } from '../../api/TeamApi'
import { teamKatTeamLink } from '../../util/config'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { StyleObject } from 'styletron-react'
import _ from 'lodash'
import { Link } from '@navikt/ds-react'

export const TeamName = (props: { id: string; link?: boolean; fontColor?: string; style?: StyleObject }) => {
  const [name] = useTeam()(props.id)
  
  return props.link ? (
    <Link rel="noopener noreferrer" target={'_blank'} href={teamKatTeamLink(props.id)}>
      {name}
    </Link>
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
