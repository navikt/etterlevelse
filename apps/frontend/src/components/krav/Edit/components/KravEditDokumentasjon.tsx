import { Heading } from '@navikt/ds-react'
import { MultiInputField } from '../../../common/Inputs'

interface IPropsKravEditDokumentasjon {
  maxInputWidth: string
}

export const KravEditDokumentasjon = ({ maxInputWidth }: IPropsKravEditDokumentasjon) => (
  <>
    <Heading level="3" size="medium" className="mb-2">
      Dokumentasjon
    </Heading>

    <MultiInputField
      marginBottom
      maxInputWidth={maxInputWidth}
      linkLabel="Navn på kilde"
      name="dokumentasjon"
      link
      label="Lenke eller websaknr"
      tooltip="Lenke til dokumentasjon"
      linkTooltip="Legg inn referanse til utdypende dokumentasjon (lenke). Eksempelvis til navet, eksterne nettsider eller WebSak."
    />
  </>
)
