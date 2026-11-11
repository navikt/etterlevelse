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
  tjenestelinjeId,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import EtterlevelseDokumentFylkeForm from './etterlevelseDokumentFylkeForm'
import EtterlevelseDokumentFylkeKontorForm from './etterlevelseDokumentFylkeKontorForm'
import EtterlevelseDokumentLinjeEnhetForm from './etterlevelseDokumentLinjeEnhetForm'
import EtterlevelseDokumentLokalEnheterForm from './etterlevelseDokumentLokalEnheterForm'

type TProps = {
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  formValues: TEtterlevelseDokumentasjonQL
}

const EtterlevelseDokumentLinjeForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  formValues,
}) => {
  const [alleLinjeOptions, setAlleLinjeOptions] = useState<TOption[]>([])
  const [alleFylkeOptions, setAlleFylkeOptions] = useState<TOption[]>([])
  const [linjeEnheterByLinje, setLinjeEnheterByLinje] = useState<Map<string, TOption[]>>(new Map())
  const [kontorByFylke, setKontorByFylke] = useState<Map<string, TOption[]>>(new Map())
  const [lokalEnheterByLinje, setLokalEnheterByLinje] = useState<Map<string, TOption[]>>(new Map())

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

  useEffect(() => {
    if (etterlevelseDokumentasjon?.nomOrganisering.linjer.length) {
      etterlevelseDokumentasjon.nomOrganisering.linjer.forEach((linje) => {
        if (linje.nomEnhetId !== tjenestelinjeId) {
          getUnderenheter(linje.nomEnhetId)
            .then((enheter) => {
              if (enheter.length > 0) {
                setLinjeEnheterByLinje((prev) => {
                  const next = new Map(prev)
                  next.set(
                    linje.nomEnhetId,
                    enheter.map((e) => ({ value: e.id, label: e.navn }))
                  )
                  return next
                })
              }
            })
            .catch(() => {})
        }
      })
    }
  }, [etterlevelseDokumentasjon?.nomOrganisering.linjer])

  return (
    <div>
      <div id='linje' className='flex flex-col lg:flex-row gap-2 mb-5'>
        <FieldWrapper full>
          <FieldArray name='nomOrganisering.linjer'>
            {(fieldProps: FieldArrayRenderProps) => (
              <div>
                <LabelWithDescription label='Angi linje' />
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
                      const linjeEnhetIds = (
                        linjeEnheterByLinje.get(removedLinje.nomEnhetId) ?? []
                      ).map((opt) => String(opt.value))
                      const lokalEnhetIds = linjeEnhetIds.flatMap((linjeEnhetId) =>
                        (lokalEnheterByLinje.get(linjeEnhetId) ?? []).map((opt) =>
                          String(opt.value)
                        )
                      )

                      fieldProps.form.setFieldValue(
                        'nomOrganisering.linjeEnheter',
                        fieldProps.form.values.nomOrganisering.linjeEnheter.filter(
                          (e: INomEnhet) => !linjeEnhetIds.includes(e.nomEnhetId)
                        )
                      )
                      fieldProps.form.setFieldValue(
                        'nomOrganisering.lokalEnheter',
                        fieldProps.form.values.nomOrganisering.lokalEnheter.filter(
                          (e: INomEnhet) => !lokalEnhetIds.includes(e.nomEnhetId)
                        )
                      )

                      setLokalEnheterByLinje((prev) => {
                        const next = new Map(prev)
                        linjeEnhetIds.forEach((linjeEnhetId) => next.delete(linjeEnhetId))
                        return next
                      })
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

      <EtterlevelseDokumentLinjeEnhetForm
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        linjeEnheterByLinje={linjeEnheterByLinje}
        lokalEnheterByLinje={lokalEnheterByLinje}
        setLokalEnheterByLinje={setLokalEnheterByLinje}
      />

      <EtterlevelseDokumentLokalEnheterForm lokalEnheterByLinje={lokalEnheterByLinje} />

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
