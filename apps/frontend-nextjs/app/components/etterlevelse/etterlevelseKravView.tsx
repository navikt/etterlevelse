import {
  createEtterlevelseMetadata,
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
  updateEtterlevelseMetadata,
} from '@/api/etterlevelseMetadata/etterlevelseMetadataApi'
import { getKravByKravNummer } from '@/api/krav/kravApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { Markdown } from '@/components/common/markdown/markdown'
import ExpiredAlert from '@/components/krav/kravPage/expiredAlert/expiredAlertComponent'
import { IEtterlevelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { IEtterlevelseMetadata } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseMetadataConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EKravStatus, IKrav, IKravVersjon, TKravId, TKravQL } from '@/constants/krav/kravConstants'
import { UserContext } from '@/provider/user/userProvider'
import { getKravWithEtterlevelseQuery } from '@/query/krav/kravQuery'
import { useQuery } from '@apollo/client/react'
import {
  Alert,
  BodyShort,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  ReadMore,
  Tabs,
  Tag,
  ToggleGroup,
} from '@navikt/ds-react'
import { FormikProps } from 'formik'
import moment from 'moment'
import { useParams } from 'next/navigation'
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import ChangesSavedEttelevelseModal from './etterlevelseKravView/modal/changesSavedEttelevelseModal'
import UnsavedEtterlevelseModal from './etterlevelseKravView/modal/unsavedEtterlevelseModal'

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
  nextKravToDocument: string
}

export const EtterlevelseKravView: FunctionComponent<TProps> = ({
  temaName,
  kravId,
  etterlevelse,
  //setEtterlevelse,
  varsleMelding,
  etterlevelseDokumentasjon,
  // navigatePath,
  // tidligereEtterlevelser,
  nextKravToDocument,
}) => {
  const { data } = useQuery<{ kravById: TKravQL }, TKravId>(getKravWithEtterlevelseQuery, {
    variables: kravId,
    skip: !kravId.kravId && !kravId.kravNummer,
    fetchPolicy: 'no-cache',
  })
  const params: Readonly<
    Partial<{
      tema?: string
    }>
  > = useParams<{ tema?: string }>()
  // const etterlevelserLoading: boolean = loading
  const [krav, setKrav] = useState<TKravQL>()
  const [nyereKrav, setNyereKrav] = useState<IKrav>()
  const [, setDisableEdit] = useState<boolean>(false)
  //const [, setEditedEtterlevelse] = React.useState<IEtterlevelse>()
  const etterlevelseFormRef: React.Ref<FormikProps<IEtterlevelse> | undefined> = useRef(undefined)
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])
  const [statusText] = useState<string>('')
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState<boolean>(false)
  const [hasNextKrav] = useState<boolean>(true)
  const [currentTab, setCurrentTab] = useState<string>('dokumentasjon')
  const [isTabAlertActive, setIsTabAlertActive] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState<string>('dokumentasjon')
  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)
  const [isPrioritised, setIsPrioritised] = useState<boolean>(false)
  const [isPreview, setIsPreview] = useState<boolean>(false)
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isPvkTabActive] = useState<boolean>(false)
  //const [, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const [isPvoUnderarbeidWarningActive, setIsPvoUnderarbeidWarningActive] = useState<boolean>(false)

  //const router = useRouter()
  const user = useContext(UserContext)

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

  useEffect(() => {
    if (
      pvkDokument &&
      [EPvkDokumentStatus.PVO_UNDERARBEID, EPvkDokumentStatus.SENDT_TIL_PVO].includes(
        pvkDokument.status
      ) &&
      krav &&
      krav.tagger.includes('Personvernkonsekvensvurdering')
    ) {
      setIsPreview(true)
      setIsPvoUnderarbeidWarningActive(true)
    }
  }, [krav, pvkDokument])

  /*  const activeAlertModalController = () => {
    if (isTabAlertActive) {
      setIsSavingChanges(false)
      setIsTabAlertActive(false)
    } else {
      setIsNavigationModalOpen(true)
    }
  }*/

  const handleChange = (value: string[]) => setIsPrioritised(value.includes('check'))

  /*  const submit = async (etterlevelse: IEtterlevelse) => {
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

    await getPvkDokumentByEtterlevelseDokumentId(etterlevelse.etterlevelseDokumentasjonId).then(
      async (response) => {
        if (
          response &&
          [EPvkDokumentStatus.PVO_UNDERARBEID, EPvkDokumentStatus.SENDT_TIL_PVO].includes(
            response.status
          ) &&
          krav?.tagger.includes('Personvernkonsekvensvurdering')
        ) {
          setIsPvoAlertModalOpen(true)
        } else {
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
        }
      }
    )
  }*/

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
                </div>

                {krav.versjonEndringer && (
                  <ReadMore header='Se hva som er nytt'>
                    <Markdown source={krav.versjonEndringer} />
                  </ReadMore>
                )}
              </div>

              {krav.status === EKravStatus.UTGAATT && (
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
                    !isPvkTabActive &&
                    !isPvoUnderarbeidWarningActive && (
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

                  {isPvoUnderarbeidWarningActive && (
                    <Alert className='mt-6' variant='info'>
                      Kan ikke redigeres når personvernombudet har påbegynt vurderingen
                    </Alert>
                  )}

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

                      {/*                        <EtterlevelseEditFields
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
                        />*/}
                    </div>
                  )}
                  {/*                  {!etterlevelseDokumentasjon?.hasCurrentUserAccess && !user.isAdmin() && (

                   <EtterlevelseViewFields
                      etterlevelse={etterlevelse}
                      suksesskriterier={krav.suksesskriterier}
                      tidligereEtterlevelser={tidligereEtterlevelser}
                    />
                  )}*/}
                </Tabs.Panel>
                <Tabs.Panel value='etterlevelser'>
                  <div className='mt-2'>
                    test
                    {/*<Etterlevelser loading={etterlevelserLoading} krav={krav} modalVersion />*/}
                  </div>
                </Tabs.Panel>
                <Tabs.Panel value='tilbakemeldinger'>
                  <div className='mt-2'>
                    test
                    {/*<Tilbakemeldinger krav={krav} hasKravExpired={false} />*/}
                  </div>
                </Tabs.Panel>
              </Tabs>
            </div>

            {/*<EtterlevelseSidePanel*/}
            {/*  krav={krav}*/}
            {/*  pvkDokument={pvkDokument}*/}
            {/*  etterlevelseMetadata={etterlevelseMetadata}*/}
            {/*  setEtterlevelseMetadata={setEtterlevelseMetadata}*/}
            {/*  alleKravVersjoner={alleKravVersjoner}*/}
            {/*  setIsPreview={setIsPreview}*/}
            {/*  setIsPvkTabActive={setIsPvkTabActive}*/}
            {/*  etterlevelseDokumentasjon={etterlevelseDokumentasjon}*/}
            {/*/>*/}
          </div>

          {/*{pvkDokument && isPvoAlertModalOpen && (
            <AlertPvoUnderarbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          )}*/}

          {isTabAlertActive && (
            <UnsavedEtterlevelseModal
              isTabAlertActive={isTabAlertActive}
              setIsTabAlertActive={setIsTabAlertActive}
              isSavingChanges={isSavingChanges}
              setIsSavingChanges={setIsSavingChanges}
              selectedTab={selectedTab}
              setCurrentTab={setCurrentTab}
              etterlevelseFormRef={etterlevelseFormRef}
            />
          )}

          {isNavigationModalOpen && !isTabAlertActive && (
            <ChangesSavedEttelevelseModal
              isNavigationModalOpen={isNavigationModalOpen}
              isTabAlertActive={isTabAlertActive}
              setIsNavigationModalOpen={setIsNavigationModalOpen}
              statusText={statusText}
              hasNextKrav={hasNextKrav}
              nextKravToDocument={nextKravToDocument}
              etterlevelseDokumentasjonId={etterlevelseDokumentasjon?.id}
              temaCode={params.tema}
            />
          )}
        </div>
      )}
    </div>
  )
}
