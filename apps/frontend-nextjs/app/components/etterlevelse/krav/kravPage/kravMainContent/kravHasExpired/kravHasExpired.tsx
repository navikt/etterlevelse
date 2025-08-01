import { Markdown } from '@/components/common/markdown/markdown'
import ExpiredAlert from '@/components/etterlevelse/expiredAlert/expiredAlertComponent'
import { EKravStatus, IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { Heading } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
}

const hasKravExpired = ({ krav, alleKravVersjoner }: TProps) => {
  if (krav?.status === EKravStatus.UTGAATT && alleKravVersjoner.length === 1) {
    return true
  } else {
    let kravExpired

    if (krav) {
      kravExpired = krav.kravVersjon < parseInt(alleKravVersjoner[0].kravVersjon.toString())
    } else {
      kravExpired = false
    }

    return kravExpired
  }
}

export const KravHasExpired: FunctionComponent<TProps> = ({ krav, alleKravVersjoner }) => (
  <>
    {hasKravExpired({ krav, alleKravVersjoner }) && krav && (
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
