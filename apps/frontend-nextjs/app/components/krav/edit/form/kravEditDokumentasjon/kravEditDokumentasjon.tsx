import { MultiInputField } from '@/components/common/inputs'
import { Heading } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  maxInputWidth: string
}

export const KravEditDokumentasjon: FunctionComponent<TProps> = ({ maxInputWidth }) => (
  <>
    <Heading level='2' size='medium' className='mb-2'>
      Dokumentasjon
    </Heading>

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
