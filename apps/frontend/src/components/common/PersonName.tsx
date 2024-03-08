import { Link } from '@navikt/ds-react'
import { usePersonName } from '../../api/TeamApi'
import { teamKatPersonLink } from '../../util/config'

export const PersonName = (props: { ident: string; link?: boolean; kraveier?: boolean }) => {
  const name = usePersonName()(props.ident)

  return props.link ? (
    <Link target="_blank" rel="noopener noreferrer" href={teamKatPersonLink(props.ident)}>
      {name}
      {props.kraveier ? ' (Kraveier)' : ''}
    </Link>
  ) : (
    <div>
      {name}
      {props.kraveier ? ' (Kraveier)' : ''}
    </div>
  )
}
