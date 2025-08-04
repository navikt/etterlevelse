import { usePersonName } from '@/api/teamkatalogen/teamkatalogenApi'
import { teamKatPersonLink } from '@/util/config/config'
import { Link } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = { ident: string; link?: boolean; kraveier?: boolean }

export const PersonNavn: FunctionComponent<TProps> = (props) => {
  const { ident, link, kraveier } = props
  const name: string = usePersonName()(ident)

  return (
    <>
      {link && (
        <Link target='_blank' rel='noopener noreferrer' href={teamKatPersonLink(ident)}>
          {name}
          {kraveier ? ' (Kraveier)' : ''}
        </Link>
      )}
      {!link && (
        <div>
          {name}
          {kraveier ? ' (Kraveier)' : ''}
        </div>
      )}
    </>
  )
}

export default PersonNavn
