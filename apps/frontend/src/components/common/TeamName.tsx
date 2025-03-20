import {Label, Link} from '@navikt/ds-react'
import {useTeam} from '../../api/TeamApi'
import {teamKatTeamLink} from '../../util/config'

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
  const {id, link, big} = props
  const [name] = useTeam()(id)

  return link ? (
    <Link
      className={big ? '' : 'text-medium'}
      rel="noopener noreferrer"
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
  const {teams, link, big} = props

  return (
    <div className="flex gap-2 items-start">
      <Label size="medium">Team:</Label>
      <div>
        {teams.map((team, index) => (
          <TeamName key={`team_${index}`} id={team} link={link} big={big}/>
        ))}
      </div>
    </div>
  )
}
