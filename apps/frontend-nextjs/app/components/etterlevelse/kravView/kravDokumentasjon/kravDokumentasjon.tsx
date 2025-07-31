import { DotTags } from '@/components/common/dotTags/dotTags'
import { LabelAboveContent } from '@/components/common/labelAboveContent/labelAboveContent'
import { LabelWrapper } from '@/components/common/labelWrapper/labelWrapper'
import { TKravViewProps } from '@/constants/krav/kravConstants'
import { FunctionComponent } from 'react'

export const KravDokumentasjon: FunctionComponent<TKravViewProps> = ({ krav, header }) => (
  <>
    {krav.dokumentasjon.length > 0 && (
      <LabelWrapper>
        <LabelAboveContent header={header} title='Kilder'>
          <DotTags items={krav.dokumentasjon} markdown inColumn />
        </LabelAboveContent>
      </LabelWrapper>
    )}
  </>
)
