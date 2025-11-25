'use client'

import { searchBehandlingOptions } from '@/api/behandlingskatalog/behandlingskatalogApi'
import {
  createEtterlevelseDokumentasjonWithRelataion,
  etterlevelseDokumentasjonWithRelationMapToFormVal,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getAvdelingOptions, getSeksjonOptionsByAvdelingId } from '@/api/nom/nomApi'
import {
  searchResourceByNameOptions,
  useSearchTeamOptions,
} from '@/api/teamkatalogen/teamkatalogenApi'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import LabelWithTooltip, {
  LabelWithDescription,
} from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Error, FormError } from '@/components/common/modalSchema/formError/formError'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { VarslingsadresserEdit } from '@/components/varslingsadresse/VarslingsadresserEdit'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { TOption } from '@/constants/commonConstants'
import {
  ERelationType,
  IEtterlevelseDokumentasjonWithRelation,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import {
  IEtterlevelseDokumentasjon,
  INomSeksjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { behandlingName } from '@/util/behandling/behandlingUtil'
import { getMembersFromEtterlevelseDokumentasjon } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { Button, ErrorSummary, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import _ from 'lodash'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject, useContext, useEffect, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { etterlevelseDokumentasjonWithRelationSchema } from './etterlevelseDokumentasjonSchema'
import ROSEdit from './rosEdit'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  isInheritingFrom: boolean
}

export const GjenbrukEtterlevelseDokumentasjonForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  isInheritingFrom,
}) => {
  const [alleAvdelingOptions, setAlleAvdelingOptions] = useState<TOption[]>([])
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [selectedAvdeling, setSelectedAvdeling] = useState<string>(
    etterlevelseDokumentasjon && etterlevelseDokumentasjon.nomAvdelingId
      ? etterlevelseDokumentasjon.nomAvdelingId
      : ''
  )
  const [seksjonerByAvdeling, setSeksjonerByAvdeling] = useState<TOption[]>([])
  const user = useContext(UserContext)
  const router = useRouter()

  const formRef: RefObject<any> = useRef(undefined)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  const submit = async (
    etterlevelseDokumentasjonWithRelation: IEtterlevelseDokumentasjonWithRelation
  ): Promise<void> => {
    const mutatedEtterlevelsesDokumentasjon = etterlevelseDokumentasjonWithRelation
    const members = getMembersFromEtterlevelseDokumentasjon(etterlevelseDokumentasjon)

    //Add document creator as member if user is not included in members list
    if (mutatedEtterlevelsesDokumentasjon.resourcesData && !members.includes(user.getIdent())) {
      mutatedEtterlevelsesDokumentasjon.resourcesData.push({
        navIdent: user.getIdent(),
        givenName: user.getIdent(),
        familyName: user.getIdent(),
        fullName: user.getIdent(),
        email: user.getIdent(),
        resourceType: user.getIdent(),
      })
    }

    await createEtterlevelseDokumentasjonWithRelataion(
      etterlevelseDokumentasjon.id,
      mutatedEtterlevelsesDokumentasjon
    ).then((response: IEtterlevelseDokumentasjon) =>
      router.push(etterlevelseDokumentasjonIdUrl(response.id))
    )
  }

  useEffect(() => {
    ;(async () => {
      await getAvdelingOptions().then(setAlleAvdelingOptions)
    })()
  }, [])

  useEffect(() => {
    if (!_.isEmpty(formRef.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  useEffect(() => {
    ;(async () => {
      if (selectedAvdeling !== '' && selectedAvdeling !== undefined) {
        await getSeksjonOptionsByAvdelingId(selectedAvdeling).then(setSeksjonerByAvdeling)
      }
    })()
  }, [selectedAvdeling])

  return (
    <Formik
      initialValues={etterlevelseDokumentasjonWithRelationMapToFormVal({
        irrelevansFor: etterlevelseDokumentasjon.irrelevansFor,
        prioritertKravNummer: etterlevelseDokumentasjon.prioritertKravNummer,
        behandlinger: etterlevelseDokumentasjon.behandlinger,
        behandlingIds: etterlevelseDokumentasjon.behandlingIds,
        behandlerPersonopplysninger: etterlevelseDokumentasjon.behandlerPersonopplysninger,
      })}
      innerRef={formRef}
      onSubmit={submit}
      validationSchema={etterlevelseDokumentasjonWithRelationSchema()}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ errors, submitForm }) => (
        <Form className='flex flex-col gap-3'>
          <FieldWrapper marginBottom>
            <Field name='relationType'>
              {(fp: FieldProps) => (
                <RadioGroup
                  legend='Hvordan ønsker du å gjenbruke dette dokumentet?'
                  onChange={(value) => fp.form.setFieldValue('relationType', value)}
                  description={
                    isInheritingFrom ? 'Kan ikke arve fra dette etterlevelsesdokumentet' : null
                  }
                  error={
                    fp.form.errors['relationType'] ? (
                      <FormError fieldName='relationType' />
                    ) : undefined
                  }
                >
                  {!isInheritingFrom && (
                    <Radio value={ERelationType.ARVER}>
                      Beholde relasjonen, og arve endringer på svar etter hvert som de kommer
                    </Radio>
                  )}
                  <Radio value={ERelationType.ENGANGSKOPI}>
                    Lage en engangskopi som uavhengig dokument
                  </Radio>
                </RadioGroup>
              )}
            </Field>
          </FieldWrapper>

          <TextAreaField
            rows={2}
            noPlaceholder
            label='Navngi ditt nye dokument'
            caption='Prøv å velge noe unikt som gjør det lett å skille denne etterlevelsen fra andre, lignende'
            name='title'
          />

          <div className='mt-5'>
            <TextAreaField
              rows={5}
              noPlaceholder
              label='Beskriv nærmere etterlevelsens kontekst, for eksempel hvilken løsning, målgruppe eller arbeid som omfattes'
              name='beskrivelse'
            />
          </div>

          <FieldWrapper>
            <FieldArray name='behandlinger'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='my-3'>
                  <LabelWithDescription
                    label={'Legg til behandlinger fra Behandlingskatalogen'}
                    description='Skriv minst 3 tegn for å søke'
                  />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter behandlinger'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={searchBehandlingOptions}
                      onChange={(value) => {
                        if (value) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                  </div>
                  <RenderTagList
                    list={fieldArrayRenderProps.form.values.behandlinger.map(
                      (behandling: IBehandling) => behandlingName(behandling)
                    )}
                    onRemove={fieldArrayRenderProps.remove}
                  />
                </div>
              )}
            </FieldArray>
          </FieldWrapper>

          <ROSEdit />

          <Heading level='2' size='small' spacing>
            Legg til minst et team og/eller en person
          </Heading>

          <div id='teamsData' className='flex flex-col lg:flex-row gap-5 mb-5'>
            <FieldArray name='teamsData'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='flex-1'>
                  <LabelWithTooltip label='Søk team fra Teamkatalogen' tooltip='' />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter team'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={useSearchTeamOptions}
                      onChange={(value: any) => {
                        if (
                          value &&
                          fieldArrayRenderProps.form.values.teamsData.filter(
                            (team: ITeam) => team.id === value.id
                          ).length === 0
                        ) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                  </div>
                  <RenderTagList
                    list={fieldArrayRenderProps.form.values.teamsData.map(
                      (tema: ITeam) => tema.name
                    )}
                    onRemove={fieldArrayRenderProps.remove}
                  />
                </div>
              )}
            </FieldArray>
            <div className='flex-1' />
          </div>
          <div id='resourcesData' className='flex flex-col lg:flex-row gap-5 mb-5'>
            <FieldArray name='resourcesData'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='flex-1'>
                  <LabelWithTooltip label='Søk etter person' tooltip='' />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter person'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => {
                        return noOptionMessage(inputValue)
                      }}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={searchResourceByNameOptions}
                      onChange={(value: any) => {
                        if (
                          value &&
                          fieldArrayRenderProps.form.values.resourcesData.filter(
                            (team: ITeamResource) => team.navIdent === value.navIdent
                          ).length === 0
                        ) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                    <RenderTagList
                      list={fieldArrayRenderProps.form.values.resourcesData.map(
                        (resource: ITeamResource) => resource.fullName
                      )}
                      onRemove={fieldArrayRenderProps.remove}
                    />
                  </div>
                </div>
              )}
            </FieldArray>
            <div className='flex-1' />
          </div>

          {errors.teamsData && <Error message={errors.teamsData as string} />}

          <div id='varslingsadresser' className='mt-5'>
            <VarslingsadresserEdit fieldName='varslingsadresser' />
            {errors.varslingsadresser && <Error message={errors.varslingsadresser as string} />}
          </div>

          <div id='avdeling' className='flex flex-col lg:flex-row gap-5'>
            <FieldWrapper>
              <Field name='nomAvdelingId'>
                {(fieldProps: FieldProps) => (
                  <div>
                    <LabelWithDescription
                      label='Avdeling'
                      description='Angi hvilken avdeling som er ansvarlig for etterlevelsen og som er risikoeier.'
                    />
                    <OptionList
                      label='Avdeling'
                      options={alleAvdelingOptions}
                      value={fieldProps.field.value}
                      onChange={async (value: any) => {
                        setSelectedAvdeling(value)

                        if (value !== fieldProps.form.values.nomAvdelingId) {
                          await fieldProps.form.setFieldValue('seksjoner', [])
                        }
                        await fieldProps.form.setFieldValue('nomAvdelingId', value)
                        await fieldProps.form.setFieldValue(
                          'avdelingNavn',
                          alleAvdelingOptions.filter((avdeling) => avdeling.value === value)[0]
                            .label
                        )
                      }}
                    />
                  </div>
                )}
              </Field>
            </FieldWrapper>
            <div className='flex-1' />
          </div>

          {selectedAvdeling !== '' && selectedAvdeling !== undefined && (
            <div id='seksjon' className='flex flex-col lg:flex-row gap-5'>
              <FieldWrapper marginTop full>
                <FieldArray name='seksjoner'>
                  {(fieldProps: FieldArrayRenderProps) => (
                    <div>
                      <LabelWithDescription label='Angi hvilken seksjon som er ansvarlig for etterlevelsen' />
                      <OptionList
                        label='Seksjon'
                        options={seksjonerByAvdeling}
                        onChange={async (value: any) => {
                          if (value) {
                            const selectedSeksjon = seksjonerByAvdeling.filter(
                              (seksjon) => seksjon.value === value
                            )[0]

                            const ikkeFinnesAlleredeIListe =
                              fieldProps.form.values.seksjoner.filter(
                                (seksjon: INomSeksjon) => seksjon.nomSeksjonId === value
                              ).length === 0

                            if (ikkeFinnesAlleredeIListe) {
                              await fieldProps.form.setFieldValue('seksjoner', [
                                ...fieldProps.form.values.seksjoner,
                                {
                                  nomSeksjonId: selectedSeksjon.value,
                                  nomSeksjonName: selectedSeksjon.label,
                                },
                              ])
                            }
                          }
                        }}
                      />
                      <RenderTagList
                        list={fieldProps.form.values.seksjoner.map(
                          (seksjon: INomSeksjon) => seksjon.nomSeksjonName
                        )}
                        onRemove={fieldProps.remove}
                      />
                    </div>
                  )}
                </FieldArray>
              </FieldWrapper>

              <div className='flex-1' />
            </div>
          )}

          <div id='risikoeiereData' className='flex flex-col lg:flex-row gap-5 mt-5'>
            <FieldArray name='risikoeiereData'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='flex-1'>
                  <LabelWithTooltip label='Søk etter risikoeier' tooltip='' />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter risikoeier'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => {
                        return noOptionMessage(inputValue)
                      }}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={searchResourceByNameOptions}
                      onChange={(value: any) => {
                        if (
                          value &&
                          fieldArrayRenderProps.form.values.risikoeiereData.filter(
                            (team: ITeamResource) => team.navIdent === value.navIdent
                          ).length === 0
                        ) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                    <RenderTagList
                      list={fieldArrayRenderProps.form.values.risikoeiereData.map(
                        (resource: ITeamResource) => resource.fullName
                      )}
                      onRemove={fieldArrayRenderProps.remove}
                    />
                  </div>
                </div>
              )}
            </FieldArray>
            <div className='flex-1' />
          </div>

          {!_.isEmpty(errors) && (
            <ErrorSummary
              ref={errorSummaryRef}
              heading='Du må rette disse feilene før du kan fortsette'
            >
              {Object.entries(errors)
                .filter(([, error]) => error)
                .map(([key, error]) => (
                  <ErrorSummary.Item href={`#${key}`} key={key}>
                    {error as string}
                  </ErrorSummary.Item>
                ))}
            </ErrorSummary>
          )}

          <div className='button_container flex flex-col mt-40 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-white'>
            <div className='flex flex-row-reverse'>
              <Button
                type='button'
                onClick={async () => {
                  // ampli.logEvent('knapp trykket', {
                  //   tekst: 'gjenbruk etterlevelsesdokument',
                  // })
                  errorSummaryRef.current?.focus()
                  await submitForm()
                  setSubmitClick(!submitClick)
                }}
                className='ml-2.5'
              >
                Opprett
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  // ampli.logEvent('knapp trykket', {
                  //   tekst: 'Avbryt gjenbruk etterlevelsesdokument',
                  // })
                  router.back()
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default GjenbrukEtterlevelseDokumentasjonForm
