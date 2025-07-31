import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { LovViewList } from '@/components/lov/lov'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravViewRegelverk: FunctionComponent<TKravViewProps> = ({ header, krav }) => (
  <>
    {krav.regelverk.length && (
      <LabelWrapper>
        <LabelAboveContent header={header} title='Regelverk'>
          <LovViewList regelverkListe={krav.regelverk} />
        </LabelAboveContent>
      </LabelWrapper>
    )}
  </>
)
