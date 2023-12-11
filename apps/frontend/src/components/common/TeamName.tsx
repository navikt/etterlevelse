import { useTeam } from '../../api/TeamApi'
import { teamKatTeamLink } from '../../util/config'
import { BodyShort, Detail, Link } from '@navikt/ds-react'

export const TeamName = (props: { id: string; link?: boolean; big?: boolean }) => {
  const [name] = useTeam()(props.id)

  return props.link ? (
    <Link className={props.big ? '' : 'text-medium'} rel="noopener noreferrer" target={'_blank'} href={teamKatTeamLink(props.id)}>
      {name} (åpnes i ny fane)
    </Link>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: { teams: string[]; link?: boolean; list?: boolean; big?: boolean }) => (
  <div className="flex flex-wrap gap-2 items-center mb-2.5">
    <BodyShort size="small">Team:</BodyShort>
    {props.teams.map((t, idx) => (
      <TeamName key={`team_${idx}`} id={t} link={props.link} big={props.big} />
    ))}
  </div>
)
