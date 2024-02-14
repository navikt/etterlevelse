import { Heading } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { TKravQL } from '../../../constants'
import { MultiInputField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'

interface IPropsKravEditDokumentasjon {
  maxInputWidth: string
  setErrors: (errors: FormikErrors<TKravQL>) => void
}

export const KravEditDokumentasjon = ({
  maxInputWidth,
  setErrors,
}: IPropsKravEditDokumentasjon) => (
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
      setErrors={() => setErrors({ dokumentasjon: 'Må ha navn på kilde' })}
    />

    <FormError fieldName="dokumentasjon" />
  </>
)
