import {
  getEtterlevelseMetadataByEtterlevelseDokumentasjonAndKravNummerAndKravVersion,
  mapEtterlevelseMetadataToFormValue,
} from '@/api/etterlevelseMetadata/etterlevelseMetadataApi'
import { getKravByKravNummer } from '@/api/krav/kravApi'
import { getPvkDokumentByEtterlevelseDokumentId } from '@/api/pvkDokument/pvkDokumentApi'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
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
import { Alert, BodyShort, Heading, ReadMore, Tag } from '@navikt/ds-react'
import { FormikProps } from 'formik'
import moment from 'moment'
import {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import TildeltTil from '../etterlevelseMetadata/tildeltTil/tildeltTil'
import EtterlevelseSidePanel from './sidepanel/etterlevelseSidePanel'
import EtterlevelsePageTabs from './tabs/etterlevelsePageTabs'

type TProps = {
  temaName?: string
  etterlevelse: IEtterlevelse
  setEtterlevelse: Dispatch<SetStateAction<IEtterlevelse | undefined>>
  kravId: TKravId
  formRef?: React.Ref<any>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  varsleMelding?: string
  tidligereEtterlevelser: IEtterlevelse[] | undefined
  nextKravToDocument: string
}

export const EtterlevelseKravView: FunctionComponent<TProps> = ({
  temaName,
  kravId,
  etterlevelse,
  setEtterlevelse,
  etterlevelseDokumentasjon,
  tidligereEtterlevelser,
  nextKravToDocument,
}) => {
  const { data, loading: kravLoading } = useQuery<{ kravById: TKravQL }, TKravId>(
    getKravWithEtterlevelseQuery,
    {
      variables: kravId,
      skip: !kravId.kravId && !kravId.kravNummer,
      fetchPolicy: 'no-cache',
    }
  )

  // const etterlevelserLoading: boolean = loading
  const [krav, setKrav] = useState<TKravQL>()
  const [nyereKrav, setNyereKrav] = useState<IKrav>()
  const [disableEdit, setDisableEdit] = useState<boolean>(false)
  const etterlevelseFormRef: React.Ref<FormikProps<IEtterlevelse> | undefined> = useRef(undefined)
  const [alleKravVersjoner, setAlleKravVersjoner] = useState<IKravVersjon[]>([
    { kravNummer: 0, kravVersjon: 0, kravStatus: 'Utkast' },
  ])

  const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false)
  const [isTabAlertActive, setIsTabAlertActive] = useState<boolean>(false)
  const [isPrioritised, setIsPrioritised] = useState<boolean>(false)
  const [isPreview, setIsPreview] = useState<boolean>(false)

  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isPvkTabActive, setIsPvkTabActive] = useState<boolean>(false)

  const [isPvoUnderarbeidWarningActive, setIsPvoUnderarbeidWarningActive] = useState<boolean>(false)
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
      {kravLoading && <CenteredLoader />}
      {!kravLoading && krav && (
        <div className='flex flex-col gap-8'>
          <div>
            <BodyShort size='small' id='kravTitle'>
              {temaName} / K{krav.kravNummer}.{krav.kravVersjon}
            </BodyShort>
            <div>
              <Heading size='medium' level='1'>
                {krav.navn}
              </Heading>

              {krav.varselMelding && (
                <div>
                  <Alert size='small' variant='info' className='w-fit'>
                    {krav.varselMelding}
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
                  <TildeltTil
                    etterlevelseMetadata={etterlevelseMetadata}
                    setEtterlevelseMetadata={setEtterlevelseMetadata}
                  />
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
              <EtterlevelsePageTabs
                krav={krav}
                etterlevelse={etterlevelse}
                setEtterlevelse={setEtterlevelse}
                alleKravVersjoner={alleKravVersjoner}
                tidligereEtterlevelser={tidligereEtterlevelser}
                disableEdit={disableEdit}
                nextKravToDocument={nextKravToDocument}
                isTabAlertActive={isTabAlertActive}
                setIsTabAlertActive={setIsTabAlertActive}
                isPvkTabActive={isPvkTabActive}
                isPvoUnderarbeidWarningActive={isPvoUnderarbeidWarningActive}
                isPreview={isPreview}
                setIsPreview={setIsPreview}
                isPrioritised={isPrioritised}
                setIsPrioritised={setIsPrioritised}
                isSavingChanges={isSavingChanges}
                setIsSavingChanges={setIsSavingChanges}
                etterlevelseFormRef={etterlevelseFormRef}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              />
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

          {/*{pvkDokument && isPvoAlertModalOpen && (
            <AlertPvoUnderarbeidModal
              isOpen={isPvoAlertModalOpen}
              onClose={() => setIsPvoAlertModalOpen(false)}
              pvkDokumentId={pvkDokument.id}
            />
          )}*/}
        </div>
      )}
    </div>
  )
}
