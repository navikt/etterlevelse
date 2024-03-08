import { Alert, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react'
import { FormikErrors } from 'formik/dist/types'
import { TKravQL } from '../../../../constants'
import { EListName } from '../../../../services/Codelist'
import { InputField, TextAreaField } from '../../../common/Inputs'
import { FormError } from '../../../common/ModalSchema'
import { EditKravMultiOptionField } from '../EditKravMultiOptionField'
import { EditKravRelasjoner } from '../EditKravRelasjoner'
import { EditBegreper } from '../KravBegreperEdit'
import { KravSuksesskriterierEdit } from '../KravSuksesskriterieEdit'
import { KravVarslingsadresserEdit } from '../KravVarslingsadresserEdit'
import { RegelverkEdit } from '../RegelverkEdit'
import { KravEditDokumentasjon } from './KravEditDokumentasjon'

interface IProps {
  mode: 'create' | 'edit'
  kravVersjon: number
  errors: FormikErrors<TKravQL>
  varselMeldingActive: string[]
  setVarselMeldingActive: React.Dispatch<React.SetStateAction<string[]>>
}

const maxInputWidth = '25rem'

export const KravFormFields = (props: IProps) => {
  const { mode, kravVersjon, errors, varselMeldingActive, setVarselMeldingActive } = props
  return (
    <>
      <div className="mt-5 mb-10">
        <InputField marginBottom label="Krav navn" name="navn" />
        <div className="mb-10">
          <CheckboxGroup
            legend="Send varselmelding"
            value={varselMeldingActive}
            onChange={(value) => {
              setVarselMeldingActive(value)
            }}
          >
            <Checkbox value="VarselMelding">
              Gi kravet en varselmelding (eks. for kommende krav)
            </Checkbox>
          </CheckboxGroup>

          {varselMeldingActive.length > 0 && (
            <div className="w-full ml-8 mt-6">
              <TextAreaField
                label="Forklaring til etterlevere"
                name="varselMelding"
                maxCharacter={100}
                rows={2}
                noPlaceholder
              />
            </div>
          )}
        </div>
        <TextAreaField label="Hensikt" name="hensikt" height="15.625rem" markdown />
      </div>

      <div className="flex w-full justify-center">
        <div className="w-full mb-2.5">
          <div className="mb-10" id="suksesskriterier">
            <Heading level="3" size="medium" className="mb-2">
              Suksesskriterier
            </Heading>
            <KravSuksesskriterierEdit />
          </div>

          <KravEditDokumentasjon maxInputWidth={maxInputWidth} />

          <RegelverkEdit />

          {kravVersjon > 1 && mode === 'edit' && (
            <div className="w-full" id="versjonEndringer">
              <TextAreaField
                label="Endringer siden siste versjon"
                name="versjonEndringer"
                height="15.625rem"
                markdown
              />
            </div>
          )}

          <div className="mt-20">
            <Heading level="3" size="medium">
              Gruppering
            </Heading>
          </div>

          <div className="w-full max-w-md">
            <EditKravMultiOptionField
              marginBottom
              name="relevansFor"
              label="Legg til relevante kategorier"
              listName={EListName.RELEVANS}
              tooltip="Velg kategori(er) kravet er relevant for i nedtrekksmenyen. \n"
            />
          </div>

          <div className="w-full mb-20 max-w-md">
            <EditBegreper />
          </div>

          <div className="w-full mb-20 max-w-md">
            <EditKravRelasjoner />
          </div>

          <div className="mb-8">
            <Heading level="3" size="medium">
              Egenskaper
            </Heading>
          </div>

          <div id="varslingsadresser">
            <KravVarslingsadresserEdit />
          </div>

          <FormError fieldName="varslingsadresser" akselStyling />

          <div className="w-full">
            {Object.keys(errors).length > 0 && !errors.dokumentasjon && (
              <div className="flex w-full my-12">
                <div className="w-full bg-red-300">
                  <Alert variant="warning" role="status">
                    Du må fylle ut alle obligatoriske felter
                  </Alert>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
