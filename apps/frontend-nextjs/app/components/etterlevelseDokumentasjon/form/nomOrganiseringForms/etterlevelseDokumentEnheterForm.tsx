import { FieldArray, FieldArrayRenderProps } from 'formik'
import { FunctionComponent } from 'react'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { INomEnhet } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

type TProps = {
  enheterBySeksjon: Map<
    string,
    Readonly<{
      value?: string | number
      label?: React.ReactNode
    }>[]
  >
}

const EtterlevelseDokumentEnheterForm: FunctionComponent<TProps> = ({ enheterBySeksjon }) => {
  const allEnhetOptions = Array.from(enheterBySeksjon.values()).flat()
  if (allEnhetOptions.length === 0) return null
  return (
    <div id='enhet' className='flex flex-col lg:flex-row gap-5 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.enheter'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi hvilken enhet som er ansvarlig for etterlevelsen' />
              <OptionList
                label='Enhet'
                options={allEnhetOptions}
                onChange={async (value: any) => {
                  if (value) {
                    const selectedEnhet = allEnhetOptions.find((enhet) => enhet.value === value)
                    if (!selectedEnhet) return
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.enheter.filter(
                        (enhet: INomEnhet) => enhet.nomEnhetId === value
                      ).length === 0
                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.enheter', [
                        ...fieldProps.form.values.nomOrganisering.enheter,
                        {
                          nomEnhetId: selectedEnhet.value,
                          nomEnhetName: selectedEnhet.label,
                        },
                      ])
                    }
                  }
                }}
              />
              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.enheter.map(
                  (enhet: INomEnhet) => enhet.nomEnhetName
                )}
                onRemove={fieldProps.remove}
              />
            </div>
          )}
        </FieldArray>
      </FieldWrapper>
      <div className='flex-1' />
    </div>
  )
}
export default EtterlevelseDokumentEnheterForm
