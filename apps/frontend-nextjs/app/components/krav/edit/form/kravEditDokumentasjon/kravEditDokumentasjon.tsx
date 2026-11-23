import { FunctionComponent } from 'react'
import { MultiInputField } from '@/components/common/inputs'

type TProps = {
  maxInputWidth: string
}

export const KravEditDokumentasjon: FunctionComponent<TProps> = ({ maxInputWidth }) => (
  <>
    <MultiInputField
      marginBottom
      maxInputWidth={maxInputWidth}
      linkLabel='Navn på kilde'
      name='dokumentasjon'
      link
      label='Lenke'
      tooltip='Lenke til dokumentasjon'
      linkTooltip='Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller WebSak.'
    />
  </>
)
