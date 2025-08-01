import { DotTags } from '@/components/common/dotTags/dotTags'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { TKravViewInfoProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravViewDokumentasjon: FunctionComponent<TKravViewInfoProps> = ({ krav }) => (
  <>
    {krav.dokumentasjon.length > 0 && (
      <LabelWrapper>
        <LabelAboveContent header title='Kilder'>
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </LabelAboveContent>
      </LabelWrapper>
    )}
  </>
)
