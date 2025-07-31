import { DotTags } from '@/components/common/dotTags/dotTags'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { EListName } from '@/constants/kodeverk/kodeverkConstants'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravErRelevantFor: FunctionComponent<TKravViewProps> = ({ header, krav }) => (
  <LabelWrapper>
    <LabelAboveContent header={header} title='Kravet er relevant for'>
      <DotTags list={EListName.RELEVANS} codes={krav.relevansFor} inColumn />
    </LabelAboveContent>
  </LabelWrapper>
)
