import { Markdown } from '@/components/common/markdown/markdown'
import { TKravQL } from '@/constants/krav/kravConstants'
import { Heading } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  krav: TKravQL
}

export const KravHensikt: FunctionComponent<TProps> = ({ krav }) => (
  <div className='bg-blue-50 px-5 py-3 mb-5'>
    <Heading size='small' level='2'>
      Hensikten med kravet
    </Heading>
    <Markdown source={krav.hensikt} />
  </div>
)
