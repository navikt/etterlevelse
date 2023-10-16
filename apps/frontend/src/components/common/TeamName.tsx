import { useTeam } from '../../api/TeamApi'
import { teamKatTeamLink } from '../../util/config'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { Link } from '@navikt/ds-react'

export const TeamName = (props: { id: string; link?: boolean }) => {
  const [name] = useTeam()(props.id)

  return props.link ? (
    <Link rel="noopener noreferrer" target={'_blank'} href={teamKatTeamLink(props.id)}>
      {name} (åpnes i ny fane)
    </Link>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: { teams: string[]; link?: boolean; list?: boolean }) => (
  <Block display={props.list ? 'block' : 'flex'} flexWrap>
    {props.teams.map((t) => (
      <Block key={t} marginRight={props.list ? 'none' : theme.sizing.scale600} marginBottom={props.list ? theme.sizing.scale600 : 'none'}>
        <TeamName id={t} link={props.link} />
      </Block>
    ))}
  </Block>
)
