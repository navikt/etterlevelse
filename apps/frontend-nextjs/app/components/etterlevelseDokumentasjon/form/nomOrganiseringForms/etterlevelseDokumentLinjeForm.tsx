import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { useEffect, useState } from 'react'
import { getLinjeOptions } from '@/api/nom/nomApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TOption } from '@/constants/commonConstants'
import { INomEnhet } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

const EtterlevelseDokumentLinjeForm = () => {
  const [alleLinjeOptions, setAlleLinjeOptions] = useState<TOption[]>([])

  useEffect(() => {
    ;(async () => {
      await getLinjeOptions().then(setAlleLinjeOptions)
    })()
  }, [])

  return (
    <div>
      <div id='linje' className='flex flex-col lg:flex-row gap-5 mb-5'>
        <FieldWrapper marginTop full>
          <FieldArray name='nomOrganisering.linjer'>
            {(fieldProps: FieldArrayRenderProps) => (
              <div>
                <LabelWithDescription label='Angi hvilken linje som er ansvarlig for etterlevelsen' />
                <OptionList
                  label='Linje'
                  options={alleLinjeOptions}
                  onChange={async (value: any) => {
                    const selectedLinje = alleLinjeOptions.find((linje) => linje.value === value)

                    if (selectedLinje) {
                      const ikkeFinnesAlleredeIListe =
                        fieldProps.form.values.nomOrganisering.linjer.filter(
                          (linje: INomEnhet) => linje.nomEnhetId === value
                        ).length === 0

                      if (ikkeFinnesAlleredeIListe) {
                        await fieldProps.form.setFieldValue('nomOrganisering.linjer', [
                          ...fieldProps.form.values.nomOrganisering.linjer,
                          {
                            nomEnhetId: selectedLinje.value,
                            nomEnhetName: selectedLinje.label,
                          },
                        ])
                      }
                    }
                  }}
                  error={
                    getIn(fieldProps.form.errors, 'nomOrganisering.linjer') ? (
                      <FormError fieldName='nomOrganisering.linjer' />
                    ) : undefined
                  }
                />

                <RenderTagList
                  list={fieldProps.form.values.nomOrganisering.linjer.map(
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
    </div>
  )
}
export default EtterlevelseDokumentLinjeForm
