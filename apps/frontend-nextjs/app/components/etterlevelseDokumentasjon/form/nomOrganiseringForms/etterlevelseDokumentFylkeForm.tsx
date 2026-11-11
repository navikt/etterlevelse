import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { FunctionComponent, SetStateAction } from 'react'
import { getUnderenheter } from '@/api/nom/nomApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TOption } from '@/constants/commonConstants'
import { INomEnhet } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

type TProps = {
  alleFylkeOptions: TOption[]
  kontorByFylke: Map<string, TOption[]>
  setKontorByFylke: (value: SetStateAction<Map<string, TOption[]>>) => void
}

const EtterlevelseDokumentFylkeForm: FunctionComponent<TProps> = ({
  alleFylkeOptions,
  kontorByFylke,
  setKontorByFylke,
}) => {
  return (
    <div id='fylke' className='flex flex-col lg:flex-row gap-2 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.linjeFylker'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi fylke' />
              <OptionList
                label='Fylke'
                value=''
                options={alleFylkeOptions}
                onChange={async (value: any) => {
                  const selectedFylke = alleFylkeOptions.find((fylke) => fylke.value === value)

                  if (selectedFylke) {
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.linjeFylker.filter(
                        (linjeFylke: INomEnhet) => linjeFylke.nomEnhetId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.linjeFylker', [
                        ...fieldProps.form.values.nomOrganisering.linjeFylker,
                        {
                          nomEnhetId: selectedFylke.value,
                          nomEnhetName: selectedFylke.label,
                        },
                      ])
                    }

                    getUnderenheter(String(selectedFylke.value))
                      .then((enheter) => {
                        if (enheter.length > 0) {
                          setKontorByFylke((prev) => {
                            const next = new Map(prev)
                            next.set(
                              String(selectedFylke.value),
                              enheter.map((e) => ({ value: e.id, label: e.navn }))
                            )
                            return next
                          })
                        }
                      })
                      .catch(() => {})
                  }
                }}
                error={
                  getIn(fieldProps.form.errors, 'nomOrganisering.linjeFylker') ? (
                    <FormError fieldName='nomOrganisering.linjeFylker' />
                  ) : undefined
                }
              />

              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.linjeFylker.map(
                  (linje: INomEnhet) => linje.nomEnhetName
                )}
                onRemove={(index: number) => {
                  const removedFylke: INomEnhet =
                    fieldProps.form.values.nomOrganisering.linjeFylker[index]
                  fieldProps.remove(index)
                  const removedKontorer =
                    fieldProps.form.values.nomOrganisering.fylkeKontorer.filter((e: INomEnhet) => {
                      const enhetOptions = kontorByFylke.get(removedFylke.nomEnhetId)
                      return enhetOptions?.some((opt) => opt.value === e.nomEnhetId)
                    })
                  if (removedKontorer.length > 0) {
                    fieldProps.form.setFieldValue(
                      'nomOrganisering.fylkeKontorer',
                      fieldProps.form.values.nomOrganisering.fylkeKontorer.filter(
                        (e: INomEnhet) => !removedKontorer.includes(e)
                      )
                    )
                  }
                  setKontorByFylke((prev) => {
                    const next = new Map(prev)
                    next.delete(removedFylke.nomEnhetId)
                    return next
                  })
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
export default EtterlevelseDokumentFylkeForm
