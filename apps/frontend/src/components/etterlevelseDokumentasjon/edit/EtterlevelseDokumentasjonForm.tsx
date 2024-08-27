import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Label,
  ReadMore,
  TextField,
} from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandlingOptions } from '../../../api/BehandlingApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '../../../api/DocumentRelationApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { searchResourceByNameOptions, useSearchTeamOptions } from '../../../api/TeamApi'
import {
  ERelationType,
  IBehandling,
  IDocumentRelationWithEtterlevelseDokumetajson,
  ITeam,
  ITeamResource,
  IVirkemiddel,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { EListName, ICode, ICodeListFormValues, codelist } from '../../../services/Codelist'
import { user } from '../../../services/User'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { BoolField, FieldWrapper, OptionList, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip, { LabelWithDescription } from '../../common/LabelWithTooltip'
import { Markdown } from '../../common/Markdown'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../../search/util'
import { VarslingsadresserEdit } from '../../varslingsadresse/VarslingsadresserEdit'
import { etterlevelseDokumentasjonSchema } from './etterlevelseDokumentasjonSchema'

type TEditEtterlevelseDokumentasjonModalProps = {
  title: string
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isEditButton?: boolean
}

export const EtterlevelseDokumentasjonForm = (props: TEditEtterlevelseDokumentasjonModalProps) => {
  const { title, etterlevelseDokumentasjon, isEditButton } = props
  const relevansOptions = codelist.getParsedOptions(EListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(
    relevansOptions.map((_relevans, index) => index)
  )

  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<IVirkemiddel>()
  const [dokumentRelasjon, setDokumentRelasjon] =
    useState<IDocumentRelationWithEtterlevelseDokumetajson>()
  const navigate = useNavigate()

  const [customPersonForDev, setCustomPersonForDev] = useState<string>('')
  const [customRisikoeierForDev, setCustomRisikoeierForDev] = useState<string>('')

  const isDev =
    window.location.origin.includes('.dev.') || window.location.origin.includes('localhost')

  const isForRedigering = window.location.pathname.includes('/edit')

  const labelNavngiDokument: string = isForRedigering
    ? 'Navngi dokumentet ditt'
    : 'Navngi det nye dokumentet ditt'

  useEffect(() => {
    if (etterlevelseDokumentasjon?.irrelevansFor.length) {
      const irrelevans = etterlevelseDokumentasjon.irrelevansFor.map((irrelevans: ICode) =>
        relevansOptions.findIndex((relevans) => relevans.value === irrelevans.code)
      )
      setSelectedFilter(
        relevansOptions
          .map((_relevans, index) => {
            return index
          })
          .filter((index) => !irrelevans.includes(index))
      )
    } else {
      setSelectedFilter(
        relevansOptions.map((_relevans, index) => {
          return index
        })
      )
    }

    if (etterlevelseDokumentasjon?.virkemiddel?.navn) {
      setSelectedVirkemiddel(etterlevelseDokumentasjon.virkemiddel)
    }

    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getDocumentRelationByToIdAndRelationTypeWithData(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((resp) => setDokumentRelasjon(resp[0]))
      }
    })()
  }, [etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
    console.debug(selectedVirkemiddel)

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

      await createEtterlevelseDokumentasjon(mutatedEtterlevelsesDokumentasjon).then((response) => {
        if (response.id) {
          navigate('/dokumentasjon/' + response.id)
        }
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        if (response.id) {
          navigate('/dokumentasjon/' + response.id)
        }
      })
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
      validateOnBlur={false}
    >
      {({ values, submitForm, setFieldValue, errors }) => (
        <Form>
          <Heading size="medium" level="1" spacing>
            {title}
          </Heading>

          {dokumentRelasjon && (
            <Alert variant="info" className="mb-5">
              <Label>Forutsetninger for gjenbruk av dette dokumentet</Label>

              <div className="mb-5">
                <Markdown source={dokumentRelasjon.fromDocumentWithData.gjenbrukBeskrivelse} />
              </div>
            </Alert>
          )}

          <TextAreaField
            rows={2}
            noPlaceholder
            label={labelNavngiDokument}
            caption="Prøv å velge noe unikt som gjør det lett å skille denne etterlevelsen fra andre, lignende"
            name="title"
          />

          <div className="mt-5">
            <TextAreaField
              height="150px"
              noPlaceholder
              label="Beskriv nærmere etterlevelsens kontekst, for eksempel hvilken løsning, målgruppe eller arbeid som omfattes"
              name="beskrivelse"
              markdown
            />
          </div>

          {/* <BoolField label="Er produktet/systemet tilknyttet et virkemiddel?" name="knyttetTilVirkemiddel" /> */}

          {/* {values.knyttetTilVirkemiddel ? (
                    <FieldWrapper>
                      <Field name="virkemiddelId">
                        {(fp: FieldProps) => {
                          return (
                              <div>
                              <LabelWithTooltip label={'Legg til virkemiddel'} tooltip="Søk og legg til virkemiddel" />
                              <CustomizedSelect
                                  labelKey={'navn'}
                                  options={virkemiddelSearchResult}
                                  placeholder={'Søk virkemiddel'}
                                  onInputChange={(event) => setVirkemiddelSearchResult(event.currentTarget.value)}
                                  onChange={(params) => {
                                    let virkemiddel = params.value.length ? params.value[0] : undefined
                                    if (virkemiddel) {
                                      fp.form.values['virkemiddelId'] = virkemiddel.id
                                      setSelectedVirkemiddel(virkemiddel as Virkemiddel)
                                    }
                                  }}
                                  isLoading={loadingVirkemiddelSearchResult}
                                />
                                {selectedVirkemiddel && (
                                  <Tag
                                    variant={VARIANT.outlined}
                                    onActionClick={() => {
                                      setSelectedVirkemiddel(undefined)
                                      fp.form.setFieldValue('virkemiddelId', '')
                                    }}
                                  >
                                    {selectedVirkemiddel.navn}
                                  </Tag>
                                )}
                              </div>
                          )
                        }}
                      </Field>
                      <Error fieldName="virkemiddelId" fullWidth />
                    </FieldWrapper>
                  ) : ( */}

          {!dokumentRelasjon && (
            <FieldArray name="irrelevansFor">
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className="h-full pt-5 w-[calc(100% - 1rem)]">
                  <CheckboxGroup
                    legend="Hvilke egenskaper gjelder for etterlevelsen?"
                    description="Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon."
                    value={selectedFilter}
                    onChange={(selected) => {
                      setSelectedFilter(selected)

                      const irrelevansListe = relevansOptions.filter(
                        (_irrelevans, index) => !selected.includes(index)
                      )
                      fieldArrayRenderProps.form.setFieldValue(
                        'irrelevansFor',
                        irrelevansListe.map((irrelevans) =>
                          codelist.getCode(EListName.RELEVANS, irrelevans.value)
                        )
                      )
                      // selected.forEach((value) => {
                      //   const i = parseInt(value)
                      //   if (!selectedFilter.includes(i)) {
                      //     setSelectedFilter([...selectedFilter, i])
                      //     p.remove(p.form.values.irrelevansFor.findIndex((ir: ICode) => ir.code === relevansOptions[i].value))
                      //   } else {
                      //     setSelectedFilter(selectedFilter.filter((value) => value !== i))
                      //     p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].value as string))
                      //   }
                      // })
                    }}
                  >
                    {relevansOptions.map((relevans, index) => (
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

          <BoolField
            label="Ønsker du å legge til eksisterende behandling(er) nå?"
            name="behandlerPersonopplysninger"
            tooltip="Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å legge til behandling senere."
          />

          {values.behandlerPersonopplysninger && (
            <FieldWrapper>
              <FieldArray name="behandlinger">
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className="my-3">
                    <LabelWithDescription
                      label={'Legg til behandlinger fra Behandlingskatalogen'}
                      description="Skriv minst 3 tegn for å søke"
                    />
                    <div className="w-full">
                      <AsyncSelect
                        aria-label="Søk etter behandlinger"
                        placeholder=""
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
                          if (value && !values.avdeling && values.behandlinger?.length === 0) {
                            const behandling = value as IBehandling
                            const newAvdeling = {
                              list: EListName.AVDELING,
                              shortName: behandling.avdeling?.shortName || '',
                              code: behandling.avdeling?.code || '',
                              description: behandling.avdeling?.description || '',
                            } as ICodeListFormValues
                            setFieldValue('avdeling', newAvdeling)
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
          )}

          <Heading level="2" size="small" spacing>
            Legg til minst et team og/eller en person
          </Heading>

          <div id="teamsData" className="flex flex-col lg:flex-row gap-5 mb-5">
            <FieldArray name="teamsData">
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className="flex-1">
                  <LabelWithTooltip label="Søk team fra Teamkatalogen" tooltip="" />
                  <div className="w-full">
                    <AsyncSelect
                      aria-label="Søk etter team"
                      placeholder=""
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
            <div className="flex-1" />
          </div>
          <div className="flex flex-col lg:flex-row gap-5 mb-5">
            <FieldArray name="resourcesData">
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className="flex-1">
                  <LabelWithTooltip label="Søk etter person" tooltip="" />
                  <div className="w-full">
                    <AsyncSelect
                      aria-label="Søk etter person"
                      placeholder=""
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

                  {isDev && (
                    <ReadMore header="Hva hvis jeg ikke finner person">
                      <div className="flex gap-2 items-end my-2">
                        <TextField
                          label="Skriv inn NAV ident dersom du ikke finner person over"
                          value={customPersonForDev}
                          onChange={(event) => setCustomPersonForDev(event.target.value)}
                        />
                        <div>
                          <Button
                            type="button"
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
            <div className="flex-1" />
          </div>

          {errors.teamsData && <Error message={errors.teamsData as string} />}

          <div id="varslingsadresser" className="mt-5">
            <VarslingsadresserEdit fieldName="varslingsadresser" />
            {errors.varslingsadresser && <Error message={errors.varslingsadresser as string} />}
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            <FieldWrapper marginTop full>
              <Field name="avdeling">
                {(fieldProps: FieldProps<ICode, ICodeListFormValues>) => (
                  <div>
                    <LabelWithDescription label="Angi hvilken avdeling som er ansvarlig for etterlevelsen" />
                    <OptionList
                      listName={EListName.AVDELING}
                      label="Avdeling"
                      value={fieldProps.field.value?.code}
                      onChange={(value) => {
                        fieldProps.form.setFieldValue('avdeling', value)
                      }}
                    />
                  </div>
                )}
              </Field>
            </FieldWrapper>

            <div className="flex-1" />
          </div>

          <div className="flex flex-col lg:flex-row gap-5 mt-5">
            <FieldArray name="risikoeiereData">
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className="flex-1">
                  <LabelWithTooltip label="Søk etter risikoeier" tooltip="" />
                  <div className="w-full">
                    <AsyncSelect
                      aria-label="Søk etter risikoeier"
                      placeholder=""
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

                  {isDev && (
                    <ReadMore header="Hva hvis jeg ikke finner risikoeier?">
                      <div className="flex gap-2 items-end my-2">
                        <TextField
                          label="Skriv inn NAV ident dersom du ikke finner risikoeier over"
                          value={customRisikoeierForDev}
                          onChange={(event) => setCustomRisikoeierForDev(event.target.value)}
                        />
                        <div>
                          <Button
                            type="button"
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

            <div className="flex-1" />
          </div>

          {!dokumentRelasjon && isDev && (
            <div className="mt-5">
              <CheckboxGroup
                legend="Skal dette dokumentet kunne gjenbrukes av andre?"
                onChange={(value: boolean[]) => setFieldValue('forGjenbruk', value.length !== 0)}
                value={[values.forGjenbruk]}
                description="Velger du gjenbruk, får du mulighet til å legge inn vurderinger og veiledning. Du får velge selv når du vil tillate gjenbruk."
              >
                <Checkbox value={true}>Ja, dette dokumentet skal gjenbrukes</Checkbox>
              </CheckboxGroup>
            </div>
          )}

          <div className="button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-2 bg-bg-default">
            <div className="flex flex-row-reverse">
              <Button
                type="button"
                onClick={() => {
                  if (!isEditButton) {
                    ampli.logEvent('knapp trykket', {
                      tekst: 'Opprett etterlevelsesdokument',
                    })
                  }
                  submitForm()
                }}
                className="ml-2.5"
              >
                {isEditButton ? 'Lagre' : 'Opprett'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'Avbryt opprett etterlevelsesdokument',
                  })
                  navigate(-1)
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>

          <ScrollToFieldError />
        </Form>
      )}
    </Formik>
  )
}

const getMembersFromEtterlevelseDokumentasjon = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
) => {
  const members = []
  if (etterlevelseDokumentasjon.teamsData && etterlevelseDokumentasjon.teamsData.length > 0) {
    etterlevelseDokumentasjon.teamsData.forEach((team) => {
      const teamMembers = team.members.map((members) => members.navIdent || '')
      members.push(...teamMembers)
    })
  }
  if (
    etterlevelseDokumentasjon.resourcesData &&
    etterlevelseDokumentasjon.resourcesData.length > 0
  ) {
    members.push(...etterlevelseDokumentasjon.resourcesData.map((resource) => resource.navIdent))
  }

  return members
}

export default EtterlevelseDokumentasjonForm
