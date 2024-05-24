import { Alert, BodyLong, Link } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { EKravStatus, IKravVersjon } from '../../constants'

const ExpiredAlert = ({
  alleKravVersjoner,
  statusName,
  description,
}: {
  alleKravVersjoner: IKravVersjon[]
  statusName?: EKravStatus
  description?: ReactNode
}) => (
  <Alert variant="warning" className={`${description ? 'w-full' : 'w-fit'} my-2`}>
    <BodyLong className="ml-3">
      Dette er et {statusName == EKravStatus.UTKAST && 'utkast.'}
      {statusName == EKravStatus.UTGAATT && 'utgått krav.'}
      {alleKravVersjoner.length > 1 && (
        <>
          {' '}
          Gjeldende versjon:{' '}
          <Link
            href={`/krav/${alleKravVersjoner[0].kravNummer}/${alleKravVersjoner[0].kravVersjon}`}
          >
            K{alleKravVersjoner[0].kravNummer}.{alleKravVersjoner[0].kravVersjon}
          </Link>
        </>
      )}
    </BodyLong>
    {description && <div className="ml-3">{description}</div>}
  </Alert>
)

export default ExpiredAlert
