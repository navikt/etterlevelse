import { useQuery } from '@apollo/client'
import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Link,
  Loader,
  Modal,
  ReadMore,
  Tabs,
  Tag,
  ToggleGroup,
} from '@navikt/ds-react'
import { FormikProps } from 'formik'
import moment from 'moment'
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Location, NavigateFunction, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  createEtterlevelse,
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  updateEtterlevelse,
} from '../../api/EtterlevelseApi'
import {
  createEtterlevelseMetadata,
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
  updateEtterlevelseMetadata,
} from '../../api/EtterlevelseMetadataApi'
import { TKravId, getKravByKravNummer } from '../../api/KravApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '../../api/PvkDokumentApi'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  IEtterlevelse,
  IEtterlevelseMetadata,
  IKrav,
  IKravVersjon,
  IPvkDokument,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../constants'
import { getKravWithEtterlevelseQuery } from '../../query/KravQuery'
import { user } from '../../services/User'
import AlertPvoUnderarbeidModal from '../PvkDokument/common/AlertPvoUnderarbeidModal'
import { Markdown } from '../common/Markdown'
import {
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonTemaUrl,
} from '../common/RouteLinkEtterlevelsesdokumentasjon'
import { kravPathUrl, kravUrl } from '../common/RouteLinkKrav'
import { getEtterlevelseStatus } from '../etterlevelseDokumentasjon/common/utils'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../etterlevelseDokumentasjonTema/common/utils'
import Etterlevelser from '../krav/Etterlevelser'
import ExpiredAlert from '../krav/ExpiredAlert'
import { Tilbakemeldinger } from '../krav/tilbakemelding/Tilbakemelding'
import EtterlevelseEditFields from './Edit/EtterlevelseEditFields'
import EtterlevelseViewFields from './EtterlevelseViewFields'
import EtterlevelseSidePanel from './tabs/EtterlevelseSidePanel'

type TProps = {
  temaName?: string
  etterlevelse: IEtterlevelse
  setEtterlevelse: Dispatch<SetStateAction<IEtterlevelse | undefined>>
  kravId: TKravId
  formRef?: React.Ref<any>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  varsleMelding?: string
  navigatePath: string
  tidligereEtterlevelser: IEtterlevelse[] | undefined
  kravFilter: EKravFilterType
  nextKravToDocument: string
}

export const EtterlevelseKravView: FunctionComponent<TProps> = ({
  temaName,
  kravId,
  etterlevelse,
  setEtterlevelse,
  varsleMelding,
  etterlevelseDokumentasjon,
  navigatePath,
  tidligereEtterlevelser,
  kravFilter,
  nextKravToDocument,
}) => {
  const { data, loading } = useQuery<{ kravById: TKravQL }, TKravId>(getKravWithEtterlevelseQuery, {
    variables: kravId,
    skip: !kravId.id && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const params: Readonly<
    Partial<{
      tema?: string
    }>
  > = useParams<{ tema?: string }>()
  const etterlevelserLoading: boolean = loading
  const [krav, setKrav] = useState<TKravQL>()
  const [nyereKrav, setNyereKrav] = React.useState<IKrav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [editedEtterlevelse, setEditedEtterlevelse] = React.useState<IEtterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<IEtterlevelse> | undefined> = useRef(undefined)
  const [alleKravVersjoner, setAlleKravVersjoner] = React.useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [statusText, setStatustext] = useState<string>('')
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState<boolean>(false)
  const [hasNextKrav, setHasNextKrav] = useState<boolean>(true)
  const [currentTab, setCurrentTab] = useState<string>('dokumentasjon')
  const [isTabAlertActive, setIsTabAlertActive] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState<string>('dokumentasjon')
  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)
  const [isPrioritised, setIsPrioritised] = useState<boolean>(false)
  const [isPreview, setIsPreview] = useState<boolean>(false)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isPvkTabActive, setIsPvkTabActive] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  //venter til krav K114 er satt til utgått
  // const [isPvoUnderarbeidWarningActive, setIsPvoUnderarbeidWarningActive] = useState<boolean>(false)

  const location: Location<any> = useLocation()
  const navigate: NavigateFunction = useNavigate()

  const [etterlevelseMetadata, setEtterlevelseMetadata] = useState<IEtterlevelseMetadata>(
    mapEtterlevelseMetadataToFormValue({
      id: 'ny',
      etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id,
      kravNummer: kravId.kravNummer,
      kravVersjon: kravId.kravVersjon,
    })
  )

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon?.id && kravId.kravNummer) {
        getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion(
          etterlevelseDokumentasjon?.id,
          kravId.kravNummer,
          kravId.kravVersjon
        ).then((resp) => {
          if (resp.content.length) {
            setEtterlevelseMetadata(resp.content[0])
          } else {
            setEtterlevelseMetadata(
              mapEtterlevelseMetadataToFormValue({
                id: 'ny',
                etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id,
                kravNummer: kravId.kravNummer,
                kravVersjon: kravId.kravVersjon,
              })
            )
          }
        })

        getPvkDokumentByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IPvkDokument) => {
            if (response) {
              setPvkDokument(response)
            }
          })
          .catch(() => undefined)
      }
    })()

    if (
      etterlevelseDokumentasjon &&
      etterlevelseDokumentasjon.prioritertKravNummer &&
      etterlevelseDokumentasjon.prioritertKravNummer.length > 0
    ) {
      const priorityCheck = etterlevelseDokumentasjon.prioritertKravNummer.includes(
        etterlevelse.kravNummer.toString()
      )

      setIsPrioritised(priorityCheck)
    }
  }, [])

  //venter til krav K114 er satt til utgått
  // useEffect(() => {
  //   if (
  //     pvkDokument &&
  //     [EPvkDokumentStatus.PVO_UNDERARBEID, EPvkDokumentStatus.SENDT_TIL_PVO].includes(
  //       pvkDokument.status
  //     ) &&
  //     krav &&
  //     krav.tagger.includes('Personvernkonsekvensvurdering')
  //   ) {
  //     setIsPreview(true)
  //     setIsPvoUnderarbeidWarningActive(true)
  //   }
  // }, [krav, pvkDokument])

  const getNextKravUrl = (nextKravPath: string): string => {
    const currentPath: string[] = location.pathname.split(kravUrl)
    return kravPathUrl(currentPath[0], nextKravPath)
  }

  const activeAlertModalController = () => {
    if (isTabAlertActive) {
      setIsSavingChanges(false)
      setIsTabAlertActive(false)
    } else {
      setIsNavigationModalOpen(true)
    }
  }

  const handleChange = (value: string[]) => setIsPrioritised(value.includes('check'))

  const submit = async (etterlevelse: IEtterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse:
        etterlevelse.status !== EEtterlevelseStatus.OPPFYLLES_SENERE
          ? ''
          : etterlevelse.fristForFerdigstillelse,
      suksesskriterieBegrunnelser: syncEtterlevelseKriterieBegrunnelseWithKrav(etterlevelse, krav),
      prioritised: isPrioritised,
    } as IEtterlevelse
    setEditedEtterlevelse(mutatedEtterlevelse)

    //double check if etterlevelse already exist before submitting
    let existingEtterlevelseId = ''
    if (etterlevelseDokumentasjon && krav) {
      const etterlevelseList = (
        await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
          etterlevelseDokumentasjon.id,
          krav.kravNummer
        )
      ).content.filter((e) => e.kravVersjon === krav.kravVersjon)
      if (etterlevelseList.length) {
        existingEtterlevelseId = etterlevelseList[0].id
        mutatedEtterlevelse.id = etterlevelseList[0].id
      }
    }

    //slett if else setning når K114 er satt til utgått
    if (etterlevelse.id || existingEtterlevelseId) {
      await updateEtterlevelse(mutatedEtterlevelse).then((res) => {
        if (nextKravToDocument !== '') {
          setStatustext(res.status)
          setHasNextKrav(true)
          activeAlertModalController()
        } else {
          setStatustext(res.status)
          setHasNextKrav(false)
          activeAlertModalController()
          setEtterlevelse(res)
        }
      })
    } else {
      await createEtterlevelse(mutatedEtterlevelse).then((res) => {
        if (nextKravToDocument !== '') {
          setStatustext(res.status)
          setHasNextKrav(true)
          activeAlertModalController()
        } else {
          setStatustext(res.status)
          setHasNextKrav(false)
          activeAlertModalController()
          setEtterlevelse(res)
        }
      })
    }

    //venter til krav K114 er satt til utgått
    // await getPvkDokumentByEtterlevelseDokumentId(etterlevelse.etterlevelseDokumentasjonId).then(
    //   async (response) => {
    //     if (
    //       response &&
    //       [EPvkDokumentStatus.PVO_UNDERARBEID, EPvkDokumentStatus.SENDT_TIL_PVO].includes(
    //         response.status
    //       ) &&
    //       krav?.tagger.includes('Personvernkonsekvensvurdering')
    //     ) {
    //       setIsPvoAlertModalOpen(true)
    //     } else {
    //       if (etterlevelse.id || existingEtterlevelseId) {
    //         await updateEtterlevelse(mutatedEtterlevelse).then((res) => {
    //           if (nextKravToDocument !== '') {
    //             setStatustext(res.status)
    //             setHasNextKrav(true)
    //             activeAlertModalController()
    //           } else {
    //             setStatustext(res.status)
    //             setHasNextKrav(false)
    //             activeAlertModalController()
    //             setEtterlevelse(res)
    //           }
    //         })
    //       } else {
    //         await createEtterlevelse(mutatedEtterlevelse).then((res) => {
    //           if (nextKravToDocument !== '') {
    //             setStatustext(res.status)
    //             setHasNextKrav(true)
    //             activeAlertModalController()
    //           } else {
    //             setStatustext(res.status)
    //             setHasNextKrav(false)
    //             activeAlertModalController()
    //             setEtterlevelse(res)
    //           }
    //         })
    //       }
    //     }
    //   }
    // )
  }

  useEffect(() => {
    if (data?.kravById) {
      setKrav(data.kravById)

      getKravByKravNummer(data.kravById.kravNummer).then((resp) => {
        if (resp.content.length) {
          const alleVersjoner = resp.content
            .map((krav) => {
              return {
                kravVersjon: krav.kravVersjon,
                kravNummer: krav.kravNummer,
                kravStatus: krav.status,
              }
            })
            .sort((a, b) => (a.kravVersjon > b.kravVersjon ? -1 : 1))

          const filteredVersjoner = alleVersjoner.filter(
            (krav) => krav.kravStatus !== EKravStatus.UTKAST
          )

          if (filteredVersjoner.length) {
            setAlleKravVersjoner(filteredVersjoner)
          }

          const krav = resp.content.filter((k) => k.kravVersjon === data.kravById.kravVersjon + 1)

          if (krav.length && krav[0].status === EKravStatus.AKTIV) setNyereKrav(krav[0])
        }
      })
    }
  }, [data])

  useEffect(() => {
    if (nyereKrav && !user.isAdmin()) {
      setDisableEdit(true)
    }
  }, [nyereKrav])

  return (
    <div>
      {krav && (
        <div className='flex flex-col gap-8'>
          <div>
            <BodyShort size='small' id='kravTitle'>
              {temaName} / K{krav.kravNummer}.{krav.kravVersjon}
            </BodyShort>
            <div>
              <Heading size='medium' level='1'>
                {krav.navn}
              </Heading>

              {varsleMelding && (
                <div>
                  <Alert size='small' variant='info' className='w-fit'>
                    {varsleMelding}
                  </Alert>
                </div>
              )}

              {kravFilter === EKravFilterType.BORTFILTTERTE_KRAV && (
                <BodyShort>
                  <strong>Kravet er bortfiltrert og derfor ikke relevant.</strong>
                </BodyShort>
              )}
            </div>
          </div>
          <div className='w-full flex'>
            <div className='pr-4 flex flex-1 flex-col gap-4 col-span-8'>
              <div>
                <div className='flex justify-between lg:flex-row flex-col'>
                  <div>
                    {krav.aktivertDato !== null && krav.kravVersjon > 1 && (
                      <Tag variant='warning'>
                        Ny versjon {moment(krav.aktivertDato).format('LL')}
                      </Tag>
                    )}
                    {krav.aktivertDato !== null && krav.kravVersjon === 1 && (
                      <BodyShort>Opprettet {moment(krav.aktivertDato).format('LL')}</BodyShort>
                    )}
                  </div>
                  {kravFilter === EKravFilterType.RELEVANTE_KRAV && (
                    <div className='flex items-center gap-2'>
                      <BodyShort size='small'>
                        {etterlevelseMetadata &&
                        etterlevelseMetadata.tildeltMed &&
                        etterlevelseMetadata.tildeltMed.length >= 1
                          ? 'Tildelt ' + etterlevelseMetadata.tildeltMed[0]
                          : 'Ikke tildelt'}
                      </BodyShort>
                      <Button
                        variant='tertiary'
                        size='small'
                        onClick={() => {
                          const ident = user.getName()
                          if (
                            etterlevelseMetadata.tildeltMed &&
                            user.getName() === etterlevelseMetadata.tildeltMed[0] &&
                            etterlevelseMetadata.id !== 'ny'
                          ) {
                            updateEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              tildeltMed: [],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          } else if (etterlevelseMetadata.id !== 'ny') {
                            updateEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              tildeltMed: [ident],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          } else {
                            createEtterlevelseMetadata({
                              ...etterlevelseMetadata,
                              id: '',
                              tildeltMed: [ident],
                            }).then((resp) => {
                              setEtterlevelseMetadata(resp)
                            })
                          }
                        }}
                      >
                        {etterlevelseMetadata.tildeltMed &&
                        user.getName() === etterlevelseMetadata.tildeltMed[0]
                          ? 'Fjern meg selv'
                          : 'Tildel meg selv'}
                      </Button>
                    </div>
                  )}
                </div>

                {krav.versjonEndringer && (
                  <ReadMore header='Se hva som er nytt'>
                    <Markdown source={krav.versjonEndringer} />
                  </ReadMore>
                )}
              </div>

              {kravFilter === EKravFilterType.UTGAATE_KRAV && (
                <ExpiredAlert
                  alleKravVersjoner={alleKravVersjoner}
                  statusName={krav.status}
                  description={
                    krav.status === EKravStatus.UTGAATT &&
                    krav.beskrivelse && (
                      <div className='py-3 mb-5'>
                        <Heading size='small' level='2'>
                          Begrunnelse for at kravet er utgått
                        </Heading>
                        <Markdown source={krav.beskrivelse} />
                      </div>
                    )
                  }
                />
              )}

              <div className='rounded-sm bg-purple-50 p-8'>
                <Heading level='2' size='small'>
                  Hensikten med kravet
                </Heading>
                <Markdown source={krav.hensikt} />
              </div>
              <Tabs
                value={currentTab}
                onChange={(tabValue) => {
                  setSelectedTab(tabValue)
                  if (etterlevelseFormRef.current?.dirty) {
                    setIsTabAlertActive(true)
                  } else {
                    setCurrentTab(tabValue)
                  }
                }}
              >
                <Tabs.List>
                  <Tabs.Tab
                    value='dokumentasjon'
                    label={
                      <Heading level='2' size='small'>
                        Dokumentasjon
                      </Heading>
                    }
                  />
                  <Tabs.Tab
                    value='etterlevelser'
                    label={
                      <Heading level='2' size='small'>
                        Hvordan har andre gjort det?
                      </Heading>
                    }
                  />
                  <Tabs.Tab
                    value='tilbakemeldinger'
                    label={
                      <Heading level='2' size='small'>
                        Spørsmål og svar
                      </Heading>
                    }
                  />
                </Tabs.List>
                <Tabs.Panel value='dokumentasjon'>
                  {(etterlevelseDokumentasjon?.hasCurrentUserAccess || user.isAdmin()) &&
                    !isPvkTabActive && (
                      //venter til krav K114 er satt til utgått
                      // !isPvoUnderarbeidWarningActive && (
                      <ToggleGroup
                        className='mt-6'
                        defaultValue='OFF'
                        value={isPreview ? 'ON' : 'OFF'}
                        onChange={(value) => setIsPreview(value === 'ON' ? true : false)}
                      >
                        <ToggleGroup.Item value='OFF' label='Redigeringsvisning' />
                        <ToggleGroup.Item value='ON' label='Forhåndsvisning' />
                      </ToggleGroup>
                    )}

                  {/* 
                  //venter til krav K114 er satt til utgått
                  {isPvoUnderarbeidWarningActive && (
                    <Alert className='mt-6' variant='info'>
                      Kan ikke redigeres når personvernombudet har påbegynt vurderingen
                    </Alert>
                  )} */}

                  {isPvkTabActive && (
                    <Alert className='mt-6' variant='info'>
                      Kan ikke redigeres når PVK skjema er aktiv på sidepanelet
                    </Alert>
                  )}
                  {(etterlevelseDokumentasjon?.hasCurrentUserAccess || user.isAdmin()) && (
                    <div className='mt-2'>
                      {!isPreview && (
                        <CheckboxGroup
                          legend='Legg til i Prioritert kravliste'
                          hideLegend
                          onChange={handleChange}
                          value={isPrioritised ? ['check'] : []}
                        >
                          {
                            <Checkbox
                              value='check'
                              description={
                                (((etterlevelseDokumentasjon?.hasCurrentUserAccess &&
                                  etterlevelseDokumentasjon?.forGjenbruk) ||
                                  (etterlevelseDokumentasjon?.forGjenbruk && user.isAdmin())) &&
                                  'De som gjenbruker etterlevelsesdokumentet ditt vil få fremhevet kravet når de foretar sin egen vurdering') ||
                                ''
                              }
                            >
                              Legg til dette kravet i Prioritert kravliste
                            </Checkbox>
                          }
                        </CheckboxGroup>
                      )}
                      {kravFilter !== EKravFilterType.BORTFILTTERTE_KRAV && (
                        <EtterlevelseEditFields
                          isPreview={isPreview}
                          kravFilter={kravFilter}
                          krav={krav}
                          etterlevelse={etterlevelse}
                          submit={submit}
                          formRef={etterlevelseFormRef}
                          varsleMelding={varsleMelding}
                          disableEdit={disableEdit}
                          close={() => {
                            setTimeout(
                              () =>
                                navigate(
                                  etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id)
                                ),
                              1
                            )
                          }}
                          navigatePath={navigatePath}
                          editedEtterlevelse={editedEtterlevelse}
                          tidligereEtterlevelser={tidligereEtterlevelser}
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                        />
                      )}
                      {kravFilter === EKravFilterType.BORTFILTTERTE_KRAV && (
                        <EtterlevelseViewFields
                          etterlevelse={etterlevelse}
                          suksesskriterier={krav.suksesskriterier}
                          tidligereEtterlevelser={tidligereEtterlevelser}
                          isBortfiltrert
                        />
                      )}
                    </div>
                  )}
                  {!etterlevelseDokumentasjon?.hasCurrentUserAccess && !user.isAdmin() && (
                    <EtterlevelseViewFields
                      etterlevelse={etterlevelse}
                      suksesskriterier={krav.suksesskriterier}
                      tidligereEtterlevelser={tidligereEtterlevelser}
                    />
                  )}
                </Tabs.Panel>
                <Tabs.Panel value='etterlevelser'>
                  <div className='mt-2'>
                    <Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value='tilbakemeldinger'>
                  <div className='mt-2'>
                    <Tilbakemeldinger krav={krav} hasKravExpired={false} />
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>

            <EtterlevelseSidePanel
              krav={krav}
              pvkDokument={pvkDokument}
              etterlevelseMetadata={etterlevelseMetadata}
              setEtterlevelseMetadata={setEtterlevelseMetadata}
              alleKravVersjoner={alleKravVersjoner}
              setIsPreview={setIsPreview}
              setIsPvkTabActive={setIsPvkTabActive}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            />
          </div>

          {pvkDokument && isPvoAlertModalOpen && (
            <AlertPvoUnderarbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          )}

          <Modal
            open={isTabAlertActive}
            onClose={() => setIsTabAlertActive(false)}
            header={{
              heading: 'Vil du lagre endringene dine før du går videre?',
              closeButton: false,
            }}
          >
            <Modal.Body>
              {isSavingChanges && (
                <div className='flex justify-center items-center w-full'>
                  <Loader size='2xlarge' title='lagrer endringer' />
                </div>
              )}
              <br />
            </Modal.Body>
            <Modal.Footer>
              <Button
                type='button'
                variant='primary'
                onClick={async () => {
                  setCurrentTab(selectedTab)
                  setIsSavingChanges(true)
                  etterlevelseFormRef.current?.submitForm()
                }}
              >
                Lagre og fortsett
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  setCurrentTab(selectedTab)
                  setIsTabAlertActive(false)
                }}
              >
                Fortsett uten å lagre
              </Button>
              <Button
                type='button'
                variant='tertiary'
                onClick={() => {
                  setIsTabAlertActive(false)
                }}
              >
                Avbryt
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            open={isNavigationModalOpen && !isTabAlertActive}
            onClose={() => setIsNavigationModalOpen(false)}
            header={{ heading: 'Endringene er lagret' }}
          >
            <Modal.Body>
              <BodyShort>
                Status er satt til: {getEtterlevelseStatus(statusText as EEtterlevelseStatus)}
              </BodyShort>
            </Modal.Body>
            <Modal.Footer>
              <div className='w-full flex flex-col gap-2'>
                <BodyShort>Hvor ønsker du å gå?</BodyShort>
                {hasNextKrav && (
                  <Link
                    href={getNextKravUrl(nextKravToDocument)}
                    onClick={() => {
                      // ampli.logEvent('knapp klikket', {
                      //   tekst: 'Til nest krav som ikke er ferdig utfylt i dette temaet',
                      //   pagePath: location.pathname,
                      //   ...userRoleEventProp,
                      // })
                    }}
                  >
                    <Button variant='secondary'>
                      Til neste krav som ikke er ferdig utfylt i dette temaet
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={() => {
                    setIsNavigationModalOpen(false)
                    window.location.reload()
                  }}
                  variant='secondary'
                >
                  Fortsett å redigere dokumentet
                </Button>

                <Link
                  href={etterlevelseDokumentasjonTemaUrl(
                    etterlevelseDokumentasjon?.id,
                    params?.tema
                  )}
                  className='flex w-full'
                  onClick={() => {
                    // ampli.logEvent('knapp klikket', {
                    //   tekst: 'Til temaoversikten',
                    //   pagePath: location.pathname,
                    //   ...userRoleEventProp,
                    // })
                  }}
                >
                  <Button className='flex w-full' variant='secondary'>
                    Til temaoversikten
                  </Button>
                </Link>
              </div>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </div>
  )
}
