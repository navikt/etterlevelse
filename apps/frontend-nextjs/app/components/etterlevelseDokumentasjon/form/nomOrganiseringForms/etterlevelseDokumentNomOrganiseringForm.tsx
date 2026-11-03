import { InformationSquareIcon } from '@navikt/aksel-icons'
import { Heading, InfoCard } from '@navikt/ds-react'
import { Field, FieldProps, getIn } from 'formik'
import { FunctionComponent, useEffect, useState } from 'react'
import {
  getAvdelingOptions,
  getEnheterBySeksjonId,
  getSeksjonOptionsByAvdelingId,
} from '@/api/nom/nomApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import { LabelWithDescription } from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { FormError } from '@/components/common/modalSchema/formError/formError'
import { TOption } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { env } from '@/util/env/env'
import EtterlevelseDokumentEnheterForm from './etterlevelseDokumentEnheterForm'
import EtterlevelseDokumentLinjeForm from './etterlevelseDokumentLinjeForm'
import EtterlevelseDokumentSeksjonForm from './etterlevelseDokumentSeksjonForm'

type TProps = {
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  formValues: TEtterlevelseDokumentasjonQL
}

const EtterlevelseDokumentNomOrganiseringForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  formValues,
}) => {
  const [alleAvdelingOptions, setAllAvdelingOptions] = useState<TOption[]>([])
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>(
    etterlevelseDokumentasjon && etterlevelseDokumentasjon.nomOrganisering.nomAvdelingId
      ? etterlevelseDokumentasjon.nomOrganisering.nomAvdelingId
      : ''
  )
  const [seksjonerByAvdeling, setSeksjonerByAvdeling] = useState<TOption[]>([])
  const [enheterBySeksjon, setEnheterBySeksjon] = useState<Map<string, TOption[]>>(new Map())

  useEffect(() => {
    ;(async () => {
      await getAvdelingOptions().then(setAllAvdelingOptions)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (selectedAvdeling !== '' && selectedAvdeling !== undefined) {
        await getSeksjonOptionsByAvdelingId(selectedAvdeling).then(setSeksjonerByAvdeling)
      }
    })()
  }, [selectedAvdeling])

  useEffect(() => {
    if (etterlevelseDokumentasjon?.nomOrganisering.seksjoner.length) {
      etterlevelseDokumentasjon.nomOrganisering.seksjoner.forEach((seksjon) => {
        getEnheterBySeksjonId(seksjon.nomSeksjonId)
          .then((enheter) => {
            if (enheter.length > 0) {
              setEnheterBySeksjon((prev) => {
                const next = new Map(prev)
                next.set(
                  seksjon.nomSeksjonId,
                  enheter.map((e) => ({ value: e.id, label: e.navn }))
                )
                return next
              })
            }
          })
          .catch(() => {})
      })
    }
  }, [etterlevelseDokumentasjon?.nomOrganisering.seksjoner])

  return (
    <div className='mb-7'>
      <div id='nomAvdelingId' className='flex flex-col lg:flex-row gap-5 mb-5'>
        <FieldWrapper marginTop full>
          <Field name='nomOrganisering.nomAvdelingId'>
            {(fieldProps: FieldProps) => (
              <div>
                <LabelWithDescription label='Angi hvilken avdeling i direktoratet som er ansvarlig for etterlevelsen' />
                <OptionList
                  label='Avdeling'
                  options={alleAvdelingOptions}
                  value={fieldProps.field.value}
                  onChange={async (value: any) => {
                    setSelectedAvdeling(value)

                    if (value !== fieldProps.form.values.nomOrganisering.nomAvdelingId) {
                      await fieldProps.form.setFieldValue('nomOrganisering.seksjoner', [])
                      await fieldProps.form.setFieldValue('nomOrganisering.enheter', [])
                      setEnheterBySeksjon(new Map())
                    }

                    await fieldProps.form.setFieldValue('nomOrganisering.nomAvdelingId', value)
                    await fieldProps.form.setFieldValue(
                      'nomOrganisering.avdelingNavn',
                      alleAvdelingOptions.filter((avdeling) => avdeling.value === value)[0].label
                    )
                  }}
                  error={
                    getIn(fieldProps.form.errors, 'nomOrganisering.nomAvdelingId') ? (
                      <FormError fieldName='nomOrganisering.nomAvdelingId' />
                    ) : undefined
                  }
                />
              </div>
            )}
          </Field>
        </FieldWrapper>

        <div className='flex-1' />
      </div>

      {selectedAvdeling !== '' && selectedAvdeling !== undefined && (
        <div>
          <InfoCard data-color='info' className='max-w-155.5 w-full'>
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              Dere må velge minst én av direktoratet eller linje, men kan velge begge deler.
            </InfoCard.Message>
          </InfoCard>

          <Heading level='3' size='xsmall' className='mt-5 mb-3'>
            Velg ansvar for etterlevelsen i direktoratet
          </Heading>

          <div className='border-l-[6px] border-l-[#D9D9D9] pl-6.5'>
            <EtterlevelseDokumentSeksjonForm
              seksjonerByAvdeling={seksjonerByAvdeling}
              selectedAvdeling={selectedAvdeling}
              enheterBySeksjon={enheterBySeksjon}
              setEnheterBySeksjon={setEnheterBySeksjon}
            />

            <EtterlevelseDokumentEnheterForm enheterBySeksjon={enheterBySeksjon} />
          </div>

          <Heading level='3' size='xsmall' className='mt-7 mb-3'>
            Velg ansvar for etterlevelsen i linjen
          </Heading>

          {env.isDev && (
            <div className='border-l-[6px] border-l-[#D9D9D9] pl-6.5'>
              <EtterlevelseDokumentLinjeForm formValues={formValues} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EtterlevelseDokumentNomOrganiseringForm
