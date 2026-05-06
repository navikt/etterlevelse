import { useTeam } from '@/api/teamkatalogen/teamkatalogenApi'
import { teamKatTeamLink } from '@/util/config/config'
import { Label, Link, List } from '@navikt/ds-react'

interface IPropsTeamName {
  id: string
  link?: boolean
  big?: boolean
}

interface IPropsTeams {
  teams: string[]
  link?: boolean
  list?: boolean
  big?: boolean
}

export const TeamName = (props: IPropsTeamName) => {
  const { id, link, big } = props
  const [name] = useTeam()(id)

  return link ? (
    <Link
      className={big ? '' : 'text-medium'}
      rel='noopener noreferrer'
      target={'_blank'}
      href={teamKatTeamLink(id)}
    >
      {name} (åpner i en ny fane)
    </Link>
  ) : (
    <>{name}</>
  )
}

export const Teams = (props: IPropsTeams) => {
  const { teams, link, big } = props

  return (
    <div className='flex gap-2 items-start'>
      <div className='min-w-16'>
        <Label size='medium'>Team:</Label>
      </div>
      <div>
        <List>
          {teams.map((team, index) => (
            <List.Item key={`team_${index}`}>
              <TeamName id={team} link={link} big={big} />
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  )
}
