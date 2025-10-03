import { Markdown } from '@/components/common/markdown/markdown'
import ExpiredAlert from '@/components/etterlevelse/expiredAlert/expiredAlertComponent'
import { EKravStatus, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { hasKravExpired } from '@/util/krav/kravUtil'
import { Heading } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
}

export const KravHasExpired: FunctionComponent<TProps> = ({ krav, alleKravVersjoner }) => (
  <>
    {hasKravExpired(alleKravVersjoner, krav) && krav && (
      <ExpiredAlert
        alleKravVersjoner={alleKravVersjoner}
        statusName={krav.status}
        description={
          krav.status === EKravStatus.UTGAATT &&
          krav.beskrivelse && (
            <div className='py-3 mb-5'>
              <Heading size='small' level='2'>
                Begrunnelse for at kravet er utgått
              </Heading>
              <Markdown source={krav.beskrivelse} />
            </div>
          )
        }
      />
    )}
  </>
)
