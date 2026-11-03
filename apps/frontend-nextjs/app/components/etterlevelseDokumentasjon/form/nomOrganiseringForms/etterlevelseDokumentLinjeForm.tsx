import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { FunctionComponent, useEffect, useMemo, useState } from 'react'
import { getLinjeOptions, getUnderenheter, getUnderenheterOptions } from '@/api/nom/nomApi'
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
import EtterlevelseDokumentFylkeForm from './etterlevelseDokumentFylkeForm'
import EtterlevelseDokumentFylkeKontorForm from './etterlevelseDokumentFylkeKontorForm'
import EtterlevelseDokumentLinjeEnhetForm from './etterlevelseDokumentLinjeEnhetForm'

type TProps = {
  formValues: TEtterlevelseDokumentasjonQL
}

const EtterlevelseDokumentLinjeForm: FunctionComponent<TProps> = ({ formValues }) => {
  const tjenestelinjeId = 'ry630r'

  const [alleLinjeOptions, setAlleLinjeOptions] = useState<TOption[]>([])
  const [alleFylkeOptions, setAlleFylkeOptions] = useState<TOption[]>([])
  const [linjeEnheterByLinje, setLinjeEnheterByLinje] = useState<Map<string, TOption[]>>(new Map())
  const [kontorByFylke, setKontorByFylke] = useState<Map<string, TOption[]>>(new Map())

  const hasArbeidsOgTjenestelinjen = useMemo(() => {
    return formValues.nomOrganisering.linjer
      .map((linje) => linje.nomEnhetId)
      .includes(tjenestelinjeId)
  }, [formValues.nomOrganisering.linjer])

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
                      if (selectedLinje.value !== tjenestelinjeId) {
                        getUnderenheter(String(selectedLinje.value))
                          .then((enheter) => {
                            if (enheter.length > 0) {
                              setLinjeEnheterByLinje((prev) => {
                                const next = new Map(prev)
                                next.set(
                                  String(selectedLinje.value),
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
                    const removedLinje: INomEnhet =
                      fieldProps.form.values.nomOrganisering.linjer[index]
                    fieldProps.remove(index)

                    if (removedLinje.nomEnhetId !== tjenestelinjeId) {
                      const removedLinjeEnheter =
                        fieldProps.form.values.nomOrganisering.linjeEnheter.filter(
                          (e: INomEnhet) => {
                            const enhetOptions = linjeEnheterByLinje.get(removedLinje.nomEnhetId)
                            return enhetOptions?.some((opt) => opt.value === e.nomEnhetId)
                          }
                        )
                      if (removedLinjeEnheter.length > 0) {
                        fieldProps.form.setFieldValue(
                          'nomOrganisering.linjeEnheter',
                          fieldProps.form.values.nomOrganisering.linjeEnheter.filter(
                            (e: INomEnhet) => !removedLinjeEnheter.includes(e)
                          )
                        )
                      }
                      setLinjeEnheterByLinje((prev) => {
                        const next = new Map(prev)
                        next.delete(removedLinje.nomEnhetId)
                        return next
                      })
                    } else {
                      fieldProps.form.setFieldValue('nomOrganisering.linjeFylker', [])
                      fieldProps.form.setFieldValue('nomOrganisering.fylkeKontorer', [])
                      setKontorByFylke(new Map())
                    }
                  }}
                />
              </div>
            )}
          </FieldArray>
        </FieldWrapper>

        <div className='flex-1' />
      </div>

      <EtterlevelseDokumentLinjeEnhetForm linjeEnheterByLinje={linjeEnheterByLinje} />

      {formValues.nomOrganisering.linjer && hasArbeidsOgTjenestelinjen && (
        <EtterlevelseDokumentFylkeForm
          alleFylkeOptions={alleFylkeOptions}
          kontorByFylke={kontorByFylke}
          setKontorByFylke={setKontorByFylke}
        />
      )}

      <EtterlevelseDokumentFylkeKontorForm kontorByFylke={kontorByFylke} />
    </div>
  )
}
export default EtterlevelseDokumentLinjeForm
