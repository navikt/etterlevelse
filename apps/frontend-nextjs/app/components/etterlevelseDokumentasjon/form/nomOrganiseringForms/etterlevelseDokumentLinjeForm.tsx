import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { getLinjeOptions, getUnderenheterOptions } from '@/api/nom/nomApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TOption } from '@/constants/commonConstants'
import {
  INomEnhet,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

type TProps = {
  formValues: TEtterlevelseDokumentasjonQL
}

const EtterlevelseDokumentLinjeForm: FunctionComponent<TProps> = ({ formValues }) => {
  const tjenestelinjeId = 'ry630r'

  const [alleLinjeOptions, setAlleLinjeOptions] = useState<TOption[]>([])
  const [alleFylkeOptions, setAlleFylkeOptions] = useState<TOption[]>([])
  const hasArbeidsOgTjenestelinjen = useMemo(() => {
    return formValues.nomOrganisering.linjer
      .map((linje) => linje.nomEnhetId)
      .includes(tjenestelinjeId)
  }, [formValues.nomOrganisering.linjer])

  const hasOtherLinjeNotTjeneste = useMemo(() => {
    return (
      formValues.nomOrganisering.linjer.filter((linje) => linje.nomEnhetId !== tjenestelinjeId)
        .length !== 0
    )
  }, [formValues.nomOrganisering.linjer])

  console.debug(hasOtherLinjeNotTjeneste)

  useEffect(() => {
    ;(async () => {
      await getLinjeOptions().then(setAlleLinjeOptions)
      await getUnderenheterOptions(tjenestelinjeId).then(setAlleFylkeOptions)
    })()
  }, [])

  return (
    <div>
      <div id='linje' className='flex flex-col lg:flex-row gap-2 mb-5'>
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

        {formValues.nomOrganisering.linjer && hasArbeidsOgTjenestelinjen && (
          <FieldWrapper marginTop full>
            <FieldArray name='nomOrganisering.linjeFylker'>
              {(fieldProps: FieldArrayRenderProps) => (
                <div>
                  <LabelWithDescription label='Angi hvilken fylke som er ansvarlig for etterlevelsen' />
                  <OptionList
                    label='Fylke'
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
                      fieldProps.remove(index)
                    }}
                  />
                </div>
              )}
            </FieldArray>
          </FieldWrapper>
        )}

        <div className='flex-1' />
      </div>
    </div>
  )
}
export default EtterlevelseDokumentLinjeForm
