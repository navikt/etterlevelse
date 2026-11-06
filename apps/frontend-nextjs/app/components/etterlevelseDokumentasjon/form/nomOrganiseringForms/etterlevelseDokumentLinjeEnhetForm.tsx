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
  linjeEnheterByLinje: Map<string, TOption[]>
}

const EtterlevelseDokumentLinjeEnhetForm: FunctionComponent<TProps> = ({ linjeEnheterByLinje }) => {
  const alleLinjeEnhter = Array.from(linjeEnheterByLinje.values()).flat()
  if (alleLinjeEnhter.length === 0) return null

  return (
    <div id='linjeEnhet' className='flex flex-col lg:flex-row gap-2 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.linjeEnhet'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi linjeenhet' />
              <OptionList
                label='Linje enhet'
                options={alleLinjeEnhter}
                onChange={async (value: any) => {
                  const selectedFylke = alleLinjeEnhter.find((enhet) => enhet.value === value)

                  if (selectedFylke) {
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.linjeEnheter.filter(
                        (linjeFylke: INomEnhet) => linjeFylke.nomEnhetId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.linjeEnheter', [
                        ...fieldProps.form.values.nomOrganisering.linjeEnheter,
                        {
                          nomEnhetId: selectedFylke.value,
                          nomEnhetName: selectedFylke.label,
                        },
                      ])
                    }
                  }
                }}
                error={
                  getIn(fieldProps.form.errors, 'nomOrganisering.linjeEnheter') ? (
                    <FormError fieldName='nomOrganisering.linjeEnheter' />
                  ) : undefined
                }
              />

              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.linjeEnheter.map(
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
export default EtterlevelseDokumentLinjeEnhetForm
