import { EKravStatus, IKravVersjon } from '@/constants/krav/kravConstants'
import { kravNummerVersjonUrl } from '@/routes/krav/kravRoutes'
import { Alert, BodyLong, Link } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  alleKravVersjoner: IKravVersjon[]
  statusName?: EKravStatus
  description?: ReactNode
}

const ExpiredAlert: FunctionComponent<TProps> = ({
  alleKravVersjoner,
  statusName,
  description,
}) => (
  <Alert variant='warning' className={`${description ? 'w-full' : 'w-fit'} my-2`}>
    <BodyLong className='ml-3'>
      Dette er et {statusName == EKravStatus.UTKAST && 'utkast.'}
      {statusName == EKravStatus.UTGAATT && 'utgått krav.'}
      {alleKravVersjoner.length > 1 && (
        <>
          {' '}
          Gjeldende versjon:{' '}
          <Link
            href={kravNummerVersjonUrl(
              alleKravVersjoner[0].kravNummer,
              alleKravVersjoner[0].kravVersjon
            )}
          >
            K{alleKravVersjoner[0].kravNummer}.{alleKravVersjoner[0].kravVersjon}
          </Link>
        </>
      )}
    </BodyLong>
    {description && <div className='ml-3'>{description}</div>}
  </Alert>
)

export default ExpiredAlert
