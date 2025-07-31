import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravViewAnsvarlig: FunctionComponent<TKravViewProps> = ({ header, krav }) => (
  <LabelWrapper>
    <LabelAboveContent header={header} title='Ansvarlig'>
      {krav.underavdeling?.shortName}
    </LabelAboveContent>
  </LabelWrapper>
)
