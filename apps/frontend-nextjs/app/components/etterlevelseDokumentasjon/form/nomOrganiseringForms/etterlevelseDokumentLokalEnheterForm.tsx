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
  lokalEnheterByLinje: Map<string, TOption[]>
}

const EtterlevelseDokumentLokalEnheterForm: FunctionComponent<TProps> = ({
  lokalEnheterByLinje,
}) => {
  const alleLokalEnheter = Array.from(lokalEnheterByLinje.values()).flat()
  if (alleLokalEnheter.length === 0) return null

  return (
    <div id='lokalEnheter' className='flex flex-col lg:flex-row gap-2 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.fylkeKontorer'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi lokal enhet' />
              <OptionList
                label='lokal enhet'
                options={alleLokalEnheter}
                onChange={async (value: any) => {
                  const selectedLokalEnhet = alleLokalEnheter.find((enhet) => enhet.value === value)

                  if (selectedLokalEnhet) {
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.lokalEnheter.filter(
                        (lokalEnhet: INomEnhet) => lokalEnhet.nomEnhetId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.lokalEnheter', [
                        ...fieldProps.form.values.nomOrganisering.lokalEnheter,
                        {
                          nomEnhetId: selectedLokalEnhet.value,
                          nomEnhetName: selectedLokalEnhet.label,
                        },
                      ])
                    }
                  }
                }}
                error={
                  getIn(fieldProps.form.errors, 'nomOrganisering.lokalEnheter') ? (
                    <FormError fieldName='nomOrganisering.lokalEnheter' />
                  ) : undefined
                }
              />

              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.lokalEnheter.map(
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

export default EtterlevelseDokumentLokalEnheterForm
