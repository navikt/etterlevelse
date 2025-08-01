import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { TKravViewInfoProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravViewAnsvarlig: FunctionComponent<TKravViewInfoProps> = ({ krav }) => (
  <LabelWrapper>
    <LabelAboveContent header title='Ansvarlig'>
      {krav.underavdeling?.shortName}
    </LabelAboveContent>
  </LabelWrapper>
)
