import { Alert, BodyLong, Link } from '@navikt/ds-react'
import { EKravStatus, IKravVersjon } from '../../constants'

const ExpiredAlert = ({
  alleKravVersjoner,
  statusName,
}: {
  alleKravVersjoner: IKravVersjon[]
  statusName?: EKravStatus
}) => (
  <Alert variant={'warning'} className={'w-fit'}>
    <BodyLong className={'ml-3'}>
      {statusName == EKravStatus.UTGAATT && 'Dette er et utgått krav.'}
      {alleKravVersjoner.length > 1 ? (
        <>
          {' '}
          Gjeldende versjon:{' '}
          <Link
            href={`/krav/${alleKravVersjoner[0].kravNummer}/${alleKravVersjoner[0].kravVersjon}`}
          >
            K{alleKravVersjoner[0].kravNummer}.{alleKravVersjoner[0].kravVersjon}
          </Link>
        </>
      ) : (
        ''
      )}
    </BodyLong>
  </Alert>
)

export default ExpiredAlert
