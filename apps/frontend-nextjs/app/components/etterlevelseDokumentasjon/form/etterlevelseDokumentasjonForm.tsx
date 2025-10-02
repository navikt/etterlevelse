'use client'

import { searchBehandlingOptions } from '@/api/behandlingskatalog/behandlingskatalogApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getAvdelingOptions } from '@/api/nom/nomApi'
import {
  searchResourceByNameOptions,
  useSearchTeamOptions,
} from '@/api/teamkatalogen/teamkatalogenApi'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { OptionList } from '@/components/common/inputs'
import LabelWithTooltip, {
  LabelWithDescription,
} from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Markdown } from '@/components/common/markdown/markdown'
import { Error } from '@/components/common/modalSchema/ModalSchema'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { DropdownIndicator } from '@/components/etterlevelse/edit/dropdownIndicator/dropdownIndicator'
import { VarslingsadresserEdit } from '@/components/varslingsadresse/VarslingsadresserEdit'
import { IBehandling } from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { TOption } from '@/constants/commonConstants'
import {
  ERelationType,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import {
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import {
  CodelistContext,
  EListName,
  IGetParsedOptionsProps,
} from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { behandlingName } from '@/util/behandling/behandlingUtil'
import { env } from '@/util/env/env'
import { getMembersFromEtterlevelseDokumentasjon } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  ErrorSummary,
  Heading,
  Label,
  ReadMore,
  TextField,
} from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import _ from 'lodash'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChangeEvent,
  FunctionComponent,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import AsyncSelect from 'react-select/async'
import { etterlevelseDokumentasjonSchema } from './etterlevelseDokumentasjonSchema'
import ROSEdit from './rosEdit'

type TEditEtterlevelseDokumentasjonModalProps = {
  title: string
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isEditButton?: boolean
}

export const EtterlevelseDokumentasjonForm: FunctionComponent<
  TEditEtterlevelseDokumentasjonModalProps
> = ({ title, etterlevelseDokumentasjon, isEditButton }) => {
  const user = useContext(UserContext)
  const codelist = useContext(CodelistContext)
  const pathName = usePathname()
  const relevansOptions: IGetParsedOptionsProps[] = codelist.utils.getParsedOptions(
    EListName.RELEVANS
  )
  const router = useRouter()
  const [selectedFilter, setSelectedFilter] = useState<number[]>([])

  const [dokumentRelasjon, setDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()

  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')
  const [customRisikoeierForDev, setCustomRisikoeierForDev] = useState<string>('')

  const isForRedigering: boolean = pathName.includes('/edit')

  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)
  const [validateOnBlur, setValidateOnBlur] = useState(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)
  const [alleAvdelingOptions, setAllAvdelingOptions] = useState<TOption[]>([])

  const labelNavngiDokument: string = isForRedigering
    ? 'Navngi dokumentet ditt'
    : 'Navngi det nye dokumentet ditt'

  useEffect(() => {
    if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.irrelevansFor.length) {
      const irrelevansIndex = etterlevelseDokumentasjon.irrelevansFor.map((irrelevans: ICode) => {
        return relevansOptions.findIndex(
          (relevans: IGetParsedOptionsProps) => relevans.value === irrelevans.code
        )
      })
      setSelectedFilter(
        relevansOptions
          .map((_relevans: IGetParsedOptionsProps, index: number) => {
            return index
          })
          .filter((index: number) => !irrelevansIndex.includes(index))
      )
    } else {
      setSelectedFilter(
        relevansOptions.map((_relevans: IGetParsedOptionsProps, index: number) => {
          return index
        })
      )
    }
  }, [etterlevelseDokumentasjon, codelist.lists])

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getDocumentRelationByToIdAndRelationTypeWithData(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((response: IDocumentRelationWithEtterlevelseDokumetajson[]) =>
          setDokumentRelasjon(response[0])
        )
      }
    })()
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    ;(async () => {
      await getAvdelingOptions().then(setAllAvdelingOptions)
    })()
  }, [])

  useEffect(() => {
    if (!_.isEmpty(formRef.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  const submit = async (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL): Promise<void> => {
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      const mutatedEtterlevelsesDokumentasjon = etterlevelseDokumentasjon
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

      await createEtterlevelseDokumentasjon(mutatedEtterlevelsesDokumentasjon).then(
        (response: IEtterlevelseDokumentasjon) => {
          if (response.id) {
            router.push(etterlevelseDokumentasjonIdUrl(response.id))
          }
        }
      )
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then(
        (response: IEtterlevelseDokumentasjon) => {
          if (response.id) {
            router.push(etterlevelseDokumentasjonIdUrl(response.id))
          }
        }
      )
    }
  }

  return (
    <Formik
      initialValues={etterlevelseDokumentasjonMapToFormVal(
        etterlevelseDokumentasjon ? etterlevelseDokumentasjon : {}
      )}
      onSubmit={submit}
      validationSchema={etterlevelseDokumentasjonSchema()}
      validateOnChange={false}
      validateOnBlur={validateOnBlur}
      innerRef={formRef}
    >
      {({ values, submitForm, setFieldValue, errors }) => (
        <Form>
          <Heading size='medium' level='1' spacing>
            {title}
          </Heading>

          {dokumentRelasjon && (
            <Alert contentMaxWidth={false} variant='info' className='mb-5'>
              <Label>Dette må du vite om gjenbruk</Label>

              <div className='mb-5'>
                <Markdown source={dokumentRelasjon.fromDocumentWithData.gjenbrukBeskrivelse} />
              </div>
            </Alert>
          )}

          <TextAreaField
            rows={2}
            noPlaceholder
            label={labelNavngiDokument}
            caption='Prøv å velge noe unikt som gjør det lett å skille denne etterlevelsen fra andre, lignende'
            name='title'
          />

          <div className='mt-5'>
            <TextAreaField
              height='150px'
              noPlaceholder
              label='Beskriv nærmere etterlevelsens kontekst, for eksempel hvilken løsning, målgruppe eller arbeid som omfattes'
              name='beskrivelse'
              markdown
            />
          </div>

          {!dokumentRelasjon && (
            <FieldArray name='test'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='h-full pt-5 w-[calc(100% - 1rem)]'>
                  <Heading size='small' level='2' spacing>
                    Velg egenskaper
                  </Heading>
                  <CheckboxGroup
                    legend='Hvilke egenskaper gjelder for etterlevelsen?'
                    description='Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon.'
                    value={selectedFilter}
                    onChange={(selected: number[]) => {
                      setSelectedFilter(selected)
                      const irrelevansListe = relevansOptions.filter(
                        (_irrelevans: IGetParsedOptionsProps, index: number) =>
                          !selected.includes(index)
                      )

                      fieldArrayRenderProps.form.setFieldValue(
                        'irrelevansFor',
                        irrelevansListe.map((irrelevans: IGetParsedOptionsProps) =>
                          codelist.utils.getCode(EListName.RELEVANS, irrelevans.value)
                        )
                      )
                      // selected.forEach((value) => {
                      //   const i = parseInt(value)
                      //   if (!selectedFilter.includes(i)) {
                      //     setSelectedFilter([...selectedFilter, i])
                      //     p.remove(p.form.values.irrelevansFor.findIndex((ir: ICode) => ir.code === relevansOptions[i].value))
                      //   } else {
                      //     setSelectedFilter(selectedFilter.filter((value) => value !== i))
                      //     p.push(codelistUtils.getCode(ListName.RELEVANS, relevansOptions[i].value as string))
                      //   }
                      // })
                    }}
                  >
                    {relevansOptions.map((relevans: IGetParsedOptionsProps, index: number) => (
                      <Checkbox
                        key={'relevans_' + relevans.value}
                        value={index}
                        description={relevans.description}
                      >
                        {relevans.label}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
              )}
            </FieldArray>
          )}

          {/* DONT REMOVE */}
          {/* )} */}

          <Heading className='mt-5' size='small' level='2' spacing id='behandling'>
            Velg behandlinger
          </Heading>

          <FieldWrapper>
            <FieldArray name='behandlinger'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='my-3'>
                  <LabelWithDescription
                    label='Legg til behandlinger fra Behandlingskatalogen'
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
                      onChange={(value: any) => {
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

                  {env.isDev && (
                    <ReadMore header='Hva hvis jeg ikke finner person'>
                      <div className='flex gap-2 items-end my-2'>
                        <TextField
                          label='Skriv inn Nav ident dersom du ikke finner person over'
                          value={customPersonForDev}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setCustomPersonForDev(event.target.value)
                          }
                        />
                        <div>
                          <Button
                            type='button'
                            onClick={() => {
                              fieldArrayRenderProps.push({
                                navIdent: customPersonForDev,
                                givenName: customPersonForDev,
                                familyName: customPersonForDev,
                                fullName: customPersonForDev,
                                email: customPersonForDev,
                                resourceType: customPersonForDev,
                              })
                            }}
                          >
                            Legg til
                          </Button>
                        </div>
                      </div>
                      <RenderTagList
                        list={fieldArrayRenderProps.form.values.resourcesData.map(
                          (resource: ITeamResource) => resource.fullName
                        )}
                        onRemove={fieldArrayRenderProps.remove}
                      />
                    </ReadMore>
                  )}
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
            <FieldWrapper marginTop full>
              <Field name='nomAvdelingId'>
                {(fieldProps: FieldProps) => (
                  <div>
                    <LabelWithDescription label='Angi hvilken avdeling som er ansvarlig for etterlevelsen' />
                    <OptionList
                      label='Avdeling'
                      options={alleAvdelingOptions}
                      value={fieldProps.field.value}
                      onChange={async (value: any) => {
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

                  {env.isDev && (
                    <ReadMore header='Hva hvis jeg ikke finner risikoeier?'>
                      <div className='flex gap-2 items-end my-2'>
                        <TextField
                          label='Skriv inn Nav ident dersom du ikke finner risikoeier over'
                          value={customRisikoeierForDev}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setCustomRisikoeierForDev(event.target.value)
                          }
                        />
                        <div>
                          <Button
                            type='button'
                            onClick={() => {
                              fieldArrayRenderProps.push({
                                navIdent: customRisikoeierForDev,
                                givenName: customRisikoeierForDev,
                                familyName: customRisikoeierForDev,
                                fullName: customRisikoeierForDev,
                                email: customRisikoeierForDev,
                                resourceType: customRisikoeierForDev,
                              })
                            }}
                          >
                            Legg til
                          </Button>
                        </div>
                      </div>
                      <RenderTagList
                        list={fieldArrayRenderProps.form.values.risikoeiereData.map(
                          (resource: ITeamResource) => resource.fullName
                        )}
                        onRemove={fieldArrayRenderProps.remove}
                      />
                    </ReadMore>
                  )}
                </div>
              )}
            </FieldArray>

            <div className='flex-1' />
          </div>

          {!dokumentRelasjon && (
            <div className='mt-5'>
              <CheckboxGroup
                legend='Skal dette dokumentet kunne gjenbrukes av andre?'
                onChange={(value: boolean[]) => setFieldValue('forGjenbruk', value.length !== 0)}
                value={[values.forGjenbruk]}
                description='Velger du gjenbruk, får du mulighet til å legge inn vurderinger og veiledning. Du får velge selv når du vil tillate gjenbruk.'
              >
                <Checkbox value={true}>Ja, dette dokumentet skal gjenbrukes</Checkbox>
              </CheckboxGroup>
            </div>
          )}

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

          <div className='button_container flex flex-col mt-40 py-4 px-4 sticky bottom-0 border-t-2 z-2 bg-white'>
            <div className='flex flex-row-reverse'>
              <Button
                type='button'
                onClick={async () => {
                  if (!isEditButton) {
                    // ampli.logEvent('knapp trykket', {
                    //   tekst: 'Opprett etterlevelsesdokument',
                    // })
                  }
                  errorSummaryRef.current?.focus()
                  setValidateOnBlur(true)
                  await submitForm()
                  setSubmitClick(!submitClick)
                }}
                className='ml-2.5'
              >
                {isEditButton ? 'Lagre' : 'Opprett'}
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  // ampli.logEvent('knapp trykket', {
                  //   tekst: 'Avbryt opprett etterlevelsesdokument',
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

export default EtterlevelseDokumentasjonForm
