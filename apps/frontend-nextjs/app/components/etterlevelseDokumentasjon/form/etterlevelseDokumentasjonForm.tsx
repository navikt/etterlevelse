'use client'

import { InformationSquareIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Button,
  Checkbox,
  CheckboxGroup,
  ErrorSummary,
  Heading,
  InfoCard,
  Label,
  List,
  Modal,
  ReadMore,
  Select,
  TextField,
} from '@navikt/ds-react'
import { FieldArray, FieldArrayRenderProps, Form, Formik, getIn } from 'formik'
import _ from 'lodash'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChangeEvent,
  Fragment,
  FunctionComponent,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import AsyncSelect from 'react-select/async'
import { useArdoqSearch } from '@/api/ardoq/ardoqApi'
import { getBehandlingensArtOgOmfangByEtterlevelseDokumentId } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { getBehandlingensLivslopByEtterlevelseDokumentId } from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import {
  searchBehandlingOptions,
  searchDpBehandlingOptions,
} from '@/api/behandlingskatalog/behandlingskatalogApi'
import { getDocumentRelationByToIdAndRelationTypeWithData } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  updateEtterlevelseDokumentasjon,
} from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import {
  searchResourceByNameOptions,
  useSearchTeamOptions,
} from '@/api/teamkatalogen/teamkatalogenApi'
import DataTextWrapper from '@/components/common/DataTextWrapper/DataTextWrapper'
import { DropdownIndicator } from '@/components/common/dropdownIndicator/dropdownIndicator'
import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import LabelWithTooltip, {
  LabelWithDescription,
} from '@/components/common/labelWithoTootip.tsx/LabelWithTooltip'
import { Markdown } from '@/components/common/markdown/markdown'
import { Error } from '@/components/common/modalSchema/ModalSchema'
import { RenderTagList } from '@/components/common/renderTagList/renderTagList'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { UnsavedChangesGuard } from '@/components/common/unsavedChangesGuard/unsavedChangesGuard'
import { VarslingsadresserEdit } from '@/components/varslingsadresse/VarslingsadresserEdit'
import { IArdoqSystem } from '@/constants/ardoqSystem/ardoqSystemConstants'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import {
  IBehandling,
  IDpBehandling,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  ERelationType,
  IDocumentRelationWithEtterlevelseDokumetajson,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { EEtterlevelseDokumentFormConstants } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonForm/etterlevelseDokumentasjonFormConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EListName, ICode, IGetParsedOptionsProps } from '@/constants/kodeverk/kodeverkConstants'
import { ITeam, ITeamResource } from '@/constants/teamkatalogen/teamkatalogConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonerUrl,
} from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { behandlingName, dpBehandlingName } from '@/util/behandling/behandlingUtil'
import { env } from '@/util/env/env'
import { getMembersFromEtterlevelseDokumentasjon } from '@/util/etterlevelseDokumentasjon/etterlevelseDokumentasjonUtil'
import { noOptionMessage, selectOverrides } from '@/util/search/searchUtil'
import { etterlevelseDokumentasjonSchema } from './etterlevelseDokumentasjonSchema'
import EtterlevelseDokumentNomOrganiseringForm from './nomOrganiseringForms/etterlevelseDokumentNomOrganiseringForm'
import ROSEdit from './rosEdit'

type TEditEtterlevelseDokumentasjonModalProps = {
  title: string
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isEditButton?: boolean
}

const EtterlevelseDokumentasjonForm: FunctionComponent<
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
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [behandlingensArtOgOmfang, setBehandlingensArtOgOmfang] =
    useState<IBehandlingensArtOgOmfang>()
  const [isPvkAlertModalOpen, setIsPvkAlertModalOpen] = useState<boolean>(false)
  const [tempSelectedFilter, setTempSelectedFilter] = useState<number[]>([])
  const [tempIrrelevansListe, setTempIrrelevansList] = useState<IGetParsedOptionsProps[]>([])

  const [showBehandlerPersonopplysningerInfoCard, setShowBehandlerPersonopplysningerInfoCard] =
    useState<boolean>(false)

  const labelNavngiDokument: string = isForRedigering
    ? EEtterlevelseDokumentFormConstants.NAVNGI_DOKUMENT_LABEL_ONE
    : EEtterlevelseDokumentFormConstants.NAVNGI_DOKUMENT_LABEL_TWO

  useEffect(() => {
    ;(async () => {
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
      } else if (etterlevelseDokumentasjon) {
        setSelectedFilter(
          relevansOptions.map((_relevans: IGetParsedOptionsProps, index: number) => index)
        )
      } else {
        setSelectedFilter([])
        formRef.current?.setFieldValue(
          'irrelevansFor',
          relevansOptions.map((r: IGetParsedOptionsProps) =>
            codelist.utils.getCode(EListName.RELEVANS, r.value)
          )
        )
      }
    })()
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

        await getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            if (response) setPvkDokument(response)
          })
          .catch(() => undefined)

        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            if (response) setBehandlingensLivslop(response)
          })
          .catch(() => undefined)

        await getBehandlingensArtOgOmfangByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            if (response) setBehandlingensArtOgOmfang(response)
          })
          .catch(() => undefined)
      }
    })()
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash

      if (hash) {
        const targetId = decodeURIComponent(hash.slice(1))
        const target = document.getElementById(targetId)

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          if (target instanceof HTMLElement) {
            target.focus({ preventScroll: true })
          }
        }
      }
    }
  }, [pathName])

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
      validate={() => {
        if (selectedFilter.length === 0) {
          return { irrelevansFor: 'Du må velge minst én egenskap' }
        }
        return {}
      }}
      validateOnChange={false}
      validateOnBlur={validateOnBlur}
      innerRef={formRef}
    >
      {({ values, submitForm, setFieldValue, errors, dirty }) => (
        <>
          <Form>
            <Heading size='medium' level='1' spacing>
              {title}
            </Heading>
            {dokumentRelasjon && (
              <Alert contentMaxWidth={false} variant='info' className='mb-5'>
                <Label>{EEtterlevelseDokumentFormConstants.GJENBRUK}</Label>

                <div className='mb-5'>
                  <Markdown source={dokumentRelasjon.fromDocumentWithData.gjenbrukBeskrivelse} />
                </div>
              </Alert>
            )}
            <TextAreaField
              rows={2}
              noPlaceholder
              label={labelNavngiDokument}
              caption={EEtterlevelseDokumentFormConstants.NAVNGI_DOKUMENT_CAPTION}
              name='title'
            />
            <div className='mt-5'>
              <TextAreaField
                height='150px'
                noPlaceholder
                label={EEtterlevelseDokumentFormConstants.ETTERLEVELSENS_KONTEKST_LABEL}
                name='beskrivelse'
                markdown
              />
            </div>
            {!dokumentRelasjon && (
              <FieldArray name='test'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='h-full pt-5 w-[calc(100% - 1rem)]'>
                    <Heading size='small' level='2' spacing>
                      {EEtterlevelseDokumentFormConstants.VELG_EGENSKAPER}
                    </Heading>
                    <CheckboxGroup
                      id='irrelevansFor'
                      legend={EEtterlevelseDokumentFormConstants.VELG_EGENSKAPER_LEGEND}
                      description={EEtterlevelseDokumentFormConstants.VELG_EGENSKAPER_BESKRIVELSE}
                      value={selectedFilter}
                      error={errors.irrelevansFor as string | undefined}
                      onChange={(selected: number[]) => {
                        const irrelevansListe = relevansOptions.filter(
                          (_irrelevans: IGetParsedOptionsProps, index: number) =>
                            !selected.includes(index)
                        )

                        const behandlerPvkIndex = relevansOptions
                          .map((_irrelevans: IGetParsedOptionsProps, index: number) => {
                            if (
                              _irrelevans.label ===
                              EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER
                            ) {
                              return index
                            }
                          })
                          .filter((index) => index !== undefined)

                        const harLagretInnholdSomPaavirkesAvEgenskap =
                          !!pvkDokument || !!behandlingensLivslop || !!behandlingensArtOgOmfang

                        if (
                          harLagretInnholdSomPaavirkesAvEgenskap &&
                          selected.includes(behandlerPvkIndex[0]) &&
                          !selectedFilter.includes(behandlerPvkIndex[0])
                        ) {
                          setShowBehandlerPersonopplysningerInfoCard(true)
                        }

                        if (!selected.includes(behandlerPvkIndex[0])) {
                          setShowBehandlerPersonopplysningerInfoCard(false)
                        }

                        if (
                          harLagretInnholdSomPaavirkesAvEgenskap &&
                          selectedFilter.includes(behandlerPvkIndex[0]) &&
                          !selected.includes(behandlerPvkIndex[0])
                        ) {
                          setTempSelectedFilter(selected)
                          setTempIrrelevansList(irrelevansListe)
                          setIsPvkAlertModalOpen(true)
                        } else {
                          setSelectedFilter(selected)
                          fieldArrayRenderProps.form.setFieldValue(
                            'irrelevansFor',
                            irrelevansListe.map((irrelevans: IGetParsedOptionsProps) =>
                              codelist.utils.getCode(EListName.RELEVANS, irrelevans.value)
                            )
                          )
                        }
                      }}
                    >
                      {relevansOptions.map((relevans: IGetParsedOptionsProps, index: number) => {
                        const isBehandlerPersonopplysninger =
                          relevans.label ===
                          EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER

                        const isBehandlerPersonopplysningerLocked =
                          pvkDokument?.hasPvkDocumentationStarted === true &&
                          isBehandlerPersonopplysninger &&
                          selectedFilter.includes(index)

                        return (
                          <Fragment key={'relevans_' + relevans.value}>
                            {isBehandlerPersonopplysningerLocked ? (
                              <DataTextWrapper className='mt-0 max-w-[75ch]'>
                                <Checkbox
                                  value={index}
                                  description={relevans.description}
                                  readOnly
                                  className='behandler-personopplysninger--locked'
                                >
                                  {relevans.label}
                                </Checkbox>
                              </DataTextWrapper>
                            ) : (
                              <Checkbox value={index} description={relevans.description}>
                                {relevans.label}
                              </Checkbox>
                            )}
                            {isBehandlerPersonopplysningerLocked && (
                              <InfoCard
                                data-color='info'
                                size='small'
                                className='mt-2 max-w-[75ch]'
                              >
                                <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                                  <InfoCard.Title as='div'>
                                    Fordi dere har en PVK, kan ikke{' '}
                                    {
                                      EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER
                                    }
                                    fjernes som egenskap.
                                  </InfoCard.Title>
                                </InfoCard.Header>
                              </InfoCard>
                            )}

                            {showBehandlerPersonopplysningerInfoCard &&
                              isBehandlerPersonopplysninger &&
                              !isBehandlerPersonopplysningerLocked &&
                              (behandlingensLivslop || behandlingensArtOgOmfang || pvkDokument) && (
                                <InfoCard
                                  data-color='info'
                                  size='small'
                                  className='mt-2 max-w-[75ch]'
                                >
                                  <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                                    <InfoCard.Title as='div'>
                                      Dere har dokumentasjon fra før om hvordan dere behandler
                                      personopplysninger.
                                    </InfoCard.Title>
                                  </InfoCard.Header>
                                  <InfoCard.Content>
                                    <BodyLong className='mb-7'>
                                      Tidligere har dere skrevet innhold tilknyttet én eller flere
                                      av:
                                    </BodyLong>
                                    <List as='ul'>
                                      <List.Item>“Behandlingens livsløp”</List.Item>
                                      <List.Item>“Behandlingens art og omfang”</List.Item>
                                      <List.Item>“Vurder behov for PVK”</List.Item>
                                    </List>
                                    <BodyLong className='my-7'>
                                      Dette innholdet har vært skjult fordi det ble valgt bort
                                      {
                                        EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER
                                      }
                                      ”. Nå som dere har valgt egenskapen på nytt, vil innholdet
                                      synes og kunne redigeres på gjeldende sider.
                                    </BodyLong>
                                  </InfoCard.Content>
                                </InfoCard>
                              )}
                          </Fragment>
                        )
                      })}
                    </CheckboxGroup>

                    {isPvkAlertModalOpen && (
                      <Modal
                        open={isPvkAlertModalOpen}
                        onClose={() => setIsPvkAlertModalOpen(false)}
                        header={{
                          heading: `Vil dere fjerne ${EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER}?`,
                        }}
                      >
                        <Modal.Body>
                          <BodyLong className='mb-7'>
                            Hvis dere fjerner egenskapen “
                            {EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER}”, vil
                            dere ikke lenger kunne se eller redigere
                          </BodyLong>
                          <List as='ul'>
                            <List.Item>“Tegn Behandlingens livsløp”</List.Item>
                            <List.Item>“Behandlingens art og omfang”</List.Item>
                            <List.Item>“Vurder behov for PVK”</List.Item>
                            <List.Item>PVK-dokumentet</List.Item>
                          </List>
                          <BodyLong className='my-7'>
                            Dersom dere ikke lenger behandler personopplysninger, vil ikke disse
                            sidene være relevante lenger. Innhold som dere kan ha lagt inn på de
                            sidene, vil fortsatt være lagret, bare skjult.
                          </BodyLong>
                          <BodyLong>
                            Hvis dere senere velger “
                            {EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER}” på
                            nytt, vil disse sidene, og innhold som dere har lagret der, vises og
                            kunne redigeres som før.
                          </BodyLong>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            type='button'
                            onClick={() => {
                              setSelectedFilter(tempSelectedFilter)
                              setTempSelectedFilter([])
                              fieldArrayRenderProps.form.setFieldValue(
                                'irrelevansFor',
                                tempIrrelevansListe.map((irrelevans: IGetParsedOptionsProps) =>
                                  codelist.utils.getCode(EListName.RELEVANS, irrelevans.value)
                                )
                              )
                              setTempIrrelevansList([])
                              setIsPvkAlertModalOpen(false)
                            }}
                          >
                            Fjern “{EEtterlevelseDokumentFormConstants.BEHANDLER_PERSONOPPLYSNINGER}
                            ”
                          </Button>
                          <Button
                            type='button'
                            variant='secondary'
                            onClick={() => {
                              setTempSelectedFilter([])
                              setTempIrrelevansList([])
                              setIsPvkAlertModalOpen(false)
                            }}
                          >
                            Avbryt, ikke fjern
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    )}
                  </div>
                )}
              </FieldArray>
            )}
            {/* DONT REMOVE */}
            {/* )} */}
            <Heading className='mt-5' size='small' level='2' spacing id='behandling'>
              {EEtterlevelseDokumentFormConstants.VELG_BEHANDLINGER_OG_SYSTEMER}
            </Heading>
            <FieldWrapper>
              <FieldArray name='behandlinger'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='my-3'>
                    <LabelWithDescription
                      label={EEtterlevelseDokumentFormConstants.VELG_BEHANDLINGER_OG_SYSTEMER_LABEL}
                      description={EEtterlevelseDokumentFormConstants.SOK}
                    />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label={EEtterlevelseDokumentFormConstants.SOK_BEHANDLINGER}
                        placeholder=''
                        tabSelectsValue={false}
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                        controlShouldRenderValue={false}
                        loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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

            <ReadMore
              header={EEtterlevelseDokumentFormConstants.DATABEHANDLER}
              defaultOpen={values.dpBehandlinger && values.dpBehandlinger.length !== 0}
            >
              <FieldArray name='dpBehandlinger'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='my-3'>
                    <LabelWithDescription
                      label={EEtterlevelseDokumentFormConstants.DATABEHANDLER_LABEL}
                      description={EEtterlevelseDokumentFormConstants.SOK}
                    />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label={EEtterlevelseDokumentFormConstants.SOK_BEHANDLINGER}
                        placeholder=''
                        tabSelectsValue={false}
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                        controlShouldRenderValue={false}
                        loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
                        isClearable={false}
                        loadOptions={searchDpBehandlingOptions}
                        onChange={(value: any) => {
                          if (value) {
                            fieldArrayRenderProps.push(value)
                          }
                        }}
                        styles={selectOverrides}
                      />
                    </div>
                    <RenderTagList
                      list={fieldArrayRenderProps.form.values.dpBehandlinger.map(
                        (dpBehandling: IDpBehandling) => dpBehandlingName(dpBehandling)
                      )}
                      onRemove={fieldArrayRenderProps.remove}
                    />
                  </div>
                )}
              </FieldArray>
            </ReadMore>

            {env.isDev && (
              <div id='ardoqSystemData' className='flex flex-col lg:flex-row gap-5 my-5'>
                <FieldArray name='ardoqSystemData'>
                  {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                    <div className='flex-1'>
                      <LabelWithDescription label={EEtterlevelseDokumentFormConstants.SYSTEMER} />
                      <div className='w-full'>
                        <AsyncSelect
                          aria-label={EEtterlevelseDokumentFormConstants.SOK_SYSTEMER}
                          placeholder=''
                          tabSelectsValue={false}
                          components={{ DropdownIndicator }}
                          noOptionsMessage={({ inputValue }) => {
                            return noOptionMessage(inputValue)
                          }}
                          controlShouldRenderValue={false}
                          loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
                          isClearable={false}
                          loadOptions={useArdoqSearch}
                          onChange={(value: any) => {
                            if (
                              value &&
                              fieldArrayRenderProps.form.values.ardoqSystemData.filter(
                                (ardoqSystem: IArdoqSystem) => ardoqSystem.ardoqID === value.ardoqID
                              ).length === 0
                            ) {
                              fieldArrayRenderProps.push(value)
                            }
                          }}
                          styles={selectOverrides}
                        />
                        <RenderTagList
                          list={fieldArrayRenderProps.form.values.ardoqSystemData.map(
                            (ardoqSystem: IArdoqSystem) => ardoqSystem.navn
                          )}
                          onRemove={fieldArrayRenderProps.remove}
                        />
                      </div>
                    </div>
                  )}
                </FieldArray>
                <div className='flex-1' />
              </div>
            )}

            <ROSEdit />
            <Heading level='2' size='small' spacing>
              {EEtterlevelseDokumentFormConstants.REDIGERINGSTILGANG}
            </Heading>
            <InfoCard data-color='info' className='my-5 max-w-[70ch]' size='small'>
              <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                <InfoCard.Title>
                  {EEtterlevelseDokumentFormConstants.REDIGERINGSTILGANG_TITTEL}{' '}
                  <ExternalLink href='https://teamkatalogen.nav.no/'>
                    sjekk Teamkatalogen
                  </ExternalLink>
                </InfoCard.Title>
              </InfoCard.Header>
            </InfoCard>

            <div id='teamsData' className='flex flex-col lg:flex-row gap-5 mb-5'>
              <FieldArray name='teamsData'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='flex-1'>
                    <LabelWithTooltip
                      label={EEtterlevelseDokumentFormConstants.SOK_TEAMKATALOG}
                      tooltip=''
                    />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label={EEtterlevelseDokumentFormConstants.SOK_TEAM}
                        placeholder=''
                        tabSelectsValue={false}
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                        controlShouldRenderValue={false}
                        loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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
                        tabSelectsValue={false}
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => {
                          return noOptionMessage(inputValue)
                        }}
                        controlShouldRenderValue={false}
                        loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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
                          (resource: ITeamResource) => `${resource.fullName} (${resource.navIdent})`
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
                            (resource: ITeamResource) =>
                              `${resource.fullName} (${resource.navIdent})`
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

            <Heading level='2' size='small' className='mt-7'>
              Ansvar for etterlevelsen
            </Heading>

            <EtterlevelseDokumentNomOrganiseringForm
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              formValues={values}
            />

            <div id='risikoeiereData' className='flex flex-col lg:flex-row gap-5 mt-5'>
              <FieldArray name='risikoeiereData'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => {
                  const isRisikoeiereFieldLocked =
                    pvkDokument?.status === EPvkDokumentStatus.TRENGER_GODKJENNING ||
                    values.status ===
                      EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
                  return (
                    <div className='flex-1'>
                      <Heading level='3' size='xsmall' className='mt-7'>
                        Angi risikoeier
                      </Heading>
                      {isRisikoeiereFieldLocked && (
                        <InfoCard data-color='info' size='small' className='mt-2 max-w-[75ch] mb-3'>
                          <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                            <InfoCard.Title as='div'>
                              Det er ikke mulig å endre risikoeier når etterlevelsesdokument eller
                              PVK er sendt til godkjenning hos risikoeier.
                            </InfoCard.Title>
                          </InfoCard.Header>
                        </InfoCard>
                      )}
                      {!isRisikoeiereFieldLocked && (
                        <div className='w-full'>
                          <AsyncSelect
                            aria-label='Søk etter risikoeier'
                            placeholder=''
                            tabSelectsValue={false}
                            components={{ DropdownIndicator }}
                            noOptionsMessage={({ inputValue }) => {
                              return noOptionMessage(inputValue)
                            }}
                            controlShouldRenderValue={false}
                            loadingMessage={() => EEtterlevelseDokumentFormConstants.SOKER}
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
                              (resource: ITeamResource) =>
                                `${resource.fullName} (${resource.navIdent})`
                            )}
                            onRemove={fieldArrayRenderProps.remove}
                          />
                        </div>
                      )}

                      {isRisikoeiereFieldLocked && (
                        <div>
                          <DataTextWrapper>
                            {fieldArrayRenderProps.form.values.risikoeiereData.length === 0 &&
                              EEtterlevelseDokumentFormConstants.INGEN_RISIKOEIER}

                            {fieldArrayRenderProps.form.values.risikoeiereData.length !== 0 && (
                              <List as='ul'>
                                {fieldArrayRenderProps.form.values.risikoeiereData.map(
                                  (resource: ITeamResource) => (
                                    <List.Item key={resource.fullName}>
                                      {resource.fullName}
                                    </List.Item>
                                  )
                                )}
                              </List>
                            )}
                          </DataTextWrapper>
                        </div>
                      )}

                      {env.isDev && !isRisikoeiereFieldLocked && (
                        <ReadMore
                          header={EEtterlevelseDokumentFormConstants.INGEN_RISIKOEIER_READMORE}
                        >
                          <div className='flex gap-2 items-end my-2'>
                            <TextField
                              label={EEtterlevelseDokumentFormConstants.INGEN_RISIKOEIER_LABEL}
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
                              (resource: ITeamResource) =>
                                `${resource.fullName} (${resource.navIdent})`
                            )}
                            onRemove={fieldArrayRenderProps.remove}
                          />
                        </ReadMore>
                      )}
                    </div>
                  )
                }}
              </FieldArray>

              <div className='flex-1' />
            </div>

            {user.isAdmin() && (
              <InfoCard data-color='meta-purple' className='my-7'>
                <InfoCard.Header>
                  <InfoCard.Title>ADMIN STUFFSSSS</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                  <div className='mt-5'>
                    <TextAreaField rows={1} noPlaceholder label='P360 recnummer' name='p360Recno' />

                    <div className='mt-5'></div>
                    <TextAreaField
                      rows={1}
                      noPlaceholder
                      label='P360 saknummer'
                      name='p360CaseNumber'
                    />
                  </div>

                  <div className='mt-5'>
                    <Select
                      label='Oppdater status'
                      value={values.status}
                      onChange={(event) => {
                        if (event.target.value) {
                          setFieldValue('status', event.target.value)
                        }
                      }}
                    >
                      <option value={EEtterlevelseDokumentasjonStatus.UNDER_ARBEID}>
                        under arbeid
                      </option>
                      <option
                        value={
                          EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
                        }
                      >
                        {EEtterlevelseDokumentFormConstants.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER}
                      </option>
                      <option value={EEtterlevelseDokumentasjonStatus.GODKJENT_AV_RISIKOEIER}>
                        {EEtterlevelseDokumentFormConstants.GODKJENT_AV_RISIKOEIER}
                      </option>
                    </Select>
                  </div>

                  {!dokumentRelasjon && (
                    <div className='mt-5'>
                      <CheckboxGroup
                        legend='Skal dette dokumentet kunne gjenbrukes av andre?'
                        onChange={(value: boolean[]) =>
                          setFieldValue('forGjenbruk', value.length !== 0)
                        }
                        value={[values.forGjenbruk]}
                        description='Velger du gjenbruk, får du mulighet til å legge inn vurderinger og veiledning. Du får velge selv når du vil tillate gjenbruk.'
                      >
                        <Checkbox value={true}>Ja, dette dokumentet skal gjenbrukes</Checkbox>
                      </CheckboxGroup>
                    </div>
                  )}
                </InfoCard.Content>
              </InfoCard>
            )}

            {!_.isEmpty(errors) && (
              <ErrorSummary
                ref={errorSummaryRef}
                heading={EEtterlevelseDokumentFormConstants.ERROR_SUMMARY_HEADING}
              >
                {Object.entries({
                  ...errors,
                  nomOrganisering: undefined,
                  nomAvdelingId: getIn(errors, 'nomOrganisering.nomAvdelingId'),
                  seksjon: getIn(errors, 'nomOrganisering.seksjoner'),
                  linje: getIn(errors, 'nomOrganisering.linjer'),
                  forEtterlevelseILinje: getIn(errors, 'nomOrganisering.forEtterlevelseILinje'),
                  linjeEnhet: getIn(errors, 'nomOrganisering.linjeEnheter'),
                  fylke: getIn(errors, 'nomOrganisering.linjeFylker'),
                })
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
          <UnsavedChangesGuard
            isDirty={dirty}
            formRef={formRef}
            navigateUrl={
              isForRedigering
                ? etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id)
                : etterlevelseDokumentasjonerUrl()
            }
          />
        </>
      )}
    </Formik>
  )
}

export default EtterlevelseDokumentasjonForm
