import { KravViewInfo } from '@/components/krav/kravPage/kravViewInfo/kravViewInfo'
import { IKravVersjon, TKravQL } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'
import { KravKnapper } from './kravKnapper/kravKnapper'

type TProps = {
  krav: TKravQL
  alleKravVersjoner: IKravVersjon[]
}

export const KravRightSidePanel: FunctionComponent<TProps> = ({ krav, alleKravVersjoner }) => (
  <div className='max-w-lg w-full border-l-2 border-gray-200 pl-3'>
    <KravViewInfo krav={krav} alleKravVersjoner={alleKravVersjoner} noLastModifiedDate />
    <KravKnapper alleKravVersjoner={alleKravVersjoner} krav={krav} />
  </div>
)
