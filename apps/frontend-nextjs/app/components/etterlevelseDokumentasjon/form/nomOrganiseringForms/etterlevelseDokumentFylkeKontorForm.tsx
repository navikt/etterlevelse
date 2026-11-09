import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { FunctionComponent } from 'react'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TOption } from '@/constants/commonConstants'
import { INomEnhet } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

type TProps = {
  kontorByFylke: Map<string, TOption[]>
}

const EtterlevelseDokumentFylkeKontorForm: FunctionComponent<TProps> = ({ kontorByFylke }) => {
  const alleFylkeKontorer = Array.from(kontorByFylke.values()).flat()
  if (alleFylkeKontorer.length === 0) return null

  return (
    <div id='kontor' className='flex flex-col lg:flex-row gap-2 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.fylkeKontorer'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi kontor' />
              <OptionList
                label='Kontor'
                options={alleFylkeKontorer}
                onChange={async (value: any) => {
                  const selectedFylke = alleFylkeKontorer.find((enhet) => enhet.value === value)

                  if (selectedFylke) {
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.fylkeKontorer.filter(
                        (linjeFylke: INomEnhet) => linjeFylke.nomEnhetId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.fylkeKontorer', [
                        ...fieldProps.form.values.nomOrganisering.fylkeKontorer,
                        {
                          nomEnhetId: selectedFylke.value,
                          nomEnhetName: selectedFylke.label,
                        },
                      ])
                    }
                  }
                }}
                error={
                  getIn(fieldProps.form.errors, 'nomOrganisering.fylkeKontorer') ? (
                    <FormError fieldName='nomOrganisering.fylkeKontorer' />
                  ) : undefined
                }
              />

              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.fylkeKontorer.map(
                  (linje: INomEnhet) => linje.nomEnhetName
                )}
                onRemove={(index: number) => {
                  fieldProps.remove(index)
                }}
              />
            </div>
          )}
        </FieldArray>
      </FieldWrapper>

      <div className='flex-1' />
    </div>
  )
}
export default EtterlevelseDokumentFylkeKontorForm
