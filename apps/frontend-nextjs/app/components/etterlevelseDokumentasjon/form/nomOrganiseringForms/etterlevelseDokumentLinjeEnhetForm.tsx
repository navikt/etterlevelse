import { FieldArray, FieldArrayRenderProps, getIn } from 'formik'
import { FunctionComponent, SetStateAction, useEffect } from 'react'
import { getUnderenheter } from '@/api/nom/nomApi'
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
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  linjeEnheterByLinje: Map<string, TOption[]>
  lokalEnheterByLinje: Map<string, TOption[]>
  setLokalEnheterByLinje: (value: SetStateAction<Map<string, TOption[]>>) => void
}

const EtterlevelseDokumentLinjeEnhetForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  linjeEnheterByLinje,
  lokalEnheterByLinje,
  setLokalEnheterByLinje,
}) => {
  const alleLinjeEnhter = Array.from(linjeEnheterByLinje.values()).flat()

  useEffect(() => {
    if (
      etterlevelseDokumentasjon &&
      etterlevelseDokumentasjon.nomOrganisering.linjeEnheter.length !== 0
    ) {
      console.debug('TRIGGER')
      etterlevelseDokumentasjon.nomOrganisering.linjeEnheter.forEach((linjeenhet) => {
        getUnderenheter(linjeenhet.nomEnhetId)
          .then((enheter) => {
            if (enheter.length > 0) {
              setLokalEnheterByLinje((prev) => {
                const next = new Map(prev)
                next.set(
                  linjeenhet.nomEnhetId,
                  enheter.map((e) => ({ value: e.id, label: e.navn }))
                )
                return next
              })
            }
          })
          .catch(() => {})
      })
    }
  }, [etterlevelseDokumentasjon?.nomOrganisering.linjeEnheter])

  if (alleLinjeEnhter.length === 0) return null

  return (
    <div id='linjeEnhet' className='flex flex-col lg:flex-row gap-2 mb-5'>
      <FieldWrapper marginTop full>
        <FieldArray name='nomOrganisering.linjeEnheter'>
          {(fieldProps: FieldArrayRenderProps) => (
            <div>
              <LabelWithDescription label='Angi linjeenhet' />
              <OptionList
                label='Linje enhet'
                options={alleLinjeEnhter}
                onChange={async (value: any) => {
                  const selectedLinjeenhet = alleLinjeEnhter.find((enhet) => enhet.value === value)

                  if (selectedLinjeenhet) {
                    const ikkeFinnesAlleredeIListe =
                      fieldProps.form.values.nomOrganisering.linjeEnheter.filter(
                        (linjeenhet: INomEnhet) => linjeenhet.nomEnhetId === value
                      ).length === 0

                    if (ikkeFinnesAlleredeIListe) {
                      await fieldProps.form.setFieldValue('nomOrganisering.linjeEnheter', [
                        ...fieldProps.form.values.nomOrganisering.linjeEnheter,
                        {
                          nomEnhetId: selectedLinjeenhet.value,
                          nomEnhetName: selectedLinjeenhet.label,
                        },
                      ])
                    }

                    getUnderenheter(String(selectedLinjeenhet.value))
                      .then((enheter) => {
                        if (enheter.length > 0) {
                          setLokalEnheterByLinje((prev) => {
                            const next = new Map(prev)
                            next.set(
                              String(selectedLinjeenhet.value),
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
                  const removedLinjeenhet: INomEnhet =
                    fieldProps.form.values.nomOrganisering.linjeEnheter[index]
                  fieldProps.remove(index)
                  const removedLokalEnheter =
                    fieldProps.form.values.nomOrganisering.lokalEnheter.filter((e: INomEnhet) => {
                      const enhetOptions = lokalEnheterByLinje.get(removedLinjeenhet.nomEnhetId)
                      return enhetOptions?.some((opt) => opt.value === e.nomEnhetId)
                    })
                  if (removedLokalEnheter.length > 0) {
                    fieldProps.form.setFieldValue(
                      'nomOrganisering.lokalEnheter',
                      fieldProps.form.values.nomOrganisering.lokalEnheter.filter(
                        (e: INomEnhet) => !removedLokalEnheter.includes(e)
                      )
                    )
                  }
                  setLokalEnheterByLinje((prev) => {
                    const next = new Map(prev)
                    next.delete(removedLinjeenhet.nomEnhetId)
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
export default EtterlevelseDokumentLinjeEnhetForm
