import { FieldArray, FieldArrayRenderProps } from 'formik'
import { FunctionComponent, SetStateAction } from 'react'
import { getEnheterBySeksjonId } from '@/api/nom/nomApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import {
  INomEnhet,
  INomSeksjon,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

type TProps = {
  seksjonerByAvdeling: Readonly<{
    value?: string | number
    label?: React.ReactNode
  }>[]
  selectedAvdeling: string
  enheterBySeksjon: Map<
    string,
    Readonly<{
      value?: string | number
      label?: React.ReactNode
    }>[]
  >
  setEnheterBySeksjon: (
    value: SetStateAction<
      Map<
        string,
        Readonly<{
          value?: string | number
          label?: React.ReactNode
        }>[]
      >
    >
  ) => void
}

const EtterlevelseDokumentSeksjonForm: FunctionComponent<TProps> = ({
  seksjonerByAvdeling,
  selectedAvdeling,
  enheterBySeksjon,
  setEnheterBySeksjon,
}) => {
  const filteredSeksjoner = seksjonerByAvdeling.filter((s) => s.value !== selectedAvdeling)
  if (filteredSeksjoner.length === 0) return null
  return (
    <div id='seksjon' className='flex flex-col lg:flex-row gap-5 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.seksjoner'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi hvilken seksjon som er ansvarlig for etterlevelsen' />
              <OptionList
                label='Seksjon'
                options={filteredSeksjoner}
                onChange={async (value: any) => {
                  if (value) {
                    const selectedSeksjon = filteredSeksjoner.find(
                      (seksjon) => seksjon.value === value
                    )

                    if (!selectedSeksjon) return

                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.seksjoner.filter(
                        (seksjon: INomSeksjon) => seksjon.nomSeksjonId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.seksjoner', [
                        ...fieldProps.form.values.nomOrganisering.seksjoner,
                        {
                          nomSeksjonId: selectedSeksjon.value,
                          nomSeksjonName: selectedSeksjon.label,
                        },
                      ])

                      getEnheterBySeksjonId(String(selectedSeksjon.value))
                        .then((enheter) => {
                          if (enheter.length > 0) {
                            setEnheterBySeksjon((prev) => {
                              const next = new Map(prev)
                              next.set(
                                String(selectedSeksjon.value),
                                enheter.map((e) => ({ value: e.id, label: e.navn }))
                              )
                              return next
                            })
                          }
                        })
                        .catch(() => {})
                    }
                  }
                }}
              />
              <RenderTagList
                list={fieldProps.form.values.nomOrganisering.seksjoner.map(
                  (seksjon: INomSeksjon) => seksjon.nomSeksjonName
                )}
                onRemove={(index: number) => {
                  const removedSeksjon = fieldProps.form.values.nomOrganisering.seksjoner[index]
                  fieldProps.remove(index)
                  const removedEnheter = fieldProps.form.values.nomOrganisering.enheter.filter(
                    (e: INomEnhet) => {
                      const enhetOptions = enheterBySeksjon.get(removedSeksjon.nomSeksjonId)
                      return enhetOptions?.some((opt) => opt.value === e.nomEnhetId)
                    }
                  )
                  if (removedEnheter.length > 0) {
                    fieldProps.form.setFieldValue(
                      'nomOrganisering.enheter',
                      fieldProps.form.values.nomOrganisering.enheter.filter(
                        (e: INomEnhet) => !removedEnheter.includes(e)
                      )
                    )
                  }
                  setEnheterBySeksjon((prev) => {
                    const next = new Map(prev)
                    next.delete(removedSeksjon.nomSeksjonId)
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

export default EtterlevelseDokumentSeksjonForm
