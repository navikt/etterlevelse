import { useTeam } from '../../api/TeamApi'
import { teamKatTeamLink } from '../../util/config'
import { Detail, Link } from '@navikt/ds-react'

export const TeamName = (props: { id: string; link?: boolean; big?: boolean }) => {
  const [name] = useTeam()(props.id)

  return props.link ? (
    <Link className={props.big ? '' : 'text-sm'} rel="noopener noreferrer" target={'_blank'} href={teamKatTeamLink(props.id)}>
      {name} (åpnes i ny fane)
    </Link>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: { teams: string[]; link?: boolean; list?: boolean }) => (
  <div className="flex flex-wrap gap-2 items-center">
    <Detail className="font-bold">Team:</Detail>
    {props.teams.map((t, idx) => (
      <TeamName key={`team_${idx}`} id={t} link={props.link} />
    ))}
  </div>
)
